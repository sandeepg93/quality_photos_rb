/* ============================================================
   3. DETAIL PAGES
   ============================================================ */
function projectPage(P){
  const p=P?Object.assign({},P,LZ(P)):null;
  if(!p) return notFound("That project isn't published.");
  const rel=pub(DB.projects).filter(x=>x.id!==p.id&&x.categoryId===p.categoryId).slice(0,4);
  const media=p.media||[];
  const blocks=media.map((m,i)=>{
    const mod=i%5;
    if(mod===0) return `<div class="sec sec--tight"><div class="wrap"><button class="cell" data-lb="${i}" data-cursor="VIEW" style="width:100%" aria-label="Open frame ${i+1}">${frame(m,"r169",{sizes:"92vw"})}</button></div></div>`;
    if(mod===1) return "";
    if(mod===2) return `<div class="sec sec--tight"><div class="wrap" style="display:grid;justify-items:center"><button class="cell" data-lb="${i}" data-cursor="VIEW" style="max-width:min(560px,86vw)" aria-label="Open frame ${i+1}">${frame(m,"r23",{sizes:"(min-width:900px) 40vw,86vw"})}</button></div></div>`;
    if(mod===3) return `<div class="sec sec--tight"><div class="wrap split">
        <button class="cell" data-lb="${i}" data-cursor="VIEW" aria-label="Open frame ${i+1}">${frame(m,"r34",{sizes:"46vw"})}</button>
        ${media[i+1]?`<button class="cell" data-lb="${i+1}" data-cursor="VIEW" aria-label="Open frame ${i+2}">${frame(media[i+1],"r34",{sizes:"46vw"})}</button>`:""}
      </div></div>`;
    return "";
  }).join("");
  const pairs=media.map((m,i)=>i).filter(i=>i%5===1).map(i=>`<div class="sec sec--tight"><div class="wrap split">
      <button class="cell" data-lb="${i}" data-cursor="VIEW" aria-label="Open frame ${i+1}">${frame(media[i],"r23",{sizes:"46vw"})}</button>
      <div class="prose" style="align-self:center"><p class="lede">${esc(p.excerpt)}</p></div></div></div>`).join("");
  return `
  <section class="hero" style="min-height:76svh">
    <div class="hero__media">${img(p.cover,"","100vw",true)}</div>
    <div class="wrap hero__in" style="padding-top:22vh">
      <p class="num rise" data-d="1">${esc(catName(p.categoryId))} · ${esc(p.location||"")} · ${fmtDate(p.date)}</p>
      <h1 class="d1 rise" data-d="2" style="max-width:13ch;margin-top:14px">${esc(p.title)}</h1>
    </div>
  </section>
  <section class="sec sec--paper"><div class="wrap split" data-anim="fade-up">
    <h2 class="d3" style="max-width:18ch">${esc(p.excerpt)}</h2>
    <div class="prose">${String(p.description||"").split("\n\n").map(t=>`<p>${esc(t)}</p>`).join("")}</div>
  </div></section>
  <div data-gallery>${blocks}${pairs}</div>
  ${p.videoUrl?SECTIONS.video({type:"video",anim:"fade-up",data:{heading:"The film",source:ytId(p.videoUrl)?"youtube":"vimeo",url:p.videoUrl,poster:p.cover}}):""}
  ${rel.length?`<section class="sec"><div class="wrap">
    <div class="shead"><span class="num">${t("next")}</span><h2 class="d2">${t("moreWork")}</h2></div>
    <div class="sheet stagger">${rel.map(cellHTML).join("")}</div></div></section>`:""}
  ${SECTIONS.cta({type:"cta",anim:"fade-up",data:{heading:"Planning something similar?",body:"Tell us the date and we'll check availability.",ctaLabel:"Start an enquiry",ctaHref:"#/contact"}})}`;
}

