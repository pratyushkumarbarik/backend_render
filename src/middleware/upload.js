const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists at root/uploads
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

// Return full public URL to image
function fileUrl(filename) {
  if (!filename) return 'https://backend-render-l8re.onrender.com/uploads/default.png'; // Your default

  const baseUrl = 'https://backend-render-l8re.onrender.com';
  return `${baseUrl}/uploads/${filename}`;
}

module.exports = { upload, fileUrl };
