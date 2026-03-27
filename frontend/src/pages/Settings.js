import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccessibility } from '../context/AccessibilityContext';

export default function Settings() {
  const navigate = useNavigate();
  const {
    theme,
    language,
    speechRate,
    speechVolume,
    highContrast,
    textSize,
    voiceEnabled,
    toggleTheme,
    setLanguage,
    setSpeechRate,
    setSpeechVolume,
    setHighContrast,
    setTextSize,
    setVoiceEnabled,
    speak,
    vibrate
  } = useAccessibility();

  const handleBack = () => {
    navigate('/');
    speak('Going back to home');
  };

  const handleTestVoice = () => {
    const testMessage = 'Voice system is working. This is a test of the text to speech feature.';
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(testMessage);
      utterance.rate = speechRate || 1;
      utterance.volume = speechVolume || 1;
      utterance.lang = language || 'en-US';
      window.speechSynthesis.speak(utterance);
    } else {
      speak(testMessage);
    }
    vibrate(100);
  };

  const handleHearAppInfo = () => {
    const appInfo = 'VisionVoice AI version 1.0.0. An accessibility application for blind and deaf users. This app helps you detect objects using your camera, convert voice to text, and navigate using voice guidance.';
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(appInfo);
      utterance.rate = speechRate || 1;
      utterance.volume = speechVolume || 1;
      utterance.lang = language || 'en-US';
      window.speechSynthesis.speak(utterance);
    } else {
      speak(appInfo);
    }
    vibrate(50);
  };

  const languages = [
    { code: 'en-US', name: 'English' },
    { code: 'ta-IN', name: 'Tamil (தமிழ்)' }
  ];

  const textSizes = [
    { value: 'normal', label: 'Normal', description: 'Standard text size' },
    { value: 'large', label: 'Large', description: 'Larger text for easier reading' },
    { value: 'extra-large', label: 'Extra Large', description: 'Maximum text size' }
  ];

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-300"
          aria-label="Go back"
        >
          <span className="text-2xl">←</span>
          <span className="text-lg">Back</span>
        </button>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        
        <div className="w-20"></div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          🎨 Appearance
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Switch between light and dark themes
              </p>
            </div>
            <button
              onClick={() => {
                toggleTheme();
                speak(theme === 'light' ? 'Dark mode enabled' : 'Light mode enabled');
                vibrate(50);
              }}
              className={`w-14 h-7 rounded-full transition-colors ${
                theme === 'dark' ? 'bg-primary' : 'bg-gray-300'
              }`}
              role="switch"
              aria-checked={theme === 'dark'}
              aria-label="Toggle dark mode"
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow transform transition-transform ${
                theme === 'dark' ? 'translate-x-7' : 'translate-x-0.5'
              }`}></div>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">High Contrast</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enhanced visibility for better readability
              </p>
            </div>
            <button
              onClick={() => {
                setHighContrast(!highContrast);
                speak(highContrast ? 'High contrast disabled' : 'High contrast enabled');
                vibrate(50);
              }}
              className={`w-14 h-7 rounded-full transition-colors ${
                highContrast ? 'bg-primary' : 'bg-gray-300'
              }`}
              role="switch"
              aria-checked={highContrast}
              aria-label="Toggle high contrast mode"
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow transform transition-transform ${
                highContrast ? 'translate-x-7' : 'translate-x-0.5'
              }`}></div>
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          🗣️ Voice Settings
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Voice Feedback</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enable or disable spoken responses
              </p>
            </div>
            <button
              onClick={() => {
                setVoiceEnabled(!voiceEnabled);
                speak(voiceEnabled ? 'Voice feedback disabled' : 'Voice feedback enabled');
                vibrate(50);
              }}
              className={`w-14 h-7 rounded-full transition-colors ${
                voiceEnabled ? 'bg-primary' : 'bg-gray-300'
              }`}
              role="switch"
              aria-checked={voiceEnabled}
              aria-label="Toggle voice feedback"
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow transform transition-transform ${
                voiceEnabled ? 'translate-x-7' : 'translate-x-0.5'
              }`}></div>
            </button>
          </div>

          <div>
            <label className="block font-medium text-gray-900 dark:text-white mb-2">
              Language
            </label>
            <div className="flex gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    speak(`Language changed to ${lang.name}`);
                    vibrate(50);
                  }}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
                    language === lang.code
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-medium text-gray-900 dark:text-white mb-2">
              Speech Speed: {speechRate.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={speechRate}
              onChange={(e) => {
                setSpeechRate(parseFloat(e.target.value));
              }}
              onMouseUp={() => {
                speak(`Speech speed set to ${speechRate.toFixed(1)}`);
              }}
              className="w-full h-2 bg-gray-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
              aria-label="Speech speed"
            />
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
              <span>Slow</span>
              <span>Normal</span>
              <span>Fast</span>
            </div>
          </div>

          <div>
            <label className="block font-medium text-gray-900 dark:text-white mb-2">
              Volume: {Math.round(speechVolume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={speechVolume}
              onChange={(e) => {
                setSpeechVolume(parseFloat(e.target.value));
              }}
              onMouseUp={() => {
                speak(`Volume set to ${Math.round(speechVolume * 100)} percent`);
              }}
              className="w-full h-2 bg-gray-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
              aria-label="Volume"
            />
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
              <span>Silent</span>
              <span>Medium</span>
              <span>Full</span>
            </div>
          </div>

          <button
            onClick={handleTestVoice}
            className="btn-secondary w-full"
            aria-label="Test voice settings"
          >
            🔊 Test Voice
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          📝 Text Size
        </h2>

        <div className="space-y-2">
          {textSizes.map((size) => (
            <button
              key={size.value}
              onClick={() => {
                setTextSize(size.value);
                speak(`Text size set to ${size.label}`);
                vibrate(50);
              }}
              className={`w-full p-4 rounded-xl text-left transition-colors ${
                textSize === size.value
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white'
              }`}
            >
              <p className="font-medium">{size.label}</p>
              <p className={`text-sm ${textSize === size.value ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                {size.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          🆘 Emergency Contact
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block font-medium text-gray-900 dark:text-white mb-2">
              Emergency Phone Number
            </label>
            <input
              type="tel"
              id="emergencyNumber"
              defaultValue={localStorage.getItem('visionassist-emergency-number') || '112'}
              className="input-field"
              placeholder="Enter emergency number"
              aria-label="Emergency phone number"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Default: 112 (India Emergency)
            </p>
          </div>
          
          <button
            onClick={() => {
              const input = document.getElementById('emergencyNumber');
              const number = input.value.trim() || '112';
              localStorage.setItem('visionassist-emergency-number', number);
              speak(`Emergency number saved: ${number}`);
              vibrate(50);
            }}
            className="btn-primary w-full"
            aria-label="Save emergency number"
          >
            💾 Save Emergency Number
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          ℹ️ About
        </h2>
        
        <div className="space-y-2 text-gray-600 dark:text-gray-300">
          <p><strong>VisionVoice AI</strong></p>
          <p>Version 1.0.0</p>
          <p className="text-sm">
            An accessibility application designed to help visually and hearing impaired users 
            navigate the world independently using AI-powered features.
          </p>
        </div>
        
        <button
          onClick={handleHearAppInfo}
          className="mt-4 btn-secondary"
          aria-label="Hear app info"
        >
          🔊 Hear About
        </button>
      </div>
    </div>
  );
}