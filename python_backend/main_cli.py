import sys
import os
import json
import argparse

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

def main():
    parser = argparse.ArgumentParser(description='ePDF Python Backend')
    parser.add_argument('--module', required=True, help='Module name')
    parser.add_argument('--method', required=True, help='Method name')
    parser.add_argument('--args', default='[]', help='JSON array of arguments')

    args = parser.parse_args()

    try:
        module = modules.get(args.module)
        if not module:
            print(json.dumps({'error': f"Module {args.module} not found"}))
            sys.exit(1)

        if not hasattr(module, args.method):
            print(json.dumps({'error': f"Method {args.method} not found in {args.module}"}))
            sys.exit(1)

        func = getattr(module, args.method)

        try:
            parsed_args = json.loads(args.args)
        except json.JSONDecodeError:
            parsed_args = []

        if parsed_args:
            result = func(*parsed_args)
        else:
            result = func()

        print(json.dumps({'success': True, 'result': result}))

    except Exception as e:
        import traceback
        traceback.print_exc()
        print(json.dumps({'error': str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    main()
