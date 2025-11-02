import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";
// Import SVGs as URLs (CRA-compatible)
import dashboardIcon from '../assets/icons/dashboard.svg';
import applianceIcon from '../assets/icons/add.svg';
import profileIcon from '../assets/icons/profile.svg';
import logoutIcon from '../assets/icons/logout.svg';

// ---------- Lightweight shadcn-style components ----------
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-xl overflow-hidden ${className}`}>
    {children}
  </div>
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

// ---------- Anomaly List Component ----------
const AnomalyList = ({ homeId }) => {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE = "http://localhost:5000/api";

  useEffect(() => {
    const fetchAnomalies = async () => {
      if (!homeId) {
        setAnomalies([]);
        setLoading(false);
        return;
      }
      const token = localStorage.getItem("token");
      try {
        setLoading(true);
        const res = await fetch(
          `${API_BASE}/anomalies?homeId=${homeId}&limit=5`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setAnomalies(data.slice(0, 5)); // Show latest 5
        } else {
          setAnomalies([]);
        }
      } catch (e) {
        console.error("Failed to fetch anomalies", e);
        setAnomalies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAnomalies();
  }, [homeId]);

  const severityColors = {
    high: "bg-red-100 text-red-800 border-red-300",
    medium: "bg-orange-100 text-orange-800 border-orange-300",
    low: "bg-yellow-100 text-yellow-800 border-yellow-300",
  };

  const severityBadge = {
    high: "bg-red-600 text-white",
    medium: "bg-orange-600 text-white",
    low: "bg-yellow-600 text-white",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-gray-500 text-sm">Loading alerts...</div>
      </div>
    );
  }

  if (anomalies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-gray-500 text-sm">
        <svg
          className="w-10 h-10 mb-2 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>No anomalies detected</span>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
      {anomalies.map((alert) => {
        const appliance = alert.applianceId?.name || "Unknown Appliance";
        const room = alert.roomId?.name || "Unknown Room";
        const severityClass = severityColors[alert.severity] || severityColors.low;
        const badgeClass = severityBadge[alert.severity] || severityBadge.low;

        return (
          <div
            key={alert._id}
            className={`p-3 rounded-lg border ${severityClass} transition-all hover:shadow-md cursor-default`}
          >
            <div className="flex justify-between items-start mb-1">
              <div className="font-medium text-sm">{appliance}</div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold uppercase ${badgeClass}`}
              >
                {alert.severity}
              </span>
            </div>
            <div className="text-xs text-gray-700 mb-1">{alert.description}</div>
            <div className="text-xs text-gray-600 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{room}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(alert.detected_at).toLocaleString()}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---------- Dashboard Component ----------
