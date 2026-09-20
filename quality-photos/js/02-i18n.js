/* ============================================================
   I18N — English / मराठी
   UI strings live in STR. Content fields carry a "_mr" twin
   (title / title_mr) that the CMS edits side by side.
   ============================================================ */
let LANG="en";
try{ LANG=localStorage.getItem("qp.lang")||"en"; }catch(e){}

const STR={
  en:{
    book:"Book a consultation", menu:"MENU", call:"Call the studio", scroll:"SCROLL",
    allWork:"All work", allStories:"All stories", allFilms:"All films", viewService:"View service",
    projects:"PROJECTS", project:"PROJECT", filterAll:"All work", share:"SHARE", copyLink:"Copy link",
    keepReading:"Keep reading", moreWork:"More work", included:"What's included", faq:"Common questions",
    enquireAbout:"Enquire about", send:"Send enquiry", sending:"Sending…", reachUs:"Or reach us directly",
    whatsapp:"Chat on WhatsApp", viewIG:"View on Instagram", openTab:"Open in a new tab",
    noFile:"No file uploaded yet.", playerBlocked:"Player blocked?",
    name:"Name", phone:"Phone", email:"Email", eventType:"Event type", eventDate:"Event date",
    location:"Location", guests:"Approx. guests", prefer:"Preferred contact", message:"Message",
    e404:"Nothing on this frame.", e404sub:"The page you asked for doesn't exist, or it was unpublished.",
    home:"Back to the homepage", pages:"PAGES", studio:"STUDIO", elsewhere:"ELSEWHERE",
    sent:"Enquiry received.", sentSub:"We reply within one working day.",
    fixFields:"Some fields need fixing. The highlighted ones are listed above.",
    errName:"Enter your name.", errPhone:"Enter a reachable phone number.", errEmail:"Enter a valid email address.",
    errDate:"That date isn't valid.", errGuests:"Use digits only.", errLong:"Keep it under 1500 characters.",
    esc:"ESC TO CLOSE · ← → TO MOVE", next:"NEXT", frames:"FRAMES", selected:"Selected",
    copied:"Link copied.", nothingHere:"Nothing here yet.", notScraped:"Instagram is not scraped. Tiles are placeholders until the studio uploads or links approved posts in the CMS.",
    openOn:"Open on", loadPost:"Load post", langName:"मराठी"
  },
  mr:{
    book:"सल्लामसलत बुक करा", menu:"मेनू", call:"स्टुडिओला कॉल करा", scroll:"स्क्रोल",
    allWork:"सर्व काम", allStories:"सर्व कथा", allFilms:"सर्व फिल्म्स", viewService:"सेवा पहा",
    projects:"प्रकल्प", project:"प्रकल्प", filterAll:"सर्व काम", share:"शेअर करा", copyLink:"लिंक कॉपी करा",
    keepReading:"पुढे वाचा", moreWork:"आणखी काम", included:"यात काय समाविष्ट आहे", faq:"नेहमीचे प्रश्न",
    enquireAbout:"चौकशी करा —", send:"चौकशी पाठवा", sending:"पाठवत आहे…", reachUs:"किंवा थेट संपर्क साधा",
    whatsapp:"व्हॉट्सॲपवर बोला", viewIG:"इंस्टाग्रामवर पहा", openTab:"नवीन टॅबमध्ये उघडा",
    noFile:"अद्याप फाइल अपलोड केलेली नाही.", playerBlocked:"प्लेअर ब्लॉक झाला?",
    name:"नाव", phone:"फोन", email:"ईमेल", eventType:"कार्यक्रमाचा प्रकार", eventDate:"कार्यक्रमाची तारीख",
    location:"ठिकाण", guests:"अंदाजे पाहुणे", prefer:"संपर्काचे माध्यम", message:"संदेश",
    e404:"या फ्रेमवर काहीच नाही.", e404sub:"तुम्ही मागितलेले पान अस्तित्वात नाही, किंवा ते अप्रकाशित केले गेले आहे.",
    home:"मुख्यपृष्ठावर परत जा", pages:"पाने", studio:"स्टुडिओ", elsewhere:"इतरत्र",
    sent:"चौकशी मिळाली.", sentSub:"आम्ही एका कामकाजाच्या दिवसात उत्तर देतो.",
    fixFields:"काही रकाने दुरुस्त करावे लागतील. वर दाखवलेले रकाने तपासा.",
    errName:"तुमचे नाव लिहा.", errPhone:"संपर्क होईल असा फोन क्रमांक लिहा.", errEmail:"वैध ईमेल पत्ता लिहा.",
    errDate:"ही तारीख वैध नाही.", errGuests:"फक्त अंक वापरा.", errLong:"१५०० अक्षरांच्या आत ठेवा.",
    esc:"बंद करण्यासाठी ESC · ← → हलवण्यासाठी", next:"पुढे", frames:"फ्रेम्स", selected:"निवडक",
    copied:"लिंक कॉपी झाली.", nothingHere:"इथे अजून काहीही नाही.", notScraped:"इंस्टाग्राम स्क्रॅप केले जात नाही. स्टुडिओ CMS मध्ये मंजूर पोस्ट अपलोड करेपर्यंत या जागा प्लेसहोल्डर आहेत.",
    openOn:"वर उघडा", loadPost:"पोस्ट लोड करा", langName:"English"
  }
};
const t = k => (STR[LANG]&&STR[LANG][k]) || STR.en[k] || k;

/* returns a copy of an object with Marathi twins swapped in */
function LZ(o){
  if(!o) return {};
  if(LANG!=="mr") return o;
  const c=Object.assign({},o);
  for(const k in o){ if(k.slice(-3)==="_mr" && o[k]){ c[k.slice(0,-3)]=o[k]; } }
  return c;
}
function setLang(l){
  LANG=(l==="mr")?"mr":"en";
  try{ localStorage.setItem("qp.lang",LANG); }catch(e){}
  document.documentElement.lang = LANG==="mr" ? "mr" : "en";
  document.documentElement.setAttribute("data-lang",LANG);
  renderChrome(); route();
}
