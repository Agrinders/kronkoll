/* ---------- History and undo: every change to a saved record is noted with what it looked like before. ---------- */
const HKEY="kronkoll.history.v1",HSKIP=/^(plan|started)$/;let H=[],HG=null,histMute=0;
try{H=JSON.parse(localStorage.getItem(HKEY)||"[]")||[]}catch(e){H=[]}
const hcopy=v=>v==null?null:JSON.parse(JSON.stringify(v)),hsame=(a,b)=>JSON.stringify(a??null)===JSON.stringify(b??null);
function hcur(id){try{const d=JSON.parse(localStorage.getItem("kronkoll.data.v1")||"{}");return hcopy((d.household||{})[id])}catch(e){return null}}
function histSave(){const cut=Date.now()-30*864e5;H=H.filter(e=>e.at>cut).slice(0,60);let j=JSON.stringify(H);while(j.length>15e5&&H.length>1){H.pop();j=JSON.stringify(H)}try{localStorage.setItem(HKEY,j)}catch(e){}}
function histWrap(c){return{...c,doc:id=>{const d=c.doc(id);return{...d,set:v=>{histNote(id);return d.set(v)},update:v=>{histNote(id);return d.update(v)},delete:()=>{histNote(id);return d.delete()}}}}}
function histNote(id){if(histMute||exampleMode||HSKIP.test(id))return;if(!HG)HG={docs:{}};if(!(id in HG.docs))HG.docs[id]=hcur(id);clearTimeout(HG.t);HG.t=setTimeout(histClose,600)}
function histClose(){if(!HG)return;const g=HG;HG=null;clearTimeout(g.t);const docs={};Object.keys(g.docs).forEach(id=>{const a=hcur(id);if(!hsame(g.docs[id],a)&&!(id==="goals"&&g.docs[id]==null))docs[id]=[g.docs[id],a]});const ids=Object.keys(docs);if(!ids.length)return;
  const last=H[0],now=Date.now();
  if(last&&!last.u&&now-last.at<20000&&ids.length===1&&Object.keys(last.docs).length===1&&last.docs[ids[0]]&&docs[ids[0]][0]&&docs[ids[0]][1]&&last.docs[ids[0]][0]){last.docs[ids[0]][1]=docs[ids[0]][1];last.at=now}
  else H.unshift({i:now.toString(36)+Math.random().toString(36).slice(2,6),at:now,docs,u:false});
  histSave();if(tab==="u")renderHist();
  const e=H[0],d=hdesc(e);if(d.k==="del"){const tb=lastToast;if(tb&&tb.isConnected&&!tb._going&&!tb.querySelector(".tundo")){clearTimeout(tb._t);tb._t=setTimeout(()=>dropToast(tb),6500);const b=document.createElement("button");b.className="tundo";b.textContent=tx("Ångra","Undo");b.onclick=ev=>{ev.stopPropagation();dropToast(tb);histUndo(e.i)};tb.appendChild(b)}}}
