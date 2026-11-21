import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '../../context/LanguageContext';
import { getStoredNotifications, subscribeToNotifications } from '../../services/notificationService';

const AdminHeader = ({ onLogout }) => {
    const { t } = useTranslation();
    const location = useLocation();
    const [activeAlertCount, setActiveAlertCount] = useState(() => {
        return getStoredNotifications().filter(n => n && n.status !== 'resolved').length;
    });

    useEffect(() => {
        const unsubscribe = subscribeToNotifications((list) => {
            setActiveAlertCount(Array.isArray(list) ? list.filter(n => n && n.status !== 'resolved').length : 0);
        });
        return unsubscribe;
    }, []);

    const isActive = (path) => location.pathname === path ? 'nav-pill active' : 'nav-pill';

    return (
        <header className="top-header">
            {/* Nav Pills - Scrollable on mobile */}
            <div className="nav-pills no-scrollbar">
                <Link to="/admin/dashboard" className={isActive('/admin/dashboard')}>{t('adminDashboard')}</Link>
                <Link to="/admin/ai-heatmap" className={isActive('/admin/ai-heatmap')}>{t('adminAIHeatmap')}</Link>
                <Link to="/admin/lane" className={isActive('/admin/lane')}>{t('adminLane')}</Link>
                <Link
                    to="/admin/notifications"
                    className={`${isActive('/admin/notifications')} nav-pill-notifications`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <span>{t('adminNotifications') || 'Notifications'}</span>
                    {activeAlertCount > 0 && (
                        <span className="admin-nav-alert-badge">{activeAlertCount}</span>
                    )}
                </Link>
            </div>

            <div className="admin-user-controls">
                <div className="admin-avatar">
                    A
                </div>
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (onLogout) onLogout();
                    }}
                    className="logout-btn"
                >
                    {t('logout')} ↪
                </button>
            </div>
        </header>
    );
};

export default AdminHeader;
