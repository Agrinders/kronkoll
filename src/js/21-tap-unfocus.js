/* While typing on a touch screen, a tap somewhere else only closes the keyboard. It does not press a button, open another field
   or do anything else; the next tap works as usual. Buttons in the same pop-up or form as the field still work in one tap
   (Spara, Lägg till, picking from a list), and scrolling while typing keeps the keyboard up. Mouse use is unchanged. */
let tapGuard=null;
const isEdit=a=>!!a&&a!==document.body&&(a.isContentEditable||a.tagName==="TEXTAREA"||(a.tagName==="INPUT"&&!/^(checkbox|radio|range|button|submit|color|file)$/.test(a.type)));
function tapAllowed(a,t){if(a.contains(t))return true;const b=t.closest&&t.closest("button,[role=button],.opt,label,a");if(!b||b.matches("input,textarea"))return false;
  const scope=a.closest(".mbox,.form");return !!scope&&scope.contains(b)}
window.addEventListener("pointerdown",e=>{if(e.pointerType!=="touch")return;const a=document.activeElement;if(!isEdit(a)||tapAllowed(a,e.target))return;
  tapGuard={a,at:Date.now()};e.stopImmediatePropagation()},true);
window.addEventListener("pointercancel",()=>{if(tapGuard&&!tapGuard.done)tapGuard=null},true);
window.addEventListener("touchend",e=>{if(!tapGuard||tapGuard.done)return;if(Date.now()-tapGuard.at>1500){tapGuard=null;return}
  e.preventDefault();const a=tapGuard.a;tapGuard={done:Date.now()};a.blur()},{capture:true,passive:false});
window.addEventListener("click",e=>{if(!tapGuard||!tapGuard.done)return;const fresh=Date.now()-tapGuard.done<700;tapGuard=null;if(fresh){e.preventDefault();e.stopImmediatePropagation()}},true);
