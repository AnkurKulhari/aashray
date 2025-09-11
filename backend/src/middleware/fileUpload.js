const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage configuration for different file types
const createCloudinaryStorage = (folder, allowedFormats) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `aashray/${folder}`,
      allowed_formats: allowedFormats,
      transformation: [
        { width: 1920, height: 1080, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    }
  });
};

// Storage for resource images
const resourceImageStorage = createCloudinaryStorage('resources/images', ['jpg', 'jpeg', 'png', 'webp']);

// Storage for resource documents
const resourceDocumentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'aashray/resources/documents',
    allowed_formats: ['pdf', 'doc', 'docx', 'txt'],
    resource_type: 'raw' // For non-image files
  }
});

// Storage for resource videos
const resourceVideoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'aashray/resources/videos',
    allowed_formats: ['mp4', 'avi', 'mov', 'wmv'],
    resource_type: 'video'
  }
});

// Storage for resource audio
const resourceAudioStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'aashray/resources/audio',
    allowed_formats: ['mp3', 'wav', 'aac', 'm4a'],
    resource_type: 'video' // Cloudinary uses 'video' for audio files
  }
});

// File filter function
const fileFilter = (allowedTypes) => {
  return (req, file, cb) => {
    const allowedMimes = {
      image: ['image/jpeg', 'image/png', 'image/webp'],
      document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
      video: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
      audio: ['audio/mpeg', 'audio/wav', 'audio/aac', 'audio/m4a']
    };

    const allowed = allowedTypes.reduce((acc, type) => {
      return acc.concat(allowedMimes[type] || []);
    }, []);

    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
    }
  };
};

// Multer configurations
const uploadResourceImage = multer({
  storage: resourceImageStorage,
  fileFilter: fileFilter(['image']),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

const uploadResourceDocument = multer({
  storage: resourceDocumentStorage,
  fileFilter: fileFilter(['document']),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

const uploadResourceVideo = multer({
  storage: resourceVideoStorage,
  fileFilter: fileFilter(['video']),
  limits: {
    fileSize: 200 * 1024 * 1024 // 200MB limit
  }
});

const uploadResourceAudio = multer({
  storage: resourceAudioStorage,
  fileFilter: fileFilter(['audio']),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Generic file upload middleware
const uploadResourceFile = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter(['image', 'document', 'video', 'audio']),
  limits: {
    fileSize: 200 * 1024 * 1024 // 200MB limit
  }
});

// Middleware to handle different file types
const handleResourceUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    const file = req.file;
    let uploadResult;

    // Determine file type and upload accordingly
    if (file.mimetype.startsWith('image/')) {
      uploadResult = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        {
          folder: 'aashray/resources/images',
          transformation: [
            { width: 1920, height: 1080, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        }
      );
    } else if (file.mimetype.startsWith('video/')) {
      uploadResult = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        {
          folder: 'aashray/resources/videos',
          resource_type: 'video'
        }
      );
    } else if (file.mimetype.startsWith('audio/')) {
      uploadResult = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        {
          folder: 'aashray/resources/audio',
          resource_type: 'video' // Cloudinary uses 'video' for audio
        }
      );
    } else {
      // Documents
      uploadResult = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        {
          folder: 'aashray/resources/documents',
          resource_type: 'raw'
        }
      );
    }

    // Attach file info to request
    req.uploadedFile = {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
      width: uploadResult.width,
      height: uploadResult.height,
      duration: uploadResult.duration // For video/audio files
    };

    next();
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: `File upload failed: ${error.message}`
    });
  }
};

// Middleware to delete files from Cloudinary
const deleteCloudinaryFile = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    throw error;
  }
};

// Middleware to validate file uploads
const validateFileUpload = (req, res, next) => {
  const allowedTypes = ['image', 'document', 'video', 'audio'];
  const maxFileSize = 200 * 1024 * 1024; // 200MB

  if (req.file) {
    // Check file size
    if (req.file.size > maxFileSize) {
      return res.status(400).json({
        status: 'error',
        message: 'File size too large. Maximum allowed size is 200MB.'
      });
    }

    // Check file type
    const fileType = req.file.mimetype.split('/')[0];
    if (!allowedTypes.includes(fileType) && req.file.mimetype !== 'application/pdf' && 
        !req.file.mimetype.includes('document')) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid file type. Allowed types: images, documents, videos, audio files.'
      });
    }
  }

  next();
};

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'error',
        message: 'File too large. Please upload a smaller file.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        status: 'error',
        message: 'Unexpected file field. Please check the file input name.'
      });
    }
  }
  
  if (err.message.includes('Invalid file type')) {
    return res.status(400).json({
      status: 'error',
      message: err.message
    });
  }

  next(err);
};

module.exports = {
  uploadResourceImage: uploadResourceImage.single('file'),
  uploadResourceDocument: uploadResourceDocument.single('file'),
  uploadResourceVideo: uploadResourceVideo.single('file'),
  uploadResourceAudio: uploadResourceAudio.single('file'),
  uploadResourceFile: uploadResourceFile.single('file'),
  handleResourceUpload,
  deleteCloudinaryFile,
  validateFileUpload,
  handleMulterError,
  cloudinary
};
