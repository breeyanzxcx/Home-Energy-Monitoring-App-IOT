import React, { useState } from 'react';

// Sidebar icon wrapper
const LeftIcon = ({ children, onClick }) => (
  <div
    onClick={onClick}
    className="w-12 h-12 flex items-center justify-center rounded-md mb-3 bg-black bg-opacity-40 text-white cursor-pointer hover:bg-opacity-60"
  >
    {children}
  </div>
);

const ProfileField = ({ label, value, placeholder, icon }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </label>
    <input
      type="text"
      value={value || ''}
      placeholder={placeholder}
      className="w-full p-2 border border-gray-200 rounded-lg bg-white"
      readOnly
    />
  </div>
);

const Profile = ({ onSwitch }) => {
  const [userImage, setUserImage] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const user = {
    name: 'first name last name',
    username: 'user name',
    email: 'user@gmail.com',
    phone: 'Country Code: +63 012345',
    firstName: 'Not set',
    lastName: 'Not set',
  };
  const activity = {
    locations: 10,
    appliances: 50,
    logs: '--',
    anomalies: '--',
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setUserImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative font-sans">
      {/* Background with overlay */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-black opacity-60 backdrop-blur-sm" />

      {/* Sidebar */}
      <aside className="absolute left-6 top-1/3 transform -translate-y-1/3 z-20">
        <div className="flex flex-col items-center">
          <div className="bg-white bg-opacity-6 p-3 rounded-lg shadow-lg flex flex-col items-center">
            <LeftIcon onClick={() => onSwitch("dashboard")}>🏠</LeftIcon>
            <LeftIcon onClick={() => onSwitch("appliance")}>⚙️</LeftIcon>
            <LeftIcon onClick={() => onSwitch("profile")}>👤</LeftIcon>
            <LeftIcon onClick={() => setShowLogoutConfirm(true)}>🚪</LeftIcon>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 w-full">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Confirm Logout</h3>
            <p className="text-gray-600 mb-6 text-center">Are you sure you want to logout?</p>
            <div className="flex justify-center items-center gap-4">
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

      {/* Main Content */}
      <div className="relative z-10 h-full w-full flex items-start justify-center">
        <div className="w-[94%] max-w-[1200px] mt-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl tracking-wider font-bold text-white">PROFILE</h1>
          </div>

          {/* User Header */}
          <div className="bg-blue-100 p-4 rounded-lg mb-6 flex items-center">
            <img
              src={userImage || 'https://via.placeholder.com/80'} // Placeholder image if no user image
              alt="User"
              className="w-20 h-20 rounded-full mr-4"
            />
            <div>
              <h2 className="text-xl font-semibold">{user.name} ({user.username})</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
              <div className="bg-blue-500 text-white px-4 py-2 font-semibold">
                PERSONAL INFORMATION
              </div>
              <div className="p-6">
                <ProfileField label="Email" value={user.email} icon="📧" />
                <ProfileField label="Phone no. #" value={user.phone} icon="📞" />
                <div className="grid grid-cols-2 gap-4">
                  <ProfileField label="First name" value={user.firstName} icon="👤" />
                  <ProfileField label="Last name" value={user.lastName} icon="👥" />
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Edit Profile</label>
                  <div className="flex items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="profileUpload"
                    />
                    <label
                      htmlFor="profileUpload"
                      className="flex items-center justify-center w-32 p-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <svg className="w-6 h-6 text-gray-600 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 16a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 16V8a2 2 0 012-2h3.19M21 16V8a2 2 0 00-2-2h-3.19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 20H7a2 2 0 01-2-2v-2M15 20h2a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-sm text-gray-600">Choose Photo</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Overview */}
            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
              <div className="bg-blue-500 text-white px-4 py-2 font-semibold">
                ACTIVITY OVERVIEW
              </div>
              <div className="p-6 grid grid-cols-2 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="flex justify-center mb-2">
                    <svg className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 13a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 2a8 8 0 00-8 8c0 1.892.402 3.13 1.5 4.5L12 22l6.5-7.5c1.098-1.37 1.5-2.608 1.5-4.5a8 8 0 00-8-8z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{activity.locations}</div>
                  <div className="text-sm text-gray-600">Location/s</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="flex justify-center mb-2">
                    <svg className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                      <path d="M8 8h8M8 12h8M8 16h8" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{activity.appliances}</div>
                  <div className="text-sm text-gray-600">Appliances</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="flex justify-center mb-2">
                    <svg className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v3M3 12h3m13 0h3M12 18v3M5.6 5.6l2.1 2.1m8.6-2.1l-2.1 2.1m2.1 8.6l-2.1-2.1M7.7 16.3l-2.1 2.1" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{activity.logs}</div>
                  <div className="text-sm text-gray-600">Logs/Notification</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="flex justify-center mb-2">
                    <svg className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{activity.anomalies}</div>
                  <div className="text-sm text-gray-600">Anomalies</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;