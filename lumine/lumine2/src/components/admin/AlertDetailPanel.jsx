import React from 'react';

const AlertDetailPanel = ({ activeAlert, onClose, onAssign }) => {
    if (!activeAlert) return null;

    return (
        <div className="alert-float-panel" style={{ display: 'block' }}>
            <div className="alert-float-header">
                <div>
                    <h4 style={{ color: 'var(--red)', marginBottom: '2px' }} id="alert-title">
                        {activeAlert.type}
                    </h4>
                    <small style={{ color: 'var(--text-muted)' }} id="alert-loc">
                        {activeAlert.loc} • Just now
                    </small>
                </div>
                <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>
                    &times;
                </button>
            </div>
            <div style={{ fontSize: '0.8rem', marginBottom: '10px', color: 'var(--text-dark)' }}>
                <strong>Details:</strong> <span id="alert-desc">{activeAlert.desc}</span>
            </div>
            <button className="btn-assign" onClick={onAssign}>
                👮 Assign Nearest Guard Team
            </button>
        </div>
    );
};

export default AlertDetailPanel;
