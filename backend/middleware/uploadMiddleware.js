const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = 'public/uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Institutional Naming Convention: [TYPE]-[TIMESTAMP]-[ORIGINAL_NAME]
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter for institutional security
const fileFilter = (req, file, cb) => {
    const allowedImageTypes = /jpeg|jpg|png|webp/;
    const allowedVideoTypes = /mp4|webm|quicktime/;

    const isImage = allowedImageTypes.test(path.extname(file.originalname).toLowerCase()) && file.mimetype.startsWith('image/');
    const isVideo = allowedVideoTypes.test(path.extname(file.originalname).toLowerCase()) && file.mimetype.startsWith('video/');

    if (isImage || isVideo) {
        cb(null, true);
    } else {
        cb(new Error('Institutional security protocol: Only high-bandwidth visual assets (Images/Videos) are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit for institutional quality
    },
    fileFilter: fileFilter
});

module.exports = upload;
