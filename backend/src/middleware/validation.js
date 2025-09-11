const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  next();
};

// User registration validation
const validateRegistration = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  
  body('university')
    .trim()
    .notEmpty()
    .withMessage('University is required')
    .isLength({ max: 100 })
    .withMessage('University name cannot be more than 100 characters'),
  
  body('year')
    .notEmpty()
    .withMessage('Academic year is required')
    .isIn(['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', 'PhD'])
    .withMessage('Please select a valid academic year'),
  
  body('major')
    .trim()
    .notEmpty()
    .withMessage('Major/Field of study is required')
    .isLength({ max: 100 })
    .withMessage('Major cannot be more than 100 characters'),
  
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Please provide a valid date of birth')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 13 || age > 100) {
        throw new Error('Age must be between 13 and 100 years');
      }
      return true;
    }),
  
  body('gender')
    .notEmpty()
    .withMessage('Gender is required')
    .isIn(['Male', 'Female', 'Non-binary', 'Prefer not to say'])
    .withMessage('Please select a valid gender option'),
  
  body('phoneNumber')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  
  body('displayName')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Display name must be between 3 and 30 characters'),
  
  handleValidationErrors
];

// User login validation
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Password reset validation
const validatePasswordReset = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  
  handleValidationErrors
];

// Forgot password validation
const validateForgotPassword = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  handleValidationErrors
];

// Update password validation
const validateUpdatePassword = [
  body('passwordCurrent')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  
  body('passwordConfirm')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Mood entry validation
const validateMoodEntry = [
  body('mood')
    .notEmpty()
    .withMessage('Mood is required')
    .isIn(['very_happy', 'happy', 'neutral', 'sad', 'very_sad', 'angry', 'anxious', 'stressed', 'calm', 'excited'])
    .withMessage('Please select a valid mood'),
  
  body('intensity')
    .isInt({ min: 1, max: 10 })
    .withMessage('Mood intensity must be between 1 and 10'),
  
  body('stressLevel')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Stress level must be between 1 and 10'),
  
  body('energyLevel')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Energy level must be between 1 and 10'),
  
  body('sleepQuality')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Sleep quality must be between 1 and 10'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot be more than 500 characters'),
  
  body('location')
    .optional()
    .isIn(['home', 'university', 'dormitory', 'library', 'gym', 'outdoors', 'social_event', 'work', 'other'])
    .withMessage('Please select a valid location'),
  
  body('activity')
    .optional()
    .isIn(['studying', 'socializing', 'exercising', 'sleeping', 'eating', 'working', 'relaxing', 'commuting', 'attending_class', 'other'])
    .withMessage('Please select a valid activity'),
  
  handleValidationErrors
];

