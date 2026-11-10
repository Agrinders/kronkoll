/* ---------- Shared clicks for the new parts ---------- */
document.addEventListener("click",e=>{const g=x=>e.target.closest&&e.target.closest(x);let b;
  if(b=g("[data-hu]"))return histUndo(b.dataset.hu);
  if(g("#u_clear"))return ask(tx("Rensa historiken?","Clear the history?"),tx("Det går inte att ångra något av det som står här efteråt. Din budget påverkas inte.","Nothing listed here can be undone afterwards. Your budget is not affected.")).then(ok=>{if(ok){H=[];histSave();renderHist()}});
  if(g("#bk_now")){const s=$("bk_save");if(s)s.click();return}
  if(g("#bk_later")){lsSet("kronkoll.bkSnooze",Date.now()+14*864e5);renderBk();return}
  if(b=g("[data-zm]")){S.zoom=+b.dataset.zm;applyRead();persist();renderRead();return}
  if(b=g("[data-hc]")){S.hc=b.dataset.hc==="1";applyRead();persist();renderRead();return}
  if(b=g("[data-xky]")){S.taxKy=b.dataset.xky==="1";setAuto();persist();renderTax();return}
  if(b=g("[data-loan]"))return openLO(b.dataset.loan);
  if(b=g("[data-subadd]")){const w=b.closest(".lnw"),nm=w.querySelector(".nm"),am=w.querySelector(".am"),n=nm.value.trim(),a=parseA(am.value),r=nm.dataset.rid&&ruleById(nm.dataset.rid);if(a<=0){toast(tx("Skriv in ett belopp först","Enter an amount first"),"warn");return}saveSub({id:"s"+Date.now(),n,a,f:r?r.freq:"m",d:r&&(r.ds||r.freq!=="m")?r.date:"",off:false});toast(tx(`${n} finns nu i Abonnemang · Budgeten ändras inte`,`${n} is now in Subscriptions · The budget does not change`),"ok");subHintFor(w);return}
  if(b=g("[data-subno]")){const w=b.closest(".lnw"),n=normN(w.querySelector(".nm").value);try{localStorage.setItem("kronkoll.subNo",JSON.stringify([...subNo(),n].slice(-200)))}catch(err){}subHintFor(w);return}
});
function focusTo(sel){const el=document.querySelector(sel);if(!el)return;const d=el.matches("details")?el:el.closest("details");if(d)d.open=true;if(!el.getClientRects().length)return;el.scrollIntoView({block:"center",behavior:matchMedia("(prefers-reduced-motion:reduce)").matches?"auto":"smooth"});el.classList.remove("flash");void el.offsetWidth;el.classList.add("flash");setTimeout(()=>el.classList.remove("flash"),1600)}
function openPS(){const sel=$("s_pot"),rows=[...planCalc(cur()).lines.map(l=>[l.k,potName(l)]),["",t("potOther")]];$("ps_o").innerHTML=rows.map(([k,n])=>{const g=G.find(z=>z.k===k),got=(g?g.s||0:0)+deps.filter(d=>(d.pot||"")===k).reduce((s,d)=>s+d.amount,0);return `<button class="opt pk ${sel.value===k?"on":""}" data-pk="${esc(k)}"><span>${esc(n)}<small>${t("ptSaved",kr(got))}</small></span><i><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7"/></svg></i></button>`}).join("");$("ps").classList.add("on")}
$("s_pot_b").onclick=openPS;$("ps_no").onclick=()=>$("ps").classList.remove("on");$("ps").addEventListener("click",e=>{if(e.target===$("ps"))$("ps").classList.remove("on")});
function openRD(id){const r=ruleById(id);if(!r)return;RD=id;const k=mk(P.y,P.m),M=mn(P.m).toLowerCase(),sk=(r.skip||[]).includes(k),o=[];
  if(sk)o.push(["unskip",t("rdUn",M),""]);else{o.push(["end",t("rdEnd",M),t("rdEndS",M)]);o.push(["skip",t("rdSkip",M),t("rdSkipS")])}
  if(r.end)o.push(["cont",t("rdCont"),t("rdContS")]);o.push(["kill",t("rdKill"),t("rdKillS")]);
  $("rd_t").textContent=r.n||t("rdT");$("rd_s").textContent=t("rdT");$("rd_no").textContent=t("cancel");$("rd_o").innerHTML=o.map(([v,a,b])=>`<button class="opt ${v==="kill"?"bad":""}" data-rdo="${v}">${esc(a)}${b?`<small>${esc(b)}</small>`:""}</button>`).join("");$("rd").classList.add("on")}
