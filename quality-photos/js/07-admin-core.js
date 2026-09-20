/* ============================================================
   6. ADMIN CMS
   Permissions are checked before every mutating action, not
   just hidden in the UI.
   ============================================================ */
const DEMO_HASH={
  "admin@qualityphotos.in":"bee111eca90c948fa76c0147870d9d6e44c7a589a6805292637e9537f941292e",
  "editor@qualityphotos.in":"f5d467de14f2ed073653dd68eb25435b5439aaa95b855db464ee873218c2425a"
};
const PERMS={
  super_admin:["dashboard","pages","portfolio","services","stories","films","media","testimonials","embeds","social","enquiries","navigation","settings","users","logs"],
  editor:["dashboard","pages","portfolio","services","stories","films","media","testimonials","embeds","social","enquiries"]
};
const NAV_LABELS={dashboard:"Dashboard",pages:"Pages",portfolio:"Portfolio",services:"Services",stories:"Stories",
  films:"Films",media:"Media",testimonials:"Testimonials",embeds:"Social embeds",social:"Social",enquiries:"Enquiries",
  navigation:"Navigation",settings:"Settings",users:"Users",logs:"Activity log"};

let SESSION=null;
try{ SESSION=JSON.parse(sessionStorage.getItem("qp.session")||"null"); }catch(e){}
let LOGIN_FAILS=0, LOCK_UNTIL=0;

const can = v => !!(SESSION && (PERMS[SESSION.role]||[]).includes(v));
function guard(v){
  if(can(v)) return true;
  toast("Your role doesn't allow that.");
  return false;
}

/* ---------- modal ---------- */
const Modal={
  open(title,body,footer,wide){
    $("#modalTitle").textContent=title;
    $("#modalBody").innerHTML=body;
    $("#modalFoot").innerHTML=footer||"";
    $("#modalBox").classList.toggle("modal__box--wide",!!wide);
    $("#modal").classList.add("is-open");
    const f=$("#modalBody input,#modalBody select,#modalBody textarea"); if(f) f.focus();
  },
  close(){ $("#modal").classList.remove("is-open"); $("#modalBody").innerHTML=""; }
};
$("#modalX").addEventListener("click",Modal.close);
$("#modal").addEventListener("click",e=>{ if(e.target.id==="modal") Modal.close(); });
document.addEventListener("keydown",e=>{ if(e.key==="Escape"&&$("#modal").classList.contains("is-open")) Modal.close(); });
function confirmAction(msg,fn){
  Modal.open("Confirm",`<p style="margin:0;color:var(--on-film-dim)">${esc(msg)}</p>`,
    `<button class="abtn abtn--g" data-x="cancel">Cancel</button><button class="abtn abtn--d" data-x="ok">Yes, do it</button>`);
  $("#modalFoot").onclick=e=>{
    const b=e.target.closest("[data-x]"); if(!b) return;
    Modal.close(); if(b.dataset.x==="ok") fn();
  };
}

/* ---------- form builder ---------- */
function fieldHTML(f,val){
  const id="fx_"+f.k;
  const lab=`<label for="${id}">${esc(f.label)}</label>`;
  let inp="";
  if(f.type==="textarea") inp=`<textarea id="${id}" data-k="${f.k}" ${f.rows?`style="min-height:${f.rows*22}px"`:""}>${esc(val||"")}</textarea>`;
  else if(f.type==="select") inp=`<select id="${id}" data-k="${f.k}">${f.opts.map(o=>{
      const [v,l]=Array.isArray(o)?o:[o,o];
      return `<option value="${esc(v)}" ${String(val)===String(v)?"selected":""}>${esc(l)}</option>`;}).join("")}</select>`;
  else if(f.type==="check") inp=`<label class="row" style="gap:8px"><span class="sw"><input type="checkbox" id="${id}" data-k="${f.k}" ${val?"checked":""}><i></i></span><span style="font-size:.84rem">${esc(f.hint||"Enabled")}</span></label>`;
  else if(f.type==="media"){
    const cur=val||{};
    inp=`<div class="row" style="align-items:flex-start;gap:10px">
      <img class="thumb" id="${id}_p" src="${cur.src||phSVG(cur.id||"x",120,120)}" alt="" style="width:62px;height:62px;border-radius:4px;object-fit:cover">
      <select id="${id}" data-k="${f.k}" data-media="1" style="flex:1 1 160px">
        <option value="">Placeholder frame</option>
        ${DB.media.map(m=>`<option value="${m.id}" ${cur.id===m.id?"selected":""}>${esc(m.name)}</option>`).join("")}
      </select></div>`;
  }
  else if(f.type==="list") inp=`<textarea id="${id}" data-k="${f.k}" data-list="1" style="min-height:80px">${esc((val||[]).join("\n"))}</textarea>`;
  else inp=`<input id="${id}" data-k="${f.k}" type="${f.type||"text"}" value="${esc(val??"")}" ${f.max?`maxlength="${f.max}"`:""}>`;
  return `<div class="afield">${f.type==="check"?"":lab}${inp}${f.hint&&f.type!=="check"?`<small>${esc(f.hint)}</small>`:""}</div>`;
}
function formHTML(fields,obj){
  const g=fields.filter(f=>!f.full), full=fields.filter(f=>f.full);
  return `<div class="grid2">${g.map(f=>fieldHTML(f,obj[f.k])).join("")}</div>${full.map(f=>fieldHTML(f,obj[f.k])).join("")}`;
}
function readForm(fields,orig){
  const out={}; orig=orig||{};
  fields.forEach(f=>{
    const el=$(`#fx_${f.k}`); if(!el) return;
    if(f.type==="check") out[f.k]=el.checked;
    else if(f.type==="list") out[f.k]=el.value.split("\n").map(s=>s.trim()).filter(Boolean);
    else if(f.type==="media"){
      if(el.value) out[f.k]=DB.media.find(m=>m.id===el.value)||mk();
      else out[f.k]=(orig[f.k]&&!orig[f.k].src)?orig[f.k]:mk();   /* keep the same placeholder frame */
    }
    else if(f.type==="number") out[f.k]=Number(el.value||0);
    else out[f.k]=el.value;
  });
  return out;
}
document.addEventListener("change",e=>{
  const s=e.target;
  if(s.matches&&s.matches("select[data-media]")){
    const p=$("#"+s.id+"_p"); if(!p) return;
    const m=DB.media.find(x=>x.id===s.value);
    p.src=m?(m.thumb||m.src):phSVG("x",120,120);
  }
});

