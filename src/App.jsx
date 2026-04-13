import { useState, useEffect } from "react";
import { subscribeBlocks, saveBlock, removeBlockDb, subscribeBookings, saveBooking } from "./database";

/* ───────── CONFIG ───────── */
const OWNER_EMAIL = "reddani03@gmail.com";
const OWNER_NAME = "RedDani";

const SERVICES_IT = [
  { id: "video-ai", label: "Video AI", icon: "🤖" },
  { id: "produzione-video", label: "Produzione Video", icon: "🎬" },
  { id: "collaborazioni-social", label: "Collaborazioni Social", icon: "📱" },
  { id: "altro", label: "Altro", icon: "💡" },
];
const SERVICES_EN = [
  { id: "video-ai", label: "Video AI", icon: "🤖" },
  { id: "produzione-video", label: "Video Production", icon: "🎬" },
  { id: "collaborazioni-social", label: "Social Collaborations", icon: "📱" },
  { id: "altro", label: "Other", icon: "💡" },
];

const T = {
  it: {
    title: "Book a Call", subtitle: "Prenota una call con RedDani",
    subtitleDesc: "Scegli il giorno e l'orario che preferisci",
    selectTime: "Scegli un orario", slotDuration: "Slot da 30 minuti",
    yourInfo: "I tuoi dati", name: "Nome completo", email: "Email",
    confirmEmail: "Conferma email", emailMismatch: "Le email non corrispondono",
    emailInvalid: "Inserisci un'email valida", company: "Nome azienda",
    service: "Tipo di servizio", description: "Descrivi brevemente di cosa hai bisogno",
    descPlaceholder: "Es: Ho bisogno di un video promozionale per il lancio del nostro nuovo prodotto...",
    bookCall: "Prenota Call", booking: "Prenotazione in corso...",
    booked: "Prenotazione Confermata!",
    bookedMsg: "Riceverai a breve una email di conferma con il link Google Meet.",
    bookedSee: "Ci vediamo il", bookedAt: "alle",
    bookAnother: "Prenota un'altra call",
    noSlots: "Nessuno slot disponibile per questo giorno",
    noSlotsCta: "Non trovi uno slot adatto alle tue esigenze?",
    noSlotsEmail: "Scrivimi una mail", today: "Oggi",
    admin: "Admin", public: "Prenota",
    unavailability: "Indisponibilità",
    unavailabilityDesc: "Segna quando NON sei disponibile. Gli slot liberi si generano automaticamente (Lun-Ven 9:00-18:00).",
    addBlock: "+ Aggiungi blocco", allDay: "Tutto il giorno",
    from: "Dalle", to: "Alle", remove: "Rimuovi",
    bookings: "Prenotazioni", noBookings: "Nessuna prenotazione",
    baseHours: "Lun-Ven 9:00-18:00",
    days: ["Dom","Lun","Mar","Mer","Gio","Ven","Sab"],
    months: ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"],
    back: "← Indietro", available: "Disponibile",
    reminders: "Promemoria: 24h e 1h prima della call",
    cancelNote: "Se non puoi più, puoi disdire direttamente dall'invito Google Calendar.",
    services: SERVICES_IT,
  },
  en: {
    title: "Book a Call", subtitle: "Book a call with RedDani",
    subtitleDesc: "Pick your preferred day and time",
    selectTime: "Pick a time", slotDuration: "30-minute slots",
    yourInfo: "Your details", name: "Full name", email: "Email",
    confirmEmail: "Confirm email", emailMismatch: "Emails don't match",
    emailInvalid: "Enter a valid email", company: "Company name",
    service: "Type of service", description: "Briefly describe what you need",
    descPlaceholder: "E.g: I need a promotional video for our new product launch...",
    bookCall: "Book Call", booking: "Booking...",
    booked: "Booking Confirmed!",
    bookedMsg: "You'll receive a confirmation email with the Google Meet link shortly.",
    bookedSee: "See you on", bookedAt: "at",
    bookAnother: "Book another call",
    noSlots: "No slots available for this day",
    noSlotsCta: "Can't find a slot that works for you?",
    noSlotsEmail: "Send me an email", today: "Today",
    admin: "Admin", public: "Book",
    unavailability: "Unavailability",
    unavailabilityDesc: "Mark when you're NOT available. Free slots are auto-generated (Mon-Fri 9:00-18:00).",
    addBlock: "+ Add block", allDay: "All day",
    from: "From", to: "To", remove: "Remove",
    bookings: "Bookings", noBookings: "No bookings yet",
    baseHours: "Mon-Fri 9:00-18:00",
    days: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
    months: ["January","February","March","April","May","June","July","August","September","October","November","December"],
    back: "← Back", available: "Available",
    reminders: "Reminders: 24h and 1h before the call",
    cancelNote: "If you can't make it, you can cancel directly from the Google Calendar invite.",
    services: SERVICES_EN,
  },
};

