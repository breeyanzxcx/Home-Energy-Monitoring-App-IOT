import React, { useState, useEffect } from 'react';

// Import SVGs as URLs (CRA-compatible)
import dashboardIcon from '../assets/icons/dashboard.svg';
import applianceIcon from '../assets/icons/add.svg'; 
import profileIcon from '../assets/icons/profile.svg';
import logoutIcon from '../assets/icons/logout.svg';
import deleteIcon from '../assets/icons/delete.svg';
import editIcon from '../assets/icons/edit.svg';
import houseIcon from '../assets/icons/house.svg';
import airconIcon from '../assets/icons/aircon.svg';
import kitchenIcon from '../assets/icons/kitchen.svg';
import lightIcon from '../assets/icons/light.svg';
import speakerIcon from '../assets/icons/speaker.svg';
import televisionIcon from '../assets/icons/television.svg';

// NavItem Component
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

// Improved Appliance Card with better styling and edit functionality
const ApplianceCard = ({ name, type, image, onDelete, onEdit, energy }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-between hover:shadow-xl transition-all duration-300 cursor-pointer relative group border border-gray-100 min-h-[180px]">
    <div className="absolute top-3 right-3 flex space-x-1">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md"
      >
        <img src={editIcon} alt="Edit" className="w-4 h-4" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md"
      >
        <img src={deleteIcon} alt="Delete" className="w-4 h-4" />
      </button>
    </div>
    
    <div className="flex flex-col items-center flex-1 justify-center">
      <div className="w-16 h-16 mb-4 flex items-center justify-center bg-blue-50 rounded-2xl p-3">
        <img src={image} alt={name} className="w-full h-full object-contain" style={{ filter: 'brightness(0) saturate(100%) invert(27%) sepia(95%) saturate(2000%) hue-rotate(210deg) brightness(90%) contrast(90%)' }} />
      </div>
      <div className="text-center">
        <div className="font-semibold text-gray-800 text-sm mb-1">{name}</div>
        <div className="text-xs text-gray-500 capitalize">{type}</div>
        {energy && (
          <div className="text-xs text-blue-600 font-medium mt-1">
            {energy} kWh
          </div>
        )}
      </div>
    </div>
  </div>
);

// Improved Add Card
const AddApplianceCard = ({ onClick }) => (
  <div 
    onClick={onClick}
    className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-dashed border-blue-200 hover:border-blue-300 min-h-[180px] group"
  >
    <div className="w-16 h-16 mb-4 flex items-center justify-center bg-white rounded-2xl p-3 group-hover:bg-blue-50 transition-colors">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-500">
        <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </div>
    <div className="text-center">
      <div className="font-semibold text-blue-600 text-sm">Add New Appliance</div>
      <div className="text-xs text-gray-500 mt-1">Click to add</div>
    </div>
  </div>
);

