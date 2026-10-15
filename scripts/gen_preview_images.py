#!/usr/bin/env python3
"""Generate document-style preview images (1000x1280 + 2x) for each trade."""
from PIL import Image, ImageDraw, ImageFont
import json, os, glob as g

W,H=1000,1280; SURF=(246,248,250); PAPER=(255,255,255)
INK=(22,40,59); MUTED=(110,124,140); BLUE=(22,104,212); LINE=(228,232,238); GOLD=(255,215,0)
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TD=os.path.join(ROOT,"src","data","trades"); OD=os.path.join(ROOT,"public","previews")

def F(s,b=False):
    for n in (["arialbd.ttf","DejaVuSans-Bold.ttf"] if b else ["arial.ttf","DejaVuSans.ttf"]):
        try: return ImageFont.truetype(n,s)
        except: pass
    return ImageFont.load_default()

def M(n): return "$"+f"{n:.2f}"
def tc(d,t,f,mw):
    if d.textlength(t,font=f)<=mw: return t
    while t and d.textlength(t+"\u2026",font=f)>mw: t=t[:-1]
    return (t+"\u2026") if t else "\u2026"
def rt(d,x,y,t,f,c): d.text((x-d.textlength(t,font=f),y),t,fill=c,font=f)

def gen_one(tr):
    slug=tr["slug"]; title=tr["title"]; dt=tr.get("docType","invoice")
    isest=dt in ("estimate","quote"); items=tr.get("lineItems",[])[:6]
    sub=0; rows=[]
    for it in items:
        q=it.get("defaultQty",0) or 0; r=it.get("sampleRate",0) or 0; a=q*r; sub+=a
        rows.append((it.get("description",""),str(q),it.get("unit","each"),M(r),M(a)))
    img=Image.new("RGB",(W,H),SURF); d=ImageDraw.Draw(img)
    ft=F(36,True); fl=F(15,True); fb=F(17); fs=F(14); fth=F(14,True); ftd=F(15)
    px,py,pw,ph=60,60,W-120,H-120
    d.rounded_rectangle((px-4,py-4,px+pw+4,py+ph+4),radius=14,fill=(220,226,234))
    d.rounded_rectangle((px,py,px+pw,py+ph),radius=12,fill=PAPER,outline=LINE,width=1)
    cx=px+40; cw=pw-80; y=py+36
    bc=GOLD if isest else BLUE
    d.rounded_rectangle((px,py,px+pw,py+10),radius=12,fill=bc); d.rectangle((px,py+5,px+pw,py+10),fill=bc)
    d.text((cx,y),title.upper(),fill=INK,font=ft); y+=52
    dl="ESTIMATE #  EST-0001" if isest else "INVOICE #  INV-0001"
    d.text((cx,y),dl,fill=MUTED,font=fl); rt(d,cx+cw,y,"Date  2025-01-15",fl,MUTED); y+=30
    cwi=(cw-30)//2
    d.text((cx,y),"FROM",fill=MUTED,font=fl); d.text((cx,y+22),"Your Business Name",fill=INK,font=fb)
    d.text((cx,y+44),"Street, City, State ZIP",fill=MUTED,font=fs); d.text((cx,y+62),"Phone | Email",fill=MUTED,font=fs)
    bxi=cx+cwi+30
    d.text((bxi,y),"BILL TO",fill=MUTED,font=fl); d.text((bxi,y+22),"Client Name",fill=INK,font=fb)
    d.text((bxi,y+44),"Client Address",fill=MUTED,font=fs); d.text((bxi,y+62),"Job Site Address",fill=MUTED,font=fs)
    y+=96; d.line((cx,y,cx+cw,y),fill=LINE,width=1); y+=20
    xn=cx; xd=cx+50; xq=cx+int(cw*0.58); xu=cx+int(cw*0.68); xr=cx+int(cw*0.80); xa=cx+cw
    for x,l in [(xn,"#"),(xd,"Description"),(xq,"Qty"),(xu,"Unit"),(xr,"Rate")]: d.text((x,y),l,fill=MUTED,font=fth)
    rt(d,xa,y,"Amount",fth,MUTED); y+=26; d.line((cx,y,cx+cw,y),fill=LINE,width=1); y+=10
    for i,(desc,qty,unit,rate,amt) in enumerate(rows,1):
        d.text((xn,y),str(i),fill=INK,font=ftd); d.text((xd,y),tc(d,desc,ftd,xq-xd-10),fill=INK,font=ftd)
        d.text((xq,y),qty,fill=INK,font=ftd); d.text((xu,y),tc(d,unit,ftd,xr-xu-6),fill=MUTED,font=ftd)
        rt(d,xr+50,y,rate,ftd,INK); rt(d,xa,y,amt,ftd,INK); y+=28; d.line((cx,y,cx+cw,y),fill=LINE,width=1); y+=4
    y+=16; tw=280; tx=xa-tw; d.line((tx,y,xa,y),fill=INK,width=2); y+=12
    d.text((tx,y),"SUBTOTAL",fill=INK,font=ftd); rt(d,xa,y,M(sub),ftd,INK); y+=28
    if isest:
        d.text((tx,y),"DEPOSIT (25%)",fill=MUTED,font=ftd); rt(d,xa,y,M(sub*0.25),ftd,INK); y+=28
        d.line((tx,y,xa,y),fill=INK,width=2); y+=8
        d.text((tx,y),"BALANCE DUE",fill=INK,font=F(16,True)); rt(d,xa,y,M(sub*0.75),ftd,INK)
    else:
        d.text((tx,y),"TAX (enter rate)",fill=MUTED,font=ftd); rt(d,xa,y,"—",ftd,MUTED); y+=28
        d.line((tx,y,xa,y),fill=INK,width=2); y+=8
        d.text((tx,y),"TOTAL DUE",fill=INK,font=F(16,True)); rt(d,xa,y,M(sub),ftd,INK)
    y+=40
    # Footer note
    note=tr.get("paymentTerms","Net 14")
    for ln in tc(d,note,fs,cw-20).split("\n"):
        d.text((cx,y),ln,fill=MUTED,font=fs); y+=20
    # Watermark
    wm="FieldForm Templates — Free download"
    rt(d,cx+cw,py+ph-30,wm,fs,MUTED)
    out1=os.path.join(OD,f"{slug}.png"); img.save(out1,"PNG",optimize=True)
    img2=img.resize((W*2,H*2),Image.LANCZOS); out2=os.path.join(OD,f"{slug}@2x.png"); img2.save(out2,"PNG",optimize=True)
    return out1

def main():
    os.makedirs(OD,exist_ok=True); n=0
    for f in sorted(g.glob(os.path.join(TD,"*.json"))):
        with open(f,encoding="utf-8") as fh: tr=json.load(fh)
        gen_one(tr); n+=1
    print(f"generated {n} preview images (1x+2x) in {OD}")

if __name__=="__main__": main()