import os
from pypdf import PdfReader, PdfWriter
from pypdf.generic import (
    ArrayObject, DictionaryObject, NameObject, 
    NumberObject, TextStringObject, NullObject
)
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.cidfonts import UnicodeCIDFont
from io import BytesIO

pdfmetrics.registerFont(UnicodeCIDFont('STSong-Light'))

class PdfMerger:
    def merge_with_toc(self, pdf_paths, output_path, toc_entries=None):
        writer = PdfWriter()
        entries = toc_entries or [os.path.splitext(os.path.basename(p))[0] for p in pdf_paths]

        # 生成目录页
        toc_page = self._create_toc_page(entries, writer)
        writer.add_page(toc_page)

        # 添加各PDF内容
        page_offset = 1
        parent = None

        for idx, pdf_path in enumerate(pdf_paths):
            reader = PdfReader(pdf_path)
            writer.append(pdf_path)

            filename = os.path.splitext(os.path.basename(pdf_path))[0]
            title = toc_entries[idx] if toc_entries and idx < len(toc_entries) else filename

            parent = writer.add_outline_item(
                title=title,
                page_number=writer.pages[page_offset],
                parent=parent
            )
            page_offset += len(reader.pages)

        with open(output_path, 'wb') as f:
            writer.write(f)

        return {'success': True, 'output': output_path, 'pages': page_offset}

    def _create_toc_page(self, entries, writer):
        width, height = letter
        packet = BytesIO()
        c = canvas.Canvas(packet, pagesize=letter)

        # 标题
        c.setFont("STSong-Light", 28)
        c.setFillColor(HexColor('#1e3a5f'))
        c.drawCentredString(width / 2, height - 80, "目录")

        y = height - 130
        link_rects = []

        for idx, entry in enumerate(entries):
            if y < 60:
                break

            # 序号
            c.setFont("STSong-Light", 12)
            c.setFillColor(HexColor('#1e3a5f'))
            c.drawString(60, y, f"{idx + 1}.")

            # 目录文字
            c.setFont("STSong-Light", 12)
            c.setFillColor(HexColor('#333333'))
            display_text = entry[:47] + "..." if len(entry) > 50 else entry
            c.drawString(90, y, display_text)

            # 页码
            c.setFillColor(HexColor('#666666'))
            page_num = str(idx + 2)
            c.drawRightString(width - 60, y, page_num)

            # 虚线
            c.setStrokeColor(HexColor('#cccccc'))
            c.setLineWidth(0.5)
            text_end = 90 + c.stringWidth(display_text, "STSong-Light", 12)
            page_num_width = c.stringWidth(page_num, "STSong-Light", 12)
            c.line(text_end + 5, y + 2, width - 60 - page_num_width - 5, y + 2)

            # 记录链接区域
            link_rects.append((60, y - 5, width - 60, y + 15, idx + 1))

            y -= 28

        c.save()
        packet.seek(0)
        page = PdfReader(packet).pages[0]

        # 添加超链接注释
        annots = ArrayObject()
        for rect in link_rects:
            x1, y1, x2, y2, target_page = rect

            # 创建链接注释
            link_annotation = DictionaryObject()
            link_annotation[NameObject('/Type')] = NameObject('/Annot')
            link_annotation[NameObject('/Subtype')] = NameObject('/Link')
            link_annotation[NameObject('/Rect')] = ArrayObject([
                NumberObject(x1), NumberObject(y1),
                NumberObject(x2), NumberObject(y2)
            ])
            link_annotation[NameObject('/Border')] = ArrayObject([
                NumberObject(0), NumberObject(0), NumberObject(0)
            ])

            # 创建GoTo动作
            dest = ArrayObject([
                NumberObject(target_page),
                NameObject('/Fit')
            ])
            link_annotation[NameObject('/Dest')] = dest

            annots.append(link_annotation)

        page[NameObject('/Annots')] = annots

        return page

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
                page_num = writer.pages[entry['page']] if entry.get('page') is not None else writer.pages[0]
                if entry.get('children'):
                    child_parent = writer.add_outline_item(
                        title=entry['title'],
                        page_number=page_num,
                        parent=parent
                    )
                    build_outline(entry['children'], child_parent)
                else:
                    writer.add_outline_item(
                        title=entry['title'],
                        page_number=page_num,
                        parent=parent
                    )

        build_outline(toc_entries)
        with open(output_path, 'wb') as f:
            writer.write(f)
        return {'success': True, 'output': output_path}
