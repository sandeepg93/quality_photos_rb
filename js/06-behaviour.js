/* ============================================================
   5. BEHAVIOUR — reveals, lightbox, films, forms, cursor
   ============================================================ */
let IO=null;
function observeReveals(){
  if(IO) IO.disconnect();
  if(reduced()||typeof IntersectionObserver==="undefined"){ $$("[data-anim],.stagger").forEach(el=>el.classList.add("in")); return; }
  IO=new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("in"); IO.unobserve(e.target); } });
  },{rootMargin:"0px 0px -12% 0px",threshold:.06});
  $$("[data-anim],.stagger").forEach(el=>IO.observe(el));
}

/* ---------- lightbox ---------- */
const LB={i:0,list:[],lastFocus:null,zoom:false};
function collect(container){
  return $$("[data-lb]",container).map(btn=>{
    const im=$("img",btn), cap=$(".cell__meta h3",btn);
    return {src:im?im.src:"",alt:im?im.alt:"",cap:(cap?cap.textContent:"")||(im?im.alt:"")};
  });
}
function bindGalleries(){
  $$("[data-gallery]").forEach(g=>{
    const list=collect(g);
    $$("[data-lb]",g).forEach((btn,idx)=>{
      btn.addEventListener("click",ev=>{ ev.preventDefault(); openLB(list,idx,btn); });
    });
  });
}
function openLB(list,idx,origin){
  if(!list.length) return;
  LB.list=list; LB.i=idx; LB.lastFocus=origin||document.activeElement;
  $("#lb").classList.add("is-open"); document.body.style.overflow="hidden";
  paintLB(); $("#lbClose").focus();
}
function paintLB(){
  const it=LB.list[LB.i]; if(!it) return;
  const im=$("#lbImg"); im.src=it.src; im.alt=it.alt||""; im.classList.remove("is-zoom"); LB.zoom=false;
  $("#lbCap").textContent=it.cap||"";
  $("#lbCount").textContent=(LB.i+1)+" / "+LB.list.length;
  const multi=LB.list.length>1;
  $("#lbPrev").style.display=multi?"grid":"none"; $("#lbNext").style.display=multi?"grid":"none";
}
function closeLB(){
  $("#lb").classList.remove("is-open"); document.body.style.overflow="";
  if(LB.lastFocus&&LB.lastFocus.focus) LB.lastFocus.focus();
}
const stepLB=n=>{ LB.i=(LB.i+n+LB.list.length)%LB.list.length; paintLB(); };
$("#lbClose").addEventListener("click",closeLB);
$("#lbPrev").addEventListener("click",()=>stepLB(-1));
$("#lbNext").addEventListener("click",()=>stepLB(1));
$("#lbZoom").addEventListener("click",()=>{ LB.zoom=!LB.zoom; $("#lbImg").classList.toggle("is-zoom",LB.zoom); });
$("#lbImg").addEventListener("click",()=>{ LB.zoom=!LB.zoom; $("#lbImg").classList.toggle("is-zoom",LB.zoom); });
$("#lb").addEventListener("keydown",e=>{
  if(e.key==="Escape") closeLB();
  else if(e.key==="ArrowLeft") stepLB(-1);
  else if(e.key==="ArrowRight") stepLB(1);
  else if(e.key==="Tab"){ /* focus trap */
    const f=$$("button,[href]",$("#lb")).filter(el=>el.offsetParent!==null);
    if(!f.length) return;
    const first=f[0], last=f[f.length-1];
    if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
  }
});
/* touch swipe */
(function(){
  let x0=null,y0=null;
  const st=$("#lbStage");
  st.addEventListener("touchstart",e=>{x0=e.touches[0].clientX;y0=e.touches[0].clientY;},{passive:true});
  st.addEventListener("touchend",e=>{
    if(x0===null) return;
    const dx=e.changedTouches[0].clientX-x0, dy=e.changedTouches[0].clientY-y0;
    if(Math.abs(dx)>52&&Math.abs(dx)>Math.abs(dy)) stepLB(dx<0?1:-1);
    else if(dy>90) closeLB();
    x0=null;
  },{passive:true});
})();

