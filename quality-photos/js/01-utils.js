"use strict";
/* ============================================================
   0. UTILITIES
   ============================================================ */
const $  = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const uid = p => p+"_"+Math.random().toString(36).slice(2,9);
const esc = s => String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const slugify = s => String(s||"").toLowerCase().trim().replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").slice(0,80);
const fmtDate = d => { try{ return new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}); }catch(e){ return d; } };
const mq = q => (window.matchMedia ? window.matchMedia(q) : {matches:false});
const reduced = () => mq("(prefers-reduced-motion: reduce)").matches;
const clamp = (n,a,b)=>Math.min(b,Math.max(a,n));

function toast(msg, ok){
  const t=document.createElement("div");
  t.className="toast"+(ok?" toast--ok":"");
  t.textContent=msg;
  $("#toasts").appendChild(t);
  setTimeout(()=>{t.style.opacity="0";t.style.transition="opacity .3s";setTimeout(()=>t.remove(),320);},3200);
}
async function sha256(txt){
  if(window.crypto && crypto.subtle){
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(txt));
    return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,"0")).join("");
  }
  let h=0; for(let i=0;i<txt.length;i++){h=(h<<5)-h+txt.charCodeAt(i);h|=0;} return "x"+h;
}

/* ---- placeholder photography (generated locally, clearly labelled) ---- */
const PH_PALETTES=[["#3C3A38","#6E6258","#A99881"],["#2B3138","#4E5D69","#8FA3AF"],["#3A2F2B","#7A5A46","#C39C78"],
  ["#2F332B","#55604C","#93A184"],["#3A2C33","#6B4E5B","#B08C9C"],["#33302A","#6A6152","#B3A489"]];
function phSVG(seed, w, h, label){
  let n=0; for(let i=0;i<seed.length;i++) n=(n*31+seed.charCodeAt(i))>>>0;
  const p=PH_PALETTES[n%PH_PALETTES.length], ang=(n%60)+15, cx=25+(n%50), cy=20+((n>>3)%60);
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<defs><linearGradient id="g" gradientTransform="rotate(${ang})"><stop offset="0" stop-color="${p[0]}"/><stop offset=".55" stop-color="${p[1]}"/><stop offset="1" stop-color="${p[2]}"/></linearGradient>
<radialGradient id="v" cx="${cx}%" cy="${cy}%" r="72%"><stop offset="0" stop-color="#fff" stop-opacity=".30"/><stop offset="1" stop-color="#000" stop-opacity=".40"/></radialGradient>
<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2"/><feColorMatrix type="saturate" values="0"/></filter></defs>
<rect width="100%" height="100%" fill="url(#g)"/><rect width="100%" height="100%" fill="url(#v)"/>
<rect width="100%" height="100%" filter="url(#n)" opacity=".16"/>
<rect x="${w*0.5}" y="${h*0.58}" width="${w*0.42}" height="${h*0.3}" fill="#000" opacity=".12"/>
<circle cx="${w*0.32}" cy="${h*0.44}" r="${Math.min(w,h)*0.17}" fill="#000" opacity=".10"/></svg>`;
  return "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg);
}
/* media record -> <img> with responsive attributes */
function img(m, cls, sizes, eager){
  m = m || {};
  const src = m.src || phSVG(m.id||m.alt||"x", 1200, 900);
  const isPh = !m.src;
  const alt = esc(m.alt || (isPh ? "Placeholder photograph" : ""));
  return `<img src="${src}" alt="${alt}" class="${cls||""}"
    ${sizes?`sizes="${sizes}"`:""} loading="${eager?"eager":"lazy"}" decoding="${eager?"sync":"async"}"
    ${eager?'fetchpriority="high"':""}>`;
}
function frame(m, ratio, opts={}){
  const isPh = !(m&&m.src);
  return `<figure class="frame frame--${ratio||"r34"}">${img(m,"",opts.sizes,opts.eager)}${isPh?`<figcaption class="ph-tag">PLACEHOLDER</figcaption>`:""}</figure>`;
}
