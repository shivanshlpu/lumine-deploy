import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '../../context/LanguageContext';

const AdminHeader = ({ onLogout }) => {
    const { t } = useTranslation();
    const location = useLocation();
    const isActive = (path) => location.pathname === path ? 'nav-pill active' : 'nav-pill';

    return (
        <header className="top-header">
            {/* Nav Pills - Scrollable on mobile */}
            <div className="nav-pills no-scrollbar">
                <Link to="/admin/dashboard" className={isActive('/admin/dashboard')}>{t('adminDashboard')}</Link>
                <Link to="/admin/ai-heatmap" className={isActive('/admin/ai-heatmap')}>{t('adminAIHeatmap')}</Link>
                <Link to="/admin/lane" className={isActive('/admin/lane')}>{t('adminLane')}</Link>
            </div>

            <div className="admin-user-controls">
                <div className="admin-avatar">
                    A
                </div>
                <button onClick={onLogout} className="logout-btn">{t('logout')} ↪</button>
            </div>
        </header>
    );
};

export default AdminHeader;
