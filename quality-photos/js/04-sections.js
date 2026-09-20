/* ============================================================
   2. PUBLIC SITE — section renderers
   Section order, visibility and content all come from the store,
   so reordering in the CMS reorders the real page.
   ============================================================ */
function shead(s,extra){
  const d=LZ(s.data);
  if(!d.heading && !d.sub) return "";
  return `<div class="shead">${d.kicker?`<span class="num">${esc(d.kicker)}</span>`:""}
    <h2 class="d2">${esc(d.heading||"")}</h2>
    ${d.sub?`<p class="dim">${esc(d.sub)}</p>`:""}${extra||""}</div>`;
}
function wrapSec(s,inner,cls){
  const d=s.data||{}, theme=d.theme||s.theme||"dark";
  const anim=(s.anim&&s.anim!=="none"&&s.anim!=="stagger")?s.anim:null;
  return `<section class="sec ${theme==="paper"?"sec--paper":""} ${cls||""}" data-sec="${s.type}">
    <div class="wrap"${anim?` data-anim="${anim}"`:""}>${inner}</div></section>`;
}

const cellHTML=(p,i)=>`<a class="cell ${p.featured?"is-select":""}" href="#/portfolio/${esc(p.slug)}" data-link data-cursor="VIEW">
  <span class="cell__frame-no">${String(i+1).padStart(2,"0")}${p.featured?" ●":""}</span>
  ${frame(p.cover,"r34",{sizes:"(min-width:1200px) 24vw,(min-width:780px) 33vw,50vw"})}
  <span class="cell__meta"><h3>${esc(LZ(p).title)}</h3><span class="cell__cat">${esc(catName(p.categoryId))}</span></span></a>`;

