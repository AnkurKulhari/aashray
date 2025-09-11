const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');
const { protect } = require('../controllers/authController');

// Public helplines (no authentication required)
router.get('/emergency/helplines', emergencyController.getHelplines);

// Emergency actions (optional authentication for development)
router.post('/emergency/button', emergencyController.triggerEmergencyButton);
router.post('/emergency/analyze', emergencyController.analyzeTextForCrisis);
router.post('/emergency/report', emergencyController.reportCrisis);

// Protected user settings
router.get('/users/:userId/emergency-settings', protect, emergencyController.getSettings);
router.put('/users/:userId/emergency-settings', protect, emergencyController.upsertSettings);
router.post('/users/:userId/emergency-settings/contacts', protect, emergencyController.addEmergencyContact);
router.delete('/users/:userId/emergency-settings/contacts/:contactId', protect, emergencyController.removeEmergencyContact);
router.patch('/users/:userId/emergency-settings/preferences', protect, emergencyController.updatePreferences);

// Protected logs
router.get('/emergency/logs', protect, emergencyController.listLogs);
router.patch('/emergency/logs/:id/resolve', protect, emergencyController.resolveLog);

module.exports = router;
