# VisionVoice AI

<p align="center">
  <strong>Empowering accessibility through vision and voice</strong>
</p>

<p align="center">
  <a href="https://img.shields.io/badge/version-1.0.0-blue">
    <img src="https://img.shields.io/badge/version-1.0.0-blue" alt="Version">
  </a>
  <a href="https://img.shields.io/badge/license-MIT-green">
    <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
  </a>
  <a href="https://img.shields.io/badge/react-18.2-orange">
    <img src="https://img.shields.io/badge/react-18.2-orange" alt="React">
  </a>
  <a href="https://img.shields.io/badge/node.js-14+-blue">
    <img src="https://img.shields.io/badge/node.js-14+-blue" alt="Node.js">
  </a>
</p>

---

VisionVoice AI is a full-stack accessibility web application designed for **blind and visually impaired** and **deaf and hearing-impaired** users. It provides AI-powered object detection, speech recognition, text-to-speech conversion, and navigation assistance.

## Features

### 1. Object Detection (Camera)
- Real-time object detection using **TensorFlow.js** (COCO-SSD model)
- Bounding boxes with labels and confidence scores
- Voice output announcing detected objects
- Front/back camera switching
- Configurable detection interval

### 2. Voice to Text (Speech Recognition)
- Real-time speech-to-text using **Web Speech API**
- Large, readable captions for deaf users
- Adjustable font sizes (Normal, Large, Extra Large)
- Copy and clear text functionality

### 3. Text to Voice (Speech Synthesis)
- Convert typed text to natural speech
- **Multi-language support**: English (en-US), Tamil (ta-IN)
- Adjustable speech speed (0.5x - 2x)
- Volume control (0 - 100%)
- Queue multiple texts

### 4. Navigation Assistant
- Get current location using **Geolocation API**
- Interactive map using **OpenStreetMap** (Leaflet)
- Save and manage favorite locations
- Voice-guided navigation with distance announcements

### 5. Emergency SOS Button
- Fixed emergency button on all pages
- Quick access to emergency services (default: 112)
- Location announcement
- Vibration feedback

### 6. Accessibility Features
- Dark/Light theme toggle
- High contrast mode
- Voice feedback for all actions
- Haptic feedback (mobile)
- Large touch targets (48px minimum)
- Full keyboard navigation
- Screen reader compatible (ARIA labels)

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| Tailwind CSS | Styling |
| TensorFlow.js + COCO-SSD | Object Detection |
| Web Speech API | Speech Recognition & Synthesis |
| React Leaflet | Maps |
| React Router | Navigation |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express | Web Server |
| CORS | Cross-origin requests |

---

## Prerequisites

- **Node.js** (v14 or higher)
- **npm** or yarn
- Modern browser (Chrome, Edge, Firefox recommended)
- Camera and microphone access (for object detection and voice features)

---

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd web_appai
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

---

## Running the Application

### Option 1: Run servers separately (recommended)

**Terminal 1 - Start Backend:**
```bash
cd backend
npm start
```
Backend runs on: `http://localhost:5000`

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm start
```
App opens at: `http://localhost:3000`

### Option 2: Run both with concurrently

```bash
npm install -g concurrently

cd backend && npm install
cd ../frontend && npm install

concurrently --kill-others "cd ../backend && npm start" "cd frontend && npm start"
```

---

## Project Structure

```
web_appai/
├── backend/
│   ├── package.json
│   └── server.js              # Express API server
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── logo.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.js          # Main layout with voice unlock
│   │   │   ├── Navigation.js     # Navbar
│   │   │   └── EmergencyButton.js # SOS button
│   │   ├── context/
│   │   │   └── AccessibilityContext.js # Global state & speak
│   │   ├── hooks/
│   │   │   ├── useObjectDetection.js
│   │   │   ├── useSpeechRecognition.js
│   │   │   └── useSpeechSynthesis.js
│   │   ├── pages/
│   │   │   ├── Home.js            # Feature grid
│   │   │   ├── CameraDetection.js # Object detection
│   │   │   ├── VoiceSubtitle.js   # Speech to text
│   │   │   ├── Navigation.js      # GPS navigation
│   │   │   └── Settings.js        # App settings
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   └── helpers.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
├── SPEC.md                     # Detailed specification
└── README.md
```

---

## Usage Guide

### Home Page
- View all features as cards
- Toggle dark/light theme
- Access settings

### Camera Detection
1. Allow camera access when prompted
2. Click **"Start Detection"** to begin
3. Detected objects are announced via voice
4. Click **"Stop Detection"** to end
5. Use toggle to switch between front/back camera

### Voice Subtitle
1. Click microphone to start listening
2. Speak naturally - text appears in real-time
3. Adjust font size using the dropdown
4. Copy or clear text as needed

### Text to Voice
1. Type text in the input field
2. Select language (English/Tamil)
3. Adjust speed and volume sliders
4. Click **"Speak"** to convert text to speech

### Navigation
1. Click **"Get My Location"** to get current position
2. Save locations with custom names
3. Select a saved location to navigate
4. View distance and directions on the map

### Settings
- **Theme**: Toggle dark/light mode
- **Language**: English or Tamil
- **Voice**: Adjust speed and volume
- **High Contrast**: Enable for better visibility
- **Text Size**: Normal, Large, or Extra Large
- **Emergency Contact**: Set emergency phone number

---

## Browser Compatibility

| Feature | Chrome | Edge | Firefox | Safari |
|---------|--------|------|---------|--------|
| Object Detection | ✅ | ✅ | ✅ | ✅ |
| Speech Recognition | ✅ | ✅ | ✅ | ⚠️ Limited |
| Speech Synthesis | ✅ | ✅ | ✅ | ✅ |
| Geolocation | ✅ | ✅ | ✅ | ✅ |
| Camera Access | ✅ | ✅ | ✅ | ✅ |

> **Note**: For best experience, use Chrome or Edge. Safari has limited speech recognition support.

---

## Known Issues

1. **Camera Permissions**: Some browsers block camera in non-HTTPS environments. Use localhost or deploy with HTTPS.
2. **Speech Autoplay**: Browser autoplay policies require user interaction before speech plays. The app handles this by unlocking speech on first click.
3. **Safari Speech Recognition**: Web Speech API support is limited on Safari.
4. **TensorFlow.js Performance**: Object detection may be slower on older devices.

---

## Deployment

### Frontend (Vercel/Netlify)

1. Build the React app:
```bash
cd frontend
npm run build
```

2. Deploy the `build` folder to:
   - **Vercel**: `vercel deploy`
   - **Netlify**: Drag and drop the build folder

### Backend (Render/Railway)

1. Set environment variable:
   ```
   PORT=5000
   ```

2. Deploy to:
   - **Render**: Connect GitHub repository
   - **Railway**: Deploy from GitHub

### Production Configuration

Update `backend/server.js` CORS to allow your frontend domain:
```javascript
app.use(cors({
  origin: 'https://your-frontend.vercel.app',
  methods: ['GET', 'POST'],
  credentials: true
}));
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment (development/production) | `development` |

---

## Future Improvements

- [ ] More accurate AI object detection models
- [ ] Mobile app version (React Native)
- [ ] Offline support with Service Workers
- [ ] Multi-language expansion (more Indian languages)
- [ ] Real-time translation features
- [ ] Custom voice selection
- [ ] Object recognition history

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the **MIT License** - see the LICENSE file for details.

---

## Support

For issues, bugs, or questions:
- Open an issue on GitHub
- Email: support@visionvoice.ai

---

<p align="center">
  Made with ❤️ for accessibility
</p>
