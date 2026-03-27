# VisionAssist AI - Specification Document

## 1. Project Overview

**Project Name:** VisionAssist AI
**Type:** Full-stack web application (React + Node.js)
**Core Functionality:** Accessibility application for blind and deaf users featuring object detection, voice recognition, text-to-speech, and navigation assistance.
**Target Users:** Visually impaired and hearing-impaired individuals

---

## 2. UI/UX Specification

### Layout Structure

**Global Layout:**
- Fixed top navigation bar (60px height)
- Main content area with padding
- Bottom action bar for mobile (80px)
- All interactive elements minimum 48x48px touch target

**Pages:**
1. Home Page - Feature grid (2x2 on desktop, stacked on mobile)
2. Camera Detection - Full viewport camera with overlay
3. Voice Subtitle - Large caption display area
4. Navigation - Map view with voice directions
5. Settings - Form-based settings list

**Responsive Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Visual Design

**Color Palette:**
```
Light Mode:
- Background: #F8FAFC
- Surface: #FFFFFF
- Primary: #6366F1 (Indigo)
- Primary Dark: #4F46E5
- Secondary: #10B981 (Emerald)
- Accent: #F59E0B (Amber)
- Text Primary: #1E293B
- Text Secondary: #64748B
- Error: #EF4444
- Success: #22C55E
- Border: #E2E8F0

Dark Mode:
- Background: #0F172A
- Surface: #1E293B
- Primary: #818CF8
- Text Primary: #F1F5F9
- Text Secondary: #94A3B8
- Border: #334155
```

**Typography:**
- Font Family: 'Inter', system-ui, sans-serif
- Headings: 
  - H1: 36px, font-weight: 700
  - H2: 28px, font-weight: 600
  - H3: 22px, font-weight: 600
- Body: 18px, font-weight: 400, line-height: 1.6
- Large Body (captions): 28px, font-weight: 500
- Small: 14px

**Spacing System:**
- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96

**Visual Effects:**
- Border radius: 12px (buttons), 16px (cards), 24px (modals)
- Shadows: 0 4px 6px -1px rgba(0,0,0,0.1)
- Transitions: 200ms ease-out
- Focus ring: 3px solid primary with 2px offset

### Components

**Navigation:**
- Logo with app name
- Nav links (desktop)
- Hamburger menu (mobile)
- Theme toggle button

**Buttons:**
- Primary: Filled with primary color, white text
- Secondary: Outlined with border
- Large: 56px height, 24px padding
- Icon buttons: 56x56px with centered icon
- States: default, hover (scale 1.02), active (scale 0.98), disabled (opacity 0.5)

**Cards:**
- White/dark surface background
- 16px padding
- Feature icon (48x48)
- Title and description
- Tap/click sound feedback

**Input Fields:**
- Height: 56px
- Large font (18px)
- Clear labels with ARIA
- Error states with voice feedback

**Camera Overlay:**
- Semi-transparent bounding boxes
- Labels with high contrast background
- Detection confidence percentage

**Subtitle Display:**
- Full-width text area
- Auto-scrolling
- Timestamp indicators
- High contrast text (white on black)

---

## 3. Functionality Specification

### Feature 1: Object Detection (Camera)

**Core Functionality:**
- Access device camera (rear preferred, fallback to front)
- Real-time object detection using TensorFlow.js COCO-SSD model
- Display bounding boxes with labels
- Convert detected labels to speech via Web Speech API
- Configurable detection interval (default: 3 seconds)

**User Interactions:**
- Start/Stop detection button
- Toggle voice output
- Capture screenshot (optional)
- Switch camera (front/back)

**Edge Cases:**
- Camera permission denied → Show instruction modal
- Model loading → Show loading spinner with voice
- No objects detected → Voice "No objects found"
- Poor lighting → Show warning message

### Feature 2: Voice to Text (Speech Recognition)

**Core Functionality:**
- Microphone access via Web Speech API
- Real-time speech-to-text conversion
- Display large, readable subtitles
- Auto-scroll to latest caption
- Language detection (English primary)

**User Interactions:**
- Start/Stop listening button
- Clear captions button
- Copy text button
- Font size adjustment (Normal/Large/Extra Large)

