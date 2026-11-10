function renderVersion(){const q=li(),c=CHANGELOG[0],arrow='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  $("n").innerHTML=`<div class="sheet"><div class="lbl">${t("verNow")}</div><div class="big">${c.v}</div><div class="lbl">${c.d}</div></div>`+CHANGELOG.map(r=>`<div class="sheet"><p class="head">${r===c?t("verNew"):t("ttlN")+" "+r.v}</p>${r===c?`<div class="lbl" style="margin-top:-6px">${t("ttlN")} ${r.v}</div>`:""}${r.i.map(x=>`<div class="vn"><b>${x[2][q]}</b><p>${x[3][q]}</p>${x[0]==="n"?"":`<button class="take" data-go="${x[0]}" data-to="${x[1]}">${t("takeMe")}${arrow}</button>`}</div>`).join("")}</div>`).join("")}
function renderSettings(){
  $("c_th").innerHTML=["auto","light","dark"].map(v=>`<button class="chip ${S.theme===v?"on":""}" data-th="${v}">${t(v)}</button>`).join("");
  $("c_tm").innerHTML=THEMES.map(x=>`<button class="opt tm ${S.theme===x[0]?"on":""}" data-th="${x[0]}"><u style="background:linear-gradient(135deg,${TCOL[x[0]].join(",")})"></u><span>${x[1+li()]}<small>${x[3+li()]}</small></span><i><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7"/></svg></i></button>`).join("");
  $("c_tg").innerHTML=[["1","on"],["0","off"]].map(([v,k])=>`<button class="chip ${(S.toasts?"1":"0")===v?"on":""}" data-tg="${v}">${t(k)}</button>`).join("");
  $("c_lg").innerHTML=[["sv","Svenska"],["en","English"]].map(([v,l])=>`<button class="chip ${S.lang===v?"on":""}" data-lang="${v}">${l}</button>`).join("");
  $("c_ck").innerHTML=[["1","on"],["0","off"]].map(([v,k])=>`<button class="chip ${(S.click?"1":"0")===v?"on":""}" data-ck="${v}">${t(k)}</button>`).join("");
  $("c_sn").innerHTML=[["1","on"],["0","off"]].map(([v,k])=>`<button class="chip ${(S.sound?"1":"0")===v?"on":""}" data-sn="${v}">${t(k)}</button>`).join("");
  $("c_mo").innerHTML=[["1","on"],["0","off"]].map(([v,k])=>`<button class="chip ${(S.motion?"1":"0")===v?"on":""}" data-mo="${v}">${t(k)}</button>`).join("");
  $("c_st").textContent=col?t("dStore"):t("dOff");renderRead();renderBk();
  $("h_c").innerHTML=(S.buf<2?`<div class="hint w">${t("hBufSet")}</div>`:"")+(S.lifePct<10?`<div class="hint w">${t("hLifeSet")}</div>`:"");
}
function applyTheme(){S.theme==="auto"?document.documentElement.removeAttribute("data-theme"):document.documentElement.setAttribute("data-theme",S.theme)}
const setF=(k,l)=>`<div class="set"><label for="f_${k}">${t(l)}</label><input id="f_${k}" type="number" inputmode="decimal" data-s="${k}" value="${S[k]}"></div>`;
function build(){
  $("set_in").innerHTML=setF("adults","fAdults")+setF("buf","bufF")+setF("lifePct","lifeF");
  buildSheet();buildGoals();
}
function applyLang(){document.documentElement.lang=S.lang;document.querySelectorAll("[data-i]").forEach(e=>{e.textContent=t(e.dataset.i)});document.querySelectorAll("[data-p]").forEach(e=>{e.placeholder=t(e.dataset.p)});$("reset").textContent=t("reset");build();render();if(typeof fitNav==="function")fitNav()}
function render(){guideDot();$("ttl").textContent=t("ttl"+tab.toUpperCase());renderHome();renderBudget();renderSaving();renderTax();renderResults();renderSubs();renderLoans();renderIsk();renderHist();renderBk();renderMarket();renderSettings();renderPay();renderVersion();renderHold();FX.sync(planCalc(nowMd()))}
function persist(){if(!col)return;later("plan",()=>col.doc("plan").set({iskV:S.iskV,iskIn:S.iskIn,iskP:S.iskP,taxKom:S.taxKom,taxKy:S.taxKy,taxFors:S.taxFors,taxCol:S.taxCol,zoom:S.zoom,hc:S.hc,lang:S.lang,saved:S.saved,buf:S.buf,lifePct:S.lifePct,adults:S.adults,taxT:S.taxT,taxPay:S.taxPay,taxPct:S.taxPct,taxMode:S.taxMode,payH:S.payH,payR:S.payR,theme:S.theme,toasts:S.toasts,motion:S.motion,sound:S.sound,click:S.click,recV:S.recV||0}).catch(()=>{}),150)}
const yrOpen=()=>$("yrs").classList.contains("on");
function closeYears(){$("yrs").classList.remove("on")}
addEventListener("scroll",()=>{if(yrOpen())closeYears()},{passive:true});
function openYears(anchor){const y0=NOW.getFullYear(),ys=new Set([P.y]);for(let y=y0-5;y<=y0+10;y++)ys.add(y);deps.map(d=>d.at).forEach(x=>x&&ys.add(new Date(x).getFullYear()));Object.keys(PM).forEach(k=>ys.add(+k.slice(0,4)));
  $("yr_list").innerHTML=[...ys].sort((a,b)=>b-a).map(y=>`<button class="${y===P.y?"on":""}" data-yr="${y}">${y}</button>`).join("");
  const a=anchor.getBoundingClientRect(),w=$("yrs").offsetWidth;$("yrs").style.left=Math.max(12,Math.min(innerWidth-w-12,a.left+a.width/2-w/2))+"px";$("yrs").style.top=(a.bottom+10)+"px";
  const on=$("yr_list").querySelector(".on");if(on)$("yr_list").scrollTop=on.offsetTop-$("yr_list").offsetTop-96;
  $("yrs").classList.add("on")}
function refreshMonth(){buildSheet();render()}
function go(x){$("ps").classList.remove("on");tab=x;if(x==="l")loadTax();if(x==="u")renderHist();if(x==="r")guideSeen();else guideDot();try{sessionStorage.setItem("kronkoll.tab",x)}catch(e){}closeYears();FX.tab(x);setTimeout(yearScroll,0);["h","b","s","a","v","r","m","l","u","n","c"].forEach(s=>$(s).classList.toggle("hide",s!==x));document.querySelectorAll("nav button,#drawer>button").forEach(b=>b.classList.toggle("on",b.dataset.go===x));$("drawer").classList.remove("on");$("scrim").classList.remove("on");$("ttl").textContent=t("ttl"+x.toUpperCase());window.scrollTo(0,0)}
$("menu").onclick=()=>{$("drawer").classList.add("on");$("scrim").classList.add("on")};$("scrim").onclick=()=>{$("drawer").classList.remove("on");$("scrim").classList.remove("on")};

document.addEventListener("input",e=>{const x=e.target;
  if(x.id==="l_h"||x.id==="l_r"){S[x.id==="l_h"?"payH":"payR"]=Math.max(0,parseA(x.value));persist();renderPay();return}
  if(x.id==="x_pay"){S.taxPay=Math.max(0,parseA(x.value));persist();renderTax();return}
  if(x.id==="x_pct"){S.taxPct=Math.min(100,Math.max(0,parseA(x.value)));persist();renderTax();return}
  if(x.dataset.gt){const g=G.find(z=>z.k===x.dataset.gt);if(g){g.t=Math.max(0,parseA(x.value));saveGoals();renderSaving()}return}
  if(x.dataset.gs){const g=G.find(z=>z.k===x.dataset.gs);if(g){g.s=Math.max(0,parseA(x.value));saveGoals();render()}return}
  if(x.dataset.goal){const g=G.find(z=>z.k===x.dataset.goal);if(g){g.n=x.value;saveGoals();buildSheet();render()}return}
  if(x.dataset.s){const k=x.dataset.s;S[k]=+x.value||0;if(["saved","buf","lifePct","adults"].includes(k))persist();render()}
  else if(x.dataset.rw){const rw=x.dataset.rw,f=x.dataset.f,v=f==="a"?Math.max(0,parseA(x.value)):x.value;
    if(x.dataset.rid){const r=ruleById(x.dataset.rid),k=mk(P.y,P.m);if(r){if(f==="n")r.n=v;else setForward(r,k,v);saveRule(r)}}
    else{const i=+x.dataset.ix;editMonth(md=>{if(md[rw][i])md[rw][i][f]=v})}render()}});
document.addEventListener("focusout",e=>{const x=e.target;if(x.id==="l_h"||x.id==="l_r"){setTimeout(renderPay,0);return}if(x.id==="x_pay"||x.id==="x_pct"){setTimeout(renderTax,0);return}if(x.dataset&&(x.dataset.gs||x.dataset.gt||(x.dataset.rw&&x.dataset.f==="a")))x.value=fmtA(parseA(x.value))});
let RS=null,RD=null,potPicked=false,SL=[],LO=[],HOLD=[],PRICES={items:[],updated:""},HS=null;
const signKr=v=>(v>=0?"+":"")+kr(v),fmtQ=v=>(+v||0).toLocaleString("sv-SE",{maximumFractionDigits:4}),fmtP=v=>(+v||0).toLocaleString("sv-SE",{maximumFractionDigits:2})+" kr";
const priceOf=x=>{if(x.ref){const i=PRICES.items.find(z=>z.id===x.ref);if(i)return i}return x.manual!=null?{price:x.manual,prev:x.manual}:null};
function holdTotals(){let val=0,day=0,cost=0,valC=0;HOLD.forEach(x=>{const q=priceOf(x);if(!q)return;const v=x.qty*q.price;val+=v;day+=x.qty*(q.price-(q.prev||q.price));if(x.cost){cost+=x.cost;valC+=v}});return{val,day,cost,gain:valC-cost}}
function renderHold(){const T1=holdTotals(),pc1=(a,b)=>b?" ("+(a>=0?"+":"")+(a/b*100).toLocaleString("sv-SE",{maximumFractionDigits:1})+" %)":"";
  const stamp=PRICES.updated?t("holdAt",new Date(PRICES.updated).toLocaleString(loc(),{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})):"";
  $("hd_top").innerHTML=HOLD.length?`<div class="big">${kr(T1.val)}</div><div class="hsum">${HOLD.some(x=>x.ref)?`<span>${t("holdToday")} <b class="${T1.day<0?"er":"ok"}">${signKr(T1.day)}${pc1(T1.day,T1.val-T1.day)}</b></span>`:""}${T1.cost?`<span>${t("holdGain")} <b class="${T1.gain<0?"er":"ok"}">${signKr(T1.gain)}${pc1(T1.gain,T1.cost)}</b></span>`:""}</div><div class="lbl" style="margin-top:4px">${stamp}</div>`:`<p class="note" style="margin-top:0">${t("holdEmpty")}</p>`;
  $("hd_list").innerHTML=[...HOLD].sort((a,b)=>{const v=x=>{const q=priceOf(x);return q?x.qty*q.price:0};return v(b)-v(a)}).map(x=>{const q=priceOf(x),ch=q&&q.prev?(q.price/q.prev-1)*100:0;return `<button class="hd" data-hold="${esc(x.id)}"><b>${esc(x.name)}</b><span class="v">${q?kr(x.qty*q.price):"–"}</span><small>${q?t("holdOf",fmtQ(x.qty),fmtP(q.price)):t("holdNo")}${x.ref?"":" · "+t("holdMan")}</small><span class="c ${ch<0?"er":ch>0?"ok":""}">${x.ref&&q?(ch>=0?"+":"−")+Math.abs(ch).toLocaleString("sv-SE",{maximumFractionDigits:2})+" %":""}</span></button>`}).join("");
  const sv=total();$("h_worth").classList.toggle("hide",!(HOLD.length||sv));$("h_wrows").innerHTML=[[t("worthSaved"),kr(sv)],[t("worthInv"),kr(T1.val)],[t("worthTot"),kr(sv+T1.val)]].map((r,i)=>`<div class="row"><span>${r[0]}</span><b>${r[1]}</b></div>`).join("")}
function hsResults(){const q=$("hs_q").value.trim().toLowerCase(),L=PRICES.items.filter(x=>x.type!=="Index"&&(!q||x.name.toLowerCase().includes(q)||x.id.toLowerCase().includes(q))).slice(0,q?20:8);$("hs_r").innerHTML=L.map(x=>`<button class="hr" data-hp="${esc(x.id)}"><span>${esc(x.name)}<small>${esc(x.type)}</small></span><span>${fmtP(x.price)}</span></button>`).join("")||`<p class="note">${t(PRICES.items.length?"hsNone":"hsNoFeed")}</p>`}
function hsShow(mode){$("hs_find").classList.toggle("hide",mode!=="find");$("hs_form").classList.toggle("hide",mode==="find");$("hs_mw").classList.toggle("hide",mode!=="man");$("hs_nm").parentElement.classList.toggle("hide",mode==="man");$("hs_ok").classList.toggle("hide",mode==="find");if(mode==="find"){hsResults();$("hs_q").focus()}}
function openHS(id){const x=id?HOLD.find(z=>z.id===id):null;HS={id:x?x.id:null,ref:x?x.ref:"",name:x?x.name:""};$("hs_t").textContent=t(x?"hsEdit":"hsNew");$("hs_q").value="";$("hs_qty").value=x?fmtQ(x.qty):"";$("hs_cost").value=x&&x.cost?fmtA(x.cost):"";$("hs_name").value=x&&!x.ref?x.name:"";$("hs_price").value=x&&x.manual!=null?fmtQ(x.manual):"";$("hs_nm").textContent=x?x.name:"";$("hs_del").classList.toggle("hide",!x);$("hs").classList.add("on");hsShow(x?(x.ref?"pick":"man"):"find")}
const closeHS=()=>{$("hs").classList.remove("on");HS=null};
$("hold_add").onclick=()=>openHS(null);$("hs_no").onclick=closeHS;$("hs").addEventListener("click",e=>{if(e.target===$("hs"))closeHS()});$("hs_q").addEventListener("input",hsResults);$("hs_man").onclick=()=>{HS.ref="";hsShow("man");$("hs_name").focus()};$("hs_chg").onclick=()=>hsShow("find");
$("hs_ok").onclick=()=>{if(!HS)return;const qty=parseA($("hs_qty").value),cost=parseA($("hs_cost").value),man=!HS.ref,name=man?$("hs_name").value.trim():HS.name,price=parseA($("hs_price").value);if(qty<=0||(man&&(!name||price<=0))){toast(t("tHoldNeed"));return}leaveExample();const id=HS.id||"h"+Date.now(),x={id,ref:HS.ref||"",name,qty,cost:cost>0?cost:0,...(man?{manual:price}:{})},i=HOLD.findIndex(z=>z.id===id);if(i>=0)HOLD[i]=x;else HOLD.push(x);if(col)col.doc("hold_"+id).set({kind:"hold",...x}).catch(()=>toast(t("tFail")));closeHS();render();toast(t("tHold",name))};
$("hs_del").onclick=()=>{if(!HS||!HS.id)return;const id=HS.id;HOLD=HOLD.filter(z=>z.id!==id);if(col)col.doc("hold_"+id).delete().catch(()=>{});closeHS();render();toast(t("tHoldDel"))};
