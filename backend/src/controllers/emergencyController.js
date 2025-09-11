const mongoose = require('mongoose');
const { EmergencyContact, EmergencyLog, CrisisDetectionConfig, UserEmergencySettings } = require('../models/Emergency');
const User = require('../models/User');

// Utility: basic keyword scoring fallback
const DEFAULT_KEYWORDS = {
  critical: [
    { word: 'suicide', weight: 10 },
    { word: 'kill myself', weight: 10 },
    { word: 'end my life', weight: 10 },
    { word: 'no reason to live', weight: 9 },
    { word: 'self-harm', weight: 9 }
  ],
  warning: [
    { word: 'hurt myself', weight: 6 },
    { word: 'can\'t go on', weight: 6 },
    { word: 'overwhelmed', weight: 5 },
    { word: 'panic', weight: 5 }
  ],
  concerning: [
    { word: 'very sad', weight: 3 },
    { word: 'depressed', weight: 3 },
    { word: 'anxious', weight: 3 }
  ]
};

function normalize(str = '') {
  return String(str).toLowerCase();
}

async function loadDetectionConfig() {
  const cfg = await CrisisDetectionConfig.findOne({ isActive: true }).sort({ updatedAt: -1 });
  return cfg || {
    keywords: DEFAULT_KEYWORDS,
    thresholds: { critical: 8, high: 6, medium: 4 },
    patterns: []
  };
}

// GET /emergency/helplines
exports.getHelplines = async (req, res, next) => {
  try {
    const { country = 'US', region, category, language, activeOnly = 'true' } = req.query;
    const q = { country, ...(region && { region }), ...(category && { category }) };
    if (activeOnly === 'true') q.isActive = true;

    let contacts = await EmergencyContact.find(q).sort({ priority: -1, createdAt: -1 }).lean();
    if (language) {
      const langNorm = language.toLowerCase();
      contacts = contacts.filter(c => (c.languages || []).map(l => l.toLowerCase()).includes(langNorm));
    }

    res.json({ status: 'success', data: contacts });
  } catch (err) { next(err); }
};

// POST /emergency/button
exports.triggerEmergencyButton = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.body.userId; // allow service usage without auth in dev
    if (!userId) return res.status(400).json({ status: 'error', message: 'Missing userId' });

    const log = await EmergencyLog.create({
      userId,
      type: 'emergency_button_press',
      severity: 'high',
      triggerData: { metadata: { source: 'button' } },
      responseActions: [{ action: 'emergency_contacts_shown' }]
    });

    const contacts = await EmergencyContact.find({ isActive: true }).sort({ priority: -1 }).limit(10);

    res.status(201).json({ status: 'success', message: 'Emergency logged', data: { log, contacts } });
  } catch (err) { next(err); }
};

// POST /emergency/analyze
exports.analyzeTextForCrisis = async (req, res, next) => {
  try {
    const { text = '', context = {} } = req.body;
    const userId = req.user?._id || context.userId || null;

    const cfg = await loadDetectionConfig();
    const t = normalize(text);

    let score = 0;
    const matches = [];

    const categories = ['critical', 'warning', 'concerning'];
    for (const cat of categories) {
      for (const kw of (cfg.keywords?.[cat] || [])) {
        const word = normalize(kw.word);
        if (!word) continue;
        if (t.includes(word)) {
          score += Number(kw.weight || 0);
          matches.push({ word, weight: kw.weight, category: cat });
        }
      }
    }

    // regex patterns
    for (const p of (cfg.patterns || [])) {
      try {
        const rx = new RegExp(p.regex, 'i');
        if (rx.test(text)) {
          matches.push({ pattern: p.name, category: p.severity || 'medium' });
          score += p.severity === 'critical' ? 4 : p.severity === 'high' ? 3 : p.severity === 'medium' ? 2 : 1;
        }
      } catch (_) { /* ignore bad regex */ }
    }

    let severity = 'low';
    if (score >= cfg.thresholds.critical) severity = 'critical';
    else if (score >= cfg.thresholds.high) severity = 'high';
    else if (score >= cfg.thresholds.medium) severity = 'medium';

    let log = null;
    if (userId && severity !== 'low') {
      log = await EmergencyLog.create({
        userId,
        type: 'crisis_text_detected',
        severity,
        triggerData: { textContent: text, metadata: { matches, score } },
        responseActions: [{ action: 'resources_provided' }]
      });
    }

    const contacts = severity !== 'low'
      ? await EmergencyContact.find({ isActive: true }).sort({ priority: -1 }).limit(5)
      : [];

    res.json({ status: 'success', data: { severity, score, matches, contacts, log } });
  } catch (err) { next(err); }
};

