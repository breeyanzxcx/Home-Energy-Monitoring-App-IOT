import React, { useEffect, useState, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer
} from "recharts";

// Lightweight shadcn-style card components
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-xl overflow-hidden ${className}`}>{children}</div>
);
const CardHeader = ({ title, controls }) => (
  <div className="bg-blue-500 text-white px-4 py-2 font-semibold rounded-t-xl">
    <div className="flex items-center justify-between">
      <div className="text-lg">{title}</div>
      {controls && <div className="ml-4">{controls}</div>}
    </div>
  </div>
);
const CardContent = ({ children }) => (
  <div className="p-4 bg-white flex items-center justify-center">{children}</div>
);

// Sidebar icon wrapper
const LeftIcon = ({ children, onClick }) => (
  <div
    onClick={onClick}
    className="w-12 h-12 flex items-center justify-center rounded-md mb-3 bg-black bg-opacity-40 text-white cursor-pointer hover:bg-opacity-60"
  >
    {children}
  </div>
);

const Dashboard = ({ onSwitch }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const bgUrl = "https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=2000&q=80";

  // Dynamic data state
  const [overallData, setOverallData] = useState([]);
  const [roomData, setRoomData] = useState([]);
  const [applianceData, setApplianceData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [overallBill, setOverallBill] = useState("₱0");
  const [upcomingBill, setUpcomingBill] = useState("₱0");
  const [loading, setLoading] = useState(true);
  const [homes, setHomes] = useState([]);
  const [selectedHomeIndex, setSelectedHomeIndex] = useState(null);

  const API_BASE = 'http://localhost:5000/api';

  // Helper functions to process data (memoized with useCallback)
  const processEnergyReadingsForChart = useCallback((readings) => {
    if (!readings || readings.length === 0) return [];
    
    // Group readings by month
    const monthlyData = {};
    
    readings.forEach(reading => {
      const date = new Date(reading.recorded_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { consumption: 0 };
      }
      monthlyData[monthKey].consumption += reading.energy || 0;
    });

    // Convert to array and format for chart
    const sortedMonths = Object.keys(monthlyData).sort();
    return sortedMonths.map((month, index) => ({
      month: month.split('-')[0] + '/' + month.split('-')[1],
      production: 0, // You can implement production data if available
      consumption: monthlyData[month].consumption
    }));
  }, []);

  const processRoomConsumptionData = useCallback((readings, rooms) => {
    if (!rooms || rooms.length === 0) {
      console.log('No rooms available for room consumption');
      return [];
    }
    
    // Initialize all rooms with 0 consumption
    const roomConsumption = {};
    rooms.forEach(room => {
      const roomName = room.name || 'Unknown Room';
      roomConsumption[roomName] = 0;
    });
    
    // Now add energy consumption from readings
    if (readings && readings.length > 0) {
      readings.forEach(reading => {
        // Handle different roomId formats
        let roomId = null;
        if (reading.roomId) {
          if (typeof reading.roomId === 'string') {
            roomId = reading.roomId;
          } else if (reading.roomId._id) {
            roomId = reading.roomId._id;
          } else if (reading.roomId.id) {
            roomId = reading.roomId.id;
          } else {
            roomId = reading.roomId.toString();
          }
        }
        
        if (!roomId) {
          return;
        }
        
        // Find the room by matching various ID formats
        const room = rooms.find(r => {
          const rId = r._id?.toString() || r.id?.toString() || r._id || r.id;
          return rId === roomId || rId === roomId.toString();
        });
        
        if (room) {
          const roomName = room.name || 'Unknown Room';
          const energy = reading.energy || 0;
          roomConsumption[roomName] = (roomConsumption[roomName] || 0) + energy;
        }
      });
    }

    // Convert to array and sort by value (show all rooms, even with 0 consumption)
    const result = Object.entries(roomConsumption)
      .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value);
    
    console.log('Processed room consumption:', result, 'from', rooms.length, 'rooms');
    return result;
  }, []);

  const processApplianceConsumptionData = useCallback((readings, appliances) => {
    if (!readings || !appliances || appliances.length === 0) {
      console.log('No appliances or readings available for appliance consumption');
      return [];
    }
    
    const applianceConsumption = {};
    
    readings.forEach(reading => {
      // Handle different applianceId formats
      let applianceId = null;
      if (reading.applianceId) {
        if (typeof reading.applianceId === 'string') {
          applianceId = reading.applianceId;
        } else if (reading.applianceId._id) {
          applianceId = reading.applianceId._id;
        } else if (reading.applianceId.id) {
          applianceId = reading.applianceId.id;
        } else {
          applianceId = reading.applianceId;
        }
      }
      
      if (!applianceId) return;
      
      // Find the appliance by matching various ID formats
      const appliance = appliances.find(a => {
        const aId = a._id?.toString() || a.id?.toString() || a._id || a.id;
        return aId === applianceId || aId === applianceId.toString();
      });
      
      const applianceName = appliance?.name || appliance?.type || 'Unknown Appliance';
      const energy = reading.energy || 0;
      
      if (!applianceConsumption[applianceName]) {
        applianceConsumption[applianceName] = 0;
      }
      applianceConsumption[applianceName] += energy;
    });

    const result = Object.entries(applianceConsumption)
      .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value);
    
    console.log('Processed appliance consumption:', result);
    return result;
  }, []);

  const processHistoryData = useCallback((readings, appliances) => {
    if (!readings || !appliances) return [];
    
    // Get the most recent readings with appliance names
    const recentReadings = readings.slice(0, 10).map(reading => {
      const applianceId = reading.applianceId?._id || reading.applianceId;
      const appliance = appliances.find(a => (a._id || a.id) === applianceId);
      const applianceName = appliance?.name || 'Unknown';
      
      const date = new Date(reading.recorded_at);
      const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
      
      return {
        appliance: applianceName,
        timestamp: timeStr,
        current: reading.energy || 0,
        past: (reading.energy || 0) * 0.9, // Mock past value
        percentage: 10 // Mock percentage
      };
    });

    return recentReadings;
  }, []);

  // Fetch homes on mount
  useEffect(() => {
    const fetchHomes = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/homes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch homes');
        const data = await res.json();
        setHomes(data);
        
        // Load saved selection or use first home
        const savedIndex = localStorage.getItem('selectedHomeIndex');
        if (savedIndex !== null && Number(savedIndex) < data.length) {
          setSelectedHomeIndex(Number(savedIndex));
        } else if (data.length > 0) {
          setSelectedHomeIndex(0);
        }
      } catch (error) {
        console.error('Error fetching homes:', error);
      }
    };
    fetchHomes();
  }, []);

  // Save selected home index
  useEffect(() => {
    if (selectedHomeIndex !== null) {
      localStorage.setItem('selectedHomeIndex', selectedHomeIndex);
    } else {
      localStorage.removeItem('selectedHomeIndex');
    }
  }, [selectedHomeIndex]);

  // Fetch dashboard data when home is selected
  useEffect(() => {
    if (selectedHomeIndex === null || !homes[selectedHomeIndex]) return;
    
    const fetchDashboardData = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const homeId = homes[selectedHomeIndex]._id || homes[selectedHomeIndex].id;
      if (!homeId) return;

      try {
        // Fetch energy readings for the selected home
        const [readingsRes, appliancesRes, roomsRes] = await Promise.all([
          fetch(`${API_BASE}/energy?homeId=${homeId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/appliances?homeId=${homeId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/rooms?homeId=${homeId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        if (!readingsRes.ok || !appliancesRes.ok || !roomsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [readings, appliances, rooms] = await Promise.all([
          readingsRes.json(),
          appliancesRes.json(),
          roomsRes.json()
        ]);

        console.log('Fetched dashboard data:', {
          readingsCount: readings.length,
          appliancesCount: appliances.length,
          roomsCount: rooms.length
        });

        // Log sample data to understand structure
        if (readings.length > 0) {
          console.log('Sample reading:', readings[0]);
        }
        if (rooms.length > 0) {
          console.log('Sample room:', rooms[0]);
        }
        if (appliances.length > 0) {
          console.log('Sample appliance:', appliances[0]);
        }

        // Process energy readings for overall consumption chart
        const processedOverallData = processEnergyReadingsForChart(readings);
        console.log('Processed overall data:', processedOverallData);
        setOverallData(processedOverallData);

        // Process room consumption data
        const processedRoomData = processRoomConsumptionData(readings, rooms);
        console.log('Room data to display:', processedRoomData);
        setRoomData(processedRoomData);

        // Process appliance consumption data
        const processedApplianceData = processApplianceConsumptionData(readings, appliances);
        setApplianceData(processedApplianceData);

        // Calculate bills
        const totalCost = readings.reduce((sum, r) => sum + (r.cost || 0), 0);
        const recentCost = readings
          .filter(r => {
            const date = new Date(r.recorded_at);
            const now = new Date();
            const daysDiff = (now - date) / (1000 * 60 * 60 * 24);
            return daysDiff <= 30;
          })
          .reduce((sum, r) => sum + (r.cost || 0), 0);
        
        setOverallBill(`₱${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
        setUpcomingBill(`₱${recentCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

        // Process history data
        const processedHistory = processHistoryData(readings, appliances);
        setHistoryData(processedHistory);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set empty states on error
        setOverallData([]);
        setRoomData([]);
        setApplianceData([]);
        setHistoryData([]);
        setOverallBill("₱0.00");
        setUpcomingBill("₱0.00");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedHomeIndex, homes, processEnergyReadingsForChart, processRoomConsumptionData, processApplianceConsumptionData, processHistoryData]);

  const COLORS = ["#4CAF50", "#FF9800", "#2196F3", "#FFEB3B", "#9C27B0", "#607D86"];

  return (
    <div className="h-screen w-screen overflow-hidden relative font-sans">
      {/* Background */}
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bgUrl})` }} />
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

      {/* Home selector */}
      {homes.length > 0 && (
        <div className="absolute top-4 right-4 z-20">
          <select
            value={selectedHomeIndex !== null ? selectedHomeIndex : ""}
            onChange={(e) => setSelectedHomeIndex(Number(e.target.value))}
            className="px-4 py-2 bg-white bg-opacity-90 rounded-lg shadow-lg text-gray-800 font-semibold"
          >
            {homes.map((home, index) => (
              <option key={home._id || home.id || index} value={index}>
                {home.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Logout modal */}
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
                onClick={() => onSwitch("login")}
                className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10 h-full w-full flex items-start justify-center overflow-y-auto">
        <div className="w-[94%] max-w-[1200px] mt-6 pb-6">
          <h1 className="text-3xl tracking-wider font-bold text-white text-center mb-6">DASHBOARD</h1>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-white text-xl">Loading dashboard data...</div>
            </div>
          ) : homes.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-white text-xl">No homes found. Please add a home first.</div>
            </div>
          ) : (
            <>
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Left column */}
            <div className="flex flex-col gap-6">
               <Card className="flex-1">
                <CardHeader
                  title="OVERALL CONSUMPTION"
                  controls={(
                    <select className="bg-white text-sm text-gray-800 rounded px-2 py-1">
                      <option>Yearly</option>
                      <option>Monthly</option>
                      <option>Weekly</option>
                    </select>
                  )}
                />
                <CardContent>
                  {overallData.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
                      No consumption data available
                    </div>
                  ) : (
                    <div className="w-full h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={overallData}
                          margin={{ top: 20, right: 20, left: 0, bottom: 50 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="month"
                            style={{ fontSize: '11px' }}
                            interval={0}
                            tick={{ transform: 'translate(0,0)' }}
                            tickFormatter={(value) => value}
                            angle={-45}
                            textAnchor="end"
                          />
                          <YAxis style={{ fontSize: '11px' }} tickFormatter={(value) => value.toLocaleString()} />
                          <Tooltip formatter={(value) => [`${value.toLocaleString()} kWh`, 'kWh']} />
                          <Legend verticalAlign="top" wrapperStyle={{ fontSize: '12px' }} />
                          <Line type="monotone" dataKey="production" stroke="#2196F3" name="total energy production" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="consumption" stroke="#FF5252" name="total energy consumption" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Bills */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-xl p-4">
                  <div className="text-sm text-gray-600">Overall Bill</div>
                  <div className="text-2xl font-bold mt-4">{overallBill}</div>
                </div>
                <div className="bg-white rounded-lg shadow-xl p-4">
                  <div className="text-sm text-gray-600">Upcoming Bill</div>
                  <div className="text-2xl font-bold mt-4">{upcomingBill}</div>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-6">
              <Card className="flex-1">
                <CardHeader title="CONSUMPTION BY ROOM" />
                <CardContent>
                  {roomData.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
                      No rooms available. Please create rooms first.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={roomData}
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          dataKey="value"
                          nameKey="name"
                          isAnimationActive={false}
                          labelLine={false}
                          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                          style={{ fontSize: '11px' }}
                        >
                          {roomData.map((entry, i) => (
                            <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`${value} kWh`, 'Consumption']}
                          // Tooltip will receive payload; format label if available
                          labelFormatter={(label) => (label ? `Room: ${label}` : '')}
                        />
                        <Legend verticalAlign="bottom" height={24} wrapperStyle={{ fontSize: '11px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="flex-1">
                <CardHeader title="APPLIANCES" />
                <CardContent>
                  {applianceData.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
                      No appliance data available
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={applianceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" style={{ fontSize: '10px' }} />
                        <YAxis style={{ fontSize: '10px' }} />
                        <Tooltip />
                        <Bar dataKey="value">
                          {applianceData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* History */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="bg-blue-500 text-white px-4 py-2 font-semibold rounded-t-xl">HISTORY</div>
            <div className="p-4 h-40 overflow-auto">
              {historyData.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No history data available</div>
              ) : (
                  <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs text-gray-500">
                      <th className="pb-2">APPLIANCE</th>
                      <th className="pb-2">TIMESTAMP</th>
                      <th className="pb-2">CURRENT kWh</th>
                      <th className="pb-2">PAST kWh</th>
                      <th className="pb-2">PERCENTAGE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="py-3">{item.appliance}</td>
                        <td className="py-3">{item.timestamp}</td>
                        <td className="py-3">{item.current.toFixed(2)} kWh</td>
                        <td className="py-3">{item.past.toFixed(2)} kWh</td>
                        <td className="py-3">{item.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;