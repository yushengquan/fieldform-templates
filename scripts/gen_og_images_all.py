#!/usr/bin/env python3
"""给每个 trade 生成专属 OG image (1200x630)。
输出到 public/og/{slug}.png,页面通过 ogImage=/og/{slug}.png 引用。
"""
from PIL import Image, ImageDraw, ImageFont
import json, os

W, H = 1200, 630
BG = (22, 104, 212)
BG2 = (14, 76, 110)
TEAL = (14, 124, 102)
WHITE = (255, 255, 255)
LIGHT = (220, 230, 245)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TRADES_DIR = os.path.join(ROOT, "src", "data", "trades")
OUT_DIR = os.path.join(ROOT, "public", "og")


def font(size, bold=False):
    for name in ["arialbd.ttf" if bold else "arial.ttf",
                 "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf",
                 "Arial-Bold.ttf" if bold else "Arial.ttf"]:
        try:
            return ImageFont.truetype(name, size)
        except Exception:
            continue
    return ImageFont.load_default()


def make_bg():
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    for y in range(H):
        t = y / H
        r = int(BG[0] * (1 - t) + BG2[0] * t)
        g = int(BG[1] * (1 - t) + BG2[1] * t)
        b = int(BG[2] * (1 - t) + BG2[2] * t)
        draw.line([(0, y), (W, y)], fill=(r, g, b))
    return img, draw


def draw_doc_icon(img, draw, doc_type):
    """右侧画一个半透明文档图标。"""
    x0, y0 = 880, 170
    w, h = 240, 300
    overlay = Image.new("RGBA", (w + 20, h + 20), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.rounded_rectangle((10, 10, 10 + w, 10 + h), radius=18,
                         fill=(255, 255, 255, 38), outline=(255, 255, 255, 90), width=2)
    bar_color = (255, 215, 0, 230) if doc_type == "estimate" else (255, 255, 255, 230)
    od.rounded_rectangle((10, 10, 10 + w, 60), radius=18, fill=bar_color)
    od.rectangle((10, 40, 10 + w, 60), fill=bar_color)
    f_lbl = font(34, bold=True)
    lbl = "ESTIMATE" if doc_type == "estimate" else "INVOICE"
    od.text((40, 18), lbl, fill=(20, 60, 110, 255), font=f_lbl)
    for yy in [90, 130, 170, 210, 250]:
        od.rounded_rectangle((40, yy, 40 + 160, yy + 16), radius=4, fill=(255, 255, 255, 70))
        od.rounded_rectangle((210, yy, 210 + 30, yy + 16), radius=4, fill=(255, 255, 255, 100))
    img.paste(overlay, (x0, y0), overlay)


def wrap_title(draw, text, f_big, max_w):
    words = text.split()
    lines, cur = [], ""
    for w in words:
        test = (cur + " " + w).strip()
        if draw.textlength(test, font=f_big) <= max_w:
            cur = test
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def gen_one(trade):
    slug = trade["slug"]
    title = f"{trade['trade']} {trade['docType'].capitalize()} Template"
    img, draw = make_bg()
    f_big = font(64, bold=True)
    f_mid = font(40, bold=True)
    f_small = font(26)

    draw.rounded_rectangle((60, 60, 110, 110), radius=12, fill=WHITE)
    draw.text((66, 66), "F", fill=BG, font=f_mid)
    draw.text((130, 64), "FieldForm Templates", fill=WHITE, font=f_mid)

    lines = wrap_title(draw, title, f_big, 760)[:2]
    y = 210
    for ln in lines:
        draw.text((60, y), ln, fill=WHITE, font=f_big)
        y += 78

    y += 10
    draw.text((60, y), "Free download \u00b7 Excel \u00b7 Word \u00b7 PDF", fill=LIGHT, font=f_small)
    y += 38
    draw.text((60, y), "Auto-calculating tax & totals \u00b7 No email required", fill=LIGHT, font=f_small)

    draw_doc_icon(img, draw, trade["docType"])

    draw.rounded_rectangle((W - 340, H - 90, W - 60, H - 40), radius=10, fill=TEAL)
    draw.text((W - 320, H - 82), "Free \u2014 no email required", fill=WHITE, font=f_small)

    out = os.path.join(OUT_DIR, f"{slug}.png")
    img.save(out, "PNG", optimize=True)
    return out


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    files = sorted(glob.glob(os.path.join(TRADES_DIR, "*.json"))) if False else \
            sorted(__import__("glob").glob(os.path.join(TRADES_DIR, "*.json")))
    count = 0
    for f in files:
        with open(f, encoding="utf-8") as fh:
            trade = json.load(fh)
        out = gen_one(trade)
        count += 1
    print(f"generated {count} OG images in {OUT_DIR}")


if __name__ == "__main__":
    main()