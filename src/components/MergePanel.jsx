import React, { useState } from 'react';

function MergePanel({ files, onFilesAdded, onRemoveFile, onClearFiles, execPython, processing }) {
  const [customTitles, setCustomTitles] = useState({});
  const [useCustomTitles, setUseCustomTitles] = useState(false);
  const [outputName, setOutputName] = useState('merged_output');

  const handleTitleChange = (index, value) => {
    setCustomTitles(prev => ({ ...prev, [index]: value }));
  };

  const handleMerge = async () => {
    const savePath = await window.electronAPI.saveFile({
      defaultPath: `${outputName}.pdf`,
      filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
    });

    if (!savePath) return;

    const pdfPaths = files.map(f => f.path);

    if (useCustomTitles) {
      const tocEntries = files.map((f, i) => customTitles[i] || f.name.replace('.pdf', ''));
      await execPython('pdf_merger', 'merge_with_toc', [pdfPaths, savePath, tocEntries]);
    } else {
      await execPython('pdf_merger', 'merge_with_toc', [pdfPaths, savePath, null]);
    }
  };

  const handleAddFromFolder = async () => {
    const dirPath = await window.electronAPI.selectDirectory();
    if (!dirPath) return;

    const pdfFiles = await window.electronAPI.readDirectory(dirPath);
    const newFiles = pdfFiles.map(p => ({
      name: p.split(/[\\/]/).pop(),
      path: p,
      size: 0
    }));
    onFilesAdded(newFiles);
  };

  return (
    <div className="panel">
      <h2 className="panel-title">📚 PDF合并 + 自动目录</h2>

      <div className="panel-options">
        <div className="option-group">
          <label>输出文件名</label>
          <input
            type="text"
            value={outputName}
            onChange={(e) => setOutputName(e.target.value)}
            placeholder="输出文件名"
          />
        </div>

        <div className="option-group checkbox">
          <input
            type="checkbox"
            id="useCustomTitles"
            checked={useCustomTitles}
            onChange={(e) => setUseCustomTitles(e.target.checked)}
          />
          <label htmlFor="useCustomTitles">自定义目录标题</label>
        </div>
      </div>

      {useCustomTitles && (
        <div className="toc-editor">
          <div className="section-title">设置目录标题</div>
          {files.map((file, index) => (
            <div key={index} className="toc-entry">
              <span>{index + 1}.</span>
              <input
                type="text"
                value={customTitles[index] || ''}
                onChange={(e) => handleTitleChange(index, e.target.value)}
                placeholder={file.name.replace('.pdf', '')}
              />
              <button
                className="remove-btn"
                onClick={() => onRemoveFile(index)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="btn-row">
        <button
          className="action-btn secondary"
          onClick={handleAddFromFolder}
          disabled={processing}
        >
          📂 从文件夹添加
        </button>
        <button
          className="action-btn"
          onClick={handleMerge}
          disabled={processing || files.length < 2}
        >
          {processing ? '处理中...' : '🚀 开始合并'}
        </button>
      </div>

      {files.length < 2 && files.length > 0 && (
        <p style={{ marginTop: 12, color: '#64748b', fontSize: '0.9rem' }}>
          请至少选择2个PDF文件进行合并
        </p>
      )}
    </div>
  );
}

export default MergePanel;
