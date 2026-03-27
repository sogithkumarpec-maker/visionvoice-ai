import React, { useEffect } from 'react';
import Navigation from './Navigation';
import EmergencyButton from './EmergencyButton';
import { useAccessibility } from '../context/AccessibilityContext';

export default function Layout({ children }) {
  const { theme } = useAccessibility();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const unlockSpeech = () => {
        window.speechSynthesis.getVoices();
        window.speechSynthesis.resume();
      };
      
      document.addEventListener('click', unlockSpeech, { once: true });
      document.addEventListener('touchstart', unlockSpeech, { once: true });
      
      return () => {
        document.removeEventListener('click', unlockSpeech);
        document.removeEventListener('touchstart', unlockSpeech);
      };
    }
  }, []);

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200 ${theme}`}>
      <Navigation />
      <main className="pt-20 pb-8 px-4 max-w-7xl mx-auto">
        {children}
      </main>
      <EmergencyButton />
    </div>
  );
}