// Improved Home Card
const HomeCard = ({ home, onSelect, onDelete }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-between hover:shadow-xl transition-all duration-300 cursor-pointer relative group border border-gray-100 min-h-[180px]">
    <button
      onClick={(e) => {
        e.stopPropagation();
        onDelete();
      }}
      className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md"
    >
      <img src={deleteIcon} alt="Delete" className="w-4 h-4" />
    </button>
    
    <div className="flex flex-col items-center flex-1 justify-center">
      <div className="w-16 h-16 mb-4 flex items-center justify-center bg-blue-50 rounded-2xl p-3">
        <img src={houseIcon} alt="Home" className="w-full h-full object-contain filter-blue" style={{ filter: 'brightness(0) saturate(100%) invert(27%) sepia(95%) saturate(2000%) hue-rotate(210deg) brightness(90%) contrast(90%)' }} />
      </div>
      <div className="text-center">
        <div className="font-semibold text-gray-800 text-sm mb-1">{home.name}</div>
        <div className="text-xs text-gray-500">
          {home.appliances?.length || 0} appliance{(home.appliances?.length || 0) !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
    
    <button
      onClick={onSelect}
      className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200"
    >
      View Appliances
    </button>
  </div>
);

const Appliance = ({ onSwitch }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [entryType, setEntryType] = useState('manual');
  const [selectedAppliance, setSelectedAppliance] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [energy, setEnergy] = useState('');
  const [applianceName, setApplianceName] = useState('');
  const [homes, setHomes] = useState([]);
  const [showAddHomeModal, setShowAddHomeModal] = useState(false);
  const [newHomeName, setNewHomeName] = useState('');
  const [selectedHomeIndex, setSelectedHomeIndex] = useState(null);
  const [showDeleteHomeConfirm, setShowDeleteHomeConfirm] = useState(false);
  const [homeToDelete, setHomeToDelete] = useState(null);
  const [showDeleteApplianceConfirm, setShowDeleteApplianceConfirm] = useState(false);
  const [applianceToDelete, setApplianceToDelete] = useState(null);
  const [applianceToEdit, setApplianceToEdit] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [rooms, setRooms] = useState([]);

  // Updated default appliances with proper icons
  const defaultAppliances = [
    { 
      id: 'default-fridge', 
      name: 'Refrigerator', 
      image: kitchenIcon, 
      defaultEnergy: 1.5,
      category: 'Kitchen'
    },
    { 
      id: 'default-television', 
      name: 'Television', 
      image: televisionIcon, 
      defaultEnergy: 0.5,
      category: 'Entertainment'
    },
    { 
      id: 'default-ac', 
      name: 'Air Conditioner', 
      image: airconIcon, 
      defaultEnergy: 3.0,
      category: 'Cooling'
    },
    { 
      id: 'default-lights', 
      name: 'Lighting', 
      image: lightIcon, 
      defaultEnergy: 0.1,
      category: 'Lighting'
    },
    { 
      id: 'default-speaker', 
      name: 'Speaker', 
      image: speakerIcon, 
      defaultEnergy: 0.2,
      category: 'Entertainment'
    },
  ];

  const API_BASE = 'http://localhost:5000/api';

  const loadAppliancesForHome = async (homeId, index) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/appliances?homeId=${homeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch appliances');
      const data = await res.json();
      setHomes((prev) => {
        const copy = [...prev];
        copy[index] = {
          ...copy[index],
          appliances: data.map((a) => ({
            id: a._id || a.id,
            name: a.name,
            type: a.type,
            energy_threshold: a.energy_threshold,
            roomId: a.roomId,
            image: defaultAppliances.find((da) => da.name === a.type)?.image || houseIcon,
          })),
        };
        return copy;
      });
    } catch (err) {
      console.error('Load appliances error', err.message || err);
    }
  };

  useEffect(() => {
    const fetchHomesAndAppliances = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/homes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch homes');
        const data = await res.json();
        const normalized = data.map((h) => ({
          id: h._id || h.id,
          name: h.name,
          appliances: [],
        }));
        setHomes(normalized);

        for (let i = 0; i < normalized.length; i++) {
          await loadAppliancesForHome(normalized[i].id, i);
        }

        const savedIndex = localStorage.getItem('selectedHomeIndex');
        if (savedIndex !== null && Number(savedIndex) < normalized.length) {
          setSelectedHomeIndex(Number(savedIndex));
        }
      } catch (error) {
        console.error('Error fetching homes:', error);
      }
    };
    fetchHomesAndAppliances();
  }, []);

  useEffect(() => {
    if (selectedHomeIndex !== null) {
      localStorage.setItem('selectedHomeIndex', selectedHomeIndex);
    } else {
      localStorage.removeItem('selectedHomeIndex');
    }
  }, [selectedHomeIndex]);

  useEffect(() => {
    const fetchRooms = async () => {
      if (selectedHomeIndex === null || !homes[selectedHomeIndex]) {
        setRooms([]);
        return;
      }
      const token = localStorage.getItem('token');
      if (!token) return;
      const homeId = homes[selectedHomeIndex].id;
      try {
        const res = await fetch(`${API_BASE}/rooms?homeId=${homeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch rooms');
        const data = await res.json();
        setRooms(data);
      } catch (err) {
        console.error('Fetch rooms error:', err);
        setRooms([]);
      }
    };
    fetchRooms();
  }, [selectedHomeIndex, homes]);

  const handleSelectHome = (index) => {
    setSelectedHomeIndex(index);
  };

  const handleBackToHomes = () => {
    setSelectedHomeIndex(null);
    localStorage.removeItem('selectedHomeIndex');
  };

  const handleConfirm = async () => {
    const token = localStorage.getItem('token');
    if (!token) return onSwitch && onSwitch('login');
    if (selectedHomeIndex === null) {
      console.error('No home selected');
      setShowAddModal(false);
      return;
    }
    if (!selectedRoom) {
      setErrorMessage('Please select a room');
      return;
    }
    const home = homes[selectedHomeIndex];
    
    const baseApplianceName = selectedAppliance || 'Custom Appliance';
    const existingAppliances = homes[selectedHomeIndex]?.appliances || [];
    const sameNameCount = existingAppliances.filter((a) => a.name.startsWith(baseApplianceName)).length;
    const finalName = sameNameCount > 0 ? `${baseApplianceName} ${sameNameCount + 1}` : baseApplianceName;

    let calculatedEnergy;
    if (entryType === 'manual') {
      calculatedEnergy = energy ? Number(energy) : undefined;
    } else if (entryType === 'appliance') {
      const baseAppliance = defaultAppliances.find((a) => a.name === baseApplianceName);
      calculatedEnergy = baseAppliance ? baseAppliance.defaultEnergy : undefined;
    }

    const payload = {
      homeId: home.id || home._id,
      roomId: selectedRoom,
      name: finalName,
      type: baseApplianceName,
      energy_threshold: calculatedEnergy,
    };
    try {
      const res = await fetch(`${API_BASE}/appliances`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Create appliance failed');

      const baseAppliance = defaultAppliances.find((a) => a.name === baseApplianceName);
      
      setHomes((prev) => {
        const copy = [...prev];
        const existing = copy[selectedHomeIndex]?.appliances || [];
        copy[selectedHomeIndex] = {
          ...copy[selectedHomeIndex],
          appliances: [
            ...existing,
            {
              id: data._id || data.id,
              name: data.name,
              type: data.type,
              energy_threshold: data.energy_threshold,
              image: baseAppliance ? baseAppliance.image : houseIcon,
            },
          ],
        };
        return copy;
      });
      setErrorMessage('');
    } catch (err) {
      console.error('Create appliance error', err.message || err);
      setErrorMessage(err.message || 'Failed to add appliance');
    }

    setShowAddModal(false);
    setSelectedAppliance('');
    setSelectedRoom('');
    setEnergy('');
  };

  const handleUpdateAppliance = async () => {
    const token = localStorage.getItem('token');
    if (!token) return onSwitch && onSwitch('login');
    if (!applianceToEdit) return;

    const payload = {
      name: applianceName,
      type: selectedAppliance,
      energy_threshold: energy ? Number(energy) : undefined,
      roomId: selectedRoom,
    };

    try {
      const res = await fetch(`${API_BASE}/appliances/${applianceToEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update appliance failed');

      // Update the appliance in state
      setHomes((prev) => {
        const copy = [...prev];
        const applianceIndex = copy[selectedHomeIndex].appliances.findIndex(
          (a) => a.id === applianceToEdit.id
        );
        if (applianceIndex !== -1) {
          copy[selectedHomeIndex].appliances[applianceIndex] = {
            ...copy[selectedHomeIndex].appliances[applianceIndex],
            name: data.name,
            type: data.type,
            energy_threshold: data.energy_threshold,
            roomId: data.roomId,
          };
        }
        return copy;
      });

      setShowEditModal(false);
      setApplianceToEdit(null);
      setErrorMessage('');
    } catch (err) {
      console.error('Update appliance error', err.message || err);
      setErrorMessage(err.message || 'Failed to update appliance');
    }
  };

  const handleEditAppliance = (appliance, index) => {
    setApplianceToEdit({ ...appliance, index });
    setApplianceName(appliance.name);
    setSelectedAppliance(appliance.type);
    setSelectedRoom(appliance.roomId || '');
    setEnergy(appliance.energy_threshold?.toString() || '');
    setEntryType('manual'); // Default to manual for editing
    setShowEditModal(true);
  };

  const handleAddHome = async () => {
    const name = newHomeName.trim();
    if (!name) return;
    const token = localStorage.getItem('token');
    if (!token) return onSwitch && onSwitch('login');
    try {
      const res = await fetch(`${API_BASE}/homes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Create home failed');

      setHomes((prev) => {
        const newHomes = [...prev, { id: data.id || data._id, name: data.name, appliances: [] }];
        setSelectedHomeIndex(newHomes.length - 1);
        return newHomes;
      });
      setNewHomeName('');
      setShowAddHomeModal(false);
    } catch (err) {
      console.error('Create home error', err.message || err);
      setErrorMessage(err.message || 'Failed to add home');
    }
  };

  const handleDeleteHome = async (index) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const home = homes[index];
    try {
      const res = await fetch(`${API_BASE}/homes/${home.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Delete home failed');
      }

      setHomes((prev) => prev.filter((_, i) => i !== index));

      if (selectedHomeIndex === index) {
        setSelectedHomeIndex(null);
        localStorage.removeItem('selectedHomeIndex');
      } else if (selectedHomeIndex > index) {
        setSelectedHomeIndex(selectedHomeIndex - 1);
      }

      setShowDeleteHomeConfirm(false);
      setHomeToDelete(null);
    } catch (err) {
      console.error('Delete home error:', err.message || err);
      setErrorMessage(err.message || 'Failed to delete home');
    }
  };

  const handleDeleteAppliance = async (applianceId, applianceIndex) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/appliances/${applianceId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Delete appliance failed');
      }

      setHomes((prev) => {
        const copy = [...prev];
        copy[selectedHomeIndex] = {
          ...copy[selectedHomeIndex],
          appliances: copy[selectedHomeIndex].appliances.filter((_, i) => i !== applianceIndex),
        };
        return copy;
      });

      setShowDeleteApplianceConfirm(false);
      setApplianceToDelete(null);
    } catch (err) {
      console.error('Delete appliance error:', err.message || err);
      setErrorMessage(err.message || 'Failed to delete appliance');
    }
  };

  // Reset form when modals close
  const resetForm = () => {
    setSelectedAppliance('');
    setSelectedRoom('');
    setEnergy('');
    setApplianceName('');
    setEntryType('manual');
    setErrorMessage('');
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative font-sans bg-gray-50">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-black opacity-60 backdrop-blur-sm" />

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full z-30 flex items-center">
        <div className="relative h-64 w-32 flex items-center group cursor-pointer">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-blue-600 rounded-r-full flex items-center justify-center shadow-lg transition-all duration-300 z-10
                          group-hover:opacity-0 group-hover:-translate-x-8">
            <svg
              className="w-5 h-5 text-white transition-transform group-hover:scale-110"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
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

      {/* Error Toast */}
      {errorMessage && (
        <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 flex items-center space-x-3 max-w-sm">
          <div className="flex-1">
            <div className="font-medium">Error</div>
            <div className="text-sm opacity-90">{errorMessage}</div>
          </div>
          <button 
            onClick={() => setErrorMessage('')} 
            className="text-white hover:text-gray-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Modals */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4 w-full">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Confirm Logout</h3>
            <p className="text-gray-600 mb-6 text-center">Are you sure you want to logout?</p>
            <div className="flex justify-center items-center gap-4">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => onSwitch('login')}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Appliance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full relative">
            <button
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
              className="absolute top-4 left-4 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Add New Appliance</h3>
            
            <div className="flex justify-center mb-6 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setEntryType('manual')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  entryType === 'manual' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Manual Entry
              </button>
              <button
                onClick={() => setEntryType('appliance')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  entryType === 'appliance' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Appliance Type
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Appliance Type</label>
                <select
                  value={selectedAppliance}
                  onChange={(e) => setSelectedAppliance(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Choose an appliance</option>
                  {defaultAppliances.map((appliance) => (
                    <option key={appliance.id} value={appliance.name}>
                      {appliance.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Room</label>
                <select
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                >
                  <option value="">Select a room</option>
                  {rooms.map((room) => (
                    <option key={room._id || room.id} value={room._id || room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </div>

              {entryType === 'manual' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Energy Consumption (kWh)</label>
                  <input
                    type="number"
                    value={energy}
                    onChange={(e) => setEnergy(e.target.value)}
                    placeholder="Enter energy consumption"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    step="0.1"
                    min="0"
                  />
                </div>
              )}

              {entryType === 'appliance' && selectedAppliance && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-blue-700">
                    Estimated consumption: {defaultAppliances.find(a => a.name === selectedAppliance)?.defaultEnergy} kWh
                  </div>
                </div>
              )}

              {selectedAppliance && (
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-blue-50 rounded-2xl p-4 flex items-center justify-center">
                    <img
                      src={defaultAppliances.find((a) => a.name === selectedAppliance)?.image}
                      alt={selectedAppliance}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleConfirm}
              disabled={!selectedRoom || !selectedAppliance}
              className="w-full mt-6 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Add Appliance
            </button>
          </div>
        </div>
      )}

      {/* Edit Appliance Modal */}
      {showEditModal && applianceToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full relative">
            <button
              onClick={() => {
                setShowEditModal(false);
                setApplianceToEdit(null);
                resetForm();
              }}
              className="absolute top-4 left-4 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Edit Appliance</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Appliance Name</label>
                <input
                  type="text"
                  value={applianceName}
                  onChange={(e) => setApplianceName(e.target.value)}
                  placeholder="Enter appliance name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Appliance Type</label>
                <select
                  value={selectedAppliance}
                  onChange={(e) => setSelectedAppliance(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Choose an appliance</option>
                  {defaultAppliances.map((appliance) => (
                    <option key={appliance.id} value={appliance.name}>
                      {appliance.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Room</label>
                <select
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                >
                  <option value="">Select a room</option>
                  {rooms.map((room) => (
                    <option key={room._id || room.id} value={room._id || room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Energy Consumption (kWh)</label>
                <input
                  type="number"
                  value={energy}
                  onChange={(e) => setEnergy(e.target.value)}
                  placeholder="Enter energy consumption"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  step="0.1"
                  min="0"
                />
              </div>

              {selectedAppliance && (
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-blue-50 rounded-2xl p-4 flex items-center justify-center">
                    <img
                      src={defaultAppliances.find((a) => a.name === selectedAppliance)?.image}
                      alt={selectedAppliance}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleUpdateAppliance}
              disabled={!selectedRoom || !selectedAppliance || !applianceName.trim()}
              className="w-full mt-6 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Update Appliance
            </button>
          </div>
        </div>
      )}

      {/* Add Home Modal */}
      {showAddHomeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full relative">
            <button
              onClick={() => setShowAddHomeModal(false)}
              className="absolute top-4 left-4 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Create New Home</h3>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Home Name</label>
              <input
                type="text"
                value={newHomeName}
                onChange={(e) => setNewHomeName(e.target.value)}
                placeholder="e.g., My Home, Apartment, Villa..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <button
              onClick={handleAddHome}
              disabled={!newHomeName.trim()}
              className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Create Home
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modals */}
      {showDeleteHomeConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Delete Home</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{homeToDelete?.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-center items-center gap-4">
              <button
                onClick={() => {
                  setShowDeleteHomeConfirm(false);
                  setHomeToDelete(null);
                }}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteHome(homeToDelete.index)}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteApplianceConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Delete Appliance</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{applianceToDelete?.name}</strong>?
            </p>
            <div className="flex justify-center items-center gap-4">
              <button
                onClick={() => {
                  setShowDeleteApplianceConfirm(false);
                  setApplianceToDelete(null);
                }}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteAppliance(applianceToDelete.id, applianceToDelete.index)}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 h-full w-full flex items-start justify-center overflow-y-auto py-8">
        <div className="w-[94%] max-w-[1200px]">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 tracking-wide">
              {selectedHomeIndex === null ? 'MY HOMES' : homes[selectedHomeIndex]?.name?.toUpperCase() || 'APPLIANCES'}
            </h1>
            <p className="text-blue-100 text-lg">
              {selectedHomeIndex === null 
                ? 'Manage your homes and their appliances' 
                : `Manage appliances in ${homes[selectedHomeIndex]?.name}`}
            </p>
          </div>

          {selectedHomeIndex === null ? (
            // Homes Grid View
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/20">
              <div className="bg-blue-500/80 text-white px-8 py-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold">Your Homes</h2>
                  <button
                    onClick={() => setShowAddHomeModal(true)}
                    className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add Home</span>
                  </button>
                </div>
              </div>
              <div className="p-8">
                {homes.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <img src={houseIcon} alt="No homes" className="w-12 h-12 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Homes Yet</h3>
                    <p className="text-gray-500 mb-6">Create your first home to start adding appliances</p>
                    <button
                      onClick={() => setShowAddHomeModal(true)}
                      className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Create Your First Home
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {homes.map((home, index) => (
                      <HomeCard
                        key={home.id || `home-${index}`}
                        home={home}
                        onSelect={() => handleSelectHome(index)}
                        onDelete={() => {
                          setHomeToDelete({ name: home.name, index });
                          setShowDeleteHomeConfirm(true);
                        }}
                      />
                    ))}
                    {/* Add Home Card */}
                    <div 
                      onClick={() => setShowAddHomeModal(true)}
                      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-dashed border-blue-200 hover:border-blue-300 min-h-[180px] group"
                    >
                      <div className="w-16 h-16 mb-4 flex items-center justify-center bg-white rounded-2xl p-3 group-hover:bg-blue-50 transition-colors">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-500">
                          <path d="M12 4v16m8-8H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-blue-600 text-sm">Add New Home</div>
                        <div className="text-xs text-gray-500 mt-1">Click to create</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Appliances Grid View
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/20">
              <div className="bg-blue-600/80 text-white px-8 py-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={handleBackToHomes}
                      className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span>Back to Homes</span>
                    </button>
                    <h2 className="text-2xl font-semibold">Appliances</h2>
                  </div>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add Appliance</span>
                  </button>
                </div>
              </div>
              <div className="p-8">
                {(homes[selectedHomeIndex]?.appliances || []).length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <img src={applianceIcon} alt="No appliances" className="w-12 h-12 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Appliances Yet</h3>
                    <p className="text-gray-500 mb-6">Add your first appliance to start monitoring energy usage</p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Add Your First Appliance
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    <AddApplianceCard onClick={() => setShowAddModal(true)} />
                    {(homes[selectedHomeIndex]?.appliances || []).map((appliance, index) => (
                      <ApplianceCard
                        key={appliance.id || `appliance-${appliance.name}-${index}`}
                        name={appliance.name}
                        type={appliance.type}
                        image={appliance.image}
                        energy={appliance.energy_threshold}
                        onDelete={() => {
                          setApplianceToDelete({ id: appliance.id, name: appliance.name, index });
                          setShowDeleteApplianceConfirm(true);
                        }}
                        onEdit={() => handleEditAppliance(appliance, index)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appliance;