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

const ApplianceCard = ({ name, image }) => (
  <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center justify-center hover:shadow-md transition-shadow cursor-pointer">
    <img src={image} alt={name} className="w-16 h-16 object-contain mb-2" />
    <div className="text-sm text-gray-600">{name}</div>
  </div>
);

const AddApplianceCard = ({ onClick }) => (
  <div onClick={onClick} className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center justify-center hover:shadow-md transition-shadow cursor-pointer">
    <div className="w-16 h-16 flex items-center justify-center">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </div>
    <div className="text-sm text-gray-600">Add new appliance</div>
  </div>
);

const Appliance = ({ onSwitch }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [entryType, setEntryType] = useState('manual');
  const [selectedAppliance, setSelectedAppliance] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [energy, setEnergy] = useState('');

  const appliances = [
    { name: 'Fridge', image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCA2YTIgMiAwIDAxMi0yaDEyYTIgMiAwIDAxMiAydjEyYTIgMiAwIDAxLTIgMkg2YTIgMiAwIDAxLTItMlY2eiIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZVdpZHRoPSIyIi8+PHBhdGggZD0iTTYgOWgxMk02IDE1aDEyIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlV2lkdGg9IjIiLz48L3N2Zz4=' },
    { name: 'Television', image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCA2YTIgMiAwIDAxMi0yaDEyYTIgMiAwIDAxMiAydjhhMiAyIDAgMDEtMiAySDZhMiAyIDAgMDEtMi0yVjZ6IiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlV2lkdGg9IjIiLz48cGF0aCBkPSJNOCAxOGg4IiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlV2lkdGg9IjIiLz48L3N2Zz4=' },
    { name: 'Air Conditioner', image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCA2YTIgMiAwIDAxMi0yaDEyYTIgMiAwIDAxMiAydjRhMiAyIDAgMDEtMiAySDZhMiAyIDAgMDEtMi0yVjZ6IiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlV2lkdGg9IjIiLz48cGF0aCBkPSJNOCAxNmw0IDRtNC00lC00IDQiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2VXaWR0aD0iMiIvPjwvc3ZnPg==' },
    { name: 'Lights', image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMThWNm0wIDBoNGEyIDIgMCAwMTIgMnY0YTIgMiAwIDAxLTIgMmgtNFY2ek04IDZoNG0wIDBoLTRhMiAyIDAgMDAtMiAydjRhMiAyIDAgMDAyIDJoNCIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZVdpZHRoPSIyIi8+PC9zdmc+' },
    { name: 'Speaker', image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgOGE0IDQgMCAxMDAgOCA0IDQgMCAwMDAtOHoiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2VXaWR0aD0iMiIvPjxwYXRoIGQ9Ik00IDZhMiAyIDAgMDEyLTJoMTJhMiAyIDAgMDEyIDJ2MTJhMiAyIDAgMDEtMiAySDZhMiAyIDAgMDEtMi0yVjZ6IiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlV2lkdGg9IjIiLz48L3N2Zz4=' },
  ];

  const locations = ['Kitchen', 'Living Room', 'Master Bedroom', 'Children\'s Bedroom', 'Garage', 'Other'];

  const handleConfirm = () => {
    // Handle form submission logic here
    console.log({ entryType, selectedAppliance, selectedLocation, energy });
    setShowAddModal(false);
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

      {/* Add Appliance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 w-full relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-2 left-2 text-gray-600 hover:text-gray-800"
            >
              ←
            </button>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Add appliance</h3>
            <div className="flex justify-center mb-4">
              <label className="mr-4">
                <input
                  type="radio"
                  name="entryType"
                  value="manual"
                  checked={entryType === 'manual'}
                  onChange={(e) => setEntryType(e.target.value)}
                  className="mr-1"
                />
                Manual kWh Entry
              </label>
              <label>
                <input
                  type="radio"
                  name="entryType"
                  value="appliance"
                  checked={entryType === 'appliance'}
                  onChange={(e) => setEntryType(e.target.value)}
                  className="mr-1"
                />
                Appliance-based Entry
              </label>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">Appliance:</label>
              <select
                value={selectedAppliance}
                onChange={(e) => setSelectedAppliance(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg"
              >
                <option value="">Choose an appliance</option>
                {appliances.map((appliance) => (
                  <option key={appliance.name} value={appliance.name}>
                    {appliance.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">Location:</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg"
              >
                <option value="">Choose a location</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">Energy:</label>
              <input
                type="number"
                value={energy}
                onChange={(e) => setEnergy(e.target.value)}
                placeholder="Input kWh"
                className="w-full p-2 border border-gray-200 rounded-lg"
              />
            </div>
            {selectedAppliance && (
              <div className="flex justify-end mb-4">
                <img
                  src={appliances.find((a) => a.name === selectedAppliance)?.image}
                  alt={selectedAppliance}
                  className="w-16 h-16 object-contain"
                />
              </div>
            )}
            <button
              onClick={handleConfirm}
              className="w-full p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 h-full w-full flex items-start justify-center">
        <div className="w-[94%] max-w-[1200px] mt-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl tracking-wider font-bold text-white">APPLIANCES</h1>
          </div>

          {/* Appliance Grid */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="bg-blue-500 text-white px-4 py-2 font-semibold rounded-t-xl flex items-center justify-between">
              <span>All</span>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-6 gap-4">
                <AddApplianceCard onClick={() => setShowAddModal(true)} />
                {appliances.map((appliance, index) => (
                  <ApplianceCard
                    key={index}
                    name={appliance.name}
                    image={appliance.image}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appliance;