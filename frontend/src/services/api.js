// ============================================
// VisionVoice AI - API Service
// Connects frontend with backend server
// ============================================

const API_BASE = process.env.REACT_APP_API_URL || 'https://visionvoice-ai-production.up.railway.app';
console.log("Using API:", API_BASE);

// ============================================
// Test API Connection
// ============================================

export const testAPI = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/test`);
    const data = await response.json();
    console.log('API Test Response:', data);
    return { success: true, data };
  } catch (error) {
    console.error('API Test Error:', error.message);
    return { success: false, error: error.message };
  }
};

// ============================================
// Health Check
// ============================================

export const checkHealth = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/health`);
    const data = await response.json();
    console.log('Health Check Response:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Health Check Error:', error.message);
    return { success: false, error: error.message };
  }
};

// ============================================
// Navigation API
// ============================================

export const getLocations = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/locations`);
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Get Locations Error:', error.message);
    return { success: false, error: error.message };
  }
};

export const saveLocation = async (name, latitude, longitude) => {
  try {
    const response = await fetch(`${API_BASE}/api/locations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, latitude, longitude })
    });
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Save Location Error:', error.message);
    return { success: false, error: error.message };
  }
};

// ============================================
// Navigation Route (for future AI integration)
// ============================================

export const calculateRoute = async (currentLat, currentLng, destinationLat, destinationLng) => {
  try {
    const response = await fetch(`${API_BASE}/api/navigation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentLat, currentLng, destinationLat, destinationLng })
    });
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Calculate Route Error:', error.message);
    return { success: false, error: error.message };
  }
};

// ============================================
// Object Detection (for future AI integration)
// ============================================

export const detectObjects = async (imageData) => {
  try {
    const response = await fetch(`${API_BASE}/api/object-detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageData })
    });
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Object Detection Error:', error.message);
    return { success: false, error: error.message };
  }
};