const { EmergencyLog, CrisisDetectionConfig } = require('../models/Emergency');

// Keywords for basic crisis detection
const CRISIS_KEYWORDS = {
  critical: [
    'suicide', 'kill myself', 'end my life', 'no reason to live', 'self-harm', 
    'want to die', 'ending it all', 'not worth living'
  ],
  warning: [
    'hurt myself', 'can\'t go on', 'overwhelmed', 'panic attack', 'hopeless',
    'cutting', 'pills', 'bridge', 'rope', 'gun'
  ],
  concerning: [
    'very sad', 'depressed', 'anxious', 'scared', 'alone', 'worthless',
    'tired of everything', 'no one cares', 'give up'
  ]
};

/**
 * Analyzes text for crisis indicators
 * @param {string} text - Text to analyze
 * @returns {object} - Analysis result with severity and score
 */
async function analyzeForCrisis(text) {
  if (!text || typeof text !== 'string') {
    return { severity: 'low', score: 0, matches: [] };
  }

  const normalizedText = text.toLowerCase();
  let score = 0;
  const matches = [];

  // Check critical keywords
  for (const keyword of CRISIS_KEYWORDS.critical) {
    if (normalizedText.includes(keyword)) {
      score += 10;
      matches.push({ keyword, category: 'critical', weight: 10 });
    }
  }

  // Check warning keywords
  for (const keyword of CRISIS_KEYWORDS.warning) {
    if (normalizedText.includes(keyword)) {
      score += 6;
      matches.push({ keyword, category: 'warning', weight: 6 });
    }
  }

  // Check concerning keywords
  for (const keyword of CRISIS_KEYWORDS.concerning) {
    if (normalizedText.includes(keyword)) {
      score += 3;
      matches.push({ keyword, category: 'concerning', weight: 3 });
    }
  }

  // Determine severity based on score
  let severity = 'low';
  if (score >= 15) {
    severity = 'critical';
  } else if (score >= 10) {
    severity = 'high';
  } else if (score >= 5) {
    severity = 'medium';
  }

  return { severity, score, matches };
}

/**
 * Middleware to monitor mood entries for crisis indicators
 */
exports.monitorMoodEntry = async (req, res, next) => {
  try {
    // Only monitor after successful mood entry creation
    const originalJson = res.json;
    
    res.json = function(body) {
      // Call original json method
      originalJson.call(this, body);
      
      // Perform crisis analysis asynchronously (don't block response)
      if (body.status === 'success' && body.data && req.user) {
        setImmediate(async () => {
          try {
            const moodData = body.data;
            const userId = req.user._id;
            
            // Check if mood rating is critically low (1-2 out of 10)
            if (moodData.rating <= 2) {
              await EmergencyLog.create({
                userId,
                type: 'severe_mood_pattern',
                severity: moodData.rating === 1 ? 'critical' : 'high',
                triggerData: {
                  moodEntryId: moodData._id,
                  metadata: { moodRating: moodData.rating, source: 'mood_entry' }
                },
                responseActions: [{ action: 'resources_provided' }]
              });
            }
            
            // Analyze mood notes for crisis keywords
            if (moodData.notes) {
              const analysis = await analyzeForCrisis(moodData.notes);
              
              if (analysis.severity !== 'low') {
                await EmergencyLog.create({
                  userId,
                  type: 'crisis_text_detected',
                  severity: analysis.severity,
                  triggerData: {
                    moodEntryId: moodData._id,
                    textContent: moodData.notes,
                    metadata: { 
                      matches: analysis.matches, 
                      score: analysis.score,
                      source: 'mood_notes' 
                    }
                  },
                  responseActions: [{ action: 'resources_provided' }]
                });
              }
            }
          } catch (error) {
            console.error('Crisis monitoring error:', error);
          }
        });
      }
    };
    
    next();
  } catch (error) {
    console.error('Crisis monitoring middleware error:', error);
    next(); // Don't block the request on monitoring errors
  }
};

/**
 * Middleware to monitor goal updates for crisis indicators
 */
