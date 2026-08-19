import os
from PIL import Image
from pypdf import PdfWriter

class ImgToPdf:
    def convert(self, image_paths, output_path, layout='single'):
        writer = PdfWriter()

        for image_path in image_paths:
            img = Image.open(image_path)

            if img.mode == 'RGBA':
                background = Image.new('RGB', img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[3])
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')

            img_width, img_height = img.size
            aspect = img_height / img_width

            from reportlab.lib.pagesizes import letter, A4
            from reportlab.pdfgen import canvas
            from io import BytesIO

            if layout == 'fit':
                pagesize = (img_width, img_height)
            elif layout == 'A4':
                pagesize = A4
            elif layout == 'letter':
                pagesize = letter
            else:
                pagesize = (img_width, img_height)

            packet = BytesIO()
            c = canvas.Canvas(packet, pagesize=pagesize)

            if layout == 'fit':
                c.drawImage(image_path, 0, 0, width=img_width, height=img_height)
            else:
                if aspect > 1:
                    display_height = pagesize[1] - 60
                    display_width = display_height / aspect
                    x_offset = (pagesize[0] - display_width) / 2
                    c.drawImage(image_path, x_offset, 30, width=display_width, height=display_height)
                else:
                    display_width = pagesize[0] - 60
                    display_height = display_width * aspect
                    y_offset = (pagesize[1] - display_height) / 2
                    c.drawImage(image_path, 30, y_offset, width=display_width, height=display_height)

            c.save()
            packet.seek(0)

            from pypdf import PdfReader
            reader = PdfReader(packet)
            for page in reader.pages:
                writer.add_page(page)

        with open(output_path, 'wb') as f:
            writer.write(f)

        return {'success': True, 'output': output_path, 'page_count': len(image_paths)}

    def convert_single(self, image_path, output_path):
        return self.convert([image_path], output_path)
