import React, { useEffect, useState } from 'react';

const Toast = ({ message, show, onClose }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (show) {
            const startTimer = setTimeout(() => setVisible(true), 10);
            const endTimer = setTimeout(() => {
                setVisible(false);
                if (onClose) onClose();
            }, 3000);
            return () => {
                clearTimeout(startTimer);
                clearTimeout(endTimer);
            };
        }
    }, [show, onClose]);

    return (
        <div
            className="toast"
            id="toast"
            style={{ transform: visible ? 'translateX(0)' : 'translateX(200%)' }}
        >
            {message}
        </div>
    );
};

export default Toast;
