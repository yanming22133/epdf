import React, { useState } from 'react';

function EncryptPanel({ files, execPython, processing }) {
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('encrypt');

  const handleEncrypt = async () => {
    if (files.length === 0 || !password) return;

    const pdfPath = files[0].path;
    const ext = mode === 'encrypt' ? '.encrypted.pdf' : '.decrypted.pdf';
    const defaultName = files[0].name.replace('.pdf', ext);

    const outputPath = await window.electronAPI.saveFile({
      defaultPath: defaultName,
      filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
    });

    if (!outputPath) return;

    if (mode === 'encrypt') {
      await execPython('pdf_encrypt', 'encrypt', [pdfPath, outputPath, password]);
    } else {
      await execPython('pdf_encrypt', 'decrypt', [pdfPath, outputPath, password]);
    }
  };

  return (
    <div className="panel">
      <h2 className="panel-title">🔒 PDF加密/解密</h2>

      <div className="panel-options">
        <div className="option-group">
          <label>操作模式</label>
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="encrypt">加密PDF</option>
            <option value="decrypt">解密PDF</option>
          </select>
        </div>

        <div className="option-group">
          <label>密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="输入密码"
          />
        </div>
      </div>

      <div className="btn-row">
        <button
          className="action-btn"
          onClick={handleEncrypt}
          disabled={processing || files.length === 0 || !password}
        >
          {processing ? '处理中...' : mode === 'encrypt' ? '🔒 加密' : '🔓 解密'}
        </button>
      </div>

      {mode === 'decrypt' && (
        <p style={{ marginTop: 12, color: '#64748b', fontSize: '0.9rem' }}>
          注意：解密需要提供正确的PDF密码
        </p>
      )}
    </div>
  );
}

export default EncryptPanel;
