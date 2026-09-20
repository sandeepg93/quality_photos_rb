/* ---------- SETTINGS ---------- */
const SETTING_FIELDS=[
  {k:"brand",label:"Brand name"},{k:"brand_mr",label:"Brand name (मराठी)"},
  {k:"tagline",label:"Tagline"},{k:"tagline_mr",label:"Tagline (मराठी)"},
  {k:"phone",label:"Phone"},{k:"whatsapp",label:"WhatsApp number",hint:"Country code, digits only. e.g. 919876543210"},
  {k:"email",label:"Email",type:"email"},{k:"instagramHandle",label:"Instagram handle"},
  {k:"waMessage",label:"Default WhatsApp message",full:true},
  {k:"address",label:"Studio address",type:"textarea",full:true},
  {k:"footerText",label:"Footer blurb",type:"textarea",full:true},
  {k:"footerText_mr",label:"Footer blurb (मराठी)",type:"textarea",full:true},
  {k:"copyright",label:"Copyright line",full:true},
  {k:"seoTitle",label:"Default SEO title",full:true},
  {k:"seoDesc",label:"Default SEO description",type:"textarea",full:true},
  {k:"seoTitle_mr",label:"SEO title (मराठी)",full:true},
  {k:"seoDesc_mr",label:"SEO description (मराठी)",type:"textarea",full:true},
  {k:"analytics",label:"Analytics ID",hint:"Stored only; no third-party script is injected in this build."}
];
function vSettings(){
  if(!can("settings")) return `<div class="empty-a">Your role can't open settings.</div>`;
  return head("Settings","Nothing here is hard-coded on the front end — change it and the site follows.",
    `<button class="abtn" id="stSave">Save settings</button>`)+
    `<div class="panel"><h3>Studio</h3>${formHTML(SETTING_FIELDS,DB.settings)}</div>
     <div class="panel"><h3>Danger zone</h3>
       <p style="color:var(--silver);margin:0 0 12px">Resetting wipes all content, media and enquiries stored in this browser and reloads the demo seed.</p>
       <button class="abtn abtn--d" id="stReset">Reset everything</button></div>`;
}
const bindSettings=()=>{
  const s=$("#stSave"); if(!s) return;
  s.onclick=()=>{ if(!guard("settings")) return;
    Object.assign(DB.settings,readForm(SETTING_FIELDS,DB.settings));
    save(); renderChrome(); logAct("Changed settings","site_settings","—"); toast("Settings saved.",true); };
  $("#stReset").onclick=()=>confirmAction("Wipe everything and reload the demo seed?",()=>{
    resetDB(); renderChrome(); Admin.refresh(); toast("Everything reset.",true); });
};

