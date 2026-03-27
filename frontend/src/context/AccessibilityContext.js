import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AccessibilityContext = createContext();

const translations = {
  'en-US': {
    'Detected:': 'Detected:',
    'object detected': 'object detected',
    'objects detected': 'objects detected',
    'No objects found': 'No objects found',
    'Starting camera': 'Starting camera',
    'Camera started': 'Camera started',
    'Camera permission denied': 'Camera permission denied',
    'Model loaded': 'Model loaded',
    'Detection started': 'Detection started',
    'Detection stopped': 'Detection stopped',
    'person': 'person',
    'car': 'car',
    'truck': 'truck',
    'bus': 'bus',
    'motorcycle': 'motorcycle',
    'bicycle': 'bicycle',
    'dog': 'dog',
    'cat': 'cat',
    'bird': 'bird',
    'chair': 'chair',
    'table': 'table',
    'bottle': 'bottle',
    'cup': 'cup',
    'book': 'book',
    'tv': 'tv',
    'laptop': 'laptop',
    'phone': 'phone',
    'keyboard': 'keyboard',
    'mouse': 'mouse',
    'banana': 'banana',
    'apple': 'apple',
    'orange': 'orange',
    'potted plant': 'potted plant',
    'bed': 'bed',
    'toilet': 'toilet',
    'door': 'door',
    'clock': 'clock',
    'vase': 'vase',
    'scissors': 'scissors',
    'teddy bear': 'teddy bear',
    'toothbrush': 'toothbrush'
  },
  'ta-IN': {
    'Detected:': 'கண்டறியப்பட்டது:',
    'object detected': 'பொருள் கண்டறியப்பட்டது',
    'objects detected': 'பொருட்கள் கண்டறியப்பட்டன',
    'No objects found': 'எந்த பொருளும் கிடைக்கவில்லை',
    'Starting camera': 'கேமரா தொடங்குகிறது',
    'Camera started': 'கேமரா தொடங்கியது',
    'Camera permission denied': 'கேமரா அனுமதி மறுக்கப்பட்டது',
    'Model loaded': 'மாதிரி ஏற்றப்பட்டது',
    'Detection started': 'கண்டறிதல் தொடங்கியது',
    'Detection stopped': 'கண்டறிதல் நிறுத்தப்பட்டது',
    'person': 'நபர்',
    'car': 'கார்',
    'truck': 'டிரக்',
    'bus': 'பஸ்',
    'motorcycle': 'மோட்டார் சைக்கிள்',
    'bicycle': 'சைக்கிள்',
    'dog': 'நாய்',
    'cat': 'பூனை',
    'bird': 'பறவை',
    'chair': 'நாற்காலி',
    'table': 'மேஜை',
    'bottle': 'பாட்டில்',
    'cup': 'கப்',
    'book': 'புத்தகம்',
    'tv': 'டிவி',
    'laptop': 'லேப்டாப்',
    'phone': 'போன்',
    'keyboard': 'கீபோர்டு',
    'mouse': 'மவுஸ்',
    'banana': 'வாழைப்பழம்',
    'apple': 'ஆப்பிள்',
    'orange': 'ஆரஞ்சு',
    'potted plant': 'மரம்',
    'bed': 'மெத்தை',
    'toilet': 'கழிவறை',
    'door': 'கதவு',
    'clock': 'கடிகை',
    'vase': 'மாடம்',
    'scissors': 'கத்தி',
    'teddy bear': 'டெடி பியர்',
    'toothbrush': 'பல் தூரிகை'
  }
};

const pageNames = {
  'en-US': {
    'Home': 'Home',
    'Camera': 'Camera',
    'Voice': 'Voice',
    'Navigation': 'Navigation',
    'Settings': 'Settings',
    'Object Detection': 'Object Detection',
    'Voice to Text': 'Voice to Text',
    'Text to Voice': 'Text to Voice'
  },
  'ta-IN': {
    'Home': 'முகப்பு',
    'Camera': 'கேமரா',
    'Voice': 'குரல்',
    'Navigation': 'வழிசெலுத்தல்',
    'Settings': 'அமைப்புகள்',
    'Object Detection': 'பொருள் கண்டறிதல்',
    'Voice to Text': 'குரல் முதல் உரை',
    'Text to Voice': 'உரை முதல் குரல்'
  }
};

