import React, { useState, useRef } from 'react';
import './TranscriberMode.css';

export default function TranscriberMode() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [transcripts, setTranscripts] = useState([
    "أنا عايز أروح الدكتور النهارده عشان مش حاسس بنفسي كويس.",
    "قولتلك إمبارح إن في ألم في ضهري."
  ]);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const waveformHeights = [10, 18, 28, 38, 30, 22, 35, 42, 25, 16, 38, 45, 20, 32, 40, 28, 15, 36, 44, 26];

  const toggleRecording = async () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = processAudio;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone access denied:", error);
      alert("يرجى السماح بالوصول إلى الميكروفون لاستخدام النسخ."); 
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const processAudio = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append("audio_file", audioBlob, "recording.webm");

    try {
      const response = await fetch('http://localhost:8000/stt', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Transcription failed on server');

      const data = await response.json();
      
      if (data.transcription && data.transcription.trim() !== '') {
        setTranscripts(prev => [...prev, data.transcription]);
      }
    } catch (error) {
      console.error("Error connecting to STT backend:", error);
      alert("حدث خطأ أثناء معالجة الصوت."); 
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => setTranscripts([]);

  return (
    <div className="trans-body">
      
      {/* Status Bar */}
      <div className="status-bar">
        <div className={`status-pill ${isRecording ? 'listening' : 'idle'}`}>
          <div className={isRecording ? "pulse-dot" : "idle-dot"}></div>
          <span>{isRecording ? 'بيسمع...' : isProcessing ? 'بيترجم...' : 'جاهز'}</span>
        </div>

        <div className="toolbar">
          <button className="tool-btn" onClick={() => navigator.clipboard.writeText(transcripts.join('\n'))}>
            <i className="ti ti-copy" aria-hidden="true"></i> نسخ
          </button>
          <button className="tool-btn" onClick={handleClear}>
            <i className="ti ti-trash" aria-hidden="true"></i> مسح
          </button>
        </div>
      </div>

      {/* Transcript Box */}
      <div className="transcript-box">
        <div className="t-final">
          {transcripts.map((text, idx) => (
             <div key={idx} style={{ marginBottom: '8px' }}>{text}</div>
          ))}
        </div>
        {isProcessing && (
          <div className="t-interim">
            جاري المعالجة<span className="t-cursor"></span>
          </div>
        )}
      </div>

      {/* Waveform Animation */}
      <div className="waveform">
        {waveformHeights.map((h, i) => (
          <div 
            key={i} 
            className={`wbar ${isRecording ? 'active' : ''}`}
            style={{ 
              animationDelay: `${i * 0.07}s`,
              animationDuration: `${0.8 + Math.random() * 0.6}s`
            }}
          ></div>
        ))}
      </div>

      {/* Controls */}
      <div className="mic-area">
        <div className={`mic-ring ${isRecording ? 'recording' : ''}`} onClick={toggleRecording}>
          <i className="ti ti-microphone" aria-hidden="true"></i>
        </div>
        <span className="mic-hint">
          {isRecording ? 'اضغط للإيقاف' : 'اضغط للتسجيل'}
        </span>
      </div>

    </div>
  );
}