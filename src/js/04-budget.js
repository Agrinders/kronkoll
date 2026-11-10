/* each month keeps its own lines; an empty month inherits the latest earlier one */
const defaults=()=>S.lang==="sv"?{inc:[["Lön 1",24000],["Lön 2",24000]],items:[["Hyra",9500],["El & internet",1100],["Telefon",500],["Försäkring",400],["Netflix & Spotify",400]],vars:[["Mat",8500],["Transport",1600],["Nöjen",1500]]}:{inc:[["Salary 1",24000],["Salary 2",24000]],items:[["Rent",9500],["Power & internet",1100],["Phone",500],["Insurance",400],["Netflix & Spotify",400]],vars:[["Food",8500],["Transport",1600],["Fun",1500]]};
const pair=a=>a.map(([n,x])=>({n,a:x}));
const mk=(y,m)=>y+"_"+String(m+1).padStart(2,"0");
const pmSel=()=>({y:P.y,m:P.m});
/* Repeating lines are rules that appear in every month they are due; one-time lines live in their own month. */
const RW=["inc","items","vars"];let RULES=[],exampleMode=false;
const defaultGoals=()=>[{k:"buf",n:""},{k:"goal",n:""},{k:"long",n:""}];let G=defaultGoals(),goalsDirty=false;
function saveGoals(){leaveExample();if(!col)return;goalsDirty=true;later("goals",()=>{goalsDirty=false;col.doc("goals").set({kind:"goals",list:G}).catch(()=>toast(t("tFail")))},150)}
const startKey=r=>{const[y,m]=r.date.split("-");return y+"_"+m};
function due(r,y,m){const k=mk(y,m),[sy,sm]=r.date.split("-").map(Number);if(k<startKey(r)||(r.end&&k>=r.end))return false;const n=y*12+m-(sy*12+sm-1);return r.freq==="m"||(r.freq==="q"?n%3===0:n%12===0)}
function amtOf(r,k){if((r.skip||[]).includes(k))return 0;if(r.over&&r.over[k]!=null)return r.over[k];let v=r.amts[0].a;r.amts.forEach(x=>{if(x.f<=k)v=x.a});return v}
function rawMonth(y,m){const k=mk(y,m);if(PM[k])return PM[k];const ks=Object.keys(PM).filter(x=>x<k&&Array.isArray(PM[x].split)).sort(),s=ks.length?PM[ks[ks.length-1]].split:null;return{inc:[],items:[],vars:[],...(s?{split:s.map(l=>({...l}))}:{})}}
function monthData(y,m){const k=mk(y,m),raw=rawMonth(y,m),v={};RW.forEach(t=>{v[t]=[...RULES.filter(r=>r.t===t&&due(r,y,m)).map(r=>({n:r.n,a:amtOf(r,k),rid:r.id,freq:r.freq,date:r.date,end:r.end,skip:(r.skip||[]).includes(k)})),...raw[t].map((x,i)=>({...x,ix:i}))]});v.y=y;v.m=m;return v}
const isoOf=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const defDate=()=>isNow()?isoOf(NOW):P.y+"-"+String(P.m+1).padStart(2,"0")+"-01";
const newId=()=>"r"+Date.now()+Math.floor(Math.random()*1e3);
function seedExample(){G=defaultGoals();const d=defaults(),s=isoOf(new Date(NOW.getFullYear(),NOW.getMonth(),1));RULES=[];[["inc",d.inc],["items",d.items],["vars",d.vars]].forEach(([t,a])=>a.forEach(([n,x],i)=>RULES.push({id:"ex"+t+i,t,n,freq:"m",date:s,ds:false,amts:[{f:"0",a:x}],end:null})));PM={};exampleMode=true}
const cur=()=>monthData(P.y,P.m),nowMd=()=>monthData(NOW.getFullYear(),NOW.getMonth());
const hasData=()=>!exampleMode;
const DIRTY=new Set(),PEND=new Map();
/* Saves are batched briefly while typing, and always written before the app closes or refreshes. */
function later(key,fn,ms){const old=PEND.get(key);if(old)clearTimeout(old.t);const e={fn,t:setTimeout(()=>{PEND.delete(key);fn()},ms)};PEND.set(key,e)}
function cancelSave(key){const e=PEND.get(key);if(e){clearTimeout(e.t);PEND.delete(key)}}
function flushSaves(){PEND.forEach(e=>{clearTimeout(e.t);e.fn()});PEND.clear()}
addEventListener("pagehide",flushSaves);addEventListener("beforeunload",flushSaves);document.addEventListener("visibilitychange",()=>{if(document.hidden)flushSaves()});
const pmDoc=k=>{const w=PM[k];return{kind:"pm",inc:w.inc,items:w.items,vars:w.vars,...(Array.isArray(w.split)?{split:w.split}:{})}};
const ruleDoc=r=>({kind:"rec",id:r.id,t:r.t,n:r.n,freq:r.freq,date:r.date,ds:!!r.ds,amts:r.amts,end:r.end||null,over:r.over||{},skip:r.skip||[]});
const DIRTYR=new Set();
function leaveExample(){if(!exampleMode)return;exampleMode=false;if(!col)return;histMute++;try{col.doc("started").set({kind:"started"}).catch(()=>{});RULES.forEach(r=>col.doc("rec_"+r.id).set(ruleDoc(r)).catch(()=>{}));Object.keys(PM).forEach(k=>col.doc("pm_"+k).set(pmDoc(k)).catch(()=>{}))}finally{histMute--}}
function editMonth(fn,y=P.y,m=P.m){leaveExample();const k=mk(y,m);if(!PM[k])PM[k]=rawMonth(y,m);fn(PM[k]);if(!col)return;DIRTY.add(k);later("m"+k,()=>{DIRTY.delete(k);if(PM[k])col.doc("pm_"+k).set(pmDoc(k)).catch(()=>toast(t("tFail")))},150)}
function saveRule(r){leaveExample();if(!col)return;DIRTYR.add(r.id);later("r"+r.id,()=>{DIRTYR.delete(r.id);col.doc("rec_"+r.id).set(ruleDoc(r)).catch(()=>toast(t("tFail")))},150)}
function dropRule(r){leaveExample();RULES=RULES.filter(x=>x!==r);DIRTYR.delete(r.id);cancelSave("r"+r.id);if(col)col.doc("rec_"+r.id).delete().catch(()=>{})}
function newRule(tp,n,a,freq,date,ds){const r={id:newId(),t:tp,n,freq,date,ds,amts:[{f:"0",a}],end:null};RULES.push(r);saveRule(r);return r}
function setForward(r,k,v){if(r.over)delete r.over[k];const e=r.amts.find(z=>z.f===k);if(e)e.a=v;else{r.amts.push({f:k,a:v});r.amts.sort((a,b)=>a.f<b.f?-1:1)}}
const nextKey=k=>{const[y,m]=k.split("_").map(Number),d=new Date(y,m,1);return mk(d.getFullYear(),d.getMonth())};
function ruleStop(r,k){if(startKey(r)>=k)dropRule(r);else{r.end=k;saveRule(r)}}
const ruleById=id=>RULES.find(r=>r.id===id);
function chip(r){const dt=s=>{const[y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d).toLocaleDateString(loc(),{day:"numeric",month:"short"})};if(r.skip)return t("chSkip",mn(P.m).toLowerCase());if(r.rid){const last=r.end?(()=>{const[y,m]=r.end.split("_").map(Number);return new Date(y,m-2,1).toLocaleDateString(loc(),{month:"short"})})():"";return "↻ "+t(r.freq==="m"?"fM":r.freq==="q"?"fQ":"fY")+(r.freq==="m"?"":" · "+dt(r.date))+(last?t("chLast",last):"")}return t("chO")+(r.d?" · "+dt(r.d):"")}
function upcoming(){const out=[],t0=new Date(NOW.getFullYear(),NOW.getMonth(),NOW.getDate()).getTime();for(let o=0;o<=13;o++){const d=new Date(NOW.getFullYear(),NOW.getMonth()+o,1),y=d.getFullYear(),m=d.getMonth(),k=mk(y,m);RULES.filter(r=>r.freq!=="m"&&due(r,y,m)&&!(r.skip||[]).includes(k)).forEach(r=>{const day=Math.min(+r.date.split("-")[2],new Date(y,m+1,0).getDate()),at=new Date(y,m,day).getTime();if(at>=t0&&!out.some(u=>u.id===r.id))out.push({id:r.id,at,n:r.n,a:amtOf(r,k),tp:r.t,f:r.freq})});if(PM[k])RW.forEach(tp=>PM[k][tp].forEach(x=>{if(x.d){const at=new Date(x.d+"T12:00:00").getTime();if(at>=t0)out.push({at,n:x.n,a:x.a,tp,f:"o"})}}))}return out.sort((a,b)=>a.at-b.at).slice(0,5)}
const POTS={buf:"aBuf",goal:"aGoal",long:"aLong"};
const rowName=l=>l.n||(POTS[l.k]?t(POTS[l.k]):"");
const potName=l=>rowName(l)||t("potOther");
function potIn(k,y,m){const a=new Date(y,m,1).getTime(),b=new Date(y,m+1,1).getTime();return deps.filter(d=>(d.pot||"")===k&&d.at>=a&&d.at<b).reduce((s,d)=>s+d.amount,0)}
function depTs(){const{y,m}=pmSel();return y===NOW.getFullYear()&&m===NOW.getMonth()?Date.now():new Date(y,m,1,12).getTime()}
const total=()=>S.saved+G.reduce((s,g)=>s+(g.s||0),0)+deps.reduce((s,d)=>s+d.amount,0);
function range(){return[new Date(P.y,P.m,1).getTime(),new Date(P.y,P.m+1,1).getTime()]}
const isNow=()=>P.y===NOW.getFullYear()&&P.m===NOW.getMonth();
const dayTs=v=>{if(!v)return Date.now();const x=new Date(v+"T12:00:00").getTime();return new Date(x).toDateString()===new Date().toDateString()?Date.now():x};
const fmtD=x=>new Date(x).toLocaleDateString(loc());
const mnavHtml=()=>`<div class="mnav"><button data-mv="-1" aria-label="‹">‹</button><b>${mn(P.m)} ${P.y}</b><button data-mv="1" aria-label="›">›</button></div>${isNow()?"":`<button class="now" data-now><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10.5h11a5 5 0 0 1 0 10H9"/><path d="M8.5 6 4 10.5 8.5 15"/></svg>${t("toMonth",mn(NOW.getMonth()).toLowerCase())}</button>`}`;