export function AccessibilityProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('visionassist-theme');
    return saved || 'light';
  });

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('visionassist-language') || 'en-US';
  });

  const [speechRate, setSpeechRate] = useState(() => {
    return parseFloat(localStorage.getItem('visionassist-rate')) || 1;
  });

  const [speechVolume, setSpeechVolume] = useState(() => {
    return parseFloat(localStorage.getItem('visionassist-volume')) || 1;
  });

  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('visionassist-contrast') === 'true';
  });

  const [textSize, setTextSize] = useState(() => {
    return localStorage.getItem('visionassist-textsize') || 'normal';
  });

  const [voiceEnabled, setVoiceEnabled] = useState(() => {
    return localStorage.getItem('visionassist-voice') !== 'false';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('visionassist-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('visionassist-language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('visionassist-rate', speechRate.toString());
  }, [speechRate]);

  useEffect(() => {
    localStorage.setItem('visionassist-volume', speechVolume.toString());
  }, [speechVolume]);

  useEffect(() => {
    localStorage.setItem('visionassist-contrast', highContrast.toString());
  }, [highContrast]);

  useEffect(() => {
    localStorage.setItem('visionassist-textsize', textSize);
  }, [textSize]);

  useEffect(() => {
    localStorage.setItem('visionassist-voice', voiceEnabled.toString());
  }, [voiceEnabled]);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    
    const initSpeech = () => {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.resume();
    };
    
    initSpeech();
    
    document.addEventListener('click', initSpeech, { once: true });
    document.addEventListener('touchstart', initSpeech, { once: true });
    
    return () => {
      document.removeEventListener('click', initSpeech);
      document.removeEventListener('touchstart', initSpeech);
    };
  }, []);

  const translate = useCallback((text) => {
    const langTranslations = translations[language];
    if (!langTranslations) return text;
    return langTranslations[text.toLowerCase()] || text;
  }, [language]);

  const translatePageName = useCallback((name) => {
    return pageNames[language]?.[name] || name;
  }, [language]);

  const speak = useCallback((text, useTranslation = true) => {
    if (!voiceEnabled || !text) return;
    
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }
    
    try {
      const synth = window.speechSynthesis;
      
      synth.cancel();
      
      let finalText = text;
      if (useTranslation) {
        finalText = translate(text);
      }
      
      const utterance = new SpeechSynthesisUtterance(finalText);
      utterance.rate = speechRate || 1;
      utterance.volume = speechVolume || 1;
      utterance.pitch = 1;
      utterance.lang = language || 'en-US';
      
      const speakNow = () => {
        try {
          synth.speak(utterance);
        } catch (e) {
          console.error('Speak error:', e);
        }
      };
      
      const voices = synth.getVoices();
      if (voices.length > 0) {
        const match = voices.find(v => v.lang.startsWith((language || 'en').split('-')[0]));
        if (match) utterance.voice = match;
        speakNow();
      } else {
        synth.onvoiceschanged = () => {
          const newVoices = synth.getVoices();
          const match = newVoices.find(v => v.lang.startsWith((language || 'en').split('-')[0]));
          if (match) utterance.voice = match;
          speakNow();
        };
        speakNow();
      }
    } catch (error) {
      console.error('Error speaking:', error);
    }
  }, [voiceEnabled, speechRate, speechVolume, language, translate]);

  const speakRaw = useCallback((text) => {
    speak(text, false);
  }, [speak]);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const vibrate = useCallback((pattern = 200) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const getTextSize = useCallback(() => {
    switch (textSize) {
      case 'large': return 'text-xl';
      case 'extra-large': return 'text-2xl';
      default: return 'text-base';
    }
  }, [textSize]);

  const value = {
    theme,
    language,
    speechRate,
    speechVolume,
    highContrast,
    textSize,
    voiceEnabled,
    translate,
    translatePageName,
    setLanguage,
    setSpeechRate,
    setSpeechVolume,
    setHighContrast,
    setTextSize,
    setVoiceEnabled,
    toggleTheme,
    speak,
    speakRaw,
    stopSpeaking,
    vibrate,
    getTextSize
  };

  return (
    <AccessibilityContext.Provider value={value}>
      <div className={`${theme} ${highContrast ? 'high-contrast' : ''} ${getTextSize()}`}>
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}