**Edge Cases:**
- No speech detected → Show "Listening..." state
- API not supported → Show browser compatibility message
- Multiple speakers → Best effort transcription

### Feature 3: Text to Voice (TTS)

**Core Functionality:**
- Convert typed text to speech
- Language selection: English (en-US), Tamil (ta-IN)
- Adjustable speech rate (0.5x to 2x)
- Adjustable volume (0 to 100%)
- Queue multiple texts

**User Interactions:**
- Text input field (large, accessible)
- Speak button
- Stop button
- Language dropdown
- Speed slider
- Volume slider

**Edge Cases:**
- Empty text → Show validation message
- Browser doesn't support Tamil → Fallback to English
- Speech synthesis error → Show retry option

### Feature 4: Navigation Assistant

**Core Functionality:**
- Get user location via Geolocation API
- Display position on map (OpenStreetMap via Leaflet)
- Calculate distance to saved locations
- Voice directions for navigation

**User Interactions:**
- Get current location button
- Save current location (with name)
- Select destination from saved locations
- Start navigation
- Stop navigation

**Edge Cases:**
- Location permission denied → Show instructions
- GPS unavailable → Show error with retry
- No saved locations → Show "Add location" prompt

### Feature 5: Settings

**Core Functionality:**
- Language preference (English/Tamil)
- Theme toggle (Light/Dark)
- Voice settings (rate, volume, voice)
- High contrast mode
- Text size adjustment
- Emergency contact configuration

**User Interactions:**
- Toggle switches
- Slider inputs
- Form inputs
- Save/Reset buttons

### Accessibility Enhancements

**Voice Feedback:**
- All buttons speak their function on click
- Navigation announcements
- Error state vocalization
- Success confirmations

**Keyboard Navigation:**
- Full keyboard support
- Tab order optimization
- Enter/Space activation
- Escape to close modals

**Screen Reader:**
- ARIA labels on all elements
- Live regions for dynamic content
- Descriptive button text
- Form field associations

**Mobile Features:**
- Haptic feedback (vibration API)
- Touch-friendly targets (48px minimum)
- Orientation support (portrait/landscape)

---

## 4. Technical Architecture

### Frontend Structure
```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   ├── Navigation/
│   │   ├── Camera/
│   │   ├── Speech/
│   │   ├── Navigation/
│   │   └── Settings/
│   ├── pages/
│   │   ├── Home.js
│   │   ├── CameraDetection.js
│   │   ├── VoiceSubtitle.js
│   │   ├── Navigation.js
│   │   └── Settings.js
│   ├── context/
│   │   └── AccessibilityContext.js
│   ├── hooks/
│   │   ├── useSpeechRecognition.js
│   │   ├── useSpeechSynthesis.js
│   │   └── useObjectDetection.js
│   ├── utils/
│   │   └── helpers.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
└── tailwind.config.js
```

### Backend Structure
```
backend/
├── server.js
├── package.json
└── routes/
    └── api.js
```

---

## 5. Acceptance Criteria

### Home Page
- [ ] Displays 4 feature cards with icons
- [ ] Cards are clickable and navigate to correct pages
- [ ] Theme toggle works
- [ ] All buttons have voice feedback

### Camera Detection
- [ ] Camera stream displays
- [ ] Objects detected with bounding boxes
- [ ] Detected labels spoken aloud
- [ ] Start/Stop controls work

### Voice Subtitle
- [ ] Microphone permission requested
- [ ] Speech converted to text in real-time
- [ ] Text displayed in large, readable format
- [ ] Clear and copy functions work

### Text to Voice
- [ ] Text input accepts typed text
- [ ] Converted to speech on button click
- [ ] Language, speed, volume adjustable
- [ ] Stop button halts speech

### Navigation
- [ ] Geolocation permission requested
- [ ] Current location displayed on map
- [ ] Can save locations
- [ ] Voice directions provided

### Settings
- [ ] Theme toggle switches light/dark
- [ ] Language selection persists
- [ ] Voice settings adjustable
- [ ] High contrast mode toggles

### Accessibility
- [ ] All pages pass accessibility audit
- [ ] Keyboard navigation works throughout
- [ ] Voice feedback on all interactions
- [ ] Mobile responsive at all breakpoints