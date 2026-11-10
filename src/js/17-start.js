/* Wider screens show all budget sections at once; phones keep one open at a time. */
function layout(){const D=["d_inc","d_out","d_var"].map(x=>$(x));if(WIDE.matches)D.forEach(d=>{d.removeAttribute("name");d.open=true});else{D.forEach(d=>{d.open=false;d.setAttribute("name","bud")});if(!hasData())D[0].open=true}}
[WIDE,RAIL].forEach(m=>m.addEventListener("change",()=>{closeYears();layout();render()}));
$("b").addEventListener("click",e=>{if(WIDE.matches&&e.target.closest("summary"))e.preventDefault()});
seedExample();applyTheme();applyLang();let startTab="h";try{const s=sessionStorage.getItem("kronkoll.tab");if(s&&$(s)&&"hbsarmvlunc".includes(s))startTab=s}catch(e){}go(startTab);layout();
/* Opening transition: wait until the first screen is drawn and the fonts are in, then reveal it. */
(()=>{const H=document.documentElement,still=!S.motion||matchMedia("(prefers-reduced-motion:reduce)").matches;if(still)H.classList.add("still");
  const show=()=>{if(H.classList.contains("reveal"))return;const sec=document.querySelector("main section:not(.hide)");if(sec)[...sec.children].forEach((c,i)=>c.style.setProperty("--i",Math.min(i,7)));
    H.classList.remove("boot");H.classList.add("reveal");if(!still)H.classList.add("enter");
    setTimeout(()=>{H.classList.remove("enter");$("intro").remove();if(sec)[...sec.children].forEach(c=>c.style.removeProperty("--i"))},1400)};
  const fonts=document.fonts&&document.fonts.ready?Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,800))]):Promise.resolve();
  fonts.then(()=>setTimeout(()=>requestAnimationFrame(show),Math.max(0,(still?0:720)-performance.now())));setTimeout(show,1800)})();
