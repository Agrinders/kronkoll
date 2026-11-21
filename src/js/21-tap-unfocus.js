/* While typing on a touch screen, a tap outside the item you are in only closes the keyboard. It does not press a button,
   open another field or do anything else; the next tap works as usual. Scrolling while typing keeps the keyboard up.
   Mouse use is unchanged. */
let tapGuard=null;
const isEdit=a=>!!a&&a!==document.body&&(a.isContentEditable||a.tagName==="TEXTAREA"||(a.tagName==="INPUT"&&!/^(checkbox|radio|range|button|submit|color|file)$/.test(a.type)));
/* Taps inside the same item (a budget row, a savings goal card, a form or a pop-up) work at once, so you can go
   from the name straight to the amount. Taps anywhere else only close the keyboard. */
function tapAllowed(a,t){if(a.contains(t))return true;const item=a.closest(".lnw,.form,.mbox,.set");return !!item&&item.contains(t)}
window.addEventListener("pointerdown",e=>{if(e.pointerType!=="touch")return;const a=document.activeElement;if(!isEdit(a)||tapAllowed(a,e.target))return;
  tapGuard={a,at:Date.now()};e.stopImmediatePropagation()},true);
window.addEventListener("pointercancel",()=>{if(tapGuard&&!tapGuard.done)tapGuard=null},true);
window.addEventListener("touchend",e=>{if(!tapGuard||tapGuard.done)return;if(Date.now()-tapGuard.at>1500){tapGuard=null;return}
  e.preventDefault();const a=tapGuard.a;tapGuard={done:Date.now()};a.blur()},{capture:true,passive:false});
window.addEventListener("click",e=>{if(!tapGuard||!tapGuard.done)return;const fresh=Date.now()-tapGuard.done<700;tapGuard=null;if(fresh){e.preventDefault();e.stopImmediatePropagation()}},true);