const SECTIONS={
  hero(s){
    const d=LZ(s.data);
    return `<section class="hero" data-sec="hero">
      <div class="hero__media">${img(d.media,"","100vw",true)}</div>
      <div class="wrap hero__in">
        <h1 class="d1 rise" data-d="1">${esc(d.heading||"")}</h1>
        <p class="hero__sub rise" data-d="2">${esc(d.sub||"")}</p>
        <div class="hero__row rise" data-d="3">
          ${d.ctaLabel?`<a class="btn" href="${esc(d.ctaHref||"#/portfolio")}" data-link>${esc(d.ctaLabel)}</a>`:""}
          ${d.cta2Label?`<a class="tlink" href="${esc(d.cta2Href||"#/contact")}" data-link>${esc(d.cta2Label)}</a>`:""}
        </div>
      </div>
      <div class="scroller rise" data-d="4"><span>SCROLL</span><i></i></div>
    </section>`;
  },
  text_intro(s){
    const d=LZ(s.data);
    return wrapSec(s,`<div class="split split--narrow">
      <h2 class="d2" style="max-width:17ch;text-wrap:balance">${esc(d.heading||"")}</h2>
      <div class="prose"><p class="lede" style="max-width:none">${esc(d.body||"")}</p>
      ${d.linkLabel?`<a class="tlink" href="${esc(d.linkHref||"#/about")}" data-link>${esc(d.linkLabel)}</a>`:""}</div>
    </div>`);
  },
  featured_portfolio(s){
    const d=LZ(s.data), items=pub(DB.projects).filter(p=>p.featured).slice(0,d.limit||6);
    const list=items.length?items:pub(DB.projects).slice(0,d.limit||6);
    if(!list.length) return wrapSec(s,shead(s)+emptyBox("No projects yet","Add a portfolio project in the CMS and it will appear here."));
    return wrapSec(s,shead(s,`<a class="tlink" href="#/portfolio" data-link>${t("allWork")}</a>`)+
      `<div class="sheet sheet--feature stagger">${list.map((p,i)=>
        `<a class="cell cell--fill ${p.featured?"is-select":""}" href="#/portfolio/${esc(p.slug)}" data-link data-cursor="VIEW">
          <span class="cell__frame-no">${String(i+1).padStart(2,"0")}${p.featured?" ●":""}</span>
          ${frame(p.cover,i===0?"r43":"r34",{sizes:"(min-width:900px) 40vw,50vw"})}
          <span class="cell__meta"><h3>${esc(LZ(p).title)}</h3><span class="cell__cat">${esc(catName(p.categoryId))}</span></span></a>`).join("")}</div>`);
  },
  portfolio_grid(s){
    const cats=DB.categories.filter(c=>pub(DB.projects).some(p=>p.categoryId===c.id));
    const items=pub(DB.projects);
    if(!items.length) return wrapSec(s,shead(s)+emptyBox("No projects published","Publish a project in the CMS to fill this page."));
    return wrapSec(s,shead(s)+
      `<div class="filters" id="pfFilters" role="group" aria-label="Filter portfolio">
        <button class="chip" data-cat="all" aria-pressed="true">${t("filterAll")}</button>
        ${cats.map(c=>`<button class="chip" data-cat="${c.id}" aria-pressed="false">${esc(c.name)}</button>`).join("")}
      </div>
      <div class="sheet stagger" id="pfGrid">${items.map(cellHTML).join("")}</div>
      <p class="num" id="pfCount" style="margin-top:22px">${items.length} ${t("projects").toUpperCase()}</p>`);
  },
  services(s){
    const list=pub(DB.services).sort((a,b)=>a.order-b.order);
    if(!list.length) return wrapSec(s,shead(s)+emptyBox("No services published","Publish a service in the CMS to list it here."));
    return wrapSec(s,shead(s)+`<div class="svc stagger">${list.map(v=>
      `<a href="#/services/${esc(v.slug)}" data-link data-cursor="OPEN">
        ${frame(v.cover,"r43",{sizes:"(min-width:900px) 25vw,90vw"})}
        <h3>${esc(LZ(v).title)}</h3><p class="dim">${esc(LZ(v).short)}</p>
        <span class="tlink">${t("viewService")}</span></a>`).join("")}</div>`);
  },
  featured_story(s){
    const d=LZ(s.data), all=pub(DB.stories).sort((a,b)=>b.date.localeCompare(a.date));
    const list=d.all?all:all.slice(0,3);
    if(!list.length) return wrapSec(s,shead(s)+emptyBox("Nothing published yet","Write a story in the CMS to fill this section."));
    return wrapSec(s,shead(s,d.all?"":`<a class="tlink" href="#/stories" data-link>${t("allStories")}</a>`)+
      `<div class="stories stagger">${list.map(t=>
        `<a class="story-card" href="#/stories/${esc(t.slug)}" data-link data-cursor="READ">
          ${frame(t.cover,"r43",{sizes:"(min-width:900px) 32vw,90vw"})}
          <span class="story-meta">${esc(t.category||"Journal")} · ${fmtDate(t.date)}</span>
          <h3>${esc(LZ(t).title)}</h3><p>${esc(LZ(t).excerpt)}</p></a>`).join("")}</div>`);
  },
  image_text(s){
    const d=LZ(s.data);
    return wrapSec(s,`<div class="split ${d.flip?"split--r":""}">
      <div>${frame(d.media,d.ratio||"r34",{sizes:"(min-width:900px) 50vw,100vw"})}</div>
      <div class="prose">${d.kicker?`<p class="num" style="margin:0 0 12px">${esc(d.kicker)}</p>`:""}
        <h2 class="d2" style="margin-bottom:20px">${esc(d.heading||"")}</h2>
        ${String(d.body||"").split("\n\n").map(p=>`<p>${esc(p)}</p>`).join("")}
        ${d.linkLabel?`<a class="tlink" href="${esc(d.linkHref||"#")}" data-link>${esc(d.linkLabel)}</a>`:""}</div>
    </div>`);
  },
  video(s){
    const d=LZ(s.data), f={source:d.source||"youtube",url:d.url||"",poster:d.poster,title:d.heading||""};
    return wrapSec(s,shead(s)+filmCard(f,0));
  },
  films(s){
    const d=LZ(s.data), all=pub(DB.films).sort((a,b)=>a.order-b.order);
    const list=d.all?all:all.slice(0,d.limit||3);
    if(!list.length) return wrapSec(s,shead(s)+emptyBox("No films yet","Add a film in the CMS — YouTube, Vimeo, a reel link or an uploaded file."));
    return wrapSec(s,shead(s,d.all?"":`<a class="tlink" href="#/films" data-link>${t("allFilms")}</a>`)+
      `<div class="films stagger">${list.map(filmCard).join("")}</div>`);
  },
  testimonials(s){
    const list=pub(DB.testimonials).sort((a,b)=>a.order-b.order);
    if(!list.length) return wrapSec(s,shead(s)+emptyBox("No reviews published","Only add reviews clients have actually given you."));
    return wrapSec(s,shead(s)+`<div class="quotes stagger">${list.map(t=>
      `<figure class="quote"><div class="stars" aria-label="${t.rating} out of 5">${"★".repeat(clamp(t.rating||5,1,5))}</div>
       <blockquote>${esc(LZ(t).text)}</blockquote>
       <figcaption>${esc(t.name)}<small>${esc(t.event||"")}</small></figcaption></figure>`).join("")}</div>`);
  },
  social_wall(s){
    const d=LZ(s.data), n=d.count||8;
    const tiles=Array.from({length:n},(_,i)=>`<a class="cell" href="${esc(d.url||"#")}" target="_blank" rel="noopener" data-cursor="OPEN">
      ${frame({id:"ig"+i,alt:"Instagram placeholder tile"},"r11",{sizes:"(min-width:1200px) 24vw,50vw"})}</a>`).join("");
    return wrapSec(s,shead(s,`<a class="tlink" href="${esc(d.url||"#")}" target="_blank" rel="noopener">${esc(d.handle||"Instagram")}</a>`)+
      `<div class="sheet stagger">${tiles}</div>
       <p class="dim" style="font-size:.85rem;margin-top:18px;max-width:60ch">Instagram is not scraped. Tiles are placeholders until the studio uploads or links approved posts in the CMS.</p>`);
  },
  gallery(s){
    const d=LZ(s.data), pool=pub(DB.projects).flatMap(p=>p.media||[]).slice(0,d.count||8);
    if(!pool.length) return wrapSec(s,shead(s)+emptyBox("Gallery is empty","Upload images to the media library first."));
    return wrapSec(s,shead(s)+`<div class="sheet stagger" data-gallery>${pool.map((m,i)=>
      `<button class="cell" data-lb="${i}" data-cursor="VIEW" aria-label="Open image ${i+1}">
        <span class="cell__frame-no">${String(i+1).padStart(2,"0")}</span>${frame(m,"r34",{sizes:"(min-width:1200px) 24vw,50vw"})}</button>`).join("")}</div>`,
    );
  },
  social_embeds(s){
    const d=LZ(s.data), all=pub(DB.social_embeds||[]).sort((a,b)=>a.order-b.order);
    const list=d.all?all:all.slice(0,d.limit||3);
    if(!list.length) return wrapSec(s,shead(s)+emptyBox("No embeds yet","Paste a post URL from YouTube, Vimeo, Instagram, Facebook, Pinterest or X in the CMS."));
    return wrapSec(s,shead(s)+`<div class="embeds stagger">${list.map(embedCard).join("")}</div>`);
  },
  quote(s){
    const d=LZ(s.data);
    return wrapSec(s,`<blockquote class="lede" style="max-width:24ch;font-size:clamp(1.5rem,3.6vw,2.6rem);font-style:italic;margin:0">${esc(d.heading||"")}</blockquote>
      ${d.sub?`<p class="num" style="margin-top:20px">— ${esc(d.sub)}</p>`:""}`);
  },
  statistics(s){
    const d=LZ(s.data), items=d.items||[];
    return wrapSec(s,shead(s)+`<div class="stats stagger">${items.map(i=>
      `<div class="stat"><b>${esc(i.value)}</b><span>${esc(i.label)}</span></div>`).join("")}</div>`);
  },
  cta(s){
    const d=LZ(s.data);
    return wrapSec(s,`<div class="cta-band"><h2 class="d2">${esc(d.heading||"")}</h2>
      ${d.body?`<p class="dim" style="max-width:46ch;margin:18px auto 0">${esc(d.body)}</p>`:""}
      <div class="row"><a class="btn" href="${esc(d.ctaHref||"#/contact")}" data-link>${esc(d.ctaLabel||"Get in touch")}</a>
      <a class="btn btn--ghost" id="ctaWa" href="#" target="_blank" rel="noopener">${t("whatsapp")}</a></div></div>`,"cta-band-sec");
  },
  contact(s){
    const d=LZ(s.data), st=LZ(DB.settings);
    return wrapSec(s,shead(s)+`<div class="split">
      <form class="form" id="enqForm" novalidate>
        <div class="field"><label for="f_name">${t("name")}</label><input id="f_name" name="name" required maxlength="80"><span class="err" data-for="name"></span></div>
        <div class="field"><label for="f_phone">${t("phone")}</label><input id="f_phone" name="phone" inputmode="tel" required maxlength="20"><span class="err" data-for="phone"></span></div>
        <div class="field"><label for="f_email">${t("email")}</label><input id="f_email" name="email" type="email" required maxlength="120"><span class="err" data-for="email"></span></div>
        <div class="field"><label for="f_type">${t("eventType")}</label><select id="f_type" name="eventType">
          ${pub(DB.services).map(v=>`<option>${esc(v.title)}</option>`).join("")}<option>Something else</option></select></div>
        <div class="field"><label for="f_date">${t("eventDate")}</label><input id="f_date" name="eventDate" type="date"><span class="err" data-for="eventDate"></span></div>
        <div class="field"><label for="f_loc">${t("location")}</label><input id="f_loc" name="location" maxlength="120"></div>
        <div class="field"><label for="f_guests">${t("guests")}</label><input id="f_guests" name="guests" inputmode="numeric" maxlength="6"><span class="err" data-for="guests"></span></div>
        <div class="field"><label for="f_pref">${t("prefer")}</label><select id="f_pref" name="contactPref"><option>WhatsApp</option><option>Phone call</option><option>Email</option></select></div>
        <div class="field field--full"><label for="f_msg">${t("message")}</label><textarea id="f_msg" name="message" maxlength="1500"></textarea><span class="err" data-for="message"></span></div>
        <input type="text" name="website" tabindex="-1" autocomplete="off" class="sr" aria-hidden="true">
        <div class="field field--full"><button class="btn" type="submit" id="enqSubmit">${t("send")}</button></div>
        <div id="enqResult" role="status"></div>
      </form>
      <div class="prose">
        <h3 class="d3" style="margin-bottom:16px">${t("reachUs")}</h3>
        <p><a class="tlink" href="tel:${esc((st.phone||"").replace(/\s/g,""))}">${esc(st.phone)}</a></p>
        <p><a class="tlink" href="mailto:${esc(st.email)}">${esc(st.email)}</a></p>
        <p class="dim" style="font-size:.95rem">${esc(st.address)}</p>
        <p><a class="btn btn--ghost" id="contactWa" href="#" target="_blank" rel="noopener">${t("whatsapp")}</a></p>
      </div></div>`);
  },
  map(s){
    const d=LZ(s.data);
    const ok=hostAllowed(d.embed||"");
    return wrapSec(s,shead(s)+(ok?
      `<div class="frame frame--r169"><iframe src="${esc(d.embed)}" title="Studio location map" loading="lazy" style="width:100%;height:100%;border:0"></iframe></div>`
      : emptyBox("Map not set","Add a Google Maps embed URL in the CMS. Only Google, YouTube, Vimeo and Instagram URLs are accepted."))+
      (d.address?`<p class="dim" style="margin-top:14px">${esc(d.address)}</p>`:""));
  },
  spacer(s){ return `<div style="height:${clamp(parseInt((s.data||{}).height||60,10),10,300)}px"></div>`; }
};

