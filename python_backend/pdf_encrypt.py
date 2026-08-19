import os
from pypdf import PdfReader, PdfWriter

class PdfEncrypt:
    def encrypt(self, pdf_path, output_path, password):
        reader = PdfReader(pdf_path)
        writer = PdfWriter()

        for page in reader.pages:
            writer.add_page(page)

        writer.encrypt(password)

        with open(output_path, 'wb') as f:
            writer.write(f)

        return {'success': True, 'output': output_path}

    def decrypt(self, pdf_path, output_path, password):
        reader = PdfReader(pdf_path)

        if not reader.is_encrypted:
            raise ValueError("PDF is not encrypted")

        reader.decrypt(password)

        writer = PdfWriter()
        for page in reader.pages:
            writer.add_page(page)

        with open(output_path, 'wb') as f:
            writer.write(f)

        return {'success': True, 'output': output_path}

    def remove_password(self, pdf_path, output_path, password):
        reader = PdfReader(pdf_path)
        reader.decrypt(password)

        writer = PdfWriter()
        for page in reader.pages:
            writer.add_page(page)

        with open(output_path, 'wb') as f:
            writer.write(f)

        return {'success': True, 'output': output_path}

    def is_encrypted(self, pdf_path):
        reader = PdfReader(pdf_path)
        return reader.is_encrypted
