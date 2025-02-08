const multer = require('multer');
const path = require('path');

// ตั้งค่าที่เก็บไฟล์
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/'); // โฟลเดอร์ที่เก็บไฟล์
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// เพิ่มการตรวจสอบประเภทไฟล์
const fileFilter = (req, file, cb) => {
  // อนุญาตเฉพาะไฟล์รูปภาพ
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('ไม่รองรับไฟล์ประเภทนี้ กรุณาอัพโหลดไฟล์รูปภาพเท่านั้น'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // จำกัดขนาดไฟล์ที่ 5MB
    files: 5 // จำกัดจำนวนไฟล์สูงสุดที่ 5 ไฟล์
  }
});

module.exports = upload;
