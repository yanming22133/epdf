import React, { useState } from 'react';

function ConvertPanel({ files, execPython, processing }) {
  const [convertMode, setConvertMode] = useState('pdf_to_word');
  const [dpi, setDpi] = useState(150);
  const [preserveLayout, setPreserveLayout] = useState(true);

  const handleConvert = async () => {
    if (files.length === 0) return;

    const pdfPath = files[0].path;
    let outputPath;

    if (convertMode === 'pdf_to_word') {
      outputPath = await window.electronAPI.saveFile({
        defaultPath: files[0].name.replace('.pdf', '.docx'),
        filters: [{ name: 'Word Documents', extensions: ['docx'] }]
      });
      if (outputPath) {
        await execPython('pdf_to_word', 'convert', [pdfPath, outputPath, preserveLayout]);
      }
    } else if (convertMode === 'pdf_to_images') {
      const outputDir = await window.electronAPI.selectDirectory();
      if (outputDir) {
        await execPython('pdf_to_img', 'convert_all_pages', [pdfPath, outputDir, 'PNG', dpi]);
      }
    } else if (convertMode === 'images_to_pdf') {
      outputPath = await window.electronAPI.saveFile({
        defaultPath: 'output.pdf',
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
      });
      if (outputPath) {
        const imagePaths = files.map(f => f.path);
        await execPython('img_to_pdf', 'convert', [imagePaths, outputPath, 'fit']);
      }
    }
  };

  return (
    <div className="panel">
      <h2 className="panel-title">🔄 格式转换</h2>

      <div className="panel-options">
        <div className="option-group">
          <label>转换类型</label>
          <select value={convertMode} onChange={(e) => setConvertMode(e.target.value)}>
            <option value="pdf_to_word">PDF → Word</option>
            <option value="pdf_to_images">PDF → 图片</option>
            <option value="images_to_pdf">图片 → PDF</option>
          </select>
        </div>

        {(convertMode === 'pdf_to_images') && (
          <div className="option-group">
            <label>DPI (图片质量)</label>
            <input
              type="number"
              min="72"
              max="300"
              value={dpi}
              onChange={(e) => setDpi(parseInt(e.target.value) || 150)}
            />
          </div>
        )}

        {convertMode === 'pdf_to_word' && (
          <div className="option-group checkbox">
            <input
              type="checkbox"
              id="preserveLayout"
              checked={preserveLayout}
              onChange={(e) => setPreserveLayout(e.target.checked)}
            />
            <label htmlFor="preserveLayout">保留段落结构</label>
          </div>
        )}
      </div>

      <div className="btn-row">
        <button
          className="action-btn"
          onClick={handleConvert}
          disabled={processing || files.length === 0}
        >
          {processing ? '处理中...' : '🔄 开始转换'}
        </button>
      </div>

      {convertMode === 'pdf_to_word' && (
        <p style={{ marginTop: 12, color: '#64748b', fontSize: '0.85rem' }}>
          注：Word转换精度为"文字+段落结构准确，版式可能略有偏差"
        </p>
      )}

      {convertMode === 'images_to_pdf' && (
        <p style={{ marginTop: 12, color: '#64748b', fontSize: '0.85rem' }}>
          支持 JPG、PNG 等常见图片格式
        </p>
      )}
    </div>
  );
}

export default ConvertPanel;
