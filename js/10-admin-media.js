/* ---------- MEDIA LIBRARY ---------- */
const MAX_UPLOAD=8*1024*1024, OK_TYPES=["image/jpeg","image/png","image/webp","image/avif","image/gif"];
function safeName(n){ return String(n).replace(/[^a-zA-Z0-9._-]/g,"_").slice(0,70); }
function resizeImage(file,maxW,quality){
  return new Promise((res,rej)=>{
    const fr=new FileReader();
    fr.onerror=()=>rej(new Error("read"));
    fr.onload=()=>{
      const im=new Image();
      im.onerror=()=>rej(new Error("decode"));
      im.onload=()=>{
        const sc=Math.min(1,maxW/im.width), w=Math.round(im.width*sc), h=Math.round(im.height*sc);
        const c=document.createElement("canvas"); c.width=w; c.height=h;
        c.getContext("2d").drawImage(im,0,0,w,h);
        let out=""; try{ out=c.toDataURL("image/webp",quality); }catch(e){}
        if(!out||out.indexOf("image/webp")<0) out=c.toDataURL("image/jpeg",quality);
        res({src:out,w,h});
      };
      im.src=fr.result;
    };
    fr.readAsDataURL(file);
  });
}
async function ingest(files){
  if(!guard("media")) return;
  const bar=$("#upBar"); if(bar){ bar.classList.add("on"); }
  let done=0, added=0;
  for(const f of files){
    if(!OK_TYPES.includes(f.type)){ toast(safeName(f.name)+" isn't an accepted image type."); done++; continue; }
    if(f.size>MAX_UPLOAD){ toast(safeName(f.name)+" is over the 8 MB limit."); done++; continue; }
    try{
      const large=await resizeImage(f,1600,.74);
      const thumb=await resizeImage(f,420,.7);
      DB.media.unshift({id:uid("md"),name:safeName(f.name),src:large.src,thumb:thumb.src,
        alt:"",caption:"",credit:"",folder:"uploads",tags:[],w:large.w,h:large.h,
        size:f.size,createdAt:new Date().toISOString()});
      added++;
    }catch(e){ toast("Could not process "+safeName(f.name)+"."); }
    done++;
    if(bar) $("i",bar).style.width=Math.round(done/files.length*100)+"%";
  }
  try{ save(); }catch(e){}
  if(added){ logAct("Uploaded media","media",added+" file(s)"); toast(added+" file(s) added to the library.",true); }
  Admin.refresh();
}
function vMedia(){
  const q=($("#admSearch")&&$("#admSearch").value||"").toLowerCase();
  const list=q?DB.media.filter(m=>(m.name+m.alt+m.tags.join(" ")).toLowerCase().includes(q)):DB.media;
  return head("Media library",DB.media.length+" files · stored in this browser for the demo",
    `<button class="abtn" id="upPick">Upload images</button>`)+
   `<input type="file" id="upInput" accept="image/*" multiple hidden>
    <div class="drop" id="drop">Drop images here, or use the upload button. JPEG, PNG, WebP, AVIF and GIF up to 8 MB.
      Large files are resized to a 1600&nbsp;px display copy and a 420&nbsp;px thumbnail.
      <div class="bar" id="upBar"><i></i></div></div>
    ${list.length?`<div class="mgrid" id="mgrid">${list.map(m=>`<figure class="mitem" data-mid="${m.id}">
      <img src="${m.thumb||m.src}" alt="${esc(m.alt)}" loading="lazy"><figcaption>${esc(m.name)}</figcaption></figure>`).join("")}</div>`
      :`<div class="empty-a">The library is empty. Uploaded images become available to every image field in the CMS.</div>`}`;
}
const bindMedia=()=>{
  const inp=$("#upInput"), drop=$("#drop");
  $("#upPick").onclick=()=>inp.click();
  inp.onchange=()=>{ if(inp.files.length) ingest([...inp.files]); };
  ["dragenter","dragover"].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add("over");}));
  ["dragleave","drop"].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.remove("over");}));
  drop.addEventListener("drop",e=>{ const f=[...(e.dataTransfer.files||[])]; if(f.length) ingest(f); });
  const g=$("#mgrid"); if(!g) return;
  g.onclick=e=>{
    const it=e.target.closest("[data-mid]"); if(!it) return;
    const m=DB.media.find(x=>x.id===it.dataset.mid);
    const fields=[{k:"name",label:"File name"},{k:"folder",label:"Folder"},
      {k:"alt",label:"Alt text",hint:"Describe the photograph for screen readers.",full:true},
      {k:"caption",label:"Caption",full:true},{k:"credit",label:"Credit"},
      {k:"tagsRaw",label:"Tags",hint:"Comma separated."}];
    Modal.open("Media — "+m.name,
      `<div class="row" style="align-items:flex-start;gap:16px">
         <img src="${m.src}" alt="" style="width:220px;border-radius:5px">
         <div style="flex:1 1 260px">${formHTML(fields,Object.assign({},m,{tagsRaw:(m.tags||[]).join(", ")}))}
           <p style="color:var(--silver);font-size:.75rem">${m.w}×${m.h}px · ${(m.size/1024).toFixed(0)} KB · added ${fmtDate(m.createdAt)}</p></div></div>`,
      `<button class="abtn abtn--d" id="mDel">Delete</button><button class="abtn abtn--g" id="mCopy">Copy reference</button>
       <button class="abtn abtn--g" id="mCancel">Cancel</button><button class="abtn" id="mSave">Save</button>`,true);
    $("#mCancel").onclick=Modal.close;
    $("#mCopy").onclick=async()=>{ try{ await navigator.clipboard.writeText(m.id); toast("Media id copied.",true);}catch(e){toast("Copy blocked by the browser.");} };
    $("#mDel").onclick=()=>confirmAction("Delete "+m.name+"? Anything using it falls back to a placeholder frame.",()=>{
      DB.media=DB.media.filter(x=>x.id!==m.id); logAct("Deleted media","media",m.id); Admin.refresh(); toast("File deleted."); });
    $("#mSave").onclick=()=>{ const d=readForm(fields);
      Object.assign(m,{name:safeName(d.name),folder:d.folder,alt:d.alt,caption:d.caption,credit:d.credit,
        tags:String(d.tagsRaw||"").split(",").map(s=>s.trim()).filter(Boolean)});
      logAct("Updated media","media",m.id); Modal.close(); Admin.refresh(); toast("Saved.",true); };
  };
};

