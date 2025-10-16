import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer
} from "recharts";

// Lightweight shadcn-style card components
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-xl overflow-hidden ${className}`}>{children}</div>
);
const CardHeader = ({ title }) => (
  <div className="bg-blue-500 text-white px-4 py-2 font-semibold rounded-t-xl">{title}</div>
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

  // Sample chart data (replace with API calls later)
  const [overallData, setOverallData] = useState([]);
  const [roomData, setRoomData] = useState([]);
  const [applianceData, setApplianceData] = useState([]);

  useEffect(() => {
    // Simulate API data fetch - matching the reference image
    setOverallData([
      { month: "1997", production: 150000, consumption: 150000 },
      { month: "1998", production: 180000, consumption: 170000 },
      { month: "1999", production: 200000, consumption: 190000 },
      { month: "2000", production: 220000, consumption: 210000 },
      { month: "2001", production: 240000, consumption: 230000 },
      { month: "2002", production: 260000, consumption: 250000 },
      { month: "2003", production: 280000, consumption: 270000 },
      { month: "2004", production: 300000, consumption: 290000 },
      { month: "2005", production: 320000, consumption: 310000 },
      { month: "2006", production: 340000, consumption: 330000 },
      { month: "2007", production: 360000, consumption: 350000 },
      { month: "2008", production: 380000, consumption: 370000 },
      { month: "2009", production: 390000, consumption: 390000 },
      { month: "2010", production: 380000, consumption: 410000 },
      { month: "2011", production: 370000, consumption: 420000 },
      { month: "2012", production: 360000, consumption: 430000 },
      { month: "2013", production: 350000, consumption: 435000 },
      { month: "2014", production: 345000, consumption: 440000 },
      { month: "2015", production: 340000, consumption: 442000 },
      { month: "2016", production: 338000, consumption: 444000 },
    ]);
    setRoomData([
      { name: "Master Bedroom", value: 40 },
      { name: "Living Room", value: 30 },
      { name: "Children's Bedroom", value: 15 },
      { name: "Garage", value: 8 },
      { name: "Kitchen", value: 5 },
      { name: "Other", value: 2 },
    ]);
    setApplianceData([
      { name: "Lights", value: 150 },
      { name: "Computer", value: 80 },
      { name: "Speaker", value: 60 },
      { name: "Television", value: 90 },
      { name: "AC", value: 120 },
      { name: "Refrigerator", value: 130 },
    ]);
  }, []);

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

          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Left column */}
            <div className="flex flex-col gap-6">
              <Card className="flex-1">
                <CardHeader title="OVERALL CONSUMPTION" />
                <CardContent>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={overallData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" style={{ fontSize: '10px' }} />
                      <YAxis style={{ fontSize: '10px' }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Line type="monotone" dataKey="production" stroke="#2196F3" name="total energy production" strokeWidth={2} />
                      <Line type="monotone" dataKey="consumption" stroke="#FF5252" name="total energy consumption" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Bills */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-xl p-4">
                  <div className="text-sm text-gray-600">Overall Bill</div>
                  <div className="text-2xl font-bold mt-4">₱1,000,000</div>
                </div>
                <div className="bg-white rounded-lg shadow-xl p-4">
                  <div className="text-sm text-gray-600">Upcoming Bill</div>
                  <div className="text-2xl font-bold mt-4">₱123,467</div>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-6">
              <Card className="flex-1">
                <CardHeader title="CONSUMPTION BY ROOM" />
                <CardContent>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={roomData}
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value} k`}
                        style={{ fontSize: '10px' }}
                      >
                        {roomData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="flex-1">
                <CardHeader title="APPLIANCES" />
                <CardContent>
                  <ResponsiveContainer width="100%" height={160}>
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
                </CardContent>
              </Card>
            </div>
          </div>

          {/* History */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="bg-blue-500 text-white px-4 py-2 font-semibold rounded-t-xl">HISTORY</div>
            <div className="p-4 h-40 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs text-gray-500">
                    <th className="pb-2">LOCATION</th>
                    <th className="pb-2">TIMESTAMP</th>
                    <th className="pb-2">CURRENT kWh</th>
                    <th className="pb-2">PAST kWh</th>
                    <th className="pb-2">PERCENTAGE</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="py-3">Kitchen</td>
                    <td className="py-3">00:00:00</td>
                    <td className="py-3">1 kWh</td>
                    <td className="py-3">2 kWh</td>
                    <td className="py-3">10%</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-3">Dining Area</td>
                    <td className="py-3">00:00:00</td>
                    <td className="py-3">1 kWh</td>
                    <td className="py-3">2 kWh</td>
                    <td className="py-3">10%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;