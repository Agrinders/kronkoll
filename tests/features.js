/* Checks the bigger features with known answers. Run: node tests/features.js */
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const A=path.resolve(__dirname,'..');const T={'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';fs.readFile(path.join(A,u),(e,d)=>{if(e){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':T[path.extname(u)]||'application/octet-stream'});r.end(d)})}).listen(0);
let fails=0;const norm=v=>JSON.stringify(v).replace(/[\u00a0\u202f]/g,' ');const check=(name,got,want)=>{const ok=norm(got)===norm(want);if(!ok)fails++;console.log(ok?'ok  ':'FAIL',name,ok?'':`got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`)};
(async()=>{await new Promise(r=>srv.listening?r():srv.on('listening',r));
const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']});const c=await b.newContext({viewport:{width:384,height:832},colorScheme:'dark',serviceWorkers:'block'});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.setDefaultTimeout(8000);
await p.goto('http://localhost:'+srv.address().port+'/');await p.waitForTimeout(900);const ev=(f,a)=>p.evaluate(f,a);
// Tax: Skatteverket 2026, table 32 column 1, 30 001–30 200 kr gives 5 751 kr
await ev(()=>go('l'));await p.waitForFunction(()=>!!TAXD);await p.fill('#x_pay','30100');await p.waitForTimeout(150);
check('tax table 32',await ev(()=>[S.taxT,x_big.innerText]),[32,'24 349 kr']);
await p.click('#x_kom');await p.fill('#pk_q','malm');await p.click('[data-pko="Malmö"]');check('Malmö without church',await ev(()=>S.taxT),33);
await p.click('[data-xky="1"]');check('Malmö with church',await ev(()=>S.taxT),34);
check('percent rows above 80 000',await ev(()=>exactTax(95000,32,1)),Math.floor(95000*36/100));
await p.click('[data-xky="0"]');
// Subscription hint adds to Abonnemang without changing the budget
await ev(()=>{go('b');d_out.open=true});await p.waitForTimeout(200);await p.fill('#l_items .am >> nth=0','9 600');await p.locator('#l_items .am >> nth=0').blur();await p.waitForTimeout(900);
const needs=await ev(()=>planCalc(nowMd()).needs);
await p.click('#l_items .subhint [data-subadd] >> nth=0');await p.waitForTimeout(300);check('hint adds a subscription',await ev(()=>SL.length),1);check('budget unchanged',await ev(()=>planCalc(nowMd()).needs),needs);
// History: remove a line, then undo brings it back
const first=await ev(()=>RULES.filter(r=>r.t==='items').map(r=>r.n)[0]);await p.waitForTimeout(800);
await p.click('#l_items [data-delrw] >> nth=0');await p.waitForTimeout(300);if(await p.locator('#rd.on').count())await p.click('#rd .opt >> nth=-1');await p.waitForTimeout(900);
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
check('no page errors',errs,[]);await b.close();srv.close();if(fails){console.log('FAILED:',fails);process.exit(1)}console.log('All checks passed')})().catch(e=>{console.error(e);process.exit(1)});
