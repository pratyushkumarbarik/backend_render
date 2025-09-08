const multer = require('multer');
const path = require('path');

const uploadsPath = path.join(__dirname, '..', 'uploads');

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

const upload = multer({ storage });

function fileUrl(req, filename) {
  let protocol = req.protocol;
  let host = req.get('host');
  if (!protocol) protocol = 'http';
  if (!host) host = 'localhost:5000';
  return `${protocol}://${host}/uploads/${filename}`;
}

module.exports = { upload, fileUrl };
