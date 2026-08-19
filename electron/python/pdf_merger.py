import os
from pypdf import PdfReader, PdfWriter
from pypdf.generic import Destination, ArrayObject, NameObject, TextStringObject

class PdfMerger:
    def merge_with_toc(self, pdf_paths, output_path, toc_entries=None):
        writer = PdfWriter()
        page_offset = 0
        outlines = []

        for idx, pdf_path in enumerate(pdf_paths):
            reader = PdfReader(pdf_path)
            writer.append(pdf_path)

            filename = os.path.splitext(os.path.basename(pdf_path))[0]

            if toc_entries and idx < len(toc_entries):
                title = toc_entries[idx]
            else:
                title = filename

            outline = Destination(
                name=TextStringObject(title),
                page=writer.pages[page_offset],
                typ=NameObject('/Fit')
            )
            outlines.append(outline)
            page_offset += len(reader.pages)

        if outlines:
            writer.add_outline_item(
                name=TextStringObject(outlines[0].title),
                page=outlines[0].page,
                parent=None
            )
            parent = writer.outline
            for i, outline in enumerate(outlines):
                if i == 0:
                    continue
                writer.add_outline_item(
                    name=TextStringObject(outline.title),
                    page=outline.page,
                    parent=parent
                )

        with open(output_path, 'wb') as f:
            writer.write(f)

        return {'success': True, 'output': output_path, 'pages': page_offset}

    def merge_simple(self, pdf_paths, output_path):
        writer = PdfWriter()
        for pdf_path in pdf_paths:
            writer.append(pdf_path)

        with open(output_path, 'wb') as f:
            writer.write(f)

        return {'success': True, 'output': output_path}

    def get_pdf_info(self, pdf_path):
        reader = PdfReader(pdf_path)
        return {
            'num_pages': len(reader.pages),
            'metadata': reader.metadata,
            'filename': os.path.basename(pdf_path)
        }

    def extract_toc(self, pdf_path):
        reader = PdfReader(pdf_path)
        toc = []
        if reader.outline:
            def extract_items(item, depth=0):
                if isinstance(item, list):
                    for sub_item in item:
                        extract_items(sub_item, depth)
                else:
                    toc.append({
                        'title': item.title,
                        'depth': depth,
                        'page': reader.get_destination_page_number(item) if item else None
                    })
            extract_items(reader.outline)
        return toc

    def update_toc(self, pdf_path, output_path, toc_entries):
        reader = PdfReader(pdf_path)
        writer = PdfWriter()
        writer.append(pdf_path)

        def build_outline(toc, parent=None):
            for entry in toc:
                if entry.get('children'):
                    child_parent = writer.add_outline_item(
                        name=TextStringObject(entry['title']),
                        page=writer.pages[entry['page']] if entry.get('page') is not None else writer.pages[0],
                        parent=parent
                    )
                    build_outline(entry['children'], child_parent)
                else:
                    writer.add_outline_item(
                        name=TextStringObject(entry['title']),
                        page=writer.pages[entry['page']] if entry.get('page') is not None else writer.pages[0],
                        parent=parent
                    )

        build_outline(toc_entries)

        with open(output_path, 'wb') as f:
            writer.write(f)

        return {'success': True, 'output': output_path}