/* ---------- films (click-to-load, never autoplay) ---------- */
function bindFilms(){
  $$(".film").forEach(card=>{
    const btn=$("button.film__btn",card); if(!btn) return;
    btn.addEventListener("click",()=>{
      let meta={}; try{ meta=JSON.parse(card.getAttribute("data-film")||"{}"); }catch(e){}
      const holder=$(".frame",card);
      if(meta.s==="upload"&&meta.u){
        holder.outerHTML=`<video controls autoplay playsinline preload="metadata" style="width:100%;aspect-ratio:16/9;background:#000">
          <source src="${esc(meta.u)}"><p>Your browser can't play this file. <a href="${esc(meta.u)}">Download it instead.</a></p></video>`;
        return;
      }
      const src=embedSrc({source:meta.s,url:meta.u});
      if(!src){ toast("That video link isn't valid. Check it in the CMS."); return; }
      holder.outerHTML=`<div style="position:relative">
        <iframe src="${esc(src)}" title="Video player" allow="accelerometer;autoplay;encrypted-media;picture-in-picture" allowfullscreen loading="lazy"></iframe>
        <p class="dim" style="font-size:.78rem;margin:8px 0 0">Player blocked? <a class="tlink" href="${esc(meta.u)}" target="_blank" rel="noopener">Open it in a new tab</a>.</p></div>`;
    });
  });
}

/* ---------- social embeds (click to load, nothing third-party runs until asked) ---------- */
function bindEmbeds(){
  $$("[data-embed]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      let m={}; try{ m=JSON.parse(btn.getAttribute("data-embed")||"{}"); }catch(e){}
      if(!m.src){ toast("That embed URL isn't valid."); return; }
      const stage=btn.parentElement;
      stage.innerHTML=`<iframe src="${esc(m.src)}" title="Embedded post" loading="lazy" scrolling="no"
        allow="accelerometer;autoplay;clipboard-write;encrypted-media;picture-in-picture" allowfullscreen></iframe>`;
    });
  });
}

/* ---------- portfolio filters ---------- */
function bindFilters(){
  const bar=$("#pfFilters"); if(!bar) return;
  bar.addEventListener("click",e=>{
    const b=e.target.closest(".chip"); if(!b) return;
    $$(".chip",bar).forEach(c=>c.setAttribute("aria-pressed",String(c===b)));
    const cat=b.dataset.cat, cells=$$("#pfGrid .cell");
    let n=0;
    cells.forEach(c=>{
      const p=DB.projects.find(x=>c.getAttribute("href")==="#/portfolio/"+x.slug);
      const show=cat==="all"||(p&&p.categoryId===cat);
      c.style.display=show?"":"none"; if(show) n++;
    });
    const cnt=$("#pfCount"); if(cnt) cnt.textContent=n+(n===1?" PROJECT":" PROJECTS");
    const grid=$("#pfGrid"); if(!n){ if(!$("#pfEmpty")){ grid.insertAdjacentHTML("afterend",
      `<div id="pfEmpty" class="empty"><h3>Nothing in this category yet</h3><p>Publish a project under it in the CMS.</p></div>`); } }
    else { const e2=$("#pfEmpty"); if(e2) e2.remove(); }
  });
}