/* ---------- SOCIAL ---------- */
function vSocial(){
  const s=DB.settings.social||[];
  return head("Social links","Only enabled links with a URL appear in the footer.",
    `<button class="abtn abtn--g" id="soAdd">Add channel</button>`)+
   `<div class="panel"><div class="builder">
     ${s.map(x=>`<div class="blk" data-soid="${x.id}">
       <span class="blk__t"><b>${esc(x.label)}</b><span>${esc(x.url||"no URL set")}</span></span>
       <label class="sw"><input type="checkbox" data-soen="${x.id}" ${x.enabled?"checked":""}><i></i></label>
       <button class="abtn abtn--g abtn--xs" data-soedit="${x.id}">Edit</button>
       <button class="abtn abtn--d abtn--xs" data-sodel="${x.id}">Delete</button></div>`).join("")}
   </div></div>
   <div class="panel"><h3>Instagram</h3>
     <p style="color:var(--silver);margin:0">Instagram is never scraped. The social wall shows placeholder tiles that link to the profile until the studio uploads approved images to the media library and swaps them in.</p></div>`;
}
const bindSocial=()=>{
  $("#admBody").onchange=e=>{ const c=e.target.closest("[data-soen]"); if(!c) return;
    const it=DB.settings.social.find(x=>x.id===c.dataset.soen); it.enabled=c.checked; save(); renderChrome(); toast("Saved.",true); };
  $("#admBody").onclick=e=>{
    const t=e.target.closest("#soAdd,[data-soedit],[data-sodel]"); if(!t) return;
    if(t.id==="soAdd") return socialEdit(null);
    if(t.dataset.soedit) return socialEdit(t.dataset.soedit);
    const it=DB.settings.social.find(x=>x.id===t.dataset.sodel);
    confirmAction("Remove "+it.label+"?",()=>{ DB.settings.social=DB.settings.social.filter(x=>x.id!==it.id);
      save(); renderChrome(); Admin.refresh(); toast("Removed."); });
  };
};
function socialEdit(id){
  const isNew=!id, it=isNew?{id:uid("so"),label:"",url:"",enabled:true,order:99}:DB.settings.social.find(x=>x.id===id);
  const fields=[{k:"label",label:"Channel"},{k:"url",label:"URL",full:true},{k:"order",label:"Order",type:"number"}];
  Modal.open(isNew?"Add channel":"Edit channel",formHTML(fields,it),
    `<button class="abtn abtn--g" id="mCancel">Cancel</button><button class="abtn" id="mSave">Save</button>`);
  $("#mCancel").onclick=Modal.close;
  $("#mSave").onclick=()=>{ const d=readForm(fields);
    if(d.url&&!/^https?:\/\//i.test(d.url)) return toast("URLs must start with http:// or https://");
    Object.assign(it,d); if(isNew) DB.settings.social.push(it);
    save(); renderChrome(); Modal.close(); Admin.refresh(); toast("Saved.",true); };
}

/* ---------- USERS ---------- */
function vUsers(){
  if(!can("users")) return `<div class="empty-a">Only a super admin can manage users.</div>`;
  return head("Users","Roles are enforced on every action, not just hidden in the menu.",
    `<button class="abtn" id="usAdd">Add user</button>`)+
   `<div class="panel scrollx"><table class="tbl"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th></th></tr></thead>
    <tbody>${DB.users.map(u=>`<tr><td><b>${esc(u.name)}</b></td><td>${esc(u.email)}</td>
      <td><span class="pill">${u.role==="super_admin"?"Super admin":"Editor"}</span></td>
      <td style="text-align:right"><button class="abtn abtn--g abtn--xs" data-usedit="${u.id}">Edit</button>
      ${u.id===SESSION.id?"":`<button class="abtn abtn--d abtn--xs" data-usdel="${u.id}">Delete</button>`}</td></tr>`).join("")}
    </tbody></table></div>
    <div class="panel"><h3>Editor restrictions</h3><p style="color:var(--silver);margin:0">
      Editors manage pages, portfolio, services, stories, films, media, testimonials and enquiries.
      They cannot reach settings, users or the activity log.</p></div>`;
}
const bindUsers=()=>{
  const a=$("#usAdd"); if(a) a.onclick=()=>userEdit(null);
  $("#admBody").onclick=e=>{
    const t=e.target.closest("[data-usedit],[data-usdel]"); if(!t) return;
    if(!guard("users")) return;
    if(t.dataset.usedit) return userEdit(t.dataset.usedit);
    const u=DB.users.find(x=>x.id===t.dataset.usdel);
    confirmAction("Delete the account for "+u.email+"?",()=>{ DB.users=DB.users.filter(x=>x.id!==u.id);
      logAct("Deleted user","user",u.email); Admin.refresh(); toast("User deleted."); });
  };
};
function userEdit(id){
  const isNew=!id, u=isNew?{id:uid("u"),name:"",email:"",role:"editor",hash:""}:DB.users.find(x=>x.id===id);
  const fields=[{k:"name",label:"Name"},{k:"email",label:"Email",type:"email"},
    {k:"role",label:"Role",type:"select",opts:[["editor","Editor"],["super_admin","Super admin"]]},
    {k:"pass",label:isNew?"Password":"New password",type:"password",hint:"At least 8 characters. Stored as a SHA-256 hash, never in plain text.",full:true}];
  Modal.open(isNew?"Add user":"Edit user",formHTML(fields,u)+`<div class="err" id="mErr"></div>`,
    `<button class="abtn abtn--g" id="mCancel">Cancel</button><button class="abtn" id="mSave">Save</button>`);
  $("#mCancel").onclick=Modal.close;
  $("#mSave").onclick=async()=>{
    const d=readForm(fields);
    if(!RX_EMAIL.test(d.email||"")) return $("#mErr").textContent="Enter a valid email address.";
    if(DB.users.some(x=>x.email.toLowerCase()===d.email.toLowerCase()&&x.id!==u.id)) return $("#mErr").textContent="That email is already in use.";
    if(isNew&&(d.pass||"").length<8) return $("#mErr").textContent="Set a password of at least 8 characters.";
    if(d.pass){ if(d.pass.length<8) return $("#mErr").textContent="Passwords need at least 8 characters."; u.hash=await sha256(d.pass); }
    u.name=d.name; u.email=d.email; u.role=d.role;
    if(isNew) DB.users.push(u);
    logAct((isNew?"Created":"Updated")+" user","user",u.email);
    Modal.close(); Admin.refresh(); toast("User saved.",true);
  };
}

/* ---------- LOGS ---------- */
function vLogs(){
  if(!can("logs")) return `<div class="empty-a">Only a super admin can read the activity log.</div>`;
  const q=($("#admSearch")&&$("#admSearch").value||"").toLowerCase();
  const list=(DB.logs||[]).filter(l=>!q||JSON.stringify(l).toLowerCase().includes(q));
  return head("Activity log",list.length+" entries · newest first")+
    (list.length?`<div class="panel scrollx"><table class="tbl"><thead><tr><th>When</th><th>User</th><th>Action</th><th>Entity</th><th>Entity ID</th><th>IP</th></tr></thead>
      <tbody>${list.map(l=>`<tr><td>${new Date(l.at).toLocaleString("en-IN",{dateStyle:"short",timeStyle:"short"})}</td>
      <td>${esc(l.user)}</td><td>${esc(l.action)}</td><td>${esc(l.entity)}</td><td>${esc(l.entity_id)}</td><td>${esc(l.ip)}</td></tr>`).join("")}</tbody></table></div>`
    :`<div class="empty-a">Nothing logged yet.</div>`);
}

/* ---------- view registry ---------- */
const VIEWS={
  dashboard:vDashboard, pages:vPages, media:vMedia, enquiries:vEnquiries, navigation:vNavigation,
  settings:vSettings, social:vSocial, users:vUsers, logs:vLogs,
  portfolio:()=>resList("portfolio"), services:()=>resList("services"), stories:()=>resList("stories"),
  films:()=>resList("films"), testimonials:()=>resList("testimonials"), embeds:()=>resList("embeds")
};
const BINDS={
  dashboard:bindDashboard, pages:bindPages, media:bindMedia, enquiries:bindEnquiries, navigation:bindNavigation,
  settings:bindSettings, social:bindSocial, users:bindUsers,
  portfolio:BIND_RES, services:BIND_RES, stories:BIND_RES, films:BIND_RES, testimonials:BIND_RES, embeds:BIND_RES
};
let searchTimer=null;
$("#admSearch").addEventListener("input",()=>{
  clearTimeout(searchTimer);
  searchTimer=setTimeout(()=>{ if(["portfolio","services","stories","films","testimonials","embeds","media","enquiries","logs"].includes(Admin.view)) Admin.render(); },180);
});
/* ============================================================
   8. BOOT
   ============================================================ */
window.addEventListener("hashchange",route);
renderChrome();
route();
onScroll();
if(SESSION && (location.hash||"").indexOf("admin")>-1) Admin.mount();
requestAnimationFrame(()=>document.body.classList.add("is-ready"));
setTimeout(()=>document.body.classList.add("is-ready"),1500);