function servicePage(V){
  const v=V?Object.assign({},V,LZ(V)):null;
  if(!v) return notFound("That service isn't published.");
  return `
  <section class="hero" style="min-height:64svh">
    <div class="hero__media">${img(v.cover,"","100vw",true)}</div>
    <div class="wrap hero__in" style="padding-top:20vh">
      <p class="num rise" data-d="1">SERVICE</p>
      <h1 class="d1 rise" data-d="2" style="max-width:12ch;margin-top:12px">${esc(v.title)}</h1>
      <p class="hero__sub rise" data-d="3">${esc(v.short)}</p>
    </div></section>
  <section class="sec sec--paper"><div class="wrap split" data-anim="fade-up">
    <div class="prose">${String(v.long||"").split("\n\n").map(t=>`<p>${esc(t)}</p>`).join("")}</div>
    <div><h3 class="d4" style="margin-bottom:14px">${t("included")}</h3>
      <ul style="list-style:none;padding:0;margin:0;display:grid;gap:10px">
        ${(v.features||[]).map(f=>`<li style="display:flex;gap:10px"><span style="color:var(--mark)">●</span><span>${esc(f)}</span></li>`).join("")}
      </ul>
      <a class="btn" style="margin-top:24px" href="#/contact" data-link>${t("enquireAbout")} ${esc(v.title)}</a></div>
  </div></section>
  ${(v.gallery||[]).length?`<section class="sec"><div class="wrap"><div class="shead"><span class="num">${t("frames").toUpperCase()}</span><h2 class="d2">From recent ${esc(v.title.toLowerCase())} work</h2></div>
    <div class="sheet stagger" data-gallery>${v.gallery.map((m,i)=>
      `<button class="cell" data-lb="${i}" data-cursor="VIEW" aria-label="Open frame ${i+1}"><span class="cell__frame-no">${String(i+1).padStart(2,"0")}</span>${frame(m,"r34",{sizes:"(min-width:1200px) 24vw,50vw"})}</button>`).join("")}</div></div></section>`:""}
  ${(v.faq||[]).length?`<section class="sec sec--paper"><div class="wrap" data-anim="fade-up">
    <div class="shead"><span class="num">FAQ</span><h2 class="d2">${t("faq")}</h2></div>
    <div style="display:grid;gap:14px;max-width:70ch">${v.faq.map(f=>
      `<details style="border-top:1px solid rgba(33,28,23,.2);padding:14px 0">
        <summary style="cursor:pointer;font-family:var(--display);font-weight:600;font-size:1.02rem">${esc(f.q)}</summary>
        <p style="margin:10px 0 0;color:var(--on-paper-dim)">${esc(f.a)}</p></details>`).join("")}</div></div></section>`:""}
  ${SECTIONS.cta({type:"cta",anim:"fade-up",data:{heading:"Check your date.",ctaLabel:"Start an enquiry",ctaHref:"#/contact"}})}`;
}

function storyPage(T){
  const t=T?Object.assign({},T,LZ(T)):null;
  if(!t) return notFound("That story isn't published.");
  const rel=pub(DB.stories).filter(x=>x.id!==t.id).slice(0,3);
  return `
  <article>
  <section class="sec" style="padding-top:clamp(120px,18vh,220px)"><div class="wrap" data-anim="fade-up">
    <p class="num">${esc(t.category||"Journal")} · ${fmtDate(t.date)} · ${esc(t.author||"")}</p>
    <h1 class="d2" style="max-width:20ch;margin:16px 0 22px">${esc(t.title)}</h1>
    <p class="lede dim" style="max-width:52ch">${esc(t.excerpt)}</p>
  </div></section>
  <div class="wrap" data-anim="clip">${frame(t.cover,"r169",{sizes:"92vw",eager:true})}</div>
  <section class="sec"><div class="wrap"><div class="prose" style="margin:0 auto">
    ${String(t.body||"").split("\n\n").map(p=>`<p>${esc(p)}</p>`).join("")}</div></div></section>
  ${(t.gallery||[]).length?`<div class="wrap" data-gallery><div class="sheet stagger">${t.gallery.map((m,i)=>
    `<button class="cell" data-lb="${i}" data-cursor="VIEW" aria-label="Open frame ${i+1}">${frame(m,"r34",{sizes:"(min-width:1200px) 24vw,50vw"})}</button>`).join("")}</div></div>`:""}
  <section class="sec sec--tight"><div class="wrap row" style="gap:12px;align-items:center">
    <span class="num">${t("share").toUpperCase()}</span>
    <button class="btn btn--ghost btn--sm" data-share="copy">${t("copyLink")}</button>
    <a class="btn btn--ghost btn--sm" data-share="wa" href="#" target="_blank" rel="noopener">WhatsApp</a>
  </div></section>
  </article>
  ${rel.length?`<section class="sec sec--paper"><div class="wrap"><div class="shead"><span class="num">MORE</span><h2 class="d2">${t("keepReading")}</h2></div>
    <div class="stories stagger">${rel.map(s=>`<a class="story-card" href="#/stories/${esc(s.slug)}" data-link data-cursor="READ">
      ${frame(s.cover,"r43",{sizes:"32vw"})}<span class="story-meta">${esc(s.category||"")} · ${fmtDate(s.date)}</span>
      <h3>${esc(LZ(s).title)}</h3><p>${esc(LZ(s).excerpt)}</p></a>`).join("")}</div></div></section>`:""}`;
}

