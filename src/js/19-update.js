/* New version check: when the app comes back into view (and every 15 minutes) it asks GitHub for the newest build id. If it differs, a button offers to update. The reload adds ?v= so GitHub's cache serves the new files right away. */
const BUILD=(document.querySelector('meta[name="kk-build"]')||{}).content||"";
async function checkUpdate(){if(!BUILD||!navigator.onLine)return;try{const r=await fetch("version.json?t="+Date.now(),{cache:"no-store"});if(!r.ok)return;const j=await r.json();
  if(j&&j.b&&j.b!==BUILD){const u=$("upd");u.dataset.v=j.b;$("upd_t").textContent=tx("Ny version finns","New version ready");$("upd_s").textContent=tx("Dina siffror finns kvar.","Your figures stay as they are.");$("upd_go").textContent=tx("Uppdatera","Update");u.setAttribute("aria-label",tx("Uppdatera till den nya versionen","Update to the new version"));u.classList.remove("hide")}}catch(e){}}
$("upd").onclick=()=>{location.replace(location.pathname+"?v="+($("upd").dataset.v||Date.now()))};
if(/[?&]v=/.test(location.search))history.replaceState(history.state,"",location.pathname+location.hash);
setTimeout(checkUpdate,4000);setInterval(checkUpdate,15*6e4);document.addEventListener("visibilitychange",()=>{if(!document.hidden)checkUpdate()});