/* ---------- ENQUIRIES ---------- */
function vEnquiries(){
  const q=($("#admSearch")&&$("#admSearch").value||"").toLowerCase();
  const list=q?DB.enquiries.filter(e=>JSON.stringify(e).toLowerCase().includes(q)):DB.enquiries;
  return head("Enquiries",DB.enquiries.length+" total · "+DB.enquiries.filter(e=>e.status==="New").length+" new",
    `<button class="abtn abtn--g" id="eqExport">Export CSV</button>`)+
   (list.length?`<div class="panel scrollx"><table class="tbl"><thead><tr>
      <th>Name</th><th>Phone</th><th>Email</th><th>Event</th><th>Date</th><th>Location</th><th>Status</th><th>Received</th><th></th></tr></thead>
      <tbody>${list.map(e=>`<tr><td><b>${esc(e.name)}</b></td><td>${esc(e.phone)}</td><td>${esc(e.email)}</td>
        <td>${esc(e.eventType||"")}</td><td>${e.eventDate?fmtDate(e.eventDate):"—"}</td><td>${esc(e.location||"—")}</td>
        <td><span class="pill ${e.status==="New"?"pill--new":""}">${esc(e.status)}</span></td>
        <td>${fmtDate(e.createdAt)}</td>
        <td style="text-align:right;white-space:nowrap"><button class="abtn abtn--g abtn--xs" data-eq="${e.id}">Open</button>
        <button class="abtn abtn--d abtn--xs" data-eqdel="${e.id}">Delete</button></td></tr>`).join("")}</tbody></table></div>`
    :`<div class="empty-a">No enquiries yet. Send one through the contact form on the website and it will land here.</div>`);
}
const bindEnquiries=()=>{
  $("#eqExport").onclick=()=>{
    if(!DB.enquiries.length) return toast("Nothing to export yet.");
    const cols=["name","phone","email","eventType","eventDate","location","guests","contactPref","status","createdAt","message"];
    const csv=[cols.join(",")].concat(DB.enquiries.map(e=>cols.map(c=>`"${String(e[c]??"").replace(/"/g,'""')}"`).join(","))).join("\n");
    const url=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
    const a=document.createElement("a"); a.href=url; a.download="quality-photos-enquiries.csv"; a.click();
    URL.revokeObjectURL(url); logAct("Exported enquiries","enquiry",DB.enquiries.length+" rows"); toast("CSV downloaded.",true);
  };
  $("#admBody").onclick=e=>{
    const o=e.target.closest("[data-eq]"), d=e.target.closest("[data-eqdel]");
    if(d){ const eq=DB.enquiries.find(x=>x.id===d.dataset.eqdel);
      return confirmAction("Delete the enquiry from "+eq.name+"?",()=>{ DB.enquiries=DB.enquiries.filter(x=>x.id!==eq.id);
        logAct("Deleted enquiry","enquiry",eq.id); Admin.refresh(); toast("Enquiry deleted."); }); }
    if(!o) return;
    const eq=DB.enquiries.find(x=>x.id===o.dataset.eq);
    const fields=[{k:"status",label:"Status",type:"select",opts:ENQ_STATUS},{k:"assignee",label:"Assigned to"},
      {k:"notes",label:"Internal notes",type:"textarea",rows:5,full:true}];
    Modal.open("Enquiry — "+eq.name,
      `<div class="grid2" style="margin-bottom:12px">
        <p><b>Phone</b><br><a href="tel:${esc(eq.phone)}">${esc(eq.phone)}</a></p>
        <p><b>Email</b><br><a href="mailto:${esc(eq.email)}">${esc(eq.email)}</a></p>
        <p><b>Event</b><br>${esc(eq.eventType||"—")} · ${eq.eventDate?fmtDate(eq.eventDate):"date TBC"}</p>
        <p><b>Location</b><br>${esc(eq.location||"—")}</p>
        <p><b>Guests</b><br>${esc(eq.guests||"—")}</p>
        <p><b>Prefers</b><br>${esc(eq.contactPref||"—")}</p></div>
       <div class="panel" style="margin:0 0 14px"><b style="font-size:.78rem;color:var(--silver)">MESSAGE</b>
         <p style="margin:8px 0 0;white-space:pre-wrap">${esc(eq.message||"(none)")}</p></div>
       ${formHTML(fields,eq)}`,
      `<a class="abtn abtn--g" href="${esc(waLink("Hello "+eq.name+", thank you for your enquiry with Quality Photos."))}" target="_blank" rel="noopener">Reply on WhatsApp</a>
       <button class="abtn abtn--g" id="mCancel">Close</button><button class="abtn" id="mSave">Save</button>`,true);
    $("#mCancel").onclick=Modal.close;
    $("#mSave").onclick=()=>{ Object.assign(eq,readForm(fields,eq)); logAct("Updated enquiry","enquiry",eq.id);
      Modal.close(); Admin.refresh(); toast("Enquiry updated.",true); };
  };
};

