const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsPath = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsPath);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});

// Only allow image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ storage, fileFilter });

// Generate full public URL for uploaded files
function fileUrl(filename) {
  if (!filename) {
    // Optional: replace with your own hosted default image URL instead of external placeholder
    return 'https://via.placeholder.com/400x300?text=No+Image';
  }
  const baseUrl = 'https://backend-render-l8re.onrender.com'; // Your deployed backend URL
  return `${baseUrl}/uploads/${filename}`;
}

module.exports = { upload, fileUrl };
