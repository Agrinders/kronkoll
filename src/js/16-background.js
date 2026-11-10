/* Living background: three bodies of liquid, sized by this month's real bills, saving and living money.
   Contour lines flow out of them, taps ripple through them, saving makes the green body swell. */
const FX=(()=>{
  const noop={sync(){},tab(){},pulse(){},setMotion(){}},c=$("fx");
  const gl=c.getContext("webgl2",{antialias:false,alpha:false,powerPreference:"low-power"});if(!gl){c.hidden=true;return noop}
  const VS=`#version 300 es
in vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;
  const FS=`#version 300 es
precision highp float;uniform vec2 R;uniform float T,Dk,Sc,Mi;uniform vec3 M,W,C1,C2,C3,BG,Rip[3];uniform vec2 P[3];out vec4 o;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<3;i++){v+=a*n(p);p=p*2.03+vec2(17.,9.);a*=.5;}return v;}
float fbm5(vec2 p){float v=0.,a=.5;mat2 r=mat2(.8,.6,-.6,.8);for(int i=0;i<5;i++){v+=a*n(p);p=r*p*2.02+vec2(3.1,7.7);a*=.5;}return v;}
float body(vec2 p,vec2 c,float w){vec2 d=p-c;float s=.26+.62*sqrt(max(w,0.));return exp(-dot(d,d)/(s*s))*(.55+w);}
void main(){vec2 uv=(gl_FragCoord.xy-.5*R)/min(R.x,R.y);uv.y+=Sc;{vec2 d=uv-vec2(M.x,M.y+Sc);uv-=d*exp(-dot(d,d)*7.)*.26*M.z;}
  for(int i=0;i<3;i++){float a=Rip[i].z;if(a>=0.&&a<1.){vec2 d=uv-vec2(Rip[i].x,Rip[i].y+Sc);float r=length(d),q=r-a*1.5;uv+=d/(r+.001)*sin(q*24.)*exp(-q*q*22.)*(1.-a)*.05;}}
  vec2 q=vec2(fbm(uv*1.35+vec2(0.,T*.045)),fbm(uv*1.35+vec2(5.2,1.3)-vec2(T*.038,0.)));
  vec2 p=uv+(q-.5)*1.05;
  float t=T*.11;
  float f1=body(p,P[0]+.1*vec2(cos(t*1.3),sin(t)),W.x),f2=body(p,P[1]+.12*vec2(sin(t*.9+2.),cos(t*1.2)),W.y),f3=body(p,P[2]+.11*vec2(cos(t*.7+4.),sin(t*1.1+1.)),W.z);
  float H=f1+f2+f3;vec3 col=(C1*f1+C2*f2+C3*f3)/(H+.0001);
  float m=smoothstep(.02,.95,H);vec3 base=mix(BG,col,m*mix(.62,.72,Dk));
  if(Mi>.5){
    /* Mist: slow layered clouds tinted by the month's colours, no lines. */
    float c1=fbm5(p*1.1+vec2(T*.034,-T*.012)),c2=fbm5(p*2.3+vec2(c1*1.9,-T*.04)+vec2(-T*.018,0.)),c3=fbm5(p*4.8-vec2(T*.055,c2*1.3));
    float cl=smoothstep(.3,.78,c1*.58+c2*.44+c3*.2);float wisp=smoothstep(.5,.9,c2*.72+c3*.5);float deep=smoothstep(.55,.2,c1*.7+c2*.3);
    vec3 haze=mix(BG,col,m*mix(.36,.5,Dk)+.1);
    vec3 cloud=mix(col,vec3(1.),mix(.66,.42,Dk));
    base=mix(haze,cloud,cl*mix(.7,.6,Dk));base=mix(base,mix(vec3(1.),min(col*1.5+.18,vec3(1.)),Dk),wisp*mix(.34,.3,Dk));base*=1.-deep*mix(.06,.22,Dk);
    base*=1.-.18*smoothstep(.2,1.4,length(uv-vec2(0.,Sc)));
    base+=(h(gl_FragCoord.xy+fract(T))-.5)/140.;o=vec4(base,1.);return;}
  float v=H*8.-T*.16;float l=abs(fract(v)-.5)/max(fwidth(v),.0001);float line=(1.-smoothstep(.6,1.9,l))*smoothstep(.03,.3,H);
  vec3 ink=mix(col*.62,min(col*1.7+.12,vec3(1.)),Dk);base=mix(base,ink,line*mix(.42,.55,Dk));
  base+=(h(gl_FragCoord.xy+fract(T))-.5)/160.;o=vec4(base,1.);}`;
  const LAY={h:[[-.28,.5],[.36,-.08],[-.22,-.72]],b:[[.36,.62],[-.36,.04],[.32,-.66]],s:[[-.42,-.5],[.02,.34],[.46,-.64]],r:[[.02,.76],[-.42,-.2],[.42,-.36]],m:[[.46,.22],[-.46,.68],[-.1,-.62]]};
  let pr,U={},raf=0,last=0,w=[.45,.2,.35],wT=w.slice(),pulse=[0,0,0],pos=LAY.h.map(a=>a.slice()),posT=LAY.h,rip=[[0,0,-9],[0,0,-9],[0,0,-9]],ri=0,t0=performance.now();
  const hex=s=>{s=s.trim().replace("#","");return[0,2,4].map(i=>parseInt(s.slice(i,i+2),16)/255)};
  const still=()=>!S.motion||matchMedia("(prefers-reduced-motion:reduce)").matches;
  let mouse=[0,0],mz=0,mzT=0;
  function init(){const sh=(k,src)=>{const o=gl.createShader(k);gl.shaderSource(o,src);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(o));return o};
    pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);const a=gl.getAttribLocation(pr,"a");gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
    ["R","T","Dk","Sc","Mi","M","W","C1","C2","C3","BG","Rip","P"].forEach(n=>U[n]=gl.getUniformLocation(pr,n));colors();size()}
  function colors(){const cs=getComputedStyle(document.documentElement);gl.useProgram(pr);["1","2","3"].forEach(i=>gl.uniform3fv(U["C"+i],hex(cs.getPropertyValue("--f"+i))));gl.uniform3fv(U.BG,hex(cs.getPropertyValue("--fbg")));gl.uniform1f(U.Dk,cs.getPropertyValue("--dk").trim()==="1"?1:0);kick()}
  function size(){const k=Math.min(devicePixelRatio||1,1.5,Math.sqrt(1.6e6/(innerWidth*innerHeight))),W=Math.round(innerWidth*k),H=Math.round(innerHeight*k);if(c.width!==W||c.height!==H){c.width=W;c.height=H;gl.viewport(0,0,W,H)}gl.uniform2f(U.R,W,H);kick()}
  function draw(now){const T=still()?42:(now-t0)/1000,asp=innerWidth/innerHeight,sx=asp>1?asp:1,sy=asp>1?.47:Math.min(1,.5/asp/1.07),st=still()?1:.05;
    w=w.map((v,i)=>v+(wT[i]-v)*st);pulse=pulse.map(v=>v*.97);pos.forEach((p,i)=>{p[0]+=(posT[i][0]-p[0])*(still()?1:.03);p[1]+=(posT[i][1]-p[1])*(still()?1:.03)});
    mz+=(mzT-mz)*.08;gl.uniform3f(U.M,mouse[0],mouse[1],still()?0:mz);gl.uniform1f(U.T,T);gl.uniform1f(U.Mi,S.bg==="mist"?1:0);gl.uniform1f(U.Sc,window.scrollY*.00035);gl.uniform3f(U.W,w[0]+pulse[0]*.5,w[1]+pulse[1]*.5,w[2]+pulse[2]*.5);
    gl.uniform2fv(U.P,new Float32Array(pos.flatMap(p=>[p[0]*sx,p[1]*sy])));
    gl.uniform3fv(U.Rip,new Float32Array(rip.flatMap(r=>[r[0],r[1],still()?-9:(T-r[2])/2.4])));gl.drawArrays(gl.TRIANGLES,0,3)}
  function loop(now){raf=requestAnimationFrame(loop);if(now-last<33)return;last=now;draw(now)}
  function kick(){if(still()){cancelAnimationFrame(raf);raf=0;requestAnimationFrame(draw)}else if(!raf)raf=requestAnimationFrame(loop)}
  try{init()}catch(e){c.hidden=true;return noop}
  addEventListener("resize",size,{passive:true});
  new MutationObserver(colors).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
  matchMedia("(prefers-color-scheme:dark)").addEventListener("change",colors);
  c.addEventListener("webglcontextlost",e=>{e.preventDefault();cancelAnimationFrame(raf);raf=0});
  c.addEventListener("webglcontextrestored",()=>{try{init()}catch(e){c.hidden=true}});
  document.addEventListener("pointerdown",e=>{const m=Math.min(innerWidth,innerHeight);rip[ri]=[(e.clientX-innerWidth/2)/m,-(e.clientY-innerHeight/2)/m,(performance.now()-t0)/1000];ri=(ri+1)%3},{passive:true});
  document.addEventListener("pointermove",e=>{if(e.pointerType!=="mouse")return;const m=Math.min(innerWidth,innerHeight);mouse=[(e.clientX-innerWidth/2)/m,-(e.clientY-innerHeight/2)/m];mzT=1},{passive:true});
  document.documentElement.addEventListener("mouseleave",()=>{mzT=0});
  return{sync(p){const s=p.needs+p.save+Math.max(0,p.life);if(s>0)wT=[p.needs/s,p.save/s,Math.max(0,p.life)/s];kick()},tab(x){posT=LAY[x]||LAY.h;kick()},pulse(i){pulse[i]=1;kick()},setMotion(){kick()}};
})();
const WIDE=matchMedia("(min-width:700px)"),RAIL=matchMedia("(min-width:1024px)");
