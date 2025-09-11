const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');

// Import your existing routes
const authRoutes = require('../src/routes/authRoutes');
const moodRoutes = require('../src/routes/moodRoutes');
const goalRoutes = require('../src/routes/goalRoutes');
const communityRoutes = require('../src/routes/communityRoutes');
const gamificationRoutes = require('../src/routes/gamificationRoutes');
const resourceRoutes = require('../src/routes/resourceRoutes');
const searchRoutes = require('../src/routes/searchRoutes');
const analyticsRoutes = require('../src/routes/analyticsRoutes');
const collectionRoutes = require('../src/routes/collectionRoutes');
const versionRoutes = require('../src/routes/versionRoutes');
const emergencyRoutes = require('../src/routes/emergencyRoutes');
const aiRoutes = require('../src/routes/aiRoutes');

// Import database connection
const connectDB = require('../src/config/db');

const app = express();

// Connect to MongoDB
const mongoUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/aashray-dev';
connectDB(mongoUrl);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(mongoSanitize());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS ? 
  process.env.ALLOWED_ORIGINS.split(',') : 
  ['http://localhost:3000', 'http://localhost:5173', 'https://vercel.app'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed or is a Vercel preview URL
    if (allowedOrigins.includes(origin) || origin.includes('vercel.app')) {
      return callback(null, true);
    }
    
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Compression middleware
app.use(compression());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Aashray API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Emergency routes (must come first to avoid global protection)
app.use('/api/v1', emergencyRoutes);

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/moods', moodRoutes);
app.use('/api/v1/goals', goalRoutes);
app.use('/api/v1/community', communityRoutes);
app.use('/api/v1/gamification', gamificationRoutes);
app.use('/api/v1/resources', resourceRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/collections', collectionRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1', versionRoutes);

// Main API info endpoint
app.get('/api/v1', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to Aashray API v1',
    endpoints: {
      health: '/api/health',
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      moods: '/api/v1/moods',
      goals: '/api/v1/goals',
      community: '/api/v1/community',
      resources: '/api/v1/resources',
      search: '/api/v1/search',
      analytics: '/api/v1/analytics',
      collections: '/api/v1/collections',
      ai: '/api/v1/ai',
      versions: '/api/v1/resources/{resourceId}/versions',
      emergency: '/api/v1/emergency'
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  
  res.status(err.status || 500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// Export for Vercel
module.exports = app;
