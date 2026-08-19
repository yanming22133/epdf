const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  pythonExec: (module, method, args) => ipcRenderer.invoke('python-exec', { module, method, args }),
  selectFiles: (options) => ipcRenderer.invoke('select-files', options),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  saveFile: (options) => ipcRenderer.invoke('save-file', options),
  readDirectory: (dirPath) => ipcRenderer.invoke('read-directory', dirPath),
});
