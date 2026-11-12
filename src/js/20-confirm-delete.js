/* Delete in two taps: the first tap turns the grey cross red, the second deletes. It turns grey again after 3 seconds or a tap anywhere else. */
let armT=0;
function disarm(){clearTimeout(armT);document.querySelectorAll(".x.arm").forEach(x=>{x.classList.remove("arm");x.setAttribute("aria-label",t("del"))})}
document.addEventListener("click",e=>{const x=e.target.closest&&e.target.closest(".x:not([data-subno])");
  if(!x){disarm();return}if(x.classList.contains("arm")){clearTimeout(armT);x.classList.remove("arm");return}
  e.stopImmediatePropagation();e.preventDefault();disarm();x.classList.add("arm");x.setAttribute("aria-label",tx("Tryck igen för att ta bort","Tap again to delete"));
  const n=lsN("kronkoll.armTips");if(n<3){lsSet("kronkoll.armTips",n+1);toast(tx("Tryck på krysset igen för att ta bort","Tap the cross again to delete"),"info")}
  armT=setTimeout(disarm,3000)},true);