const Dashboard = ({ onSwitch }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const bgUrl =
    "https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=2000&q=80";

  // ---------- Global states ----------
  const [loading, setLoading] = useState(true);
  const [homes, setHomes] = useState([]);
  const [selectedHomeIndex, setSelectedHomeIndex] = useState(null);
  const [periodType, setPeriodType] = useState("monthly"); // daily | weekly | monthly

  // ---------- Data containers ----------
  const [overallData, setOverallData] = useState([]); // for line chart
  const [roomData, setRoomData] = useState([]);
  const [applianceData, setApplianceData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [overallBill, setOverallBill] = useState("₱0");
  const [upcomingBill, setUpcomingBill] = useState("₱0");

  const API_BASE = "http://localhost:5000/api";

  // ---------- Helpers ----------
  const formatPeriodLabel = useCallback((periodType, start) => {
    const d = new Date(start);
    if (periodType === "daily") return d.toISOString().split("T")[0];
    if (periodType === "weekly") {
      const week = Math.ceil(d.getDate() / 7);
      return `Week ${week} ${d.getFullYear()}`;
    }
    // monthly
    return d.toLocaleString("default", { month: "short", year: "numeric" });
  }, []);

  // ---------- Data processors ----------
  const processRoomConsumptionData = useCallback((readings, rooms) => {
    if (!rooms?.length) return [];
    const map = {};
    rooms.forEach((r) => (map[r.name] = 0));
    readings.forEach((r) => {
      const roomId =
        typeof r.roomId === "string"
          ? r.roomId
          : r.roomId?._id || r.roomId?.id;
      if (!roomId) return;
      const room = rooms.find(
        (rm) =>
          (rm._id?.toString() || rm.id?.toString()) === roomId.toString()
      );
      if (room) map[room.name] = (map[room.name] || 0) + +(r.energy || 0);
    });
    return Object.entries(map)
      .map(([name, value]) => ({
        name,
        value: +value.toFixed(2),
      }))
      .sort((a, b) => b.value - a.value);
  }, []);

  const processApplianceConsumptionData = useCallback((readings, appliances) => {
    if (!appliances?.length) return [];
    const map = {};
    readings.forEach((r) => {
      const appId =
        typeof r.applianceId === "string"
          ? r.applianceId
          : r.applianceId?._id || r.applianceId?.id;
      if (!appId) return;
      const app = appliances.find(
        (a) =>
          (a._id?.toString() || a.id?.toString()) === appId.toString()
      );
      const name = app?.name || app?.type || "Unknown";
      map[name] = (map[name] || 0) + +(r.energy || 0);
    });
    return Object.entries(map)
      .map(([name, value]) => ({
        name,
        value: +value.toFixed(2),
      }))
      .sort((a, b) => b.value - a.value);
  }, []);

  const processHistoryData = useCallback((readings, appliances) => {
    if (!readings?.length) return [];
    return readings.slice(0, 10).map((r) => {
      const appId =
        typeof r.applianceId === "string"
          ? r.applianceId
          : r.applianceId?._id || r.applianceId?.id;
      const app = appliances.find(
        (a) =>
          (a._id?.toString() || a.id?.toString()) === appId?.toString()
      );
      const date = new Date(r.recorded_at);
      const time = `${String(date.getHours()).padStart(2, "0")}:${String(
        date.getMinutes()
      ).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
      return {
        appliance: app?.name || "Unknown",
        timestamp: time,
        current: +(r.energy || 0).toFixed(2),
        past: +(r.energy || 0).toFixed(2) * 0.9,
        percentage: 10,
      };
    });
  }, []);

  // ---------- Load homes ----------
  useEffect(() => {
    const fetchHomes = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/homes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch homes");
        const data = await res.json();
        setHomes(data);
        const saved = localStorage.getItem("selectedHomeIndex");
        if (saved !== null && Number(saved) < data.length) {
          setSelectedHomeIndex(Number(saved));
        } else if (data.length) {
          setSelectedHomeIndex(0);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchHomes();
  }, []);

  // persist home selection
  useEffect(() => {
    if (selectedHomeIndex !== null) {
      localStorage.setItem("selectedHomeIndex", selectedHomeIndex);
    } else {
      localStorage.removeItem("selectedHomeIndex");
    }
  }, [selectedHomeIndex]);

  // ---------- Load dashboard data for selected home ----------
  const selectedHome = useMemo(
    () => (selectedHomeIndex !== null ? homes[selectedHomeIndex] : null),
    [homes, selectedHomeIndex]
  );

  useEffect(() => {
    if (!selectedHome) return;
    const fetchDashboard = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      const homeId = selectedHome._id || selectedHome.id;
      try {
        // 1. Energy summary (grouped by period)
        const summaryRes = await fetch(
          `${API_BASE}/energy/summary?homeId=${homeId}&period_type=${periodType}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const summaries = summaryRes.ok ? await summaryRes.json() : [];
        const lineData = summaries.map((s) => ({
          label: formatPeriodLabel(periodType, s.period_start),
          consumption: +s.total_energy.toFixed(2),
          production: 0,
        }));
        setOverallData(lineData);

        // 2. Raw readings (for rooms, appliances, history)
        const [readingsRes, appliancesRes, roomsRes] = await Promise.all([
          fetch(`${API_BASE}/energy?homeId=${homeId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/appliances?homeId=${homeId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/rooms?homeId=${homeId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const [readings, appliances, rooms] = await Promise.all([
          readingsRes.ok ? readingsRes.json() : [],
          appliancesRes.ok ? appliancesRes.json() : [],
          roomsRes.ok ? roomsRes.json() : [],
        ]);

        setRoomData(processRoomConsumptionData(readings, rooms));
        setApplianceData(
          processApplianceConsumptionData(readings, appliances)
        );
        setHistoryData(processHistoryData(readings, appliances));

        // Bills
        const totalCost = readings.reduce((s, r) => s + (r.cost || 0), 0);
        const recentCost = readings
          .filter((r) => {
            const days =
              (Date.now() - new Date(r.recorded_at).getTime()) /
              (1000 * 60 * 60 * 24);
            return days <= 30;
          })
          .reduce((s, r) => s + (r.cost || 0), 0);

        setOverallBill(
          `₱${totalCost.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`
        );
        setUpcomingBill(
          `₱${recentCost.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`
        );
      } catch (e) {
        console.error(e);
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
    fetchDashboard();
  }, [
    selectedHome,
    periodType,
    processRoomConsumptionData,
    processApplianceConsumptionData,
    processHistoryData,
    formatPeriodLabel,
  ]);

  // ---------- UI ----------
  const COLORS = [
    "#4CAF50",
    "#FF9800",
    "#2196F3",
    "#FFEB3B",
    "#9C27B0",
    "#607D86",
  ];

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
          {/* Arrow */}
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
          {/* Panel */}
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

      {/* Logout modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 w-full">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Confirm Logout
            </h3>
            <p className="text-gray-600 mb-6 text-center">
              Are you sure you want to logout?
            </p>
            <div className="flex justify-center gap-4">
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
          <h1 className="text-3xl tracking-wider font-bold text-white text-center mb-6">
            DASHBOARD
          </h1>

          {homes.length > 0 && (
            <div className="flex justify-center mb-6 -mt-4">
              <div className="inline-flex items-center gap-3 bg-white/95 backdrop-blur-sm rounded-xl px-5 py-3 shadow-lg">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <select
                  value={selectedHomeIndex ?? ""}
                  onChange={(e) => setSelectedHomeIndex(Number(e.target.value))}
                  className="bg-transparent text-gray-800 font-semibold text-lg focus:outline-none cursor-pointer"
                >
                  {homes.map((h, i) => (
                    <option key={h._id || h.id || i} value={i}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-white text-xl">Loading dashboard data...</div>
            </div>
          ) : homes.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-white text-xl">
                No homes found. Please add a home first.
              </div>
            </div>
          ) : (
            <>
              {/* MAIN GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* LEFT COLUMN */}
                <div className="flex flex-col gap-6">
                  {/* Overall Consumption */}
                  <Card className="flex-1">
                    <CardHeader
                      title="OVERALL CONSUMPTION"
                      controls={
                        <select
                          value={periodType}
                          onChange={(e) => setPeriodType(e.target.value)}
                          className="bg-white text-sm text-gray-800 rounded px-2 py-1"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      }
                    />
                    <CardContent>
                      {overallData.length === 0 ? (
                        <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
                          No consumption data for the selected period.
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
                                dataKey="label"
                                style={{ fontSize: "11px" }}
                                angle={-45}
                                textAnchor="end"
                                interval={0}
                              />
                              <YAxis
                                style={{ fontSize: "11px" }}
                                tickFormatter={(v) => v.toLocaleString()}
                              />
                              <Tooltip
                                formatter={(v) => [`${v} kWh`, "Consumption"]}
                                labelFormatter={(l) => `Period: ${l}`}
                              />
                              <Legend
                                verticalAlign="top"
                                wrapperStyle={{ fontSize: "12px" }}
                              />
                              <Line
                                type="monotone"
                                dataKey="production"
                                stroke="#2196F3"
                                name="Production"
                                strokeWidth={2}
                                dot={false}
                              />
                              <Line
                                type="monotone"
                                dataKey="consumption"
                                stroke="#FF5252"
                                name="Consumption"
                                strokeWidth={2}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Anomaly Alerts */}
                  <Card>
                    <CardHeader title="ANOMALY ALERTS" />
                    <CardContent>
                      <AnomalyList homeId={selectedHome?._id || selectedHome?.id} />
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

                {/* RIGHT COLUMN */}
                <div className="flex flex-col gap-6">
                  <Card className="flex-1">
                    <CardHeader title="CONSUMPTION BY ROOM" />
                    <CardContent>
                      {roomData.length === 0 ? (
                        <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
                          No rooms available.
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
                              label={({ percent }) =>
                                `${(percent * 100).toFixed(0)}%`
                              }
                              style={{ fontSize: "11px" }}
                            >
                              {roomData.map((_, i) => (
                                <Cell
                                  key={`cell-${i}`}
                                  fill={COLORS[i % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(v) => [`${v} kWh`, "Consumption"]}
                              labelFormatter={(l) => `Room: ${l}`}
                            />
                            <Legend
                              verticalAlign="bottom"
                              height={24}
                              wrapperStyle={{ fontSize: "11px" }}
                            />
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
                          No appliance data.
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart data={applianceData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="name"
                              style={{ fontSize: "10px" }}
                            />
                            <YAxis style={{ fontSize: "10px" }} />
                            <Tooltip />
                            <Bar dataKey="value">
                              {applianceData.map((_, i) => (
                                <Cell
                                  key={i}
                                  fill={COLORS[i % COLORS.length]}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* HISTORY */}
              <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                <div className="bg-blue-500 text-white px-4 py-2 font-semibold rounded-t-xl">
                  HISTORY
                </div>
                <div className="p-4 h-40 overflow-auto">
                  {historyData.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      No history data available
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="text-gray-500">
                          <th className="pb-2">APPLIANCE</th>
                          <th className="pb-2">TIME</th>
                          <th className="pb-2">CURRENT</th>
                          <th className="pb-2">PAST</th>
                          <th className="pb-2">Δ%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyData.map((item, i) => (
                          <tr key={i} className="border-t text-gray-700">
                            <td className="py-2">{item.appliance}</td>
                            <td className="py-2">{item.timestamp}</td>
                            <td className="py-2">{item.current} kWh</td>
                            <td className="py-2">{item.past} kWh</td>
                            <td className="py-2 text-green-600">+{item.percentage}%</td>
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