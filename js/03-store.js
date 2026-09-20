/* ============================================================
   1. CONTENT STORE  (the CMS database)
   In this build the store lives in localStorage so the whole
   site runs from HTML/CSS/JS alone. Swap `load`/`save` for
   fetch() calls against a REST API to move it server-side.
   ============================================================ */
const KEY="qp.cms.v1";
const SECTION_TYPES=[
  ["hero","Hero"],["text_intro","Text intro"],["featured_portfolio","Featured portfolio"],["portfolio_grid","Portfolio grid"],
  ["services","Services"],["featured_story","Featured story"],["image_text","Image + text"],["video","Video"],
  ["films","Films"],["testimonials","Testimonials"],["social_wall","Social wall"],["gallery","Gallery"],
  ["social_embeds","Social embeds"],["quote","Quote"],["statistics","Statistics"],["cta","Call to action"],["contact","Contact form"],["map","Map"],["spacer","Spacer"]
];
const ANIMS=["none","fade-up","fade","slide-left","slide-right","clip","scale","stagger"];
const STATUSES=["draft","review","published","archived"];
const ENQ_STATUS=["New","Contacted","Follow-up","Confirmed","Closed","Spam"];
const TODO="[CONTENT TO BE CONFIGURED]";

const mk=(alt)=>({id:uid("md"),alt:alt||"Placeholder photograph",src:"",caption:""});
const mks=(n,alt)=>Array.from({length:n},(_,i)=>mk(alt+" — frame "+(i+1)));