/* Saving is what was actually added that month. */
function bufHave(){const B=G.filter(g=>g.k==="buf"||/buffert|buffer/i.test(g.n||""));if(!B.length)return total();const keys=new Set(B.map(g=>g.k));return S.saved+B.reduce((s,g)=>s+(g.s||0),0)+deps.filter(d=>!d.pot||keys.has(d.pot)).reduce((s,d)=>s+d.amount,0)}
function planCalc(md){
  const inc=sum(md.inc),fixed=sum(md.items),vars=sum(md.vars),needs=fixed+vars,bal=total(),share=inc>0?needs/inc:1,lifeMin=inc*S.lifePct/100,target=S.buf*needs;
  const a0=new Date(md.y,md.m,1).getTime(),b0=new Date(md.y,md.m+1,1).getTime(),save=Math.max(0,deps.filter(d=>d.at>=a0&&d.at<b0).reduce((s,d)=>s+d.amount,0));
  const lines=G.map(g=>({k:g.k,n:g.n,a:Math.max(0,potIn(g.k,md.y,md.m))}));
  return{buf:bufHave(),inc,fixed,vars,needs,bal,share,save,life:inc-needs-save,lifeMin,target,lines};
}
/* What I would do with the same month: trim only food and subscriptions, aim for 20% saved, buffer before funds. */
function advise(md){
  const p=planCalc(md),all=[...md.items,...md.vars],food=sum(all.filter(i=>FOOD.test(i.n))),subs=sum(all.filter(i=>SUBS.test(i.n)&&!FOOD.test(i.n)));
  const foodRef=S.adults*R.food,foodTo=food>foodRef*1.1?Math.round(foodRef*1.1/100)*100:food,subsTo=subs>R.media?R.media:subs,other=p.needs-food-subs,needsTo=other+foodTo+subsTo;
  let saveTo=Math.max(0,Math.min(p.inc*.2,p.inc-needsTo-p.lifeMin));saveTo=Math.floor(saveTo/100)*100;saveTo=Math.max(saveTo,p.save);
  const lifeTo=p.inc-needsTo-saveTo,gap=Math.max(0,S.buf*needsTo-p.buf),bufTo=Math.min(saveTo,Math.ceil(gap)),fundTo=saveTo-bufTo,bufNow=sum(p.lines.filter(l=>l.k==="buf"));
  const F=[],credit=all.some(i=>CREDIT.test(i.n)&&!MORT.test(i.n)),mort=all.some(i=>MORT.test(i.n));
  const extra=Math.round(p.bal*(R.saveGood-R.saveBig));
  if(p.inc>0&&p.buf<p.target)F.push([t("fBufT"),t("fBuf",kr(p.buf),kr(p.target),S.buf)]);
  if(credit)F.push([t("fCredT"),t("fCred",MK.eco.policy)]);
  if(foodTo<food)F.push([t("fFoodT",kr(foodTo)),t("fFood",kr(food),kr(foodRef),S.adults)]);
  if(subsTo<subs)F.push([t("fSubsT"),t("fSubs",kr(subs),kr(R.media))]);
  if(mort)F.push([t("fLoanT"),t("fLoan")]);
  if(extra>=100)F.push([t("fRateT",kr(extra)),t("fRate")]);
  if(p.inc>0&&saveTo>0&&p.buf>=p.target)F.push([t("fIskT"),t("fIsk")]);
  if(saveTo>0)F.push([t("fSaveT"),t("fSave",kr(saveTo))]);
  F.push([t("fTalkT"),t("fTalk")]);
  return{p,food,foodTo,subs,subsTo,other,needsTo,saveTo,lifeTo,bufTo,fundTo,bufNow,F};
}
function spendOf(y,m){const p=planCalc(monthData(y,m));return{p,used:0,left:p.life}}