setInterval(guideDot,6e4);document.addEventListener("visibilitychange",()=>{if(!document.hidden)guideDot()});
document.addEventListener("visibilitychange",()=>{if(document.hidden)return;const d=new Date(),same=d.getMonth()===NOW.getMonth()&&d.getFullYear()===NOW.getFullYear();NOW=d;if(same){render();return}P={y:d.getFullYear(),m:d.getMonth()};refreshMonth()});
/* One shared household budget, so both people see the same figures. The page works without storage. */
(async()=>{try{
  const db=await claude.use("db");if(!db)return;
  db.doc("market/prices").onSnapshot(s=>{const v=s.exists&&s.data();if(v&&Array.isArray(v.items)){PRICES=v;renderHold();if(HS&&!$("hs_find").classList.contains("hide"))hsResults()}},()=>{});
  db.doc("market/latest").onSnapshot(s=>{const v=s.exists&&s.data();if(v&&Array.isArray(v.indices)&&v.indices.length&&Array.isArray(v.rates)&&v.eco&&Array.isArray(v.eco.policy_note)&&Array.isArray(v.eco.inflation_note)){MK=v;renderMarket();renderResults()}},()=>{});
  col=histWrap(db.collection("household"));let checked=false;
  const importOld=async()=>{const u=await claude.use("user"),id=u&&await u.id();if(!id)return;const o=await db.collection("data/users/"+id).get();for(const d of o.docs)await col.doc(d.id).set({...d.data()})};
  col.onSnapshot(snap=>{
    if(!checked&&!snap.metadata.fromCache){checked=true;if(snap.empty)importOld().catch(()=>{})}
    const keep={};DIRTY.forEach(k=>{if(PM[k])keep[k]=PM[k]});const keepR=RULES.filter(r=>DIRTYR.has(r.id)),real=snap.docs.some(d=>/^(pm|rec|dep|exp|hold|sub|loan)_|^started$/.test(d.id)),ex=exampleMode&&!real;if(!ex){exampleMode=false;PM={};RULES=[]}deps=[];HOLD=[];SL=[];LO=[];allIds=snap.docs.map(d=>d.id);const old=S.lang;let sawGoals=false;const MIG=[];
    snap.docs.forEach(d=>{const v=d.data()||{};
      if(d.id==="plan"){["saved","buf","lifePct","adults","taxT","taxPay","taxPct","payH","payR","taxCol","zoom","iskV","iskIn","iskP","rateGoal"].forEach(k=>{if(typeof v[k]==="number")S[k]=v[k]});["taxKom","taxFors"].forEach(k=>{if(typeof v[k]==="string")S[k]=v[k]});if(v.bg2==="mist"||v.bg2==="lines"){S.bg=v.bg2;S.bgPick=true}["taxKy","hc"].forEach(k=>{if(typeof v[k]==="boolean")S[k]=v[k]});applyRead();if(v.taxMode==="t"||v.taxMode==="p")S.taxMode=v.taxMode;if(typeof v.theme==="string")S.theme=v.theme;if(typeof v.toasts==="boolean")S.toasts=v.toasts;if(typeof v.sound==="boolean")S.sound=v.sound;if(typeof v.click==="boolean")S.click=v.click;if(typeof v.motion==="boolean"){S.motion=v.motion;FX.setMotion()}if(typeof v.recV==="number")S.recV=v.recV;if(v.lang==="sv"||v.lang==="en")S.lang=v.lang}
      else if(v.kind==="pm"){const rows=a=>Array.isArray(a)?a.filter(i=>i&&typeof i.a==="number").map(i=>({n:String(i.n||""),a:i.a,...(i.d?{d:String(i.d)}:{})})):[];let its=rows(v.items),vr=rows(v.vars);if(!Array.isArray(v.vars)){vr=its.filter(i=>VARS.test(i.n));its=its.filter(i=>!VARS.test(i.n))}const inc=Array.isArray(v.inc)?rows(v.inc):[["Jobb",+v.job||0],["CSN",+v.csn||0]].filter((r,i)=>r[1]>0||i===0).map(([n,a])=>({n,a}));PM[d.id.slice(3)]={inc,items:its,vars:vr,...(Array.isArray(v.split)?{split:v.split.filter(l=>l&&typeof l.a==="number").map(l=>({k:String(l.k||""),n:String(l.n||""),a:l.a}))}:{})}}
      else if(v.kind==="hold"&&typeof v.qty==="number")HOLD.push({id:String(v.id),ref:String(v.ref||""),name:String(v.name||""),qty:v.qty,cost:+v.cost||0,...(typeof v.manual==="number"?{manual:v.manual}:{})});
      else if(v.kind==="goals"){sawGoals=true;if(!goalsDirty&&Array.isArray(v.list))G=v.list.map(g=>({k:String(g.k),n:String(g.n||""),s:+g.s||0,t:+g.t||0}))}
      else if(v.kind==="loan"&&typeof v.bal==="number")LO.push({id:String(v.id),n:String(v.n||""),ty:String(v.ty||"annat"),bal:v.bal,r:+v.r||0,pay:+v.pay||0});
      else if(v.kind==="sub"&&typeof v.a==="number")SL.push({id:String(v.id),n:String(v.n||""),a:v.a,f:v.f==="q"||v.f==="y"?v.f:"m",d:String(v.d||""),off:!!v.off});
      else if(v.kind==="rec"&&v.sub){MIG.push(v)}
      else if(v.kind==="rec"&&Array.isArray(v.amts)&&v.amts.length&&!ex)RULES.push({id:String(v.id),t:v.t,n:String(v.n||""),freq:v.freq,date:String(v.date),ds:!!v.ds,amts:v.amts.map(x=>({f:String(x.f),a:+x.a||0})),end:v.end||null,over:v.over&&typeof v.over==="object"?{...v.over}:{},skip:Array.isArray(v.skip)?[...v.skip]:[]});
      else if(typeof v.amount==="number")deps.push({id:d.id,amount:v.amount,note:v.note||"",at:v.at||0,pot:v.pot||"",potN:v.potN||""})});
    Object.assign(PM,keep);
    /* Subscriptions that were first saved as budget lines move out of the budget, once. */
    if(MIG.length){histMute++;setTimeout(()=>histMute--,500)}MIG.forEach(v=>{const a=amtOf({amts:v.amts||[{f:"0",a:0}],over:v.over||{},skip:[]},mk(NOW.getFullYear(),NOW.getMonth()));col.doc("sub_"+v.id).set({kind:"sub",id:String(v.id),n:String(v.n||""),a,f:v.freq,d:v.ds||v.freq!=="m"?String(v.date):"",off:!!v.end}).then(()=>col.doc("rec_"+v.id).delete()).catch(()=>{})});
    /* Older budgets kept goals inside each month: gather their custom goals into the shared list once. */
    if(!exampleMode&&!sawGoals&&!goalsDirty){Object.keys(PM).sort().forEach(k=>(PM[k].split||[]).forEach(l=>{const g=G.find(z=>z.k===l.k);if(g){if(l.n)g.n=l.n}else G.push({k:l.k,n:l.n})}));saveGoals()}
    /* The old single "already saved" amount moves onto the first goal, once. */
    if(!exampleMode&&S.saved>0&&G.length){G[0].s=(G[0].s||0)+S.saved;S.saved=0;persist();saveGoals();flushSaves()}
    keepR.forEach(r=>{const i=RULES.findIndex(x=>x.id===r.id);if(i>=0)RULES[i]=r;else RULES.push(r)});
    /* Budgets saved before repeating lines existed: the latest month's lines become monthly, as they used to carry over. */
    if(!exampleMode&&!S.recV){S.recV=1;persist();const ks=Object.keys(PM).sort(),K=ks[ks.length-1];if(!RULES.length&&K){const date=K.replace("_","-")+"-01";RW.forEach(tp=>{PM[K][tp].forEach(x=>{if(x.n||x.a)newRule(tp,x.n,x.a,"m",date,false)});PM[K][tp]=[]});col.doc("pm_"+K).set(pmDoc(K)).catch(()=>{})}}
    if(!seenData){seenData=true;if(hasData()&&!WIDE.matches)$("d_inc").open=false}
    if(!exampleMode&&real&&!snap.docs.some(d=>d.id==="started"))col.doc("started").set({kind:"started"}).catch(()=>{});
    applyTheme();
    if(S.lang!==old){applyLang();go(tab);return}
    {const ae=document.activeElement;if(!ae||!ae.closest("#b,#s_goals")){buildSheet();buildGoals()}}render()},()=>{col=null;render()});
}catch(e){}})();
/* On narrow phones the longest menu word is shortened, so all menu buttons can stay the same size. */
function fitNav(){const b=document.querySelector('nav [data-go="a"]'),e=b&&b.querySelector("em");if(!e||getComputedStyle(b).flexGrow==="0")return;e.textContent=t("nA");if(e.scrollWidth>b.clientWidth-4)e.textContent=t("nAs")}
fitNav();addEventListener("resize",fitNav);document.fonts&&document.fonts.ready.then(fitNav);
