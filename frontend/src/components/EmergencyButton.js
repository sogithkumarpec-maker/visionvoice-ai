import React, { useState, useEffect, useCallback } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';

export default function EmergencyButton() {
  const { speak, vibrate, language } = useAccessibility();
  const [emergencyNumber, setEmergencyNumber] = useState('112');
  const [showConfirm, setShowConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('visionassist-emergency-number');
    if (saved) {
      setEmergencyNumber(saved);
    }
  }, []);

  const translations = {
    'en-US': {
      button: 'Emergency SOS',
      confirmTitle: 'Emergency Call',
      confirmMessage: 'Do you want to call emergency services?',
      calling: 'Calling emergency services',
      called: 'Calling',
      notSupported: 'Calling not supported on this device',
      saved: 'Emergency number saved'
    },
    'ta-IN': {
      button: 'அவசர பட்டன்',
      confirmTitle: 'அவசர அழைப்பு',
      confirmMessage: 'நீங்கள் அவசர சேவையை அழைக்க விரும்புகிறீர்களா?',
      calling: 'அவசர சேவையை அழைக்கிறது',
      called: 'அழைக்கிறது',
      notSupported: 'இந்த சாதனத்தில் அழைப்பு ஆதரிக்கப்படவில்லை',
      saved: 'அவசர எண் சேமிக்கப்பட்டது'
    }
  };

  const t = translations[language] || translations['en-US'];

  const handleEmergency = useCallback(() => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    vibrate([200, 100, 200, 100, 200]);
    speak(t.confirmMessage);
    
    setShowConfirm(true);
    
    setTimeout(() => {
      setShowConfirm(false);
      setIsProcessing(false);
    }, 3000);
  }, [speak, vibrate, t.confirmMessage, isProcessing]);

  const handleConfirm = useCallback(() => {
    setShowConfirm(false);
    setIsProcessing(true);
    
    speak(`${t.calling} ${emergencyNumber}`);
    vibrate([300, 150, 300]);
    
    setTimeout(() => {
      const telLink = `tel:${emergencyNumber}`;
      window.location.href = telLink;
      
      setTimeout(() => {
        setIsProcessing(false);
      }, 2000);
    }, 1500);
  }, [emergencyNumber, speak, t.calling, vibrate]);

  const handleCancel = useCallback(() => {
    setShowConfirm(false);
    setIsProcessing(false);
    speak(language === 'ta-IN' ? 'அழைப்பு ரத்து செய்யப்பட்டது' : 'Call cancelled');
  }, [speak, language]);

  const handleMouseEnter = useCallback(() => {
    if (!isProcessing) {
      speak(t.button);
    }
  }, [speak, t.button, isProcessing]);

  return (
    <>
      <button
        onClick={handleEmergency}
        onMouseEnter={handleMouseEnter}
        onTouchStart={handleMouseEnter}
        disabled={isProcessing}
        className={`fixed bottom-6 right-6 w-20 h-20 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg flex flex-col items-center justify-center text-xl font-bold transition-all duration-200 z-50 ${
          isProcessing ? 'animate-pulse bg-red-600' : 'hover:scale-110 active:scale-95'
        }`}
        aria-label={t.button}
        title="SOS - Emergency Call"
      >
        <span className="text-3xl">🆘</span>
        <span className="text-xs font-bold">SOS</span>
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm text-center animate-fade-in">
            <div className="text-5xl mb-4">📞</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {t.confirmTitle}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {t.confirmMessage}
            </p>
            <p className="text-2xl font-bold text-red-500 mb-4">
              {emergencyNumber}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 py-3 px-4 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-white rounded-xl font-semibold"
              >
                ✕ {language === 'ta-IN' ? 'ரத்து' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl font-semibold animate-pulse"
              >
                📞 {t.called}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function getEmergencyNumber() {
  return localStorage.getItem('visionassist-emergency-number') || '112';
}