function renderHome(){
  const y=NOW.getFullYear(),m=NOW.getMonth(),s=spendOf(y,m),p=s.p,mName=mn(m).toLowerCase(),dim=new Date(y,m+1,0).getDate(),dl=Math.max(1,dim-NOW.getDate()+1),a=advise(monthData(y,m));
  $("h_lbl").textContent=t("leftIn",mName);$("h_big").textContent=kr(s.left);$("h_big").className="big"+(s.left<0?" er":"");
  $("h_day").textContent=s.left>=0?t("perDay",kr(s.left/dl),dl):t("overBy",kr(-s.left));
  const parts=[[p.fixed,"--c1","fixedL"],[p.vars,"--c4","varL"],[Math.max(0,p.life),"--c3","life"],[p.save,"--c2","saving"]];
  $("h_stack").innerHTML=parts.filter(x=>x[0]>0).map(x=>`<i style="flex:${x[0]} 0 0;background:var(${x[1]})" title="${t(x[2])}: ${kr(x[0])}"></i>`).join("");
  $("h_keys").innerHTML=parts.map(x=>`<span><span class="dot" style="background:var(${x[1]})"></span>${t(x[2])} <b>${kr(x[0])}</b></span>`).join("");
  const got=deps.filter(d=>{const x=new Date(d.at);return x.getFullYear()===y&&x.getMonth()===m}).reduce((v,d)=>v+d.amount,0);
  $("h_lines").innerHTML=[[t("in"),kr(p.inc)],[t("out"),kr(p.fixed)],[t("varOut"),kr(p.vars)],[t("savedIn",mName),kr(got)],[t("rem"),kr(p.life)]].map(r=>`<div class="row"><span>${r[0]}</span><b>${r[1]}</b></div>`).join("");
  const f=a.F[0];$("h_top").innerHTML=`<p class="head" style="margin-top:4px">${esc(f[0])}</p><p class="note">${esc(f[1])}</p>`;
  $("h_ex").classList.toggle("hide",hasData());
  const up=upcoming();$("h_next").classList.toggle("hide",!up.length);
  $("h_up").innerHTML=up.map(u=>`<div class="up"><span class="dt">${new Date(u.at).toLocaleDateString(loc(),{day:"numeric",month:"short"})}</span><span>${esc(u.n||"–")}<small>${t(u.f==="q"?"short":u.f==="y"?"yearly":"once")}</small></span><b class="${u.tp==="inc"?"ok":""}">${u.tp==="inc"?"+":""}${kr(u.a)}</b></div>`).join("");
  renderYear();
}
let HY=NOW.getFullYear(),SG="";
function yearData(y){return MNS[0].map((_,m)=>{const v=monthData(y,m);if(!v.inc.length&&!v.items.length&&!v.vars.length&&!PM[mk(y,m)])return null;return planCalc(v)})}
function renderYear(){
  const D=yearData(HY),nf=v=>Math.round(v).toLocaleString("sv-SE").replace("-","−"),tot=k=>D.reduce((s,p)=>s+(p?p[k]:0),0),I=tot("inc"),O=tot("needs"),Sv=tot("save"),L=tot("life"),isY=HY===NOW.getFullYear();
  $("y_t").textContent=t("yearT",HY);
  $("y_tiles").innerHTML=[[t("rem"),kr(L),L<0],[t("totOut"),kr(O)],[t("sRate"),I>0?pc(Sv/I):"–"],[t("totSave"),kr(Sv)]].map(r=>`<div class="tile"><span class="lbl">${r[0]}</span><b class="${r[2]?"er":""}">${r[1]}</b></div>`).join("");
  const mx=Math.max(1,...D.map(p=>p?Math.max(p.inc,p.needs+p.save):0)),H=WIDE.matches?160:94,cs=[["fixed","--c1","fixedL"],["vars","--c4","varL"],["life","--c3","life"],["save","--c2","saving"]];
  $("y_bars").innerHTML=D.map((p,m)=>`<button class="ymo ${isY&&m===NOW.getMonth()?"cur":""}" data-jump="${m}" aria-label="${mn(m)}" title="${p?mn(m)+": "+cs.map(c=>t(c[2])+" "+kr(Math.max(0,p[c[0]]))).join(", "):mn(m)}">${p?`<span class="st">${cs.filter(c=>p[c[0]]>0).map(c=>`<i style="height:${Math.max(2,Math.round(p[c[0]]/mx*H))}px;background:var(${c[1]})"></i>`).join("")}</span>`:'<span class="none"></span>'}${ms(m)[0]}</button>`).join("");
  $("y_keys").innerHTML=cs.map(c=>`<span><span class="dot" style="background:var(${c[1]})"></span>${t(c[2])}</span>`).join("");
  const row=(l,k,cl)=>`<tr class="${cl||""}"><td>${l}</td>${D.map(p=>`<td>${p?nf(p[k]):"–"}</td>`).join("")}<td class="tot">${nf(tot(k))}</td></tr>`;
  $("y_tbl").className=WIDE.matches?"":"ymini";
  if(!WIDE.matches)$("y_tbl").innerHTML=`<thead><tr><th>${t("moName")}</th><th>${t("moIn")}</th><th>${t("moOut")}</th><th>${t("moSave")}</th><th>${t("moLeft")}</th></tr></thead><tbody>`+D.map((p,m)=>p?`<tr class="${isY&&m===NOW.getMonth()?"cur":""}"><td>${ms(m)}</td><td>${nf(p.inc)}</td><td>${nf(p.needs)}</td><td>${nf(p.save)}</td><td class="${p.life<0?"er":""}">${nf(p.life)}</td></tr>`:"").join("")+`<tr class="tot"><td>${t("total")}</td><td>${nf(I)}</td><td>${nf(O)}</td><td>${nf(Sv)}</td><td>${nf(L)}</td></tr></tbody>`;
  else $("y_tbl").innerHTML=`<thead><tr><th>kr</th>${MNS[0].map((_,m)=>`<th class="${isY&&m===NOW.getMonth()?"cur":""}">${ms(m)}</th>`).join("")}<th>${t("total")}</th></tr></thead><tbody>`+row(t("in"),"inc")+row(t("out"),"fixed")+row(t("varOut"),"vars")+row(t("saving"),"save")+row(t("totOut"),"needs","sum")+row(t("rem"),"life","sum")+`<tr><td>${t("sRate")}</td>${D.map(p=>`<td>${p&&p.inc>0?pc(p.save/p.inc):"–"}</td>`).join("")}<td class="tot">${I>0?pc(Sv/I):"–"}</td></tr></tbody>`;
}
function yearScroll(){const sc=$("y_sc"),th=sc.querySelector("th.cur"),first=sc.querySelector("th");if(!sc.clientWidth)return;sc.scrollLeft=th?Math.max(0,th.offsetLeft-first.offsetWidth-120):0}
const fmtA=v=>Math.round(v)?Math.round(v).toLocaleString("sv-SE"):"",parseA=v=>+String(v).replace(/\s/g,"").replace(",",".")||0;
function rowHtml(rw,name,amt,i,extra,key){const k=key||`data-ix="${i}"`,ph=t("linePh");return `<div class="lnw"><div class="ln"><input class="nm" type="text" id="${rw}_n${i}" data-rw="${rw}" data-f="n" ${k} value="${esc(name)}" maxlength="40" placeholder="${ph}" aria-label="${ph}"><span class="amw"><input class="am" type="text" inputmode="decimal" id="${rw}_a${i}" data-rw="${rw}" data-f="a" ${k} value="${fmtA(amt)}" placeholder="0" aria-label="kr"><span>kr</span></span><button class="x" data-delrw="${rw}" ${k} aria-label="${t("del")}"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 2.5l7 7M9.5 2.5l-7 7"/></svg></button></div>${extra||""}<div class="subslot"></div></div>`}
function buildSheet(){const md=cur();
  RW.forEach(rw=>{$("l_"+rw).innerHTML=md[rw].map((r,i)=>{const key=r.rid?`data-rid="${r.rid}"`:`data-ix="${r.ix}"`;return rowHtml(rw,r.n,r.a,i,`<button class="freq ${r.skip?"skip":r.rid?"on":""}" ${r.skip?`data-rdel="${r.rid}"`:`data-rs="${rw}"`} ${key}>${esc(chip(r))}</button>`,key)}).join("");md[rw].forEach((r,i)=>{if(r.skip)$(rw+"_a"+i).readOnly=true})});document.querySelectorAll("#b .lnw").forEach(subHintFor)}
