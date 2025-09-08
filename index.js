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

// Allow frontend from Vercel
app.use(cors({
  origin: ["https://fontend-vercel-sage.vercel.app"], 
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve uploads folder statically - updated path
const uploadsPath = path.join(__dirname, 'uploads'); // corrected to 'uploads' at root level
app.use('/uploads', express.static(uploadsPath));

// Root route
app.get('/', (req, res) => {
  res.send('Lost & Found API is running!');
});

// Auth routes (login)
app.use('/admin', authRouter);

// Existing routes
app.use('/', publicRoutes);
app.use('/admin', adminRoutes);

const PORT = process.env.PORT || 5000;

async function start() {
  console.log("Mongo URI:", process.env.MONGO_URI);
  try {
    await connectDatabase();
    await seedAdmin(); // seed admin user at startup
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