function seed(){
  const cats=[
    {id:"c1",name:"Wedding",name_mr:"विवाह",slug:"wedding"},{id:"c2",name:"Pre-Wedding",name_mr:"प्री-वेडिंग",slug:"pre-wedding"},
    {id:"c3",name:"Portrait",name_mr:"पोर्ट्रेट",slug:"portrait"},{id:"c4",name:"Events",name_mr:"कार्यक्रम",slug:"events"},
    {id:"c5",name:"Couple",name_mr:"कपल",slug:"couple"}
  ];
  const P=(t,cat,loc,n,feat)=>({
    id:uid("pr"),title:t,slug:slugify(t),categoryId:cat,date:"2025-"+String(1+Math.floor(Math.random()*11)).padStart(2,"0")+"-14",
    location:loc,excerpt:"Demo project — replace this text and the placeholder frames from the CMS.",
    title_mr:"",excerpt_mr:"डेमो प्रकल्प — हा मजकूर आणि प्लेसहोल्डर फ्रेम्स CMS मधून बदला.",description_mr:"",
    description:"This is demo copy so the layout can be reviewed with realistic density. "+TODO,
    cover:mk(t+" cover"),media:mks(n,t),videoUrl:"",status:"published",featured:!!feat,order:0
  });
  const projects=[
    P("Sanika & Omkar",'c1',"Dahiwadi",8,true), P("Aarohi & Rudra",'c1',"Panhala",7,true),
    P("Mist & Marigold",'c2',"Amba Ghat",6,true), P("Riverside Morning",'c2',"Radhanagari",6,false),
    P("Ira, in natural light",'c3',"Studio",5,true), P("Gharshana Sangeet",'c4',"Sangli",7,false),
    P("Shubhangi & Tejas",'c1',"Kagal",6,false), P("The Ghat Walk",'c5',"Jyotiba",5,true),
    P("Nandini — graduation",'c3',"Dahiwadi",4,false), P("Annual gala night",'c4',"Pune",6,false),
    P("Meghana & Vikram",'c1',"Ratnagiri",6,false), P("Two Chairs, One Monsoon",'c5',"Amboli",5,true)
  ];
  const SVC_MR={"Wedding":["विवाह","हळदीपासून शेवटच्या नृत्यापर्यंत संपूर्ण दिवसाचे चित्रीकरण."],
    "Pre-Wedding":["प्री-वेडिंग","प्रकाशाचा विचार करून ठरवलेले, घाई न करता केलेले शूट."],
    "Couple":["कपल","वाढदिवस आणि साखरपुड्यासाठी छोटी, निवांत सेशन्स."],
    "Portrait":["पोर्ट्रेट","व्यक्ती आणि कुटुंबांसाठी स्टुडिओ व नैसर्गिक प्रकाशातील पोर्ट्रेट."],
    "Events":["कार्यक्रम","रिसेप्शन, संगीत, कॉर्पोरेट आणि सांस्कृतिक संध्याकाळ."],
    "Cinematography":["सिनेमॅटोग्राफी","दिवसातून घडलेले चित्रित करतो, दिवस घडवत नाही."]};
  const svc=(t,s,f)=>({id:uid("sv"),title:t,title_mr:(SVC_MR[t]||["",""])[0],short_mr:(SVC_MR[t]||["",""])[1],slug:slugify(t),short:s,
    long:"Demo service description. "+TODO,cover:mk(t),gallery:mks(4,t),features:f,
    faq:[{q:"How far in advance should we book?",a:TODO},{q:"Do you travel outside Maharashtra?",a:TODO}],
    status:"published",order:0,seoTitle:"",seoDesc:""});
  const services=[
    svc("Wedding","Full-day coverage, from the haldi through to the last dance.",["Two photographers","Full-day coverage","Edited gallery","Printed album option"]),
    svc("Pre-Wedding","An unhurried shoot on location, planned around light.",["Half-day shoot","Two locations","Wardrobe guidance","40+ edited frames"]),
    svc("Couple","Short, relaxed sessions for anniversaries and engagements.",["90-minute session","One location","25+ edited frames"]),
    svc("Portrait","Studio and natural-light portraits for people and families.",["Studio or location","Retouched selects","Print-ready files"]),
    svc("Events","Receptions, sangeet, corporate and cultural evenings.",["Event-length coverage","Same-week previews","Team of two"]),
    svc("Cinematography","Films cut from the day, not staged for it.",["4K capture","Teaser + full film","Licensed music"])
  ];
  const stories=[
    {id:uid("st"),title:"Shooting a Dahiwadi wedding in the monsoon",title_mr:"पावसाळ्यात दहिवडीचा विवाह टिपताना",excerpt_mr:"पाऊस प्रकाश, वेळापत्रक आणि वातावरण बदलतो. त्याचे नियोजन आम्ही असे करतो.",slug:"monsoon-wedding-Dahiwadi",
     excerpt:"Rain changes the light, the timeline and the mood. Here is how we plan around it.",
     cover:mk("Monsoon wedding"),category:"Field notes",author:"Rajkumar Bhosale",date:"2026-06-18",status:"published",
     body:"Demo article body. "+TODO+"\n\nEvery paragraph here is placeholder text written so the reading column, measure and rhythm can be judged properly before real writing replaces it.",
     gallery:mks(4,"Monsoon wedding"),videoUrl:""},
    {id:uid("st"),title:"What to wear for a pre-wedding shoot",title_mr:"प्री-वेडिंग शूटसाठी काय घालावे",excerpt_mr:"महाराष्ट्राच्या प्रकाशात चांगले दिसणारे साधे कपड्यांचे पर्याय.",slug:"what-to-wear-pre-wedding",
     excerpt:"Simple wardrobe choices that photograph well in Maharashtra's light.",
     cover:mk("Wardrobe"),category:"Guides",author:"Rajkumar Bhosale",date:"2026-04-02",status:"published",
     body:"Demo article body. "+TODO,gallery:mks(3,"Wardrobe"),videoUrl:""},
    {id:uid("st"),title:"Why we still shoot a few frames on film",title_mr:"आजही काही फ्रेम्स फिल्मवर का काढतो",excerpt_mr:"प्रत्येक विवाहाला ४०० चा एक रोल, आणि त्यामुळे पाहण्याची दृष्टी कशी बदलते.",slug:"a-few-frames-on-film",
     excerpt:"A roll of 400 per wedding, and what it does to the way we see.",
     cover:mk("Film rolls"),category:"Craft",author:"Rajkumar Bhosale",date:"2026-01-27",status:"published",
     body:"Demo article body. "+TODO,gallery:mks(3,"Film"),videoUrl:""}
  ];
  const films=[
    {id:uid("fl"),title:"Sanika & Omkar — wedding film",description:"Demo entry. Paste a real YouTube link in the CMS.",
     source:"youtube",url:"https://www.youtube.com/watch?v=aqz-KE-bpKQ",poster:mk("Wedding film"),status:"published",order:0},
    {id:uid("fl"),title:"Amba Ghat — pre-wedding teaser",description:"Demo entry.",source:"vimeo",
     url:"https://vimeo.com/76979871",poster:mk("Ghat teaser"),status:"published",order:1},
    {id:uid("fl"),title:"Behind the day — reel",description:"Instagram reels open on Instagram.",source:"instagram",
     url:"https://www.instagram.com/rajkumar_bhosale_photography/",poster:mk("Reel"),status:"published",order:2},
    {id:uid("fl"),title:"Studio portrait session",description:"Demo entry for a self-hosted file.",source:"upload",
     url:"",poster:mk("Studio"),status:"draft",order:3}
  ];
  const testimonials=[
    {id:uid("ts"),name:"Demo client A",text:"Sample testimonial text. Replace with a real, written permission-backed review from the CMS.",event:"Wedding",rating:5,order:0,status:"published",image:mk("Client A")},
    {id:uid("ts"),name:"Demo client B",text:"Sample testimonial text. "+TODO,event:"Pre-Wedding",rating:5,order:1,status:"published",image:mk("Client B")},
    {id:uid("ts"),name:"Demo client C",text:"Sample testimonial text. "+TODO,event:"Events",rating:4,order:2,status:"published",image:mk("Client C")}
  ];
  const S=(type,data,anim)=>({id:uid("sc"),type,enabled:true,anim:anim||"fade-up",theme:"dark",align:"left",data:data||{}});
  const home={id:"pg_home",slug:"home",title:"Home",seoTitle:"Quality Photos — Wedding & Portrait Photography",
    seoDesc:"Wedding, pre-wedding and portrait photography in Dahiwadi. Cinematic frames, honest moments.",
    ogImage:mk("Home OG"),status:"published",sections:[
      S("hero",{heading:"Photographs that still feel like the day itself",
        heading_mr:"त्या दिवसासारखीच वाटणारी छायाचित्रे",
        sub_mr:"कोल्हापुरात आणि संपूर्ण महाराष्ट्रात केलेले विवाह, प्री-वेडिंग आणि पोर्ट्रेट काम.",
        ctaLabel_mr:"पोर्टफोलिओ पहा",cta2Label_mr:"सल्लामसलत बुक करा",
        sub:"Wedding, pre-wedding and portrait work made in Dahiwadi and across Maharashtra.",
        ctaLabel:"See the portfolio",ctaHref:"#/portfolio",cta2Label:"Book a consultation",cta2Href:"#/contact",
        media:mk("Hero frame"),videoUrl:""},"fade"),
      S("text_intro",{heading:"We photograph the hour before the ceremony as carefully as the ceremony.",
        heading_mr:"समारंभाइतक्याच काळजीने आम्ही त्याआधीचा तासही टिपतो.",
        body_mr:"क्वालिटी फोटोज हा एक छोटा स्टुडिओ आहे. एक मुख्य छायाचित्रकार, एक सहाय्यक आणि असा एडिटिंग डेस्क जो स्वतः छापणार नाही असा फोटो कधीच देत नाही. वर्षातून मोजक्याच तारखा घेतल्या जातात, त्यामुळे प्रत्येक विवाहाला पूर्ण वेळ मिळतो.",
        linkLabel_mr:"स्टुडिओविषयी",
        body:"Quality Photos is a small studio. One lead photographer, a second shooter, and an editing desk that never hands over a frame it would not print. Work is booked a limited number of dates a year so every wedding gets full attention.",
        theme:"paper",linkLabel:"About the studio",linkHref:"#/about"},"clip"),
      S("featured_portfolio",{heading:"Selected work",heading_mr:"निवडक काम",sub_mr:"अलीकडील विवाह, पोर्ट्रेट आणि घाटावरील शूटमधील निवडक फ्रेम्स.",kicker:"01",sub:"Marked frames from recent weddings, portraits and ghat-side shoots.",limit:6},"stagger"),
      S("services",{heading:"What we photograph",heading_mr:"आम्ही काय टिपतो",sub_mr:"प्रत्येक सेवा CMS मध्ये ठरवली जाते; अप्रकाशित सेवा वेबसाइटवरून आपोआप हटतात.",kicker:"02",sub:"Every service is configured in the CMS; unpublished ones disappear from the site.",theme:"paper"},"fade-up"),
      S("statistics",{heading:"The studio, briefly",heading_mr:"स्टुडिओ, थोडक्यात",items:[{value:"12",label:"years behind the camera"},{value:"40",label:"weddings a year, capped"},{value:"72h",label:"to your preview gallery"},{value:"2",label:"photographers on every wedding"}],theme:"dark"},"fade-up"),
      S("films",{heading:"Films",heading_mr:"फिल्म्स",sub_mr:"काहीही आपोआप सुरू होत नाही. प्लेअर लोड करण्यासाठी फ्रेमवर टॅप करा.",kicker:"03",sub:"Nothing autoplays. Tap a frame to load the player.",limit:3},"fade-up"),
      S("featured_story",{heading:"From the journal",heading_mr:"जर्नलमधून",kicker:"04",theme:"paper"},"fade-up"),
      S("testimonials",{heading:"In their words",heading_mr:"त्यांच्या शब्दांत",kicker:"05",theme:"paper"},"stagger"),
      S("social_wall",{heading:"On Instagram",heading_mr:"इंस्टाग्रामवर",kicker:"06",handle:"@rajkumar_bhosale_photography",
        url:"https://www.instagram.com/rajkumar_bhosale_photography/",count:8},"stagger"),
      S("social_embeds",{heading:"Straight from our feeds",heading_mr:"थेट आमच्या फीडमधून",kicker:"07",
        sub:"Posts embedded from the studio's own social accounts.",sub_mr:"स्टुडिओच्या स्वतःच्या सोशल खात्यांवरून एम्बेड केलेल्या पोस्ट.",limit:3},"stagger"),
      S("cta",{heading:"Tell us the date. We'll tell you if it's free.",heading_mr:"तारीख सांगा. ती मोकळी आहे का ते आम्ही सांगतो.",body_mr:"सल्लामसलत मोफत आहे आणि बुक करण्याचे कोणतेही बंधन नाही.",ctaLabel_mr:"चौकशी सुरू करा",
        body:"Consultations are free and there is no obligation to book.",ctaLabel:"Start an enquiry",ctaHref:"#/contact"},"fade-up")
    ]};
  const about={id:"pg_about",slug:"about",title:"About",seoTitle:"About — Quality Photos",seoDesc:"About the studio behind Quality Photos.",
    ogImage:mk("About OG"),status:"published",sections:[
      S("image_text",{heading:"Rajkumar Bhosale",heading_mr:"राजकुमार भोसले",kicker:"The photographer",kicker_mr:"छायाचित्रकार",
        body:"Biography to be supplied by the studio owner. "+TODO+"\n\nThis block is editable from the CMS and can be reordered, disabled or duplicated like every other section.",
        media:mk("Photographer portrait"),ratio:"r34"},"fade-up"),
      S("text_intro",{heading:"How we work",heading_mr:"आम्ही कसे काम करतो",body_mr:"एक सल्लामसलत, आधीच ठरवलेली शॉट लिस्ट, आणि आड न येणारे शूट. ७२ तासांत प्रिव्ह्यू, चार आठवड्यांत संपूर्ण गॅलरी.",body:"A consultation, a shot list agreed in advance, and a shoot that stays out of the way. Previews within 72 hours, the full gallery in four weeks.",theme:"paper"},"clip"),
      S("gallery",{heading:"Frames we keep",heading_mr:"आम्ही जपलेल्या फ्रेम्स",kicker:"Selected",count:8},"stagger"),
      S("cta",{heading:"Come and see the albums in person.",heading_mr:"अल्बम प्रत्यक्ष पाहायला या.",ctaLabel_mr:"भेट ठरवा",body:"The studio is open by appointment.",ctaLabel:"Book a visit",ctaHref:"#/contact"},"fade-up")
    ]};
  const contact={id:"pg_contact",slug:"contact",title:"Contact",seoTitle:"Contact — Quality Photos",
    seoDesc:"Enquire about wedding and portrait photography.",ogImage:mk("Contact OG"),status:"published",sections:[
      S("contact",{heading:"Start an enquiry",heading_mr:"चौकशी सुरू करा",sub_mr:"तारीख आणि ठिकाण कळवा. आम्ही एका कामकाजाच्या दिवसात उत्तर देतो.",sub:"Tell us the date and the place. We reply within one working day.",theme:"paper"},"fade-up"),
      S("map",{heading:"The studio",heading_mr:"स्टुडिओ",address:TODO+" — set the studio address in Settings.",
        embed:"https://www.google.com/maps?q=Dahiwadi&output=embed"},"fade")
    ]};
  const simple=(id,slug,title,type,extra)=>({id,slug,title,seoTitle:title+" — Quality Photos",seoDesc:"",ogImage:mk(title),
    status:"published",sections:[S(type,Object.assign({heading:title},extra||{}),"fade-up")]});

  return {
    settings:{brand:"QUALITY PHOTOS",brand_mr:"क्वालिटी फोटोज",tagline:"Dahiwadi · MAHARASHTRA",tagline_mr:"दहिवडी · महाराष्ट्र",phone:"+91 9970753757",
      whatsapp:"919970753757",waMessage:"Hello Quality Photos, I'd like to ask about a shoot.",
      email:"hello@qualityphotos.in",address:TODO,footerText:"A small photography studio working across Maharashtra.",
      footerText_mr:"संपूर्ण महाराष्ट्रात काम करणारा एक छोटा छायाचित्रण स्टुडिओ.",
      seoTitle_mr:"क्वालिटी फोटोज — विवाह आणि पोर्ट्रेट छायाचित्रण",
      seoDesc_mr:"दहिवडी, महाराष्ट्रातील विवाह, प्री-वेडिंग आणि पोर्ट्रेट छायाचित्रण.",
      copyright:"© "+new Date().getFullYear()+" Quality Photos. All photographs remain the property of the studio.",
      seoTitle:"Quality Photos — Wedding & Portrait Photography",
      seoDesc:"Wedding, pre-wedding and portrait photography in Dahiwadi, Maharashtra.",
      analytics:"",instagramHandle:"@rajkumar_bhosale_photography",
      social:[
        {id:"so1",label:"Instagram",url:"https://www.instagram.com/rajkumar_bhosale_photography/",enabled:true,order:0},
        {id:"so2",label:"Facebook",url:"",enabled:false,order:1},
        {id:"so3",label:"YouTube",url:"",enabled:false,order:2},
        {id:"so4",label:"WhatsApp",url:"",enabled:true,order:3}
      ]},
    navigation:{header:[
      {id:"n1",label:"Home",label_mr:"मुख्यपृष्ठ",path:"#/",enabled:true},{id:"n2",label:"About",label_mr:"आमच्याविषयी",path:"#/about",enabled:true},
      {id:"n3",label:"Services",label_mr:"सेवा",path:"#/services",enabled:true},{id:"n4",label:"Portfolio",label_mr:"पोर्टफोलिओ",path:"#/portfolio",enabled:true},
      {id:"n5",label:"Stories",label_mr:"कथा",path:"#/stories",enabled:true},{id:"n6",label:"Films",label_mr:"फिल्म्स",path:"#/films",enabled:true},
      {id:"n7",label:"Contact",label_mr:"संपर्क",path:"#/contact",enabled:true}],
      footer:[{id:"f1",label:"Portfolio",label_mr:"पोर्टफोलिओ",path:"#/portfolio",enabled:true},{id:"f2",label:"Services",label_mr:"सेवा",path:"#/services",enabled:true},
      {id:"f3",label:"Stories",label_mr:"कथा",path:"#/stories",enabled:true},{id:"f4",label:"Contact",label_mr:"संपर्क",path:"#/contact",enabled:true}]},
    pages:[home,about,
      simple("pg_services","services","Services","services",{sub:"Published services appear here automatically.",theme:"dark"}),
      simple("pg_portfolio","portfolio","Portfolio","portfolio_grid",{sub:"Filter by category. Click any frame to open the viewer."}),
      simple("pg_stories","stories","Stories","featured_story",{sub:"Field notes, guides and craft.",all:true}),
      simple("pg_films","films","Films","films",{sub:"Wedding films, teasers and reels.",all:true})
      ,contact],
    categories:cats,projects,services,stories,films,testimonials,
    social_embeds:[
      {id:uid("em"),title:"Wedding highlights",title_mr:"विवाह हायलाइट्स",caption:"Demo embed — paste a real post URL in the CMS.",
       caption_mr:"डेमो एम्बेड — CMS मध्ये खरी पोस्ट URL टाका.",url:"https://www.instagram.com/rajkumar_bhosale_photography/",status:"published",order:0},
      {id:uid("em"),title:"Studio reel",title_mr:"स्टुडिओ रील",caption:"Demo embed.",caption_mr:"डेमो एम्बेड.",
       url:"https://www.youtube.com/watch?v=aqz-KE-bpKQ",status:"published",order:1},
      {id:uid("em"),title:"Ghat teaser",title_mr:"घाट टीझर",caption:"Demo embed.",caption_mr:"डेमो एम्बेड.",
       url:"https://vimeo.com/76979871",status:"published",order:2}
    ],
    media:[],enquiries:[],
    users:[{id:"u1",name:"Studio Owner",email:"admin@qualityphotos.in",role:"super_admin",hash:""},
           {id:"u2",name:"Studio Editor",email:"editor@qualityphotos.in",role:"editor",hash:""}],
    logs:[],
    _demo:true
  };
}