// Goal creation validation
const validateGoal = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Goal title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Goal title must be between 3 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Goal description cannot be more than 500 characters'),
  
  body('category')
    .notEmpty()
    .withMessage('Goal category is required')
    .isIn([
      'mood_improvement', 'stress_reduction', 'sleep_quality', 'physical_activity',
      'social_connection', 'academic_performance', 'self_care', 'mindfulness',
      'therapy_engagement', 'medication_adherence', 'crisis_management',
      'habit_building', 'emotional_regulation', 'communication', 'other'
    ])
    .withMessage('Please select a valid goal category'),
  
  body('type')
    .notEmpty()
    .withMessage('Goal type is required')
    .isIn(['daily', 'weekly', 'monthly', 'one_time', 'continuous'])
    .withMessage('Please select a valid goal type'),
  
  body('targetValue')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Target value must be a positive number'),
  
  body('deadline')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid deadline date')
    .custom((value) => {
      if (value && new Date(value) <= new Date()) {
        throw new Error('Deadline must be in the future');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Community post validation
const validateCommunityPost = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Post title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Post title must be between 5 and 200 characters'),
  
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Post content is required')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Post content must be between 10 and 5000 characters'),
  
  body('type')
    .notEmpty()
    .withMessage('Post type is required')
    .isIn(['discussion', 'support_request', 'success_story', 'question', 'resource_share', 'check_in'])
    .withMessage('Please select a valid post type'),
  
  body('category')
    .notEmpty()
    .withMessage('Post category is required')
    .isIn([
      'general', 'anxiety', 'depression', 'stress', 'relationships',
      'academic', 'career', 'family', 'self_care', 'therapy',
      'medication', 'crisis', 'achievement', 'advice', 'other'
    ])
    .withMessage('Please select a valid post category'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('Each tag must be between 2 and 30 characters'),
  
  handleValidationErrors
];

// Resource validation
const validateResource = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Resource title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Resource title must be between 5 and 200 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Resource description is required')
    .isLength({ min: 20, max: 1000 })
    .withMessage('Resource description must be between 20 and 1000 characters'),
  
  body('type')
    .notEmpty()
    .withMessage('Resource type is required')
    .isIn(['article', 'video', 'podcast', 'worksheet', 'assessment', 'guide', 'infographic', 'audio', 'other'])
    .withMessage('Please select a valid resource type'),
  
  body('category')
    .notEmpty()
    .withMessage('Resource category is required')
    .isIn([
      'anxiety', 'depression', 'stress', 'sleep', 'relationships', 'self_esteem',
      'trauma', 'addiction', 'eating_disorders', 'academic_stress', 'crisis',
      'mindfulness', 'coping_skills', 'therapy', 'medication', 'self_care',
      'physical_health', 'social_skills', 'communication', 'general'
    ])
    .withMessage('Please select a valid resource category'),
  
  body('difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Please select a valid difficulty level'),
  
  body('targetAudience')
    .optional()
    .isIn(['students', 'general', 'professionals', 'family', 'specific_condition'])
    .withMessage('Please select a valid target audience'),
  
  body('content.url')
    .optional()
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Please provide a valid URL'),
  
  body('content.text')
    .optional()
    .trim()
    .isLength({ max: 50000 })
    .withMessage('Content text cannot exceed 50,000 characters'),
  
  body('content.duration')
    .optional()
    .isInt({ min: 1, max: 10080 }) // max 7 days in minutes
    .withMessage('Duration must be between 1 and 10080 minutes'),
  
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Maximum 10 tags allowed'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('Each tag must be between 2 and 30 characters')
    .matches(/^[a-zA-Z0-9_\s-]+$/)
    .withMessage('Tags can only contain letters, numbers, spaces, hyphens and underscores'),
  
  body('triggers')
    .optional()
    .isArray()
    .withMessage('Triggers must be an array'),
  
  body('triggers.*')
    .optional()
    .isIn([
      'self_harm', 'suicide', 'violence', 'abuse', 'eating_disorders',
      'substance_use', 'trauma', 'medical_content', 'graphic_imagery'
    ])
    .withMessage('Please select valid trigger warnings'),
  
  body('contentWarning')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Content warning cannot exceed 500 characters'),
  
  body('author.name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Author name must be between 2 and 100 characters'),
  
  body('author.credentials')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Author credentials cannot exceed 200 characters'),
  
  handleValidationErrors
];

// Resource rating validation
const validateResourceRating = [
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('review')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Review cannot exceed 1000 characters'),
  
  body('helpfulness')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Helpfulness rating must be between 1 and 5'),
  
  handleValidationErrors
];

// Resource comment validation
const validateResourceComment = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ min: 3, max: 500 })
    .withMessage('Comment must be between 3 and 500 characters'),
  
  handleValidationErrors
];

