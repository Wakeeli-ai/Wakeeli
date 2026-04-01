from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1800, 1000
SIDEBAR_W = 200
CONTENT_W = 100
CELL_W = W // 3
CELL_H = H // 2
NAV_ITEMS = ["Dashboard", "Leads", "Conversations", "Listings", "Tours", "Agents", "Analytics", "Settings"]

options = [
    {"name": "1. Dark Maroon", "bg": "#2D1114", "text": "#FFFFFF", "dim": "#9E8A8C", "active_bg": "#4A2228", "logo": "uploads/1775071914158_Wakeeli_on_maroon_bg_.jpg"},
    {"name": "2. Clean White", "bg": "#FFFFFF", "text": "#1E293B", "dim": "#64748B", "active_bg": "#F1F5F9", "logo": "uploads/1775071742515_IMG_0282_bg_removed.png.png", "border": "#E2E8F0"},
    {"name": "3. Brand Red", "bg": "#B71C1C", "text": "#FFFFFF", "dim": "#FFCDD2", "active_bg": "#D32F2F", "logo": "uploads/1775071905471_Wakeeli_on_red_bg.jpg"},
    {"name": "4. Charcoal", "bg": "#1E293B", "text": "#FFFFFF", "dim": "#94A3B8", "active_bg": "#334155", "logo": "uploads/1775071914158_Wakeeli_on_maroon_bg_.jpg"},
    {"name": "5. Warm Cream", "bg": "#FDF6F0", "text": "#2D1114", "dim": "#6B5C50", "active_bg": "#F5EBE3", "logo": "uploads/1775071742515_IMG_0282_bg_removed.png.png", "border": "#E8DDD4"},
    {"name": "6. Deep Slate + Red", "bg": "#0F172A", "text": "#FFFFFF", "dim": "#64748B", "active_bg": "#3B1518", "logo": "uploads/1775071905471_Wakeeli_on_red_bg.jpg"},
]

base = "/home/claw/claudeclaw/workspace/"

img = Image.new("RGB", (W, H), "#F1F5F9")
draw = ImageDraw.Draw(img)

try:
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 13)
    font_bold = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 13)
    font_label = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 15)
except:
    font = ImageFont.load_default()
    font_bold = font
    font_label = font

for i, opt in enumerate(options):
    col = i % 3
    row = i // 3
    x0 = col * CELL_W
    y0 = row * CELL_H

    # Label background
    draw.rectangle([x0+8, y0+8, x0+CELL_W-8, y0+32], fill="#FFFFFF")
    draw.text((x0+16, y0+12), opt["name"], fill="#334155", font=font_label)

    # Sidebar area
    sx0 = x0 + 8
    sy0 = y0 + 36
    sx1 = sx0 + SIDEBAR_W
    sy1 = y0 + CELL_H - 8

    draw.rectangle([sx0, sy0, sx1, sy1], fill=opt["bg"])
    if "border" in opt:
        draw.line([(sx1, sy0), (sx1, sy1)], fill=opt["border"], width=1)

    # Content area (gray placeholder)
    draw.rectangle([sx1, sy0, x0+CELL_W-8, sy1], fill="#F8FAFC")
    draw.rectangle([sx1, sy0, x0+CELL_W-8, sy1], outline="#E2E8F0")

    # Logo
    try:
        logo = Image.open(os.path.join(base, opt["logo"]))
        logo = logo.resize((50, 50), Image.LANCZOS)
        logo_x = sx0 + (SIDEBAR_W - 50) // 2
        logo_y = sy0 + 12
        if opt["logo"].endswith(".png"):
            img.paste(logo, (logo_x, logo_y), logo if logo.mode == "RGBA" else None)
        else:
            img.paste(logo, (logo_x, logo_y))
    except Exception as e:
        draw.rectangle([sx0+75, sy0+12, sx0+125, sy0+62], fill="#888888")

    # Nav items
    nav_y = sy0 + 75
    for j, item in enumerate(NAV_ITEMS):
        item_y = nav_y + j * 28
        if j == 0:  # active
            draw.rectangle([sx0+8, item_y, sx1-8, item_y+24], fill=opt["active_bg"])
            draw.text((sx0+18, item_y+5), item, fill=opt["text"], font=font_bold)
        else:
            draw.text((sx0+18, item_y+5), item, fill=opt["dim"], font=font)

    # Logout at bottom
    draw.text((sx0+18, sy1-25), "Logout", fill=opt["dim"], font=font)

out_path = os.path.join(base, "Wakeeli/sidebar_options.png")
img.save(out_path, "PNG")
print(f"Saved to {out_path}")
