const express = require('express');
const {
  register,
  login,
  logout,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
  verifyEmail,
  refreshToken
} = require('../controllers/authController');
const {
  validateRegistration,
  validateLogin,
  validateForgotPassword,
  validatePasswordReset,
  validateUpdatePassword
} = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.patch('/reset-password/:token', validatePasswordReset, resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Protected routes (require authentication)
router.use(protect); // All routes after this middleware are protected

router.patch('/update-password', validateUpdatePassword, updatePassword);

module.exports = router;
