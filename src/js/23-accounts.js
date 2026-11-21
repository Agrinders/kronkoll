/* Accounts: each income or expense row can say which bank account the money comes into or goes from.
   Budget then shows, per account, what has to be there this month. Accounts are stored as one "accounts" doc. */
function saveAccounts(){leaveExample();if(!col)return;accDirty=true;later("acc",()=>{accDirty=false;col.doc("accounts").set({kind:"accounts",list:ACC}).catch(()=>toast(t("tFail")))},150)}

/* The small button under a row, next to "Varje månad". */
function accChip(rw,r,key){const a=r.acc&&accOf(r.acc);
  return `<button class="accb${a?" on":""}" data-acc="${rw}" ${key} aria-label="${a?tx("Konto: ","Account: ")+esc(a.n):tx("Välj konto","Choose account")}">`+
    (a?`<i style="background:${accCol(a.k)}"></i>${esc(a.n)}`:`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="6" width="17" height="12" rx="2.5"/><path d="M3.5 10h17"/></svg>${tx("Konto","Account")}`)+`</button>`}

/* Which row the sheet is choosing for, and its current account. */
function rowRef(b){const rw=b.dataset.acc,rid=b.dataset.rid,ix=b.dataset.ix;
  if(rid){const r=RULES.find(x=>x.id===rid);return{rw,name:r?r.n:"",acc:r&&r.acc||"",set:k=>{if(!r)return;if(k)r.acc=k;else delete r.acc;saveRule(r)}}}
  const it=rawMonth(P.y,P.m)[rw][+ix]||{};return{rw,name:it.n||"",acc:it.acc||"",set:k=>editMonth(md=>{const x=md[rw][+ix];if(!x)return;if(k)x.acc=k;else delete x.acc})}}
function openAC(b){ACX=rowRef(b);
  $("ac_t").textContent=tx("Vilket konto?","Which account?");
  $("ac_row").textContent=ACX.name?(ACX.rw==="inc"?tx(`Vart kommer ${ACX.name} in?`,`Where does ${ACX.name} arrive?`):tx(`Varifrån betalas ${ACX.name}?`,`Which account pays ${ACX.name}?`)):"";
  $("ac_n").placeholder=tx("Namn på nytt konto","New account name");$("ac_n").value="";
  $("ac_add").textContent=tx("Lägg till","Add");$("ac_no").textContent=t("cancel");paintAC();$("ac").classList.add("on")}
function paintAC(){const cur=ACX?ACX.acc:"";
  $("ac_l").innerHTML=ACC.map(a=>`<div class="acrow"><button class="pko${a.k===cur?" on":""}" data-ack="${esc(a.k)}"><span><i class="accdot" style="background:${accCol(a.k)}"></i>${esc(a.n)}</span>${a.k===cur?"<small>✓</small>":""}</button><button class="x" data-accdel="${esc(a.k)}" aria-label="${tx("Ta bort kontot","Remove account")}"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 2.5l7 7M9.5 2.5l-7 7"/></svg></button></div>`).join("")+
    (cur?`<button class="pko" data-ack=""><span>${tx("Inget konto","No account")}</span></button>`:"")+
    (ACC.length?"":`<p class="note">${tx("Du har inga konton än. Skriv ett namn nedan, till exempel Lönekonto eller Räkningskonto.","You have no accounts yet. Type a name below, for example Salary account or Bills account.")}</p>`)}
function closeAC(){$("ac").classList.remove("on");ACX=null}
function pickAC(k){if(!ACX)return;ACX.set(k);closeAC();buildSheet();render()}
$("ac").addEventListener("click",e=>{if(e.target===$("ac"))return closeAC();const b=e.target.closest("[data-ack]");if(b)pickAC(b.dataset.ack)});
$("ac_no").onclick=closeAC;
function addAC(){const n=$("ac_n").value.trim();if(!n){$("ac_n").focus();return}
  let a=ACC.find(x=>x.n.toLowerCase()===n.toLowerCase());if(!a){a={k:"a"+Date.now().toString(36),n};ACC.push(a);saveAccounts()}pickAC(a.k)}
$("ac_add").onclick=addAC;$("ac_n").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();addAC()}});
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-acc]");if(b&&!e.defaultPrevented)openAC(b)});

