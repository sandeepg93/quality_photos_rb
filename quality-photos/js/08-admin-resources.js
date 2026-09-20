/* ============================================================
   7. ADMIN VIEWS
   ============================================================ */
const mediaOpts=()=>DB.media;
const RES={
  portfolio:{ key:"projects", one:"Project", plural:"Portfolio",
    make:()=>({id:uid("pr"),title:"Untitled project",slug:"",categoryId:(DB.categories[0]||{}).id,date:new Date().toISOString().slice(0,10),
      location:"",excerpt:"",description:"",cover:mk(),media:mks(4,"New project"),videoUrl:"",status:"draft",featured:false,order:0}),
    fields:o=>[
      {k:"title",label:"Title",max:90},{k:"title_mr",label:"Title (मराठी)",max:90},
      {k:"slug",label:"Slug",hint:"Leave blank to generate from the title."},
      {k:"categoryId",label:"Category",type:"select",opts:DB.categories.map(c=>[c.id,c.name])},
      {k:"date",label:"Shoot date",type:"date"},{k:"location",label:"Location"},
      {k:"cover",label:"Cover image",type:"media"},
      {k:"status",label:"Status",type:"select",opts:STATUSES},
      {k:"videoUrl",label:"Film URL",hint:"YouTube or Vimeo only."},
      {k:"featured",label:"Featured",type:"check",hint:"Mark as a select — shows on the homepage"},
      {k:"excerpt",label:"Short line",type:"textarea",full:true},
      {k:"excerpt_mr",label:"Short line (मराठी)",type:"textarea",full:true},
      {k:"description",label:"Description",type:"textarea",rows:6,full:true},
      {k:"description_mr",label:"Description (मराठी)",type:"textarea",rows:6,full:true}],
    cols:["","Title","Category","Date","Status",""],
    row:o=>`<td><img class="thumb" src="${(o.cover&&o.cover.src)||phSVG(o.id,90,90)}" alt=""></td>
      <td><b>${esc(o.title)}</b><br><span style="color:var(--silver);font-size:.75rem">/${esc(o.slug)} · ${(o.media||[]).length} frames${o.featured?" · select":""}</span></td>
      <td>${esc(catName(o.categoryId))}</td><td>${fmtDate(o.date)}</td><td>${statusPill(o.status)}</td>`},
  services:{ key:"services", one:"Service", plural:"Services",
    make:()=>({id:uid("sv"),title:"New service",slug:"",short:"",long:"",cover:mk(),gallery:mks(3,"Service"),features:[],faq:[],status:"draft",order:99}),
    fields:o=>[{k:"title",label:"Title"},{k:"title_mr",label:"Title (मराठी)"},{k:"slug",label:"Slug"},
      {k:"cover",label:"Cover image",type:"media"},{k:"status",label:"Status",type:"select",opts:STATUSES},
      {k:"order",label:"Display order",type:"number"},
      {k:"short",label:"Short description",type:"textarea",full:true},
      {k:"short_mr",label:"Short description (मराठी)",type:"textarea",full:true},
      {k:"long",label:"Long description",type:"textarea",rows:5,full:true},
      {k:"long_mr",label:"Long description (मराठी)",type:"textarea",rows:5,full:true},
      {k:"features",label:"What's included",type:"list",hint:"One per line.",full:true}],
    cols:["","Service","Order","Status",""],
    row:o=>`<td><img class="thumb" src="${(o.cover&&o.cover.src)||phSVG(o.id,90,90)}" alt=""></td>
      <td><b>${esc(o.title)}</b><br><span style="color:var(--silver);font-size:.75rem">${esc(o.short||"")}</span></td>
      <td>${o.order}</td><td>${statusPill(o.status)}</td>`},
  stories:{ key:"stories", one:"Story", plural:"Stories",
    make:()=>({id:uid("st"),title:"Untitled story",slug:"",excerpt:"",cover:mk(),category:"Journal",author:(SESSION&&SESSION.name)||"",
      date:new Date().toISOString().slice(0,10),status:"draft",body:"",gallery:mks(3,"Story"),videoUrl:""}),
    fields:o=>[{k:"title",label:"Title"},{k:"title_mr",label:"Title (मराठी)"},{k:"slug",label:"Slug"},{k:"category",label:"Category"},
      {k:"author",label:"Author"},{k:"date",label:"Publish date",type:"date"},
      {k:"cover",label:"Cover image",type:"media"},{k:"status",label:"Status",type:"select",opts:STATUSES},
      {k:"videoUrl",label:"Video URL",hint:"YouTube or Vimeo only."},
      {k:"excerpt",label:"Excerpt",type:"textarea",full:true},
      {k:"excerpt_mr",label:"Excerpt (मराठी)",type:"textarea",full:true},
      {k:"body",label:"Body",type:"textarea",rows:10,hint:"Blank line between paragraphs.",full:true},
      {k:"body_mr",label:"Body (मराठी)",type:"textarea",rows:10,full:true}],
    cols:["","Story","Category","Date","Status",""],
    row:o=>`<td><img class="thumb" src="${(o.cover&&o.cover.src)||phSVG(o.id,90,90)}" alt=""></td>
      <td><b>${esc(o.title)}</b><br><span style="color:var(--silver);font-size:.75rem">/${esc(o.slug)}</span></td>
      <td>${esc(o.category||"")}</td><td>${fmtDate(o.date)}</td><td>${statusPill(o.status)}</td>`},
  films:{ key:"films", one:"Film", plural:"Films",
    make:()=>({id:uid("fl"),title:"New film",description:"",source:"youtube",url:"",poster:mk(),status:"draft",order:99}),
    fields:o=>[{k:"title",label:"Title"},
      {k:"source",label:"Source",type:"select",opts:[["youtube","YouTube"],["vimeo","Vimeo"],["instagram","Instagram reel"],["upload","Uploaded file"]]},
      {k:"url",label:"URL",hint:"Only YouTube, Vimeo and Instagram links are accepted.",full:true},
      {k:"poster",label:"Poster image",type:"media"},{k:"status",label:"Status",type:"select",opts:STATUSES},
      {k:"order",label:"Order",type:"number"},
      {k:"description",label:"Description",type:"textarea",full:true}],
    validate:o=>{
      if(o.source==="upload") return "";
      if(!o.url) return "Add a video URL.";
      if(!hostAllowed(o.url)) return "That domain isn't on the embed whitelist.";
      if(o.source==="youtube"&&!ytId(o.url)) return "No YouTube video ID found in that URL.";
      if(o.source==="vimeo"&&!vimeoId(o.url)) return "No Vimeo video ID found in that URL.";
      return "";
    },
    cols:["","Film","Source","Status",""],
    row:o=>`<td><img class="thumb" src="${(o.poster&&o.poster.src)||phSVG(o.id,90,90)}" alt=""></td>
      <td><b>${esc(o.title)}</b><br><span style="color:var(--silver);font-size:.75rem">${esc(o.url||"no file")}</span></td>
      <td>${esc(o.source)}</td><td>${statusPill(o.status)}</td>`},
  embeds:{ key:"social_embeds", one:"Embed", plural:"Social embeds",
    make:()=>({id:uid("em"),title:"New embed",title_mr:"",caption:"",caption_mr:"",url:"",status:"draft",order:99}),
    fields:o=>[{k:"title",label:"Title"},{k:"title_mr",label:"Title (मराठी)"},
      {k:"url",label:"Post URL",hint:"YouTube, Vimeo, Instagram, Facebook, Pinterest or X.",full:true},
      {k:"status",label:"Status",type:"select",opts:STATUSES},{k:"order",label:"Order",type:"number"},
      {k:"caption",label:"Caption",type:"textarea",full:true},
      {k:"caption_mr",label:"Caption (मराठी)",type:"textarea",full:true}],
    validate:o=>{
      if(!o.url) return "Paste the URL of the post you want to embed.";
      if(!hostAllowed(o.url)) return "That domain isn't on the embed whitelist.";
      const m=socialEmbed(o.url);
      if(!m.p) return "Could not work out which platform that URL belongs to.";
      return "";
    },
    cols:["Platform","Embed","Embeddable","Status",""],
    row:o=>{ const m=socialEmbed(o.url);
      return `<td><span class="pill">${esc(PLAT_NAME[m.p]||"—")}</span></td>
      <td><b>${esc(o.title)}</b><br><span style="color:var(--silver);font-size:.75rem">${esc(o.url)}</span></td>
      <td>${m.src?"iframe":"link only"}</td><td>${statusPill(o.status)}</td>`; }},
  testimonials:{ key:"testimonials", one:"Testimonial", plural:"Testimonials",
    make:()=>({id:uid("ts"),name:"",text:"",event:"",rating:5,order:99,status:"draft",image:mk()}),
    fields:o=>[{k:"name",label:"Client name"},{k:"event",label:"Event type"},
      {k:"rating",label:"Rating (1–5)",type:"number"},{k:"order",label:"Order",type:"number"},
      {k:"image",label:"Photo",type:"media"},{k:"status",label:"Status",type:"select",opts:STATUSES},
      {k:"text",label:"Review",type:"textarea",rows:5,hint:"Only publish reviews a client actually wrote.",full:true},
      {k:"text_mr",label:"Review (मराठी)",type:"textarea",rows:5,full:true}],
    cols:["","Client","Event","Status",""],
    row:o=>`<td><img class="thumb" src="${(o.image&&o.image.src)||phSVG(o.id,90,90)}" alt=""></td>
      <td><b>${esc(o.name||"(no name)")}</b><br><span style="color:var(--silver);font-size:.75rem">${esc((o.text||"").slice(0,72))}…</span></td>
      <td>${esc(o.event||"")}</td><td>${statusPill(o.status)}</td>`}
};

