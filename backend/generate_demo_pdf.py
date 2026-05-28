from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors

def generate_zoning_pdf(filename="demo_zoning_guidelines.pdf"):
    doc = SimpleDocTemplate(filename, pagesize=A4, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
    styles = getSampleStyleSheet()
    
    # Custom Styles
    title_style = styles['Title']
    heading_style = styles['Heading2']
    normal_style = styles['Normal']
    
    Story = []
    
    # Title
    Story.append(Paragraph("ARCHITECTURAL & ZONING GUIDELINES", title_style))
    Story.append(Spacer(1, 0.2 * inch))
    Story.append(Paragraph("Greens Boutique Estate - Phase 1", heading_style))
    Story.append(Spacer(1, 0.5 * inch))
    
    # Introduction
    Story.append(Paragraph("1. INTRODUCTION", heading_style))
    intro_text = """This document outlines the strict zoning regulations and architectural guidelines for 
    the Greens Boutique Estate. All concept generation, massing, and construction must adhere strictly to these parameters 
    to ensure estate harmony and regulatory compliance with the Local Municipality."""
    Story.append(Paragraph(intro_text, normal_style))
    Story.append(Spacer(1, 0.2 * inch))
    
    # Core Parameters
    Story.append(Paragraph("2. CORE ZONING PARAMETERS", heading_style))
    Story.append(Spacer(1, 0.1 * inch))
    
    data = [
        ["Parameter", "Regulation limit"],
        ["Zoning Classification", "Residential 1 (Single Dwelling)"],
        ["Maximum F.A.R (Floor Area Ratio)", "0.6"],
        ["Maximum Coverage", "50% of total stand area"],
        ["Maximum Height", "2 Storeys (Max 8.5m to eaves)"],
        ["Minimum Dwelling Size", "200 sqm (excluding garages)"],
    ]
    
    t = Table(data, colWidths=[2.5*inch, 3.5*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    Story.append(t)
    Story.append(Spacer(1, 0.3 * inch))
    
    # Setbacks
    Story.append(Paragraph("3. BUILDING LINES (SETBACKS)", heading_style))
    setback_text = """
    • Street Boundary: 4.5 meters minimum<br/>
    • Rear Boundary: 3.0 meters minimum<br/>
    • Side Boundaries: 2.0 meters minimum on both sides<br/>
    No permanent structures, including swimming pools or massive pergolas, may encroach into these building lines without prior municipal consent.
    """
    Story.append(Paragraph(setback_text, normal_style))
    Story.append(Spacer(1, 0.3 * inch))
    
    # Roofs & Materials
    Story.append(Paragraph("4. ARCHITECTURAL AESTHETICS", heading_style))
    aesthetics_text = """
    <b>Roofing:</b> Pitched roofs must be between 17.5 and 35 degrees. Flat roofs are permitted but must not exceed 30% of the total roof footprint and must be concealed behind parapet walls.
    <br/><br/>
    <b>Materials:</b> Facebrick is strictly prohibited. Walls must be smooth plastered and painted in approved earthy tones (see Appendix A). Boundary walls on the street front may not exceed 1.2m in solid height, with 60% visual permeability required above 0.6m.
    """
    Story.append(Paragraph(aesthetics_text, normal_style))
    Story.append(Spacer(1, 0.3 * inch))
    
    doc.build(Story)

if __name__ == "__main__":
    generate_zoning_pdf()
