import React from 'react';

const StatsBar = ({ activeAlertsCount = 0, stats = { headCount: 0, slotBooking: 0, counterUser: 0 } }) => {
    return (
        <div className="stats-bar">
            <div className="stat-card">
                <div className="stat-label">Live Head Count</div>
                <div className="stat-val">{stats.headCount.toLocaleString()}</div>
            </div>
            <div className="stat-card">
                <div className="stat-label">Slot Booking</div>
                <div className="stat-val">{stats.slotBooking.toLocaleString()}</div>
            </div>
            <div className="stat-card">
                <div className="stat-label">Counter user</div>
                <div className="stat-val">{stats.counterUser.toLocaleString()}</div>
            </div>
            <div className="stat-card">
                <div className="stat-label">Alerts Active</div>
                <div className="stat-val" style={{ color: 'var(--red)' }}>
                    <span className="text-gray-400 text-2xl font-light mr-2">|</span>
                    {String(activeAlertsCount).padStart(2, '0')}
                </div>
            </div>
        </div>
    );
};

export default StatsBar;