const hmon=id=>{const[y,m]=id.slice(3).split("_").map(Number);return mn(m-1).toLowerCase()+(y!==new Date().getFullYear()?" "+y:"")};
const hname=n=>n&&n.trim()?n.trim():tx("en rad","a line");
function hone(id,b,a){
  if(id.startsWith("rec_")){const n=hname((a||b).n),kNow=mk(NOW.getFullYear(),NOW.getMonth());if(!b)return["add",tx(`La till ${n}`,`Added ${n}`)];if(!a)return["del",tx(`Tog bort ${n}`,`Removed ${n}`)];
    if(a.end&&a.end!==b.end)return["del",tx(`${n} slutar från ${hmon("pm_"+a.end)}`,`${n} ends from ${hmon("pm_"+a.end)}`)];
    const sa=a.skip||[],sb=b.skip||[];if(sa.length>sb.length){const k=sa.find(x=>!sb.includes(x));return["del",tx(`Tog bort ${n} i ${hmon("pm_"+k)}`,`Removed ${n} in ${hmon("pm_"+k)}`)]}if(sa.length<sb.length)return["add",tx(`${n} tillbaka`,`${n} back`)];
    if(a.n!==b.n)return["edit",tx(`Bytte namn: ${hname(b.n)} → ${n}`,`Renamed: ${hname(b.n)} → ${n}`)];
    if(!hsame(a.amts,b.amts)||!hsame(a.over,b.over)){const v=x=>{try{return amtOf({...x,skip:[]},kNow)}catch(e){return 0}};return["edit",tx(`${n}: ${kr(v(b))} → ${kr(v(a))}`,`${n}: ${kr(v(b))} → ${kr(v(a))}`)]}
    return["edit",tx(`Ändrade när ${n} betalas`,`Changed when ${n} is paid`)]}
  if(id.startsWith("pm_")){const mo=hmon(id),out=[];["inc","items","vars"].forEach(tp=>{const B=((b||{})[tp]||[]),A=((a||{})[tp]||[]),bn=B.map(x=>x.n),an=A.map(x=>x.n);
      A.forEach(x=>{if(!bn.includes(x.n))out.push(["add",tx(`La till ${hname(x.n)} i ${mo}`,`Added ${hname(x.n)} in ${mo}`)])});
      B.forEach(x=>{if(!an.includes(x.n))out.push(["del",tx(`Tog bort ${hname(x.n)} i ${mo}`,`Removed ${hname(x.n)} in ${mo}`)])});
      A.forEach(x=>{const o=B.find(z=>z.n===x.n);if(o&&o.a!==x.a)out.push(["edit",tx(`${hname(x.n)}: ${kr(o.a)} → ${kr(x.a)} i ${mo}`,`${hname(x.n)}: ${kr(o.a)} → ${kr(x.a)} in ${mo}`)])})});
    return out[0]||["edit",tx(`Ändrade budgeten för ${mo}`,`Changed the budget for ${mo}`)]}
  if(id.startsWith("dep_")){const v=(a||b),amt=v.amount||0,pot=v.pot?potName({k:v.pot,n:v.potN||""}):"";if(!b)return["add",amt<0?tx(`Tog ut ${kr(-amt)}${pot?" från "+pot:""}`,`Withdrew ${kr(-amt)}${pot?" from "+pot:""}`):tx(`Sparade ${kr(amt)}${pot?" till "+pot:""}`,`Saved ${kr(amt)}${pot?" to "+pot:""}`)];if(!a)return["del",tx(`Tog bort sparandet på ${kr(Math.abs(amt))}`,`Removed savings of ${kr(Math.abs(amt))}`)];return["edit",tx("Ändrade ett sparande","Changed a saving")]}
  if(id==="goals"){const B=(b&&b.list)||[],A=(a&&a.list)||[],nm=g=>rowName(g)||tx("sparmål","goal");const ad=A.find(g=>!B.some(x=>x.k===g.k)),rm=B.find(g=>!A.some(x=>x.k===g.k));if(ad)return["add",tx(`Nytt sparmål: ${nm(ad)}`,`New goal: ${nm(ad)}`)];if(rm)return["del",tx(`Tog bort sparmålet ${nm(rm)}`,`Removed the goal ${nm(rm)}`)];const ch=A.find(g=>{const o=B.find(x=>x.k===g.k);return o&&!hsame(o,g)});return["edit",ch?tx(`Ändrade sparmålet ${nm(ch)}`,`Changed the goal ${nm(ch)}`):tx("Ändrade sparmål","Changed goals")]}
  const v=a||b,n=hname(v.n||v.name);
  if(id.startsWith("sub_")){if(!b)return["add",tx(`Nytt abonnemang: ${n}`,`New subscription: ${n}`)];if(!a)return["del",tx(`Tog bort abonnemanget ${n}`,`Removed the subscription ${n}`)];if(a.off&&!b.off)return["del",tx(`Sa upp ${n}`,`Cancelled ${n}`)];if(!a.off&&b.off)return["add",tx(`${n} är tillbaka`,`${n} is back`)];return["edit",tx(`Ändrade ${n}`,`Changed ${n}`)]}
  if(id.startsWith("hold_")){if(!b)return["add",tx(`La till innehavet ${n}`,`Added the holding ${n}`)];if(!a)return["del",tx(`Tog bort innehavet ${n}`,`Removed the holding ${n}`)];return["edit",tx(`Ändrade ${n}`,`Changed ${n}`)]}
  if(id.startsWith("loan_")){if(!b)return["add",tx(`Nytt lån: ${n}`,`New loan: ${n}`)];if(!a)return["del",tx(`Tog bort lånet ${n}`,`Removed the loan ${n}`)];return["edit",tx(`Ändrade lånet ${n}`,`Changed the loan ${n}`)]}
  return["edit",tx("Ändrade sparad data","Changed saved data")]}
