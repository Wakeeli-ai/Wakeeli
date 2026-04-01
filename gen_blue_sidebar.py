from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1800, 550
SIDEBAR_W = 200
CELL_W = W // 3
CELL_H = H
NAV_ITEMS = ["Dashboard", "Leads", "Conversations", "Listings", "Tours", "Agents", "Analytics", "Settings"]

options = [
    {"name": "A. Brand Blue (#2563EB)", "bg": "#2563EB", "text": "#FFFFFF", "dim": "#BFDBFE", "active_bg": "#1D4ED8", "logo_style": "white_icon"},
    {"name": "B. Deep Blue (#1E40AF)", "bg": "#1E40AF", "text": "#FFFFFF", "dim": "#93C5FD", "active_bg": "#1E3A8A", "logo_style": "white_icon"},
    {"name": "C. Navy Blue (#1E3A8A)", "bg": "#1E3A8A", "text": "#FFFFFF", "dim": "#93C5FD", "active_bg": "#172554", "logo_style": "white_icon"},
]

base = "/home/claw/claudeclaw/workspace/"

# Load the icon logo (transparent bg version)
icon_logo = None
try:
    icon_logo = Image.open(os.path.join(base, "uploads/1775071742515_IMG_0282_bg_removed.png.png")).convert("RGBA")
except:
    pass

img = Image.new("RGB", (W, H), "#F1F5F9")
draw = ImageDraw.Draw(img)

try:
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 13)
    font_bold = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 13)
    font_label = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 16)
    font_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 12)
except:
    font = ImageFont.load_default()
    font_bold = font
    font_label = font
    font_title = font

for i, opt in enumerate(options):
    col = i % 3
    x0 = col * CELL_W
    y0 = 0

    # Label background
    draw.rectangle([x0+8, y0+8, x0+CELL_W-8, y0+36], fill="#FFFFFF")
    draw.text((x0+16, y0+12), opt["name"], fill="#334155", font=font_label)

    # Sidebar area
    sx0 = x0 + 8
    sy0 = y0 + 40
    sx1 = sx0 + SIDEBAR_W
    sy1 = y0 + CELL_H - 8

    draw.rectangle([sx0, sy0, sx1, sy1], fill=opt["bg"])

    # Content area
    draw.rectangle([sx1, sy0, x0+CELL_W-8, sy1], fill="#F8FAFC")
    draw.rectangle([sx1, sy0, x0+CELL_W-8, sy1], outline="#E2E8F0")

    # Logo area: white icon on the blue bg
    if icon_logo:
        # Create a white version by making a white square and using icon as mask concept
        # Actually let's just draw a white rounded rect with the maroon icon inside
        logo_size = 50
        logo = icon_logo.resize((logo_size, logo_size), Image.LANCZOS)
        logo_x = sx0 + (SIDEBAR_W - logo_size) // 2
        logo_y = sy0 + 14

        # Draw a white circle behind the logo
        circle_r = 30
        circle_cx = logo_x + logo_size // 2
        circle_cy = logo_y + logo_size // 2
        draw.ellipse([circle_cx - circle_r, circle_cy - circle_r, circle_cx + circle_r, circle_cy + circle_r], fill="#FFFFFF")

        # Paste logo on top
        img.paste(logo, (logo_x, logo_y), logo)

    # "Wakeeli" text under logo
    draw.text((sx0 + SIDEBAR_W//2 - 25, sy0 + 72), "Wakeeli", fill="#FFFFFF", font=font_bold)

    # Divider line
    div_y = sy0 + 92
    draw.line([(sx0+16, div_y), (sx1-16, div_y)], fill=opt["active_bg"], width=1)

    # Nav items
    nav_y = sy0 + 100
    for j, item in enumerate(NAV_ITEMS):
        item_y = nav_y + j * 30
        if j == 0:  # active
            draw.rectangle([sx0+8, item_y, sx1-8, item_y+26], fill=opt["active_bg"])
            # White left accent bar
            draw.rectangle([sx0+8, item_y, sx0+11, item_y+26], fill="#FFFFFF")
            draw.text((sx0+20, item_y+6), item, fill=opt["text"], font=font_bold)
        else:
            draw.text((sx0+20, item_y+6), item, fill=opt["dim"], font=font)

    # Logout at bottom
    draw.text((sx0+20, sy1-28), "Logout", fill=opt["dim"], font=font)

out_path = os.path.join(base, "Wakeeli/sidebar_blue_options.png")
img.save(out_path, "PNG")
print(f"Saved to {out_path}")
