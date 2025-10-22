
import React, { useState, useEffect } from 'react';

const LeftIcon = ({ children, onClick }) => (
  <div
    onClick={onClick}
    className="w-12 h-12 flex items-center justify-center rounded-md mb-3 bg-black bg-opacity-40 text-white cursor-pointer hover:bg-opacity-60"
  >
    {children}
  </div>
);

const ApplianceCard = ({ name, image, onDelete }) => (
  <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center justify-center hover:shadow-md transition-shadow cursor-pointer relative group">
    <button
      onClick={(e) => {
        e.stopPropagation();
        onDelete();
      }}
      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
    >
      ✕
    </button>
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
  const [selectedRoom, setSelectedRoom] = useState('');
  const [energy, setEnergy] = useState('');
  const [homes, setHomes] = useState([]);
  const [showAddHomeModal, setShowAddHomeModal] = useState(false);
  const [newHomeName, setNewHomeName] = useState('');
  const [selectedHomeIndex, setSelectedHomeIndex] = useState(null);
  const [showDeleteHomeConfirm, setShowDeleteHomeConfirm] = useState(false);
  const [homeToDelete, setHomeToDelete] = useState(null);
  const [showDeleteApplianceConfirm, setShowDeleteApplianceConfirm] = useState(false);
  const [applianceToDelete, setApplianceToDelete] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [rooms, setRooms] = useState([]);

  const defaultAppliances = [
    { id: 'default-fridge', name: 'Fridge', image: 'data:image/svg+xml,%3Csvg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" stroke="currentColor" stroke-width="2"/%3E%3Cpath d="M6 9h12M6 15h12" stroke="currentColor" stroke-width="2"/%3E%3C/svg%3E', defaultEnergy: 1.5 },
    { id: 'default-television', name: 'Television', image: 'data:image/svg+xml,%3Csvg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M4 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" stroke="currentColor" stroke-width="2"/%3E%3Cpath d="M8 18h8" stroke="currentColor" stroke-width="2"/%3E%3C/svg%3E', defaultEnergy: 0.5 },
    { id: 'default-ac', name: 'Air Conditioner', image: 'data:image/svg+xml,%3Csvg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M4 6a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" stroke="currentColor" stroke-width="2"/%3E%3Cpath d="M8 16l4 4m4-4l-4 4" stroke="currentColor" stroke-width="2"/%3E%3C/svg%3E', defaultEnergy: 3.0 },
    { id: 'default-lights', name: 'Lights', image: 'data:image/svg+xml,%3Csvg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M12 18V6m0 0h4a2 2 0 012 2v4a2 2 0 01-2 2h-4V6zM8 6h4m0 0h-4a2 2 0 00-2 2v4a2 2 0 002 2h4" stroke="currentColor" stroke-width="2"/%3E%3C/svg%3E', defaultEnergy: 0.1 },
    { id: 'default-speaker', name: 'Speaker', image: 'data:image/svg+xml,%3Csvg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M12 8a4 4 0 100 8 4 4 0 000-8z" stroke="currentColor" stroke-width="2"/%3E%3Cpath d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" stroke="currentColor" stroke-width="2"/%3E%3C/svg%3E', defaultEnergy: 0.2 },
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
            image: defaultAppliances.find((da) => da.name === a.type)?.image || '',
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

    // Calculate energy based on entry type
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
              image: baseAppliance ? baseAppliance.image : '',
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

  return (
    <div className="h-screen w-screen overflow-hidden relative font-sans">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-black opacity-60 backdrop-blur-sm" />

      <aside className="absolute left-6 top-1/3 transform -translate-y-1/3 z-20">
        <div className="flex flex-col items-center">
          <div className="bg-white bg-opacity-6 p-3 rounded-lg shadow-lg flex flex-col items-center">
            <LeftIcon onClick={() => onSwitch('dashboard')}>🏠</LeftIcon>
            <LeftIcon onClick={() => onSwitch('appliance')}>⚙️</LeftIcon>
            <LeftIcon onClick={() => onSwitch('profile')}>👤</LeftIcon>
            <LeftIcon onClick={() => setShowLogoutConfirm(true)}>🚪</LeftIcon>
          </div>
        </div>
      </aside>

      {errorMessage && (
        <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50">
          {errorMessage}
          <button onClick={() => setErrorMessage('')} className="ml-4 text-sm underline">
            Close
          </button>
        </div>
      )}

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
                {defaultAppliances.map((appliance) => (
                  <option key={appliance.id} value={appliance.name}>
                    {appliance.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">Room:</label>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg"
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
            )}
            {entryType === 'appliance' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">Energy:</label>
                <div className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600">
                  Auto-calculated based on appliance type
                </div>
              </div>
            )}
            {selectedAppliance && (
              <div className="flex justify-end mb-4">
                <img
                  src={defaultAppliances.find((a) => a.name === selectedAppliance)?.image}
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

      {showAddHomeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 w-full relative">
            <button
              onClick={() => setShowAddHomeModal(false)}
              className="absolute top-2 left-2 text-gray-600 hover:text-gray-800"
            >
              ←
            </button>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Add home</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">Home name:</label>
              <input
                type="text"
                value={newHomeName}
                onChange={(e) => setNewHomeName(e.target.value)}
                placeholder="e.g. Home 1"
                className="w-full p-2 border border-gray-200 rounded-lg"
              />
            </div>
            <button
              onClick={handleAddHome}
              className="w-full p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Create Home
            </button>
          </div>
        </div>
      )}

      {showDeleteHomeConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 w-full">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Delete Home</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{homeToDelete?.name}</strong>? This action cannot be undone and all appliances in this home will be deleted.
            </p>
            <div className="flex justify-center items-center gap-4">
              <button
                onClick={() => {
                  setShowDeleteHomeConfirm(false);
                  setHomeToDelete(null);
                }}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 rounded border border-gray-300 hover:border-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteHome(homeToDelete.index)}
                className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteApplianceConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 w-full">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Delete Appliance</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{applianceToDelete?.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-center items-center gap-4">
              <button
                onClick={() => {
                  setShowDeleteApplianceConfirm(false);
                  setApplianceToDelete(null);
                }}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 rounded border border-gray-300 hover:border-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteAppliance(applianceToDelete.id, applianceToDelete.index)}
                className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 h-full w-full flex items-start justify-center">
        <div className="w-[94%] max-w-[1200px] mt-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl tracking-wider font-bold text-white">
              {selectedHomeIndex === null || !homes[selectedHomeIndex] ? 'HOMES' : homes[selectedHomeIndex]?.name || 'HOME'}
            </h1>
          </div>

          {selectedHomeIndex === null || !homes[selectedHomeIndex] ? (
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
              <div className="bg-blue-500 text-white px-6 py-5 font-semibold rounded-t-xl"></div>
              <div className="p-6">
                <div className="grid grid-cols-6 gap-4">
                  <div
                    onClick={() => setShowAddHomeModal(true)}
                    className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center justify-center hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="w-16 h-16 flex items-center justify-center text-2xl">+</div>
                    <div className="text-sm text-gray-600">Add new home</div>
                  </div>
                  {homes.map((home, index) => (
                    <div
                      key={home.id || `home-${index}`}
                      className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center justify-center hover:shadow-md transition-shadow cursor-pointer relative group"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setHomeToDelete({ name: home.name, index });
                          setShowDeleteHomeConfirm(true);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                      <div
                        onClick={() => handleSelectHome(index)}
                        className="w-full cursor-pointer"
                      >
                        <div className="w-16 h-16 flex items-center justify-center mb-2 text-xl mx-auto">🏠</div>
                        <div className="text-sm text-gray-600 text-center">{home.name}</div>
                        <div className="text-xs text-gray-400 mt-2 text-center">{(home.appliances || []).length} appliances</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
              <div className="bg-blue-500 text-white px-4 py-2 font-semibold rounded-t-xl flex items-center">
                <button onClick={handleBackToHomes} className="text-sm bg-white bg-opacity-10 px-3 py-1 rounded mr-4">
                  ← Homes
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-6 gap-4">
                  <AddApplianceCard onClick={() => setShowAddModal(true)} />
                  {(homes[selectedHomeIndex]?.appliances || []).map((appliance, index) => {
                    const baseAppliance = defaultAppliances.find((a) => a.name === appliance.type);
                    return (
                      <ApplianceCard
                        key={appliance.id || `appliance-${appliance.name}-${index}`}
                        name={appliance.name}
                        image={baseAppliance ? baseAppliance.image : appliance.image}
                        onDelete={() => {
                          setApplianceToDelete({ id: appliance.id, name: appliance.name, index });
                          setShowDeleteApplianceConfirm(true);
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appliance;