import React, { useState } from 'react';

// The data extracted directly from the HTML script[cite: 2]
const categories = [
  { id:"needs", label:"🏠 الاحتياجات", name:"الاحتياجات الأساسية", active:"background:#E6F1FB;color:#0C447C;border-color:#B5D4F4;font-weight:600", icons:[{e:"💧",l:"مية",en:"Water",m:1},{e:"🍽️",l:"أكل",en:"Food",m:1},{e:"🚽",l:"حمام",en:"Bathroom",m:1},{e:"🛏️",l:"نوم",en:"Sleep",m:1},{e:"💊",l:"دواء",en:"Medicine",m:1},{e:"🆘",l:"مساعدة",en:"Help",m:1},{e:"🪑",l:"كرسي",en:"Chair",m:1},{e:"🏠",l:"بيت",en:"Home",m:1},{e:"🏫",l:"مدرسة",en:"School",m:1},{e:"🏥",l:"مستشفى",en:"Hospital",m:1}]},
  { id:"emotions", label:"😊 المشاعر", name:"المشاعر والأحوال", active:"background:#FAEEDA;color:#633806;border-color:#EF9F27;font-weight:600", icons:[{e:"😊",l:"سعيد",en:"Happy",m:1},{e:"😢",l:"حزين",en:"Sad",m:1},{e:"😡",l:"زعلان",en:"Upset",m:1},{e:"😰",l:"خايف",en:"Scared",m:1},{e:"😬",l:"متوتر",en:"Nervous",m:1},{e:"🥱",l:"تعبان",en:"Tired",m:1},{e:"🍽️",l:"جعان",en:"Hungry",m:1},{e:"🥤",l:"عطشان",en:"Thirsty",m:1},{e:"🤕",l:"متألم",en:"In Pain",m:1},{e:"🤩",l:"متحمس",en:"Excited",m:1}]},
  { id:"people", label:"👤 الناس", name:"الناس والعلاقات", active:"background:#EEEDFE;color:#3C3489;border-color:#AFA9EC;font-weight:600", icons:[{e:"👩",l:"ماما",en:"Mother",m:1},{e:"👨",l:"بابا",en:"Father",m:1},{e:"👦",l:"أخ",en:"Brother",m:1},{e:"👧",l:"أخت",en:"Sister",m:1},{e:"👨‍🏫",l:"مدرس",en:"Teacher",m:1},{e:"👨‍⚕️",l:"دكتور",en:"Doctor",m:1},{e:"🤝",l:"صديق",en:"Friend",m:1},{e:"🧑‍🦱",l:"مقدم رعاية",en:"Caregiver",m:1}]},
  { id:"actions", label:"✋ الأفعال", name:"الأفعال والطلبات", active:"background:#E1F5EE;color:#085041;border-color:#5DCAA5;font-weight:600", icons:[{e:"👉",l:"أريد",en:"Want",m:1},{e:"🙅",l:"لا أريد",en:"Don't Want",m:1},{e:"🚶",l:"اذهب",en:"Go",m:1},{e:"👋",l:"تعال",en:"Come",m:1},{e:"✋",l:"انتظر",en:"Wait",m:1},{e:"🎮",l:"العب",en:"Play",m:1},{e:"📖",l:"اقرأ",en:"Read",m:1},{e:"✏️",l:"اكتب",en:"Write",m:1},{e:"👂",l:"اسمع",en:"Listen",m:1},{e:"📺",l:"شاهد",en:"Watch",m:1},{e:"🆘",l:"ساعدني",en:"Help Me",m:1},{e:"📞",l:"اتصل",en:"Call",m:1}]},
  { id:"places", label:"🏙 الأماكن", name:"الأماكن", active:"background:#E6F1FB;color:#0C447C;border-color:#B5D4F4;font-weight:600", icons:[{e:"🏠",l:"بيت",en:"Home",m:0},{e:"🏫",l:"مدرسة",en:"School",m:0},{e:"🕌",l:"مسجد",en:"Mosque",m:0},{e:"🏪",l:"متجر",en:"Shop",m:0},{e:"🌳",l:"حديقة",en:"Park",m:0},{e:"🍽️",l:"مطعم",en:"Restaurant",m:0},{e:"🚇",l:"محطة مترو",en:"Metro Station",m:0},{e:"🏥",l:"مستشفى",en:"Hospital",m:0}]},
  { id:"transport", label:"🚐 المواصلات", name:"المواصلات", active:"background:#E6F1FB;color:#0C447C;border-color:#B5D4F4;font-weight:600", icons:[{e:"🚗",l:"سيارة",en:"Car",m:0},{e:"🚌",l:"أتوبيس",en:"Bus",m:0},{e:"🚇",l:"مترو",en:"Metro",m:0},{e:"🚕",l:"تاكسي",en:"Taxi",m:0},{e:"🛻",l:"ميكروباص",en:"Microbus",m:0},{e:"🛺",l:"توك توك",en:"Tuk-Tuk",m:0}]},
  { id:"food", label:"🍽 الأكل المصري", name:"الأكل المصري", active:"background:#FAEEDA;color:#633806;border-color:#EF9F27;font-weight:600", icons:[{e:"🫘",l:"فول",en:"Foul",m:0},{e:"🧆",l:"طعمية",en:"Falafel",m:0},{e:"🥗",l:"كشري",en:"Koshari",m:0},{e:"🍚",l:"رز",en:"Rice",m:0},{e:"🍞",l:"عيش",en:"Bread",m:0},{e:"🥬",l:"ملوخية",en:"Molokhia",m:0}]},
  { id:"emergency", label:"🚨 طوارئ", name:"الطوارئ", active:"background:#FAECE7;color:#712B13;border-color:#F0997B;font-weight:600", icons:[{e:"⚠️",l:"خطر",en:"Danger",m:1},{e:"🆘",l:"الحقني",en:"Help!",m:1},{e:"🚑",l:"اتصل بالإسعاف",en:"Call Ambulance",m:1},{e:"📞",l:"اتصل بماما",en:"Call Mom",m:1},{e:"📱",l:"اتصل ببابا",en:"Call Dad",m:1},{e:"🩺",l:"محتاج دكتور",en:"Need Doctor",m:1}]}
];

