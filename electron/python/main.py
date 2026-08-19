import sys
import json
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from pdf_merger import PdfMerger
from pdf_splitter import PdfSplitter
from pdf_encrypt import PdfEncrypt
from pdf_watermark import PdfWatermark
from pdf_to_img import PdfToImg
from img_to_pdf import ImgToPdf
from pdf_to_word import PdfToWord

modules = {
    'pdf_merger': PdfMerger(),
    'pdf_splitter': PdfSplitter(),
    'pdf_encrypt': PdfEncrypt(),
    'pdf_watermark': PdfWatermark(),
    'pdf_to_img': PdfToImg(),
    'img_to_pdf': ImgToPdf(),
    'pdf_to_word': PdfToWord(),
}

def handle_request(data):
    request_id = data.get('requestId')
    module_name = data.get('module')
    method = data.get('method')
    args = data.get('args', [])

    try:
        module = modules.get(module_name)
        if not module:
            raise ValueError(f"Module {module_name} not found")

        if not hasattr(module, method):
            raise ValueError(f"Method {method} not found in {module_name}")

        func = getattr(module, method)
        result = func(*args) if args else func()

        return {'requestId': request_id, 'result': result}
    except Exception as e:
        return {'requestId': request_id, 'error': str(e)}

if __name__ == '__main__':
    for line in sys.stdin:
        line = line.strip()
        if line:
            try:
                data = json.loads(line)
                result = handle_request(data)
                print(json.dumps(result), flush=True)
            except json.JSONDecodeError:
                continue
