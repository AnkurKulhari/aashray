const { body, validationResult } = require('express-validator');

// Validation for mood entry analysis
const validateMoodAnalysis = [
  body('mood')
    .isString()
    .notEmpty()
    .withMessage('Mood is required and must be a string'),
  
  body('note')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Note cannot be more than 500 characters'),
  
  body('triggers')
    .optional()
    .isArray()
    .withMessage('Triggers must be an array'),
  
  body('activities')
    .optional()
    .isArray()
    .withMessage('Activities must be an array'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

module.exports = {
  validateMoodAnalysis
};