function notFound(msg){
  return `<section class="page404"><div class="wrap">
    <p class="num">ERROR 404</p>
    <h1 class="d1" style="margin:16px 0">${t("e404")}</h1>
    <p class="dim" style="max-width:44ch;margin:0 auto 26px">${esc(msg||t("e404sub"))}</p>
    <a class="btn" href="#/" data-link>${t("home")}</a></div></section>`;
}

/* ============================================================
   4. ROUTER + CHROME
   ============================================================ */
function renderChrome(){
  const st=LZ(DB.settings);
  $("#brandName").textContent=st.brand||"QUALITY PHOTOS";
  $("#brandTag").textContent=st.tagline||"";
  const items=(DB.navigation.header||[]).filter(i=>i.enabled);
  $("#navMain").innerHTML=items.map(i=>`<a href="${esc(i.path)}" data-link>${esc(LZ(i).label)}</a>`).join("");
  $("#menuList").innerHTML=items.map((i,n)=>`<li><a href="${esc(i.path)}" data-link><span class="num">${String(n+1).padStart(2,"0")}</span>${esc(LZ(i).label)}</a></li>`).join("");
  $("#menuPhone").href="tel:"+String(st.phone||"").replace(/\s/g,"");
  $("#menuPhone").textContent=t("call");
  $("#hdrCta").textContent=t("book");
  const mc=$("#menuCta"); if(mc) mc.textContent=t("book");
  $$("#langBtn,#langBtn2").forEach(b=>b.textContent=t("langName"));
  $(".menu__top .num").textContent=t("menu");
  $("#lbHint").textContent=t("esc");
  $("#waBtn").querySelector("span").textContent=LANG==="mr"?"व्हॉट्सॲप":"WhatsApp";
  const wa=waLink(); $("#waBtn").href=wa;
  const soc=(st.social||[]).filter(s=>s.enabled&&s.url);
  $("#foot").innerHTML=`<div class="wrap">
    <div class="foot__grid">
      <div><a class="brand" href="#/" data-link><b>${esc(st.brand)}</b><span>${esc(st.tagline)}</span></a>
        <p class="dim" style="font-size:.93rem;max-width:34ch;margin-top:16px">${esc(st.footerText||"")}</p></div>
      <div><h4>${esc(t("pages").toUpperCase())}</h4><ul>${(DB.navigation.footer||[]).filter(i=>i.enabled).map(i=>`<li><a href="${esc(i.path)}" data-link>${esc(LZ(i).label)}</a></li>`).join("")}</ul></div>
      <div><h4>${esc(t("studio").toUpperCase())}</h4><ul>
        <li><a href="tel:${esc(String(st.phone||"").replace(/\s/g,""))}">${esc(st.phone||"")}</a></li>
        <li><a href="mailto:${esc(st.email||"")}">${esc(st.email||"")}</a></li>
        <li><span class="dim" style="font-size:.93rem">${esc(st.address||"")}</span></li></ul></div>
      <div><h4>${esc(t("elsewhere").toUpperCase())}</h4><ul>${soc.length?soc.map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a></li>`).join("")
        :`<li><span class="dim">No links configured yet.</span></li>`}</ul></div>
    </div>
    <div class="foot__bot"><span>${esc(st.copyright||"")}</span>
      <span>Demo content is marked. <a href="#/admin" data-link style="text-decoration:underline">CMS</a></span></div>
  </div>`;
}
function waLink(text){
  const st=DB.settings, num=String(st.whatsapp||"").replace(/\D/g,"");
  const msg=encodeURIComponent(text||st.waMessage||"Hello");
  return num?`https://wa.me/${num}?text=${msg}`:"https://wa.me/";
}
function setSEO(title,desc,page){
  document.title=title||DB.settings.seoTitle;
  const set=(sel,val)=>{const el=$(sel); if(el) el.setAttribute("content",val||"");};
  document.documentElement.lang=LANG==="mr"?"mr":"en";
  set('meta[name="description"]',desc||DB.settings.seoDesc);
  set('meta[property="og:title"]',title||DB.settings.seoTitle);
  set('meta[property="og:description"]',desc||DB.settings.seoDesc);
  let ld=$("#ldjson"); if(!ld){ ld=document.createElement("script"); ld.type="application/ld+json"; ld.id="ldjson"; document.head.appendChild(ld); }
  ld.textContent=JSON.stringify({"@context":"https://schema.org","@type":"LocalBusiness",
    name:DB.settings.brand,description:DB.settings.seoDesc,telephone:DB.settings.phone,email:DB.settings.email,
    address:DB.settings.address,image:[],sameAs:(DB.settings.social||[]).filter(s=>s.enabled&&s.url).map(s=>s.url)});
}

