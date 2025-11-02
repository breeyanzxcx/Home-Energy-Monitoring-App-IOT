import React, { useState, useEffect, useCallback, useRef } from 'react';
import dashboardIcon from '../assets/icons/dashboard.svg';
import applianceIcon from '../assets/icons/add.svg';
import profileIcon from '../assets/icons/profile.svg';
import logoutIcon from '../assets/icons/logout.svg';
import locationIcon from '../assets/icons/location.svg';
import applianceStatsIcon from '../assets/icons/appliance.svg';
import energyIcon from '../assets/icons/energy.svg';
import anomalyIcon from '../assets/icons/anomaly.svg';

const API_BASE = 'http://localhost:5000/api';
const SERVER_BASE = 'http://localhost:5000';

// Simple SVG placeholder as data URL
const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E";

const NavItem = ({ onClick, src, label }) => (
  <div
    onClick={onClick}
    className="w-12 h-12 flex items-center justify-center rounded-md mb-3
               bg-blue-500 bg-opacity-100 text-white cursor-pointer
               hover:bg-blue-500 hover:bg-opacity-70 hover:text-yellow-300
               transition-all duration-200"
    title={label}
  >
    <img src={src} alt={label} className="w-6 h-6" />
  </div>
);

const ProfileField = ({ label, value, icon, className = "" }) => (
  <div className={`mb-4 ${className}`}>
    <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </label>
    <div className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800">
      {value || '—'}
    </div>
  </div>
);

