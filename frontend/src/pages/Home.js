import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAccessibility } from '../context/AccessibilityContext';
import { testAPI, checkHealth } from '../services/api';

const features = [
  {
    id: 'camera',
    title: 'Object Detection',
    description: 'Use your camera to detect and identify objects in real-time with voice feedback',
    icon: '📷',
    path: '/camera',
    color: 'bg-indigo-500'
  },
  {
    id: 'voice',
    title: 'Voice to Text',
    description: 'Speak and see your words converted to text in real-time',
    icon: '🎤',
    path: '/voice',
    color: 'bg-emerald-500'
  },
  {
    id: 'navigation',
    title: 'Navigation',
    description: 'Get voice-guided directions and locate saved places',
    icon: '🧭',
    path: '/navigation',
    color: 'bg-amber-500'
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Customize voice, language, and accessibility options',
    icon: '⚙️',
    path: '/settings',
    color: 'bg-rose-500'
  }
];

export default function Home() {
  const { speak, vibrate, highContrast } = useAccessibility();
  const [apiStatus, setApiStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    const result = await checkHealth();
    setApiStatus(result);
  };

  const handleTestAPI = async () => {
    setIsLoading(true);
    speak('Testing backend connection');
    
    const result = await testAPI();
    
    if (result.success) {
      setApiStatus(result);
      speak('Backend connection successful');
    } else {
      speak('Backend not reachable');
    }
    
    setIsLoading(false);
    vibrate(100);
  };

  const handleFeatureClick = (title) => {
    speak(`Opening ${title}`);
    vibrate(50);
  };

  return (
    <div className="space-y-8">
      <header className="text-center py-8">
        <div className="flex justify-center mb-4">
          <img 
            src="/logo.svg" 
            alt="VisionVoice AI Logo" 
            className="w-32 h-32 object-contain animate-fade-in hover:scale-110 transition-transform duration-300"
          />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to VisionVoice AI
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Empowering accessibility through vision and voice
        </p>
      </header>

      <div className="card max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          🔌 Backend Connection Test
        </h2>
        
        <button
          onClick={handleTestAPI}
          disabled={isLoading}
          className="btn-primary w-full mb-4"
          aria-label="Test backend connection"
        >
          {isLoading ? '⏳ Testing...' : '🧪 Test Backend Connection'}
        </button>

        {apiStatus && (
          <div className={`p-4 rounded-xl ${
            apiStatus.success 
              ? 'bg-green-100 dark:bg-green-900/30 border border-green-400' 
              : 'bg-red-100 dark:bg-red-900/30 border border-red-400'
          }`}>
            {apiStatus.success ? (
              <>
                <p className="font-semibold text-green-700 dark:text-green-300">
                  ✅ Backend Connected!
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  {apiStatus.data?.message || 'API working perfectly'}
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold text-red-700 dark:text-red-300">
                  ❌ Backend not reachable
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {apiStatus.error || 'Unable to connect to backend server'}
                </p>
              </>
            )}
          </div>
        )}
      </div>

      <div className="card max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          🔊 Voice Test
        </h2>
        
        <button
          onClick={() => speak('Voice system is working. Click on any feature to get started.')}
          className="btn-primary w-full"
          aria-label="Test voice"
        >
          🔊 Test Voice
        </button>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
          Tap the button above to enable voice. Then explore features.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {features.map((feature) => (
          <Link
            key={feature.id}
            to={feature.path}
            onClick={() => handleFeatureClick(feature.title)}
            onMouseEnter={() => speak(feature.title)}
            className={`card hover:scale-102 transition-transform duration-200 cursor-pointer
              ${highContrast ? 'border-4 border-yellow-400' : ''}`}
            aria-label={feature.title}
          >
            <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center text-3xl mb-4`}>
              {feature.icon}
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              {feature.title}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {feature.description}
            </p>
          </Link>
        ))}
      </div>

      <section className="text-center py-8 bg-white dark:bg-slate-800 rounded-2xl max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => speak('Welcome to VisionVoice AI. This app helps blind and deaf users see, hear, and navigate independently. Choose a feature to get started.')}
            className="btn-primary"
            aria-label="Learn more about the app"
          >
            🎧 Hear App Info
          </button>
          <Link to="/settings" className="btn-secondary" onClick={() => speak('Opening settings')}>
            ⚙️ Customize
          </Link>
        </div>
      </section>
    </div>
  );
}