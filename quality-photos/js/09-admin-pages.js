/* ---------- PAGES + PAGE BUILDER ---------- */
let BUILD_PAGE=null;
function vPages(){
  if(BUILD_PAGE){ const p=DB.pages.find(x=>x.id===BUILD_PAGE); if(p) return builderHTML(p); BUILD_PAGE=null; }
  return head("Pages","Each page is a stack of sections you can reorder, disable and preview.")+
    `<div class="panel scrollx"><table class="tbl"><thead><tr><th>Page</th><th>URL</th><th>Sections</th><th>Status</th><th></th></tr></thead>
    <tbody>${DB.pages.map(p=>`<tr><td><b>${esc(p.title)}</b></td><td>#/${esc(p.slug==="home"?"":p.slug)}</td>
      <td>${p.sections.filter(s=>s.enabled).length} on / ${p.sections.length}</td><td>${statusPill(p.status)}</td>
      <td style="text-align:right;white-space:nowrap">
        <button class="abtn abtn--g abtn--xs" data-pgmeta="${p.id}">SEO &amp; meta</button>
        <button class="abtn abtn--xs" data-pgbuild="${p.id}">Edit sections</button></td></tr>`).join("")}</tbody></table></div>`;
}
function builderHTML(p){
  return head(p.title+" — sections","Drag a row by its handle to reorder. Changes go live when you save.",
    `<button class="abtn abtn--g" id="bkBack">All pages</button>
     <button class="abtn abtn--g" id="bkPreview">Preview</button>
     <button class="abtn abtn--g" id="bkAdd">Add section</button>
     <button class="abtn" id="bkSave">Save &amp; publish</button>`)+
   `<div class="panel"><div class="builder" id="builder">
      ${p.sections.map((s,i)=>`<div class="blk" draggable="true" data-sid="${s.id}">
        <span class="blk__h" aria-hidden="true">⠿</span>
        <span class="num" style="width:26px">${String(i+1).padStart(2,"0")}</span>
        <span class="blk__t"><b>${esc((s.data&&s.data.heading)||NAME_OF(s.type))}</b>
          <span>${esc(NAME_OF(s.type))} · ${esc(s.anim)} · ${esc((s.data&&s.data.theme)||s.theme||"dark")}</span></span>
        <label class="sw" title="Visible"><input type="checkbox" data-en="${s.id}" ${s.enabled?"checked":""}><i></i></label>
        <button class="abtn abtn--g abtn--xs" data-sedit="${s.id}">Edit</button>
        <button class="abtn abtn--g abtn--xs" data-sdupe="${s.id}">Duplicate</button>
        <button class="abtn abtn--d abtn--xs" data-sdel="${s.id}">Delete</button>
      </div>`).join("")}
    </div>${p.sections.length?"":`<div class="empty-a">This page has no sections. Add one to start building it.</div>`}</div>`;
}
const NAME_OF=t=>(SECTION_TYPES.find(x=>x[0]===t)||[t,t])[1];

