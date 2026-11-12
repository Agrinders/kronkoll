/* Delete in two taps: the first tap turns the grey cross red, the second deletes. It turns grey again after 3 seconds or a tap anywhere else. */
let armT=0;
function disarm(){clearTimeout(armT);document.querySelectorAll(".x.arm").forEach(x=>{x.classList.remove("arm");x.setAttribute("aria-label",t("del"))})}
document.addEventListener("click",e=>{const x=e.target.closest&&e.target.closest(".x:not([data-subno])");
  if(!x){disarm();return}if(x.classList.contains("arm")){clearTimeout(armT);x.classList.remove("arm");return}
  e.stopImmediatePropagation();e.preventDefault();disarm();x.classList.add("arm");x.setAttribute("aria-label",tx("Tryck igen för att ta bort","Tap again to delete"));
  const n=lsN("kronkoll.armTips");if(n<3){lsSet("kronkoll.armTips",n+1);toast(tx("Tryck på krysset igen för att ta bort","Tap the cross again to delete"),"info")}
  armT=setTimeout(disarm,3000)},true);
/* The second tap: the row flashes red, slides left and folds away, then it is removed. */
function animOut(el,fn){if(!el||el._going){fn();return}el._going=1;
  if(matchMedia("(prefers-reduced-motion:reduce)").matches||!el.animate){fn();return}
  const h=el.offsetHeight,cs=getComputedStyle(el);el.style.overflow="hidden";el.style.pointerEvents="none";
  const slide=el.animate([{transform:"none",opacity:1,background:cs.backgroundColor},{transform:"none",opacity:1,background:"color-mix(in srgb,var(--bad) 16%,var(--glass2))",offset:.25},{transform:"translateX(-36px)",opacity:0,background:"color-mix(in srgb,var(--bad) 16%,var(--glass2))"}],{duration:230,easing:"cubic-bezier(.4,0,.6,1)",fill:"forwards"});
  slide.onfinish=()=>{el.animate([{height:h+"px",marginTop:cs.marginTop,paddingTop:cs.paddingTop,paddingBottom:cs.paddingBottom,borderTopWidth:cs.borderTopWidth,borderBottomWidth:cs.borderBottomWidth},{height:"0px",marginTop:"0px",paddingTop:"0px",paddingBottom:"0px",borderTopWidth:"0px",borderBottomWidth:"0px"}],{duration:200,easing:"cubic-bezier(.2,.8,.2,1)",fill:"forwards"}).onfinish=fn}}
