import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useAccessibility } from '../context/AccessibilityContext';

export default function VoiceSubtitle() {
  const navigate = useNavigate();
  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported: isRecognitionSupported,
    startListening,
    stopListening,
    clearTranscript
  } = useSpeechRecognition();

  const {
    isSpeaking,
    speakText,
    stop
  } = useSpeechSynthesis();

  const { speak, vibrate, language } = useAccessibility();
  
  const [inputText, setInputText] = useState('');
  const [textSize, setTextSize] = useState('normal');

  const handleStartListening = () => {
    startListening();
    speak('Listening for speech');
    vibrate(100);
  };

  const handleStopListening = () => {
    stopListening();
    speak('Stopped listening');
    vibrate(100);
  };

  const handleSpeak = () => {
    if (inputText.trim()) {
      speakText(inputText);
      speak(`Speaking: ${inputText.substring(0, 30)}${inputText.length > 30 ? '...' : ''}`);
      vibrate(50);
    } else {
      speak('Please enter some text to speak');
    }
  };

  const handleClear = () => {
    clearTranscript();
    setInputText('');
    speak('Cleared all text');
    vibrate(50);
  };

  const handleBack = () => {
    stopListening();
    stop();
    navigate('/');
    speak('Going back to home');
  };

  const handleCopy = () => {
    const fullText = transcript + interimTranscript;
    navigator.clipboard.writeText(fullText);
    speak('Copied to clipboard');
    vibrate(50);
  };

  const getTextSizeClass = () => {
    switch (textSize) {
      case 'large': return 'text-3xl';
      case 'extra-large': return 'text-4xl';
      default: return 'text-2xl';
    }
  };

  if (!isRecognitionSupported) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Speech Recognition Not Supported
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Please use Chrome or Edge browser for voice features
        </p>
        <button onClick={handleBack} className="btn-primary">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
          Voice & Text
        </h1>
        
        <div className="w-20"></div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          🎤 Voice to Text
        </h2>

        <div className="flex justify-center mb-6">
          {isListening ? (
            <button
              onClick={handleStopListening}
              className="btn-primary bg-red-500 hover:bg-red-600 w-full max-w-xs"
              aria-label="Stop listening"
            >
              <span className="flex items-center justify-center">
                <span className="w-4 h-4 bg-white rounded-sm mr-3 animate-pulse"></span>
                Stop Listening
              </span>
            </button>
          ) : (
            <button
              onClick={handleStartListening}
              className="btn-primary w-full max-w-xs"
              aria-label="Start listening"
            >
              🎤 Start Listening
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl mb-4">
            <p>{error}</p>
          </div>
        )}

        <div className="bg-black text-white rounded-xl p-4 min-h-[200px] max-h-[300px] overflow-y-auto">
          {isListening && !transcript && !interimTranscript && (
            <p className="text-gray-400 animate-pulse">🎧 Listening...</p>
          )}
          
          <p className={getTextSizeClass()}>
            {transcript}
            {interimTranscript && (
              <span className="text-gray-400">{interimTranscript}</span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={handleClear}
            className="btn-secondary flex-1"
            aria-label="Clear transcript"
          >
            🗑️ Clear
          </button>
          <button
            onClick={handleCopy}
            className="btn-secondary flex-1"
            aria-label="Copy transcript"
          >
            📋 Copy
          </button>
        </div>

        <div className="mt-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Caption Size:
          </label>
          <div className="flex gap-2">
            {['normal', 'large', 'extra-large'].map((size) => (
              <button
                key={size}
                onClick={() => {
                  setTextSize(size);
                  speak(`Caption size set to ${size}`);
                }}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  textSize === size
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {size === 'normal' ? 'A' : size === 'large' ? 'A+' : 'A++'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          🔊 Text to Voice
        </h2>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type text here to convert to speech..."
          className="input-field h-32 resize-none"
          aria-label="Text input for speech synthesis"
        />

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSpeak}
            disabled={!inputText.trim() || isSpeaking}
            className="btn-primary flex-1 disabled:opacity-50"
            aria-label="Speak text"
          >
            {isSpeaking ? '🔊 Speaking...' : '🔊 Speak'}
          </button>
          
          {isSpeaking && (
            <button
              onClick={stop}
              className="btn-secondary"
              aria-label="Stop speaking"
            >
              ⏹️
            </button>
          )}
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Language: {language === 'ta-IN' ? 'Tamil' : 'English'}
          </p>
        </div>
      </div>

      <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>Tap microphone to convert speech to text, or type to convert text to speech</p>
      </div>
    </div>
  );
}