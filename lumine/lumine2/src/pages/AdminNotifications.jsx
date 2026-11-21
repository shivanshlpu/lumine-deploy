import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import AdminHeader from '../components/admin/AdminHeader';
import API_BASE_URL from '../config/api';
import {
    getStoredNotifications,
    saveNotification,
    acknowledgeNotification,
    resolveNotification,
    deleteNotification,
    clearAllResolved,
    markAllAcknowledged,
    subscribeToNotifications
} from '../services/notificationService';
import '../styles/admin.css';
import '../styles/admin-notifications.css';

// =============================================================
// Error Boundary to prevent any crash from redirecting to /
// =============================================================
class NotificationsErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('NotificationsErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="admin-notifications-page" style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <div style={{ maxWidth: '500px', margin: '40px auto', background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        <span style={{ fontSize: '3rem' }}>⚠️</span>
                        <h2 style={{ marginTop: '16px', color: '#1e293b' }}>Notification Center Error</h2>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
                            A temporary issue occurred while rendering notifications. Your session is active.
                        </p>
                        <button
                            type="button"
                            className="notif-btn-primary"
                            onClick={() => {
                                this.setState({ hasError: false });
                                window.location.reload();
                            }}
                        >
                            🔄 Reload Notifications
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

const AdminNotificationsContent = () => {
    const [notifications, setNotifications] = useState(getStoredNotifications);
    const [selectedTab, setSelectedTab] = useState('all'); // 'all' | 'active' | 'acknowledged' | 'resolved'
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Logout handler — strictly protected with confirmation to prevent accidental logout
    const handleLogout = useCallback(() => {
        if (window.confirm("Are you sure you want to logout?")) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = "/";
        }
    }, []);

    // Load and sync with backend alerts (syncToBackend = false to prevent recursion)
    const syncBackendAlerts = useCallback(async () => {
        try {
            setIsLoading(true);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            const res = await fetch(`${API_BASE_URL}/api/alerts`, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!res.ok) throw new Error('Failed to fetch backend alerts');
            const backendAlerts = await res.json();
            
            if (Array.isArray(backendAlerts)) {
                for (const alert of backendAlerts) {
                    if (!alert || typeof alert !== 'object') continue;
                    await saveNotification({
                        id: alert.alertId || `alt_${Date.now()}`,
                        camId: alert.senderId || (alert.payload && alert.payload.camId) || '',
                        camName: (alert.payload && alert.payload.camName) || alert.reason || 'AI Camera',
                        title: alert.type === 'camera_offline' ? 'Camera Offline Alert' : `${alert.type || 'System'} Alert`,
                        message: alert.reason || 'Outage reported by monitoring system.',
                        lastFeedTime: (alert.payload && alert.payload.lastFeedTime) || 'Recorded',
                        timestamp: alert.timestamp ? new Date(alert.timestamp).getTime() : Date.now(),
                        status: alert.status === 'resolved' ? 'resolved' : (alert.status === 'acknowledged' ? 'acknowledged' : 'new'),
                        type: alert.type || 'camera_offline',
                        severity: (alert.payload && alert.payload.severity) || 'critical'
                    }, false); // IMPORTANT: syncToBackend = false prevents feedback loops
                }
            }
        } catch (err) {
            console.warn('Backend sync failed, relying on cached notifications:', err);
        } finally {
            setIsLoading(false);
            setNotifications(getStoredNotifications());
        }
    }, []);

    // Setup subscription & real-time sockets
    useEffect(() => {
        // Initial load from storage
        setNotifications(getStoredNotifications());
        syncBackendAlerts();

        // Subscribe to local storage changes
        const unsubscribe = subscribeToNotifications((updatedList) => {
            setNotifications(updatedList);
        });

        // Connect socket for real-time alerts
        const socket = io(API_BASE_URL, { reconnectionDelay: 2000 });
        
        socket.on('new_alert', (newAlert) => {
            if (newAlert && typeof newAlert === 'object') {
                // IMPORTANT: syncToBackend = false to break loop with server
                saveNotification({
                    id: newAlert.alertId,
                    camId: newAlert.senderId || '',
                    camName: (newAlert.payload && newAlert.payload.camName) || 'AI Vision Camera',
                    title: 'Camera Offline Alert',
                    message: newAlert.reason,
                    lastFeedTime: (newAlert.payload && newAlert.payload.lastFeedTime) || 'Recent',
                    timestamp: newAlert.timestamp ? new Date(newAlert.timestamp).getTime() : Date.now(),
                    status: newAlert.status || 'new',
                    type: newAlert.type || 'camera_offline'
                }, false);
            }
        });

        socket.on('alert_status', ({ alert_id, status }) => {
            if (alert_id) {
                // Update local status without re-sending HTTP requests to server
                if (status === 'resolved') resolveNotification(alert_id, false);
                else if (status === 'acknowledged') acknowledgeNotification(alert_id, false);
            }
        });

        socket.on('alert_deleted', ({ alertId }) => {
            if (alertId) {
                deleteNotification(alertId, false);
            }
        });

        return () => {
            unsubscribe();
            socket.disconnect();
        };
    }, [syncBackendAlerts]);

    // Metric counts (defensively guarded against invalid items)
    const counts = useMemo(() => {
        const safeList = Array.isArray(notifications) ? notifications.filter(n => n && typeof n === 'object') : [];
        const active = safeList.filter(n => n.status === 'new').length;
        const acknowledged = safeList.filter(n => n.status === 'acknowledged').length;
        const resolved = safeList.filter(n => n.status === 'resolved').length;
        return {
            total: safeList.length,
            active,
            acknowledged,
            resolved
        };
    }, [notifications]);

    // Filtered list (defensively guarded)
    const filteredNotifications = useMemo(() => {
        if (!Array.isArray(notifications)) return [];
        return notifications.filter(item => {
            if (!item || typeof item !== 'object') return false;

            // Tab filter
            if (selectedTab === 'active' && item.status !== 'new') return false;
            if (selectedTab === 'acknowledged' && item.status !== 'acknowledged') return false;
            if (selectedTab === 'resolved' && item.status !== 'resolved') return false;

            // Search filter
            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase();
                const matchName = String(item.camName || '').toLowerCase().includes(term);
                const matchId = String(item.camId || '').toLowerCase().includes(term);
                const matchMsg = String(item.message || '').toLowerCase().includes(term);
                return matchName || matchId || matchMsg;
            }

            return true;
        });
    }, [notifications, selectedTab, searchTerm]);

    // Helper: format relative time safely without throwing exceptions
    const formatTimestamp = (ts) => {
        if (!ts) return 'Just now';
        try {
            const date = new Date(ts);
            if (isNaN(date.getTime())) return 'Recently';

            const now = Date.now();
            const diffMs = Math.max(0, now - date.getTime());
            const diffMins = Math.floor(diffMs / 60000);

            let relative = 'Just now';
            if (diffMins === 1) relative = '1 min ago';
            else if (diffMins > 1 && diffMins < 60) relative = `${diffMins} mins ago`;
            else if (diffMins >= 60 && diffMins < 1440) {
                const hours = Math.floor(diffMins / 60);
                relative = `${hours}h ago`;
            } else if (diffMins >= 1440) {
                const days = Math.floor(diffMins / 1440);
                relative = `${days}d ago`;
            }

            return `${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} (${relative})`;
        } catch {
            return 'Just now';
        }
    };

    return (
        <div className="admin-notifications-page">
            <AdminHeader onLogout={handleLogout} />

            <main className="admin-notifications-main">
                {/* Header */}
                <header className="admin-notif-header">
                    <div className="admin-notif-title-area">
                        <h1>
                            <span>🔔</span> System & AI Vision Notifications
                        </h1>
                        <p>
                            Live administrative notification center for Somnath Temple AI Vision cameras, continuous offline monitoring, and critical operations.
                        </p>
                    </div>

                    <div className="admin-notif-header-actions">
                        <div className="notif-live-pill">
                            <span className="notif-live-dot"></span>
                            AI Sentinel Active
                        </div>
                        <button
                            type="button"
                            className="notif-btn-secondary"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                syncBackendAlerts();
                            }}
                            disabled={isLoading}
                            title="Refresh alerts from backend"
                        >
                            🔄 {isLoading ? 'Syncing...' : 'Sync Alerts'}
                        </button>
                    </div>
                </header>

                {/* Metrics Summary Bar */}
                <section className="admin-notif-metrics">
                    <div className={`notif-metric-card ${counts.active > 0 ? 'critical' : 'success'}`}>
                        <div className="notif-metric-info">
                            <div className="label">Active Outages</div>
                            <div className="value">{counts.active}</div>
                        </div>
                        <div className="notif-metric-icon">
                            {counts.active > 0 ? '⚠️' : '✓'}
                        </div>
                    </div>

                    <div className="notif-metric-card warning">
                        <div className="notif-metric-info">
                            <div className="label">Acknowledged</div>
                            <div className="value">{counts.acknowledged}</div>
                        </div>
                        <div className="notif-metric-icon">⏳</div>
                    </div>

                    <div className="notif-metric-card success">
                        <div className="notif-metric-info">
                            <div className="label">Resolved Outages</div>
                            <div className="value">{counts.resolved}</div>
                        </div>
                        <div className="notif-metric-icon">🛡️</div>
                    </div>

                    <div className="notif-metric-card info">
                        <div className="notif-metric-info">
                            <div className="label">Total Recorded</div>
                            <div className="value">{counts.total}</div>
                        </div>
                        <div className="notif-metric-icon">📊</div>
                    </div>
                </section>

                {/* Controls & Filter Toolbar */}
                <section className="admin-notif-toolbar">
                    <div className="notif-tabs">
                        <button
                            type="button"
                            className={`notif-tab ${selectedTab === 'all' ? 'active' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedTab('all');
                            }}
                        >
                            All Alerts
                            <span className="notif-tab-badge">{counts.total}</span>
                        </button>
                        <button
                            type="button"
                            className={`notif-tab ${selectedTab === 'active' ? 'active' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedTab('active');
                            }}
                        >
                            Active Outages
                            {counts.active > 0 && (
                                <span className="notif-tab-badge critical">{counts.active}</span>
                            )}
                        </button>
                        <button
                            type="button"
                            className={`notif-tab ${selectedTab === 'acknowledged' ? 'active' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedTab('acknowledged');
                            }}
                        >
                            Acknowledged
                            <span className="notif-tab-badge">{counts.acknowledged}</span>
                        </button>
                        <button
                            type="button"
                            className={`notif-tab ${selectedTab === 'resolved' ? 'active' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedTab('resolved');
                            }}
                        >
                            Resolved
                            <span className="notif-tab-badge">{counts.resolved}</span>
                        </button>
                    </div>

                    <div className="notif-actions-group">
                        <input
                            type="text"
                            className="notif-search-input"
                            placeholder="Search by camera or keyword..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {counts.active > 0 && (
                            <button
                                type="button"
                                className="notif-btn-secondary"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    markAllAcknowledged();
                                }}
                                title="Mark all active outages as acknowledged"
                            >
                                ✓ Acknowledge All
                            </button>
                        )}
                        {counts.resolved > 0 && (
                            <button
                                type="button"
                                className="notif-btn-secondary"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    clearAllResolved();
                                }}
                                title="Clear resolved records"
                            >
                                🗑️ Clear Resolved
                            </button>
                        )}
                    </div>
                </section>

                {/* Notifications Feed */}
                <section className="admin-notif-list">
                    {filteredNotifications.length === 0 ? (
                        <div className="admin-notif-empty">
                            <div className="notif-empty-icon">✓</div>
                            <h3>All Systems Operational</h3>
                            <p>
                                {selectedTab === 'active'
                                    ? 'No active camera outages or critical feed failures detected. All AI cameras are streaming nominally.'
                                    : 'No notifications found matching your current filter.'}
                            </p>
                            <Link
                                to="/admin/ai-heatmap"
                                className="notif-btn-primary"
                                style={{ marginTop: '8px' }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                View AI Vision Map →
                            </Link>
                        </div>
                    ) : (
                        filteredNotifications.map((notif) => {
                            const isNew = notif.status === 'new';
                            const isAck = notif.status === 'acknowledged';
                            const isResolved = notif.status === 'resolved';

                            return (
                                <article
                                    key={notif.id}
                                    className={`notif-card status-${notif.status}`}
                                >
                                    <div className="notif-card-header">
                                        <div className="notif-card-title-row">
                                            {isNew && (
                                                <span className="notif-severity-badge critical">
                                                    ⚠️ Offline Outage
                                                </span>
                                            )}
                                            {isAck && (
                                                <span className="notif-severity-badge acknowledged">
                                                    ⏳ Acknowledged
                                                </span>
                                            )}
                                            {isResolved && (
                                                <span className="notif-severity-badge resolved">
                                                    ✓ Restored
                                                </span>
                                            )}
                                            <h3 className="notif-card-title">
                                                {notif.camName || 'AI Vision Camera Outage'}
                                            </h3>
                                        </div>

                                        <span className="notif-card-timestamp">
                                            {formatTimestamp(notif.timestamp)}
                                        </span>
                                    </div>

                                    <p className="notif-card-message">{notif.message}</p>

                                    <div className="notif-card-metadata-pills">
                                        {notif.camId && (
                                            <span className="notif-meta-tag">
                                                Camera ID: <strong>{notif.camId}</strong>
                                            </span>
                                        )}
                                        <span className="notif-meta-tag">
                                            Last Valid Feed: <strong>{notif.lastFeedTime || '1 min ago'}</strong>
                                        </span>
                                        <span className="notif-meta-tag">
                                            Engine: <strong>AI Vision Sentinel (60s Threshold)</strong>
                                        </span>
                                    </div>

                                    <div className="notif-card-footer">
                                        <div className="notif-card-actions">
                                            <Link
                                                to="/admin/ai-heatmap"
                                                className="notif-btn-primary"
                                                title="Inspect live in AI Vision Heatmap"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                Inspect in AI Vision →
                                            </Link>

                                            {isNew && (
                                                <button
                                                    type="button"
                                                    className="notif-btn-outline"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        acknowledgeNotification(notif.id);
                                                    }}
                                                    title="Mark this outage as acknowledged"
                                                >
                                                    Acknowledge
                                                </button>
                                            )}

                                            {!isResolved && (
                                                <button
                                                    type="button"
                                                    className="notif-btn-outline"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        resolveNotification(notif.id);
                                                    }}
                                                    title="Mark this outage as resolved"
                                                >
                                                    Mark Resolved
                                                </button>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            className="notif-btn-delete"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                deleteNotification(notif.id);
                                            }}
                                            title="Delete this notification record"
                                        >
                                            ✕ Remove
                                        </button>
                                    </div>
                                </article>
                            );
                        })
                    )}
                </section>
            </main>
        </div>
    );
};

const AdminNotifications = () => {
    return (
        <NotificationsErrorBoundary>
            <AdminNotificationsContent />
        </NotificationsErrorBoundary>
    );
};

export default AdminNotifications;
