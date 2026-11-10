/* ---------- Backup reminder: quiet, on Översikt only, at most every two weeks. ---------- */
const lsN=k=>{try{return+localStorage.getItem(k)||0}catch(e){return 0}},lsSet=(k,v)=>{try{localStorage.setItem(k,String(v))}catch(e){}};
const ago=t=>{const d=Math.floor((Date.now()-t)/864e5);return d<=0?tx("idag","today"):d===1?tx("igår","yesterday"):tx(`för ${d} dagar sedan`,`${d} days ago`)};
function renderBk(){const last=lsN("kronkoll.backupAt"),real=!exampleMode&&hasData();if(real&&!lsN("kronkoll.firstUse"))lsSet("kronkoll.firstUse",Date.now());const first=lsN("kronkoll.firstUse"),now=Date.now();
  const show=real&&now>lsN("kronkoll.bkSnooze")&&(last?now-last>30*864e5:first&&now-first>7*864e5);
  $("h_bk").classList.toggle("hide",!show);if(show)$("h_bk").innerHTML=`<div class="bkc"><i><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5 5 6.5v5c0 4.200 3 7.400 7 9 4-1.600 7-4.800 7-9v-5z"/><path d="m9 12 2.200 2.200L15.500 10"/></svg></i><div><b>${tx("Dags att spara en säkerhetskopia","Time to save a backup")}</b><p>${tx("Din budget finns bara på den här telefonen.","Your budget only exists on this phone.")} ${last?tx("Senast sparad ","Last saved ")+ago(last)+".":tx("Du har inte sparat någon än.","You have not saved one yet.")}</p><div class="bkb"><button class="btn" id="bk_now">${tx("Spara nu","Save now")}</button><button class="btn out" id="bk_later">${tx("Senare","Later")}</button></div></div></div>`;
  if($("c_bk"))$("c_bk").textContent=last?tx("Senaste säkerhetskopian: ","Last backup: ")+new Date(last).toLocaleDateString(loc(),{day:"numeric",month:"long",year:"numeric"})+" ("+ago(last)+")":tx("Du har inte sparat någon säkerhetskopia än.","You have not saved a backup yet.")}
addEventListener("kronkoll-backup",()=>{lsSet("kronkoll.bkSnooze",0);renderBk()});

/* ---------- Readability ---------- */
try{const g=localStorage.getItem("kronkoll.bg");if(g==="mist")S.bg="mist"}catch(e){}
try{const r=JSON.parse(localStorage.getItem("kronkoll.read")||"null");if(r){S.zoom=+r.z||1;S.hc=!!r.hc}}catch(e){}
function applyRead(){const z=[.9,1,1.15,1.3].includes(S.zoom)?S.zoom:1;document.body.style.zoom=z===1?"":z;document.documentElement.style.setProperty("--z",z);document.documentElement.classList.toggle("hc",!!S.hc);try{localStorage.setItem("kronkoll.read",JSON.stringify({z,hc:S.hc}))}catch(e){}}
applyRead();
function renderRead(){$("c_rh").textContent=tx("Läsbarhet","Readability");$("c_zl").textContent=tx("Storlek på text och knappar","Size of text and buttons");$("c_hcl").textContent=tx("Tydligare kontrast","Stronger contrast");
  $("c_zm").innerHTML=[[.9,"Mindre","Smaller"],[1,"Normal","Normal"],[1.15,"Större","Larger"],[1.3,"Störst","Largest"]].map(([v,a,b])=>`<button class="chip ${S.zoom===v?"on":""}" data-zm="${v}">${tx(a,b)}</button>`).join("");
  $("c_zp").textContent=tx("Gör allt i appen mindre eller större. Tydligare kontrast gör panelerna helt täckande och texten mörkare.","Makes everything in the app smaller or larger. Stronger contrast makes the panels solid and the text darker.");
  $("c_bgl").textContent=tx("Bakgrund","Background");$("c_bg").innerHTML=[["lines",tx("Linjer","Lines")],["mist",tx("Dimma (test)","Mist (test)")]].map(([v,l])=>`<button class="chip ${S.bg===v?"on":""}" data-bg="${v}">${l}</button>`).join("");$("c_hc").innerHTML=[["1","on"],["0","off"]].map(([v,k])=>`<button class="chip ${(S.hc?"1":"0")===v?"on":""}" data-hc="${v}">${t(k)}</button>`).join("")}

