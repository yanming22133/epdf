import React, { useState } from 'react';
import DragDrop from './components/DragDrop';
import FileList from './components/FileList';
import MergePanel from './components/MergePanel';
import SplitPanel from './components/SplitPanel';
import EncryptPanel from './components/EncryptPanel';
import ConvertPanel from './components/ConvertPanel';
import WatermarkPanel from './components/WatermarkPanel';

const tabs = [
  { id: 'merge', label: '合并+目录', icon: '📚' },
  { id: 'split', label: '拆分PDF', icon: '✂️' },
  { id: 'encrypt', label: '加密/解密', icon: '🔒' },
  { id: 'convert', label: '格式转换', icon: '🔄' },
  { id: 'watermark', label: '添加水印', icon: '💧' },
];

function App() {
  const [activeTab, setActiveTab] = useState('merge');
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFilesAdded = (newFiles) => {
    setFiles(prev => [...prev, ...newFiles]);
    setResult(null);
    setError(null);
  };

  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearFiles = () => {
    setFiles([]);
    setResult(null);
    setError(null);
  };

  const execPython = async (module, method, args) => {
    setProcessing(true);
    setError(null);
    setResult(null);
    try {
      const res = await window.electronAPI.pythonExec(module, method, args);
      setResult(res);
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setProcessing(false);
    }
  };

  const renderPanel = () => {
    switch (activeTab) {
      case 'merge':
        return (
          <MergePanel
            files={files}
            onFilesAdded={handleFilesAdded}
            onRemoveFile={handleRemoveFile}
            onClearFiles={handleClearFiles}
            execPython={execPython}
            processing={processing}
            result={result}
            error={error}
          />
        );
      case 'split':
        return (
          <SplitPanel
            files={files}
            onFilesAdded={handleFilesAdded}
            onRemoveFile={handleRemoveFile}
            onClearFiles={handleClearFiles}
            execPython={execPython}
            processing={processing}
            result={result}
            error={error}
          />
        );
      case 'encrypt':
        return (
          <EncryptPanel
            files={files}
            onFilesAdded={handleFilesAdded}
            onRemoveFile={handleRemoveFile}
            onClearFiles={handleClearFiles}
            execPython={execPython}
            processing={processing}
            result={result}
            error={error}
          />
        );
      case 'convert':
        return (
          <ConvertPanel
            files={files}
            onFilesAdded={handleFilesAdded}
            onRemoveFile={handleRemoveFile}
            onClearFiles={handleClearFiles}
            execPython={execPython}
            processing={processing}
            result={result}
            error={error}
          />
        );
      case 'watermark':
        return (
          <WatermarkPanel
            files={files}
            onFilesAdded={handleFilesAdded}
            onRemoveFile={handleRemoveFile}
            onClearFiles={handleClearFiles}
            execPython={execPython}
            processing={processing}
            result={result}
            error={error}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>📄 ePDF</h1>
        <p className="subtitle">PDF目录制作工具 - 现代化PDF处理专家</p>
      </header>

      <nav className="nav-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <main className="main-content">
        <DragDrop onFilesAdded={handleFilesAdded} />

        {files.length > 0 && (
          <FileList
            files={files}
            onRemoveFile={handleRemoveFile}
            onClearFiles={handleClearFiles}
          />
        )}

        {renderPanel()}

        {processing && (
          <div className="processing-overlay">
            <div className="spinner"></div>
            <p>处理中...</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <strong>错误:</strong> {error}
          </div>
        )}

        {result && result.success && (
          <div className="success-message">
            <strong>成功!</strong> 操作完成
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
