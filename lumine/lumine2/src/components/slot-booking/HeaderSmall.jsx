import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const HeaderSmall = () => {
    return (
        <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link
                    to="/dashboard"
                    className="flex items-center gap-2 text-gray-500 hover:text-orange-600 transition p-2 rounded-lg hover:bg-orange-50"
                >
                    <ArrowLeft className="w-5 h-5" /> <span className="font-bold text-sm">Dashboard</span>
                </Link>
                <div className="flex items-center gap-2">
                    <img src="/src/assets/logo.png" alt="Lumine Logo" className="h-10 w-auto md:h-12" />
                    <span className="font-serif font-bold text-navy-900 text-lg">
                        LUMINE Slot-Booking
                    </span>
                </div>
                <div className="w-20"></div>
            </div>
        </header>
    );
};

export default HeaderSmall;
