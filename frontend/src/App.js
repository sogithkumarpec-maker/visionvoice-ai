import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import CameraDetection from './pages/CameraDetection';
import VoiceSubtitle from './pages/VoiceSubtitle';
import Navigation from './pages/Navigation';
import Settings from './pages/Settings';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/camera" element={<CameraDetection />} />
        <Route path="/voice" element={<VoiceSubtitle />} />
        <Route path="/navigation" element={<Navigation />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
}

export default App;