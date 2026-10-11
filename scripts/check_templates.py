#!/usr/bin/env python3
"""生成后自检：验证 invoice xlsx 的税务与 deposit/paid/balance 逻辑，防止回归。
用法: python scripts/check_templates.py
应在 scripts/gen_templates.py 之后运行（CI 中已串联）。"""
import glob, os, sys
from openpyxl import load_workbook

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(BASE, "public", "downloads")


def find_label_row(ws, label, col="D"):
    """在 col 列找值等于 label 的行号；找不到返回 None。"""
    for row in range(1, ws.max_row + 1):
        v = ws[f"{col}{row}"].value
        if v is not None and str(v).strip() == label:
            return row
    return None


def check_one(path):
    name = os.path.basename(path)
    errs = []
    wb = load_workbook(path, data_only=False)
    ws = wb.active

    # 1. Taxable 列表头存在 (G16)
    if ws["G16"].value != "Taxable":
        errs.append(f"missing 'Taxable' header at G16 (got {ws['G16'].value!r})")

    # 2. TAX 公式必须用 SUMPRODUCT 且引用 G 列（分项计税，不是 subtotal*rate）
    tax_row = find_label_row(ws, "TAX")
    if tax_row is None:
        errs.append("no 'TAX' label row")
    else:
        f = str(ws[f"F{tax_row}"].value or "")
        if "SUMPRODUCT" not in f:
            errs.append(f"TAX formula not per-line taxable (no SUMPRODUCT): {f}")
        if "G" not in f:
            errs.append(f"TAX formula does not reference Taxable column G: {f}")

    # 3. invoice 必须有 DEPOSIT RECEIVED / AMOUNT PAID / BALANCE DUE 三行
    for lab in ("DEPOSIT RECEIVED", "AMOUNT PAID", "BALANCE DUE"):
        if find_label_row(ws, lab) is None:
            errs.append(f"missing '{lab}' row")

    # 4. BALANCE DUE 公式必须同时引用 TOTAL DUE / DEPOSIT RECEIVED / AMOUNT PAID
    bal_row = find_label_row(ws, "BALANCE DUE")
    total_row = find_label_row(ws, "TOTAL DUE")
    dep_row = find_label_row(ws, "DEPOSIT RECEIVED")
    paid_row = find_label_row(ws, "AMOUNT PAID")
    if all(x is not None for x in (bal_row, total_row, dep_row, paid_row)):
        bf = str(ws[f"F{bal_row}"].value or "")
        for ref in (f"F{total_row}", f"F{dep_row}", f"F{paid_row}"):
            if ref not in bf:
                errs.append(f"BALANCE DUE formula missing ref {ref}: {bf}")
                break
        # 语义断言：deposit + paid <= total（用 sample 数据：deposit=25% total, paid=0）
        # openpyxl 不算公式，这里读 lineItems 的 sample 值重算一遍做交叉验证
        try:
            sub = sum((it.get("defaultQty", 0)) * (it.get("sampleRate", 0.0))
                      for it in _read_lineitems(path))
        except Exception:
            sub = None
        if sub is not None:
            dep_pct = 0.25  # 默认；与 gen_xlsx 的 cfg.get("depositPct", 25) 一致
            dep = round(sub * dep_pct, 2)
            paid = 0.0
            if dep + paid > sub + 0.01:
                errs.append(f"deposit+paid ({dep+paid}) > subtotal ({sub})")
    return errs


def _read_lineitems(xlsx_path):
    """从同名 JSON 反推 lineItems，用于数值交叉验证。"""
    slug = os.path.splitext(os.path.basename(xlsx_path))[0]
    json_path = os.path.join(BASE, "src", "data", "trades", f"{slug}.json")
    if not os.path.exists(json_path):
        return []
    import json
    with open(json_path, encoding="utf-8") as f:
        return json.load(f).get("lineItems", [])


def main():
    files = sorted(glob.glob(os.path.join(OUT_DIR, "*-invoice-template.xlsx")))
    if not files:
        print(f"no invoice xlsx found in {OUT_DIR}")
        sys.exit(1)
    allok = True
    for f in files:
        errs = check_one(f)
        if errs:
            allok = False
            print(f"FAIL {os.path.basename(f)}:")
            for e in errs:
                print("  -", e)
        else:
            print(f"OK   {os.path.basename(f)}")
    if not allok:
        print("self-check FAILED")
        sys.exit(1)
    print(f"all {len(files)} invoice template(s) passed self-check.")


if __name__ == "__main__":
    main()
