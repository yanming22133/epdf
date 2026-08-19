import React, { useState } from 'react';

function WatermarkPanel({ files, execPython, processing }) {
  const [watermarkText, setWatermarkText] = useState('');
  const [opacity, setOpacity] = useState(0.3);
  const [fontSize, setFontSize] = useState(50);
  const [position, setPosition] = useState('diagonal');

  const handleAddWatermark = async () => {
    if (files.length === 0 || !watermarkText) return;

    const pdfPath = files[0].path;
    const outputPath = await window.electronAPI.saveFile({
      defaultPath: files[0].name.replace('.pdf', '.watermarked.pdf'),
      filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
    });

    if (!outputPath) return;

    await execPython('pdf_watermark', 'add_watermark_to_all', [
      pdfPath,
      outputPath,
      watermarkText,
      position
    ]);
  };

  return (
    <div className="panel">
      <h2 className="panel-title">💧 添加水印</h2>

      <div className="panel-options">
        <div className="option-group">
          <label>水印文字</label>
          <input
            type="text"
            value={watermarkText}
            onChange={(e) => setWatermarkText(e.target.value)}
            placeholder="输入水印文字"
          />
        </div>

        <div className="option-group">
          <label>位置</label>
          <select value={position} onChange={(e) => setPosition(e.target.value)}>
            <option value="diagonal">对角线</option>
            <option value="center">居中</option>
            <option value="footer">底部</option>
          </select>
        </div>

        <div className="option-group">
          <label>透明度 ({opacity})</label>
          <input
            type="range"
            min="0.1"
            max="0.9"
            step="0.1"
            value={opacity}
            onChange={(e) => setOpacity(parseFloat(e.target.value))}
          />
        </div>

        <div className="option-group">
          <label>字体大小 ({fontSize})</label>
          <input
            type="range"
            min="20"
            max="100"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="btn-row">
        <button
          className="action-btn"
          onClick={handleAddWatermark}
          disabled={processing || files.length === 0 || !watermarkText}
        >
          {processing ? '处理中...' : '💧 添加水印'}
        </button>
      </div>

      <div style={{ marginTop: 20, padding: 16, background: '#f8fafc', borderRadius: 12 }}>
        <h4 style={{ marginBottom: 8, color: '#475569' }}>预览效果</h4>
        <div
          style={{
            position: 'relative',
            height: 150,
            background: '#e2e8f0',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          <span style={{ fontSize: '1.5rem', color: '#94a3b8' }}>PDF内容</span>
          <span
            style={{
              position: 'absolute',
              fontSize: `${fontSize * 0.4}px`,
              color: `#667eea`,
              opacity: opacity,
              transform: position === 'diagonal' ? 'rotate(-45deg)' : 'none',
              whiteSpace: 'nowrap'
            }}
          >
            {watermarkText || '水印预览'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default WatermarkPanel;
