import os
import qrcode
from PIL import Image
from reportlab.lib.pagesizes import letter
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch

# 1. Paths
desktop_path = os.path.join(os.environ["USERPROFILE"], "Desktop")
qr_png_path = os.path.join(desktop_path, "QR-lavachecanres.png")
pdf_path = os.path.join(desktop_path, "QR-Canres-Viandes.pdf")

target_url = "https://www.lavachecanres.com"

# 2. Generate high-res QR Code
qr = qrcode.QRCode(
    version=None,
    error_correction=qrcode.constants.ERROR_CORRECT_H,  # High error correction allows logo or clean scans
    box_size=20,
    border=2,
)
qr.add_data(target_url)
qr.make(fit=True)

# Generate QR image with custom brand color (Burgundy / Oxblood #4A0E17 or dark charcoal #1C1917)
# Let's use deep burgundy / dark charcoal for premium contrast and readability
qr_img = qr.make_image(fill_color="#2B0A0F", back_color="white").convert("RGBA")

# Optionally paste bull-icon in center if looks great and keeps readability
bull_icon_path = os.path.abspath("public/brand/bull-icon.png")
if os.path.exists(bull_icon_path):
    bull = Image.open(bull_icon_path).convert("RGBA")
    # Resize bull to fit center (~22% of QR size)
    qr_w, qr_h = qr_img.size
    icon_size = int(qr_w * 0.22)
    bull = bull.resize((icon_size, icon_size), Image.Resampling.LANCZOS)
    
    # Create white circle / rounded background for the icon
    bg_circle = Image.new("RGBA", (icon_size + 24, icon_size + 24), (255, 255, 255, 255))
    pos_bg = ((qr_w - bg_circle.size[0]) // 2, (qr_h - bg_circle.size[1]) // 2)
    pos_icon = ((qr_w - icon_size) // 2, (qr_h - icon_size) // 2)
    
    qr_img.paste(bg_circle, pos_bg, bg_circle)
    qr_img.paste(bull, pos_icon, bull)

# Save standalone PNG on desktop
qr_img.save(qr_png_path, format="PNG")
print(f"QR PNG saved to: {qr_png_path}")

# 3. Create PDF Flyer / Display Stand
# Letter size: 612 x 792 pt (8.5 x 11 in)
c = canvas.Canvas(pdf_path, pagesize=letter)
width, height = letter

# Colors
C_BURGUNDY_DARK = HexColor("#380C12")
C_BURGUNDY = HexColor("#5B0E17")
C_GOLD = HexColor("#C5A059")
C_GOLD_LIGHT = HexColor("#E6D5AC")
C_CREAM = HexColor("#FAF6F0")
C_DARK = HexColor("#1F1C1D")
C_GRAY = HexColor("#666666")
C_WHITE = HexColor("#FFFFFF")

# --- Background ---
c.setFillColor(C_CREAM)
c.rect(0, 0, width, height, fill=True, stroke=False)

# Outer decorative border
margin = 24
c.setStrokeColor(C_BURGUNDY)
c.setLineWidth(2)
c.rect(margin, margin, width - 2 * margin, height - 2 * margin, fill=False, stroke=True)

# Inner fine gold border
c.setStrokeColor(C_GOLD)
c.setLineWidth(0.8)
c.rect(margin + 5, margin + 5, width - 2 * (margin + 5), height - 2 * (margin + 5), fill=False, stroke=True)

# --- Top Header Banner ---
banner_h = 135
c.setFillColor(C_BURGUNDY_DARK)
c.rect(margin + 5, height - margin - 5 - banner_h, width - 2 * (margin + 5), banner_h, fill=True, stroke=False)

# Gold accent line below header
c.setFillColor(C_GOLD)
c.rect(margin + 5, height - margin - 5 - banner_h, width - 2 * (margin + 5), 4, fill=True, stroke=False)

# Header Logo / Title
logo_transparent_path = os.path.abspath("public/brand/logo-transparent.png")
if os.path.exists(logo_transparent_path):
    # Draw logo centered in banner
    # Aspect ratio of logo-transparent: 1752 x 459 (~3.81:1)
    lw = 260
    lh = lw / (1752 / 459)
    lx = (width - lw) / 2
    ly = height - margin - 15 - lh - 10
    c.drawImage(logo_transparent_path, lx, ly, width=lw, height=lh, mask="auto")
else:
    c.setFillColor(C_WHITE)
    c.setFont("Helvetica-Bold", 32)
    c.drawCentredString(width / 2, height - margin - 50, "CANRES VIANDES")
    c.setFillColor(C_GOLD_LIGHT)
    c.setFont("Helvetica", 14)
    c.drawCentredString(width / 2, height - margin - 75, "Boucherie Artisanale & Charcuterie")

# Slogan in banner
c.setFillColor(C_GOLD_LIGHT)
c.setFont("Helvetica-Oblique", 11)
c.drawCentredString(width / 2, height - margin - 5 - banner_h + 18, "« La viande comme il faut » · Boucherie & Charcuterie d'Exception")

# --- Middle Section (Call to Action) ---
cta_y = height - margin - banner_h - 45
c.setFillColor(C_BURGUNDY)
c.setFont("Helvetica-Bold", 20)
c.drawCentredString(width / 2, cta_y, "¡VISITA NUESTRA TIENDA EN LÍNEA!")

c.setFillColor(C_DARK)
c.setFont("Helvetica", 12)
c.drawCentredString(width / 2, cta_y - 20, "Escanea el código con tu celular para explorar nuestro catálogo y hacer tu pedido")

# --- QR Code Container Box ---
qr_box_size = 280
qr_box_x = (width - qr_box_size) / 2
qr_box_y = cta_y - 45 - qr_box_size

# Box shadow/border effect
c.setFillColor(C_WHITE)
c.setStrokeColor(C_GOLD)
c.setLineWidth(1.5)
c.roundRect(qr_box_x, qr_box_y, qr_box_size, qr_box_size, 16, fill=True, stroke=True)

# Draw QR code inside box
qr_display_size = 244
qr_offset = (qr_box_size - qr_display_size) / 2
c.drawImage(qr_png_path, qr_box_x + qr_offset, qr_box_y + qr_offset, width=qr_display_size, height=qr_display_size)

# --- Domain Badge under QR ---
badge_w = 340
badge_h = 36
badge_x = (width - badge_w) / 2
badge_y = qr_box_y - 48

c.setFillColor(C_BURGUNDY)
c.roundRect(badge_x, badge_y, badge_w, badge_h, 8, fill=True, stroke=False)

c.setFillColor(C_WHITE)
c.setFont("Helvetica-Bold", 15)
c.drawCentredString(width / 2, badge_y + 11, "www.lavachecanres.com")

# --- Highlights / Value Props (3 pills/cards) ---
card_y = badge_y - 60
items = [
    ("🥩 Cortes Selectos", "Res AAA, Sterling & Cerdo"),
    ("🌭 Charcutería 100% Natural", "Recetas de autor sin aditivos"),
    ("🛵 Envíos a Domicilio", "Frescura garantizada en tu puerta"),
]

col_w = (width - 2 * margin - 30) / 3
for i, (title, sub) in enumerate(items):
    cx = margin + 15 + i * col_w
    c.setFillColor(HexColor("#F3ECE0"))
    c.roundRect(cx + 4, card_y - 12, col_w - 8, 48, 6, fill=True, stroke=False)
    
    c.setFillColor(C_BURGUNDY)
    c.setFont("Helvetica-Bold", 10)
    c.drawCentredString(cx + col_w / 2, card_y + 18, title)
    
    c.setFillColor(C_DARK)
    c.setFont("Helvetica", 8.5)
    c.drawCentredString(cx + col_w / 2, card_y + 5, sub)

# --- Footer Info ---
footer_y = margin + 28
c.setStrokeColor(C_GOLD_LIGHT)
c.setLineWidth(0.8)
c.line(margin + 30, footer_y + 35, width - margin - 30, footer_y + 35)

c.setFillColor(C_DARK)
c.setFont("Helvetica-Bold", 10)
c.drawCentredString(width / 2, footer_y + 18, "Atención y Pedidos Personalizados")

c.setFont("Helvetica", 9)
c.setFillColor(C_GRAY)
contact_text = "WhatsApp: +1 (514) 833-9822   |   Instagram: @lesviandescanres   |   Facebook: Les Viandes Canres"
c.drawCentredString(width / 2, footer_y + 4, contact_text)

# Save PDF
c.showPage()
c.save()

print(f"PDF Flyer successfully generated at: {pdf_path}")
