import React, { useState } from 'react';
import { User, Settings, Bell, Shield, Download, Trash2, Edit, Save, X, Camera, Mail, Phone, Calendar, MapPin } from 'lucide-react';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  location?: string;
  bio?: string;
  university?: string;
  major?: string;
  year?: string;
}

interface NotificationSettings {
  moodReminders: boolean;
  goalUpdates: boolean;
  communityActivity: boolean;
  weeklyReports: boolean;
  emergencyAlerts: boolean;
  emailNotifications: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  moodDataSharing: boolean;
  goalSharing: boolean;
  analyticsSharing: boolean;
}

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy' | 'account'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [profile, setProfile] = useState<UserProfile>({
    firstName: 'Jordan',
    lastName: 'Smith',
    email: 'jordan.smith@university.edu',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '2002-03-15',
    location: 'Boston, MA',
    bio: 'Psychology major interested in mental health advocacy and peer support.',
    university: 'University of Boston',
    major: 'Psychology',
    year: 'Junior'
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    moodReminders: true,
    goalUpdates: true,
    communityActivity: false,
    weeklyReports: true,
    emergencyAlerts: true,
    emailNotifications: true
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'friends',
    moodDataSharing: false,
    goalSharing: true,
    analyticsSharing: false
  });

  const [editProfile, setEditProfile] = useState<UserProfile>(profile);

  const handleSaveProfile = () => {
    setProfile(editProfile);
    setIsEditing(false);
    // In a real app, this would save to backend
    console.log('Profile updated:', editProfile);
  };

  const handleCancelEdit = () => {
    setEditProfile(profile);
    setIsEditing(false);
  };

  const handleNotificationChange = (key: keyof NotificationSettings, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    // In a real app, this would save to backend immediately
    console.log('Notification setting updated:', key, value);
  };

  const handlePrivacyChange = (key: keyof PrivacySettings, value: any) => {
    setPrivacy(prev => ({ ...prev, [key]: value }));
    // In a real app, this would save to backend immediately
    console.log('Privacy setting updated:', key, value);
  };

  const handleExportData = () => {
    // In a real app, this would trigger a data export
    alert('Data export will be emailed to you within 24 hours.');
  };

  const handleDeleteAccount = () => {
    // In a real app, this would delete the account
    alert('Account deletion process initiated. You will receive a confirmation email.');
    setShowDeleteConfirm(false);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'account', label: 'Account', icon: Settings }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="card p-6">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {profile.firstName[0]}{profile.lastName[0]}
            </div>
            <button className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50">
              <Camera className="w-3 h-3 text-gray-600" />
            </button>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">{profile.firstName} {profile.lastName}</h2>
            <p className="text-gray-600">{profile.bio}</p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              {profile.university && (
                <span className="flex items-center space-x-1">
                  <span>🎓</span>
                  <span>{profile.university}</span>
                </span>
              )}
              {profile.location && (
                <span className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.location}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              <button
                onClick={() => isEditing ? handleCancelEdit() : setIsEditing(true)}
                className={`flex items-center space-x-2 ${isEditing ? 'btn-secondary' : 'btn-primary'}`}
              >
                {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                <span>{isEditing ? 'Cancel' : 'Edit'}</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  value={isEditing ? editProfile.firstName : profile.firstName}
                  onChange={(e) => setEditProfile({ ...editProfile, firstName: e.target.value })}
                  disabled={!isEditing}
                  className={`form-input ${!isEditing ? 'bg-gray-50' : ''}`}
                />
              </div>
              <div>
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  value={isEditing ? editProfile.lastName : profile.lastName}
                  onChange={(e) => setEditProfile({ ...editProfile, lastName: e.target.value })}
                  disabled={!isEditing}
                  className={`form-input ${!isEditing ? 'bg-gray-50' : ''}`}
                />
              </div>
              <div>
                <label className="form-label">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={isEditing ? editProfile.email : profile.email}
                    onChange={(e) => setEditProfile({ ...editProfile, email: e.target.value })}
                    disabled={!isEditing}
                    className={`form-input pl-10 ${!isEditing ? 'bg-gray-50' : ''}`}
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={isEditing ? (editProfile.phone || '') : (profile.phone || '')}
                    onChange={(e) => setEditProfile({ ...editProfile, phone: e.target.value })}
                    disabled={!isEditing}
                    className={`form-input pl-10 ${!isEditing ? 'bg-gray-50' : ''}`}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Date of Birth</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={isEditing ? (editProfile.dateOfBirth || '') : (profile.dateOfBirth || '')}
                    onChange={(e) => setEditProfile({ ...editProfile, dateOfBirth: e.target.value })}
                    disabled={!isEditing}
                    className={`form-input pl-10 ${!isEditing ? 'bg-gray-50' : ''}`}
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={isEditing ? (editProfile.location || '') : (profile.location || '')}
                    onChange={(e) => setEditProfile({ ...editProfile, location: e.target.value })}
                    disabled={!isEditing}
                    className={`form-input pl-10 ${!isEditing ? 'bg-gray-50' : ''}`}
                    placeholder="City, State"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <label className="form-label">Bio</label>
              <textarea
                value={isEditing ? (editProfile.bio || '') : (profile.bio || '')}
                onChange={(e) => setEditProfile({ ...editProfile, bio: e.target.value })}
                disabled={!isEditing}
                rows={3}
                className={`form-input ${!isEditing ? 'bg-gray-50' : ''}`}
                placeholder="Tell us about yourself..."
              />
            </div>
            
            {isEditing && (
              <div className="flex justify-end space-x-3 mt-6">
                <button onClick={handleSaveProfile} className="btn-primary flex items-center space-x-2">
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            )}
          </div>

          {/* Academic Information */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Academic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="form-label">University</label>
                <input
                  type="text"
                  value={isEditing ? (editProfile.university || '') : (profile.university || '')}
                  onChange={(e) => setEditProfile({ ...editProfile, university: e.target.value })}
                  disabled={!isEditing}
                  className={`form-input ${!isEditing ? 'bg-gray-50' : ''}`}
                  placeholder="Your university"
                />
              </div>
              <div>
                <label className="form-label">Major</label>
                <input
                  type="text"
                  value={isEditing ? (editProfile.major || '') : (profile.major || '')}
                  onChange={(e) => setEditProfile({ ...editProfile, major: e.target.value })}
                  disabled={!isEditing}
                  className={`form-input ${!isEditing ? 'bg-gray-50' : ''}`}
                  placeholder="Your major"
                />
              </div>
              <div>
                <label className="form-label">Academic Year</label>
                <select
                  value={isEditing ? (editProfile.year || '') : (profile.year || '')}
                  onChange={(e) => setEditProfile({ ...editProfile, year: e.target.value })}
                  disabled={!isEditing}
                  className={`form-input ${!isEditing ? 'bg-gray-50' : ''}`}
                >
                  <option value="">Select year</option>
                  <option value="Freshman">Freshman</option>
                  <option value="Sophomore">Sophomore</option>
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                  <option value="Graduate">Graduate</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h3>
          <div className="space-y-6">
            {Object.entries(notifications).map(([key, value]) => {
              const labels = {
                moodReminders: 'Daily mood check-in reminders',
                goalUpdates: 'Goal progress and milestone updates',
                communityActivity: 'New community posts and replies',
                weeklyReports: 'Weekly mental health reports',
                emergencyAlerts: 'Emergency support alerts',
                emailNotifications: 'Email notifications'
              };
              
              const descriptions = {
                moodReminders: 'Get gentle reminders to log your daily mood',
                goalUpdates: 'Stay updated on your goal achievements and deadlines',
                communityActivity: 'Be notified of new discussions and replies',
                weeklyReports: 'Receive weekly insights about your progress',
                emergencyAlerts: 'Important safety and crisis support notifications',
                emailNotifications: 'Receive notifications via email'
              };
              
              return (
                <div key={key} className="flex items-start space-x-3">
                  <label className="flex items-center space-x-3 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => handleNotificationChange(key as keyof NotificationSettings, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{labels[key as keyof typeof labels]}</div>
                      <div className="text-sm text-gray-600">{descriptions[key as keyof typeof descriptions]}</div>
                    </div>
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'privacy' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Privacy Settings</h3>
            <div className="space-y-6">
              <div>
                <label className="form-label">Profile Visibility</label>
                <select
                  value={privacy.profileVisibility}
                  onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                  className="form-input"
                >
                  <option value="public">Public - Anyone can see your profile</option>
                  <option value="friends">Friends only - Only people you connect with</option>
                  <option value="private">Private - Only you can see your profile</option>
                </select>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <label className="flex items-center space-x-3 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={privacy.moodDataSharing}
                      onChange={(e) => handlePrivacyChange('moodDataSharing', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Share mood data for research</div>
                      <div className="text-sm text-gray-600">Help improve mental health tools with anonymous data</div>
                    </div>
                  </label>
                </div>
                
                <div className="flex items-start space-x-3">
                  <label className="flex items-center space-x-3 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={privacy.goalSharing}
                      onChange={(e) => handlePrivacyChange('goalSharing', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Share goals with community</div>
                      <div className="text-sm text-gray-600">Let others see and support your wellness goals</div>
                    </div>
                  </label>
                </div>
                
                <div className="flex items-start space-x-3">
                  <label className="flex items-center space-x-3 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={privacy.analyticsSharing}
                      onChange={(e) => handlePrivacyChange('analyticsSharing', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Share analytics data</div>
                      <div className="text-sm text-gray-600">Help us improve the app with usage analytics</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'account' && (
        <div className="space-y-6">
          {/* Data Management */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Data Management</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Export Your Data</h4>
                  <p className="text-sm text-gray-600">Download a copy of all your data including mood entries, goals, and analytics</p>
                </div>
                <button onClick={handleExportData} className="btn-secondary flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Actions</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <h4 className="font-medium text-red-900">Delete Account</h4>
                  <p className="text-sm text-red-700">Permanently delete your account and all associated data</p>
                </div>
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md m-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Delete Account</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
