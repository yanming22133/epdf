const {spawn} = require('child_process');
const path = 'C:\\Users\\yanming\\epdf\\python_backend\\dist\\epdf_python.exe';
const pdfPath = 'C:/Users/yanming/Downloads/Final Report.pdf';

function test(module, method, args = []) {
    return new Promise((resolve) => {
        const fullArgs = ['--module', module, '--method', method, '--args', JSON.stringify(args)];
        const child = spawn(path, fullArgs, {stdio: ['pipe', 'pipe', 'pipe']});
        let stdout = '';
        let stderr = '';
        child.stdout.on('data', d => stdout += d);
        child.stderr.on('data', d => stderr += d);
        child.on('close', (code) => {
            try {
                const result = JSON.parse(stdout.trim());
                if (result.error) {
                    console.log(`❌ ${module}.${method}: ${result.error}`);
                } else {
                    console.log(`✅ ${module}.${method}: OK`);
                }
            } catch (e) {
                console.log(`❌ ${module}.${method}: Parse error - stdout: "${stdout}", stderr: "${stderr}"`);
            }
            resolve();
        });
    });
}

async function runTests() {
    console.log('Testing pdf_merger...');
    await test('pdf_merger', 'get_pdf_info', [pdfPath]);
    await test('pdf_merger', 'merge_simple', [[pdfPath], 'C:/Users/yanming/Desktop/test_merge.pdf']);
    await test('pdf_merger', 'extract_toc', [pdfPath]);

    console.log('\nTesting pdf_encrypt...');
    await test('pdf_encrypt', 'encrypt', [pdfPath, 'C:/Users/yanming/Desktop/test_encrypt.pdf', 'password123']);
    await test('pdf_encrypt', 'is_encrypted', [pdfPath]);
    await test('pdf_encrypt', 'decrypt', ['C:/Users/yanming/Desktop/test_encrypt.pdf', 'C:/Users/yanming/Desktop/test_decrypt.pdf', 'password123']);

    console.log('\nTesting pdf_splitter...');
    await test('pdf_splitter', 'get_page_count', [pdfPath]);
    await test('pdf_splitter', 'split_single_pages', [pdfPath, 'C:/Users/yanming/Desktop/split_test']);

    console.log('\nAll tests completed');
}

runTests();