let DB=null;
function load(){
  try{
    const raw=localStorage.getItem(KEY);
    if(raw){ DB=JSON.parse(raw); if(DB && DB.pages){ migrate(); return DB; } }
  }catch(e){ console.warn("Storage unavailable, running in memory.",e); }
  DB=seed(); save(); return DB;
}
/* forward-compatible: fill in anything a newer build expects */
function migrate(){
  const fresh=seed();
  ["categories","projects","services","stories","films","testimonials","media","enquiries","users","logs","social_embeds","pages"]
    .forEach(k=>{ if(!Array.isArray(DB[k])) DB[k]=fresh[k]; });
  DB.settings=Object.assign({},fresh.settings,DB.settings||{});
  DB.navigation=Object.assign({},fresh.navigation,DB.navigation||{});
  save();
}
function save(){
  try{ localStorage.setItem(KEY, JSON.stringify(DB)); }
  catch(e){ toast("Could not save — browser storage is full or blocked."); }
}
function resetDB(){ try{localStorage.removeItem(KEY);}catch(e){} DB=seed(); save(); }
function logAct(action,entity,entityId){
  if(!DB.logs) DB.logs=[];
  DB.logs.unshift({id:uid("lg"),user:(SESSION&&SESSION.email)||"system",action,entity,entity_id:entityId||"—",
    at:new Date().toISOString(),ip:"127.0.0.1 (local)"});
  DB.logs=DB.logs.slice(0,300); save();
}