export default function PictureMode() {
  const [activeCat, setActiveCat] = useState(0);
  const [sentence, setSentence] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Parse inline styles from HTML data format into React style objects
  const parseStyle = (styleStr) => {
    return styleStr.split(';').reduce((acc, rule) => {
      if (!rule.trim()) return acc;
      const [key, value] = rule.split(':');
      const camelCaseKey = key.trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
      acc[camelCaseKey] = value.trim();
      return acc;
    }, {});
  };

  const addToSent = (e, l) => {
    if (sentence.length < 6) {
      setSentence([...sentence, { e, l }]);
    }
  };

  const removeFromSent = (indexToRemove) => {
    setSentence(sentence.filter((_, index) => index !== indexToRemove));
  };

  const clearSent = () => {
    setSentence([]);
  };

  const handleSpeak = async () => {
    if (sentence.length === 0 || isSpeaking) return;

    setIsSpeaking(true);
    const textToSpeak = sentence.map(item => item.l).join(' ');

    try {
      const response = await fetch('http://localhost:8000/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSpeak }),
      });

      if (!response.ok) throw new Error('Backend error');

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => setIsSpeaking(false);
      audio.play();
    } catch (error) {
      console.error("Connection error:", error);
      alert("Could not connect to the backend.");
      setIsSpeaking(false);
    }
  };

  const currentCategory = categories[activeCat];

  return (
    <div className="screen" id="screen-picture">
      
      {/* SENTENCE BAR[cite: 2] */}
      <div className="sentence-bar">
        <div className="sent-actions">
          <button className="btn-clear" onClick={clearSent}>
            <i className="ti ti-x"></i>
          </button>
          <button 
            className="btn-speak" 
            id="speak-btn" 
            onClick={handleSpeak}
            disabled={isSpeaking}
            style={{ background: isSpeaking ? '#0F6E56' : '' }} // Visual change on click[cite: 2]
          >
            <i className="ti ti-volume"></i> {isSpeaking ? 'بيتكلم...' : 'تكلم'}
          </button>
        </div>

        <div className="sent-slots" id="sent-slots">
          {sentence.length === 0 ? (
            <span className="sent-empty">اضغط على أيقونة عشان تضيفها هنا...</span>
          ) : (
            sentence.map((s, i) => (
              <div 
                key={i} 
                className="sent-slot filled" 
                onClick={() => removeFromSent(i)} 
                title="اضغط لإزالة"
              >
                <span style={{ fontSize: '20px' }}>{s.e}</span>
                <span className="slbl">{s.l}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CATEGORY TABS[cite: 2] */}
      <div className="cat-tabs" id="cat-tabs">
        {categories.map((c, i) => (
          <button 
            key={i}
            className={`cat-tab ${i === activeCat ? 'active' : ''}`}
            style={i === activeCat ? parseStyle(c.active) : {}} // Applies custom tab colors[cite: 2]
            onClick={() => setActiveCat(i)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* CATEGORY HEADER[cite: 2] */}
      <div className="cat-header">
        <span className="legend"><span className="ldot"></span> أساسي (Must Have)</span>
        <span className="cat-label" id="cat-label">{currentCategory.name}</span>
      </div>

      {/* ICON GRID[cite: 2] */}
      <div className="icon-grid" id="icon-grid">
        {currentCategory.icons.map((ic, i) => (
          <div 
            key={i} 
            className="icon-card" 
            onClick={() => addToSent(ic.e, ic.l)}
          >
            {ic.m === 1 && <div className="must-dot" title="أساسي"></div>}
            <span className="ico">{ic.e}</span>
            <span className="lbl">{ic.l}</span>
            <span className="eng">{ic.en}</span>
          </div>
        ))}
      </div>

    </div>
  );
}