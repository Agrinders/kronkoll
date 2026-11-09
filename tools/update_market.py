#!/usr/bin/env python3
"""Fetches public prices and rates and writes prices.json and market.json. Uses no personal data."""
import json,pathlib,time,urllib.parse,urllib.request,datetime,zoneinfo
R=pathlib.Path(__file__).resolve().parent.parent
UA={"User-Agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126 Safari/537.36","Accept":"application/json"}
TZ=zoneinfo.ZoneInfo("Europe/Stockholm");NOW=datetime.datetime.now(TZ)
START=time.time();MAX=330;seen=set()
def get(u):
    err=None
    for a in range(2):
        if time.time()-START>MAX:raise TimeoutError("out of time")
        for host in ("query1","query2"):
            url=u.replace("query1.",host+".").replace("query2.",host+".") if "finance.yahoo" in u else u
            try:
                with urllib.request.urlopen(urllib.request.Request(url,headers=UA),timeout=9) as r:return json.load(r)
            except Exception as e:
                err=e;k=url.split("/")[2]+" "+repr(e)[:120]
                if k not in seen:seen.add(k);print("first error:",k,flush=True)
            if "finance.yahoo" not in u:break
        time.sleep(1+a*2)
    raise err
def chart(sym):
    d=get("https://query1.finance.yahoo.com/v8/finance/chart/"+urllib.parse.quote(sym)+"?range=5d&interval=1d")["chart"]["result"][0];m=d["meta"]
    cl=[c for c in d["indicators"]["quote"][0]["close"] if c is not None];p=m["regularMarketPrice"]
    prev=(cl[-2] if len(cl)>1 and abs(cl[-1]-p)<p*1e-4 else cl[-1]) if cl else None
    return{"price":p,"prev":prev,"cur":m.get("currency","SEK"),"at":m.get("regularMarketTime")}
def fund(q):
    a=get("https://query2.finance.yahoo.com/v1/finance/search?quotesCount=6&newsCount=0&q="+urllib.parse.quote(q))
    word=q.split()[0].lower()
    for x in a.get("quotes",[]):
        n=(x.get("longname") or x.get("shortname") or "").lower()
        if x.get("quoteType")=="MUTUALFUND" and word in n and all(w.lower() in n for w in q.split()[1:2]):return x["symbol"]
    return None
def load(n,d):
    try:return json.loads((R/n).read_text(encoding="utf8"))
    except Exception:return d
cat=load("tools/catalog.json",{});old=load("prices.json",{"items":[]});oldm={x["id"]:x for x in old.get("items",[])}
fx={"SEK":1.0}
for c,s in [("USD","USDSEK=X"),("EUR","EURSEK=X"),("GBP","GBPSEK=X"),("NOK","NOKSEK=X"),("DKK","DKKSEK=X")]:
    try:fx[c]=chart(s)["price"]
    except Exception as e:print("fx fail",c,e);fx[c]=old.get("fx",{}).get(c)
items=[];ok=fail=0
def add(sym,name,typ):
    global ok,fail
    try:
        q=chart(sym);r=fx.get(q["cur"]);
        if q["cur"]=="GBp":r=fx.get("GBP")and fx["GBP"]/100
        if not r:raise ValueError("no fx "+q["cur"])
        items.append({"id":sym,"name":name,"type":typ,"cur":q["cur"],"price":round(q["price"]*r,4),"prev":round((q["prev"] or q["price"])*r,4),"at":q["at"]});ok+=1
    except Exception as e:
        fail+=1;print("fail",sym,e)
        if sym in oldm:items.append(oldm[sym])
    time.sleep(.25)
for s,n,t in cat.get("symbols",[]):
    if t!="skip":add(s,n,t)
    if ok==0 and fail>=4:print("source unreachable, stopping early",flush=True);break
for n in cat.get("funds",[]):
    try:s=fund(n)
    except Exception as e:print("search fail",n,e);s=None
    if s:add(s,n,"Fond")
    else:
        print("no fund",n);prev=[x for x in old.get("items",[]) if x["name"]==n]
        items.extend(prev)
print("ok",ok,"fail",fail,"fx",fx)
if ok==0:raise SystemExit("No prices fetched; keeping existing files.")
(R/"prices.json").write_text(json.dumps({"updated":NOW.isoformat(timespec="minutes"),"fx":fx,"items":items},ensure_ascii=False,separators=(",",":")),encoding="utf8")
# market.json: indices and the policy rate
M=load("market.json",None)
if M:
    se=lambda v,d=2:f"{v:,.{d}f}".replace(","," ").replace(".",",").replace(" "," ")
    D=f"{NOW.day} {['jan','feb','mar','apr','maj','jun','jul','aug','sep','okt','nov','dec'][NOW.month-1]}";E=f"{NOW.day} {NOW.strftime('%b')}"
    pct=lambda q:(("+" if q["price"]>=q["prev"] else "-")+se(abs(q["price"]/q["prev"]-1)*100)+" %") if q["prev"] else ""
    for nm,sym,d,chg in [("OMXS30","^OMX",2,1),("S&P 500","^GSPC",2,1),("Nasdaq Composite","^IXIC",2,1),("Guld (USD/uns)","GC=F",0,1),("USD/SEK","USDSEK=X",4,1)]:
        try:
            q=chart(sym);x=next(i for i in M["indices"] if i["name"]==nm);x["value"]=("ca " if sym=="GC=F" else "")+se(q["price"],d);x["change"]=pct(q) if chg else "";x["note_sv"]=f"Senaste kurs {D}";x["note_en"]=f"Latest price {E}"
        except Exception as e:print("index fail",nm,e)
    try:
        r=get("https://api.riksbank.se/swea/v1/Observations/Latest/SECBREPOEFF");v=se(float(r["value"]))+" %"
        if v!=M["eco"]["policy"]:M["eco"]["policy"]=v;M["eco"]["policy_note"]=[f"Enligt Riksbanken, gäller från {r['date']}.",f"According to the Riksbank, effective {r['date']}."]
    except Exception as e:print("riksbank fail",e)
    M["updated"]=NOW.isoformat(timespec="minutes")
    (R/"market.json").write_text(json.dumps(M,ensure_ascii=False,separators=(",",":")),encoding="utf8")
