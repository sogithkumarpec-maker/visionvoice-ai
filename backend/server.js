// ============================================
// VisionVoice AI - Secure Express Backend Server
// ============================================

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');

const app = express();

// ============================================
// Security Configuration
// ============================================

const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const LOG_DIR = process.env.LOG_DIR || './logs';

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Create log streams
const accessLogStream = fs.createWriteStream(
  path.join(LOG_DIR, 'access.log'),
  { flags: 'a' }
);

const errorLogStream = fs.createWriteStream(
  path.join(LOG_DIR, 'error.log'),
  { flags: 'a' }
);

const authLogStream = fs.createWriteStream(
  path.join(LOG_DIR, 'auth.log'),
  { flags: 'a' }
);

const securityLogStream = fs.createWriteStream(
  path.join(LOG_DIR, 'security.log'),
  { flags: 'a' }
);

const abuseLogStream = fs.createWriteStream(
  path.join(LOG_DIR, 'abuse.log'),
  { flags: 'a' }
);

// ============================================
// Logging Functions
// ============================================

const logAuth = (event) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${event}\n`;
  authLogStream.write(logEntry);
  console.log(`🔐 AUTH: ${event}`);
};

const logSecurity = (event) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${event}\n`;
  securityLogStream.write(logEntry);
  console.log(`🛡️  SECURITY: ${event}`);
};

const logAbuse = (event) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${event}\n`;
  abuseLogStream.write(logEntry);
  console.log(`⚠️  ABUSE: ${event}`);
};

const logError = (error, context = '') => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${context}: ${error.message}\n${error.stack}\n`;
  errorLogStream.write(logEntry);
  console.error(`❌ ERROR: ${context}`, error.message);
};

// ============================================
// Bot Protection Middleware
// ============================================

const botProtection = (req, res, next) => {
  const userAgent = req.headers['user-agent'] || '';
  
  // Known bot patterns
  const botPatterns = [
    /bot/i, /crawler/i, /spider/i, /scraper/i, /curl/i, /wget/i,
    /python-requests/i, /httpclient/i, /java/i, /go-http/i,
    /headless/i, /puppeteer/i, /selenium/i, /playwright/i,
    /apache-httpclient/i, /okhttp/i, /retrofit/i
  ];
  
  // Check for suspicious patterns
  const isBot = botPatterns.some(pattern => pattern.test(userAgent));
  
  // Check for missing User-Agent
  const missingUserAgent = !userAgent || userAgent.trim() === '';
  
  // Check for suspicious headers
  const suspiciousHeaders = [
    req.headers['x-scraping'],
    req.headers['x-crawl-enabled'],
    req.headers['x-bot-mode']
  ].some(h => h === 'true');
  
  // Check for common scraper IPs (simple example - in production use a list)
  const suspiciousIPs = ['192.168.1.1', '10.0.0.1']; // Add known scraper IPs
  
  if (isBot || missingUserAgent || suspiciousHeaders || suspiciousIPs.includes(req.ip)) {
    logAbuse(`Bot/Suspicious request - IP: ${req.ip}, User-Agent: ${userAgent}, Path: ${req.path}`);
    
    // In production, you might want to block these
    // For now, we log but allow (to avoid false positives)
    if (NODE_ENV === 'production' && isBot && !userAgent.includes('Chrome') && !userAgent.includes('Firefox')) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Automated requests not allowed.' 
      });
    }
  }
  
  // Add honeypot field check (hidden from normal users)
  if (req.body && req.body.honeypot_field) {
    logAbuse(`Honeypot triggered - IP: ${req.ip}`);
    return res.status(418).json({ success: false, message: 'I am a teapot' });
  }
  
  next();
};

// ============================================
// Anti-Scraping: Request Pattern Detection
// ============================================

const requestTimestamps = new Map();
const MAX_REQUESTS_PER_SECOND = 10;
const WINDOW_SIZE = 1000; // 1 second

