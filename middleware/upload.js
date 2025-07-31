const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = [
    './uploads',
    './uploads/avatars',
    './uploads/pets',
    './uploads/insurance',
    './uploads/claims'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

// Helper for file filtering
const fileFilter = (allowedTypes) => (req, file, cb) => {
  // Get the extension
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`不支持的文件类型，仅支持 ${allowedTypes.join('、')} 格式`), false);
  }
};

// Storage configuration for different upload types
const storageConfig = {
  avatar: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads/avatars');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  
  pet: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads/pets');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'pet-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  
  insurance: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads/insurance');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'ins-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  
  claim: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads/claims');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'claim-' + uniqueSuffix + path.extname(file.originalname));
    }
  })
};

// Allowed file types
const fileTypes = {
  image: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  document: ['.pdf', '.doc', '.docx'],
  insurance: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']
};

// Create middleware instances
const uploadMiddleware = {
  // For user and pet avatars (only images)
  avatar: multer({
    storage: storageConfig.avatar,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: fileFilter(fileTypes.image)
  }),
  
  // For pet avatars (only images)
  petAvatar: multer({
    storage: storageConfig.pet,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: fileFilter(fileTypes.image)
  }),
  
  // For insurance documents (PDFs and images)
  insuranceDoc: multer({
    storage: storageConfig.insurance,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: fileFilter(fileTypes.insurance)
  }),
  
  // For claim documents (PDFs and images)
  claimDoc: multer({
    storage: storageConfig.claim,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: fileFilter(fileTypes.insurance)
  })
};

// Error handler wrapper
const handleUpload = (uploadHandler) => (req, res, next) => {
  uploadHandler(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer error (e.g., file too large)
      return res.status(400).json({
        code: 400,
        message: `文件上传错误: ${err.message}`,
        data: null
      });
    } else if (err) {
      // Custom error or unexpected error
      return res.status(400).json({
        code: 400,
        message: err.message || '文件上传失败',
        data: null
      });
    }
    
    // No errors, proceed
    next();
  });
};

module.exports = {
  uploadAvatar: handleUpload(uploadMiddleware.avatar.single('file')),
  uploadPetAvatar: handleUpload(uploadMiddleware.petAvatar.single('file')),
  uploadInsuranceDoc: handleUpload(uploadMiddleware.insuranceDoc.single('file')),
  uploadClaimDocs: handleUpload(uploadMiddleware.claimDoc.array('files', 5)),
  uploadSingleClaimDoc: handleUpload(uploadMiddleware.claimDoc.single('file'))
}; 