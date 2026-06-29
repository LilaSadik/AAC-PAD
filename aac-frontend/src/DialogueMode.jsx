import React, { useState } from 'react';
import './DialogueMode.css';

export default function DialogueMode() {
  // State for the main text input area
  const [inputText, setInputText] = useState('محتاج مية من فضلك');
  
  // State to manage spoken history (keeps the last 20 phrases)
  const [history, setHistory] = useState([
    'صباح الخير يا دكتور',
    'عايز أروح الحمام',
    'أنا مش كويس النهارده',
    'محتاج دوا'
  ]);

  // Pre-defined shortcuts based on your wireframe
  const shortcuts = [
    'صباح الخير',
    'شكراً',
    'محتاج مساعدة',
    'مش عارف',
    'تمام'
  ];

  // Core function to handle TTS API call
  const speakText = async (textToSpeak) => {
    if (!textToSpeak || textToSpeak.trim() === '') return;

    try {
      const response = await fetch('http://localhost:8000/speak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textToSpeak }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch audio from the server.');
      }

      // Convert response to a blob and play it dynamically
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();

      // Add to history (avoiding immediate duplicates) and cap at 20 items
      setHistory((prevHistory) => {
        const filteredHistory = prevHistory.filter(item => item !== textToSpeak);
        return [textToSpeak, ...filteredHistory].slice(0, 20);
      });

    } catch (error) {
      console.error("Error communicating with TTS backend:", error);
      alert("عذراً، حدث خطأ في الاتصال بالخادم."); // User-friendly error in Arabic
    }
  };

  // Handlers for specific interactions
  const handleMainSpeakClick = () => {
    speakText(inputText);
  };

  const handleShortcutClick = (text) => {
    setInputText(text); // Populates the textarea so the user can see/edit before speaking
  };

  const handleHistoryPlay = (text) => {
    speakText(text); // Speaks immediately without altering the input area
  };

  const handleHistoryEdit = (text) => {
    setInputText(text); // Moves history item back to the input area for editing
  };

  return (
  <div className="dlg-body" dir="rtl">
  {/* 1st DIV: In RTL, this appears on the RIGHT (Shortcuts + Input) */}
  <div className="dlg-right">
    <div className="shortcuts-header">اختصارات سريعة</div>
    <div className="shortcuts">
      {shortcuts.map((shortcut, index) => (
        <div key={index} className="shortcut" onClick={() => handleShortcutClick(shortcut)}>
          {shortcut}
        </div>
      ))}
    </div>
    
    <textarea 
      className="dlg-input" 
      placeholder="اكتب هنا..." 
      value={inputText}
      onChange={(e) => setInputText(e.target.value)}
      dir="rtl"
    />
    
    <button className="btn-speak-full" onClick={handleMainSpeakClick}>
      <i className="ti ti-volume" aria-hidden="true"></i>
      تكلم
    </button>
  </div>

  {/* 2nd DIV: In RTL, this appears on the LEFT (History) */}
  <div className="dlg-left">
    <div className="hist-label">السابق</div>
    <div className="hist-list">
      {history.map((item, index) => (
        <div key={index} className="hist-item">
          <div className="hist-actions">
            <button className="hist-btn" onClick={() => handleHistoryPlay(item)} title="استماع">
              <i className="ti ti-volume" aria-hidden="true"></i>
            </button>
            <button className="hist-btn" onClick={() => handleHistoryEdit(item)} title="تعديل">
              <i className="ti ti-edit" aria-hidden="true"></i>
            </button>
          </div>
          <div className="hist-text">{item}</div>
        </div>
      ))}
    </div>
  </div>
</div>
);
}