const closeRD=()=>{$("rd").classList.remove("on");RD=null};
$("rd_no").onclick=closeRD;$("rd").addEventListener("click",e=>{if(e.target===$("rd"))closeRD()});
function doRD(a){const r=ruleById(RD);if(!r)return closeRD();const k=mk(P.y,P.m),M=mn(P.m).toLowerCase();
  if(a==="end"){r.end=nextKey(k);saveRule(r);toast(t("tEnd",M))}
  else if(a==="skip"){r.skip=[...(r.skip||[]),k];saveRule(r);toast(t("tSkip",M))}
  else if(a==="unskip"){r.skip=(r.skip||[]).filter(x=>x!==k);saveRule(r);toast(t("tBack"))}
  else if(a==="cont"){r.end=null;saveRule(r);toast(t("tBack"))}
  else if(a==="kill"){dropRule(r);toast(t("tKill"))}
  closeRD();buildSheet();render()}
$("g_add").onclick=()=>{const k="c"+Date.now();G.push({k,n:""});saveGoals();buildGoals();buildSheet();render();$("goal_"+k).focus()};
function paintRS(){$("rs_f").innerHTML=[["o","fO"],["m","fM"],["q","fQ"],["y","fY"]].map(([v,l])=>`<button class="${RS.f===v?"on":""}" data-rf="${v}">${t(l)}</button>`).join("");$("rs_l").classList.toggle("hide",RS.f==="o");$("rs_d").classList.toggle("hide",RS.f==="o");$("rs_l").textContent=t(RS.f==="m"?"pickOpt":"pickFirst");$("rs_h").textContent=RS.f==="o"?t("hO",mn(P.m).toLowerCase()):t(RS.f==="m"?"hM":RS.f==="q"?"hQ":"hY");$("rs_amt").classList.toggle("hide",!RS.rid||RS.f==="o");$("rs_al").textContent=t("amtIn",mn(P.m).toLowerCase());$("rs_sc").innerHTML=[["fwd","scFwd"],["one","scOne"]].map(([v,l])=>`<button class="${RS.sc===v?"on":""}" data-sc="${v}">${t(l)}</button>`).join("")}
function openRS(rw,rid,ix){const r=rid?ruleById(rid):null,raw=rawMonth(P.y,P.m),x=r?null:raw[rw][+ix];if(!r&&!x)return;RS={rw,rid,ix:+ix,f:r?r.freq:"o",sc:"fwd"};$("rs_a").value=r?fmtA(amtOf(r,mk(P.y,P.m))):"";$("rs_t").textContent=(r?r.n:x.n)||t("linePh");$("rs_d").value=r?(r.ds||r.freq!=="m"?r.date:""):(x.d||"");$("rs_no").textContent=t("cancel");$("rs_ok").textContent=t("saveW");paintRS();$("rs").classList.add("on")}
const closeRS=()=>{$("rs").classList.remove("on");RS=null};
$("rs_no").onclick=closeRS;$("rs").addEventListener("click",e=>{if(e.target===$("rs"))closeRS()});
$("rs_ok").onclick=()=>{if(!RS)return;const{rw,rid,ix,f}=RS,d=f==="o"?"":$("rs_d").value,k=mk(P.y,P.m);if((f==="q"||f==="y")&&!d){toast(t("needDate"));return}
  const place=(n,a,dt)=>{const at=dt?dt.split("-").map(Number):[P.y,P.m+1],y=at[0],m=at[1]-1,row={n,a,...(dt?{d:dt}:{})};editMonth(md=>md[rw].push(row),y,m);if(y!==P.y||m!==P.m)toast(t("tMoved",mn(m).toLowerCase()))};
  if(rid){const r=ruleById(rid);if(!r)return closeRS();if(f==="o"){const a=amtOf(r,k),n=r.n;ruleStop(r,k);place(n,a,d)}else{const v=parseA($("rs_a").value);if(v!==amtOf(r,k)||(RS.sc==="fwd"&&r.over&&r.over[k]!=null)){if(RS.sc==="one")r.over={...(r.over||{}),[k]:v};else setForward(r,k,v)}r.freq=f;if(d){r.date=d;r.ds=true}else if(f==="m")r.ds=false;saveRule(r)}}
  else{const raw=rawMonth(P.y,P.m),x=raw[rw][ix];if(!x)return closeRS();if(f==="o"){const[dy,dm]=d?d.split("-").map(Number):[P.y,P.m+1];if(dy===P.y&&dm-1===P.m)editMonth(md=>{if(d)md[rw][ix].d=d;else delete md[rw][ix].d});else{editMonth(md=>{md[rw].splice(ix,1)});place(x.n,x.a,d)}}else{editMonth(md=>{md[rw].splice(ix,1)});newRule(rw,x.n,x.a,f,d||defDate(),!!d)}}
  closeRS();buildSheet();render()};
