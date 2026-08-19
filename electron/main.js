const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function getPythonExePath() {
  if (isDev) {
    return path.join(__dirname, '..', 'python_backend', 'dist', 'epdf_python.exe');
  }
  if (process.platform === 'win32') {
    return path.join(process.resourcesPath, 'python', 'epdf_python.exe');
  }
  return path.join(process.resourcesPath, 'python', 'epdf_python');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    title: 'ePDF - PDF目录制作工具',
    backgroundColor: '#f8fafc',
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

ipcMain.handle('python-exec', async (event, { module, method, args }) => {
  return new Promise((resolve, reject) => {
    const pythonExe = getPythonExePath();
    const timeout = setTimeout(() => {
      reject(new Error('Python operation timeout'));
    }, 300000);

    const normalizedArgs = (args || []).map(arg => {
      if (typeof arg === 'string') {
        return arg.replace(/\\/g, '/');
      }
      return arg;
    });
    const argsStr = JSON.stringify(normalizedArgs);

    let child;
    try {
      child = spawn(pythonExe, [
        '--module', module,
        '--method', method,
        '--args', argsStr
      ], {
        stdio: ['pipe', 'pipe', 'pipe']
      });
    } catch (err) {
      clearTimeout(timeout);
      reject(new Error('Failed to start Python process: ' + err.message));
      return;
    }

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      clearTimeout(timeout);
      if (code !== 0) {
        reject(new Error(stderr || `Process exited with code ${code}`));
        return;
      }

      try {
        const result = JSON.parse(stdout.trim());
        if (result.error) {
          reject(new Error(result.error));
        } else {
          resolve(result.result);
        }
      } catch (e) {
        reject(new Error('Failed to parse Python output: ' + stdout));
      }
    });

    child.on('error', (err) => {
      clearTimeout(timeout);
      reject(new Error('Python process error: ' + err.message));
    });
  });
});

ipcMain.handle('select-files', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: options.filters || [{ name: 'PDF Files', extensions: ['pdf'] }]
  });
  return result.filePaths;
});

ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  return result.filePaths[0];
});

ipcMain.handle('save-file', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: options.defaultPath,
    filters: options.filters || [{ name: 'PDF Files', extensions: ['pdf'] }]
  });
  return result.filePath;
});

ipcMain.handle('read-directory', async (event, dirPath) => {
  try {
    const files = fs.readdirSync(dirPath)
      .filter(f => f.toLowerCase().endsWith('.pdf'))
      .map(f => path.join(dirPath, f));
    return files;
  } catch (error) {
    throw error;
  }
});

app.whenReady().then(() => {
  console.log('[ePDF] App ready, resources path:', process.resourcesPath);
  console.log('[ePDF] Python exe path:', getPythonExePath());
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