const PREV=()=>{ try{ return sessionStorage.getItem("qp.preview")==="1"; }catch(e){ return false; } };
const visible=x=>!!x&&(x.status==="published"||PREV());
function parseRoute(){
  const h=(location.hash||"#/").replace(/^#/,"");
  const parts=h.split("/").filter(Boolean);
  return {a:parts[0]||"",b:parts[1]||""};
}
function route(){
  const {a,b}=parseRoute();
  closeMenu();
  if(a==="admin"){ document.body.classList.add("adm-on"); Admin.mount(); return; }
  document.body.classList.remove("adm-on");
  const main=$("#main");
  let html="", title="", desc="";

  if(!a){ const p=pageBy("home"); html=renderPageSections(p); title=p.seoTitle; desc=p.seoDesc; }
  else if(a==="portfolio"&&b){ const p=projBySlug(b); html=projectPage(visible(p)?p:null);
    title=p?`${p.title} — ${DB.settings.brand}`:"Not found"; desc=p?p.excerpt:""; }
  else if(a==="services"&&b){ const v=svcBySlug(b); html=servicePage(visible(v)?v:null);
    title=v?`${v.title} — ${DB.settings.brand}`:"Not found"; desc=v?v.short:""; }
  else if(a==="stories"&&b){ const t=storyBySlug(b); html=storyPage(visible(t)?t:null);
    title=t?`${t.title} — ${DB.settings.brand}`:"Not found"; desc=t?t.excerpt:""; }
  else { const p=pageBy(a); if(visible(p)){ html=renderPageSections(p); title=p.seoTitle||p.title; desc=p.seoDesc; }
    else { html=notFound(); title="Not found — "+DB.settings.brand; } }

  main.innerHTML=html;
  setSEO(title,desc);
  window.scrollTo({top:0,behavior:reduced()?"auto":"instant"});
  afterRender();
}
function renderPageSections(page){
  if(!page) return notFound();
  return (page.sections||[]).filter(s=>s.enabled).map(s=>{
    const fn=SECTIONS[s.type];
    return fn?fn(s):`<!-- unknown section ${esc(s.type)} -->`;
  }).join("");
}

/* run after each render: observers, bindings */
function afterRender(){
  observeReveals();
  bindGalleries();
  bindFilms();
  bindFilters();
  bindEnquiry();
  bindEmbeds();
  bindShare();
  $$("#ctaWa,#contactWa").forEach(a=>a.href=waLink());
  $$("#navMain a").forEach(a=>{
    const cur=location.hash||"#/";
    a.classList.toggle("is-on", a.getAttribute("href")===cur || (a.getAttribute("href")!=="#/"&&cur.startsWith(a.getAttribute("href"))));
  });
  bindCursorTargets();
}
