import React from 'react';

function FileList({ files, onRemoveFile, onClearFiles }) {
  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="file-list">
      <div className="file-list-header">
        <h3>已选择 {files.length} 个文件</h3>
        <button className="clear-btn" onClick={onClearFiles}>
          清空列表
        </button>
      </div>
      <div className="file-items">
        {files.map((file, index) => (
          <div key={index} className="file-item">
            <span className="file-icon">📄</span>
            <div className="file-info">
              <div className="file-name">{file.name}</div>
              <div className="file-path">{file.path}</div>
            </div>
            <button
              className="file-remove"
              onClick={() => onRemoveFile(index)}
            >
              移除
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FileList;
