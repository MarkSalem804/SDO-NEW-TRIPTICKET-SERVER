const multer = require("multer");
const path = require("path");
const fs = require("fs");

const attachmentsPath = process.env.ATTACHMENTS_PATH || path.join(__dirname, "../../tmp/attachments");

// Ensure directory exists
if (!fs.existsSync(attachmentsPath)) {
  fs.mkdirSync(attachmentsPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, attachmentsPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ["application/pdf", "image/png", "image/jpg", "image/jpeg"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDFs and Images (PNG/JPG) are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

module.exports = upload;