function hdesc(e){const ids=Object.keys(e.docs),L=ids.map(id=>hone(id,e.docs[id][0],e.docs[id][1]));if(ids.length>=3&&ids.every(id=>/^(rec|pm)_/.test(id))&&ids.filter(id=>id.startsWith("rec_")).every(id=>e.docs[id][1]==null)&&ids.some(id=>e.docs[id][1]==null))return{k:"del",t:tx("Tömde budgeten","Emptied the budget"),more:0};if(ids.length>=6&&ids.every(id=>e.docs[id][1]==null))return{k:"del",t:tx("Tog bort all data","Removed all data"),more:0};return{k:L[0][0],t:L[0][1],more:ids.length-1}}
function renderHist(){$("u_head").textContent=tx("Det här har du gjort","What you have done");$("u_note").textContent=tx("De senaste 30 dagarna. Tryck Ångra för att ta tillbaka en ändring. Historiken finns bara på den här telefonen.","The last 30 days. Tap Undo to take back a change. The history is only on this phone.");$("u_clear").textContent=tx("Rensa historiken","Clear the history");$("u_clear").classList.toggle("hide",!H.length);
  if(!H.length){$("u_list").innerHTML=`<p class="note" style="margin-top:6px">${tx("Inget ännu. När du lägger till, ändrar eller tar bort något syns det här.","Nothing yet. When you add, change or remove something it shows here.")}</p>`;return}
  const day=t=>{const d=new Date(t),n=new Date(),k=x=>x.toDateString();if(k(d)===k(n))return tx("Idag","Today");n.setDate(n.getDate()-1);if(k(d)===k(n))return tx("Igår","Yesterday");return d.toLocaleDateString(loc(),{weekday:"long",day:"numeric",month:"long"})};
  const IC={add:'<path d="M12 6v12M6 12h12"/>',del:'<path d="M6 12h12"/>',edit:'<path d="m5 16.5 9.5-9.5 3 3L8 19.5H5z"/>'};let last="";
  $("u_list").innerHTML=H.map(e=>{const d=hdesc(e),dl=day(e.at),h=dl!==last?`<div class="hday">${dl}</div>`:"";last=dl;return h+`<div class="hrow ${e.u?"undone":""}"><i class="${d.k}"><svg viewBox="0 0 24 24" aria-hidden="true">${IC[d.k]}</svg></i><div><b>${esc(d.t)}</b><small>${new Date(e.at).toLocaleTimeString(loc(),{hour:"2-digit",minute:"2-digit"})}${d.more?" · "+tx(`och ${d.more} till`,`and ${d.more} more`):""}${e.u?" · "+tx("Ångrad","Undone"):""}</small></div><button class="btn out" data-hu="${e.i}">${e.u?tx("Gör om","Redo"):tx("Ångra","Undo")}</button></div>`}).join("")}
async function histUndo(i){histClose();flushSaves();const e=H.find(x=>x.i===i);if(!e||!col)return;const from=e.u?0:1,to=e.u?1:0,ids=Object.keys(e.docs);
  if(ids.some(id=>!hsame(hcur(id),e.docs[id][from]))&&!await ask(tx("Det har ändrats sedan dess","It has changed since then"),tx("Om du fortsätter skrivs senare ändringar av samma sak över.","If you go ahead, later changes to the same thing are overwritten.")))return;
  histMute++;try{ids.forEach(id=>{const v=e.docs[id][to];(v==null?col.doc(id).delete():col.doc(id).set(v)).catch(()=>{})})}finally{histMute--}
  e.u=!e.u;histSave();renderHist();toast((e.u?tx("Ångrat","Undone"):tx("Gjort igen","Redone"))+" · "+hdesc(e).t,"ok")}