/* Budget: a small "Konton" dropdown in the title bar. Per account: what has to be there this month, and the payday moves. */
function renderAccounts(){const md=monthData(P.y,P.m),B={};
  const add=(t,r)=>{if(r.skip||!(r.a>0))return;const k=r.acc&&accOf(r.acc)?r.acc:"";(B[k]=B[k]||{in:0,out:0});if(t==="inc")B[k].in+=r.a;else B[k].out+=r.a};
  RW.forEach(t=>md[t].forEach(r=>add(t,r)));
  $("acc_btn").classList.toggle("hide",!ACC.length);$("acc_btn_t").textContent=tx("Konton","Accounts");
  $("accdd_t").textContent=tx(`Konton i ${mn(P.m).toLowerCase()}`,`Accounts in ${mn(P.m)}`);
  const src=ACC.map(a=>({a,v:((B[a.k]||{}).in||0)-((B[a.k]||{}).out||0)})).filter(x=>x.v>0).sort((x,y)=>y.v-x.v),
        need=ACC.map(a=>({a,v:((B[a.k]||{}).out||0)-((B[a.k]||{}).in||0)})).filter(x=>x.v>0),moves=[];
  need.forEach(n=>{let rest=n.v;src.forEach(s_=>{if(rest<=0||s_.v<=0)return;const m=Math.min(rest,s_.v);moves.push([s_.a,n.a,m]);s_.v-=m;rest-=m});if(rest>0)moves.push([null,n.a,rest])});
  const row=(dot,name,b)=>`<div class="ddr"><span class="ddn">${dot}<span>${esc(name)}</span></span><b>${kr(b.out)}</b>${b.in?`<small>${tx("in","in")} ＋ ${kr(b.in)}</small>`:""}</div>`;
  const none=B[""];
  $("acc_l").innerHTML=ACC.map(a=>row(`<i class="accdot" style="background:${accCol(a.k)}"></i>`,a.n,B[a.k]||{in:0,out:0})).join("")+
    (none&&none.out?row(`<i class="accdot none"></i>`,tx("Utan konto","No account"),none):"")+
    (moves.length?`<div class="ddplan"><span>${tx("På lönedagen","On payday")}</span>${moves.map(([f,to,m])=>`<div class="ddm"><span>${f?`${esc(f.n)} → ${esc(to.n)}`:tx(`Sätt in på ${esc(to.n)}`,`Into ${esc(to.n)}`)}</span><b>${kr(m)}</b></div>`).join("")}</div>`:"")+
    `<p class="ddnote">${tx("Beloppet är vad som ska finnas på kontot för månadens utgifter.","The amount is what needs to be on the account for the month's expenses.")}</p>`}
function closeAccDD(){const d=$("accdd");if(!d||!d.classList.contains("on"))return;d.classList.remove("on");$("acc_btn").setAttribute("aria-expanded","false")}
$("acc_btn").onclick=e=>{e.stopPropagation();const d=$("accdd"),o=!d.classList.contains("on");if(!o)return closeAccDD();renderAccounts();
  const r=$("acc_btn").getBoundingClientRect(),z=parseFloat(getComputedStyle(document.body).zoom)||1;d.style.top=(r.bottom/z+8)+"px";d.style.right=Math.max(12,(innerWidth-r.right)/z)+"px";d.classList.add("on");$("acc_btn").setAttribute("aria-expanded","true")};
document.addEventListener("click",e=>{if(!e.target.closest||e.target.closest("#accdd,#acc_btn"))return;closeAccDD()});
addEventListener("scroll",closeAccDD,{passive:true});
/* In the account picker: remove an account with the cross (two taps). Rows that used it get no account. */
document.addEventListener("click",e=>{const d=e.target.closest&&e.target.closest("[data-accdel]");if(!d)return;const k=d.dataset.accdel;
  animOut(d.closest(".acrow"),()=>{ACC=ACC.filter(a=>a.k!==k);saveAccounts();RULES.forEach(r=>{if(r.acc===k){delete r.acc;saveRule(r)}});
    Object.keys(PM).forEach(mk_=>{const w=PM[mk_];if(RW.some(t=>(w[t]||[]).some(x=>x.acc===k))){const[y,m]=mk_.split("_").map(Number);editMonth(md=>RW.forEach(t=>(md[t]||[]).forEach(x=>{if(x.acc===k)delete x.acc})),y,m-1)}});
    if(ACX&&ACX.acc===k)ACX.acc="";paintAC();buildSheet();render();toast(tx("Kontot borttaget","Account removed"),"del")})});