/* selectors */
const pageBy = s => (DB.pages||[]).find(p=>p.slug===s);
const pub = arr => (arr||[]).filter(x=>x.status==="published");
const catName = id => LZ(DB.categories.find(c=>c.id===id)||{}).name||"Uncategorised";
const projBySlug = s => DB.projects.find(p=>p.slug===s);
const svcBySlug  = s => DB.services.find(p=>p.slug===s);
const storyBySlug= s => DB.stories.find(p=>p.slug===s);

/* ---- safe embeds: whitelist + id extraction ---- */
const EMBED_HOSTS=["youtube.com","www.youtube.com","youtu.be","m.youtube.com","youtube-nocookie.com","www.youtube-nocookie.com",
  "player.vimeo.com","vimeo.com","www.vimeo.com","www.instagram.com","instagram.com",
  "www.facebook.com","facebook.com","fb.watch","www.pinterest.com","pinterest.com","in.pinterest.com","pin.it",
  "twitter.com","www.twitter.com","x.com","www.x.com",
  "www.google.com","google.com","maps.google.com"];
function hostOf(u){ try{ return new URL(u).hostname; }catch(e){ return ""; } }
function hostAllowed(u){ return EMBED_HOSTS.includes(hostOf(u)); }
function ytId(u){
  if(!hostAllowed(u)) return "";
  const m=String(u).match(/(?:youtu\.be\/|v=|\/shorts\/|\/embed\/)([A-Za-z0-9_-]{6,20})/);
  return m?m[1]:"";
}
function vimeoId(u){
  if(!hostAllowed(u)) return "";
  const m=String(u).match(/vimeo\.com\/(?:video\/)?(\d{6,12})/);
  return m?m[1]:"";
}
load();   /* hydrate the store before anything renders */

