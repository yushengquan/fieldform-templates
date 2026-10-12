#!/usr/bin/env python3
"""Add synonym/long-tail FAQs to high-impression templates based on GSC data."""
import json
from pathlib import Path

TRADES_DIR = Path("src/data/trades")

PATCHES = {
    "pest-control-invoice-template": [
        {"q": "Is there a pest control invoice form I can print?",
         "a": "Yes. This pest control invoice form is free to download as a PDF - print it and fill it in by hand, or use the Word or Excel version to type your details before printing. The form includes fields for business name, license number, client and service address, line items, tax, and total due."},
        {"q": "Can I use this as a pest control receipt template?",
         "a": "Yes. After a treatment is paid, the same pest control invoice template doubles as a receipt - enter the treatment details, mark the payment as received, and print or email a copy to the client. The Excel version auto-calculates the total so the receipt amount is always correct."},
    ],
    "electrician-estimate-template": [
        {"q": "Is this the same as an electrical estimate template?",
         "a": "Yes. Electrical estimate template and electrician estimate template refer to the same document - a pre-filled estimate form for electrical work. This template includes common electrical line items (panel upgrade, receptacle installation, lighting, wiring) with spaces for quantity and rate so you can total the job cost before billing."},
    ],
    "electrician-invoice-template": [
        {"q": "Where can I find an electrician invoice example?",
         "a": "This template is a ready-to-use electrician invoice example - it comes pre-filled with sample line items (service call, receptacle installation, panel work, lighting) at typical rates. Download the Excel version to see the auto-calculating subtotal, tax, and total, then replace the sample items with your own."},
        {"q": "Do you have an electrical invoice form template?",
         "a": "Yes. This electrical invoice form template is free to download as PDF, Word, or Excel. The form includes fields for business name, license number, client address, line items, tax, and total due - everything required on an electrical contractor invoice."},
    ],
    "hvac-invoice-template": [
        {"q": "Do you have an HVAC invoice example I can see?",
         "a": "Yes. This HVAC invoice template comes pre-filled with sample line items (service call, AC tune-up, capacitor replacement, refrigerant recharge) at typical rates - use it as an example to see how a completed HVAC invoice should look, then replace the sample items with your own."},
        {"q": "Is there an HVAC invoice form for service calls?",
         "a": "Yes. This HVAC invoice form includes fields for service call fees, parts, labor, and warranty notes. Download as PDF to print and fill by hand, or use the Excel version to auto-calculate tax and totals before sending to the client."},
    ],
    "hvac-estimate-template": [
        {"q": "Can I use this as an HVAC quote template?",
         "a": "Yes. An HVAC quote and an HVAC estimate are the same document - a written price for proposed work before the job starts. This template includes common HVAC line items (installation, equipment, labor, permits) and is valid as a quote. Enter your quantities and rates, total the job, and present it to the client for approval."},
        {"q": "Is this suitable as an HVAC price list template?",
         "a": "Yes. The line-item structure of this HVAC estimate template works as a price list - list each service (tune-up, capacitor, refrigerant, installation) with its unit price. Clients can see exactly what each item costs. Use the Excel version so prices auto-total when quantities are entered."},
    ],
    "plumbing-invoice-template": [
        {"q": "Where can I find a plumbing invoice sample?",
         "a": "This template is a ready-to-use plumbing invoice sample - it comes pre-filled with common plumbing line items (service call, drain cleaning, faucet install, pipe repair, water heater) at typical rates. Download the Excel version to see the auto-calculating subtotal, tax, and total, then replace the sample items with your own."},
    ],
    "photographer-invoice-template": [
        {"q": "Where can I find a photographer invoice example?",
         "a": "This template is a ready-to-use photographer invoice example - it comes pre-filled with sample line items (session fee, editing, prints, travel, album) at typical rates. Download the Excel version to see the auto-calculating subtotal, tax, and total, then replace the sample items with your own."},
        {"q": "Is there a photography invoice sample I can download?",
         "a": "Yes. This photography invoice sample is free to download as PDF, Word, or Excel - no email required. It includes fields for session date, package details, print costs, and payment terms, so you can bill clients professionally for photography work."},
    ],
    "locksmith-invoice-template": [
        {"q": "Do you have a free locksmith invoice I can download?",
         "a": "Yes. This locksmith invoice template is free to download as PDF, Word, or Excel - no email required. It includes pre-filled line items for lockout service, key cutting, rekeying, lock installation, and automotive keys, with fields for your business name and license number."},
    ],
    "auto-detailing-invoice-template": [
        {"q": "Is this the same as a car detailing invoice template?",
         "a": "Yes. Car detailing invoice and auto detailing invoice refer to the same document. This template includes pre-filled line items for exterior wash, interior detail, wax, ceramic coating, and engine bay cleaning - use it for any car or auto detailing service."},
    ],
    "general-contractor-estimate-template": [
        {"q": "Is this a contractor estimate form or a full estimate template?",
         "a": "It is both. This contractor estimate form works as a quick one-page estimate or a detailed multi-line template - it includes fields for labor, materials, permits, and subcontractor costs. Download as PDF for a printable form, or Excel for auto-calculating totals. No email required."},
    ],
    "painter-estimate-template": [
        {"q": "Is this an estimate request form for painting companies?",
         "a": "Yes. This painting estimate template works as an estimate request form for painting companies - it includes fields for surface area, number of coats, prep work, paint type, and labor. Enter your quantities and rates, and the Excel version auto-calculates the total estimated cost for the client."},
        {"q": "Are these painting estimate templates free to download?",
         "a": "Yes. All painting estimate templates on this site are free to download as PDF, Word, or Excel - no email required. Choose the format that fits your workflow and start estimating paint jobs today."},
    ],
}


def main():
    changed = []
    for slug, new_faqs in PATCHES.items():
        fpath = TRADES_DIR / f"{slug}.json"
        if not fpath.exists():
            print(f"  SKIP {slug} (file not found)")
            continue
        data = json.loads(fpath.read_text(encoding="utf-8"))
        existing_qs = {f["q"] for f in data.get("faqs", [])}
        added = 0
        for faq in new_faqs:
            if faq["q"] not in existing_qs:
                data["faqs"].insert(-1, faq)  # insert before last (legal disclaimer FAQ)
                added += 1
        if added:
            fpath.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
            changed.append(f"{slug} (+{added})")
            print(f"  UPDATED {slug}: +{added} FAQ(s)")
        else:
            print(f"  SKIP {slug} (all FAQs already present)")
    print(f"\nDone. {len(changed)} files changed: {', '.join(changed)}")


if __name__ == "__main__":
    main()