function filmCard(f,i){
  const isYT=f.source==="youtube", isVM=f.source==="vimeo", isIG=f.source==="instagram", isUp=f.source==="upload";
  const playable=(isYT&&ytId(f.url))||(isVM&&vimeoId(f.url))||(isUp&&f.url);
  const badge=isYT?"YOUTUBE":isVM?"VIMEO":isIG?"INSTAGRAM":"FILM";
  return `<article class="film" data-film='${esc(JSON.stringify({s:f.source,u:f.url}))}'>
    <div class="frame frame--r169" style="position:relative">
      ${img(f.poster,"","(min-width:900px) 33vw,95vw")}
      <span class="film__badge">${badge}</span>
      ${playable?`<button class="film__btn" aria-label="Play ${esc(f.title)}"><span class="film__play"></span></button>`
        :`<a class="film__btn" href="${esc(f.url||"#")}" target="_blank" rel="noopener" aria-label="Open ${esc(f.title)}"><span class="film__play"></span></a>`}
    </div>
    <div class="film__body"><h3 class="d4">${esc(f.title||"")}</h3>
      <p class="dim" style="font-size:.9rem;margin:6px 0 0">${esc(f.description||"")}</p>
      ${f.url?`<a class="tlink" style="margin-top:10px" href="${esc(f.url)}" target="_blank" rel="noopener">${isIG?t("viewIG"):t("openTab")}</a>`:
        `<p class="dim" style="font-size:.85rem;margin-top:8px">${t("noFile")}</p>`}
    </div></article>`;
}
function embedCard(e){
  const L=LZ(e), meta=socialEmbed(e.url), p=meta.p||"link";
  const name=PLAT_NAME[p]||"Link";
  const abbr=name.slice(0,2).toUpperCase();
  const stage = meta.src
    ? `<button class="film__btn" style="position:relative;min-height:180px" data-embed='${esc(JSON.stringify({src:meta.src,v:!!meta.video}))}'>
         <span class="film__play"></span><span class="sr">${esc(t("loadPost"))}</span></button>`
    : `<div style="padding:26px 16px;text-align:center">
         <p class="dim" style="margin:0 0 14px;font-size:.9rem">${esc(name)} does not allow embedding here.</p>
         <a class="btn btn--sm" href="${esc(e.url)}" target="_blank" rel="noopener">${esc(t("openOn"))} ${esc(name)}</a></div>`;
  return `<article class="emb">
    <header class="emb__bar"><span class="emb__dot" data-p="${esc(p)}">${esc(abbr)}</span>
      <span class="emb__name">${esc(name.toUpperCase())}</span>
      <a class="emb__open" href="${esc(e.url)}" target="_blank" rel="noopener">${esc(t("openTab"))} ↗</a></header>
    <div class="emb__stage ${meta.video?"emb__stage--v":""}">${stage}</div>
    <div class="emb__body"><h3>${esc(L.title||"")}</h3>${L.caption?`<p>${esc(L.caption)}</p>`:""}</div>
  </article>`;
}
function emptyBox(title,body){
  return `<div class="empty"><h3>${esc(title)}</h3><p>${esc(body)}</p></div>`;
}
