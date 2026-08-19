import React, { useState } from 'react';

function SplitPanel({ files, onFilesAdded, execPython, processing }) {
  const [splitMode, setSplitMode] = useState('range');
  const [ranges, setRanges] = useState([{ start: 1, end: 5 }]);
  const [extractPages, setExtractPages] = useState('');

  const handleAddRange = () => {
    setRanges([...ranges, { start: ranges[ranges.length - 1]?.end + 1 || 1, end: (ranges[ranges.length - 1]?.end || 1) + 5 }]);
  };

  const handleRemoveRange = (index) => {
    setRanges(ranges.filter((_, i) => i !== index));
  };

  const handleRangeChange = (index, field, value) => {
    const newRanges = [...ranges];
    newRanges[index][field] = parseInt(value) || 1;
    setRanges(newRanges);
  };

  const handleSplit = async () => {
    if (files.length === 0) return;

    const pdfPath = files[0].path;
    const outputDir = await window.electronAPI.selectDirectory();

    if (!outputDir) return;

    if (splitMode === 'range') {
      const validRanges = ranges
        .filter(r => r.start <= r.end)
        .map(r => [r.start, r.end]);
      await execPython('pdf_splitter', 'split_by_range', [pdfPath, outputDir, validRanges]);
    } else if (splitMode === 'pages') {
      const pages = extractPages.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p));
      const outputPath = outputDir + '/extracted.pdf';
      await execPython('pdf_splitter', 'extract_pages', [pdfPath, outputPath, pages]);
    } else {
      await execPython('pdf_splitter', 'split_single_pages', [pdfPath, outputDir]);
    }
  };

  return (
    <div className="panel">
      <h2 className="panel-title">✂️ PDF拆分</h2>

      <div className="panel-options">
        <div className="option-group">
          <label>拆分模式</label>
          <select value={splitMode} onChange={(e) => setSplitMode(e.target.value)}>
            <option value="range">按范围拆分</option>
            <option value="pages">提取指定页</option>
            <option value="single">拆分为单页</option>
          </select>
        </div>
      </div>

      {splitMode === 'range' && (
        <div className="toc-editor">
          <div className="section-title">设置页面范围</div>
          {ranges.map((range, index) => (
            <div key={index} className="page-range">
              <span>第</span>
              <input
                type="number"
                min="1"
                value={range.start}
                onChange={(e) => handleRangeChange(index, 'start', e.target.value)}
                style={{ width: '80px' }}
              />
              <span>页 至 第</span>
              <input
                type="number"
                min="1"
                value={range.end}
                onChange={(e) => handleRangeChange(index, 'end', e.target.value)}
                style={{ width: '80px' }}
              />
              <span>页</span>
              {ranges.length > 1 && (
                <button className="remove-btn" onClick={() => handleRemoveRange(index)}>×</button>
              )}
            </div>
          ))}
          <button className="action-btn secondary" onClick={handleAddRange} style={{ marginTop: 12 }}>
            + 添加范围
          </button>
        </div>
      )}

      {splitMode === 'pages' && (
        <div className="toc-editor">
          <div className="section-title">输入要提取的页码（逗号分隔）</div>
          <input
            type="text"
            value={extractPages}
            onChange={(e) => setExtractPages(e.target.value)}
            placeholder="例如: 1, 3, 5, 7-10"
            style={{ width: '100%' }}
          />
        </div>
      )}

      <div className="btn-row">
        <button
          className="action-btn"
          onClick={handleSplit}
          disabled={processing || files.length === 0}
        >
          {processing ? '处理中...' : '✂️ 开始拆分'}
        </button>
      </div>
    </div>
  );
}

export default SplitPanel;
