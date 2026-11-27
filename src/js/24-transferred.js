/* "Överfört": tick off fixed and variable expenses once the money is moved. The tick belongs to the month you are
   looking at, so recurring rows start unticked each new month. Rules keep {monthKey: date}, one-off rows keep a date. */
const todayISO=()=>{const d=new Date();return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`};
const shortD=iso=>{const[y,m,d]=iso.split("-").map(Number);return new Date(y,m-1,d).toLocaleDateString(loc(),{day:"numeric",month:"short"}).replace(".","")};
function doneChip(rw,r,key){if(rw==="inc"||r.skip)return"";const on=!!r.done;
  return `<button class="donb${on?" on":""}" data-done="${rw}" ${key} aria-pressed="${on}"><svg viewBox="0 0 24 24" aria-hidden="true">${on?'<circle cx="12" cy="12" r="9"/><path d="m8 12.3 2.8 2.8 5.2-5.6"/>':'<circle cx="12" cy="12" r="8.5"/>'}</svg>${on?tx("Överfört ","Transferred ")+shortD(r.done):tx("Överfört","Transferred")}</button>`}
/* Totals for a month: how many expense rows, how many ticked, and how much is still to move. */
function doneSum(md){let n=0,d=0,left=0;["items","vars"].forEach(t=>md[t].forEach(r=>{if(r.skip||!(r.a>0))return;n++;if(r.done)d++;else left+=r.a}));return{n,d,left}}
function renderDoneCounts(){const md=monthData(P.y,P.m);["items","vars"].forEach(t=>{const rows=md[t].filter(r=>!r.skip&&r.a>0),d=rows.filter(r=>r.done).length,el=$("dc_"+t);
  el.innerHTML=rows.length?`<span>${tx(`${d} av ${rows.length} överförda`,`${d} of ${rows.length} transferred`)}</span><i class="dcbar"><i style="width:${Math.round(d/rows.length*100)}%"></i></i>`:"";el.classList.toggle("all",rows.length>0&&d===rows.length)})}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-done]");if(!b)return;const rw=b.dataset.done,k=mk(P.y,P.m),now=todayISO();
  if(b.dataset.rid){const r=RULES.find(x=>x.id===b.dataset.rid);if(!r)return;r.done={...(r.done||{})};if(r.done[k])delete r.done[k];else r.done[k]=now;saveRule(r)}
  else{const ix=+b.dataset.ix;editMonth(md=>{const x=md[rw][ix];if(!x)return;if(x.done)delete x.done;else x.done=now})}
  buildSheet();render()});
