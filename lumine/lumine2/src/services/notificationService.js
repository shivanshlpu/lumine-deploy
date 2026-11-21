import API_BASE_URL from '../config/api';

const STORAGE_KEY = 'lumine_admin_notifications';
const EVENT_NAME = 'lumine_notifications_changed';

// Safely get stored notifications from localStorage
export const getStoredNotifications = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(n => n && typeof n === 'object' && n.id);
    } catch (err) {
        console.error('Error reading notifications from localStorage:', err);
        return [];
    }
};

/**
 * Save or update a notification.
 * @param {Object} notification - Notification object to save
 * @param {boolean} syncToBackend - Whether to send POST /api/alerts (false if coming from socket/sync)
 */
export const saveNotification = async (notification, syncToBackend = true) => {
    if (!notification || typeof notification !== 'object') return null;

    try {
        const notifications = getStoredNotifications();
        const targetId = notification.id || `notif_${Date.now()}`;
        const existingIdx = notifications.findIndex(n => n.id === targetId);

        const now = Date.now();
        const notificationData = {
            id: targetId,
            camId: notification.camId || '',
            camName: notification.camName || notification.title || 'System Camera',
            title: notification.title || 'Camera Offline Alert',
            message: notification.message || '',
            lastFeedTime: notification.lastFeedTime || 'Just now',
            timestamp: notification.timestamp ? (typeof notification.timestamp === 'number' ? notification.timestamp : new Date(notification.timestamp).getTime()) : now,
            status: notification.status || 'new', // 'new' | 'acknowledged' | 'resolved'
            type: notification.type || 'camera_offline',
            severity: notification.severity || 'critical'
        };

        // If existing is already identical in status and message, skip redundant dispatch/post to avoid re-render loops
        if (existingIdx >= 0) {
            const existing = notifications[existingIdx];
            if (
                existing.status === notificationData.status &&
                existing.message === notificationData.message &&
                existing.lastFeedTime === notificationData.lastFeedTime
            ) {
                return existing;
            }
            notifications[existingIdx] = {
                ...existing,
                ...notificationData,
                timestamp: existing.timestamp || notificationData.timestamp
            };
        } else {
            notifications.unshift(notificationData);
        }

        // Limit stored notifications to last 100 entries
        const trimmed = notifications.slice(0, 100);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
        window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: notificationData }));

        // Only sync to backend if requested (breaks socket-HTTP infinite loop)
        if (syncToBackend) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 4000);
                await fetch(`${API_BASE_URL}/api/alerts`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    signal: controller.signal,
                    body: JSON.stringify({
                        alertId: notificationData.id,
                        type: notificationData.type,
                        senderId: notificationData.camId,
                        receiverId: 'AdminAIHeatmap',
                        reason: notificationData.message,
                        status: notificationData.status,
                        payload: {
                            camName: notificationData.camName,
                            lastFeedTime: notificationData.lastFeedTime,
                            severity: notificationData.severity
                        }
                    })
                });
                clearTimeout(timeoutId);
            } catch {
                // Graceful fallback: local notification is already saved
            }
        }

        return notificationData;
    } catch (err) {
        console.error('Failed to save notification:', err);
        return null;
    }
};

/**
 * Acknowledge a notification.
 * @param {string} id - Notification alertId
 * @param {boolean} syncToBackend - Whether to call POST /api/alerts/:id/ack (false if triggered by socket)
 */
export const acknowledgeNotification = async (id, syncToBackend = true) => {
    if (!id) return;
    try {
        const notifications = getStoredNotifications();
        let changed = false;
        const updated = notifications.map(n => {
            if (n && n.id === id) {
                if (n.status !== 'acknowledged') {
                    changed = true;
                    return { ...n, status: 'acknowledged' };
                }
            }
            return n;
        });

        if (!changed) return; // No state change, avoid unnecessary dispatch

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent(EVENT_NAME));

        if (syncToBackend) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 4000);
                await fetch(`${API_BASE_URL}/api/alerts/${id}/ack`, {
                    method: 'POST',
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
            } catch {
                // Ignore offline errors
            }
        }
    } catch (err) {
        console.error('Error acknowledging notification:', err);
    }
};

/**
 * Resolve a notification.
 * @param {string} id - Notification alertId
 * @param {boolean} syncToBackend - Whether to call POST /api/alerts/:id/resolve (false if triggered by socket)
 */
export const resolveNotification = async (id, syncToBackend = true) => {
    if (!id) return;
    try {
        const notifications = getStoredNotifications();
        let changed = false;
        const updated = notifications.map(n => {
            if (n && n.id === id) {
                if (n.status !== 'resolved') {
                    changed = true;
                    return { ...n, status: 'resolved' };
                }
            }
            return n;
        });

        if (!changed) return; // No state change, avoid unnecessary dispatch

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent(EVENT_NAME));

        if (syncToBackend) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 4000);
                await fetch(`${API_BASE_URL}/api/alerts/${id}/resolve`, {
                    method: 'POST',
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
            } catch {
                // Ignore offline errors
            }
        }
    } catch (err) {
        console.error('Error resolving notification:', err);
    }
};

/**
 * Delete a notification.
 * @param {string} id - Notification alertId
 * @param {boolean} syncToBackend - Whether to call DELETE /api/alerts/:id (false if triggered by socket)
 */
export const deleteNotification = async (id, syncToBackend = true) => {
    if (!id) return;
    try {
        const notifications = getStoredNotifications();
        const updated = notifications.filter(n => n && n.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent(EVENT_NAME));

        if (syncToBackend) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 4000);
                await fetch(`${API_BASE_URL}/api/alerts/${id}`, {
                    method: 'DELETE',
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
            } catch {
                // Ignore offline errors
            }
        }
    } catch (err) {
        console.error('Error deleting notification:', err);
    }
};

export const dismissNotification = deleteNotification;

export const clearAllResolved = () => {
    try {
        const notifications = getStoredNotifications();
        const updated = notifications.filter(n => n && n.status !== 'resolved');
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent(EVENT_NAME));
    } catch (err) {
        console.error('Error clearing resolved notifications:', err);
    }
};

export const markAllAcknowledged = () => {
    try {
        const notifications = getStoredNotifications();
        const updated = notifications.map(n => n ? (n.status === 'new' ? { ...n, status: 'acknowledged' } : n) : null).filter(Boolean);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent(EVENT_NAME));
    } catch (err) {
        console.error('Error marking all acknowledged:', err);
    }
};

export const getActiveCount = () => {
    try {
        const list = getStoredNotifications();
        return list.filter(n => n && n.status !== 'resolved').length;
    } catch {
        return 0;
    }
};

export const subscribeToNotifications = (callback) => {
    const handler = () => {
        try {
            callback(getStoredNotifications());
        } catch (e) {
            console.error('Error in notification subscription handler:', e);
        }
    };

    window.addEventListener(EVENT_NAME, handler);
    window.addEventListener('storage', handler);

    return () => {
        window.removeEventListener(EVENT_NAME, handler);
        window.removeEventListener('storage', handler);
    };
};