function resList(name){
  const r=RES[name], items=DB[r.key]||[];
  const q=($("#admSearch")&&$("#admSearch").value||"").toLowerCase();
  const shown=q?items.filter(o=>JSON.stringify(o).toLowerCase().includes(q)):items;
  return head(r.plural,`${items.length} total · ${pub(items).length} published`,
    `<button class="abtn" data-new="${name}">New ${r.one.toLowerCase()}</button>`)+
    (shown.length?`<div class="panel scrollx"><table class="tbl"><thead><tr>${r.cols.map(c=>`<th>${c}</th>`).join("")}</tr></thead>
      <tbody>${shown.map(o=>`<tr>${r.row(o)}<td style="text-align:right;white-space:nowrap">
        <button class="abtn abtn--g abtn--xs" data-edit="${name}|${o.id}">Edit</button>
        <button class="abtn abtn--g abtn--xs" data-dupe="${name}|${o.id}">Duplicate</button>
        <button class="abtn abtn--g abtn--xs" data-pubtoggle="${name}|${o.id}">${o.status==="published"?"Unpublish":"Publish"}</button>
        <button class="abtn abtn--d abtn--xs" data-del="${name}|${o.id}">Delete</button></td></tr>`).join("")}</tbody></table></div>`
      :`<div class="empty-a">Nothing here yet. Create your first ${esc(r.one.toLowerCase())} to see it on the site.</div>`);
}
function resEdit(name,id){
  const r=RES[name], isNew=!id;
  const obj=isNew?r.make():JSON.parse(JSON.stringify(DB[r.key].find(o=>o.id===id)));
  const fields=r.fields(obj);
  Modal.open((isNew?"New ":"Edit ")+r.one.toLowerCase(),
    formHTML(fields,obj)+`<div class="err" id="mErr" role="alert"></div>`,
    `<button class="abtn abtn--g" id="mCancel">Cancel</button><button class="abtn" id="mSave">Save</button>`,true);
  $("#mCancel").onclick=Modal.close;
  $("#mSave").onclick=()=>{
    const patch=readForm(fields,obj);
    Object.assign(obj,patch);
    if("slug" in obj) obj.slug=slugify(obj.slug||obj.title||obj.name);
    if(r.validate){ const msg=r.validate(obj); if(msg){ $("#mErr").textContent=msg; return; } }
    if(!obj.title&&!obj.name){ $("#mErr").textContent="A title is required."; return; }
    if(isNew) DB[r.key].unshift(obj);
    else DB[r.key]=DB[r.key].map(o=>o.id===obj.id?obj:o);
    logAct((isNew?"Created ":"Updated ")+r.one.toLowerCase(),name,obj.id);
    Modal.close(); Admin.refresh(); toast(r.one+" saved.",true);
  };
}
const BIND_RES=()=>{
  $("#admBody").onclick=e=>{
    const t=e.target.closest("[data-new],[data-edit],[data-dupe],[data-del],[data-pubtoggle]"); if(!t) return;
    if(t.dataset.new) return resEdit(t.dataset.new,null);
    const [name,id]=(t.dataset.edit||t.dataset.dupe||t.dataset.del||t.dataset.pubtoggle).split("|");
    const r=RES[name], obj=DB[r.key].find(o=>o.id===id);
    if(t.dataset.edit) return resEdit(name,id);
    if(t.dataset.dupe){ const c=JSON.parse(JSON.stringify(obj)); c.id=uid("cp");
      c.title=(c.title||c.name)+" (copy)"; if(c.slug) c.slug=slugify(c.title); c.status="draft";
      DB[r.key].unshift(c); logAct("Duplicated "+r.one.toLowerCase(),name,c.id); Admin.refresh(); toast("Duplicated as a draft.",true); return; }
    if(t.dataset.pubtoggle){ obj.status=obj.status==="published"?"draft":"published";
      logAct((obj.status==="published"?"Published ":"Unpublished ")+r.one.toLowerCase(),name,obj.id);
      Admin.refresh(); toast(r.one+" is now "+obj.status+".",true); return; }
    if(t.dataset.del) confirmAction(`Delete “${obj.title||obj.name}”? This can't be undone.`,()=>{
      DB[r.key]=DB[r.key].filter(o=>o.id!==id); logAct("Deleted "+r.one.toLowerCase(),name,id); Admin.refresh(); toast("Deleted."); });
  };
};

