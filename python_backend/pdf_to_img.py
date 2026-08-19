import os
from PIL import Image
from pypdf import PdfReader

class PdfToImg:
    def convert_page(self, pdf_path, page_num, output_path, format='PNG', dpi=150):
        page_num = int(page_num)
        reader = PdfReader(pdf_path)
        if page_num < 1 or page_num > len(reader.pages):
            raise ValueError(f"Invalid page number: {page_num}")

        from pdf2image import convert_from_path
        images = convert_from_path(pdf_path, dpi=dpi, first_page=page_num, last_page=page_num)

        if images:
            images[0].save(output_path, format=format)
            return {'success': True, 'output': output_path}

        raise Exception("Failed to convert PDF page to image")

    def convert_all_pages(self, pdf_path, output_dir, format='PNG', dpi=150):
        os.makedirs(output_dir, exist_ok=True)

        from pdf2image import convert_from_path
        images = convert_from_path(pdf_path, dpi=dpi)

        results = []
        for idx, image in enumerate(images):
            output_path = os.path.join(output_dir, f'page_{idx + 1}.{format.lower()}')
            image.save(output_path, format=format)
            results.append({
                'page': idx + 1,
                'output': output_path
            })

        return {'success': True, 'files': results}

    def convert_to_images(self, pdf_path, output_dir, dpi=150):
        return self.convert_all_pages(pdf_path, output_dir, dpi=dpi)

    def get_page_count(self, pdf_path):
        reader = PdfReader(pdf_path)
        return len(reader.pages)