function buildGoals(){$("s_goals").innerHTML=G.map(g=>`<div class="lnw"><div class="ln g"><input class="nm" type="text" id="goal_${g.k}" data-goal="${g.k}" value="${esc(rowName(g))}" maxlength="40" placeholder="${t("goalPh")}" aria-label="${t("goalPh")}"><button class="x" data-gdel="${g.k}" aria-label="${t("del")}"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 2.5l7 7M9.5 2.5l-7 7"/></svg></button></div><div class="gs"><label for="gs_${g.k}">${t("fSaved")}</label><span class="amw"><input class="am" type="text" inputmode="decimal" id="gs_${g.k}" data-gs="${g.k}" value="${fmtA(g.s||0)}" placeholder="0"><span>kr</span></span></div><div class="gs"><label for="gt_${g.k}">${t("gTarget")}</label><span class="amw"><input class="am" type="text" inputmode="decimal" id="gt_${g.k}" data-gt="${g.k}" value="${fmtA(g.t||0)}" placeholder="${g.k==="buf"?fmtA(planCalc(nowMd()).target)||"0":"0"}"><span>kr</span></span></div></div>`).join("")}
function renderBudget(){
  const p=planCalc(cur()),ae=document.activeElement;
  $("b_per").innerHTML=mnavHtml();$("sum_inc").textContent=kr(p.inc);$("sum_out").textContent=kr(p.fixed);$("sum_var").textContent=kr(p.vars);
  const sp=spendOf(P.y,P.m);$("b_spent").textContent=kr(p.needs+sp.used);$("b_life").textContent=kr(sp.left);$("b_life").className=sp.left<0?"er":"";
  const sel=$("s_pot");if(ae!==sel){const prev=sel.value;sel.innerHTML=p.lines.map(l=>`<option value="${esc(l.k)}">${esc(potName(l))}</option>`).join("")+`<option value="">${t("potOther")}</option>`;if(potPicked&&[...sel.options].some(o=>o.value===prev))sel.value=prev}
  sel.setAttribute("aria-label",t("potHead"));$("s_pot_t").textContent=sel.selectedOptions[0]?sel.selectedOptions[0].text:"";
}
function renderSaving(){
  const pNow=planCalc(nowMd()),pSel=planCalc(cur()),bal=total(),goal=pNow.target,[a,b]=range(),list=deps.filter(d=>d.at>=a&&d.at<b).sort((x,y)=>y.at-x.at),mSum=list.reduce((s,d)=>s+d.amount,0);
  $("s_per").innerHTML=mnavHtml();
  const g=SG?G.find(z=>z.k===SG):null;if(!g)SG="";
  const got=g?(g.s||0)+deps.filter(d=>(d.pot||"")===g.k).reduce((s,d)=>s+d.amount,0):bal,tg=g?(g.t||(g.k==="buf"?goal:0)):goal;
  $("s_lbl").textContent=g?potName(g):t("totSaved");$("s_big").textContent=kr(got);
  $("s_dots").innerHTML=[null,...G].map(x=>`<i class="${(x?x.k:"")===SG?"on":""}"></i>`).join("");
  $("s_bar").style.width=Math.max(0,Math.min(100,tg?got/tg*100:0))+"%";$("s_goal").textContent=!tg?(g?t("gNoT"):""):!g?t("ofBuf",pc(Math.max(0,got)/tg),kr(tg)):got>=tg?t("gDone",kr(tg)):t("gProg",pc(Math.max(0,got)/tg),kr(tg),kr(tg-got));
  $("s_month").textContent=mn(P.m)+": "+kr(mSum);
  const perM=MNS[0].map((_,i)=>deps.filter(d=>{const x=new Date(d.at);return x.getFullYear()===P.y&&x.getMonth()===i}).reduce((s,d)=>s+d.amount,0)),mx=Math.max(1,...perM);
  $("s_cols").innerHTML=perM.map((v,i)=>`<div><i style="height:${Math.max(0,Math.round(v/mx*(WIDE.matches?132:66)))}px${i===P.m?";background:var(--c2)":""}" title="${ms(i)}: ${kr(v)}"></i>${ms(i)[0]}</div>`).join("");
  const names={},add=(k,n)=>{names[k]=n||names[k]||""};[...deps].sort((x,y)=>x.at-y.at).forEach(d=>add(d.pot||"",d.potN||(POTS[d.pot]?t(POTS[d.pot]):"")));pSel.lines.forEach(l=>add(l.k,potName(l)));
  let html=Object.keys(names).map(k=>{const mine=deps.filter(d=>(d.pot||"")===k),pl=0,per=mine.filter(d=>d.at>=a&&d.at<b).reduce((s,d)=>s+d.amount,0),tot=mine.reduce((s,d)=>s+d.amount,0)+((G.find(g=>g.k===k)||{}).s||0);return `<div class="row" style="display:block"><div style="display:flex;justify-content:space-between;gap:10px"><span>${esc(k?names[k]:t("potOther"))}</span><b>${kr(tot)}</b></div><div class="lbl">${pl>0?t("sMonth",mn(P.m),kr(per),kr(pl)):mn(P.m)+": "+kr(per)}</div>${pl>0?`<div class="bar"><i style="width:${Math.max(0,Math.min(100,per/pl*100))}%"></i></div>`:""}</div>`}).join("");
  if(S.saved)html+=`<div class="row"><span>${t("fSaved")}</span><b>${kr(S.saved)}</b></div>`;
  $("s_pots").innerHTML=html||`<p class="note">${t("none")}</p>`;
  $("s_cnt").textContent=list.length||"";
  $("s_list").innerHTML=list.slice(0,60).map(d=>`<div class="dep"><span>${d.amount<0?"−":"＋"} ${kr(Math.abs(d.amount))} <span class="lbl">${fmtD(d.at)} ${esc([d.potN,d.note].filter(Boolean).join(" · "))}</span></span><button class="x" data-del="${d.id}" aria-label="${t("del")}"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 2.5l7 7M9.5 2.5l-7 7"/></svg></button></div>`).join("")||`<p class="note">${t("none")}</p>`;
}