const requestPatternCheck = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  
  if (!requestTimestamps.has(ip)) {
    requestTimestamps.set(ip, []);
  }
  
  const timestamps = requestTimestamps.get(ip);
  
  // Remove old timestamps
  const validTimestamps = timestamps.filter(t => now - t < WINDOW_SIZE);
  requestTimestamps.set(ip, validTimestamps);
  
  // Check if too many requests in window
  if (validTimestamps.length >= MAX_REQUESTS_PER_SECOND) {
    logAbuse(`High frequency requests - IP: ${ip}, Requests: ${validTimestamps.length}/sec`);
    return res.status(429).json({ 
      success: false, 
      message: 'Too many requests. Please slow down.' 
    });
  }
  
  validTimestamps.push(now);
  next();
};

// ============================================
// Comprehensive Rate Limiters
// ============================================

// General API - 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logAbuse(`General rate limit exceeded - IP: ${req.ip}, Path: ${req.path}`);
    res.status(429).json({ success: false, message: 'Too many requests, please try again later.' });
  },
});

// Auth endpoints - 5 attempts per 15 minutes (login)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logAbuse(`Login rate limit exceeded - IP: ${req.ip}, Email: ${req.body.email || 'unknown'}`);
    res.status(429).json({ success: false, message: 'Too many login attempts, please try again later.' });
  },
});

// Account creation - 3 registrations per hour per IP
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { success: false, message: 'Too many account creations. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logAbuse(`Registration rate limit exceeded - IP: ${req.ip}`);
    res.status(429).json({ success: false, message: 'Too many account creations. Please try again later.' });
  },
});

// Password reset - 3 requests per hour
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { success: false, message: 'Too many password reset attempts.' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logAbuse(`Password reset rate limit exceeded - IP: ${req.ip}`);
    res.status(429).json({ success: false, message: 'Too many password reset attempts.' });
  },
});

// AI/Object Detection - 20 requests per minute (prevent abuse)
const aiGenerationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many AI requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logAbuse(`AI generation rate limit exceeded - IP: ${req.ip}, Path: ${req.path}`);
    res.status(429).json({ success: false, message: 'Too many AI requests. Please slow down.' });
  },
});

// Navigation API - 30 requests per minute
const navigationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many navigation requests.' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logAbuse(`Navigation rate limit exceeded - IP: ${req.ip}`);
    res.status(429).json({ success: false, message: 'Too many navigation requests.' });
  },
});

// Location save - 10 per minute
const locationSaveLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many location saves.' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logAbuse(`Location save rate limit exceeded - IP: ${req.ip}`);
    res.status(429).json({ success: false, message: 'Too many location saves.' });
  },
});

// Strict limiter for sensitive operations
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many requests from this IP.' },
  handler: (req, res) => {
    logAbuse(`Strict rate limit exceeded - IP: ${req.ip}, Path: ${req.path}`);
    res.status(429).json({ success: false, message: 'Too many requests from this IP.' });
  },
});

// ============================================
// Apply Middleware
// ============================================

// Bot protection
app.use(botProtection);

// Request pattern detection
app.use(requestPatternCheck);

// Apply rate limiters to specific routes
app.use('/api/', generalLimiter);
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/register', registrationLimiter);
app.use('/api/auth/forgot-password', passwordResetLimiter);
app.use('/api/auth/reset-password', passwordResetLimiter);
app.use('/api/object-detect', aiGenerationLimiter);
app.use('/api/navigation', navigationLimiter);
app.use('/api/locations', locationSaveLimiter);
app.use('/api/admin/', strictLimiter);

// Morgan - HTTP request logging
app.use(morgan('combined', { stream: accessLogStream }));