/* ---------- NAVIGATION ---------- */
function navList(which){
  const items=DB.navigation[which]||[];
  return `<div class="panel"><h3>${which==="header"?"Header menu":"Footer menu"}</h3>
    <div class="builder" data-nav="${which}">
      ${items.map(i=>`<div class="blk" draggable="true" data-nid="${i.id}">
        <span class="blk__h">⠿</span><span class="blk__t"><b>${esc(i.label)}</b><span>${esc(i.path)}</span></span>
        <label class="sw"><input type="checkbox" data-nen="${which}|${i.id}" ${i.enabled?"checked":""}><i></i></label>
        <button class="abtn abtn--g abtn--xs" data-nedit="${which}|${i.id}">Edit</button>
        <button class="abtn abtn--d abtn--xs" data-ndel="${which}|${i.id}">Delete</button></div>`).join("")}
    </div>
    <div class="row" style="margin-top:10px"><button class="abtn abtn--g abtn--xs" data-nadd="${which}">Add link</button></div></div>`;
}
function vNavigation(){
  return head("Navigation","Drag to reorder. The header, the mobile menu and the footer all read from here.")+
    navList("header")+navList("footer");
}
const bindNavigation=()=>{
  const body=$("#admBody");
  body.onchange=e=>{ const c=e.target.closest("[data-nen]"); if(!c) return;
    const [w,id]=c.dataset.nen.split("|"); const it=DB.navigation[w].find(x=>x.id===id);
    it.enabled=c.checked; save(); renderChrome(); toast(it.label+(it.enabled?" shown.":" hidden."),true); };
  body.onclick=e=>{
    const t=e.target.closest("[data-nadd],[data-nedit],[data-ndel]"); if(!t) return;
    if(t.dataset.nadd){ const w=t.dataset.nadd; return navEdit(w,null); }
    const [w,id]=(t.dataset.nedit||t.dataset.ndel).split("|");
    if(t.dataset.nedit) return navEdit(w,id);
    const it=DB.navigation[w].find(x=>x.id===id);
    confirmAction("Remove “"+it.label+"” from the "+w+" menu?",()=>{
      DB.navigation[w]=DB.navigation[w].filter(x=>x.id!==id); save(); renderChrome(); Admin.refresh(); toast("Link removed."); });
  };
  $$("[data-nav]").forEach(list=>{
    let drag=null;
    list.addEventListener("dragstart",e=>{ drag=e.target.closest(".blk"); if(drag) drag.classList.add("dragging"); });
    list.addEventListener("dragend",()=>{ if(drag) drag.classList.remove("dragging"); drag=null; });
    list.addEventListener("dragover",e=>{ e.preventDefault(); const b=e.target.closest(".blk"); if(!b||b===drag) return;
      const r=b.getBoundingClientRect(); list.insertBefore(drag,(e.clientY-r.top)/r.height>.5?b.nextSibling:b); });
    list.addEventListener("drop",e=>{ e.preventDefault(); const w=list.dataset.nav;
      const order=$$(".blk",list).map(b=>b.dataset.nid);
      DB.navigation[w].sort((a,b)=>order.indexOf(a.id)-order.indexOf(b.id));
      save(); renderChrome(); logAct("Reordered navigation","navigation",w); toast("Menu order saved.",true); });
  });
};
function navEdit(which,id){
  const isNew=!id, it=isNew?{id:uid("nv"),label:"",path:"#/",enabled:true}:DB.navigation[which].find(x=>x.id===id);
  const fields=[{k:"label",label:"Label"},{k:"path",label:"Link",hint:"For example #/portfolio"}];
  Modal.open(isNew?"Add link":"Edit link",formHTML(fields,it),
    `<button class="abtn abtn--g" id="mCancel">Cancel</button><button class="abtn" id="mSave">Save</button>`);
  $("#mCancel").onclick=Modal.close;
  $("#mSave").onclick=()=>{ const d=readForm(fields);
    if(!d.label) return toast("A label is required.");
    Object.assign(it,d); if(isNew) DB.navigation[which].push(it);
    save(); renderChrome(); logAct("Updated navigation","navigation",which); Modal.close(); Admin.refresh(); toast("Menu updated.",true); };
}
