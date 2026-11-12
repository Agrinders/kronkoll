/* First start: ask whether to begin from an empty budget or look at the example first, so example figures never quietly become your budget. */
let wlAsked=false;
function startEmpty(){exampleMode=false;RULES=[];PM={};if(col)col.doc("started").set({kind:"started"}).catch(()=>{});
  render();go("b");if(!WIDE.matches){$("d_inc").open=true}toast(tx("Klart. Börja med att lägga in din lön.","Done. Start by adding your pay."),"ok")}
function maybeWelcome(){if(wlAsked)return;if(!document.documentElement.classList.contains("reveal")||$("intro")){setTimeout(maybeWelcome,300);return}
  wlAsked=true;if(!exampleMode||lsN("kronkoll.welcome"))return;
  $("wl_t").textContent=tx("Välkommen till Kronkoll","Welcome to Kronkoll");
  $("wl_p").textContent=tx("Hur vill du börja?","How do you want to start?");
  $("wl_e1").textContent=tx("Börja med en tom budget","Start with an empty budget");
  $("wl_e2").textContent=tx("Du fyller i din lön och dina utgifter själv.","You add your own pay and expenses.");
  $("wl_x1").textContent=tx("Titta på ett exempel först","Look at an example first");
  $("wl_x2").textContent=tx("Påhittade siffror som visar hur appen fungerar. Du kan tömma budgeten när du vill.","Made-up figures that show how the app works. You can empty the budget whenever you like.");
  $("wl_n").textContent=tx("Allt sparas bara på den här telefonen.","Everything is saved on this phone only.");
  $("wl").classList.add("on");setTimeout(()=>$("wl_empty").focus(),50)}
function wlPick(k){lsSet("kronkoll.welcome",1);$("wl").classList.remove("on");if(k==="empty")startEmpty();else{go("h");render()}}
$("wl_empty").onclick=()=>wlPick("empty");$("wl_ex").onclick=()=>wlPick("ex");
$("h_exe").onclick=startEmpty;
