const multer = require('multer');
const path = require('path');

const uploadsPath = path.join(__dirname, '..', 'uploads');

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsPath); // Save files in src/uploads
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});

const upload = multer({ storage });

// ✅ Generate full public URL for saved file
function fileUrl(req, filename) {
  // Use BASE_URL if defined (set this in Render → Environment Variables)
  // Example: BASE_URL=https://backend-render-l8re.onrender.com
  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/${filename}`;
}

module.exports = { upload, fileUrl };
