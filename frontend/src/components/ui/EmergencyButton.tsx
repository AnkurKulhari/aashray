import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import EmergencyModal from './EmergencyModal';

const EmergencyButton: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  const handleEmergencyClick = () => {
    setShowModal(true);
    
    // Log the emergency button press to backend
    fetch('http://localhost:3001/api/v1/emergency/button', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'demo-user-id', // In real app, get from auth context
      }),
    }).catch(console.error);
  };

  return (
    <>
      {/* Emergency Button */}
      <button
        onClick={handleEmergencyClick}
        className="fixed bottom-6 right-6 z-50 btn-emergency flex items-center space-x-2 animate-pulse-slow"
        aria-label="Emergency Help"
      >
        <AlertTriangle className="w-6 h-6" />
        <span className="hidden sm:inline">Emergency</span>
      </button>

      {/* Emergency Modal */}
      <EmergencyModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </>
  );
};

export default EmergencyButton;