/* ───────── HELPERS ───────── */
const toLocalDateStr = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const isToday = (d) => { const t=new Date(); return d.getDate()===t.getDate()&&d.getMonth()===t.getMonth()&&d.getFullYear()===t.getFullYear(); };
const HOLIDAYS=["01-01","01-06","04-25","05-01","06-02","08-15","11-01","12-08","12-25","12-26"];
const getEaster=(y)=>{const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),n=Math.floor((h+l-7*m+114)/31),p=(h+l-7*m+114)%31+1;return`${String(n).padStart(2,"0")}-${String(p).padStart(2,"0")}`;}
const isHoliday=(d)=>{const md=`${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;if(HOLIDAYS.includes(md))return true;const e=getEaster(d.getFullYear());const em=parseInt(e.split("-")[0]),ed=parseInt(e.split("-")[1]);const easter=new Date(d.getFullYear(),em-1,ed);const easterMon=new Date(easter);easterMon.setDate(easter.getDate()+1);const emd=`${String(easterMon.getMonth()+1).padStart(2,"0")}-${String(easterMon.getDate()).padStart(2,"0")}`;return md===e||md===emd;};
const isPast = (d) => { const t=new Date(); t.setHours(23,59,59,999); const c=new Date(d); c.setHours(23,59,59,999); return c<=t; };
const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

const generateSlots = (date, blocks) => {
  const day = date.getDay();
  if (day===0||day===6) return [];
  const dateStr = toLocalDateStr(date);
  const dayBlocks = (blocks||[]).filter(b=>b.date===dateStr);
  if (dayBlocks.some(b=>b.allDay)) return [];
  const slots = [];
  for (let h=9;h<18;h++) {
    for (let m=0;m<60;m+=30) {
      const sMin=h*60+m, eMin=sMin+30;
      const blocked = dayBlocks.some(b=>{
        if(b.allDay) return true;
        const bS=parseInt(b.from.split(":")[0])*60+parseInt(b.from.split(":")[1]);
        const bE=parseInt(b.to.split(":")[0])*60+parseInt(b.to.split(":")[1]);
        return sMin<bE&&eMin>bS;
      });
      if(!blocked) slots.push({start:`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`,end:`${String(Math.floor(eMin/60)).padStart(2,"0")}:${String(eMin%60).padStart(2,"0")}`});
    }
  }
  return slots;
};

/* ───────── COMPONENT ───────── */
export default function App() {
  const [lang,setLang] = useState("it");
  const [view,setView] = useState("public");
  const [selectedDate,setSelectedDate] = useState(null);
  const [selectedSlot,setSelectedSlot] = useState(null);
  const [step,setStep] = useState(0);
  const [formData,setFormData] = useState({name:"",email:"",confirmEmail:"",company:"",service:"",description:""});
  const [errors,setErrors] = useState({});
  const [bookingState,setBookingState] = useState("idle");
  const [confirmedBooking,setConfirmedBooking] = useState(null);
  const [blocks,setBlocks] = useState([]);
  const [bookings,setBookings] = useState([]);
  const [expandedBooking,setExpandedBooking] = useState(null);
  const [currentMonth,setCurrentMonth] = useState(new Date());
  const [notification,setNotification] = useState(null);
  const [adminTab,setAdminTab] = useState("unavailability");
  const t = T[lang];

  /* Firebase real-time sync */
  useEffect(() => {
    const unsubBlocks = subscribeBlocks(setBlocks);
    const unsubBookings = subscribeBookings(setBookings);
    return () => { unsubBlocks(); unsubBookings(); };
  }, []);

  const addBlock = async () => {
    const d=new Date(); d.setDate(d.getDate()+1);
    const block = {id:Date.now(),date:toLocalDateStr(d),allDay:false,from:"09:00",to:"12:00"};
    await saveBlock(block);
  };
  const updateBlockField = async (id,f,v) => {
    const block = blocks.find(b=>b.id===id);
    if(block) await saveBlock({...block,[f]:v});
  };
  const removeBlock = async (id) => { await removeBlockDb(String(id)); };

  const handleBook = async () => {
    const errs={};
    if(!formData.name.trim()) errs.name=true;
    if(!formData.email.trim()) errs.email="required"; else if(!isValidEmail(formData.email)) errs.email="invalid";
    if(!formData.confirmEmail.trim()) errs.confirmEmail="required"; else if(formData.email!==formData.confirmEmail) errs.confirmEmail="mismatch";
    if(!formData.company.trim()) errs.company=true;
    if(!formData.service) errs.service=true;
    if(!formData.description.trim()) errs.description=true;
    setErrors(errs);
    if(Object.keys(errs).length>0) return;

    setBookingState("booking");
    const newBooking = {id:Date.now(),date:toLocalDateStr(selectedDate),slot:selectedSlot,...formData,createdAt:new Date().toISOString()};
    try{await Promise.race([saveBooking(newBooking),new Promise((_,r)=>setTimeout(()=>r("timeout"),8000))]);}catch(err){console.error("Save error:",err);}
    setConfirmedBooking(newBooking);
    setBookingState("done");
    setNotification({data:newBooking});
    setTimeout(()=>setNotification(null),5000);
  };

  const resetBooking = () => {
    setStep(0);setSelectedDate(null);setSelectedSlot(null);
    setFormData({name:"",email:"",confirmEmail:"",company:"",service:"",description:""});
    setErrors({});setBookingState("idle");setConfirmedBooking(null);
  };

  const renderCalendar = () => {
    const year=currentMonth.getFullYear(),month=currentMonth.getMonth();
    const firstDay=new Date(year,month,1).getDay(),daysInMonth=new Date(year,month+1,0).getDate();
    const cells=[];
    for(let i=0;i<firstDay;i++) cells.push(<div key={`e${i}`}/>);
    for(let d=1;d<=daysInMonth;d++){
      const date=new Date(year,month,d),past=isPast(date),wknd=date.getDay()===0||date.getDay()===6;
      const isSel=selectedDate&&date.toDateString()===selectedDate.toDateString(),isTod=isToday(date);
      const ds=toLocalDateStr(date),hasBlockAll=blocks.some(b=>b.date===ds&&b.allDay),disabled=past||wknd||hasBlockAll;
      const slots=!disabled?generateSlots(date,blocks):[],bkd=bookings.filter(b=>b.date===ds);
      const avail=slots.filter(s=>!bkd.some(bs=>bs.slot.start===s.start)),full=!disabled&&avail.length===0,hasA=!disabled&&!full&&avail.length>0;
      cells.push(
        <button key={d} disabled={disabled||full} onClick={()=>{setSelectedDate(date);setSelectedSlot(null);if(view==="public")setStep(1);}}
          style={{width:"100%",aspectRatio:"1",border:"none",borderRadius:"12px",background:isSel?"linear-gradient(135deg,#8B0000,#CC0000)":isTod?"rgba(204,0,0,0.15)":"rgba(255,255,255,0.04)",color:disabled||full?"rgba(255,255,255,0.2)":"#fff",cursor:disabled||full?"default":"pointer",fontSize:"14px",fontWeight:isTod||isSel?"700":"400",fontFamily:"'Outfit',sans-serif",transition:"all 0.2s ease",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"2px"}}>
          {d}
          {hasA&&!isSel&&<div style={{width:6,height:6,borderRadius:"50%",background:"#22c55e",boxShadow:"0 0 6px rgba(34,197,94,0.5)"}}/>}
          {bkd.length>0&&!disabled&&!hasA&&<div style={{width:4,height:4,borderRadius:"50%",background:"#CC0000"}}/>}
        </button>
      );
    }
    return cells;
  };

  const availableSlots = selectedDate?generateSlots(selectedDate,blocks).filter(s=>!bookings.some(b=>b.date===toLocalDateStr(selectedDate)&&b.slot.start===s.start)):[];
  const formatConfirmDate = () => { if(!confirmedBooking)return""; const p=confirmedBooking.date.split("-"); const d=new Date(p[0],p[1]-1,p[2]); return `${d.getDate()} ${t.months[d.getMonth()]} ${d.getFullYear()}`; };

  const S = {
    card:{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"20px",padding:"24px",marginBottom:"16px",backdropFilter:"blur(20px)"},
    label:{fontSize:"12px",fontWeight:"600",color:"rgba(255,255,255,0.5)",display:"block",marginBottom:"6px",textTransform:"uppercase",letterSpacing:"0.5px"},
    input:(err)=>({width:"100%",padding:"12px 16px",background:"rgba(255,255,255,0.05)",border:err?"1px solid rgba(204,0,0,0.5)":"1px solid rgba(255,255,255,0.08)",borderRadius:"12px",color:"#fff",fontSize:"14px",fontFamily:"'Outfit',sans-serif",outline:"none",boxSizing:"border-box",transition:"border-color 0.2s ease"}),
    lb:(a)=>({padding:"6px 14px",border:"none",background:a?"rgba(139,0,0,0.5)":"transparent",color:a?"#fff":"rgba(255,255,255,0.4)",fontSize:"12px",fontWeight:"600",cursor:"pointer",fontFamily:"'Outfit',sans-serif",letterSpacing:"0.5px",transition:"all 0.2s ease"}),
    vb:(a)=>({padding:"6px 16px",border:"none",background:a?"rgba(139,0,0,0.5)":"transparent",color:a?"#fff":"rgba(255,255,255,0.4)",fontSize:"12px",fontWeight:"600",cursor:"pointer",fontFamily:"'Outfit',sans-serif",transition:"all 0.2s ease"}),
    sw:{display:"flex",background:"rgba(255,255,255,0.06)",borderRadius:"10px",overflow:"hidden",border:"1px solid rgba(255,255,255,0.08)"},
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
      <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0a0a0a 0%,#1a0a0a 30%,#0d0d0d 70%,#0a0a0a 100%)",fontFamily:"'Outfit',sans-serif",color:"#fff",position:"relative",overflow:"hidden"}}>
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,pointerEvents:"none",zIndex:0}}/>
        <div style={{position:"fixed",width:"500px",height:"500px",borderRadius:"50%",background:"radial-gradient(circle,rgba(139,0,0,0.12) 0%,transparent 70%)",top:"-150px",right:"-150px",pointerEvents:"none",zIndex:0}}/>
        <div style={{position:"fixed",width:"400px",height:"400px",borderRadius:"50%",background:"radial-gradient(circle,rgba(139,0,0,0.06) 0%,transparent 70%)",bottom:"-100px",left:"-100px",pointerEvents:"none",zIndex:0}}/>

        {notification&&<div style={{position:"fixed",top:"20px",right:"20px",zIndex:1000,background:"linear-gradient(135deg,#8B0000,#660000)",border:"1px solid rgba(204,0,0,0.3)",borderRadius:"16px",padding:"16px 20px",maxWidth:"320px",boxShadow:"0 20px 60px rgba(139,0,0,0.3)",animation:"slideIn 0.3s ease"}}>
          <div style={{fontSize:"13px",fontWeight:"600"}}>{lang==="it"?"Nuova prenotazione!":"New booking!"}</div>
          <div style={{fontSize:"12px",opacity:0.8,marginTop:"4px"}}>{notification.data.name} — {notification.data.slot.start}</div>
        </div>}

        <div style={{maxWidth:"520px",margin:"0 auto",padding:"20px 16px 40px",position:"relative",zIndex:1}}>
          {/* HEADER */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"32px",paddingTop:"12px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
              <div style={{width:"40px",height:"40px",borderRadius:"12px",background:"linear-gradient(135deg,#8B0000,#CC0000)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px",fontWeight:"800",boxShadow:"0 4px 20px rgba(139,0,0,0.4)"}}>R</div>
              <div>
                <div style={{fontSize:"18px",fontWeight:"700",letterSpacing:"-0.3px"}}>{t.title}</div>
                <div style={{fontSize:"11px",color:"rgba(255,255,255,0.35)",fontWeight:"500",letterSpacing:"1px",textTransform:"uppercase"}}>{OWNER_NAME}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
              <div style={S.sw}><button style={S.lb(lang==="it")} onClick={()=>setLang("it")}>IT</button><button style={S.lb(lang==="en")} onClick={()=>setLang("en")}>EN</button></div>
    
            </div>
          </div>

          {view==="public"?(<>
            {bookingState==="done"&&confirmedBooking?(
              <div style={{...S.card,textAlign:"center",padding:"48px 24px"}}>
                <div style={{width:"80px",height:"80px",borderRadius:"50%",background:"linear-gradient(135deg,#16a34a,#22c55e)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px",boxShadow:"0 12px 40px rgba(34,197,94,0.3)",animation:"popIn 0.4s ease"}}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div style={{fontSize:"24px",fontWeight:"700",marginBottom:"8px"}}>{t.booked}</div>
                <div style={{fontSize:"15px",color:"rgba(255,255,255,0.6)",marginBottom:"24px",lineHeight:"1.7"}}>
                  {t.bookedSee} <strong style={{color:"#fff"}}>{formatConfirmDate()}</strong> {t.bookedAt} <strong style={{color:"#fff"}}>{confirmedBooking.slot.start} - {confirmedBooking.slot.end}</strong>
                </div>
                <div style={{fontSize:"13px",color:"rgba(255,255,255,0.4)",marginBottom:"10px"}}>{t.bookedMsg}</div>
                <div style={{fontSize:"12px",color:"rgba(255,255,255,0.3)",marginBottom:"6px"}}>⏰ {t.reminders}</div>
                <div style={{padding:"14px 18px",background:"rgba(204,0,0,0.08)",border:"1px solid rgba(204,0,0,0.2)",borderRadius:"12px",marginBottom:"32px",display:"flex",alignItems:"flex-start",gap:"10px",textAlign:"left"}}>
                  <span style={{fontSize:"18px",flexShrink:0}}>⚠️</span>
                  <div style={{fontSize:"13px",color:"rgba(255,255,255,0.7)",lineHeight:"1.5",fontWeight:"500"}}>{t.cancelNote}</div>
                </div>
                <button onClick={resetBooking} style={{padding:"14px 32px",border:"1px solid rgba(255,255,255,0.15)",borderRadius:"14px",background:"rgba(255,255,255,0.05)",color:"#fff",fontSize:"14px",fontWeight:"600",cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>{t.bookAnother}</button>
              </div>
            ):(<>
              {step>0&&<button onClick={()=>{setStep(step-1);if(step===1)setSelectedSlot(null);}} style={{background:"none",border:"none",color:"rgba(255,255,255,0.5)",fontSize:"14px",cursor:"pointer",marginBottom:"16px",padding:"4px 0",fontFamily:"'Outfit',sans-serif",fontWeight:"500"}}>{t.back}</button>}

              {step===0&&(
                <div style={S.card}>
                  <div style={{marginBottom:"20px"}}>
                    <h2 style={{fontSize:"20px",fontWeight:"700",margin:0}}>{t.subtitle}</h2>
                    <p style={{fontSize:"13px",color:"rgba(255,255,255,0.4)",margin:"6px 0 0"}}>{t.subtitleDesc}</p>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
                    <button onClick={()=>setCurrentMonth(new Date(currentMonth.getFullYear(),currentMonth.getMonth()-1))} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"10px",color:"#fff",width:"36px",height:"36px",cursor:"pointer",fontSize:"16px",display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
                    <span style={{fontSize:"15px",fontWeight:"600"}}>{t.months[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
                    <button onClick={()=>setCurrentMonth(new Date(currentMonth.getFullYear(),currentMonth.getMonth()+1))} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"10px",color:"#fff",width:"36px",height:"36px",cursor:"pointer",fontSize:"16px",display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:"4px",marginBottom:"4px"}}>
                    {t.days.map(d=><div key={d} style={{textAlign:"center",fontSize:"11px",fontWeight:"600",color:"rgba(255,255,255,0.3)",padding:"8px 0",textTransform:"uppercase",letterSpacing:"0.5px"}}>{d}</div>)}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:"4px"}}>{renderCalendar()}</div>
                  <div style={{display:"flex",gap:"16px",marginTop:"16px",paddingTop:"16px",borderTop:"1px solid rgba(255,255,255,0.06)",flexWrap:"wrap"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"11px",color:"rgba(255,255,255,0.35)"}}><div style={{width:8,height:8,borderRadius:"50%",background:"#22c55e",boxShadow:"0 0 4px rgba(34,197,94,0.4)"}}/>{t.available}</div>
                    <div style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"11px",color:"rgba(255,255,255,0.35)"}}><div style={{width:8,height:8,borderRadius:"50%",background:"#CC0000"}}/>{t.bookings}</div>
                    <div style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"11px",color:"rgba(255,255,255,0.35)"}}><div style={{width:8,height:8,borderRadius:"50%",background:"rgba(204,0,0,0.4)"}}/>{t.today}</div>
                  </div>
                  <div style={{marginTop:"20px",padding:"16px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"14px",textAlign:"center"}}>
                    <div style={{fontSize:"13px",color:"rgba(255,255,255,0.5)",marginBottom:"12px"}}>{t.noSlotsCta}</div>
                    <a href={`mailto:${OWNER_EMAIL}`} style={{display:"inline-block",padding:"10px 24px",background:"linear-gradient(135deg,#8B0000,#CC0000)",borderRadius:"12px",fontSize:"14px",fontWeight:"600",color:"#fff",textDecoration:"none",boxShadow:"0 4px 16px rgba(139,0,0,0.3)"}}>{t.noSlotsEmail}</a>
                  </div>
                </div>
              )}

              {step===1&&selectedDate&&(
                <div style={S.card}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"4px"}}>
                    <h3 style={{fontSize:"16px",fontWeight:"600",margin:0}}>{t.selectTime}</h3>
                    <div style={{fontSize:"11px",color:"rgba(255,255,255,0.35)",background:"rgba(255,255,255,0.06)",padding:"4px 10px",borderRadius:"8px",fontWeight:"600"}}>⏱ {t.slotDuration}</div>
                  </div>
                  <p style={{fontSize:"13px",color:"rgba(255,255,255,0.4)",margin:"0 0 20px"}}>{selectedDate.getDate()} {t.months[selectedDate.getMonth()]} {selectedDate.getFullYear()}</p>
                  {availableSlots.length===0?(
                    <div style={{textAlign:"center",padding:"24px 0"}}>
                      <p style={{color:"rgba(255,255,255,0.4)",fontSize:"14px",marginBottom:"16px"}}>{t.noSlots}</p>
                      <a href={`mailto:${OWNER_EMAIL}`} style={{display:"inline-block",padding:"10px 24px",background:"linear-gradient(135deg,#8B0000,#CC0000)",borderRadius:"12px",fontSize:"13px",fontWeight:"600",color:"#fff",textDecoration:"none",boxShadow:"0 4px 16px rgba(139,0,0,0.3)"}}>{t.noSlotsEmail}</a>
                    </div>
                  ):(
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"8px"}}>
                      {availableSlots.map(slot=>(
                        <button key={slot.start} onClick={()=>{setSelectedSlot(slot);setStep(2);}}
                          style={{padding:"14px 8px",border:selectedSlot?.start===slot.start?"1px solid rgba(204,0,0,0.5)":"1px solid rgba(255,255,255,0.08)",borderRadius:"12px",background:selectedSlot?.start===slot.start?"rgba(139,0,0,0.3)":"rgba(255,255,255,0.04)",color:"#fff",fontSize:"13px",fontWeight:"500",cursor:"pointer",fontFamily:"'Outfit',sans-serif",transition:"all 0.2s ease"}}>
                          {slot.start}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {step===2&&selectedSlot&&(
                <div style={S.card}>
                  <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px",padding:"12px 16px",background:"rgba(139,0,0,0.15)",borderRadius:"12px",border:"1px solid rgba(139,0,0,0.2)"}}>
                    <span style={{fontSize:"20px"}}>📅</span>
                    <div>
                      <div style={{fontSize:"14px",fontWeight:"600"}}>{selectedDate.getDate()} {t.months[selectedDate.getMonth()]}</div>
                      <div style={{fontSize:"12px",color:"rgba(255,255,255,0.5)"}}>{selectedSlot.start} - {selectedSlot.end} · {t.slotDuration}</div>
                    </div>
                  </div>
                  <h3 style={{fontSize:"16px",fontWeight:"600",margin:"0 0 16px"}}>{t.yourInfo}</h3>
                  <div style={{marginBottom:"12px"}}><label style={S.label}>{t.name} *</label><input value={formData.name} onChange={e=>{setFormData({...formData,name:e.target.value});setErrors({...errors,name:false});}} style={S.input(errors.name)}/></div>
                  <div style={{marginBottom:"12px"}}><label style={S.label}>{t.email} *</label><input type="email" value={formData.email} placeholder="email@azienda.com" onChange={e=>{setFormData({...formData,email:e.target.value});setErrors({...errors,email:false});}} style={S.input(errors.email)}/>{errors.email==="invalid"&&<div style={{fontSize:"11px",color:"#CC0000",marginTop:"4px"}}>{t.emailInvalid}</div>}</div>
                  <div style={{marginBottom:"12px"}}><label style={S.label}>{t.confirmEmail} *</label><input type="email" value={formData.confirmEmail} placeholder={lang==="it"?"Reinserisci la tua email":"Re-enter your email"} onChange={e=>{setFormData({...formData,confirmEmail:e.target.value});setErrors({...errors,confirmEmail:false});}} onPaste={e=>e.preventDefault()} style={{...S.input(errors.confirmEmail),...(formData.confirmEmail&&formData.email===formData.confirmEmail&&!errors.confirmEmail?{border:"1px solid rgba(34,197,94,0.4)"}:{})}}/>{errors.confirmEmail==="mismatch"&&<div style={{fontSize:"11px",color:"#CC0000",marginTop:"4px"}}>{t.emailMismatch}</div>}{formData.confirmEmail&&formData.email===formData.confirmEmail&&!errors.confirmEmail&&<div style={{fontSize:"11px",color:"#22c55e",marginTop:"4px"}}>✓</div>}</div>
                  <div style={{marginBottom:"12px"}}><label style={S.label}>{t.company} *</label><input value={formData.company} onChange={e=>{setFormData({...formData,company:e.target.value});setErrors({...errors,company:false});}} style={S.input(errors.company)}/></div>
                  <div style={{marginBottom:"12px"}}>
                    <label style={S.label}>{t.service} *</label>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
                      {t.services.map(s=>(
                        <button key={s.id} onClick={()=>{setFormData({...formData,service:s.id});setErrors({...errors,service:false});}}
                          style={{padding:"12px",border:formData.service===s.id?"1px solid rgba(204,0,0,0.5)":errors.service?"1px solid rgba(204,0,0,0.3)":"1px solid rgba(255,255,255,0.08)",borderRadius:"12px",background:formData.service===s.id?"rgba(139,0,0,0.25)":"rgba(255,255,255,0.04)",color:"#fff",fontSize:"13px",fontWeight:"500",cursor:"pointer",fontFamily:"'Outfit',sans-serif",display:"flex",alignItems:"center",gap:"8px",transition:"all 0.2s ease"}}>
                          <span style={{fontSize:"16px"}}>{s.icon}</span>{s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{marginBottom:"20px"}}><label style={S.label}>{t.description} *</label><textarea value={formData.description} onChange={e=>{setFormData({...formData,description:e.target.value});setErrors({...errors,description:false});}} placeholder={t.descPlaceholder} rows={3} style={{...S.input(errors.description),resize:"vertical",minHeight:"80px"}}/></div>
                  <button onClick={handleBook} disabled={bookingState==="booking"} style={{width:"100%",padding:"16px",background:bookingState==="booking"?"rgba(139,0,0,0.3)":"linear-gradient(135deg,#8B0000,#CC0000)",border:"none",borderRadius:"14px",color:"#fff",fontSize:"15px",fontWeight:"700",cursor:bookingState==="booking"?"wait":"pointer",fontFamily:"'Outfit',sans-serif",boxShadow:bookingState==="booking"?"none":"0 8px 30px rgba(139,0,0,0.4)",transition:"all 0.3s ease"}}>{bookingState==="booking"?t.booking:t.bookCall}</button>
                </div>
              )}
            </>)}
          </>):(<>
            {/* ADMIN */}
            <div style={{display:"flex",gap:"8px",marginBottom:"20px"}}>
              {["unavailability","bookings"].map(tab=>(
                <button key={tab} onClick={()=>setAdminTab(tab)} style={{padding:"10px 20px",background:adminTab===tab?"rgba(139,0,0,0.3)":"rgba(255,255,255,0.04)",border:adminTab===tab?"1px solid rgba(204,0,0,0.3)":"1px solid rgba(255,255,255,0.08)",borderRadius:"12px",color:"#fff",fontSize:"13px",fontWeight:"600",cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>
                  {tab==="unavailability"?t.unavailability:t.bookings}
                  {tab==="bookings"&&bookings.length>0&&<span style={{marginLeft:"8px",background:"#CC0000",borderRadius:"8px",padding:"2px 7px",fontSize:"11px",fontWeight:"700"}}>{bookings.length}</span>}
                </button>
              ))}
            </div>
            {adminTab==="unavailability"?(
              <div style={S.card}>
                <p style={{fontSize:"13px",color:"rgba(255,255,255,0.4)",margin:"0 0 4px"}}>{t.unavailabilityDesc}</p>
                <div style={{display:"flex",gap:"12px",fontSize:"11px",color:"rgba(255,255,255,0.3)",marginBottom:"20px"}}><span>📅 {t.baseHours}</span><span>⏱ {t.slotDuration}</span></div>
                {blocks.map(block=>(
                  <div key={block.id} style={{padding:"16px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"14px",marginBottom:"10px"}}>
                    <div style={{display:"flex",gap:"8px",alignItems:"center",flexWrap:"wrap"}}>
                      <input type="date" value={block.date} onChange={e=>updateBlockField(block.id,"date",e.target.value)} style={{padding:"8px 12px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"13px",fontFamily:"'Outfit',sans-serif",colorScheme:"dark"}}/>
                      <label style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"12px",color:"rgba(255,255,255,0.6)",cursor:"pointer"}}><input type="checkbox" checked={block.allDay} onChange={e=>updateBlockField(block.id,"allDay",e.target.checked)} style={{accentColor:"#CC0000"}}/>{t.allDay}</label>
                      {!block.allDay&&(<>
                        <span style={{fontSize:"11px",color:"rgba(255,255,255,0.4)"}}>{t.from}</span>
                        <input type="time" value={block.from} onChange={e=>updateBlockField(block.id,"from",e.target.value)} style={{padding:"8px 10px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"13px",fontFamily:"'Outfit',sans-serif",colorScheme:"dark"}}/>
                        <span style={{fontSize:"11px",color:"rgba(255,255,255,0.4)"}}>{t.to}</span>
                        <input type="time" value={block.to} onChange={e=>updateBlockField(block.id,"to",e.target.value)} style={{padding:"8px 10px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff",fontSize:"13px",fontFamily:"'Outfit',sans-serif",colorScheme:"dark"}}/>
                      </>)}
                      <button onClick={()=>removeBlock(block.id)} style={{padding:"8px 12px",background:"rgba(204,0,0,0.15)",border:"1px solid rgba(204,0,0,0.2)",borderRadius:"8px",color:"#CC0000",fontSize:"12px",fontWeight:"600",cursor:"pointer",fontFamily:"'Outfit',sans-serif",marginLeft:"auto"}}>{t.remove}</button>
                    </div>
                  </div>
                ))}
                <button onClick={addBlock} style={{width:"100%",padding:"14px",background:"rgba(255,255,255,0.04)",border:"1px dashed rgba(255,255,255,0.12)",borderRadius:"14px",color:"rgba(255,255,255,0.5)",fontSize:"13px",fontWeight:"600",cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>{t.addBlock}</button>
              </div>
            ):(
              <div style={S.card}>
                {bookings.length===0?(<p style={{color:"rgba(255,255,255,0.4)",fontSize:"14px",textAlign:"center",padding:"24px 0"}}>{t.noBookings}</p>):(
                  [...bookings].reverse().map(booking=>{
                    const svc=t.services.find(s=>s.id===booking.service)?.label||booking.service;
                    const exp=expandedBooking===booking.id;
                    return(
                      <div key={booking.id} onClick={()=>setExpandedBooking(exp?null:booking.id)} style={{padding:"16px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"14px",marginBottom:"10px",cursor:"pointer"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <div><div style={{fontSize:"14px",fontWeight:"600"}}>{booking.name}</div><div style={{fontSize:"12px",color:"rgba(255,255,255,0.4)",marginTop:"2px"}}>{booking.company} · {svc}</div></div>
                          <div style={{textAlign:"right"}}><div style={{fontSize:"13px",fontWeight:"600"}}>{booking.slot.start}</div><div style={{fontSize:"11px",color:"rgba(255,255,255,0.4)"}}>{booking.date}</div></div>
                        </div>
                        {exp&&(
                          <div style={{marginTop:"12px",paddingTop:"12px",borderTop:"1px solid rgba(255,255,255,0.06)",fontSize:"13px",color:"rgba(255,255,255,0.6)",lineHeight:"1.8"}}>
                            <div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"8px"}}><span style={{opacity:0.5}}>✉</span><a href={`mailto:${booking.email}`} style={{color:"#CC0000",textDecoration:"none"}}>{booking.email}</a></div>
                            <strong>{t.description}:</strong><br/>{booking.description}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </>)}
        </div>
        <style>{`
          @keyframes slideIn{from{transform:translateX(100px);opacity:0}to{transform:translateX(0);opacity:1}}
          @keyframes popIn{0%{transform:scale(0);opacity:0}50%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
          input::placeholder,textarea::placeholder{color:rgba(255,255,255,0.2)}
          button:hover:not(:disabled){filter:brightness(1.1)}
          ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(139,0,0,0.3);border-radius:4px}
        `}</style>
      </div>
    </>
  );
}
