export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg) => deg * (Math.PI / 180);

export const getDirection = (bearing) => {
  const directions = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest'];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
};

export const detectLanguageCode = (lang) => {
  const codes = {
    'English': 'en-US',
    'Tamil': 'ta-IN'
  };
  return codes[lang] || 'en-US';
};

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export const isSpeechSupported = () => {
  return 'speechSynthesis' in window && 'SpeechRecognition' in window;
};

export const isGeolocationSupported = () => {
  return 'geolocation' in navigator;
};

export const requestCamera = async (facingMode = 'environment') => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode }
    });
    return stream;
  } catch (error) {
    throw new Error('Camera permission denied');
  }
};

export const requestMicrophone = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true
    });
    return stream;
  } catch (error) {
    throw new Error('Microphone permission denied');
  }
};

export const requestLocation = () => {
  return new Promise((resolve, reject) => {
    if (!isGeolocationSupported()) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
  });
};