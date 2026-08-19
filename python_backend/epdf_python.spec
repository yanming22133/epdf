import sys
sys.setrecursionlimit(sys.getrecursionlimit() * 5)

block_cipher = None
a = Analysis(
    ['main_cli.py'],
    pathex=[],
    binaries=[],
    datas=[],
    hiddenimports=[
        'pdfplumber',
        'pypdf',
        'PIL',
        'reportlab',
        'python_docx',
        'pdf2image',
        'cryptography',
        'cffi',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        'tensorflow',
        'torch',
        'matplotlib',
        'scipy',
        'pandas',
        'numpy',
        'cv2',
        'sklearn',
        'skimage',
        'PIL.ImageFilter',
        'PIL.ImageOps',
    ],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='epdf_python',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