/* ---------- login ---------- */
$("#loginForm").addEventListener("submit",async ev=>{
  ev.preventDefault();
  const err=$("#lgErr");
  if(Date.now()<LOCK_UNTIL){ err.textContent="Too many attempts. Wait "+Math.ceil((LOCK_UNTIL-Date.now())/1000)+"s."; return; }
  const email=$("#lgUser").value.trim().toLowerCase(), pass=$("#lgPass").value;
  const user=DB.users.find(u=>u.email.toLowerCase()===email);
  const hash=await sha256(pass);
  const expect=user? (user.hash || DEMO_HASH[user.email]) : null;
  if(!user || !expect || hash!==expect){
    LOGIN_FAILS++; err.textContent="Email or password is wrong.";
    if(LOGIN_FAILS>=5){ LOCK_UNTIL=Date.now()+30000; LOGIN_FAILS=0; err.textContent="Too many attempts. Locked for 30 seconds."; }
    return;
  }
  LOGIN_FAILS=0; err.textContent="";
  SESSION={id:user.id,name:user.name,email:user.email,role:user.role,at:Date.now()};
  try{ sessionStorage.setItem("qp.session",JSON.stringify(SESSION)); }catch(e){}
  logAct("Signed in","user",user.email);
  $("#lgPass").value="";
  Admin.mount();
});
$("#admLogout").addEventListener("click",()=>{
  logAct("Signed out","user",SESSION&&SESSION.email);
  SESSION=null; try{ sessionStorage.removeItem("qp.session"); }catch(e){}
  Admin.mount();
});
$("#admBurger").addEventListener("click",()=>$("#admSide").classList.toggle("is-open"));

/* ============================================================
   Admin controller
   ============================================================ */
const Admin={
  view:"dashboard",
  mount(){
    if(!SESSION){ $("#admLogin").style.display="grid"; $("#admShell").hidden=true; return; }
    $("#admLogin").style.display="none"; $("#admShell").hidden=false;
    $("#admWho").innerHTML=`<b style="display:block">${esc(SESSION.name)}</b><span>${SESSION.role==="super_admin"?"Super admin":"Editor"}</span>`;
    const allowed=PERMS[SESSION.role]||[];
    if(!allowed.includes(this.view)) this.view="dashboard";
    $("#admNav").innerHTML=allowed.map(v=>{
      let tag="";
      if(v==="enquiries"){ const n=DB.enquiries.filter(e=>e.status==="New").length; if(n) tag=`<span class="tag">${n}</span>`; }
      return `<button data-v="${v}" class="${v===this.view?"is-on":""}">${NAV_LABELS[v]}${tag}</button>`;
    }).join("");
    $("#admNav").onclick=e=>{ const b=e.target.closest("[data-v]"); if(!b) return;
      this.view=b.dataset.v; $("#admSide").classList.remove("is-open"); this.mount(); };
    $("#admClock").textContent=new Date().toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"});
    this.render();
  },
  render(){
    const fn=VIEWS[this.view]||VIEWS.dashboard;
    $("#admBody").innerHTML=fn();
    if(BINDS[this.view]) BINDS[this.view]();
  },
  refresh(){ save(); this.mount(); }
};
function head(title,sub,actions){
  return `<div class="crumb">CMS / ${esc(title.toUpperCase())}</div>
  <div class="adm__head"><div><h2>${esc(title)}</h2>${sub?`<p>${esc(sub)}</p>`:""}</div>
  <div class="row">${actions||""}</div></div>`;
}
function statusPill(s){
  const c=s==="published"?"pub":s==="archived"?"arch":"draft";
  return `<span class="pill pill--${c}">${esc(s)}</span>`;
}