/* ---------- dashboard ---------- */
function vDashboard(){
  const s=DB, newE=s.enquiries.filter(e=>e.status==="New").length;
  const cards=[[s.enquiries.length,"Enquiries"],[newE,"New enquiries"],[s.projects.length,"Portfolio projects"],
    [pub(s.stories).length,"Published stories"],[pub(s.services).length,"Services"],[s.media.length,"Media files"],
    [s.films.length,"Films"],[pub(s.testimonials).length,"Testimonials"]];
  return head("Dashboard","Everything below drives the live site.",
      `<a class="abtn abtn--g" href="#/" data-link>Open the website</a>`)+
    `<div class="cards">${cards.map(([n,l])=>`<div class="card"><b>${n}</b><span>${l.toUpperCase()}</span></div>`).join("")}</div>
    ${DB._demo?`<div class="panel" style="border-left:3px solid var(--mark)">
      <h3>This site is running on demo content</h3>
      <p style="color:var(--silver);margin:0 0 12px">Every project, service, story, testimonial and photograph is placeholder material, clearly marked on the front end. Replace them before launch, or clear everything and start clean.</p>
      <div class="row"><button class="abtn abtn--g" id="dashMarkReal">Hide the demo notice</button>
      <button class="abtn abtn--d" id="dashReset">Reset to fresh demo data</button></div></div>`:""}
    <div class="panel"><h3>Recent activity</h3>
      ${(DB.logs||[]).length?`<div class="scrollx"><table class="tbl"><thead><tr><th>When</th><th>User</th><th>Action</th><th>Entity</th></tr></thead>
        <tbody>${DB.logs.slice(0,8).map(l=>`<tr><td>${new Date(l.at).toLocaleString("en-IN",{dateStyle:"short",timeStyle:"short"})}</td>
        <td>${esc(l.user)}</td><td>${esc(l.action)}</td><td>${esc(l.entity)}</td></tr>`).join("")}</tbody></table></div>`
        :`<div class="empty-a">No activity recorded yet.</div>`}</div>`;
}
const bindDashboard=()=>{
  const r=$("#dashReset"); if(r) r.onclick=()=>confirmAction("Reset every piece of content back to the demo seed?",()=>{ resetDB(); renderChrome(); Admin.refresh(); toast("Demo data restored.",true); });
  const m=$("#dashMarkReal"); if(m) m.onclick=()=>{ DB._demo=false; Admin.refresh(); };
};
