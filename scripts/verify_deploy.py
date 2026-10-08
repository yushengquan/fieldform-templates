# -*- coding: utf-8 -*-
import urllib.request, re, json

BASE = "https://fieldformtemplates.com"
pages = [
    "/templates/locksmith-estimate-template/",
    "/templates/locksmith-estimate-template-word/",
    "/templates/landscaping-estimate-template/",
    "/templates/landscaping-estimate-template-excel/",
    "/templates/auto-detailing-estimate-template/",
    "/templates/auto-detailing-estimate-template-word/",
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
for slug in ["locksmith-estimate-template", "landscaping-estimate-template", "auto-detailing-estimate-template"]:
    print(slug, "in sitemap:", any(slug in u for u in urls))
print("ALL_OK" if allok else "SOME_FAILED")
