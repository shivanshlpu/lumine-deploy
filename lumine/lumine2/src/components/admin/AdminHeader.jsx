import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import { useTranslation } from '../../context/LanguageContext';

const AdminHeader = ({ onLogout }) => {
    const { t } = useTranslation();
    const location = useLocation();
    const isActive = (path) => location.pathname === path ? 'nav-pill active' : 'nav-pill';

    return (
        <header className="top-header">
            {/* Brand area removed to avoid duplication with GovernmentHeader */}
            <div className="brand-area hidden"></div>

            <div className="nav-pills">
                <Link to="/admin/dashboard" className={isActive('/admin/dashboard')}>{t('adminDashboard')}</Link>
                <Link to="/admin/heatmap" className={isActive('/admin/heatmap')}>{t('adminHeatmap')}</Link>
                <Link to="/admin/ai-heatmap" className={isActive('/admin/ai-heatmap')}>{t('adminAIHeatmap')}</Link>

                <Link to="/admin/lane" className={isActive('/admin/lane')}>{t('adminLane')}</Link>
                <Link to="#" className="nav-pill">{t('adminSettings')}</Link>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '35px', height: '35px', background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 'bold' }}>
                    A
                </div>
                <button onClick={onLogout} className="logout-btn">{t('logout')} ↪</button>
            </div>
        </header>
    );
};

export default AdminHeader;
