import React, { useState, useCallback } from 'react';

function DragDrop({ onFilesAdded }) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files)
      .filter(f => f.name.toLowerCase().endsWith('.pdf'))
      .map(f => ({
        name: f.name,
        path: f.path || f.name,
        size: f.size
      }));

    if (files.length > 0) {
      onFilesAdded(files);
    }
  }, [onFilesAdded]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleClick = async () => {
    try {
      const paths = await window.electronAPI.selectFiles({
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
      });

      if (paths && paths.length > 0) {
        const files = paths.map(p => ({
          name: p.split(/[\\/]/).pop(),
          path: p,
          size: 0
        }));
        onFilesAdded(files);
      }
    } catch (err) {
      console.error('Failed to select files:', err);
    }
  };

  return (
    <div
      className={`drop-zone ${isDragOver ? 'drag-over' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
    >
      <div className="drop-zone-icon">📁</div>
      <h3>拖拽PDF文件到这里</h3>
      <p>或点击选择文件 · 支持批量选择</p>
    </div>
  );
}

export default DragDrop;
