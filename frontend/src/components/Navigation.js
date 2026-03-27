import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAccessibility } from '../context/AccessibilityContext';

const navItems = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/camera', label: 'Camera', icon: '📷' },
  { path: '/voice', label: 'Voice', icon: '🎤' },
  { path: '/navigation', label: 'Navigate', icon: '🧭' },
  { path: '/settings', label: 'Settings', icon: '⚙️' }
];

export default function Navigation() {
  const location = useLocation();
  const { theme, toggleTheme, speak, vibrate } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (label) => {
    speak(label);
    vibrate(50);
  };

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    speak(`Switched to ${newTheme} mode`);
    vibrate(100);
    toggleTheme();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 shadow-lg border-b border-gray-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link 
            to="/" 
            className="flex items-center space-x-2"
            onClick={() => handleNavClick('Home')}
            aria-label="VisionVoice AI Home"
          >
            <div className="flex items-center gap-2">
              <img 
                src="/logo.svg" 
                alt="VisionVoice AI Logo" 
                className="h-10 w-10 object-contain"
              />
              <span className="text-xl font-bold text-primary dark:text-primary-light">
                VisionVoice AI
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => handleNavClick(item.label)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 
                  ${location.pathname === item.path 
                    ? 'bg-primary text-white' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-primary/10'
                  }`}
                aria-current={location.pathname === item.path ? 'page' : undefined}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleThemeToggle}
              className="btn-icon bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              onMouseEnter={() => speak(theme === 'light' ? 'Dark mode' : 'Light mode')}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            <button
              className="md:hidden btn-icon bg-primary text-white"
              onClick={() => {
                setIsOpen(!isOpen);
                speak(isOpen ? 'Menu closed' : 'Menu open');
              }}
              aria-label="Toggle menu"
            >
              {isOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-slate-700">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  handleNavClick(item.label);
                  setIsOpen(false);
                }}
                className={`block px-4 py-3 rounded-xl font-medium transition-all duration-200 
                  ${location.pathname === item.path 
                    ? 'bg-primary text-white' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-primary/10'
                  }`}
              >
                <span className="mr-3 text-xl">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}