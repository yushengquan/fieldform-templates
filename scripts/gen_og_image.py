#!/usr/bin/env python3
"""生成 og-image.png (1200x630) 用于社交分享 / SERP 富摘要。"""
from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1200, 630
BG = (22, 104, 212)       # #1668D4 品牌蓝
BG2 = (14, 76, 110)       # 渐变深端
ACCENT = (255, 255, 255)
TEAL = (14, 124, 102)

img = Image.new("RGB", (W, H), BG)
draw = ImageDraw.Draw(img)

# 简单纵向渐变
for y in range(H):
    t = y / H
    r = int(BG[0] * (1 - t) + BG2[0] * t)
    g = int(BG[1] * (1 - t) + BG2[1] * t)
    b = int(BG[2] * (1 - t) + BG2[2] * t)
    draw.line([(0, y), (W, y)], fill=(r, g, b))

# 字体（用系统 Arial / DejaVu 兜底）
def font(size, bold=False):
    for name in ["arialbd.ttf" if bold else "arial.ttf",
                 "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf",
                 "Arial-Bold.ttf" if bold else "Arial.ttf"]:
        try:
            return ImageFont.truetype(name, size)
        except Exception:
            continue
    return ImageFont.load_default()

f_big = font(72, bold=True)
f_mid = font(40, bold=True)
f_small = font(28)

# 左上 logo 块
draw.rounded_rectangle((60, 60, 110, 110), radius=12, fill=(255, 255, 255))
draw.text((66, 66), "F", fill=BG, font=f_mid)

draw.text((130, 64), "FieldForm Templates", fill=(255, 255, 255), font=f_mid)

# 主标题
draw.text((60, 200), "Free Invoice & Estimate", fill=(255, 255, 255), font=f_big)
draw.text((60, 290), "Templates for Trades", fill=(255, 255, 255), font=f_big)

# 副标题
draw.text((60, 410), "Solar · Plumbing · HVAC · Concrete · Roofing · 50+ trades",
          fill=(220, 230, 245), font=f_small)
draw.text((60, 450), "Excel auto-calculates tax & totals. Download as PDF, Word, or Excel.",
          fill=(220, 230, 245), font=f_small)

# 右下角徽章
draw.rounded_rectangle((W - 320, H - 90, W - 60, H - 40), radius=10, fill=TEAL)
draw.text((W - 300, H - 82), "Free download — no email", fill=(255, 255, 255), font=f_small)

out = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "og-image.png")
img.save(out, "PNG", optimize=True)
print("saved", out, os.path.getsize(out), "bytes")