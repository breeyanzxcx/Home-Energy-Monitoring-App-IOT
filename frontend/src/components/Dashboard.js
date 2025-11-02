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
import bellIcon from '../assets/icons/bell.svg'; 

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
// ---------- Improved Anomaly List Component ----------
const AnomalyList = ({ homeId }) => {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const API_BASE = "http://localhost:5000/api";
  
  useEffect(() => {
    fetchAnomalies();
  }, [homeId]);

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
        `${API_BASE}/anomalies?homeId=${homeId}&limit=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setAnomalies(data);
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

  const handleResolveAnomaly = async (anomalyId) => {
    const token = localStorage.getItem("token");
    setActionLoading(anomalyId);
    try {
      const res = await fetch(`${API_BASE}/anomalies/${anomalyId}/resolve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setAnomalies(prev => prev.filter(alert => alert._id !== anomalyId));
        if (selectedAnomaly?._id === anomalyId) {
          setShowDetailsModal(false);
          setSelectedAnomaly(null);
        }
      } else {
        console.error("Failed to resolve anomaly");
      }
    } catch (e) {
      console.error("Failed to resolve anomaly", e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAnomaly = async (anomalyId) => {
    const token = localStorage.getItem("token");
    setActionLoading(anomalyId);
    try {
      const res = await fetch(`${API_BASE}/anomalies/${anomalyId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setAnomalies(prev => prev.filter(alert => alert._id !== anomalyId));
        if (selectedAnomaly?._id === anomalyId) {
          setShowDetailsModal(false);
          setSelectedAnomaly(null);
        }
      } else {
        console.error("Failed to delete anomaly");
      }
    } catch (e) {
      console.error("Failed to delete anomaly", e);
    } finally {
      setActionLoading(null);
    }
  };

  // Confirmation handlers
  const confirmResolveAnomaly = (anomalyId, anomalyName) => {
    setPendingAction({
      type: 'resolve',
      id: anomalyId,
      name: anomalyName
    });
    setShowConfirmModal(true);
  };

  const confirmDeleteAnomaly = (anomalyId, anomalyName) => {
    setPendingAction({
      type: 'delete', 
      id: anomalyId,
      name: anomalyName
    });
    setShowConfirmModal(true);
  };

  const executePendingAction = () => {
    if (!pendingAction) return;
    
    if (pendingAction.type === 'resolve') {
      handleResolveAnomaly(pendingAction.id);
    } else if (pendingAction.type === 'delete') {
      handleDeleteAnomaly(pendingAction.id);
    }
    
    setShowConfirmModal(false);
    setPendingAction(null);
  };

  const cancelPendingAction = () => {
    setShowConfirmModal(false);
    setPendingAction(null);
  };

  const severityConfig = {
    high: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      badge: "bg-red-100 text-red-800 border-red-200"
    },
    medium: {
      bg: "bg-orange-50",
      border: "border-orange-200", 
      text: "text-orange-800",
      badge: "bg-orange-100 text-orange-800 border-orange-200"
    },
    low: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-800",
      badge: "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
  };

  const statusConfig = {
    active: {
      badge: "bg-blue-100 text-blue-800 border-blue-200",
      text: "Active"
    },
    acknowledged: {
      badge: "bg-yellow-100 text-yellow-800 border-yellow-200",
      text: "Acknowledged"
    },
    resolved: {
      badge: "bg-green-100 text-green-800 border-green-200", 
      text: "Resolved"
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-500 text-sm">Loading alerts...</div>
        </div>
      </div>
    );
  }

  if (anomalies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-gray-500 text-sm">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span className="font-medium text-gray-600">No Anomaly Alerts</span>
        <span className="text-xs mt-1">All systems are running normally</span>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {anomalies.map((alert) => {
          const severity = severityConfig[alert.severity] || severityConfig.low;
          const status = statusConfig[alert.status] || statusConfig.active;
          const appliance = alert.applianceId?.name || "Unknown Appliance";
          const room = alert.roomId?.name || "Unknown Room";
          
          return (
            <div
              key={alert._id}
              className={`p-4 rounded-xl border-2 ${severity.bg} ${severity.border} transition-all hover:shadow-md cursor-pointer group`}
              onClick={() => {
                setSelectedAnomaly(alert);
                setShowDetailsModal(true);
              }}
            >
              {/* Header - Appliance name left, status badges right */}
              <div className="flex justify-between items-start mb-3">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-900 text-sm truncate text-left">{appliance}</div>
                </div>
                <div className="flex items-center space-x-2 ml-3 flex-shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${severity.badge}`}>
                    {alert.severity}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full border ${status.badge}`}>
                    {status.text}
                  </span>
                </div>
              </div>

              {/* Content - Left Aligned */}
              <div className="space-y-2">
                <div className={`text-sm font-medium ${severity.text} text-left leading-relaxed`}>
                  {alert.description}
                </div>
              </div>

              {/* Footer - Left Aligned */}
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center space-x-1 text-xs text-gray-600">
                  <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span className="truncate">{room}</span>
                </div>
                
                {/* Quick Actions - Right Aligned */}
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmResolveAnomaly(alert._id, appliance);
                    }}
                    disabled={actionLoading === alert._id}
                    className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors disabled:opacity-50 flex-shrink-0"
                  >
                    {actionLoading === alert._id ? '...' : 'Resolve'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDeleteAnomaly(alert._id, appliance);
                    }}
                    disabled={actionLoading === alert._id}
                    className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition-colors disabled:opacity-50 flex-shrink-0"
                  >
                    {actionLoading === alert._id ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Anomaly Details Modal */}
      {showDetailsModal && selectedAnomaly && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-white rounded-xl max-w-2xl w-full mx-auto shadow-2xl transform transition-all" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-900 text-lg text-left">Anomaly Details</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${(severityConfig[selectedAnomaly.severity] || severityConfig.low).badge}`}>
                    {selectedAnomaly.severity}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full border ${(statusConfig[selectedAnomaly.status] || statusConfig.active).badge}`}>
                    {(statusConfig[selectedAnomaly.status] || statusConfig.active).text}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100 flex-shrink-0"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Anomaly Information */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-2 text-left">Appliance Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Appliance:</span>
                        <span className="font-medium text-right">{selectedAnomaly.applianceId?.name || "Unknown"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Room:</span>
                        <span className="font-medium text-right">{selectedAnomaly.roomId?.name || "Unknown"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Alert Type:</span>
                        <span className="font-medium text-right capitalize">{selectedAnomaly.alert_type?.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-2 text-left">Detection Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Detected:</span>
                        <span className="font-medium text-right">{new Date(selectedAnomaly.detected_at).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time Ago:</span>
                        <span className="font-medium text-right">{getTimeAgo(selectedAnomaly.detected_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alert Details */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg border text-left">
                    <h4 className="font-semibold text-gray-900 text-sm mb-2">Anomaly Description</h4>
                    <p className="text-gray-700 text-sm leading-relaxed text-left">
                      {selectedAnomaly.description}
                    </p>
                  </div>

                  {selectedAnomaly.recommended_action && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-left">
                      <h4 className="font-semibold text-blue-800 text-sm mb-2">Recommended Action</h4>
                      <p className="text-blue-700 text-sm leading-relaxed text-left">
                        {selectedAnomaly.recommended_action}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500 text-left">
                  ID: {selectedAnomaly._id}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => confirmDeleteAnomaly(selectedAnomaly._id, selectedAnomaly.applianceId?.name || "Unknown Appliance")}
                    disabled={actionLoading === selectedAnomaly._id}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    {actionLoading === selectedAnomaly._id ? 'Deleting...' : 'Delete'}
                  </button>
                  
                  <button
                    onClick={() => confirmResolveAnomaly(selectedAnomaly._id, selectedAnomaly.applianceId?.name || "Unknown Appliance")}
                    disabled={actionLoading === selectedAnomaly._id}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    {actionLoading === selectedAnomaly._id ? 'Resolving...' : 'Mark Resolved'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && pendingAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full mx-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 text-left">
                  {pendingAction.type === 'resolve' ? 'Mark as Resolved?' : 'Delete Anomaly?'}
                </h3>
              </div>
              
              <p className="text-gray-600 mb-6 text-left">
                {pendingAction.type === 'resolve' 
                  ? `Are you sure you want to mark the anomaly for "${pendingAction.name}" as resolved? This will remove it from the active alerts list.`
                  : `Are you sure you want to permanently delete the anomaly alert for "${pendingAction.name}"? This action cannot be undone.`
                }
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelPendingAction}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={executePendingAction}
                  disabled={actionLoading === pendingAction.id}
                  className={`px-4 py-2 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 ${
                    pendingAction.type === 'resolve' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {actionLoading === pendingAction.id ? 'Processing...' : 
                   pendingAction.type === 'resolve' ? 'Mark Resolved' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
// ---------- Notifications Dropdown and Popup ----------
const NotificationsUI = ({ homeId }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [homes, setHomes] = useState([]);
  const API_BASE = "http://localhost:5000/api";

  // Fetch homes to get home names
  useEffect(() => {
    const fetchHomes = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/homes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setHomes(data);
        }
      } catch (e) {
        console.error("Failed to fetch homes", e);
      }
    };
    fetchHomes();
  }, []);

  // Get home name by ID
  const getHomeName = (homeId) => {
    const home = homes.find(h => h._id === homeId || h.id === homeId);
    return home?.name || "Unknown";
  };

  // Parse notification message to separate anomaly and recommendation
  const parseNotificationMessage = (message) => {
    if (!message) return { anomaly: '', recommendation: '' };
    
    const recommendationIndex = message.indexOf('Recommended:');
    if (recommendationIndex === -1) {
      return { anomaly: message, recommendation: '' };
    }
    
    return {
      anomaly: message.substring(0, recommendationIndex).trim(),
      recommendation: message.substring(recommendationIndex + 12).trim()
    };
  };

  const fetchNotifications = useCallback(async () => {
    if (!homeId) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    const token = localStorage.getItem("token");
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `${API_BASE}/notifications?homeId=${homeId}&limit=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (e) {
      console.error("Failed to fetch notifications", e);
      setError("Failed to load notifications. Please try again.");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [homeId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unacknowledgedCount = notifications.filter(n => n.status !== "acknowledged").length;

  const handleAcknowledge = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/notifications/${id}/acknowledge`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n._id === id ? {...n, status: "acknowledged"} : n));
        if (selectedNotif?._id === id) {
          setSelectedNotif({ ...selectedNotif, status: "acknowledged" });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n._id !== id));
        if (selectedNotif?._id === id) {
          setSelectedNotif(null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBulkAcknowledge = async (ids) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/notifications/acknowledge`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids }),
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ids.includes(n._id) ? {...n, status: "acknowledged"} : n));
        if (selectedNotif && ids.includes(selectedNotif._id)) {
          setSelectedNotif({ ...selectedNotif, status: "acknowledged" });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBulkDelete = async (ids) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/notifications`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids }),
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => !ids.includes(n._id)));
        setSelectedNotif(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    sent: "bg-blue-100 text-blue-800 border-blue-300",
    failed: "bg-red-100 text-red-800 border-red-300",
    acknowledged: "bg-green-100 text-green-800 border-green-300",
  };
  const statusBadge = {
    pending: "bg-yellow-600 text-white",
    sent: "bg-blue-600 text-white",
    failed: "bg-red-600 text-white",
    acknowledged: "bg-green-600 text-white",
  };

  if (loading) return null;

  return (
    <>
      {/* Notification Icon */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-gray-100 shadow-md relative transition-all duration-200"
        >
          <img 
            src={bellIcon} 
            alt="Notifications" 
            className="w-5 h-5" 
            style={{ filter: 'brightness(0) saturate(100%) invert(27%) sepia(95%) saturate(2000%) hue-rotate(210deg) brightness(90%) contrast(90%)' }} 
          />
          {unacknowledgedCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] flex items-center justify-center font-semibold shadow-sm">
              {unacknowledgedCount > 9 ? '9+' : unacknowledgedCount}
            </span>
          )}
        </button>

        {/* Dropdown List */}
        {showDropdown && (
          <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 max-h-96 overflow-y-auto">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
              {notifications.length > 0 && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleBulkAcknowledge(notifications.filter(n => n.status !== "acknowledged").map(n => n._id))}
                    className="text-xs text-green-600 hover:text-green-700 font-medium transition-colors"
                  >
                    Mark all read
                  </button>
                  <button
                    onClick={() => handleBulkDelete(notifications.map(n => n._id))}
                    className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
            {error ? (
              <div className="p-4 text-center text-red-500 text-sm bg-red-50">{error}</div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-5 5v-5zM4.93 4.93l9.07 9.07-9.07 9.07L4.93 4.93z" />
                </svg>
                <div>No notifications</div>
              </div>
            ) : (
              notifications.map((notif) => {
                const isBilling = notif.channels?.includes("bill_reminder");
                const title = isBilling ? "Billing Reminder" : "Anomaly Alert";
                const statusClass = statusBadge[notif.status] || statusBadge.pending;
                const itemClass = notif.status === "acknowledged" ? "opacity-60 bg-gray-50" : "bg-white";
                
                return (
                  <div
                    key={notif._id}
                    onClick={() => {
                      setSelectedNotif(notif);
                      setShowDropdown(false);
                    }}
                    className={`p-4 border-b hover:bg-blue-50 cursor-pointer flex items-start gap-3 transition-colors ${itemClass}`}
                  >
                    <div className={`w-2 h-2 mt-2 rounded-full ${notif.status === "acknowledged" ? 'bg-gray-400' : 'bg-blue-500'} flex-shrink-0`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className={`font-medium text-sm ${notif.status === "acknowledged" ? 'text-gray-500' : 'text-gray-800'}`}>
                          {title}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold uppercase ${statusClass}`}>
                          {notif.status}
                        </span>
                      </div>
                      
                      {/* SIMPLIFIED List View - Just show the main message */}
                      <div className="text-xs text-gray-600 line-clamp-2 mb-2 leading-relaxed">
                        {parseNotificationMessage(notif.message).anomaly}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-500">
                          {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {notif.status !== "acknowledged" && (
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Improved Popup Modal for Details */}
      {selectedNotif && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedNotif(null)}>
          <div className="bg-white rounded-xl max-w-md w-full mx-auto shadow-2xl transform transition-all" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${selectedNotif.status === "acknowledged" ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">
                    {selectedNotif.channels?.includes("bill_reminder") ? "Billing Reminder" : "Anomaly Alert"}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold uppercase ${statusBadge[selectedNotif.status] || statusBadge.pending}`}>
                    {selectedNotif.status}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedNotif(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              <div className="mb-6">
                <div className="space-y-4">
                  {/* Anomaly Section */}
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <h4 className="font-medium text-gray-800 text-sm mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      Anomaly Detected
                    </h4>
                    <div className="text-gray-700 text-sm leading-relaxed">
                      {parseNotificationMessage(selectedNotif.message).anomaly}
                    </div>
                  </div>

                  {/* Recommendation Section */}
                  {parseNotificationMessage(selectedNotif.message).recommendation && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-800 text-sm mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Recommended Action
                      </h4>
                      <div className="text-blue-700 text-sm leading-relaxed">
                        {parseNotificationMessage(selectedNotif.message).recommendation}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Home:</span>
                  <span className="text-gray-800">{getHomeName(selectedNotif.homeId)}</span>
                </div>
                
                {selectedNotif.due_date && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Due Date:</span>
                    <span className="text-red-600 font-semibold">
                      {new Date(selectedNotif.due_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                {selectedNotif.anomalyAlertId && (
                  <>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Severity:</span>
                      <span className={`font-semibold ${
                        selectedNotif.anomalyAlertId.severity === 'high' ? 'text-red-600' :
                        selectedNotif.anomalyAlertId.severity === 'medium' ? 'text-orange-600' : 'text-yellow-600'
                      }`}>
                        {selectedNotif.anomalyAlertId.severity}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Alert Type:</span>
                      <span className="text-gray-800 capitalize">
                        {selectedNotif.anomalyAlertId.alert_type?.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </>
                )}
                
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Created:</span>
                  <span className="text-gray-800">
                    {new Date(selectedNotif.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            {selectedNotif.status !== "acknowledged" && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => handleDelete(selectedNotif._id)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => handleAcknowledge(selectedNotif._id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Mark as Read
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
// ---------- Dashboard Component ----------
const Dashboard = ({ onSwitch }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const bgUrl =
    "https://images.unsplash.com/photo-1501183638710-841dd1904471?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170"
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
  // ---------- Enhanced Data processors ----------
  const processRoomConsumptionData = useCallback((readings, rooms) => {
    if (!rooms?.length) return [];
    const map = {};
    rooms.forEach((r) => (map[r.name] = 0));
    readings.forEach((r) => {
      const roomId = typeof r.roomId === "string" ? r.roomId : r.roomId?._id || r.roomId?.id;
      if (!roomId) return;
      const room = rooms.find((rm) => (rm._id?.toString() || rm.id?.toString()) === roomId.toString());
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
      const appId = typeof r.applianceId === "string" ? r.applianceId : r.applianceId?._id || r.applianceId?.id;
      if (!appId) return;
      const app = appliances.find((a) => (a._id?.toString() || a.id?.toString()) === appId.toString());
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

  const processHistoryData = useCallback((readings, appliances, rooms) => {
    if (!readings?.length) return [];
    return readings.slice(0, 15).map((r) => {
      const appId = typeof r.applianceId === "string" ? r.applianceId : r.applianceId?._id || r.applianceId?.id;
      const roomId = typeof r.roomId === "string" ? r.roomId : r.roomId?._id || r.roomId?.id;
      
      const app = appliances.find((a) => (a._id?.toString() || a.id?.toString()) === appId?.toString());
      const room = rooms.find((rm) => (rm._id?.toString() || rm.id?.toString()) === roomId?.toString());
      
      const date = new Date(r.recorded_at);
      const time = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
      const dateStr = date.toLocaleDateString();
      
      // Calculate percentage change (using a simple mock calculation)
      const current = +(r.energy || 0).toFixed(2);
      const past = current * (0.8 + Math.random() * 0.4); // Random variation for demo
      const percentage = current > 0 ? ((current - past) / past * 100).toFixed(1) : 0;
      
      return {
        appliance: app?.name || "Unknown Appliance",
        room: room?.name || "Unknown Room",
        timestamp: `${dateStr} ${time}`,
        current,
        past: +past.toFixed(2),
        percentage: +percentage,
        isOn: r.is_on,
        power: r.power || 0,
        cost: r.cost || 0
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
        setApplianceData(processApplianceConsumptionData(readings, appliances));
        setHistoryData(processHistoryData(readings, appliances, rooms)); // Updated to include rooms
        // Bills
        const totalCost = readings.reduce((s, r) => s + (r.cost || 0), 0);
        const recentCost = readings
          .filter((r) => {
            const days = (Date.now() - new Date(r.recorded_at).getTime()) / (1000 * 60 * 60 * 24);
            return days <= 30;
          })
          .reduce((s, r) => s + (r.cost || 0), 0);
        setOverallBill(`₱${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
        setUpcomingBill(`₱${recentCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
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
          <div className="flex justify-center items-center mb-6 relative">
            <h1 className="text-3xl tracking-wider font-bold text-white text-center">
              DASHBOARD
            </h1>
          </div>
          {homes.length > 0 && (
            <div className="flex justify-center items-center mb-6 -mt-4 gap-4">
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
              <NotificationsUI homeId={selectedHome?._id || selectedHome?.id} />
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
              {/* ENHANCED HISTORY SECTION */}
              <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                <div className="bg-blue-500 text-white px-6 py-3 font-semibold rounded-t-xl flex justify-between items-center">
                  <span>ENERGY USAGE HISTORY</span>
                  <span className="text-blue-100 text-sm font-normal">
                    {historyData.length} records
                  </span>
                </div>
                <div className="p-0">
                  {historyData.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">
                      <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-lg font-medium text-gray-400">No history data available</div>
                      <div className="text-sm text-gray-500 mt-1">Energy usage records will appear here</div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b-2 border-gray-200">
                          <tr className="text-gray-600">
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Appliance</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Room</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Date & Time</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-right">Current (kWh)</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-right">Past (kWh)</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-right">Change</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {historyData.map((item, i) => (
                            <tr 
                              key={i} 
                              className="hover:bg-blue-50 transition-colors duration-150 group cursor-pointer"
                              onClick={() => {
                                // Optional: Add click handler for row details
                                console.log('History item clicked:', item);
                              }}
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-3 h-3 rounded-full ${item.isOn ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                  <div>
                                    <div className="font-medium text-gray-900 text-sm">{item.appliance}</div>
                                    <div className="text-xs text-gray-500">{item.power}W</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-700">{item.room}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-700">{item.timestamp}</div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="text-sm font-semibold text-gray-900">{item.current}</div>
                                <div className="text-xs text-gray-500">₱{item.cost.toFixed(2)}</div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="text-sm text-gray-600">{item.past}</div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  item.percentage > 0 
                                    ? 'bg-red-100 text-red-800' 
                                    : item.percentage < 0 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {item.percentage > 0 ? '↑' : item.percentage < 0 ? '↓' : '→'}
                                  {Math.abs(item.percentage)}%
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                  item.isOn 
                                    ? 'bg-green-100 text-green-800 border border-green-200' 
                                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                                }`}>
                                  {item.isOn ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                {historyData.length > 0 && (
                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-xl">
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <div>
                        Showing recent {Math.min(historyData.length, 15)} records
                      </div>
                      <div className="flex items-center space-x-4">
                        <button className="hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                          ← Previous
                        </button>
                        <span className="text-gray-700 font-medium">1</span>
                        <button className="hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                          Next →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default Dashboard;