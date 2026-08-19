import os
from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.cidfonts import UnicodeCIDFont
from io import BytesIO

# 注册中文字体
pdfmetrics.registerFont(UnicodeCIDFont('STSong-Light'))

class PdfWatermark:
    def add_text_watermark(self, pdf_path, output_path, text, opacity=0.3, font_size=50, rotation=45):
        reader = PdfReader(pdf_path)
        writer = PdfWriter()

        packet = BytesIO()
        c = canvas.Canvas(packet, pagesize=letter)
        c.saveState()
        c.setFillAlpha(opacity)
        c.setFont("STSong-Light", font_size)
        c.translate(300, 400)
        c.rotate(rotation)
        c.drawCentredString(0, 0, text)
        c.restoreState()
        c.save()
        packet.seek(0)
        watermark = PdfReader(packet).pages[0]

        for page in reader.pages:
            page.merge_page(watermark)
            writer.add_page(page)

        with open(output_path, 'wb') as f:
            writer.write(f)

        return {'success': True, 'output': output_path}

    def add_image_watermark(self, pdf_path, output_path, image_path, opacity=0.3, scale=1.0):
        from PIL import Image

        reader = PdfReader(pdf_path)
        writer = PdfWriter()

        img = Image.open(image_path)
        img_width, img_height = img.size

        packet = BytesIO()
        c = canvas.Canvas(packet, pagesize=letter)
        c.saveState()
        c.setFillAlpha(opacity)
        c.drawImage(image_path, 0, 0, width=img_width * scale, height=img_height * scale)
        c.restoreState()
        c.save()
        packet.seek(0)

        watermark = PdfReader(packet).pages[0]

        for page in reader.pages:
            page.merge_page(watermark)
            writer.add_page(page)

        with open(output_path, 'wb') as f:
            writer.write(f)

        return {'success': True, 'output': output_path}

    def add_watermark_to_all(self, pdf_path, output_path, watermark_text, position='center'):
        reader = PdfReader(pdf_path)
        writer = PdfWriter()

        for page_num, page in enumerate(reader.pages):
            width = float(page.mediabox.width)
            height = float(page.mediabox.height)

            packet = BytesIO()
            c = canvas.Canvas(packet, pagesize=(width, height))
            c.setFillAlpha(0.3)
            c.setFont("STSong-Light", 60)

            if position == 'center':
                c.drawCentredString(width / 2, height / 2, watermark_text)
            elif position == 'diagonal':
                c.saveState()
                c.translate(width / 2, height / 2)
                c.rotate(45)
                c.drawCentredString(0, 0, watermark_text)
                c.restoreState()
            elif position == 'footer':
                c.drawCentredString(width / 2, 30, watermark_text)
            else:
                c.drawCentredString(width / 2, height / 2, watermark_text)

            c.save()
            packet.seek(0)

            watermark = PdfReader(packet).pages[0]
            page.merge_page(watermark)
            writer.add_page(page)

        with open(output_path, 'wb') as f:
            writer.write(f)

        return {'success': True, 'output': output_path}
