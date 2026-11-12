/* Checks the bigger features with known answers. Run: node tests/features.js */
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const A=path.resolve(__dirname,'..');const T={'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';fs.readFile(path.join(A,u),(e,d)=>{if(e){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':T[path.extname(u)]||'application/octet-stream'});r.end(d)})}).listen(0);
let fails=0;const norm=v=>JSON.stringify(v).replace(/[\u00a0\u202f]/g,' ');const check=(name,got,want)=>{const ok=norm(got)===norm(want);if(!ok)fails++;console.log(ok?'ok  ':'FAIL',name,ok?'':`got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`)};
(async()=>{await new Promise(r=>srv.listening?r():srv.on('listening',r));
const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']});const c=await b.newContext({viewport:{width:384,height:832},colorScheme:'dark',serviceWorkers:'block'});const p=await c.newPage();await p.addInitScript(()=>{if(!sessionStorage.getItem('wlTest'))try{localStorage.setItem('kronkoll.welcome','1');localStorage.setItem('kronkoll.armTips','3')}catch(e){}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.setDefaultTimeout(8000);
await p.goto('http://localhost:'+srv.address().port+'/');await p.waitForTimeout(900);const ev=(f,a)=>p.evaluate(f,a);
// Tax: Skatteverket 2026, table 32 column 1, 30 001–30 200 kr gives 5 751 kr
await ev(()=>go('l'));await p.waitForFunction(()=>!!TAXD);await p.fill('#x_pay','30100');await p.waitForTimeout(150);
check('tax table 32',await ev(()=>[S.taxT,x_big.innerText]),[32,'24 349 kr']);
await p.click('#x_kom');await p.fill('#pk_q','malm');await p.click('[data-pko="Malmö"]');check('Malmö without church',await ev(()=>S.taxT),33);
await p.click('[data-xky="1"]');check('Malmö with church',await ev(()=>S.taxT),34);
check('percent rows above 80 000',await ev(()=>exactTax(95000,32,1)),Math.floor(95000*36/100));
await p.click('[data-xky="0"]');
// Subscription hints are switched off for now
await ev(()=>{go('b');d_out.open=true});await p.waitForTimeout(200);await p.fill('#l_items .am >> nth=0','9 600');await p.locator('#l_items .am >> nth=0').blur();await p.waitForTimeout(900);
const needs=await ev(()=>planCalc(nowMd()).needs);
check('no subscription hints for now',await ev(()=>document.querySelectorAll('.subhint').length),0);check('budget unchanged',await ev(()=>planCalc(nowMd()).needs),needs);
// History: remove a line, then undo brings it back
const first=await ev(()=>RULES.filter(r=>r.t==='items').map(r=>r.n)[0]);await p.waitForTimeout(800);
await p.click('#l_items [data-delrw] >> nth=0');await p.click('#l_items [data-delrw] >> nth=0');await p.waitForTimeout(300);if(await p.locator('#rd.on').count())await p.click('#rd .opt >> nth=-1');await p.waitForTimeout(1400);
check('removed line is gone',await ev(n=>RULES.some(r=>r.n===n&&!r.end&&!r.skip.length),first),false);
await ev(()=>go('u'));await p.click('[data-hu] >> nth=0');await p.waitForTimeout(400);if(await p.locator('#modal.on').count())await p.click('#m_yes');await p.waitForTimeout(500);
check('undo brings it back',await ev(n=>RULES.some(r=>r.n===n&&!r.end&&!r.skip.length),first),true);
// Loans
await ev(()=>go('v'));const addL=async(ty,n,b0,r,pay)=>{await p.click('#v_add');await p.waitForTimeout(200);await p.click(`[data-lty="${ty}"]`);await p.fill('#lo_n',n);await p.fill('#lo_b',b0);await p.fill('#lo_r',r);await p.fill('#lo_p',pay);await p.click('#lo_ok');await p.waitForTimeout(250)};
await addL('bolan','Huset','2 000 000','3,5','3 000');await addL('kredit','Kortet','20 000','18','1 000');
check('total debt',await ev(()=>v_big.innerText),'2 020 000 kr');check('interest deduction',await ev(()=>Math.round(ded(70000))),21000);
// ISK: 1.065 % above 300 000 kr per person
check('ISK tax one person',await ev(()=>{S.iskV=420000;S.iskIn=0;S.iskP=1;renderIsk();return isk_big.innerText}),'1 278 kr');
check('ISK tax two people',await ev(()=>{S.iskP=2;renderIsk();return isk_big.innerText}),'0 kr');
// Larger text never makes the page scroll sideways
await ev(()=>{S.zoom=1.3;applyRead()});const over=[];for(const t of ['h','b','s','a','v','m','l','u','c']){await ev(x=>go(x),t);await p.waitForTimeout(150);if(await ev(()=>document.documentElement.scrollWidth-innerWidth>0))over.push(t)}check('no sideways scroll at largest text',over,[]);
// First start asks how to begin, back keeps the example, and the choice is remembered
{const c2=await b.newContext({viewport:{width:384,height:832},serviceWorkers:'block'});const q=await c2.newPage();q.on('pageerror',e=>errs.push(e.message));const url='http://localhost:'+srv.address().port+'/';
await q.goto(url);await q.waitForSelector('#wl.on',{timeout:8000});check('welcome shows on first start',await q.evaluate(()=>[exampleMode,wl_e1.textContent]),[true,'Börja med en tom budget']);
await q.goBack();await q.waitForTimeout(300);check('back keeps the example',await q.evaluate(()=>[wl.classList.contains('on'),exampleMode,localStorage.getItem('kronkoll.welcome'),!h_ex.classList.contains('hide')]),[false,true,'1',true]);
await q.reload();await q.waitForTimeout(2600);check('not asked again',await q.evaluate(()=>wl.classList.contains('on')),false);
await q.click('#h_exe');await q.waitForTimeout(300);check('empty from example notice',await q.evaluate(()=>[exampleMode,RULES.length,tab]),[false,0,'b']);
await q.evaluate(()=>localStorage.clear());await q.reload();await q.waitForSelector('#wl.on',{timeout:8000});await q.click('#wl_empty');await q.waitForTimeout(300);
check('empty from welcome',await q.evaluate(()=>[exampleMode,RULES.length,tab,d_inc.open]),[false,0,'b',true]);
await q.reload();await q.waitForTimeout(2600);check('empty start survives reload',await q.evaluate(()=>[exampleMode,wl.classList.contains('on')]),[false,false]);await c2.close()}
// Delete needs two taps: the first only turns the cross red, a tap elsewhere or 3 s resets it
await ev(()=>{go('b');d_out.open=true});await p.waitForTimeout(200);{const n0=await ev(()=>document.querySelectorAll('#l_items .lnw').length);
await p.click('#l_items .x >> nth=0');await p.waitForTimeout(150);check('first tap only arms',await ev(()=>[document.querySelectorAll('#l_items .lnw').length,document.querySelector('#l_items .x').classList.contains('arm'),rd.classList.contains('on')]),[n0,true,false]);
await p.click('#b_life');await p.waitForTimeout(150);check('tap elsewhere resets',await ev(()=>document.querySelectorAll('.x.arm').length),0);
await p.click('#l_items .x >> nth=0');await ev(()=>{buildSheet();render()});await p.waitForTimeout(100);check('red survives a redraw',await ev(()=>document.querySelector('#l_items .x').classList.contains('arm')),true);
await p.waitForTimeout(5300);check('resets after 5 s',await ev(()=>document.querySelectorAll('.x.arm').length),0)}
// Notifications: new ones go below, a repeat moves to the top instead of showing twice
await ev(()=>{document.querySelectorAll('#toasts .toast').forEach(t=>t.remove());toast('Första','info');toast('Andra','info');toast('Första','info')});await p.waitForTimeout(350);
check('repeat moves to top, no duplicate',await ev(()=>[...document.querySelectorAll('#toasts .toast')].filter(t=>!t._going).map(t=>t.querySelector('b').textContent)),['Första','Andra']);
await ev(()=>{toast('Tredje','info');toast('Fjärde','info')});await p.waitForTimeout(350);
check('at most three, newest at the bottom',await ev(()=>[...document.querySelectorAll('#toasts .toast')].filter(t=>!t._going).map(t=>t.querySelector('b').textContent)),['Andra','Tredje','Fjärde']);await p.waitForTimeout(500);
{const tops=await ev(()=>[...document.querySelectorAll('#toasts .toast')].map(t=>t.getBoundingClientRect()));{await ev(()=>dropToast(document.querySelector('#toasts .toast')));await p.waitForTimeout(550);const r=await ev(()=>[document.querySelectorAll('#toasts .toast').length,Math.round(document.querySelector('#toasts .toast').getBoundingClientRect().top-toasts.getBoundingClientRect().top)]);check('the rest move up when one leaves',r,[2,0])}
check('notifications do not overlap',tops.every((r,i)=>i===0||r.top>=tops[i-1].bottom-1),true)}
await ev(()=>document.querySelectorAll('#toasts .toast').forEach(t=>t.remove()));
// Second tap slides the row out, then it is gone
await ev(()=>{go('b');d_out.open=true});await p.waitForTimeout(200);{const n0=await ev(()=>document.querySelectorAll('#l_items .lnw').length);
await ev(()=>{editMonth(md=>{md.items.push({n:'Engång',a:99})});buildSheet();render()});await p.waitForTimeout(300);const n1=await ev(()=>document.querySelectorAll('#l_items .lnw').length);
await p.click('#l_items .lnw:last-child .x');await p.click('#l_items .lnw:last-child .x');await p.waitForTimeout(120);check('row is animating out',await ev(()=>[document.querySelectorAll('#l_items .lnw').length,!!document.querySelector('#l_items .lnw:last-child')._going]),[n1,true]);
await p.waitForTimeout(700);check('row removed after the animation',await ev(()=>document.querySelectorAll('#l_items .lnw').length),n1-1)}
// A newer published version shows an update button, which reloads and then cleans the address
await p.route('**/version.json*',r=>r.fulfill({contentType:'application/json',body:'{"b":"newer123"}'}));await ev(()=>checkUpdate());await p.waitForTimeout(300);
check('update button shows',await ev(()=>[!upd.classList.contains('hide'),upd_t.textContent,upd_go.textContent]),[true,'Ny version finns','Uppdatera']);
await p.unroute('**/version.json*');await Promise.all([p.waitForNavigation(),p.click('#upd')]);await p.waitForTimeout(2600);
check('after update the address is clean',await ev(()=>[location.search,upd.classList.contains('hide')]),['',true]);
check('no page errors',errs,[]);await b.close();srv.close();if(fails){console.log('FAILED:',fails);process.exit(1)}console.log('All checks passed')})().catch(e=>{console.error(e);process.exit(1)});
