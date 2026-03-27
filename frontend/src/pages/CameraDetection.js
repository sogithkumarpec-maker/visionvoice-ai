import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';
import { useAccessibility } from '../context/AccessibilityContext';

const objectMappings = {
  'cell phone': { friendly: 'mobile phone', category: 'electronics', description: 'A mobile phone is nearby' },
  'laptop': { friendly: 'laptop computer', category: 'electronics', description: 'A laptop is in front of you' },
  'tv': { friendly: 'television', category: 'electronics', description: 'A TV or screen is visible' },
  'keyboard': { friendly: 'keyboard', category: 'electronics', description: 'A computer keyboard detected' },
  'mouse': { friendly: 'computer mouse', category: 'electronics', description: 'A mouse is nearby' },
  'remote': { friendly: 'remote control', category: 'electronics', description: 'A remote control is nearby' },
  'computer': { friendly: 'computer', category: 'electronics', description: 'A computer is visible' },
  'book': { friendly: 'book', category: 'exam', description: 'A book is nearby' },
  'notebook': { friendly: 'notebook', category: 'exam', description: 'A notebook is detected' },
  'pen': { friendly: 'pen', category: 'exam', description: 'A pen is nearby' },
  'pencil': { friendly: 'pencil', category: 'exam', description: 'A pencil is nearby' },
  'paper': { friendly: 'paper', category: 'exam', description: 'Paper is detected' },
  'backpack': { friendly: 'bag', category: 'exam', description: 'A bag or backpack detected' },
  'scissors': { friendly: 'scissors', category: 'exam', description: 'Scissors detected' },
  'ruler': { friendly: 'ruler', category: 'exam', description: 'A ruler is nearby' },
  'eraser': { friendly: 'eraser', category: 'exam', description: 'An eraser is nearby' },
  'cup': { friendly: 'cup', category: 'personal', description: 'A cup is in view' },
  'bottle': { friendly: 'water bottle', category: 'personal', description: 'A water bottle detected' },
  'bowl': { friendly: 'bowl', category: 'personal', description: 'A bowl is detected' },
  'spoon': { friendly: 'spoon', category: 'personal', description: 'A spoon is nearby' },
  'fork': { friendly: 'fork', category: 'personal', description: 'A fork is nearby' },
  'knife': { friendly: 'knife', category: 'personal', description: 'A knife is nearby' },
  'chair': { friendly: 'chair', category: 'furniture', description: 'A chair is nearby' },
  'dining table': { friendly: 'table', category: 'furniture', description: 'A table is in front of you' },
  'couch': { friendly: 'sofa', category: 'furniture', description: 'A sofa or couch detected' },
  'bed': { friendly: 'bed', category: 'furniture', description: 'A bed is visible' },
  'toilet': { friendly: 'toilet', category: 'bathroom', description: 'Toilet detected' },
  'sink': { friendly: 'sink', category: 'bathroom', description: 'A sink is visible' },
  'person': { friendly: 'person', category: 'people', description: 'A person is nearby' },
  'handbag': { friendly: 'handbag', category: 'personal', description: 'A handbag nearby' },
  'tie': { friendly: 'tie', category: 'clothing', description: 'A tie detected' },
  'suitcase': { friendly: 'suitcase', category: 'travel', description: 'A suitcase is nearby' },
  'vase': { friendly: 'vase', category: 'decor', description: 'A vase is visible' },
  'clock': { friendly: 'clock', category: 'decor', description: 'A clock is visible' },
  'teddy bear': { friendly: 'teddy bear', category: 'toy', description: 'A teddy bear is nearby' },
  'sports ball': { friendly: 'ball', category: 'sport', description: 'A ball is nearby' },
  'apple': { friendly: 'apple', category: 'food', description: 'An apple is detected' },
  'orange': { friendly: 'orange', category: 'food', description: 'An orange is detected' },
  'banana': { friendly: 'banana', category: 'food', description: 'A banana is detected' },
  'sandwich': { friendly: 'food', category: 'food', description: 'Food is detected' },
  'pizza': { friendly: 'pizza', category: 'food', description: 'Pizza is detected' },
  'cake': { friendly: 'cake', category: 'food', description: 'Cake is detected' }
};

