import React, { createContext, useState, useEffect } from 'react';

export const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  // Helper to get saved values or fallback to default
  const getSaved = (key, defaultValue) => {
    const saved = localStorage.getItem(key);
    return saved !== null ? JSON.parse(saved) : defaultValue;
  };

  // 1. Initialize states from localStorage
  const [fontSize, setFontSize] = useState(() => getSaved('aac_fontSize', 18));
  const [theme, setTheme] = useState(() => getSaved('aac_theme', 'light'));
  const [highContrast, setHighContrast] = useState(() => getSaved('aac_highContrast', false));
  const [largeButtons, setLargeButtons] = useState(() => getSaved('aac_largeButtons', false));
  const [speechSpeed, setSpeechSpeed] = useState(() => getSaved('aac_speechSpeed', 'normal'));
  const [volume, setVolume] = useState(() => getSaved('aac_volume', 80));
  const [voice, setVoice] = useState(() => getSaved('aac_voice', 'female-eg'));
  const [audioConfirm, setAudioConfirm] = useState(() => getSaved('aac_audioConfirm', false));

  // 2. Save to localStorage whenever they change
  useEffect(() => localStorage.setItem('aac_fontSize', JSON.stringify(fontSize)), [fontSize]);
  useEffect(() => localStorage.setItem('aac_theme', JSON.stringify(theme)), [theme]);
  useEffect(() => localStorage.setItem('aac_highContrast', JSON.stringify(highContrast)), [highContrast]);
  useEffect(() => localStorage.setItem('aac_largeButtons', JSON.stringify(largeButtons)), [largeButtons]);
  useEffect(() => localStorage.setItem('aac_speechSpeed', JSON.stringify(speechSpeed)), [speechSpeed]);
  useEffect(() => localStorage.setItem('aac_volume', JSON.stringify(volume)), [volume]);
  useEffect(() => localStorage.setItem('aac_voice', JSON.stringify(voice)), [voice]);
  useEffect(() => localStorage.setItem('aac_audioConfirm', JSON.stringify(audioConfirm)), [audioConfirm]);

  // 3. Apply DOM Effects globally!
  useEffect(() => {
    if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
  }, [theme]);

  useEffect(() => {
    if (highContrast) document.documentElement.setAttribute('data-high-contrast', 'true');
    else document.documentElement.removeAttribute('data-high-contrast');
  }, [highContrast]);

  useEffect(() => {
    if (largeButtons) document.documentElement.setAttribute('data-large-buttons', 'true');
    else document.documentElement.removeAttribute('data-large-buttons');
  }, [largeButtons]);

  useEffect(() => {
    // 18 is your default size. This creates a multiplier (e.g., 24/18 = 1.33x scale)
    const scaleRatio = fontSize / 18;
    document.documentElement.style.setProperty('--font-scale', scaleRatio);
    
    // Fallback for anything without a fixed pixel size
    document.body.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  // Combine everything to pass down
  const value = {
    fontSize, setFontSize, theme, setTheme,
    highContrast, setHighContrast, largeButtons, setLargeButtons,
    speechSpeed, setSpeechSpeed, volume, setVolume,
    voice, setVoice, audioConfirm, setAudioConfirm
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}