let depBusy=false;
async function addDep(sign,row){if(depBusy)return;
  const a=Math.abs(row?row.amount:parseA($("s_amt").value));if(!a){toast(t("tNeedAmt"));return}
  const k=row?row.k:$("s_pot").value,line=planCalc(cur()).lines.find(l=>l.k===k);depBusy=true;
  try{const before=total(),d={amount:sign*a,note:"",at:depTs(),pot:k||"",potN:line?potName(line):""},after=before+d.amount,n=planCalc(nowMd()).needs;
    if(sign<0&&n>0){if(after<n){if(!await ask(t("pWd1T"),t("pWd1",kr(after),kr(n))))return}else if(after<S.buf*n&&before>=S.buf*n){if(!await ask(t("pWd2T"),t("pWd2",kr(S.buf*n))))return}}
    if(!row)$("s_amt").value="";
    if(col){try{await col.doc("dep_"+Date.now()).set(d)}catch(e){toast(t("tFail"));return}}else{deps.unshift({id:"l"+Date.now(),...d});render()}
    if(sign>0){FX.pulse(1);toast(t("tSaved",kr(a),kr(after)));if(n>0&&before<S.buf*n&&after>=S.buf*n)setTimeout(()=>toast(t("tBuf")),700);else if(n>0&&before<n&&after>=n)setTimeout(()=>toast(t("tStart")),700)}else toast(t("tWd",kr(a),kr(after)))
  }finally{depBusy=false}}
$("s_add").onclick=()=>addDep(1);$("s_out").onclick=()=>addDep(-1);
let rt;$("reset").onclick=async()=>{const b=$("reset");
  if(b.dataset.arm!=="1"){b.dataset.arm="1";b.textContent=t("resetAgain");clearTimeout(rt);rt=setTimeout(()=>{b.dataset.arm="0";b.textContent=t("reset")},4000);return}
  b.dataset.arm="0";b.textContent=t("reset");
  if(col){try{await Promise.all(allIds.map(id=>col.doc(id).delete()))}catch(e){toast(t("tDelFail"));return}}
  deps=[];HOLD=[];SL=[];LO=[];PM={};S.saved=0;seedExample();build();render();persist();toast(t("tDel"))};
