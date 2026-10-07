# -*- coding: utf-8 -*-
import urllib.request, re

req = urllib.request.Request("https://fieldformtemplates.com/templates/plumbing-invoice-template/", headers={"User-Agent": "Mozilla/5.0"})
b = urllib.request.urlopen(req, timeout=20).read().decode("utf-8", "ignore")
print("related section present:", "Related templates" in b)
links = re.findall(r'href="(/templates/[a-z0-9-]+/)"', b)
uniq = sorted(set(links))
print("template links on page:", len(uniq))
print(uniq)