// Resource report validation
const validateResourceReport = [
  body('reason')
    .notEmpty()
    .withMessage('Report reason is required')
    .isIn(['inappropriate', 'inaccurate', 'spam', 'copyright', 'other'])
    .withMessage('Please select a valid report reason'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Report description cannot exceed 500 characters'),
  
  handleValidationErrors
];

// Collection validation
const validateCollection = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Collection title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Collection title must be between 5 and 200 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Collection description is required')
    .isLength({ min: 20, max: 1000 })
    .withMessage('Collection description must be between 20 and 1000 characters'),
  
  body('type')
    .notEmpty()
    .withMessage('Collection type is required')
    .isIn(['curated', 'learning_path', 'topic_series', 'featured', 'seasonal', 'crisis_support'])
    .withMessage('Please select a valid collection type'),
  
  body('category')
    .notEmpty()
    .withMessage('Collection category is required')
    .isIn([
      'anxiety', 'depression', 'stress', 'sleep', 'relationships', 'self_esteem',
      'trauma', 'addiction', 'eating_disorders', 'academic_stress', 'crisis',
      'mindfulness', 'coping_skills', 'therapy', 'medication', 'self_care',
      'physical_health', 'social_skills', 'communication', 'general'
    ])
    .withMessage('Please select a valid collection category'),
  
  body('targetAudience')
    .optional()
    .isIn(['students', 'general', 'professionals', 'family', 'specific_condition'])
    .withMessage('Please select a valid target audience'),
  
  body('visibility')
    .optional()
    .isIn(['public', 'unlisted', 'private'])
    .withMessage('Please select a valid visibility option'),
  
  body('status')
    .optional()
    .isIn(['draft', 'review', 'published', 'archived'])
    .withMessage('Please select a valid status'),
  
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Please provide a valid hex color code'),
  
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Maximum 10 tags allowed'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('Each tag must be between 2 and 30 characters')
    .matches(/^[a-zA-Z0-9_\s-]+$/)
    .withMessage('Tags can only contain letters, numbers, spaces, hyphens and underscores'),
  
  body('resources')
    .optional()
    .isArray()
    .withMessage('Resources must be an array'),
  
  body('resources.*.resource')
    .optional()
    .isMongoId()
    .withMessage('Resource ID must be a valid MongoDB ObjectId'),
  
  body('resources.*.order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Resource order must be a positive integer'),
  
  body('resources.*.estimatedTime')
    .optional()
    .isInt({ min: 1, max: 480 }) // Max 8 hours
    .withMessage('Estimated time must be between 1 and 480 minutes'),
  
  handleValidationErrors
];

// Collection progress validation
const validateCollectionProgress = [
  body('resourceId')
    .notEmpty()
    .withMessage('Resource ID is required')
    .isMongoId()
    .withMessage('Resource ID must be a valid MongoDB ObjectId'),
  
  body('completed')
    .optional()
    .isBoolean()
    .withMessage('Completed must be a boolean value'),
  
  body('timeSpent')
    .optional()
    .isInt({ min: 0, max: 480 })
    .withMessage('Time spent must be between 0 and 480 minutes'),
  
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  handleValidationErrors
];

// Version validation
const validateVersion = [
  body('changeType')
    .optional()
    .isIn(['major', 'minor', 'patch'])
    .withMessage('Change type must be major, minor, or patch'),
  
  body('changeDescription')
    .trim()
    .notEmpty()
    .withMessage('Change description is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Change description must be between 10 and 500 characters'),
  
  body('scheduledPublishAt')
    .optional()
    .isISO8601()
    .withMessage('Scheduled publish date must be a valid ISO 8601 date')
    .custom((value) => {
      if (value && new Date(value) <= new Date()) {
        throw new Error('Scheduled publish date must be in the future');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Version review validation
const validateVersionReview = [
  body('notes')
    .trim()
    .notEmpty()
    .withMessage('Review notes are required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Review notes must be between 10 and 1000 characters'),
  
  body('makeCurrentVersion')
    .optional()
    .isBoolean()
    .withMessage('makeCurrentVersion must be a boolean'),
  
  handleValidationErrors
];

// Rollback validation
const validateRollback = [
  body('rollbackReason')
    .trim()
    .notEmpty()
    .withMessage('Rollback reason is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Rollback reason must be between 10 and 500 characters'),
  
  handleValidationErrors
];

// Schedule publication validation
const validateSchedulePublication = [
  body('scheduledPublishAt')
    .notEmpty()
    .withMessage('Scheduled publish date is required')
    .isISO8601()
    .withMessage('Scheduled publish date must be a valid ISO 8601 date')
    .custom((value) => {
      const scheduleDate = new Date(value);
      const now = new Date();
      if (scheduleDate <= now) {
        throw new Error('Scheduled publish date must be in the future');
      }
      if (scheduleDate.getTime() - now.getTime() > 365 * 24 * 60 * 60 * 1000) {
        throw new Error('Scheduled publish date cannot be more than 1 year in the future');
      }
      return true;
    }),
  
  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validatePasswordReset,
  validateForgotPassword,
  validateUpdatePassword,
  validateMoodEntry,
  validateGoal,
  validateCommunityPost,
  validateResource,
  validateResourceRating,
  validateResourceComment,
  validateResourceReport,
  validateCollection,
  validateCollectionProgress,
  validateVersion,
  validateVersionReview,
  validateRollback,
  validateSchedulePublication,
  handleValidationErrors
};
