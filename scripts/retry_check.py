# -*- coding: utf-8 -*-
import urllib.request, time

for attempt in range(3):
    try:
        req = urllib.request.Request("https://fieldformtemplates.com/templates/cleaning-invoice-template-word/", headers={"User-Agent": "Mozilla/5.0"})
        r = urllib.request.urlopen(req, timeout=20)
        print("attempt", attempt + 1, "->", r.status)
        break
    except Exception as e:
        print("attempt", attempt + 1, "->", type(e).__name__, e)
        time.sleep(3)
