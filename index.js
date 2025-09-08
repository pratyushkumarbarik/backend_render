require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const { connectDatabase } = require('./src/config/db');
const { seedAdmin } = require('./src/seed/admin');
const publicRoutes = require('./src/routes/public');
const adminRoutes = require('./src/routes/admin');
const { router: authRouter } = require('./src/middleware/auth');

const app = express();

// Enable CORS for your frontend (adjust domain as needed)
app.use(cors({
  // Allow your Vercel deployment(s)
  origin: [/\.vercel\.app$/],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "X-Requested-With"
  ],
  exposedHeaders: ["Content-Type"],
}));

// Ensure Express responds to preflight for all routes
app.options('*', cors());

// Middleware for JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve uploads directory statically with CORS headers
// Files are saved to `server/src/uploads` by the upload middleware
const uploadsPath = path.join(__dirname, 'src', 'uploads');
app.use('/uploads', express.static(uploadsPath, {
  setHeaders: (res) => {
    // Allow cross-origin access for images and other static assets
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Provide a built-in default image so clients can always fetch it
// Visible SVG placeholder
const defaultSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="320" viewBox="0 0 512 320">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#e5e7eb"/>
      <stop offset="100%" stop-color="#d1d5db"/>
    </linearGradient>
  </defs>
  <rect width="512" height="320" fill="url(#g)"/>
  <g fill="none" stroke="#6b7280" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" transform="translate(156,76)">
    <rect x="0" y="12" width="200" height="140" rx="12" ry="12"/>
    <circle cx="66" cy="82" r="20"/>
    <path d="M12 134 L84 76 L136 112 L188 64"/>
  </g>
  <text x="256" y="300" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="#6b7280" text-anchor="middle">No image available</text>
  Sorry, your browser does not support inline SVG.
  </svg>`;

app.get('/uploads/default.svg', (req, res) => {
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.end(defaultSvg);
});


// Root route
app.get('/', (req, res) => {
  res.send('Lost & Found API is running!');
});

// Auth routes (login)
app.use('/admin', authRouter);

// Public and admin routes
app.use('/', publicRoutes);
app.use('/admin', adminRoutes);

const PORT = process.env.PORT || 5000;

// Start server with DB connection and admin seeding
async function start() {
  console.log("Mongo URI:", process.env.MONGO_URI);
  try {
    await connectDatabase();
    await seedAdmin();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
