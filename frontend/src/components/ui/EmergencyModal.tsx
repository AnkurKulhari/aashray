import React, { useEffect, useState } from 'react';
import { X, Phone, MessageCircle, Globe, AlertTriangle } from 'lucide-react';

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

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchEmergencyContacts();
    }
  }, [isOpen]);

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

  const fetchEmergencyContacts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/v1/emergency/helplines');
      const data = await response.json();
      if (data.status === 'success') {
        setContacts(data.data.slice(0, 6)); // Show top 6 contacts
      } else {
        setContacts(getDefaultHelplines());
      }
    } catch (error) {
      console.error('Failed to fetch emergency contacts:', error);
      // Fallback to default helplines
      setContacts(getDefaultHelplines());
    } finally {
      setLoading(false);
    }
  };

  const handleCampusCounseling = () => {
    // In a real app, this would navigate to campus resources or open a link
    alert('Connecting you to campus counseling services...');
    // For now, navigate to community page
    window.location.href = '/community';
  };

  const handlePeerSupport = () => {
    // Navigate to community support groups
    window.location.href = '/community?tab=groups';
  };

  const handleSelfCareTools = () => {
    // Navigate to games/self-care activities
    window.location.href = '/games';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" onClick={onClose} />

        {/* Modal */}
        <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Emergency Support</h2>
                <p className="text-sm text-gray-600">Immediate help is available 24/7</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Emergency Notice */}
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">
              🚨 If you're having thoughts of suicide or are in immediate danger, please call emergency services (+919999666555) or go to your nearest emergency room.
            </p>
          </div>

          {/* Crisis Resources */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Crisis Support Resources</h3>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="spinner"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contacts.map((contact) => (
                  <div key={contact._id} className="card">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{contact.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{contact.description}</p>
                        
                        <div className="space-y-2">
                          {/* Phone */}
                          {contact.phoneNumber && (
                            <a
                              href={`tel:${contact.phoneNumber}`}
                              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                            >
                              <Phone className="w-4 h-4" />
                              <span className="text-sm font-medium">{contact.phoneNumber}</span>
                            </a>
                          )}
                          
                          {/* Text */}
                          {contact.textNumber && (
                            <a
                              href={`sms:${contact.textNumber}`}
                              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                            >
                              <MessageCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">Text: {contact.textNumber}</span>
                            </a>
                          )}
                          
                          {/* Website */}
                          {contact.website && (
                            <a
                              href={contact.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                            >
                              <Globe className="w-4 h-4" />
                              <span className="text-sm font-medium">Visit Website</span>
                            </a>
                          )}
                        </div>
                        
                        <div className="mt-3 flex flex-wrap gap-1">
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                            {contact.availability}
                          </span>
                          {contact.languages.slice(0, 2).map((lang) => (
                            <span key={lang} className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Additional Resources */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Support</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button 
                onClick={handleCampusCounseling}
                className="btn-secondary text-left p-4 hover:bg-gray-100 transition-colors"
              >
                <div className="font-medium">Campus Counseling</div>
                <div className="text-sm text-gray-600">Connect with your school's mental health services</div>
              </button>
              <button 
                onClick={handlePeerSupport}
                className="btn-secondary text-left p-4 hover:bg-gray-100 transition-colors"
              >
                <div className="font-medium">Peer Support</div>
                <div className="text-sm text-gray-600">Talk with trained peer supporters</div>
              </button>
              <button 
                onClick={handleSelfCareTools}
                className="btn-secondary text-left p-4 hover:bg-gray-100 transition-colors"
              >
                <div className="font-medium">Self-Care Tools</div>
                <div className="text-sm text-gray-600">Breathing exercises and coping strategies</div>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              You are not alone. Help is available and things can get better. 💙
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyModal;
