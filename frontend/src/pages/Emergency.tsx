import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, MessageSquare, Phone, Globe } from 'lucide-react';

interface EmergencyContact {
  _id: string;
  name: string;
  phoneNumber: string;
  textNumber?: string;
  website?: string;
  description: string;
  category: string;
  availability: string;
  languages: string[];
  priority: number;
}

interface AnalysisResult {
  severity: string;
  score: number;
  matches: Array<{
    word: string;
    weight: number;
    category: string;
  }>;
  contacts: EmergencyContact[];
}

const Emergency: React.FC = () => {
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [helplines, setHelplines] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [helplineLoading, setHelplineLoading] = useState(true);

  useEffect(() => {
    fetchHelplines();
  }, []);

  const fetchHelplines = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/v1/emergency/helplines');
      const data = await response.json();
      if (data.status === 'success') {
        setHelplines(data.data);
      } else {
        // Fallback to default helplines if API doesn't return data
        setHelplines(getDefaultHelplines());
      }
    } catch (error) {
      console.error('Failed to fetch helplines:', error);
      // Fallback to default helplines if API fails
      setHelplines(getDefaultHelplines());
    } finally {
      setHelplineLoading(false);
    }
  };

  const getDefaultHelplines = (): EmergencyContact[] => [
    {
      _id: '1',
      name: 'National Crisis Helpline',
      phoneNumber: '+919999666555',
      textNumber: '+919999666556',
      website: 'https://www.vandrevalafoundation.com/free-counseling',
      description: '24/7 crisis support and suicide prevention hotline providing immediate emotional support',
      category: 'Crisis Support',
      availability: '24/7',
      languages: ['English', 'Hindi'],
      priority: 1
    },
    {
      _id: '2',
      name: 'Student Mental Health Support',
      phoneNumber: '+919999666557',
      website: 'https://www.vandrevalafoundation.com/free-counseling',
      description: 'Specialized support for students dealing with academic stress, anxiety, and depression',
      category: 'Student Support',
      availability: '9 AM - 9 PM',
      languages: ['English', 'Hindi', 'Regional'],
      priority: 2
    },
    {
      _id: '3',
      name: 'Anxiety & Depression Helpline',
      phoneNumber: '+919999666558',
      description: 'Professional counselors available to help with anxiety, depression, and panic attacks',
      category: 'Mental Health',
      availability: '24/7',
      languages: ['English', 'Hindi'],
      priority: 3
    },
    {
      _id: '4',
      name: 'Youth Crisis Support',
      phoneNumber: '+919999666559',
      textNumber: '+919999666560',
      website: 'https://www.iasp.info/suicidalthoughts/',
      description: 'Specialized crisis intervention and support services for young adults and teenagers',
      category: 'Youth Support',
      availability: '24/7',
      languages: ['English', 'Hindi'],
      priority: 4
    }
  ];

  const analyzeText = async () => {
    if (!text.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/v1/emergency/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        setAnalysis(data.data);
      } else {
        // Fallback to AI-powered analysis if API doesn't return success
        const analysisResult = await performBasicAnalysis(text);
        setAnalysis(analysisResult);
      }
    } catch (error) {
      console.error('Failed to analyze text:', error);
      // Fallback to AI-powered analysis if API fails
      const analysisResult = await performBasicAnalysis(text);
      setAnalysis(analysisResult);
    } finally {
      setLoading(false);
    }
  };

  const performBasicAnalysis = async (text: string): Promise<AnalysisResult> => {
    // Try AI-powered analysis first, fallback to rule-based analysis
    try {
      const aiAnalysis = await performOpenAIAnalysis(text);
      if (aiAnalysis) {
        const allHelplines = getDefaultHelplines();
        let relevantContacts = allHelplines;
        
        if (aiAnalysis.severity === 'critical' || aiAnalysis.severity === 'high') {
          relevantContacts = allHelplines.filter(h => 
            h.category === 'Crisis Support' || h.availability === '24/7'
          );
        }
        
        return {
          ...aiAnalysis,
          contacts: relevantContacts.slice(0, 4)
        };
      }
    } catch (error) {
      console.error('AI analysis failed, falling back to rule-based:', error);
    }
    
    // Fallback to enhanced rule-based analysis
    const analysis = performAdvancedAnalysis(text);
    const allHelplines = getDefaultHelplines();
    let relevantContacts = allHelplines;
    
    if (analysis.severity === 'critical' || analysis.severity === 'high') {
      relevantContacts = allHelplines.filter(h => 
        h.category === 'Crisis Support' || h.availability === '24/7'
      );
    }
    
    return {
      ...analysis,
      contacts: relevantContacts.slice(0, 4)
    };
  };

  const performOpenAIAnalysis = async (text: string): Promise<Omit<AnalysisResult, 'contacts'> | null> => {
    const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
    if (!API_KEY) {
      console.warn('OpenAI API key not found, using fallback analysis');
      return null;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a mental health crisis detection AI. Analyze the provided text for mental health risk indicators. 
              
              Respond ONLY with valid JSON in this exact format:
              {
                "severity": "low" | "medium" | "high" | "critical",
                "score": number (0-100),
                "matches": [
                  {"word": "detected phrase", "weight": number, "category": "risk category"}
                ],
                "explanation": "brief explanation of the analysis",
                "immediate_risk": boolean
              }
              
              Severity levels:
              - critical: Immediate suicide risk, self-harm plans, active crisis
              - high: Suicidal ideation, severe depression, crisis language
              - medium: Moderate distress, anxiety, depression symptoms
              - low: Normal stress, mild concerns
              
              Be extremely careful and err on the side of higher risk when in doubt.`
            },
            {
              role: 'user',
              content: text
            }
          ],
          max_tokens: 500,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content;
      
      if (!aiResponse) {
        throw new Error('No response from OpenAI');
      }

      // Parse the JSON response
      const analysisResult = JSON.parse(aiResponse);
      
      return {
        severity: analysisResult.severity,
        score: analysisResult.score,
        matches: analysisResult.matches || []
      };

    } catch (error) {
      console.error('OpenAI analysis error:', error);
      return null;
    }
  };

  const performAdvancedAnalysis = (text: string): Omit<AnalysisResult, 'contacts'> => {
    const lowerText = text.toLowerCase();
    
    // Advanced pattern recognition for crisis detection
    const patterns = {
      suicidal: {
        keywords: ['suicide', 'kill myself', 'end it all', 'want to die', 'better off dead', 'end my life', 'hang myself', 'jump off', 'overdose'],
        phrases: ['no point in living', 'nothing to live for', 'everyone would be better without me', 'tired of living'],
        weight: 15
      },
      selfHarm: {
        keywords: ['cut myself', 'hurt myself', 'harm myself', 'self harm', 'cutting', 'burning myself'],
        phrases: ['want to hurt myself', 'urge to cut'],
        weight: 12
      },
      severe: {
        keywords: ['hopeless', 'worthless', 'useless', 'failure', 'burden', 'trapped', 'desperate'],
        phrases: ['no way out', 'everything is falling apart', 'can\'t take it anymore', 'completely alone'],
        weight: 8
      },
      moderate: {
        keywords: ['depressed', 'sad', 'anxiety', 'panic', 'overwhelmed', 'stressed', 'worried', 'afraid'],
        phrases: ['feeling down', 'hard to cope', 'struggling with', 'having trouble'],
        weight: 4
      },
      mild: {
        keywords: ['tired', 'exhausted', 'frustrated', 'annoyed', 'confused', 'uncertain'],
        phrases: ['not feeling great', 'having a tough time', 'bit stressed'],
        weight: 2
      }
    };
    
    let totalScore = 0;
    let matches: Array<{ word: string; weight: number; category: string }> = [];
    
    // Analyze patterns with contextual understanding
    Object.entries(patterns).forEach(([category, pattern]) => {
      // Check keywords
      pattern.keywords.forEach(keyword => {
        if (lowerText.includes(keyword)) {
          totalScore += pattern.weight;
          matches.push({ word: keyword, weight: pattern.weight, category });
        }
      });
      
      // Check phrases (more sophisticated)
      pattern.phrases.forEach(phrase => {
        if (lowerText.includes(phrase)) {
          totalScore += pattern.weight + 2; // Phrases get bonus weight
          matches.push({ word: phrase, weight: pattern.weight + 2, category });
        }
      });
    });
    
    // Advanced scoring with context awareness
    const negationWords = ['not', 'don\'t', 'won\'t', 'can\'t', 'never'];
    const hasNegation = negationWords.some(word => lowerText.includes(word));
    
    // Multiple crisis indicators increase severity exponentially
    const crisisIndicators = matches.filter(m => m.category === 'suicidal' || m.category === 'selfHarm').length;
    if (crisisIndicators > 1) {
      totalScore += crisisIndicators * 5;
    }
    
    // Context modifiers
    if (lowerText.includes('right now') || lowerText.includes('tonight') || lowerText.includes('today')) {
      totalScore += 8; // Immediate timeframe increases urgency
    }
    
    if (hasNegation && totalScore < 10) {
      totalScore = Math.max(totalScore - 3, 0); // Reduce score for negations in lower-risk cases
    }
    
    // Determine severity with AI-enhanced thresholds
    let severity: string;
    if (totalScore >= 15 || crisisIndicators >= 2) {
      severity = 'critical';
    } else if (totalScore >= 8) {
      severity = 'high';
    } else if (totalScore >= 4) {
      severity = 'medium';
    } else {
      severity = 'low';
    }
    
    // If we detect immediate danger words regardless of score
    const immediateDanger = ['right now', 'tonight', 'today', 'going to', 'about to'];
    const hasSuicidalIntent = matches.some(m => m.category === 'suicidal');
    const hasImmediateTiming = immediateDanger.some(phrase => lowerText.includes(phrase));
    
    if (hasSuicidalIntent && hasImmediateTiming) {
      severity = 'critical';
      totalScore = Math.max(totalScore, 20);
    }
    
    return {
      severity,
      score: totalScore,
      matches
    };
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Emergency Support</h1>
        <p className="mt-2 text-lg text-gray-600">
          24/7 crisis support and mental health resources
        </p>
      </div>

      {/* Crisis Text Analyzer */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <MessageSquare className="w-6 h-6 mr-2" />
          Crisis Text Analysis
        </h2>
        <p className="text-gray-600 mb-4">
          Share what you're feeling and get immediate support recommendations based on your needs.
        </p>
        
        <div className="space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="How are you feeling? Describe what's going through your mind..."
            className="form-input h-32 resize-none"
            maxLength={500}
          />
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">{text.length}/500 characters</span>
            <button 
              onClick={analyzeText}
              disabled={!text.trim() || loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Analyzing...' : 'Get Support'}
            </button>
          </div>
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="mt-6 p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Analysis Results</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(analysis.severity)}`}>
                {analysis.severity.charAt(0).toUpperCase() + analysis.severity.slice(1)} Risk
              </span>
            </div>
            
            {analysis.severity !== 'low' && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  We detected some concerning language in your message. Please consider reaching out to one of the resources below.
                </p>
              </div>
            )}

            {analysis.contacts.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Recommended Resources:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysis.contacts.slice(0, 4).map((contact) => (
                    <div key={contact._id} className="p-3 bg-gray-50 rounded-lg">
                      <h5 className="font-medium text-gray-900 text-sm">{contact.name}</h5>
                      <p className="text-xs text-gray-600 mb-2">{contact.description.slice(0, 80)}...</p>
                      <div className="flex space-x-2">
                        {contact.phoneNumber && (
                          <a href={`tel:${contact.phoneNumber}`} className="text-primary-600 text-xs hover:text-primary-700">
                            📞 {contact.phoneNumber}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Crisis Helplines */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Phone className="w-6 h-6 mr-2" />
          Crisis Helplines
        </h2>
        
        {helplineLoading ? (
          <div className="flex justify-center py-8">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {helplines.slice(0, 6).map((helpline) => (
              <div key={helpline._id} className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors">
                <h3 className="font-semibold text-gray-900 mb-2">{helpline.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{helpline.description.slice(0, 100)}...</p>
                
                <div className="space-y-2">
                  {helpline.phoneNumber && (
                    <a
                      href={`tel:${helpline.phoneNumber}`}
                      className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 text-sm"
                    >
                      <Phone className="w-4 h-4" />
                      <span>{helpline.phoneNumber}</span>
                    </a>
                  )}
                  
                  {helpline.website && (
                    <a
                      href={helpline.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 text-sm"
                    >
                      <Globe className="w-4 h-4" />
                      <span>Visit Website</span>
                    </a>
                  )}
                </div>
                
                <div className="mt-3 flex flex-wrap gap-1">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                    {helpline.availability}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Emergency Notice */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-900 mb-2">In Case of Emergency</h3>
        <p className="text-red-800 mb-4">
          If you or someone you know is in immediate danger, please contact emergency services immediately.
        </p>
        <a
          href="tel:+919999666555"
          className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          <Phone className="w-5 h-5 mr-2" />
          Call +919999666555
        </a>
      </div>
    </div>
  );
};

export default Emergency;
