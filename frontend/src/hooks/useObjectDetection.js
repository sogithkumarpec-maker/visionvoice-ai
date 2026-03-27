import { useState, useCallback, useRef, useEffect } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { useAccessibility } from '../context/AccessibilityContext';

export function useObjectDetection() {
  const { speak, voiceEnabled } = useAccessibility();
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [model, setModel] = useState(null);
  const [detections, setDetections] = useState([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);
  const lastSpokenRef = useRef('');

  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await cocoSsd.load();
        setModel(loadedModel);
        setIsModelLoading(false);
      } catch (err) {
        setError('Failed to load object detection model');
        setIsModelLoading(false);
        setIsSupported(false);
      }
    };

    loadModel();
  }, []);

  const startCamera = useCallback(async (videoElement) => {
    if (!videoElement) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      videoElement.srcObject = stream;
      videoRef.current = videoElement;
      
      await videoElement.play();
    } catch (err) {
      setError('Camera permission denied');
      speak('Camera permission denied. Please allow camera access.');
    }
  }, [speak]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    setIsDetecting(false);
  }, []);

  const detectObjects = useCallback(async () => {
    if (!model || !videoRef.current || !isDetecting) return;

    try {
      const predictions = await model.detect(videoRef.current);
      setDetections(predictions);

      if (predictions.length > 0 && voiceEnabled) {
        const labels = [...new Set(predictions.map(p => p.class))];
        const newLabels = labels.join(', ');
        
        if (newLabels !== lastSpokenRef.current) {
          lastSpokenRef.current = newLabels;
          const announcement = `${predictions.length} object${predictions.length > 1 ? 's' : ''} detected: ${newLabels}`;
          speak(announcement);
        }
      }

      if (isDetecting) {
        animationRef.current = requestAnimationFrame(detectObjects);
      }
    } catch (err) {
      console.error('Detection error:', err);
    }
  }, [model, isDetecting, speak, voiceEnabled]);

  const startDetection = useCallback(() => {
    if (!model || !videoRef.current) return;
    setIsDetecting(true);
    detectObjects();
  }, [model, detectObjects]);

  const stopDetection = useCallback(() => {
    setIsDetecting(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setDetections([]);
    lastSpokenRef.current = '';
  }, []);

  const switchCamera = useCallback(async () => {
    if (!videoRef.current) return;
    
    const currentTrack = streamRef.current?.getTracks()[0];
    const currentFacingMode = currentTrack?.getSettings().facingMode;
    const newFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';

    stopCamera();
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacingMode }
      });
      
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    } catch (err) {
      setError('Failed to switch camera');
    }
  }, [stopCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    isModelLoading,
    model,
    detections,
    isDetecting,
    error,
    isSupported,
    videoRef,
    startCamera,
    stopCamera,
    startDetection,
    stopDetection,
    switchCamera
  };
}