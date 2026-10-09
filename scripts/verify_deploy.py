# -*- coding: utf-8 -*-
import urllib.request, re, json

BASE = "https://fieldformtemplates.com"
pages = [
    "/templates/pest-control-estimate-template/",
    "/templates/pest-control-estimate-template-word/",
    "/templates/moving-company-invoice-template/",
    "/templates/moving-company-invoice-template-excel/",
    "/templates/general-contractor-invoice-template/",
    "/templates/general-contractor-invoice-template-word/",
    "/sitemap.xml",
]
allok = True
for p in pages:
    try:
        req = urllib.request.Request(BASE + p, headers={"User-Agent": "Mozilla/5.0"})
        r = urllib.request.urlopen(req, timeout=20)
        print(r.status, p)
        if r.status != 200:
            allok = False
    except Exception as e:
        print("ERR", p, e)
        allok = False

# sitemap 计数
req = urllib.request.Request(BASE + "/sitemap.xml", headers={"User-Agent": "Mozilla/5.0"})
body = urllib.request.urlopen(req, timeout=20).read().decode("utf-8", "ignore")
urls = re.findall(r"<loc>(.*?)</loc>", body)
print("SITEMAP_URL_COUNT:", len(urls))
# 检查新页在 sitemap
for slug in ["pest-control-estimate-template", "moving-company-invoice-template", "general-contractor-invoice-template"]:
    print(slug, "in sitemap:", any(slug in u for u in urls))
print("ALL_OK" if allok else "SOME_FAILED")
