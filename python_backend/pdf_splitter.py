import os
from pypdf import PdfReader, PdfWriter

class PdfSplitter:
    def split_by_range(self, pdf_path, output_dir, ranges):
        os.makedirs(output_dir, exist_ok=True)
        reader = PdfReader(pdf_path)
        results = []

        for idx, (start, end) in enumerate(ranges):
            writer = PdfWriter()
            for page_num in range(start - 1, end):
                if 0 <= page_num < len(reader.pages):
                    writer.add_page(reader.pages[page_num])

            output_path = os.path.join(output_dir, f'part_{idx + 1}.pdf')
            with open(output_path, 'wb') as f:
                writer.write(f)

            results.append({
                'range': f'{start}-{end}',
                'output': output_path
            })

        return {'success': True, 'files': results}

    def split_single_pages(self, pdf_path, output_dir):
        os.makedirs(output_dir, exist_ok=True)
        reader = PdfReader(pdf_path)
        results = []

        for page_num in range(len(reader.pages)):
            writer = PdfWriter()
            writer.add_page(reader.pages[page_num])

            output_path = os.path.join(output_dir, f'page_{page_num + 1}.pdf')
            with open(output_path, 'wb') as f:
                writer.write(f)

            results.append({
                'page': page_num + 1,
                'output': output_path
            })

        return {'success': True, 'files': results}

    def extract_pages(self, pdf_path, pages, output_path):
        reader = PdfReader(pdf_path)
        writer = PdfWriter()

        for page_num in pages:
            if 0 <= page_num - 1 < len(reader.pages):
                writer.add_page(reader.pages[page_num - 1])

        with open(output_path, 'wb') as f:
            writer.write(f)

        return {'success': True, 'output': output_path}