function sectionFields(type){
  const base=[{k:"heading",label:"Heading"},{k:"heading_mr",label:"Heading (मराठी)"},{k:"kicker",label:"Kicker / number"},
    {k:"theme",label:"Theme",type:"select",opts:[["dark","Dark"],["paper","Paper"]]},
    {k:"sub",label:"Sub text",type:"textarea",full:true},
    {k:"sub_mr",label:"Sub text (मराठी)",type:"textarea",full:true}];
  const map={
    hero:[{k:"heading",label:"Heading"},{k:"heading_mr",label:"Heading (मराठी)"},{k:"media",label:"Background image",type:"media"},
      {k:"ctaLabel",label:"Primary button"},{k:"ctaHref",label:"Primary link"},
      {k:"cta2Label",label:"Secondary link"},{k:"cta2Href",label:"Secondary href"},
      {k:"sub",label:"Sub text",type:"textarea",full:true},{k:"sub_mr",label:"Sub text (मराठी)",type:"textarea",full:true}],
    text_intro:[{k:"heading",label:"Heading"},{k:"heading_mr",label:"Heading (मराठी)"},{k:"theme",label:"Theme",type:"select",opts:[["dark","Dark"],["paper","Paper"]]},
      {k:"linkLabel",label:"Link label"},{k:"linkHref",label:"Link href"},{k:"body",label:"Body",type:"textarea",rows:5,full:true},{k:"body_mr",label:"Body (मराठी)",type:"textarea",rows:5,full:true}],
    image_text:[{k:"heading",label:"Heading"},{k:"kicker",label:"Kicker"},{k:"media",label:"Image",type:"media"},
      {k:"ratio",label:"Ratio",type:"select",opts:[["r34","3:4"],["r43","4:3"],["r11","1:1"],["r169","16:9"],["r23","2:3"]]},
      {k:"flip",label:"Flip sides",type:"check"},{k:"theme",label:"Theme",type:"select",opts:[["dark","Dark"],["paper","Paper"]]},
      {k:"body",label:"Body",type:"textarea",rows:6,full:true},{k:"body_mr",label:"Body (मराठी)",type:"textarea",rows:6,full:true}],
    featured_portfolio:base.concat([{k:"limit",label:"How many",type:"number"}]),
    portfolio_grid:base,
    services:base, testimonials:base, social_wall:base.concat([{k:"handle",label:"Handle"},{k:"url",label:"Profile URL"},{k:"count",label:"Tiles",type:"number"}]),
    featured_story:base.concat([{k:"all",label:"Show every story",type:"check"}]),
    films:base.concat([{k:"limit",label:"How many",type:"number"},{k:"all",label:"Show every film",type:"check"}]),
    gallery:base.concat([{k:"count",label:"How many frames",type:"number"}]),
    video:base.concat([{k:"source",label:"Source",type:"select",opts:[["youtube","YouTube"],["vimeo","Vimeo"]]},
      {k:"url",label:"Video URL"},{k:"poster",label:"Poster",type:"media"}]),
    statistics:base.concat([{k:"itemsRaw",label:"Figures",type:"textarea",hint:"One per line: value | label",full:true}]),
    quote:[{k:"heading",label:"Quote",type:"textarea",full:true},{k:"sub",label:"Attribution"},
      {k:"theme",label:"Theme",type:"select",opts:[["dark","Dark"],["paper","Paper"]]}],
    social_embeds:base.concat([{k:"limit",label:"How many",type:"number"},{k:"all",label:"Show every embed",type:"check"}]),
    cta:[{k:"heading",label:"Heading"},{k:"heading_mr",label:"Heading (मराठी)"},{k:"ctaLabel",label:"Button label"},{k:"ctaLabel_mr",label:"Button label (मराठी)"},{k:"ctaHref",label:"Button link"},
      {k:"theme",label:"Theme",type:"select",opts:[["dark","Dark"],["paper","Paper"]]},{k:"body",label:"Body",type:"textarea",full:true},{k:"body_mr",label:"Body (मराठी)",type:"textarea",full:true}],
    contact:base,
    map:base.concat([{k:"embed",label:"Google Maps embed URL",full:true},{k:"address",label:"Address",type:"textarea",full:true}]),
    spacer:[{k:"height",label:"Height in px",type:"number"}]
  };
  return map[type]||base;
}
function sectionEdit(pageId,sid){
  const p=DB.pages.find(x=>x.id===pageId), s=p.sections.find(x=>x.id===sid);
  const fields=sectionFields(s.type);
  const data=Object.assign({},s.data);
  if(s.type==="statistics") data.itemsRaw=(data.items||[]).map(i=>i.value+" | "+i.label).join("\n");
  const meta=[{k:"anim",label:"Animation",type:"select",opts:ANIMS},{k:"align",label:"Alignment",type:"select",opts:[["left","Left"],["center","Centre"]]}];
  Modal.open("Edit "+NAME_OF(s.type).toLowerCase(),
    `<div class="tabs"><button class="is-on" data-tab="c">Content</button><button data-tab="m">Motion &amp; layout</button></div>
     <div class="tabpane is-on" id="tab_c">${formHTML(fields,data)}</div>
     <div class="tabpane" id="tab_m">${formHTML(meta,s)}
       <p style="color:var(--silver);font-size:.78rem">Animations are a fixed list. Custom scripts can't be injected from the CMS.</p></div>
     <div class="err" id="mErr"></div>`,
    `<button class="abtn abtn--g" id="mCancel">Cancel</button><button class="abtn" id="mSave">Save section</button>`,true);
  $("#modalBody").querySelector(".tabs").onclick=e=>{
    const b=e.target.closest("[data-tab]"); if(!b) return;
    $$(".tabs button").forEach(x=>x.classList.toggle("is-on",x===b));
    $$(".tabpane").forEach(x=>x.classList.toggle("is-on",x.id==="tab_"+b.dataset.tab));
  };
  $("#mCancel").onclick=Modal.close;
  $("#mSave").onclick=()=>{
    const d=readForm(fields,data);
    if(s.type==="statistics"){
      d.items=String(d.itemsRaw||"").split("\n").filter(Boolean).map(l=>{const [v,...r]=l.split("|");return {value:(v||"").trim(),label:r.join("|").trim()};});
      delete d.itemsRaw;
    }
    if((s.type==="video")&&d.url&&!(ytId(d.url)||vimeoId(d.url))){ $("#mErr").textContent="That video URL isn't a valid YouTube or Vimeo link."; return; }
    if(s.type==="map"&&d.embed&&!hostAllowed(d.embed)){ $("#mErr").textContent="Only Google Maps embed URLs are allowed here."; return; }
    s.data=Object.assign({},s.data,d);
    const m=readForm(meta,s); s.anim=m.anim; s.align=m.align;
    logAct("Updated section","page_section",s.id);
    Modal.close(); Admin.refresh(); toast("Section saved.",true);
  };
}
const bindPages=()=>{
  const body=$("#admBody");
  body.onclick=e=>{
    const t=e.target.closest("[data-pgbuild],[data-pgmeta],[data-sedit],[data-sdupe],[data-sdel],#bkBack,#bkAdd,#bkSave,#bkPreview");
    if(!t) return;
    if(t.dataset.pgbuild){ BUILD_PAGE=t.dataset.pgbuild; return Admin.render(); }
    if(t.dataset.pgmeta) return pageMeta(t.dataset.pgmeta);
    if(t.id==="bkBack"){ BUILD_PAGE=null; return Admin.render(); }
    const p=DB.pages.find(x=>x.id===BUILD_PAGE);
    if(t.id==="bkAdd") return addSection(p);
    if(t.id==="bkPreview") return preview(p.slug);
    if(t.id==="bkSave"){ p.status="published"; save(); logAct("Published page","page",p.id); renderChrome(); toast("Page saved and published.",true); return; }
    if(t.dataset.sedit) return sectionEdit(p.id,t.dataset.sedit);
    if(t.dataset.sdupe){ const s=p.sections.find(x=>x.id===t.dataset.sdupe);
      const c=JSON.parse(JSON.stringify(s)); c.id=uid("sc");
      p.sections.splice(p.sections.indexOf(s)+1,0,c); logAct("Duplicated section","page_section",c.id); Admin.refresh(); return; }
    if(t.dataset.sdel){ const s=p.sections.find(x=>x.id===t.dataset.sdel);
      confirmAction(`Remove the ${NAME_OF(s.type).toLowerCase()} section from ${p.title}?`,()=>{
        p.sections=p.sections.filter(x=>x.id!==s.id); logAct("Deleted section","page_section",s.id); Admin.refresh(); toast("Section removed."); }); }
  };
  body.onchange=e=>{
    const c=e.target.closest("[data-en]"); if(!c) return;
    const p=DB.pages.find(x=>x.id===BUILD_PAGE), s=p.sections.find(x=>x.id===c.dataset.en);
    s.enabled=c.checked; save(); logAct((s.enabled?"Enabled":"Disabled")+" section","page_section",s.id);
    toast(NAME_OF(s.type)+(s.enabled?" is visible.":" is hidden."),true);
  };
  /* drag and drop ordering */
  const list=$("#builder"); if(!list) return;
  let drag=null;
  list.addEventListener("dragstart",e=>{ const b=e.target.closest(".blk"); if(!b) return; drag=b; b.classList.add("dragging"); e.dataTransfer.effectAllowed="move"; });
  list.addEventListener("dragend",()=>{ if(drag) drag.classList.remove("dragging"); $$(".blk",list).forEach(b=>b.classList.remove("over")); drag=null; });
  list.addEventListener("dragover",e=>{
    e.preventDefault(); const b=e.target.closest(".blk"); if(!b||b===drag) return;
    $$(".blk",list).forEach(x=>x.classList.toggle("over",x===b));
    const r=b.getBoundingClientRect();
    list.insertBefore(drag, (e.clientY-r.top)/r.height>.5 ? b.nextSibling : b);
  });
  list.addEventListener("drop",e=>{
    e.preventDefault();
    const p=DB.pages.find(x=>x.id===BUILD_PAGE);
    const order=$$(".blk",list).map(b=>b.dataset.sid);
    p.sections.sort((a,b)=>order.indexOf(a.id)-order.indexOf(b.id));
    logAct("Reordered sections","page",p.id); Admin.refresh(); toast("Order saved — the live page now matches.",true);
  });
};
function addSection(p){
  Modal.open("Add a section",
    `<div class="afield"><label for="fx_type">Section type</label><select id="fx_type">${SECTION_TYPES.map(([v,l])=>`<option value="${v}">${l}</option>`).join("")}</select></div>`,
    `<button class="abtn abtn--g" id="mCancel">Cancel</button><button class="abtn" id="mSave">Add</button>`);
  $("#mCancel").onclick=Modal.close;
  $("#mSave").onclick=()=>{
    const type=$("#fx_type").value;
    p.sections.push({id:uid("sc"),type,enabled:true,anim:"fade-up",theme:"dark",align:"left",
      data:{heading:NAME_OF(type),sub:"",media:mk(),theme:"dark"}});
    logAct("Added section","page",p.id); Modal.close(); Admin.refresh(); toast(NAME_OF(type)+" added.",true);
  };
}
function pageMeta(id){
  const p=DB.pages.find(x=>x.id===id);
  const fields=[{k:"title",label:"Page title"},{k:"slug",label:"Slug"},
    {k:"status",label:"Status",type:"select",opts:STATUSES},{k:"ogImage",label:"Share image",type:"media"},
    {k:"seoTitle",label:"SEO title",full:true},{k:"seoDesc",label:"SEO description",type:"textarea",full:true}];
  Modal.open("SEO & meta — "+p.title,formHTML(fields,p),
    `<button class="abtn abtn--g" id="mCancel">Cancel</button><button class="abtn abtn--g" id="mPrev">Preview</button><button class="abtn" id="mSave">Save</button>`);
  $("#mCancel").onclick=Modal.close;
  $("#mPrev").onclick=()=>preview(p.slug);
  $("#mSave").onclick=()=>{ Object.assign(p,readForm(fields,p)); p.slug=slugify(p.slug||p.title);
    logAct("Updated page meta","page",p.id); Modal.close(); Admin.refresh(); toast("Page updated.",true); };
}
function preview(slug){
  try{ sessionStorage.setItem("qp.preview","1"); }catch(e){}
  const base=location.href.split("#")[0];
  Modal.open("Preview — unpublished content is shown",
    `<div class="prevbar"><button class="abtn abtn--g abtn--xs" data-w="100%">Desktop</button>
      <button class="abtn abtn--g abtn--xs" data-w="768px">Tablet</button>
      <button class="abtn abtn--g abtn--xs" data-w="390px">Mobile</button>
      <span style="color:var(--silver);font-size:.75rem">Previewing does not publish anything.</span></div>
     <div class="prevstage"><iframe id="prevFrame" style="width:100%" src="${esc(base)}#/${esc(slug==="home"?"":slug)}" title="Preview"></iframe></div>`,
    `<button class="abtn abtn--g" id="mCancel">Close preview</button>`,true);
  $(".prevbar").onclick=e=>{ const b=e.target.closest("[data-w]"); if(b) $("#prevFrame").style.width=b.dataset.w; };
  $("#mCancel").onclick=()=>{ try{ sessionStorage.removeItem("qp.preview"); }catch(e){} Modal.close(); };
}
