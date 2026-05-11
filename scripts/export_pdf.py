#!/usr/bin/env python3
import os
import sqlite3
from datetime import datetime
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically calculate the total page count
    and render a beautiful header/footer on each page.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        
        # 1. Colors
        primary_color = colors.HexColor('#1E293B')  # Slate Blue
        accent_color = colors.HexColor('#1DD1A1')   # Emerald Green
        grey_text = colors.HexColor('#94A3B8')       # Light Grey Text
        
        # --- Page Header ---
        # Draw a beautiful dark banner at the top of page 1, or a simpler line on later pages
        if self._pageNumber == 1:
            # Draw top banner
            self.setFillColor(primary_color)
            self.rect(0, 842 - 45, 595.27, 45, fill=True, stroke=False) # A4 width is 595.27, height is 842.89
            
            # Draw accent green line
            self.setFillColor(accent_color)
            self.rect(0, 842 - 48, 595.27, 3, fill=True, stroke=False)
            
            # Header title
            self.setFillColor(colors.white)
            self.setFont("Helvetica-Bold", 14)
            self.drawString(30, 842 - 28, "AXION SYSTEM")
            
            self.setFont("Helvetica", 9)
            self.drawString(140, 842 - 26, "|   BANCO DE EMPRESAS, PORTALES Y CAPITAL RELACIONAL")
            
            # Generation Date (Right-aligned)
            today_str = datetime.now().strftime("%d de %B, %Y")
            self.drawRightString(595.27 - 30, 842 - 27, f"Fecha: {today_str}")
        else:
            # Simple running header for subsequent pages
            self.setStrokeColor(primary_color)
            self.setLineWidth(0.5)
            self.line(30, 842 - 35, 595.27 - 30, 842 - 35)
            
            self.setFillColor(primary_color)
            self.setFont("Helvetica-Bold", 9)
            self.drawString(30, 842 - 28, "AXION SYSTEM")
            self.setFont("Helvetica", 8)
            self.drawString(105, 842 - 28, "- Banco de Empresas y Portales")
            
            today_str = datetime.now().strftime("%d/%m/%Y")
            self.drawRightString(595.27 - 30, 842 - 28, today_str)

        # --- Page Footer ---
        self.setStrokeColor(colors.HexColor('#E2E8F0'))
        self.setLineWidth(0.5)
        self.line(30, 45, 595.27 - 30, 45)
        
        self.setFillColor(grey_text)
        self.setFont("Helvetica", 8)
        self.drawString(30, 30, "LifeOS Ecosystem • Axion Dashboard. Diseñado para Sebastian.")
        
        page_text = f"Página {self._pageNumber} de {page_count}"
        self.drawRightString(595.27 - 30, 30, page_text)
        
        self.restoreState()

def export_to_pdf(db_path, output_pdf_path):
    # Establish SQLite connection
    if not os.path.exists(db_path):
        print(f"Error: Base de datos no encontrada en {db_path}")
        return False
        
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Query all alternancia_bank items ordered by category then title
    cursor.execute("""
        SELECT category, title, meta 
        FROM alternancia_bank 
        ORDER BY 
            CASE category 
                WHEN 'COMPANY' THEN 1 
                WHEN 'LINK' THEN 2 
                WHEN 'CONTACT' THEN 3 
                ELSE 4 
            END, 
            title ASC
    """)
    rows = cursor.fetchall()
    conn.close()
    
    # Document Setup
    # Margins: Left=30pt, Right=30pt, Top=60pt, Bottom=60pt
    doc = SimpleDocTemplate(
        output_pdf_path,
        pagesize=A4,
        leftMargin=30,
        rightMargin=30,
        topMargin=65,
        bottomMargin=60
    )
    
    story = []
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#1E293B'),
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#64748B'),
        spaceAfter=25
    )
    
    # Cell typography styles
    cell_bold = ParagraphStyle(
        'CellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#1E293B')
    )
    
    cell_regular = ParagraphStyle(
        'CellRegular',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#334155')
    )
    
    cell_link = ParagraphStyle(
        'CellLink',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#3B82F6') # Elegant Blue link color
    )
    
    # Title & Subtitle for content body
    story.append(Spacer(1, 10))
    story.append(Paragraph("Catálogo Unificado de Empresas y Enlaces", title_style))
    story.append(Paragraph(
        "Mapeo estratégico consolidado que contiene empresas objetivo del radar, portales directos de reclutamiento con enlaces interactivos y capital relacional.",
        subtitle_style
    ))
    
    # Table data container
    # Header Row
    table_data = [[
        Paragraph("<b>Empresa / Título</b>", ParagraphStyle('Head1', parent=cell_bold, textColor=colors.white)),
        Paragraph("<b>Categoría / Tipo</b>", ParagraphStyle('Head2', parent=cell_bold, textColor=colors.white)),
        Paragraph("<b>Detalles / Enlace de Empleo</b>", ParagraphStyle('Head3', parent=cell_bold, textColor=colors.white))
    ]]
    
    # Populate table data
    for category, title, meta in rows:
        # Category label mapping
        if category == 'COMPANY':
            cat_label = "🏢 Radar Empresa"
        elif category == 'LINK':
            cat_label = "🔗 Portal de Empleo"
        elif category == 'CONTACT':
            cat_label = "🤝 Capital Relacional"
        else:
            cat_label = f"📁 {category}"
            
        # Meta content processing (Hyperlinks if applicable)
        is_url = meta and meta.startswith('http')
        if is_url:
            # We wrap the text in a ReportLab anchor tag for interactive PDF links
            escaped_url = meta.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            meta_paragraph = Paragraph(f'<a href="{escaped_url}"><u>{escaped_url}</u></a>', cell_link)
        else:
            escaped_meta = (meta or '').replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('\n', '<br/>')
            meta_paragraph = Paragraph(escaped_meta or '—', cell_regular)
            
        table_data.append([
            Paragraph(title, cell_bold),
            Paragraph(cat_label, cell_regular),
            meta_paragraph
        ])
        
    # Column widths (Total width must fit within A4 printable width: 595.27 - 60 = 535.27)
    # Let's allocate: 145pt, 120pt, 270pt
    col_widths = [140, 115, 280]
    
    # Build Table
    main_table = Table(table_data, colWidths=col_widths, repeatRows=1)
    
    # Styling Table
    t_style = TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E293B')), # Dark Slate header
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')), # Light grid border
    ])
    
    # Alternate row colors
    for i in range(1, len(table_data)):
        bg_color = colors.HexColor('#F8FAFC') if i % 2 == 1 else colors.white
        t_style.add('BACKGROUND', (0, i), (-1, i), bg_color)
        
    main_table.setStyle(t_style)
    story.append(main_table)
    
    # Build the document using the NumberedCanvas for header/footer rendering
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF generado exitosamente en: {output_pdf_path}")
    return True

if __name__ == "__main__":
    db_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "lifeos.db")
    pdf_output = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "Banco_de_Empresas.pdf")
    
    # Ensure public folder exists
    os.makedirs(os.path.dirname(pdf_output), exist_ok=True)
    
    export_to_pdf(db_file, pdf_output)