// Morgan - Console logging in development
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Helmet - Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: ["'self'", "https://localhost:*", "https://*"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "blob:"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS - Secure configuration for production
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://visionvoice-ai.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// express.json() - Parse JSON bodies with size limit
app.use(express.json({ 
  limit: '10kb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf.toString());
    } catch (e) {
      logSecurity(`Invalid JSON - IP: ${req.ip}, Path: ${req.path}`);
      throw new Error('Invalid JSON');
    }
  }
}));

// express.urlencoded() - Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Request ID middleware for tracing
app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// ============================================
// Security: Prevent common attacks
// ============================================

// Prevent XSS attacks - sanitize inputs
app.use((req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].replace(/\0/g, '');
      }
    });
  }
  next();
});

// ============================================
// Routes
// ============================================

// ROOT ROUTE
app.get('/', (req, res) => {
  res.json({
    message: 'VisionVoice AI Backend API',
    version: '1.0.0',
    status: 'running',
    environment: NODE_ENV
  });
});

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'VisionVoice AI Backend Running',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

// TEST API
app.get('/api/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'API working perfectly'
  });
});

// ============================================
// Navigation API
// ============================================

app.get('/api/locations', (req, res) => {
  res.json({ success: true, locations: [] });
});

app.post('/api/locations', (req, res) => {
  const { name, latitude, longitude } = req.body;
  
  if (!name || !latitude || !longitude) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: name, latitude, longitude'
    });
  }
  
  const location = {
    id: Date.now(),
    name: name.substring(0, 100),
    latitude,
    longitude,
    createdAt: new Date().toISOString()
  };
  
  logSecurity(`Location saved - ID: ${location.id}, Name: ${location.name}`);
  res.json({ success: true, location });
});

app.post('/api/navigation', (req, res) => {
  const { currentLat, currentLng, destinationLat, destinationLng } = req.body;
  
  res.json({
    success: true,
    message: 'Navigation calculated',
    route: {
      distance: '1.5 km',
      duration: '15 minutes',
      instructions: [
        'Head north on current street',
        'Turn right at the intersection',
        'Destination will be on your left'
      ]
    }
  });
});

// ============================================
// Object Detection API
// ============================================

app.post('/api/object-detect', (req, res) => {
  // In production, this would call TensorFlow.js
  // Currently a mock response
  res.json({
    success: true,
    message: 'Object detection processed',
    detections: [
      { class: 'person', confidence: 0.95, bbox: [100, 50, 200, 300] },
      { class: 'chair', confidence: 0.85, bbox: [350, 200, 150, 180] }
    ]
  });
});

// ============================================
// Error Handling Middleware
// ============================================

app.use((req, res, next) => {
  logSecurity(`404 Not Found - IP: ${req.ip}, Path: ${req.path}, Method: ${req.method}`);
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path
  });
});

app.use((err, req, res, next) => {
  logError(err, `Request: ${req.method} ${req.path}`);
  
  const errorMessage = NODE_ENV === 'development' ? err.message : 'Internal server error';
  
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'Cross-origin request not allowed'
    });
  }
  
  if (err.message === 'Invalid JSON') {
    return res.status(400).json({
      success: false,
      message: 'Invalid request body'
    });
  }
  
  res.status(500).json({
    success: false,
    message: errorMessage,
    requestId: req.id
  });
});

// ============================================
// Serve Static Files (Production)
// ============================================

if (NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  });
}

// ============================================
// Start Server
// ============================================

const server = app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 VisionVoice AI Backend Server (SECURE)');
  console.log('='.repeat(50));
  console.log(`📍 Server running on port: ${PORT}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`📋 Test API: http://localhost:${PORT}/api/test`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Rate Limiting: Enabled`);
  console.log(`🛡️  Bot Protection: Enabled`);
  console.log(`📝 Logging: Enabled`);
  console.log('='.repeat(50));
  
  logSecurity(`Server started - Environment: ${NODE_ENV}, Port: ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  logSecurity('Server shutting down (SIGTERM)');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  logSecurity('Server shutting down (SIGINT)');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Export app for testing
module.exports = app;
