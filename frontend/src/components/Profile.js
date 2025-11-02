import React, { useState, useEffect, useCallback } from 'react';
import dashboardIcon from '../assets/icons/dashboard.svg';
import applianceIcon from '../assets/icons/add.svg';
import profileIcon from '../assets/icons/profile.svg';
import logoutIcon from '../assets/icons/logout.svg';

const API_BASE = 'http://localhost:5000/api';
const SERVER_BASE = 'http://localhost:5000';   // <-- for static files (uploads)

const PLACEHOLDER = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAXEAAAFxCAYAAACFh5ikAAAAOXRFWHRTb2Z0d2FyZQBNYXRwbG90bGliIHZlcnNpb24zLjYuMywgaHR0cHM6Ly9tYXRwbG90bGliLm9yZy/P9b71AAAACXBIWXMAAA9hAAAPYQGoP6dpAAAFLElEQVR4nO3UwQ3AIBDAsNLJb3PYgQ+KZE+QV9bM7A+ApP91AAD3TBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwgzMQBwkwcIMzEAcJMHCDMxAHCTBwg7AD6YQVhi2hUOQAAAABJRU5ErkJggg==';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE}/users/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const updated = await res.json();
        onSave(updated);
        onClose();
      }
    } catch (err) {
      console.error('Failed to update profile', err);
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
              className="w-full p-2 bg-gray-100 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Notifications</label>
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={formData.notification_preferences.email}
                onChange={(e) => setFormData({
                  ...formData,
                  notification_preferences: { ...formData.notification_preferences, email: e.target.checked }
                })}
                className="mr-2"
              />
              <span className="text-sm">Email Notifications</span>
            </label>
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={formData.notification_preferences.push}
                onChange={(e) => setFormData({
                  ...formData,
                  notification_preferences: { ...formData.notification_preferences, push: e.target.checked }
                })}
                className="mr-2"
              />
              <span className="text-sm">Push Notifications</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.notification_preferences.in_app}
                onChange={(e) => setFormData({
                  ...formData,
                  notification_preferences: { ...formData.notification_preferences, in_app: e.target.checked }
                })}
                className="mr-2"
              />
              <span className="text-sm">In-App Alerts</span>
            </label>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Profile = ({ onSwitch }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

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

  // ---------- FETCH PROFILE ----------
  const fetchProfileData = useCallback(async () => {
  const token = localStorage.getItem('token');
  if (!token) return;
  setLoading(true);
  try {
    const headers = { Authorization: `Bearer ${token}` };
    const fetchOptions = { headers, cache: 'no-cache' };  // Add this to all
    const [profileRes, homesRes, appliancesRes, energyRes, anomaliesRes] = await Promise.all([
      fetch(`${API_BASE}/users/profile`, fetchOptions),
      fetch(`${API_BASE}/homes`, fetchOptions),
      fetch(`${API_BASE}/appliances`, fetchOptions),
      fetch(`${API_BASE}/energy`, fetchOptions),
      fetch(`${API_BASE}/anomalies?limit=100`, fetchOptions),
    ]);

      const profile = profileRes.ok ? await profileRes.json() : {};
      const homes = homesRes.ok ? await homesRes.json() : [];
      const appliances = appliancesRes.ok ? await appliancesRes.json() : [];
      const readings = energyRes.ok ? await energyRes.json() : [];
      const anomalies = anomaliesRes.ok ? await anomaliesRes.json() : [];

      // ----- Build full picture URL -----
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

      setActivity({
        locations: Array.isArray(homes) ? homes.length : 0,
        appliances: Array.isArray(appliances) ? appliances.length : 0,
        logs: Array.isArray(readings) ? readings.length : 0,
        anomalies: Array.isArray(anomalies) ? anomalies.length : 0,
      });
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  // ---------- UPLOAD PICTURE ----------
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

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
}
    } catch (err) {
      console.error('Upload failed', err);
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
      }
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const bgUrl = "https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=2000&q=80";

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

      {/* Logout Modal */}
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
                onClick={() => onSwitch('login')}
                className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

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
                      src={user.profilePicture ? `${user.profilePicture}?t=${new Date().getTime()}` : PLACEHOLDER}
                      alt="Profile"
                      className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                      onError={(e) => {
                        console.error('Profile picture failed to load:', e.target.src, ' - Check if the file is a valid image at the URL.');
                        if (!e.target.src.startsWith('data:')) {
                          e.target.src = PLACEHOLDER;
                        }
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
                      onClick={handleDeletePicture}
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
                    <ProfileField label="" value={user.name} icon="Name" />
                    <ProfileField label="" value={user.email} icon="Email" />
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
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl text-center transform hover:scale-105 transition-transform">
                      <div className="text-3xl font-bold text-blue-700">{activity.locations}</div>
                      <div className="text-sm text-blue-600 mt-1">Location(s)</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl text-center transform hover:scale-105 transition-transform">
                      <div className="text-3xl font-bold text-green-700">{activity.appliances}</div>
                      <div className="text-sm text-green-600 mt-1">Appliance(s)</div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl text-center transform hover:scale-105 transition-transform">
                      <div className="text-3xl font-bold text-yellow-700">{activity.logs}</div>
                      <div className="text-sm text-yellow-600 mt-1">Energy Log(s)</div>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl text-center transform hover:scale-105 transition-transform">
                      <div className="text-3xl font-bold text-red-700">{activity.anomalies}</div>
                      <div className="text-sm text-red-600 mt-1">Anomalie(s)</div>
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