exports.monitorGoalUpdate = async (req, res, next) => {
  try {
    const originalJson = res.json;
    
    res.json = function(body) {
      originalJson.call(this, body);
      
      if (body.status === 'success' && body.data && req.user) {
        setImmediate(async () => {
          try {
            const goalData = body.data;
            const userId = req.user._id;
            
            // Check for concerning goal descriptions or updates
            const textToAnalyze = [
              goalData.title,
              goalData.description,
              req.body.progressNote
            ].filter(Boolean).join(' ');
            
            if (textToAnalyze) {
              const analysis = await analyzeForCrisis(textToAnalyze);
              
              if (analysis.severity !== 'low') {
                await EmergencyLog.create({
                  userId,
                  type: 'crisis_text_detected',
                  severity: analysis.severity,
                  triggerData: {
                    goalId: goalData._id,
                    textContent: textToAnalyze,
                    metadata: { 
                      matches: analysis.matches, 
                      score: analysis.score,
                      source: 'goal_content' 
                    }
                  },
                  responseActions: [{ action: 'resources_provided' }]
                });
              }
            }
          } catch (error) {
            console.error('Goal crisis monitoring error:', error);
          }
        });
      }
    };
    
    next();
  } catch (error) {
    console.error('Goal monitoring middleware error:', error);
    next();
  }
};

/**
 * Middleware to monitor community posts for crisis indicators
 */
exports.monitorCommunityPost = async (req, res, next) => {
  try {
    const originalJson = res.json;
    
    res.json = function(body) {
      originalJson.call(this, body);
      
      if (body.status === 'success' && body.data && req.user) {
        setImmediate(async () => {
          try {
            const postData = body.data;
            const userId = req.user._id;
            
            // Analyze post content and title
            const textToAnalyze = [postData.title, postData.content].filter(Boolean).join(' ');
            
            if (textToAnalyze) {
              const analysis = await analyzeForCrisis(textToAnalyze);
              
              if (analysis.severity !== 'low') {
                await EmergencyLog.create({
                  userId,
                  type: 'crisis_text_detected',
                  severity: analysis.severity,
                  triggerData: {
                    communityPostId: postData._id,
                    textContent: textToAnalyze,
                    metadata: { 
                      matches: analysis.matches, 
                      score: analysis.score,
                      source: 'community_post' 
                    }
                  },
                  responseActions: [{ action: 'resources_provided' }]
                });
                
                // For critical posts, also flag for moderation
                if (analysis.severity === 'critical') {
                  // Could integrate with moderation system here
                  console.warn(`Critical crisis content detected in post ${postData._id} by user ${userId}`);
                }
              }
            }
          } catch (error) {
            console.error('Community post crisis monitoring error:', error);
          }
        });
      }
    };
    
    next();
  } catch (error) {
    console.error('Community monitoring middleware error:', error);
    next();
  }
};

/**
 * General purpose crisis monitoring middleware
 * Can be applied to any endpoint that might contain user-generated text
 */
exports.monitorUserText = (textFields = ['content', 'description', 'notes', 'message']) => {
  return async (req, res, next) => {
    try {
      const originalJson = res.json;
      
      res.json = function(body) {
        originalJson.call(this, body);
        
        if (body.status === 'success' && req.user) {
          setImmediate(async () => {
            try {
              const userId = req.user._id;
              
              // Extract text from specified fields in request body
              const textToAnalyze = textFields
                .map(field => req.body[field])
                .filter(Boolean)
                .join(' ');
              
              if (textToAnalyze) {
                const analysis = await analyzeForCrisis(textToAnalyze);
                
                if (analysis.severity !== 'low') {
                  await EmergencyLog.create({
                    userId,
                    type: 'crisis_text_detected',
                    severity: analysis.severity,
                    triggerData: {
                      textContent: textToAnalyze,
                      metadata: { 
                        matches: analysis.matches, 
                        score: analysis.score,
                        source: 'user_text',
                        endpoint: req.path
                      }
                    },
                    responseActions: [{ action: 'resources_provided' }]
                  });
                }
              }
            } catch (error) {
              console.error('General text crisis monitoring error:', error);
            }
          });
        }
      };
      
      next();
    } catch (error) {
      console.error('General monitoring middleware error:', error);
      next();
    }
  };
};

module.exports = {
  monitorMoodEntry: exports.monitorMoodEntry,
  monitorGoalUpdate: exports.monitorGoalUpdate,
  monitorCommunityPost: exports.monitorCommunityPost,
  monitorUserText: exports.monitorUserText,
  analyzeForCrisis
};
