# -*- coding: utf-8 -*-
"""全站健康检查：sitemap 所有 URL 返回 200 + 下载文件存在性抽查"""
import urllib.request, re, os, concurrent.futures

BASE = "https://fieldformtemplates.com"
UA = {"User-Agent": "Mozilla/5.0"}

def check_url(u):
    try:
        req = urllib.request.Request(u, headers=UA)
        r = urllib.request.urlopen(req, timeout=20)
        return (u, r.status)
    except Exception as e:
        return (u, f"ERR {e}")

# 1. sitemap 全量
req = urllib.request.Request(BASE + "/sitemap.xml", headers=UA)
body = urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "ignore")
urls = re.findall(r"<loc>(.*?)</loc>", body)
print("sitemap URLs:", len(urls))

bad = []
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:
    for u, st in ex.map(check_url, urls):
        if st != 200:
            bad.append((u, st))
print("non-200:", len(bad))
for u, st in bad[:20]:
    print("  BAD", st, u)

# 2. 下载文件存在性抽查（每模板 3 格式）
trades = os.listdir(os.path.join("src", "data", "trades"))
missing = []
for t in trades:
    slug = t.replace(".json", "")
    for ext in ["pdf", "docx", "xlsx"]:
        p = os.path.join("public", "downloads", slug + "." + ext)
        if not os.path.exists(p):
            missing.append(slug + "." + ext)
print("download files missing:", len(missing))
for m in missing[:20]:
    print("  MISSING", m)

print("HEALTH_CHECK_DONE" if not bad and not missing else "HEALTH_CHECK_ISSUES")
