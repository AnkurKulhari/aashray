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

module.exports = {
  validateRegistration,
  validateLogin,
  validatePasswordReset,
  validateForgotPassword,
  validateUpdatePassword,
  validateMoodEntry,
  validateGoal,
  validateCommunityPost,
  handleValidationErrors
};
