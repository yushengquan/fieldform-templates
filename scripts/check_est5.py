# -*- coding: utf-8 -*-
import pymupdf, os

checks = [
    ("window-cleaning-invoice-template", ["SUBTOTAL", "TOTAL DUE"]),
    ("mechanic-invoice-template", ["SUBTOTAL", "TOTAL DUE"]),
    ("appliance-repair-invoice-template", ["SUBTOTAL", "TOTAL DUE"]),
]
base = os.path.join("public", "downloads")
ok = True
for s, tokens in checks:
    p = os.path.join(base, s + ".pdf")
    if not os.path.exists(p):
        print(s, "MISSING")
        ok = False
        continue
    doc = pymupdf.open(p)
    text = doc[0].get_text()
    res = [t in text for t in tokens]
    print(s, "->", res, "| all ok" if all(res) else "MISSING TOKEN")
    if not all(res):
        ok = False
print("ALL_OK" if ok else "FAIL")
