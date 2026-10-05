# -*- coding: utf-8 -*-
import urllib.request

BASE = "https://fieldformtemplates.com"

def get(url, ua=None):
    req = urllib.request.Request(url, headers={"User-Agent": ua or "Mozilla/5.0"})
    try:
        r = urllib.request.urlopen(req, timeout=20)
        return r.status, r.read().decode("utf-8", "ignore")
    except Exception as e:
        return "ERR", str(e)

# 1. robots.txt
s, b = get(BASE + "/robots.txt")
print("== robots.txt:", s)
print(b[:500] if s == 200 else b)

# 2. 首页 meta robots / title
s, b = get(BASE + "/")
print("== homepage:", s)
import re
for m in re.findall(r'<meta[^>]*(robots|googlebot)[^>]*>', b, re.I):
    print("meta:", m)
t = re.search(r'<title>(.*?)</title>', b, re.I)
print("title:", t.group(1) if t else "NONE")

# 3. 一个模板页是否 noindex
s, b = get(BASE + "/templates/plumbing-invoice-template/")
print("== plumbing page:", s)
for m in re.findall(r'<meta[^>]*(robots|googlebot)[^>]*>', b, re.I):
    print("meta:", m)
print("has canonical:", 'rel="canonical"' in b)

# 4. Googlebot UA 请求（模拟 Google 爬虫）
s, b = get(BASE + "/templates/plumbing-invoice-template/", ua="Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)")
print("== googlebot fetch:", s)

# 5. sitemap 可抓
s, b = get(BASE + "/sitemap.xml")
print("== sitemap:", s, "bytes:", len(b))