function embedSrc(film){
  if(film.source==="youtube"){ const id=ytId(film.url); return id?`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`:""; }
  if(film.source==="vimeo"){ const id=vimeoId(film.url); return id?`https://player.vimeo.com/video/${id}?autoplay=1`:""; }
  return "";
}

/* ---- social platform detection + embed builder ---- */
const PLAT_NAME={youtube:"YouTube",vimeo:"Vimeo",instagram:"Instagram",facebook:"Facebook",
  pinterest:"Pinterest",x:"X",link:"Link"};
function platformOf(u){
  const h=hostOf(u);
  if(/youtu/.test(h)) return "youtube";
  if(/vimeo/.test(h)) return "vimeo";
  if(/instagram/.test(h)) return "instagram";
  if(/facebook|fb\.watch/.test(h)) return "facebook";
  if(/pinterest|pin\.it/.test(h)) return "pinterest";
  if(/twitter|x\.com/.test(h)) return "x";
  return hostAllowed(u) ? "link" : "";
}
/* returns {p, src, video} — src is "" when the platform has no safe iframe */
function socialEmbed(u){
  const p=platformOf(u);
  if(!p || !hostAllowed(u)) return {p:"",src:"",video:false};
  if(p==="youtube"){ const id=ytId(u); return {p,src:id?"https://www.youtube-nocookie.com/embed/"+id+"?rel=0":"",video:true}; }
  if(p==="vimeo"){ const id=vimeoId(u); return {p,src:id?"https://player.vimeo.com/video/"+id:"",video:true}; }
  if(p==="instagram"){ const m=String(u).match(/instagram\.com\/(p|reel|tv)\/([A-Za-z0-9_-]+)/);
    return {p,src:m?"https://www.instagram.com/"+m[1]+"/"+m[2]+"/embed":"",video:false}; }
  if(p==="facebook") return {p,src:"https://www.facebook.com/plugins/post.php?href="+encodeURIComponent(u)+"&show_text=true&width=500",video:false};
  if(p==="pinterest"){ const m=String(u).match(/pin\/(\d+)/);
    return {p,src:m?"https://assets.pinterest.com/ext/embed.html?id="+m[1]:"",video:false}; }
  return {p,src:"",video:false};   /* X has no iframe embed — falls back to a link card */
}
