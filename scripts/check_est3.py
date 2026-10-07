# -*- coding: utf-8 -*-
import pymupdf, os

slugs = ["locksmith-estimate-template", "landscaping-estimate-template", "auto-detailing-estimate-template"]
base = os.path.join("public", "downloads")
ok = True
for s in slugs:
    p = os.path.join(base, s + ".pdf")
    if not os.path.exists(p):
        print(s, "MISSING")
        ok = False
        continue
    doc = pymupdf.open(p)
    text = doc[0].get_text()
    checks = []
    for token in ["SUBTOTAL", "DEPOSIT (25%)", "BALANCE DUE"]:
        checks.append(token in text)
    print(s, "->", checks, "| first page has %s" % ("all tokens" if all(checks) else "MISSING TOKEN"))
    if not all(checks):
        ok = False
print("ALL_OK" if ok else "FAIL")
