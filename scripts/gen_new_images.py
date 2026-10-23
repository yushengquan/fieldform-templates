#!/usr/bin/env python3
"""只为还没有 PNG 的 slug 生成 preview + OG 图(旧图已在 git 中,跳过覆盖)。
用法: python scripts/gen_new_images.py
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
ROOT = os.path.dirname(HERE)
TD = os.path.join(ROOT, "src", "data", "trades")

import gen_preview_images  # noqa: E402
import gen_og_images_all  # noqa: E402


def main():
    os.makedirs(gen_preview_images.OD, exist_ok=True)
    os.makedirs(gen_og_images_all.OUT_DIR, exist_ok=True)
    new_p, new_o = [], []
    for f in sorted(os.listdir(TD)):
        if not f.endswith(".json"):
            continue
        with open(os.path.join(TD, f), encoding="utf-8") as fh:
            tr = json.load(fh)
        slug = tr["slug"]
        prev = os.path.join(gen_preview_images.OD, slug + ".png")
        if not os.path.exists(prev):
            gen_preview_images.gen_one(tr)
            new_p.append(slug)
        ogp = os.path.join(gen_og_images_all.OUT_DIR, slug + ".png")
        if not os.path.exists(ogp):
            gen_og_images_all.gen_one(tr)
            new_o.append(slug)
    print("new previews:", new_p)
    print("new og images:", new_o)


if __name__ == "__main__":
    main()
