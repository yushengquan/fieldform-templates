# -*- coding: utf-8 -*-
import fitz, sys

files = ["tree-service-invoice-template", "pressure-washing-estimate-template", "carpenter-invoice-template"]
ok = True
for f in files:
    doc = fitz.open(f"public/downloads/{f}.pdf")
    t = doc[0].get_text()
    lines = [l.strip() for l in t.splitlines() if l.strip()]
    # 找金额行（含 $ 或 TOTAL/SUBTOTAL/BALANCE）
    hits = [l for l in lines if ("TOTAL" in l.upper() or "SUBTOTAL" in l.upper() or "BALANCE" in l.upper() or "DEPOSIT" in l.upper())]
    print(f, "->", hits[:3])
    if not hits:
        ok = False
print("ALL_OK" if ok else "CHECK_FAILED")
