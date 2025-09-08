require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const { connectDatabase } = require('./src/config/db');
const { seedAdmin } = require('./src/seed/admin');
const publicRoutes = require('./src/routes/public');
const adminRoutes = require('./src/routes/admin');
const { router: authRouter } = require('./src/middleware/auth'); // ✅ updated auth.js

const app = express();

// ✅ Allow frontend from Vercel
app.use(cors({
  origin: ["https://vercel-frontend-lostfound.vercel.app"],
  methods: ["POST", "GET", "PUT", "DELETE"],
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ✅ Static uploads
const uploadsPath = path.join(__dirname, 'src', 'uploads');
app.use('/uploads', express.static(uploadsPath));

// ✅ Root route
app.get('/', (req, res) => {
  res.send('Lost & Found API is running!');
});

// ✅ Auth routes (login)
app.use('/admin', authRouter);

// Existing routes
app.use('/', publicRoutes);
app.use('/admin', adminRoutes);

const PORT = process.env.PORT || 5000;

async function start() {
  console.log("Mongo URI:", process.env.MONGO_URI);
  try {
    await connectDatabase();
    await seedAdmin(); // seeds admin user at startup
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
