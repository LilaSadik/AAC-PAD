import React, { useContext, useState } from 'react';
import { SettingsContext } from './SettingsContext';
import './Settings.css';

export default function Settings() {
  const {
    fontSize, setFontSize,
    theme, setTheme,
    highContrast, setHighContrast,
    largeButtons, setLargeButtons,
    speechSpeed, setSpeechSpeed,
    volume, setVolume,
    voice, setVoice,
    audioConfirm, setAudioConfirm
  } = useContext(SettingsContext);

  const [lockSettings, setLockSettings] = useState(false);
  const [offlineStorage, setOfflineStorage] = useState(false);

  return (
    <div className="settings-body">

      <div className="sct-header">إمكانية الوصول</div>

      <div className="slider-row">
        <div className="slider-top">
          <i className="ti ti-typography" aria-hidden="true"></i>
          <span className="srow-label" style={{flex:1, fontSize:'13px', fontWeight:500, color:'var(--text)'}}>حجم الخط</span>
          <span className="slider-val" id="font-val">{fontSize}</span>
        </div>
        <input 
          type="range" min="14" max="24" value={fontSize} step="1" 
          onChange={(e) => setFontSize(Number(e.target.value))} 
        />
        <div className="font-preview" id="font-prev" style={{ fontSize: `${fontSize}px` }}>
          أنا عايز أروح الدكتور
        </div>
      </div>

      <div className="sct-header" style={{ marginTop: 0 }}>وضع الألوان</div>
      <div className="theme-row">
        <div className={`theme-pill ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}>
          <div className="theme-swatch" style={{ background: '#fff', border: '1px solid #ccc' }}></div> فاتح
        </div>
        <div className={`theme-pill ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}>
          <div className="theme-swatch" style={{ background: '#1a1a2e' }}></div> داكن
        </div>
      </div>

      <div className="srow" onClick={() => setHighContrast(!highContrast)}>
        <div className="srow-icon" style={{ background: '#EEEDFE' }}><i className="ti ti-contrast" style={{ color: '#534AB7' }}></i></div>
        <div className="srow-body">
          <div className="srow-label">تباين عالي</div>
          <div className="srow-sub">يزيد وضوح النصوص والحدود</div>
        </div>
        <button className={`toggle ${!highContrast ? 'off' : ''}`}></button>
      </div>
      
      <div className="srow" onClick={() => setLargeButtons(!largeButtons)}>
        <div className="srow-icon" style={{ background: '#E1F5EE' }}><i className="ti ti-pointer" style={{ color: '#0F6E56' }}></i></div>
        <div className="srow-body">
          <div className="srow-label">أزرار كبيرة</div>
          <div className="srow-sub">يكبر مساحة اللمس</div>
        </div>
        <button className={`toggle ${!largeButtons ? 'off' : ''}`}></button>
      </div>

      <div className="sct-header">الصوت والنطق</div>

      <div className="slider-row">
        <div className="slider-top">
          <i className="ti ti-run" aria-hidden="true"></i>
          <span className="srow-label" style={{flex:1, fontSize:'13px', fontWeight:500, color:'var(--text)'}}>سرعة الكلام</span>
        </div>
        <div className="speed-pills">
          <button className={`speed-pill ${speechSpeed === 'slow' ? 'active' : ''}`} onClick={() => setSpeechSpeed('slow')}>بطيء</button>
          <button className={`speed-pill ${speechSpeed === 'normal' ? 'active' : ''}`} onClick={() => setSpeechSpeed('normal')}>عادي</button>
          <button className={`speed-pill ${speechSpeed === 'fast' ? 'active' : ''}`} onClick={() => setSpeechSpeed('fast')}>سريع</button>
        </div>
      </div>

      <div className="slider-row">
        <div className="slider-top">
          <i className="ti ti-volume" aria-hidden="true"></i>
          <span className="srow-label" style={{flex:1, fontSize:'13px', fontWeight:500, color:'var(--text)'}}>الصوت</span>
          <span className="slider-val" id="vol-val">{volume}%</span>
        </div>
        <input 
          type="range" min="0" max="100" value={volume} step="1" 
          onChange={(e) => setVolume(Number(e.target.value))} 
        />
      </div>

      <div className="slider-row">
        <div className="slider-top" style={{ marginBottom: '9px' }}>
          <i className="ti ti-microphone" aria-hidden="true"></i>
          <span className="srow-label" style={{fontSize:'13px', fontWeight:500, color:'var(--text)'}}>الصوت المستخدم للنطق</span>
        </div>
        <div className="voice-box">
          <button className={`voice-opt ${voice === 'female-eg' ? 'active' : ''}`} onClick={() => setVoice('female-eg')}>صوت أنثى — مصري</button>
          <button className={`voice-opt ${voice === 'male-eg' ? 'active' : ''}`} onClick={() => setVoice('male-eg')}>صوت ذكر — مصري</button>
          <button className={`voice-opt ${voice === 'female-msa' ? 'active' : ''}`} onClick={() => setVoice('female-msa')}>صوت أنثى — فصحى</button>
        </div>
      </div>

      <div className="srow" onClick={() => setAudioConfirm(!audioConfirm)}>
        <div className="srow-icon" style={{ background: '#FAEEDA' }}><i className="ti ti-repeat" style={{ color: '#B56A0A' }}></i></div>
        <div className="srow-body">
          <div className="srow-label">تأكيد صوتي عند اللمس</div>
          <div className="srow-sub">ينطق اسم الأيقونة فور الضغط عليها</div>
        </div>
        <button className={`toggle ${!audioConfirm ? 'off' : ''}`}></button>
      </div>

      <div className="sct-header">عام</div>

      <div className="srow" onClick={() => setLockSettings(!lockSettings)}>
        <div className="srow-icon" style={{ background: '#E6F1FB' }}><i className="ti ti-lock" style={{ color: '#185FA5' }}></i></div>
        <div className="srow-body">
          <div className="srow-label">قفل الإعدادات</div>
          <div className="srow-sub">يمنع المستخدم من تغيير الإعدادات</div>
        </div>
        <button className={`toggle ${!lockSettings ? 'off' : ''}`}></button>
      </div>

      <div className="srow" onClick={() => setOfflineStorage(!offlineStorage)}>
        <div className="srow-icon" style={{ background: '#E6F1FB' }}><i className="ti ti-wifi-off" style={{ color: '#185FA5' }}></i></div>
        <div className="srow-body">
          <div className="srow-label">تخزين الأيقونات بدون نت</div>
          <div className="srow-sub">يحمل الأصوات مسبقاً للاستخدام بدون إنترنت</div>
        </div>
        <button className={`toggle ${!offlineStorage ? 'off' : ''}`}></button>
      </div>

      <button className="danger-btn" onClick={() => {
        setTheme('light');
        setFontSize(18);
        setHighContrast(false);
        setLargeButtons(false);
        setAudioConfirm(false);
        alert('تم إعادة ضبط الإعدادات بنجاح!');
      }}>
        <i className="ti ti-refresh" aria-hidden="true"></i> إعادة ضبط المفضلات والاختصارات
      </button>

    </div>
  );
}