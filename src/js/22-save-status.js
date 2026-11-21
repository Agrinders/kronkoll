/* Save status in the title bar: small grey "Sparar…" then "Sparat ✓" after something you did, fading after a few seconds.
   Saves the app makes by itself (at start, for example) are not shown. */
let lastAct=0,saveT=0,saveShownAt=0;
["pointerdown","keydown","change","input"].forEach(ev=>addEventListener(ev,()=>{lastAct=Date.now()},true));
function saveState(s){const el=$("savest");clearTimeout(saveT);
  if(s==="start"){if(Date.now()-lastAct>2500)return;saveShownAt=Date.now();el.className="savest on busy";el.innerHTML=`<i></i>${tx("Sparar…","Saving…")}`;return}
  if(!el.classList.contains("busy")&&s!=="fail")return;
  const wait=Math.max(0,400-(Date.now()-saveShownAt));
  saveT=setTimeout(()=>{if(s==="fail"){el.className="savest on fail";el.textContent=tx("Kunde inte spara","Could not save");saveT=setTimeout(()=>{el.className="savest"},6000);return}
    el.className="savest on";el.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>${tx("Sparat","Saved")}`;saveT=setTimeout(()=>{el.className="savest"},2600)},wait)}
addEventListener("kk-save",e=>saveState(e.detail));
