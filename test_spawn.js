const {spawn} = require('child_process');
const path = 'C:\\Users\\yanming\\epdf\\python_backend\\dist\\epdf_python.exe';

const testPath = 'C:/Users/yanming/Downloads/Final Report.pdf';
const args = ['--module', 'pdf_merger', '--method', 'get_pdf_info', '--args', JSON.stringify([testPath])];
console.log('Testing with path:', testPath);
console.log('JSON args:', JSON.stringify([testPath]));

const child = spawn(path, args, {stdio: ['pipe', 'pipe', 'pipe']});
let stdout = '';
let stderr = '';

child.stdout.on('data', d => stdout += d);
child.stderr.on('data', d => stderr += d);

child.on('close', c => {
    console.log('Exit code:', c);
    console.log('Stdout:', stdout);
    if (stderr) console.log('Stderr:', stderr);
});
