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
  origin: [
    "https://frontend-vercel-sage.vercel.app",
    "https://fontend-vercel-sage.vercel.app" // keep old just in case
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

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
// Transparent 1x1 PNG
const defaultPngBuffer = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=',
  'base64'
);

app.get('/uploads/default.png', (req, res) => {
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.end(defaultPngBuffer);
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