// POST /emergency/report
exports.reportCrisis = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.body.userId;
    const { description, severity = 'medium', location } = req.body;
    if (!userId) return res.status(400).json({ status: 'error', message: 'Missing userId' });

    const log = await EmergencyLog.create({
      userId,
      type: 'user_reported_crisis',
      severity,
      triggerData: { textContent: description, location }
    });

    res.status(201).json({ status: 'success', data: log });
  } catch (err) { next(err); }
};

// Settings
exports.getSettings = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.params.userId;
    const settings = await UserEmergencySettings.findOne({ userId });
    res.json({ status: 'success', data: settings });
  } catch (err) { next(err); }
};

exports.upsertSettings = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.params.userId;
    const payload = { ...req.body, userId };
    payload.lastUpdated = new Date();

    const settings = await UserEmergencySettings.findOneAndUpdate(
      { userId },
      { $set: payload },
      { upsert: true, new: true }
    );

    res.status(200).json({ status: 'success', data: settings });
  } catch (err) { next(err); }
};

exports.addEmergencyContact = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.params.userId;
    const { name, relationship, phoneNumber, email, isPrimary = false, canReceiveAlerts = true } = req.body;

    const settings = await UserEmergencySettings.findOneAndUpdate(
      { userId },
      { $setOnInsert: { userId }, $push: { emergencyContacts: { name, relationship, phoneNumber, email, isPrimary, canReceiveAlerts } }, $set: { lastUpdated: new Date() } },
      { upsert: true, new: true }
    );

    res.status(201).json({ status: 'success', data: settings });
  } catch (err) { next(err); }
};

exports.removeEmergencyContact = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.params.userId;
    const { contactId } = req.params;

    const settings = await UserEmergencySettings.findOneAndUpdate(
      { userId },
      { $pull: { emergencyContacts: { _id: contactId } }, $set: { lastUpdated: new Date() } },
      { new: true }
    );

    res.json({ status: 'success', data: settings });
  } catch (err) { next(err); }
};

exports.updatePreferences = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.params.userId;
    const { preferences = {} } = req.body;

    const settings = await UserEmergencySettings.findOneAndUpdate(
      { userId },
      { $set: { preferences, lastUpdated: new Date() } },
      { new: true, upsert: true }
    );

    res.json({ status: 'success', data: settings });
  } catch (err) { next(err); }
};

// Logs
exports.listLogs = async (req, res, next) => {
  try {
    const { userId, severity, type, unresolvedOnly } = req.query;
    const q = { ...(userId && { userId }), ...(severity && { severity }), ...(type && { type }) };
    if (unresolvedOnly === 'true') q.isResolved = false;

    const logs = await EmergencyLog.find(q).sort({ createdAt: -1 });
    res.json({ status: 'success', data: logs });
  } catch (err) { next(err); }
};

exports.resolveLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { resolution = 'resolved', followUpRequired = false, followUpDate = null, notes = null } = req.body;

    const log = await EmergencyLog.findByIdAndUpdate(
      id,
      { $set: { isResolved: true, resolvedAt: new Date(), resolvedBy: 'user', followUpRequired, followUpDate, notes } },
      { new: true }
    );

    res.json({ status: 'success', data: log });
  } catch (err) { next(err); }
};