const objectCategories = {
  electronics: { label: 'Electronic Devices', icon: '💻', priority: 1 },
  exam: { label: 'Exam/Study Items', icon: '📝', priority: 2 },
  furniture: { label: 'Furniture', icon: '🪑', priority: 3 },
  personal: { label: 'Personal Items', icon: '🎒', priority: 4 },
  bathroom: { label: 'Bathroom', icon: '🚿', priority: 5 },
  people: { label: 'People', icon: '👤', priority: 6 },
  clothing: { label: 'Clothing', icon: '👔', priority: 7 },
  travel: { label: 'Travel Items', icon: '🧳', priority: 8 },
  food: { label: 'Food', icon: '🍎', priority: 9 },
  decor: { label: 'Decor', icon: '🖼️', priority: 10 },
  sport: { label: 'Sports', icon: '⚽', priority: 11 },
  toy: { label: 'Toys', icon: '🧸', priority: 12 }
};

export default function CameraDetection() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  
  const [model, setModel] = useState(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [detections, setDetections] = useState([]);
  const [groupedDetections, setGroupedDetections] = useState({});
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState(null);
  const [errorShown, setErrorShown] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  
  const streamRef = useRef(null);
  const animationRef = useRef(null);
  const lastSpokenRef = useRef('');
  const lastSpokenTimeRef = useRef(0);
  
  const { speak, vibrate, voiceEnabled } = useAccessibility();

  const loadModel = useCallback(async () => {
    try {
      const loadedModel = await cocoSsd.load();
      setModel(loadedModel);
      setIsModelLoading(false);
      speak('AI model loaded');
    } catch (err) {
      setError('Failed to load AI model: ' + err.message);
      setIsModelLoading(false);
    }
  }, [speak]);

  const startCamera = useCallback(async () => {
    setError(null);
    
    try {
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
        setErrorShown(false);
      }
    } catch (err) {
      let errorMessage;
      const errorMessages = {
        'NotAllowedError': 'Camera permission denied. Please allow camera access in browser settings.',
        'NotFoundError': 'No camera found. Please connect a camera.',
        'NotReadableError': 'Camera is being used by another application.',
        'OverconstrainedError': 'Camera does not support required settings.'
      };
      
      errorMessage = errorMessages[err.name] || 'Unable to access camera: ' + err.message;
      
      if (!errorShown) {
        speak(errorMessage);
        setErrorShown(true);
      }
      setError(errorMessage);
    }
  }, [speak, errorShown]);

  const detectObjects = useCallback(async () => {
    if (!model || !videoRef.current || !isDetecting) return;

    try {
      const predictions = await model.detect(videoRef.current);
      
      const filteredPredictions = predictions.filter(p => p.score > 0.5);
      setDetections(filteredPredictions);

      const grouped = {};
      const uniqueFriendlyNames = [];
      
      filteredPredictions.forEach(pred => {
        const mapping = objectMappings[pred.class];
        const category = mapping ? mapping.category : 'other';
        const friendlyName = mapping ? mapping.friendly : pred.class;
        
        if (!uniqueFriendlyNames.includes(friendlyName)) {
          uniqueFriendlyNames.push(friendlyName);
        }
        
        if (!grouped[category]) {
          grouped[category] = [];
        }
        grouped[category].push({
          ...pred,
          friendly: friendlyName,
          description: mapping ? mapping.description : `${pred.class} detected`
        });
      });
      setGroupedDetections(grouped);

      if (filteredPredictions.length > 0 && voiceEnabled) {
        const currentObjectsJSON = JSON.stringify(uniqueFriendlyNames.sort());
        const now = Date.now();
        
        if (currentObjectsJSON !== lastSpokenRef.current && now - lastSpokenTimeRef.current > 3000) {
          lastSpokenRef.current = currentObjectsJSON;
          lastSpokenTimeRef.current = now;
          
          let announcement;
          
          if (uniqueFriendlyNames.length === 1) {
            announcement = `Detected: ${uniqueFriendlyNames[0]}`;
          } else if (uniqueFriendlyNames.length === 2) {
            announcement = `Detected: ${uniqueFriendlyNames[0]} and ${uniqueFriendlyNames[1]}`;
          } else if (uniqueFriendlyNames.length === 3) {
            announcement = `Detected: ${uniqueFriendlyNames[0]}, ${uniqueFriendlyNames[1]}, and ${uniqueFriendlyNames[2]}`;
          } else {
            announcement = `Multiple objects: ${uniqueFriendlyNames.slice(0, 3).join(', ')}, and more`;
          }
          
          speak(announcement, false);
        }
      }

      if (isDetecting) {
        animationRef.current = requestAnimationFrame(detectObjects);
      }
    } catch (err) {
      console.error('Detection error:', err);
    }
  }, [model, isDetecting, speak, voiceEnabled]);

  useEffect(() => {
    loadModel();
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [loadModel]);

  useEffect(() => {
    if (!isModelLoading && !cameraReady && !error) {
      startCamera();
    }
  }, [isModelLoading, cameraReady, error, startCamera]);

  useEffect(() => {
    if (isDetecting && model) {
      detectObjects();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isDetecting, model, detectObjects]);

  const handleStartDetection = () => {
    if (!model) {
      speak('Model not loaded yet');
      return;
    }
    setIsDetecting(true);
    speak('Object detection started');
    vibrate(100);
  };

  const handleStopDetection = () => {
    setIsDetecting(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    speak('Object detection stopped');
    vibrate(100);
  };

  const handleSwitchCamera = useCallback(async () => {
    if (!videoRef.current) return;
    
    const currentTrack = streamRef.current?.getTracks()[0];
    const currentFacingMode = currentTrack?.getSettings().facingMode;
    const newFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacingMode, width: { ideal: 640 }, height: { ideal: 480 } }
      });
      
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      speak('Camera switched');
    } catch (err) {
      setError('Failed to switch camera');
    }
  }, [speak]);

  const handleRetryCamera = useCallback(() => {
    setErrorShown(false);
    setError(null);
    startCamera();
  }, [startCamera]);

  const handleBack = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsDetecting(false);
    navigate('/');
    speak('Going back to home');
  };

  if (isModelLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="text-6xl mb-4 animate-bounce">📷</div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Loading AI Model...
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Please wait while we prepare object detection
        </p>
        <div className="w-64 h-3 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-primary animate-pulse" style={{ width: '60%' }}></div>
        </div>
      </div>
    );
  }

  if (error && !cameraReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <div className="text-6xl mb-4">📷</div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Camera Not Available
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-md">{error}</p>
        
        <div className="space-y-3">
          <button onClick={handleRetryCamera} className="btn-primary">
            🔄 Try Again
          </button>
          
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            <p>Tips:</p>
            <ul className="list-disc list-inside mt-2">
              <li>Allow camera in browser settings</li>
              <li>Close other camera apps</li>
              <li>Use HTTPS or localhost</li>
            </ul>
          </div>
          
          <button onClick={handleBack} className="btn-secondary mt-4">
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
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
          Object Detection
        </h1>
        
        <div className="w-20"></div>
      </div>

      <div className="relative bg-black rounded-2xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          autoPlay
        />
        
        {cameraReady && detections.map((detection, index) => (
          <div
            key={index}
            className="absolute border-4 border-primary rounded-lg"
            style={{
              left: `${(detection.bbox[0] / videoRef.current?.videoWidth) * 100}%`,
              top: `${(detection.bbox[1] / videoRef.current?.videoHeight) * 100}%`,
              width: `${(detection.bbox[2] / videoRef.current?.videoWidth) * 100}%`,
              height: `${(detection.bbox[3] / videoRef.current?.videoHeight) * 100}%`
            }}
          >
            <div className="absolute -top-8 left-0 bg-primary text-white px-2 py-1 rounded text-sm font-medium whitespace-nowrap">
              {objectMappings[detection.class]?.friendly || detection.class} {Math.round(detection.score * 100)}%
            </div>
          </div>
        ))}

        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-2 rounded-lg">
          {isDetecting ? (
            <span className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Detecting
            </span>
          ) : (
            <span>Paused</span>
          )}
        </div>

        {Object.keys(groupedDetections).length > 0 && (
          <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white px-4 py-3 rounded-xl max-h-24 overflow-y-auto">
            <div className="flex flex-wrap gap-1">
              {Object.entries(groupedDetections).slice(0, 3).map(([category, items]) => (
                <span key={category} className="inline-flex items-center bg-white/20 px-2 py-1 rounded text-xs">
                  {objectCategories[category]?.icon || '📦'} {items[0].friendly}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl">
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-4">
        {isDetecting ? (
          <button
            onClick={handleStopDetection}
            className="btn-primary bg-red-500 hover:bg-red-600"
            aria-label="Stop detection"
          >
            ⏹️ Stop Detection
          </button>
        ) : (
          <button
            onClick={handleStartDetection}
            className="btn-primary"
            aria-label="Start detection"
            disabled={!cameraReady}
          >
            ▶️ Start Detection
          </button>
        )}

        <button
          onClick={handleSwitchCamera}
          className="btn-secondary"
          aria-label="Switch camera"
        >
          🔄 Switch Camera
        </button>
      </div>

      <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>Point your camera at objects to detect them</p>
      </div>
    </div>
  );
}
