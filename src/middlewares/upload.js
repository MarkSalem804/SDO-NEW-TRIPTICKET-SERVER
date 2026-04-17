const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
    const uploadPath = process.env.PROFILE_PICTURES_UPLOADS || path.join(__dirname, "../../tmp/profiles");
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const userId = req.user ? req.user.id : "anonymous";
    cb(null, `profile-${userId}-${Date.now()}${ext}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only images (JPG, PNG, GIF) are allowed"), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit
});

module.exports = upload;
