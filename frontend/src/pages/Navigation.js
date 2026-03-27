import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAccessibility } from '../context/AccessibilityContext';
import { requestLocation, calculateDistance } from '../utils/helpers';

const defaultLocation = [51.505, -0.09];
const savedIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapCenter({ center }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, 15);
    }
  }, [center, map]);
  
  return null;
}

export default function Navigation() {
  const navigate = useNavigate();
  const { speak, vibrate } = useAccessibility();
  
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locations, setLocations] = useState(() => {
    try {
      const saved = localStorage.getItem('visionassist-locations');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [error, setError] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('visionassist-locations', JSON.stringify(locations));
    } catch (e) {
      console.error('Failed to save locations:', e);
    }
  }, [locations]);

  const handleGetLocation = useCallback(async () => {
    try {
      speak('Getting your location');
      const position = await requestLocation();
      const loc = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      setCurrentLocation(loc);
      setError(null);
      speak('Location found. You are at latitude ' + Math.round(loc.lat * 100) / 100 + ', longitude ' + Math.round(loc.lng * 100) / 100);
      vibrate(200);
    } catch (err) {
      setError(err.message);
      speak('Could not get location. Please enable location services.');
    }
  }, [speak, vibrate]);

  const handleSaveLocation = useCallback(() => {
    if (!currentLocation || !locationName.trim()) return;
    
    const newLocation = {
      id: Date.now(),
      name: locationName.trim().substring(0, 50),
      lat: currentLocation.lat,
      lng: currentLocation.lng
    };
    
    setLocations(prev => [...prev, newLocation]);
    setLocationName('');
    setShowSaveModal(false);
    speak(`Saved ${newLocation.name} to your locations`);
    vibrate(100);
  }, [currentLocation, locationName, speak, vibrate]);

  const handleDeleteLocation = useCallback((id) => {
    setLocations(prev => prev.filter(loc => loc.id !== id));
    setShowDeleteConfirm(null);
    speak('Location deleted');
    vibrate(50);
  }, [speak, vibrate]);

  const handleStartNavigation = useCallback((location) => {
    setSelectedDestination(location);
    setIsNavigating(true);
    speak(`Starting navigation to ${location.name}`);
    vibrate(100);
  }, [speak, vibrate]);

  const handleStopNavigation = useCallback(() => {
    setIsNavigating(false);
    setSelectedDestination(null);
    speak('Navigation stopped');
    vibrate(100);
  }, [speak, vibrate]);

  const handleBack = useCallback(() => {
    navigate('/');
    speak('Going back to home');
  }, [navigate, speak]);

  const getDistance = useCallback(() => {
    if (!currentLocation || !selectedDestination) return null;
    return calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      selectedDestination.lat,
      selectedDestination.lng
    );
  }, [currentLocation, selectedDestination]);

  const distance = getDistance();

  useEffect(() => {
    if (isNavigating && distance !== null) {
      if (distance < 0.05) {
        speak('You have arrived at your destination');
        setIsNavigating(false);
      } else if (distance < 0.5) {
        speak(`You are ${Math.round(distance * 1000)} meters away from ${selectedDestination.name}`);
      } else {
        speak(`${Math.round(distance)} kilometers to ${selectedDestination.name}`);
      }
    }
  }, [isNavigating, distance, selectedDestination, speak]);

  return (
    <div className="page-container space-y-4">
      <div className="page-header">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-300"
          aria-label="Go back"
        >
          <span className="text-2xl">←</span>
          <span className="text-lg">Back</span>
        </button>
        
        <h1 className="page-title">
          Navigation
        </h1>
        
        <div className="w-16"></div>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl">
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="card">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={handleGetLocation}
            className="btn-primary flex-1 min-w-[140px]"
            aria-label="Get current location"
          >
            📍 Get My Location
          </button>
          
          {currentLocation && (
            <button
              onClick={() => setShowSaveModal(true)}
              className="btn-secondary"
              aria-label="Save current location"
            >
              💾 Save
            </button>
          )}
        </div>

        {currentLocation && (
          <div className="text-sm text-gray-600 dark:text-gray-300">
            <p>📍 Lat: {currentLocation.lat.toFixed(4)}, Lng: {currentLocation.lng.toFixed(4)}</p>
          </div>
        )}
      </div>

      <div className="h-[300px] rounded-2xl overflow-hidden">
        <MapContainer
          center={currentLocation || defaultLocation}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {currentLocation && (
            <>
              <MapCenter center={[currentLocation.lat, currentLocation.lng]} />
              <Marker position={[currentLocation.lat, currentLocation.lng]}>
                <Popup>You are here</Popup>
              </Marker>
            </>
          )}
          
          {locations.map((location) => (
            <Marker
              key={location.id}
              position={[location.lat, location.lng]}
              icon={savedIcon}
            >
              <Popup>
                <div className="text-center p-1">
                  <p className="font-bold">{location.name}</p>
                  <button
                    onClick={() => handleStartNavigation(location)}
                    className="mt-2 text-primary hover:underline text-sm"
                  >
                    Navigate
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {isNavigating && selectedDestination && (
        <div className="card bg-primary/10 border-2 border-primary">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            🧭 Navigating to {selectedDestination.name}
          </h3>
          {distance !== null && (
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Distance: {distance < 1 
                ? `${Math.round(distance * 1000)} meters` 
                : `${distance.toFixed(1)} km`
              }
            </p>
          )}
          <button
            onClick={handleStopNavigation}
            className="mt-4 btn-secondary"
          >
            ⏹️ Stop Navigation
          </button>
        </div>
      )}

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Saved Locations ({locations.length})
        </h3>
        
        {locations.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            No saved locations. Get your location and save it.
          </p>
        ) : (
          <div className="space-y-2">
            {locations.map((location) => (
              <div
                key={location.id}
                className="flex items-center justify-between p-3 bg-gray-100 dark:bg-slate-700 rounded-xl"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {location.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </p>
                </div>
                <div className="flex gap-2 ml-2">
                  <button
                    onClick={() => handleStartNavigation(location)}
                    className="btn-icon bg-primary text-white"
                    aria-label={`Navigate to ${location.name}`}
                  >
                    🧭
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(location.id)}
                    className="btn-icon bg-red-500 text-white"
                    aria-label={`Delete ${location.name}`}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md animate-fade-in">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Save Location
            </h3>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Enter location name"
              className="input-field mb-4"
              autoFocus
              maxLength={50}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveLocation}
                className="btn-primary flex-1"
                disabled={!locationName.trim()}
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setLocationName('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm animate-fade-in">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Delete Location?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Are you sure you want to delete this saved location?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteLocation(showDeleteConfirm)}
                className="btn-primary bg-red-500 hover:bg-red-600 flex-1"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
