import React, { useEffect, useState } from 'react';

const ToastNotification = ({ show, laneName, onClose }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (show) {
            const startTimer = setTimeout(() => setVisible(true), 10);
            const endTimer = setTimeout(() => {
                setVisible(false);
                if (onClose) onClose();
            }, 4000);
            return () => {
                clearTimeout(startTimer);
                clearTimeout(endTimer);
            };
        }
    }, [show, onClose]);

    if (!show && !visible) return null;

    return (
        <div
            id="toast-notification"
            className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-full shadow-2xl z-[600] flex items-center gap-3 ${visible ? 'toast-enter' : 'hidden'}`}
        >
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-xs">
                <i className="fas fa-check"></i>
            </div>
            <div className="text-sm font-medium">
                Team Gamma deployed to <span id="toast-lane-name" className="text-lumine-orange font-bold">{laneName}</span>
            </div>
        </div>
    );
};

export default ToastNotification;
