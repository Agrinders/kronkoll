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
  $("ac_l").innerHTML=ACC.map(a=>`<button class="pko${a.k===cur?" on":""}" data-ack="${esc(a.k)}"><span><i class="accdot" style="background:${accCol(a.k)}"></i>${esc(a.n)}</span>${a.k===cur?"<small>✓</small>":""}</button>`).join("")+
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

/* Budget: what each account needs this month. */
function renderAccounts(){const md=monthData(P.y,P.m),used=new Set(),B={};
  const add=(t,r)=>{if(r.skip||!(r.a>0))return;const k=r.acc&&accOf(r.acc)?r.acc:"";used.add(k);(B[k]=B[k]||{in:0,out:0,rows:[]});if(t==="inc")B[k].in+=r.a;else B[k].out+=r.a;B[k].rows.push([t,r.n||tx("Utan namn","Unnamed"),r.a])};
  RW.forEach(t=>md[t].forEach(r=>add(t,r)));
  const none=B[""];
  $("acc_h").textContent=tx("Konton","Accounts");
  $("acc_sub").textContent=ACC.length?tx(`Vad som behövs på varje konto i ${mn(P.m).toLowerCase()}`,`What each account needs in ${mn(P.m)}`):tx("Välj konto på en rad med knappen Konto","Pick an account on a row with the Account button");
  const tot=ACC.reduce((s,a)=>s+((B[a.k]||{}).out||0),0);$("sum_acc").textContent=ACC.length?kr(tot):"";
  const card=(k,name,b,colr)=>{b=b||{in:0,out:0,rows:[]};const left=b.in-b.out;
    return `<div class="accc"><div class="acch">${k?`<i class="accdot" style="background:${colr}"></i><input class="nm accn" data-accn="${esc(k)}" value="${esc(name)}" maxlength="30" aria-label="${tx("Kontots namn","Account name")}"><button class="x" data-accdel="${esc(k)}" aria-label="${t("del")}"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 2.5l7 7M9.5 2.5l-7 7"/></svg></button>`:`<b class="accnone">${tx("Utan konto","No account")}</b>`}</div>
      <div class="accnum"><span>${tx("Ska finnas","Needs")}</span><b>${kr(b.out)}</b></div>
      ${b.in?`<div class="accsub"><span>${tx("Kommer in","Comes in")}</span><span class="ok">＋ ${kr(b.in)}</span></div><div class="accsub"><span>${left>=0?tx("Över efter räkningar","Left after bills"):tx("Behöver föras över","Needs moving in")}</span><span class="${left>=0?"ok":"wn"}">${kr(Math.abs(left))}</span></div>`:(k&&b.out?`<div class="accsub"><span>${tx("Behöver föras över","Needs moving in")}</span><span class="wn">${kr(b.out)}</span></div>`:"")}
      ${b.rows.length?`<details class="accrows"><summary>${tx(`${b.rows.length} rader`,`${b.rows.length} rows`)}</summary>${b.rows.map(([t,n,a])=>`<div class="accr"><span>${esc(n)}</span><span>${t==="inc"?"＋ ":""}${kr(a)}</span></div>`).join("")}</details>`:`<p class="note">${tx("Inga rader på det här kontot den här månaden.","No rows on this account this month.")}</p>`}</div>`};
  /* Payday plan: move money from accounts with money left over to accounts that are short. */
  const src=ACC.map(a=>({a,v:((B[a.k]||{}).in||0)-((B[a.k]||{}).out||0)})).filter(x=>x.v>0).sort((x,y)=>y.v-x.v),
        need=ACC.map(a=>({a,v:((B[a.k]||{}).out||0)-((B[a.k]||{}).in||0)})).filter(x=>x.v>0),moves=[];
  need.forEach(n=>{let rest=n.v;src.forEach(s_=>{if(rest<=0||s_.v<=0)return;const m=Math.min(rest,s_.v);moves.push([s_.a,n.a,m]);s_.v-=m;rest-=m});if(rest>0)moves.push([null,n.a,rest])});
  const plan=moves.length?`<div class="accplan"><b>${tx("På lönedagen","On payday")}</b>${moves.map(([f,to,m])=>`<div class="accmove"><span>${f?tx(`Flytta från <em>${esc(f.n)}</em> till <em>${esc(to.n)}</em>`,`Move from <em>${esc(f.n)}</em> to <em>${esc(to.n)}</em>`):tx(`Sätt in på <em>${esc(to.n)}</em>`,`Put into <em>${esc(to.n)}</em>`)}</span><b>${kr(m)}</b></div>`).join("")}</div>`:"";
  $("acc_l").innerHTML=plan+(ACC.length?`<div class="accg">${ACC.map(a=>card(a.k,a.n,B[a.k],accCol(a.k))).join("")}${none&&(none.out||none.in)?card("","",none):""}</div>`:"")+
    `<p class="note">${ACC.length?tx("Siffrorna gäller månaden du valt högst upp. Ändra namn genom att skriva i rutan.","Figures are for the month chosen at the top. Rename by typing in the box."):tx("Tryck på Konto under en inkomst eller utgift för att välja eller skapa ett konto, till exempel Lönekonto och Räkningskonto. Här ser du sedan vad som behöver finnas på varje konto.","Tap Account under an income or expense to choose or create an account, for example Salary account and Bills account. Here you then see what needs to be on each account.")}</p>`}
document.addEventListener("change",e=>{const n=e.target.closest&&e.target.closest("[data-accn]");if(!n)return;const a=accOf(n.dataset.accn),v=n.value.trim();if(!a)return;if(!v){n.value=a.n;return}a.n=v;saveAccounts();buildSheet();render()});
document.addEventListener("click",e=>{const d=e.target.closest&&e.target.closest("[data-accdel]");if(!d)return;const k=d.dataset.accdel;
  animOut(d.closest(".accc"),()=>{ACC=ACC.filter(a=>a.k!==k);saveAccounts();RULES.forEach(r=>{if(r.acc===k){delete r.acc;saveRule(r)}});
    Object.keys(PM).forEach(mk_=>{const w=PM[mk_];if(RW.some(t=>(w[t]||[]).some(x=>x.acc===k))){const[y,m]=mk_.split("_").map(Number);editMonth(md=>RW.forEach(t=>(md[t]||[]).forEach(x=>{if(x.acc===k)delete x.acc})),y,m-1)}});
    buildSheet();render();toast(tx("Kontot borttaget","Account removed"),"del")})});
