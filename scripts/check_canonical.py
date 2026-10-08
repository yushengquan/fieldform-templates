# -*- coding: utf-8 -*-
import urllib.request, re

BASE = "https://fieldformtemplates.com"
pages = [
    "/templates/plumbing-invoice-template/",
    "/templates/plumbing-invoice-template-word/",
    "/templates/plumbing-invoice-template-excel/",
    "/templates/locksmith-estimate-template/",
    "/templates/locksmith-estimate-template-word/",
]
for p in pages:
    try:
        req = urllib.request.Request(BASE + p, headers={"User-Agent": "Mozilla/5.0"})
        b = urllib.request.urlopen(req, timeout=20).read().decode("utf-8", "ignore")
        m = re.search(r'<link rel="canonical" href="([^"]+)"', b)
        print(p, "-> canonical:", m.group(1) if m else "MISSING")
    except Exception as e:
        print(p, "ERR", e)
