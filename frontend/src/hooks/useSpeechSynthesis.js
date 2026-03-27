import { useState, useCallback, useEffect, useRef } from 'react';

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [language, setLanguage] = useState('en-US');
  const [speechRate, setSpeechRate] = useState(1);
  const [speechVolume, setSpeechVolume] = useState(1);
  
  const utteranceRef = useRef(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
      console.warn('Speech synthesis not supported in this browser');
      return;
    }

    const loadSettings = () => {
      const savedLang = localStorage.getItem('visionassist-language');
      const savedRate = localStorage.getItem('visionassist-rate');
      const savedVolume = localStorage.getItem('visionassist-volume');
      
      if (savedLang) setLanguage(savedLang);
      if (savedRate) setSpeechRate(parseFloat(savedRate));
      if (savedVolume) setSpeechVolume(parseFloat(savedVolume));
    };

    const loadVoices = () => {
      try {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        
        if (voices.length > 0 && !selectedVoice && !isInitializedRef.current) {
          isInitializedRef.current = true;
          const langPrefix = language.split('-')[0];
          const matchingVoice = voices.find(v => v.lang.startsWith(langPrefix));
          setSelectedVoice(matchingVoice || voices[0]);
        }
      } catch (error) {
        console.error('Error loading voices:', error);
      }
    };

    loadSettings();
    loadVoices();

    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      try {
        window.speechSynthesis.cancel();
      } catch (error) {
        console.error('Error canceling speech on cleanup:', error);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const speakText = useCallback((text) => {
    if (!text || !isSupported) {
      console.warn('Cannot speak: text is empty or speech not supported');
      return;
    }
    
    try {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speechRate;
      utterance.volume = speechVolume;
      utterance.pitch = 1;
      utterance.lang = language;
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setIsSpeaking(false);
        if (event.error === 'interrupted') {
          console.log('Speech was interrupted');
        }
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error in speakText:', error);
      setIsSpeaking(false);
    }
  }, [language, speechRate, speechVolume, selectedVoice, isSupported]);

  const stop = useCallback(() => {
    try {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } catch (error) {
      console.error('Error stopping speech:', error);
    }
  }, []);

  const pause = useCallback(() => {
    try {
      window.speechSynthesis.pause();
    } catch (error) {
      console.error('Error pausing speech:', error);
    }
  }, []);

  const resume = useCallback(() => {
    try {
      window.speechSynthesis.resume();
    } catch (error) {
      console.error('Error resuming speech:', error);
    }
  }, []);

  return {
    isSpeaking,
    isSupported,
    availableVoices,
    selectedVoice,
    setSelectedVoice,
    speakText,
    stop,
    pause,
    resume,
    language,
    setLanguage,
    speechRate,
    setSpeechRate,
    speechVolume,
    setSpeechVolume
  };
}