/* ---------- enquiry form (validated client + "server" side) ---------- */
const RX_EMAIL=/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const RX_PHONE=/^[0-9+\-\s()]{7,20}$/;
function validateEnquiry(d){
  const e={};
  if(!d.name||d.name.trim().length<2) e.name=t("errName");
  if(!RX_PHONE.test(d.phone||"")) e.phone=t("errPhone");
  if(!RX_EMAIL.test(d.email||"")) e.email=t("errEmail");
  if(d.eventDate){ const dt=new Date(d.eventDate); if(isNaN(dt)) e.eventDate=t("errDate"); }
  if(d.guests&&!/^\d{1,6}$/.test(d.guests)) e.guests=t("errGuests");
  if((d.message||"").length>1500) e.message=t("errLong");
  if(JSON.stringify(d).length>20000) e.message="That's too much data to send.";
  return e;
}
function bindEnquiry(){
  const f=$("#enqForm"); if(!f) return;
  f.addEventListener("submit",ev=>{
    ev.preventDefault();
    const fd=Object.fromEntries(new FormData(f).entries());
    $$(".err",f).forEach(s=>s.textContent="");
    const res=$("#enqResult"); res.innerHTML="";
    if(fd.website){ res.innerHTML=`<div class="notice">Submission rejected.</div>`; return; }   /* honeypot */
    const errs=validateEnquiry(fd);
    if(Object.keys(errs).length){
      Object.entries(errs).forEach(([k,v])=>{ const s=$(`.err[data-for="${k}"]`,f); if(s) s.textContent=v; });
      res.innerHTML=`<div class="notice">${esc(t("fixFields"))}</div>`;
      const first=$(`[name="${Object.keys(errs)[0]}"]`,f); if(first) first.focus();
      return;
    }
    const btn=$("#enqSubmit"); btn.disabled=true; btn.textContent=t("sending");
    setTimeout(()=>{
      DB.enquiries.unshift({id:uid("eq"),name:fd.name,phone:fd.phone,email:fd.email,eventType:fd.eventType,
        eventDate:fd.eventDate||"",location:fd.location||"",guests:fd.guests||"",contactPref:fd.contactPref,
        message:fd.message||"",status:"New",notes:"",createdAt:new Date().toISOString()});
      save(); logAct("Received enquiry","enquiry",fd.name);
      f.reset(); btn.disabled=false; btn.textContent=t("send");
      res.innerHTML=`<div class="notice notice--ok"><b>${esc(t("sent"))}</b> ${esc(t("sentSub"))}</div>`;
      if(res.scrollIntoView) res.scrollIntoView({block:"nearest",behavior:reduced()?"auto":"smooth"});
    },420);
  });
}
function bindShare(){
  $$("[data-share]").forEach(el=>{
    if(el.dataset.share==="wa"){ el.href=waLink(document.title+" "+location.href); return; }
    el.addEventListener("click",async()=>{
      try{ await navigator.clipboard.writeText(location.href); toast(t("copied"),true); }
      catch(e){ toast("Copy failed — select the address bar instead."); }
    });
  });
}

/* ---------- header, menu, links ---------- */
const hdr=$("#hdr");
let lastY=0;
function onScroll(){ hdr.classList.toggle("is-stuck", window.scrollY>40); }
window.addEventListener("scroll",()=>{ requestAnimationFrame(onScroll); },{passive:true});
function openMenu(){ $("#menu").classList.add("is-open"); $("#burger").setAttribute("aria-expanded","true"); document.body.style.overflow="hidden"; $("#menuClose").focus(); }
function closeMenu(){ $("#menu").classList.remove("is-open"); $("#burger").setAttribute("aria-expanded","false"); document.body.style.overflow=""; }
$("#burger").addEventListener("click",()=>$("#menu").classList.contains("is-open")?closeMenu():openMenu());
$("#menuClose").addEventListener("click",closeMenu);
document.addEventListener("keydown",e=>{ if(e.key==="Escape"){ closeMenu(); if($("#lb").classList.contains("is-open")) closeLB(); } });
document.addEventListener("click",e=>{ const a=e.target.closest("a[data-link]"); if(a) closeMenu(); });

/* ---------- language switch ---------- */
$$("#langBtn,#langBtn2").forEach(b=>b.addEventListener("click",()=>setLang(LANG==="mr"?"en":"mr")));

/* ---------- custom cursor (desktop only) ---------- */
function bindCursorTargets(){
  const cur=$("#cur");
  if(reduced()||mq("(hover:none)").matches||window.innerWidth<1000){ cur.classList.remove("on"); return; }
  cur.classList.add("on");
}
(function cursor(){
  const cur=$("#cur"), label=$(".cur__t",cur);
  let x=0,y=0,tx=0,ty=0,raf=null;
  window.addEventListener("mousemove",e=>{
    tx=e.clientX; ty=e.clientY;
    if(!raf) raf=requestAnimationFrame(tick);
    const t=e.target.closest("[data-cursor]");
    if(t){ cur.classList.add("is-big"); label.textContent=t.dataset.cursor||"VIEW"; }
    else cur.classList.remove("is-big");
  },{passive:true});
  function tick(){ x+=(tx-x)*.22; y+=(ty-y)*.22; cur.style.transform=`translate(${x}px,${y}px) translate(-50%,-50%)`;
    raf=(Math.abs(tx-x)>.4||Math.abs(ty-y)>.4)?requestAnimationFrame(tick):null; }
})();