// Ultra-robust ActivityCard with full space detection
const ActivityCard = ({ 
  title, 
  count, 
  icon, 
  color, 
  hoverData, 
  loading 
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState('bottom');
  const cardRef = useRef(null);

  // Limit hover data to 3 items
  const limitedHoverData = hoverData ? hoverData.slice(0, 3) : [];

  const handleMouseEnter = () => {
    if (cardRef.current && limitedHoverData.length > 0) {
      const rect = cardRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Check available space in all directions
      const spaceAbove = rect.top;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceLeft = rect.left;
      const spaceRight = viewportWidth - rect.right;
      
      // Tooltip dimensions
      const tooltipHeight = 180;
      const tooltipWidth = 288; // 72 * 4 (w-72 = 288px)
      const buffer = 20;
      
      // Determine best position
      let bestPosition = 'bottom';
      
      // Check if bottom has enough space
      if (spaceBelow >= tooltipHeight + buffer) {
        bestPosition = 'bottom';
      } 
      // If not enough space below but enough above, use top
      else if (spaceAbove >= tooltipHeight + buffer) {
        bestPosition = 'top';
      }
      // If neither top nor bottom have enough space, use the one with more space
      else if (spaceAbove > spaceBelow) {
        bestPosition = 'top';
      }
      // Default to bottom
      else {
        bestPosition = 'bottom';
      }
      
      setTooltipPosition(bestPosition);
    }
    setShowTooltip(true);
  };

  const getTooltipPositionClass = () => {
    switch (tooltipPosition) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-3';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-3';
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 mt-3';
    }
  };

  const getArrowPositionClass = () => {
    switch (tooltipPosition) {
      case 'top':
        return 'top-full left-1/2 transform -translate-x-1/2 -translate-y-1 rotate-45 border-l border-t border-gray-200';
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 translate-y-1 rotate-45 border-r border-b border-gray-200';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 translate-y-1 rotate-45 border-r border-b border-gray-200';
    }
  };

  return (
    <div className="relative" ref={cardRef}>
      <div 
        className={`bg-gradient-to-br ${color} p-4 rounded-xl text-center transform hover:scale-105 transition-all duration-300 cursor-pointer min-h-[120px] flex flex-col justify-center`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="flex justify-center mb-2">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <img 
              src={icon} 
              alt={title} 
              className="w-6 h-6"
              style={{ 
                filter: 'brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)'
              }}
            />
          </div>
        </div>
        <div className="text-3xl font-bold text-white mb-1">
          {loading ? '...' : count}
        </div>
        <div className="text-sm text-white/90 font-medium">{title}</div>
      </div>

      {/* Dynamic Tooltip */}
      {showTooltip && limitedHoverData.length > 0 && (
        <div className={`absolute z-50 ${getTooltipPositionClass()}`}>
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-72">
            <div className="text-sm font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-100">
              {title} Overview
              {hoverData && hoverData.length > 3 && (
                <span className="text-xs font-normal text-gray-500 ml-2">
                  (showing 3 of {hoverData.length})
                </span>
              )}
            </div>
            <div className="space-y-3">
              {limitedHoverData.map((item, index) => (
                <div key={index} className="flex items-start justify-between group">
                  <span className="text-xs font-medium text-gray-600 flex-shrink-0 mr-3 pt-0.5">
                    {item.label}
                  </span>
                  <span 
                    className={`text-xs text-right break-words max-w-[180px] ${
                      item.highlight 
                        ? 'text-green-600 font-semibold' 
                        : 'text-gray-800'
                    } ${
                      item.value && item.value.length > 30 ? 'leading-relaxed' : 'leading-tight'
                    }`}
                    title={item.value}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
            {/* Dynamic arrow */}
            <div className={`absolute w-3 h-3 bg-white ${getArrowPositionClass()}`}></div>
          </div>
        </div>
      )}
    </div>
  );
};

const EditProfileModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    notification_preferences: user.notification_preferences || {
      email: true,
      push: false,
      in_app: true,
    },
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE}/users/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          notification_preferences: formData.notification_preferences
        }),
      });
      
      if (res.ok) {
        const updated = await res.json();
        onSave(updated);
        onClose();
      } else {
        const errorData = await res.json();
        console.error('Failed to update profile:', errorData);
        alert('Failed to update profile. Please try again.');
      }
    } catch (err) {
      console.error('Failed to update profile', err);
      alert('Failed to update profile. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Profile</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              readOnly
              className="w-full p-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Notification Preferences</label>
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={formData.notification_preferences.email}
                onChange={(e) => setFormData({
                  ...formData,
                  notification_preferences: { ...formData.notification_preferences, email: e.target.checked }
                })}
                className="mr-2 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Email Notifications</span>
            </label>
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={formData.notification_preferences.push}
                onChange={(e) => setFormData({
                  ...formData,
                  notification_preferences: { ...formData.notification_preferences, push: e.target.checked }
                })}
                className="mr-2 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Push Notifications</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.notification_preferences.in_app}
                onChange={(e) => setFormData({
                  ...formData,
                  notification_preferences: { ...formData.notification_preferences, in_app: e.target.checked }
                })}
                className="mr-2 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">In-App Alerts</span>
            </label>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              )}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, type, itemName }) => {
  if (!isOpen) return null;

  const getModalContent = () => {
    switch (type) {
      case 'profilePicture':
        return {
          title: 'Delete Profile Picture',
          message: 'Are you sure you want to delete your profile picture?',
          confirmText: 'Delete Picture'
        };
      case 'account':
        return {
          title: 'Delete Account',
          message: 'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.',
          confirmText: 'Delete Account'
        };
      default:
        return {
          title: 'Confirm Deletion',
          message: 'Are you sure you want to delete this item?',
          confirmText: 'Delete'
        };
    }
  };

  const content = getModalContent();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3">{content.title}</h3>
        <p className="text-gray-600 mb-6">{content.message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            {content.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const Profile = ({ onSwitch }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeletePictureConfirm, setShowDeletePictureConfirm] = useState(false);
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activityLoading, setActivityLoading] = useState(true);

  const [user, setUser] = useState({
    name: '',
    email: '',
    profilePicture: null,
    notification_preferences: { email: true, push: false, in_app: true },
  });

  const [activity, setActivity] = useState({
    locations: 0,
    appliances: 0,
    logs: 0,
    anomalies: 0,
  });

  const [activityDetails, setActivityDetails] = useState({
    locations: [],
    appliances: [],
    energy: [],
    anomalies: []
  });

  // ---------- FETCH PROFILE ----------
  const fetchProfileData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoading(true);
    setActivityLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const fetchOptions = { headers, cache: 'no-cache' };
      
      // Fetch data in parallel
      const [profileRes, homesRes, appliancesRes, energyRes, anomaliesRes] = await Promise.all([
        fetch(`${API_BASE}/users/profile`, fetchOptions),
        fetch(`${API_BASE}/homes`, fetchOptions),
        fetch(`${API_BASE}/appliances`, fetchOptions),
        fetch(`${API_BASE}/energy?limit=5&sort=-recorded_at`, fetchOptions),
        fetch(`${API_BASE}/anomalies?limit=5&sort=-detected_at`, fetchOptions)
      ]);

      const profile = profileRes.ok ? await profileRes.json() : {};
      const homes = homesRes.ok ? await homesRes.json() : [];
      const appliances = appliancesRes.ok ? await appliancesRes.json() : [];
      const energyReadings = energyRes.ok ? await energyRes.json() : [];
      const anomalies = anomaliesRes.ok ? await anomaliesRes.json() : [];

      // Build full picture URL
      const picPath = profile.profilePicture;
      const fullPic = picPath
        ? picPath.startsWith('http')
          ? picPath
          : `${SERVER_BASE}${picPath.startsWith('/') ? '' : '/'}${picPath}`
        : null;

      setUser({
        name: profile.name || '',
        email: profile.email || '',
        profilePicture: fullPic,
        notification_preferences: profile.notification_preferences || { email: true, push: false, in_app: true },
      });

      // Set activity counts
      setActivity({
        locations: Array.isArray(homes) ? homes.length : 0,
        appliances: Array.isArray(appliances) ? appliances.length : 0,
        logs: Array.isArray(energyReadings) ? energyReadings.length : 0,
        anomalies: Array.isArray(anomalies) ? anomalies.length : 0,
      });

      // Set detailed activity data for hover tooltips
      setActivityDetails({
        // Locations - just show home names and creation dates
        locations: homes.slice(0, 3).map(home => ({
          name: home.name,
          createdAt: new Date(home.createdAt || home.created_at).toLocaleDateString()
        })),
        
        // Appliances - show name and type only (no room assignment)
        appliances: appliances.slice(0, 3).map(appliance => ({
          name: appliance.name,
          type: appliance.type || 'General'
        })),
        
        // Energy logs - show recent readings without summarization
        energy: energyReadings.slice(0, 3).map(reading => ({
          appliance: reading.applianceId?.name || 'Unknown Appliance',
          energy: (reading.energy || 0).toFixed(2),
          recorded: new Date(reading.recorded_at).toLocaleDateString()
        })),
        
        // Anomalies - use the actual API response structure
        anomalies: anomalies.slice(0, 3).map(anomaly => ({
          type: anomaly.alert_type?.replace('_', ' ') || 'Unknown',
          severity: anomaly.severity,
          appliance: anomaly.applianceId?.name || 'System',
          detected: new Date(anomaly.detected_at).toLocaleDateString(),
          description: anomaly.description?.substring(0, 50) + '...' || 'No description'
        }))
      });

    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
      setActivityLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  // ---------- UPLOAD PICTURE ----------
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Please select an image smaller than 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('profilePicture', file);
    setUploading(true);

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE}/users/profile/picture`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      
      if (res.ok) {
        const updated = await res.json();
        const picPath = updated.profilePicture;
        const fullPic = picPath
          ? picPath.startsWith('http')
            ? picPath
            : `${SERVER_BASE}${picPath.startsWith('/') ? '' : '/'}${picPath}`
          : null;
        setUser((u) => ({ ...u, profilePicture: fullPic }));
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to upload picture');
      }
    } catch (err) {
      console.error('Upload failed', err);
      alert('Failed to upload picture. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // ---------- DELETE PICTURE ----------
  const handleDeletePicture = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE}/users/profile/picture`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        setUser((u) => ({ ...u, profilePicture: null }));
        setShowDeletePictureConfirm(false);
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to delete picture');
      }
    } catch (err) {
      console.error('Delete failed', err);
      alert('Failed to delete picture. Please try again.');
    }
  };

  // ---------- DELETE ACCOUNT ----------
  const handleDeleteAccount = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        localStorage.removeItem('token');
        localStorage.removeItem('selectedHomeIndex');
        setShowDeleteAccountConfirm(false);
        onSwitch('login');
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to delete account');
      }
    } catch (err) {
      console.error('Delete account failed', err);
      alert('Failed to delete account. Please try again.');
    }
  };

  const bgUrl = "https://images.unsplash.com/photo-1501183638710-841dd1904471?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170";

  return (
    <div className="h-screen w-screen overflow-hidden relative font-sans">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgUrl})` }}
      />
      <div className="absolute inset-0 bg-black opacity-60 backdrop-blur-sm" />

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full z-30 flex items-center">
        <div className="relative h-64 w-32 flex items-center group cursor-pointer">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-blue-600 rounded-r-full flex items-center justify-center shadow-lg transition-all duration-300 z-10
                          group-hover:opacity-0 group-hover:-translate-x-8">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 opacity-0 invisible
                          group-hover:translate-x-8 group-hover:opacity-100 group-hover:visible
                          transition-all duration-300 ease-out pointer-events-auto">
            <div className="bg-white p-3 rounded-lg shadow-lg flex flex-col items-center backdrop-blur-sm">
              <NavItem onClick={() => onSwitch('dashboard')} src={dashboardIcon} label="Dashboard" />
              <NavItem onClick={() => onSwitch('appliance')} src={applianceIcon} label="Appliances" />
              <NavItem onClick={() => onSwitch('profile')} src={profileIcon} label="Profile" />
              <NavItem onClick={() => setShowLogoutConfirm(true)} src={logoutIcon} label="Logout" />
            </div>
          </div>
        </div>
      </aside>

      {/* Confirmation Modals */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 w-full">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Confirm Logout</h3>
            <p className="text-gray-600 mb-6 text-center">Are you sure you want to logout?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 rounded border border-gray-300 hover:border-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('selectedHomeIndex');
                  onSwitch('login');
                }}
                className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={showDeletePictureConfirm}
        onClose={() => setShowDeletePictureConfirm(false)}
        onConfirm={handleDeletePicture}
        type="profilePicture"
      />

      <DeleteConfirmationModal
        isOpen={showDeleteAccountConfirm}
        onClose={() => setShowDeleteAccountConfirm(false)}
        onConfirm={handleDeleteAccount}
        type="account"
      />

      {/* Edit Modal */}
      {showEditModal && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditModal(false)}
          onSave={(updated) => {
            const picPath = updated.profilePicture;
            const fullPic = picPath
              ? picPath.startsWith('http')
                ? picPath
                : `${SERVER_BASE}${picPath.startsWith('/') ? '' : '/'}${picPath}`
              : null;
            setUser({ ...updated, profilePicture: fullPic });
            setShowEditModal(false);
          }}
        />
      )}

      {/* Main Content */}
      <div className="relative z-10 h-full w-full flex items-start justify-center overflow-y-auto">
        <div className="w-[94%] max-w-[1200px] mt-6 pb-6">
          <h1 className="text-3xl tracking-wider font-bold text-white text-center mb-6">
            PROFILE
          </h1>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-white text-xl">Loading profile...</div>
            </div>
          ) : (
            <>
              {/* User Header */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6 flex items-center justify-between shadow-xl">
                <div className="flex items-center">
                  <div className="relative">
                    <img
                      src={user.profilePicture || PLACEHOLDER}
                      alt="Profile"
                      className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover bg-gray-200"
                      onError={(e) => {
                        console.error('Profile picture failed to load, using placeholder');
                        e.target.src = PLACEHOLDER;
                      }}
                    />
                    {uploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                      </div>
                    )}
                  </div>
                  <div className="ml-5">
                    <h2 className="text-2xl font-bold text-white">{user.name || 'User'}</h2>
                    <p className="text-blue-200">{user.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="upload"
                    />
                    <div className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                      </svg>
                      Upload
                    </div>
                  </label>
                  {user.profilePicture && (
                    <button
                      onClick={() => setShowDeletePictureConfirm(true)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  )}
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11 12a2 2 0 002 2h12a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 font-bold text-lg">
                    PERSONAL INFORMATION
                  </div>
                  <div className="p-6 space-y-4">
                    <ProfileField label="Name" value={user.name} />
                    <ProfileField label="Email" value={user.email} />
                    <div className="pt-2">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Notification Preferences</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Email Alerts</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${user.notification_preferences?.email ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                            {user.notification_preferences?.email ? 'ON' : 'OFF'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Push Notifications</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${user.notification_preferences?.push ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                            {user.notification_preferences?.push ? 'ON' : 'OFF'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>In-App Alerts</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${user.notification_preferences?.in_app ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                            {user.notification_preferences?.in_app ? 'ON' : 'OFF'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity Overview */}
                <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-600 text-white px-6 py-3 font-bold text-lg">
                    ACTIVITY OVERVIEW
                  </div>
                  <div className="p-6 grid grid-cols-2 gap-4">
                    <ActivityCard
                      title="Location(s)"
                      count={activity.locations}
                      icon={locationIcon}
                      color="from-blue-500 to-blue-600"
                      loading={activityLoading}
                      hoverData={[
                        ...activityDetails.locations.map((home, index) => ({
                          label: `📍 ${home.name}`,
                          value: `Created: ${home.createdAt}`,
                          highlight: index === 0
                        })),
                        activity.locations > 3 && {
                          label: 'Total Locations',
                          value: `${activity.locations} homes`,
                          highlight: true
                        }
                      ].filter(Boolean).slice(0, 3)}
                    />

                    <ActivityCard
                      title="Appliance(s)"
                      count={activity.appliances}
                      icon={applianceStatsIcon}
                      color="from-green-500 to-green-600"
                      loading={activityLoading}
                      hoverData={[
                        ...activityDetails.appliances.map((appliance, index) => ({
                          label: `⚡ ${appliance.name}`,
                          value: `${appliance.type}`,
                          highlight: index === 0
                        })),
                        activity.appliances > 3 && {
                          label: 'Total Appliances',
                          value: `${activity.appliances} devices`,
                          highlight: true
                        }
                      ].filter(Boolean).slice(0, 3)}
                    />

                    <ActivityCard
                      title="Energy Log(s)"
                      count={activity.logs}
                      icon={energyIcon}
                      color="from-yellow-500 to-yellow-600"
                      loading={activityLoading}
                      hoverData={[
                        ...activityDetails.energy.map((reading, index) => ({
                          label: `📊 ${reading.appliance}`,
                          value: `${reading.energy} kWh • ${reading.recorded}`,
                          highlight: index === 0
                        })),
                        activity.logs > 3 && {
                          label: 'Total Logs',
                          value: `${activity.logs} readings`,
                          highlight: true
                        }
                      ].filter(Boolean).slice(0, 3)}
                    />

                    <ActivityCard
                      title="Anomalie(s)"
                      count={activity.anomalies}
                      icon={anomalyIcon}
                      color="from-red-500 to-red-600"
                      loading={activityLoading}
                      hoverData={[
                        ...activityDetails.anomalies.map((anomaly, index) => ({
                          label: `🚨 ${anomaly.appliance}`,
                          value: `${anomaly.severity} • ${anomaly.type}`,
                          highlight: anomaly.severity === 'high'
                        })),
                        activity.anomalies > 3 && {
                          label: 'Total Anomalies',
                          value: `${activity.anomalies} detected`,
                          highlight: true
                        }
                      ].filter(Boolean).slice(0, 3)}
                    />
                  </div>
                </div>
              </div>

              {/* Account Actions */}
              <div className="bg-white rounded-xl shadow-xl overflow-hidden mt-6">
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 font-bold text-lg">
                  ACCOUNT ACTIONS
                </div>
                <div className="p-6">
                  <div className="flex flex-col space-y-4">
                    {/* Delete Account Section */}
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-800 text-left">Delete Account</h4>
                        <p className="text-gray-600 text-sm mt-1 text-left">
                          Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowDeleteAccountConfirm(true)}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ml-6 flex-shrink-0"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;