document.addEventListener("click",e=>{
  const g=e.target.closest("[data-go]");
  if(g){go(g.dataset.go);if(g.dataset.to)setTimeout(()=>focusTo(g.dataset.to),60);return}
  const yt=e.target.closest(".mnav b");if(yt){if(yrOpen())closeYears();else openYears(yt);return}
  const yr=e.target.closest("[data-yr]");
  if(yr){P.y=+yr.dataset.yr;if(P.y===NOW.getFullYear())P.m=NOW.getMonth();closeYears();refreshMonth();return}
  if(yrOpen()&&!e.target.closest("#yrs"))closeYears();
  const pk=e.target.closest("[data-pk]");if(pk){potPicked=true;$("s_pot").value=pk.dataset.pk;$("s_pot_t").textContent=$("s_pot").selectedOptions[0].text;$("ps").classList.remove("on");return}
  const tt=e.target.closest("[data-tt]");if(tt){S.taxT=Math.min(42,Math.max(29,S.taxT+ +tt.dataset.tt));persist();renderTax();return}
  const xm=e.target.closest("[data-xm]");if(xm){S.taxMode=xm.dataset.xm;persist();renderTax();return}
  const hp=e.target.closest("[data-hp]");if(hp){const x=PRICES.items.find(z=>z.id===hp.dataset.hp);if(x&&HS){HS.ref=x.id;HS.name=x.name;$("hs_nm").textContent=x.name;hsShow("pick");$("hs_qty").focus()}return}
  const hd=e.target.closest("[data-hold]");if(hd){openHS(hd.dataset.hold);return}
  const gv=e.target.closest("[data-gv]");if(gv){const v=["",...G.map(z=>z.k)],i=v.indexOf(SG);SG=v[(i+ +gv.dataset.gv+v.length)%v.length];renderSaving();return}
  const hy=e.target.closest("[data-hy]");if(hy){HY+=+hy.dataset.hy;renderYear();yearScroll();return}
  const jm=e.target.closest("[data-jump]");if(jm){P={y:HY,m:+jm.dataset.jump};refreshMonth();go("b");return}
  const mv=e.target.closest("[data-mv]");if(mv){const d=new Date(P.y,P.m+ +mv.dataset.mv,1);P={y:d.getFullYear(),m:d.getMonth()};refreshMonth();return}
  if(e.target.closest("[data-now]")){P={y:NOW.getFullYear(),m:NOW.getMonth()};refreshMonth();return}
  const ad=e.target.closest("[data-add]");
  if(ad){const rw=ad.dataset.add;editMonth(md=>md[rw].push({n:"",a:0}));buildSheet();render();const f=document.querySelector(`[data-rw="${rw}"][data-f="n"][data-ix="${rawMonth(P.y,P.m)[rw].length-1}"]`);if(f)f.focus();return}
  const rs=e.target.closest("[data-rs]");if(rs){openRS(rs.dataset.rs,rs.dataset.rid,rs.dataset.ix);return}
  const rf=e.target.closest("[data-rf]");if(rf){RS.f=rf.dataset.rf;paintRS();return}
  const sc=e.target.closest("[data-sc]");if(sc){RS.sc=sc.dataset.sc;paintRS();return}
  const dr=e.target.closest("[data-delrw]");
  if(dr){const rw=dr.dataset.delrw;if(dr.dataset.rid){openRD(dr.dataset.rid);return}const i=+dr.dataset.ix;editMonth(md=>{md[rw].splice(i,1)});buildSheet();render();return}
  const rdl=e.target.closest("[data-rdel]");if(rdl){openRD(rdl.dataset.rdel);return}
  const rdo=e.target.closest("[data-rdo]");if(rdo){doRD(rdo.dataset.rdo);return}
  const gd=e.target.closest("[data-gdel]");if(gd){G=G.filter(z=>z.k!==gd.dataset.gdel);saveGoals();buildGoals();buildSheet();render();toast(t("tKill"));return}
  const del=e.target.closest("[data-del]");
  if(del){const id=del.dataset.del;if(col)col.doc(id).delete().catch(()=>{});else{deps=deps.filter(d=>d.id!==id);render()}toast(t("tRem"));return}
  const lg=e.target.closest("[data-lang]");if(lg){S.lang=lg.dataset.lang;persist();applyLang();return}
  const th=e.target.closest("[data-th]");if(th){S.theme=th.dataset.th;applyTheme();persist();render();return}
  const ck=e.target.closest("[data-ck]");if(ck){S.click=ck.dataset.ck==="1";persist();render();return}
  const sn=e.target.closest("[data-sn]");if(sn){S.sound=sn.dataset.sn==="1";persist();render();if(S.sound)chime("save");return}
  const mo=e.target.closest("[data-mo]");if(mo){S.motion=mo.dataset.mo==="1";persist();FX.setMotion();render();return}
  const tg=e.target.closest("[data-tg]");if(tg){S.toasts=tg.dataset.tg==="1";persist();render();if(S.toasts)toast(t("tNotif"));return}});

