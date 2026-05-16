const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// security headers
app.use(helmet());

// cors
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// rate limiting on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: 'Too many requests, please try again later' }
});

// body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'civicsense-server' });
});

// routes
app.use('/api/auth',    authLimiter, require('./routes/auth'));
app.use('/api/bills',   require('./routes/bills'));
app.use('/api/comments',require('./routes/comments'));
app.use('/api/analysis',require('./routes/analysis'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/admin',   require('./routes/admin'));

// error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

module.exports = app;