import{u as q,v as zt}from"./index-BeqeP4Km.js";const V=50,D=V+1,ie={solid:0,outline:1,contour:2},tt=.877,z=u=>u-Math.floor(u),ce=u=>{const r=[u*.1031,u*.103,u*.0973].map(z),p=r[0]*(r[1]+33.33)+r[1]*(r[2]+33.33)+r[2]*(r[0]+33.33);return r.map(d=>z(d+p))},le=u=>{const r=[u[0]*.1031,u[1]*.103,u[2]*.0973].map(z),p=r[0]*(r[1]+33.33)+r[1]*(r[0]+33.33)+r[2]*(r[2]+33.33),d=r.map(X=>z(X+p));return[z((d[0]+d[1])*d[2]),z((d[0]+d[0])*d[1]),z((d[1]+d[0])*d[0])]},ue=u=>{let r=String(u||"").trim().replace("#","");return r.length===3&&(r=r.replace(/./g,p=>p+p)),/^[0-9a-f]{6}/i.test(r)?[0,2,4].map(p=>parseInt(r.slice(p,p+2),16)/255):[1,1,1]},g=(u,r,p)=>Math.min(p,Math.max(r,u)),$=(u,r,p)=>{const d=g((p-u)/(r-u),0,1);return d*d*(3-2*d)},fe=u=>1-Math.pow(1-g(u,0,1),3),Tt=u=>{const r=g(u,0,1);return r<.5?4*r*r*r:1-Math.pow(-2*r+2,3)/2},he=`#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`,me=`#version 300 es
precision highp float;

uniform vec2 uResolution;
uniform float uScale;
uniform vec4 uBalls[${D}];
uniform vec4 uShapes[${D}];
uniform int uCount;
uniform float uGamma;
uniform float uThreshold;
uniform vec3 uColor;
uniform vec3 uCursorColor;
uniform int uVariant;
uniform float uLine;
uniform float uSpacing;
uniform float uRings;
uniform float uOpaque;

out vec4 outColor;

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) * uScale;
  float field = 0.0;
  float tint = 0.0;
  float mass = 0.0;
  vec2 grad = vec2(0.0);
  bool classic = abs(uGamma - 1.0) < 0.001;
  for (int i = 0; i < ${D}; i++) {
    if (i >= uCount) break;
    vec4 ball = uBalls[i];
    vec4 shape = uShapes[i];
    vec2 d = p - ball.xy;
    vec2 q = vec2(shape.x * d.x + shape.y * d.y, shape.y * d.x + shape.z * d.y);
    float qq = max(dot(q, q), ball.z * 1e-4 + 1e-12);
    float v = ball.z / qq;
    float w = classic ? v : pow(v, uGamma);
    field += w;
    float weight = w / (1.0 + w / uThreshold);
    mass += weight;
    tint += weight * ball.w;
    grad -= 2.0 * uGamma * w / qq * vec2(shape.x * q.x + shape.y * q.y, shape.y * q.x + shape.z * q.y);
  }
  float slope = max(length(grad) * uScale, 1e-8);
  vec3 color = mix(uColor, uCursorColor, mass > 0.0 ? clamp(tint / mass, 0.0, 1.0) : 0.0);
  float alpha;
  if (uVariant == 0) {
    alpha = field > 3.0 * uThreshold ? 1.0 : clamp((field - uThreshold) / slope + 0.5, 0.0, 1.0);
  } else if (uVariant == 1) {
    alpha = field > 3.0 * uThreshold ? 0.0 : clamp(0.5 * uLine + 0.5 - abs((field - uThreshold) / slope), 0.0, 1.0);
  } else {
    float rho = pow(max(field / uThreshold, 1e-6), -0.5 / uGamma);
    float rate = rho * slope / (2.0 * uGamma * max(field, 1e-8));
    float u = (rho - 1.0) / uSpacing;
    float ring = floor(u + 0.5);
    float gap = (u - ring) * uSpacing / max(rate, 1e-8);
    alpha = clamp(0.5 * uLine + 0.5 - abs(gap), 0.0, 1.0);
    alpha *= ring < -0.5 || ring > uRings + 0.5 ? 0.0 : 1.0 - ring / (uRings + 1.0);
    if (ring > 0.5) alpha *= smoothstep(uLine * 6.0, uLine * 12.0, uSpacing / max(rate, 1e-8));
  }
  outColor = vec4(color * alpha, uOpaque > 0.5 ? 1.0 : alpha);
}
`,qt=(u,r,p)=>{const d=u.createShader(r);return u.shaderSource(d,p),u.compileShader(d),d},Bt=u=>{const r=ce(u+1),p=le(r);return{start:r[0]*Math.PI*2,rate:.1*Math.PI+r[1]*.3*Math.PI,reach:5+r[1]*5,toggle:Math.floor(p[0]*2),radius:.5+p[2]*1.5,lane:p[1]*2-1,rise:.55+r[2]*.7,sway:p[0]*Math.PI*2,delay:.1+z(r[2]*7.31+p[1]*3.17)*.55,x:0,y:0,vx:0,vy:0,fx:0,fy:0,ax:0,ay:0,avx:0,avy:0,a:0,b:0,va:0,vb:0}},de=({className:u="",color:r="#ffffff",cursorBallColor:p="#ffffff",speed:d=.3,enableMouseInteraction:X=!0,hoverSmoothness:Ft=.1,animationSize:It=30,ballCount:Ot=15,clumpFactor:Pt=1,cursorBallSize:Vt=3,enableTransparency:_t=!1,variant:Gt="solid",motion:Nt="orbit",gooeyness:Dt=.5,stickiness:jt=.5,stretch:kt=.5,wobble:Ut=.5,lineWidth:Wt=1.5,rings:Ht=4,clickBurst:$t=!0,intro:Xt=!0,paused:Yt=!1,dpr:Kt,style:Jt})=>{const et=q.useRef(null),nt=q.useRef(null),ot={color:r,cursorBallColor:p,speed:d,enableMouseInteraction:X,hoverSmoothness:Ft,animationSize:It,ballCount:Ot,clumpFactor:Pt,cursorBallSize:Vt,enableTransparency:_t,variant:Gt,motion:Nt,gooeyness:Dt,stickiness:jt,stretch:kt,wobble:Ut,lineWidth:Wt,rings:Ht,clickBurst:$t,paused:Yt,dpr:Kt},T=q.useRef(ot);T.current=ot;const Qt=q.useRef(Xt),Y=q.useRef(null);return q.useEffect(()=>{const _=et.current,R=nt.current;if(!_||!R)return;const a=R.getContext("webgl2",{alpha:!0,antialias:!1,premultipliedAlpha:!0});if(!a)return;const A=a.createProgram();if(a.attachShader(A,qt(a,a.VERTEX_SHADER,he)),a.attachShader(A,qt(a,a.FRAGMENT_SHADER,me)),a.bindAttribLocation(A,0,"position"),a.linkProgram(A),!a.getProgramParameter(A,a.LINK_STATUS))return;a.useProgram(A);const at=a.createBuffer();a.bindBuffer(a.ARRAY_BUFFER,at),a.bufferData(a.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),a.STATIC_DRAW),a.enableVertexAttribArray(0),a.vertexAttribPointer(0,2,a.FLOAT,!1,0,0);const v=t=>a.getUniformLocation(A,t),x={resolution:v("uResolution"),scale:v("uScale"),balls:v("uBalls"),shapes:v("uShapes"),count:v("uCount"),gamma:v("uGamma"),threshold:v("uThreshold"),color:v("uColor"),cursorColor:v("uCursorColor"),variant:v("uVariant"),line:v("uLine"),spacing:v("uSpacing"),rings:v("uRings"),opaque:v("uOpaque")},S=new Float32Array(D*4),K=new Float32Array(D*4),B=Array.from({length:V},(t,e)=>Bt(e)),Zt=Bt(V+7),c={x:0,y:0,vx:0,vy:0,a:0,b:0,va:0,vb:0,pulse:0,pulseVelocity:0,ready:!1},C={x:0,y:0,inside:!1},te=window.matchMedia("(prefers-reduced-motion: reduce)").matches,w={width:1,height:1,ratio:1},J=new Map,rt=t=>(J.has(t)||J.set(t,ue(t)),J.get(t));let F=0,j=0,st=Qt.current&&!te?0:-1,k=!0,G=0,U=0,N=!0,Q=!1;const ee=()=>{const t=_.getBoundingClientRect(),e=T.current,o=Math.max(.5,Math.min(e.dpr??window.devicePixelRatio??1,2));w.width=Math.max(1,t.width),w.height=Math.max(1,t.height),w.ratio=o,R.width=Math.max(1,Math.round(w.width*o)),R.height=Math.max(1,Math.round(w.height*o)),a.viewport(0,0,R.width,R.height),N=!0},it=()=>{Q=!0,Z()},ct=(t,e)=>{const o=_.getBoundingClientRect(),s=T.current.animationSize/Math.max(1,o.height);return{x:(t-o.left-o.width/2)*s,y:(o.top+o.height/2-e)*s,inside:t>=o.left&&t<=o.right&&e>=o.top&&e<=o.bottom}},lt=()=>{if(st<0)return{size:1,time:1/0};const t=j-st;return{size:fe(t/.5),time:t}},ne=(t,e)=>e.time===1/0?1:Tt((e.time-t.delay)/1.15),ut=(t,e,o)=>{const s=e.animationSize*w.width/w.height/2,m=e.animationSize/2,h=Math.min(1.25,e.clumpFactor);if(e.motion==="lava"){const n=Math.sin(F*t.rise*1.6+t.start),l=t.lane*s*.8*h+Math.sin(F*.5*t.rise+t.sway)*s*.06,y=Math.sign(n)*Math.pow(Math.abs(n),.55)*m*.9;return[l*o,y*o]}if(e.motion==="drift"){const n=Math.sin(F*t.rise*.9+t.start)*s*.84*h,l=Math.sin(F*t.rate*1.3+t.sway)*m*.78*h;return[n*o,l*o]}const f=F*t.rate,i=t.start+f;return[Math.cos(i)*t.reach*e.clumpFactor*o,Math.sin(i+f*t.toggle)*t.reach*e.clumpFactor*o]},ft=(t,e,o)=>{const s=Math.hypot(t.vx,t.vy),m=.6*o.stretch*Math.tanh(s/14);let h=0,f=0;s>1e-4&&(h=m*(t.vx*t.vx-t.vy*t.vy)/(s*s),f=m*2*t.vx*t.vy/(s*s));const i=13,n=.85-.68*g(o.wobble,0,1);t.va+=(i*i*(h-t.a)-2*n*i*t.va)*e,t.vb+=(i*i*(f-t.b)-2*n*i*t.vb)*e,t.a+=t.va*e,t.b+=t.vb*e},ht=t=>{const e=g(t.gooeyness,0,1),o=e<.5?1+(.5-e)*1.2:1-(e-.5)*.5;return{gamma:o,threshold:Math.pow(1.3,o),reach:Math.pow(2,.5/o)}},oe=(t,e,o,s)=>{const{reach:m}=ht(e),h=36*g(e.stickiness,0,1),f=e.cursorBallSize*tt*s.size*(1+c.pulse);F+=t*e.speed;for(let i=0;i<o;i++){const n=B[i],[l,y]=ut(n,e,ne(n,s));n.avx=g((l-n.ax)/t,-40,40),n.avy=g((y-n.ay)/t,-40,40),n.ax=l,n.ay=y,n.fx=20*(l-n.x)-5.4*(n.vx-n.avx),n.fy=20*(y-n.y)-5.4*(n.vy-n.avy)}for(let i=0;i<o;i++){const n=B[i],l=n.radius*tt*s.size;for(let L=i+1;L<o;L++){const M=B[L],E=M.radius*tt*s.size,Mt=M.x-n.x,Rt=M.y-n.y,O=Math.hypot(Mt,Rt)||1e-4,St=(l+E)*m;if(O>=St)continue;const H=(l+E)*.62;let P;if(O<H)P=-60*(H-O);else{const Et=(O-H)/(St-H);P=h*Math.min(l,E)*$(0,.6,Et)*(1-$(.82,1,Et))}const bt=Mt/O,At=Rt/O,Ct=l*l+.05,Lt=E*E+.05;n.fx+=bt*P/Ct,n.fy+=At*P/Ct,M.fx-=bt*P/Lt,M.fy-=At*P/Lt}const y=c.x-n.x,b=c.y-n.y,I=Math.hypot(y,b)||1e-4,wt=(l+f)*m;if(I<wt){const L=(l+f)*.62;let M;if(I<L)M=-140*(L-I);else{const E=(I-L)/(wt-L);M=h*.6*l*$(0,.6,E)*(1-$(.82,1,E))}n.fx+=y/I*M/(l*l+.05),n.fy+=b/I*M/(l*l+.05)}}for(let i=0;i<o;i++){const n=B[i];n.vx+=n.fx*t,n.vy+=n.fy*t,n.x+=n.vx*t,n.y+=n.vy*t,ft(n,t,e),Number.isFinite(n.x+n.y+n.vx+n.vy+n.a+n.b+n.va+n.vb)||Object.assign(n,{x:n.ax,y:n.ay,vx:0,vy:0,a:0,b:0,va:0,vb:0})}},ae=(t,e,o)=>{let s,m;if(C.inside&&e.enableMouseInteraction)s=C.x,m=C.y;else{const l=o.time===1/0?1:Tt((o.time-.75)/1.3);if(e.motion==="lava"||e.motion==="drift")[s,m]=ut(Zt,e,l);else{const y=e.animationSize*w.width/w.height/2,b=e.animationSize/2;s=Math.cos(j*e.speed)*y*.3*l,m=Math.sin(j*e.speed)*b*.3*l}}c.ready||(c.x=s,c.y=m,c.ready=!0);const h=1-Math.pow(1-g(e.hoverSmoothness,.001,1),t*60),f=c.x+(s-c.x)*h,i=c.y+(m-c.y)*h,n=1-Math.exp(-t/.05);c.vx+=((f-c.x)/Math.max(t,1e-4)-c.vx)*n,c.vy+=((i-c.y)/Math.max(t,1e-4)-c.vy)*n,c.x=f,c.y=i},re=(t,e)=>{const o=T.current,s=g(Math.round(o.ballCount),0,V),m=o.animationSize*.45;for(let h=0;h<s;h++){const f=B[h],i=f.x-t,n=f.y-e,l=Math.hypot(i,n)||1e-4;if(l>m)continue;const b=72*Math.pow(1-l/m,1.2);f.vx+=i/l*b-n/l*b*.3,f.vy+=n/l*b+i/l*b*.3}c.pulseVelocity+=9},mt=(t,e,o)=>{const s=Math.hypot(t.a,t.b),m=Math.cosh(s),h=s>1e-6?Math.sinh(s)/s:1;e[o]=m-h*t.a,e[o+1]=-h*t.b,e[o+2]=m+h*t.a,e[o+3]=0},se=()=>{const t=T.current,e=g(Math.round(t.ballCount),0,V),o=lt(),{gamma:s,threshold:m}=ht(t);for(let f=0;f<e;f++){const i=B[f],n=i.radius*o.size;S[f*4]=i.x,S[f*4+1]=i.y,S[f*4+2]=n*n,S[f*4+3]=0,mt(i,K,f*4)}const h=t.cursorBallSize*o.size*(1+c.pulse);S[e*4]=c.x,S[e*4+1]=c.y,S[e*4+2]=h*h,S[e*4+3]=1,mt(c,K,e*4),a.uniform2f(x.resolution,R.width,R.height),a.uniform1f(x.scale,t.animationSize/R.height),a.uniform4fv(x.balls,S),a.uniform4fv(x.shapes,K),a.uniform1i(x.count,e+1),a.uniform1f(x.gamma,s),a.uniform1f(x.threshold,m),a.uniform3fv(x.color,rt(t.color)),a.uniform3fv(x.cursorColor,rt(t.cursorBallColor)),a.uniform1i(x.variant,ie[t.variant]??0),a.uniform1f(x.line,Math.max(.25,t.lineWidth)*w.ratio),a.uniform1f(x.spacing,.28),a.uniform1f(x.rings,g(Math.round(t.rings),0,12)),a.uniform1f(x.opaque,t.enableTransparency?0:1),a.clearColor(0,0,0,t.enableTransparency?0:1),a.clear(a.COLOR_BUFFER_BIT),a.drawArrays(a.TRIANGLES,0,3),N=!1},pt=t=>{if(G=0,Q&&(Q=!1,ee()),!k)return;const e=Math.min(.05,U?(t-U)/1e3:1/60);U=t;const o=T.current;if(!o.paused&&e>1e-4){j+=e;const s=g(Math.round(o.ballCount),0,V),m=lt();ae(e,o,m);const h=Math.max(1,Math.ceil(e/(1/240)));for(let f=0;f<h;f++)oe(e/h,o,s,m);ft(c,e,o),c.pulseVelocity+=(-170*c.pulse-2*.42*13*c.pulseVelocity)*e,c.pulse=Math.max(-.4,c.pulse+c.pulseVelocity*e),N=!0}N&&se(),G=requestAnimationFrame(pt)},Z=()=>{G||!k||(U=0,G=requestAnimationFrame(pt))},dt=t=>{const e=ct(t.clientX,t.clientY);C.x=e.x,C.y=e.y,C.inside=e.inside},vt=t=>{t.relatedTarget||(C.inside=!1)},W=t=>{t.pointerType!=="mouse"&&(C.inside=!1)},xt=t=>{const e=T.current;if(!e.clickBurst||!e.enableMouseInteraction||e.paused||t.button!==0)return;const o=ct(t.clientX,t.clientY);o.inside&&re(o.x,o.y)},gt=new ResizeObserver(it);gt.observe(_);const yt=new IntersectionObserver(t=>{k=t.some(e=>e.isIntersecting),k&&Z()});return yt.observe(_),window.addEventListener("pointermove",dt,{passive:!0}),window.addEventListener("pointerdown",xt,{passive:!0}),window.addEventListener("pointerout",vt),window.addEventListener("pointerup",W),window.addEventListener("pointercancel",W),it(),Z(),Y.current={refresh:()=>{N=!0}},()=>{cancelAnimationFrame(G),gt.disconnect(),yt.disconnect(),window.removeEventListener("pointermove",dt),window.removeEventListener("pointerdown",xt),window.removeEventListener("pointerout",vt),window.removeEventListener("pointerup",W),window.removeEventListener("pointercancel",W),a.deleteBuffer(at),a.deleteProgram(A),Y.current=null}},[]),q.useEffect(()=>{Y.current?.refresh()}),zt.jsx("div",{ref:et,className:`metaballs-container ${u}`.trim(),style:Jt,children:zt.jsx("canvas",{ref:nt,className:"metaballs-canvas"})})};export{de as default};
