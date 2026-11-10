#!/usr/bin/env python3
"""Downloads Skatteverket's official 2026 monthly tax tables and municipal tax rates into tax.json.
Public data only. Runs on GitHub, because the app has no server."""
import json,sys,urllib.request,pathlib,datetime
TABLES="https://www.skatteverket.se/download/18.1522bf3f19aea8075ba5af/1765287119989/allmanna-tabeller-manad.txt"
RATES="https://www.skatteverket.se/download/18.1522bf3f19aea8075ba428/1765291540367/skattesatser-kommuner-2026.txt"
UA={"User-Agent":"kronkoll-tax-job (public tax tables)"}
def get(u):
    with urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=60) as r:raw=r.read()
    for enc in("utf-8","cp1252","latin-1"):
        try:return raw.decode(enc)
        except UnicodeDecodeError:pass
def num(x):
    x=x.strip()
    return int(x) if x else 0
T={}
for line in get(TABLES).splitlines():
    if len(line)<49 or line[:2]!="30" or line[2] not in "B%":continue
    n=line[3:5].strip();lo=num(line[5:12]);hi=num(line[12:19])
    cols=[num(line[19+5*k:24+5*k]) for k in range(6)]
    T.setdefault(n,{"b":[],"p":[]})["b" if line[2]=="B" else "p"].append([lo,hi]+cols)
for v in T.values():
    v["b"].sort();v["p"].sort()
K={}
rows=get(RATES).splitlines()
head=rows[0].split("\t")
for r in rows[1:]:
    c=r.split("\t")
    if len(c)<10 or not c[0].strip().isdigit():continue
    kom=c[2].strip().title();fors=c[3].strip().title()
    ex=float(c[5].replace(",","."));inc=float(c[4].replace(",","."))
    K.setdefault(kom,{"ex":ex,"f":[]})["f"].append([fors,round(inc,3)])
if len(T)<10 or len(K)<250:
    print("unexpected data:",len(T),"tables,",len(K),"municipalities");sys.exit(1)
out={"year":2026,"fetched":datetime.date.today().isoformat(),"src":[TABLES,RATES],"t":T,
     "k":sorted([[k,v["ex"],sorted(v["f"])] for k,v in K.items()])}
p=pathlib.Path(__file__).resolve().parent.parent/"tax.json"
p.write_text(json.dumps(out,ensure_ascii=False,separators=(",",":")),encoding="utf-8")
print("tables",sorted(T),"rows",sum(len(v["b"])+len(v["p"]) for v in T.values()),"municipalities",len(K),"bytes",p.stat().st_size)
t32=T.get("32",{}).get("b",[]);print("check t32 20001:",[r for r in t32 if r[0]<=20100<=r[1]][:1])
