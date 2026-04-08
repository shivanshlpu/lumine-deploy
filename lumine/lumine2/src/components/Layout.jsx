import React, { useState, useEffect } from 'react';
import GovernmentHeader from './GovernmentHeader';

const Layout = ({ children }) => {
    const [fontSize, setFontSize] = useState('normal');

    useEffect(() => {
        const root = document.documentElement;
        if (fontSize === 'small') {
            root.style.fontSize = '14px';
            document.body.classList.add('font-small');
            document.body.classList.remove('font-normal', 'font-large');
        } else if (fontSize === 'large') {
            root.style.fontSize = '18px';
            document.body.classList.add('font-large');
            document.body.classList.remove('font-small', 'font-normal');
        } else {
            root.style.fontSize = '16px';
            document.body.classList.add('font-normal');
            document.body.classList.remove('font-small', 'font-large');
        }
    }, [fontSize]);

    return (
        <div className="flex flex-col min-h-screen">
            <GovernmentHeader fontSize={fontSize} setFontSize={setFontSize} />
            <div className="flex-1 flex flex-col relative">
                {children}
            </div>
        </div>
    );
};

export default Layout;
