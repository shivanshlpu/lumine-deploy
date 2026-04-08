import React from 'react';
import {
    LayoutGrid,
    CalendarPlus,
    History,
    Signal,
    Bell,
    QrCode,
    AlertCircle,
    Headset,
    LogOut,
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const isActive = (path) => location.pathname === path;

    const logout = () => {
        // Clear all auth data
        localStorage.removeItem('lumine_token');
        localStorage.removeItem('lumine_redirect_url');
        localStorage.removeItem('lumine_role');
        sessionStorage.removeItem('lumine_token');
        sessionStorage.removeItem('lumine_redirect_url');
        sessionStorage.removeItem('lumine_role');

        // Redirect to landing page
        navigate('/');
    };

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 z-20 h-full">
            {/* Logo removed to avoid duplication with GovernmentHeader */}

            <nav className="flex-1 overflow-y-auto p-4 space-y-1 no-scrollbar">

                <Link to="/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group ${isActive('/dashboard') ? 'bg-navy-900 text-white shadow-lg shadow-navy-900/20' : 'text-gray-500 hover:bg-orange-50 hover:text-orange-700'}`}>
                    <LayoutGrid className={`w-5 h-5 ${isActive('/dashboard') ? '' : 'group-hover:scale-110 transition-transform'}`} />
                    <span>{t('navDashboard')}</span>
                </Link>

                <Link to="/dashboard/slot-booking" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group ${isActive('/dashboard/slot-booking') ? 'bg-navy-900 text-white shadow-lg shadow-navy-900/20' : 'text-gray-500 hover:bg-orange-50 hover:text-orange-700'}`}>
                    <CalendarPlus className={`w-5 h-5 ${isActive('/dashboard/slot-booking') ? '' : 'group-hover:scale-110 transition-transform'}`} />
                    <span>{t('navSlotBooking')}</span>
                </Link>

                <Link to="/dashboard/my-visits" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group ${isActive('/dashboard/my-visits') ? 'bg-navy-800 text-white font-semibold shadow-lg shadow-navy-900/20' : 'text-gray-500 hover:bg-orange-50 hover:text-orange-700'}`}>
                    <History className={`w-5 h-5 ${isActive('/dashboard/my-visits') ? '' : 'group-hover:scale-110 transition-transform'}`} />
                    <span>{t('navMyVisits')}</span>
                </Link>

                <div className="my-4 border-t border-gray-100 mx-2"></div>

                <Link to="/dashboard/admin-notices" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group ${isActive('/dashboard/admin-notices') ? 'bg-navy-900 text-white shadow-lg shadow-navy-900/20' : 'text-gray-500 hover:bg-orange-50 hover:text-orange-700'}`}>
                    <Bell className={`w-5 h-5 ${isActive('/dashboard/admin-notices') ? '' : 'group-hover:scale-110 transition-transform'}`} />
                    <span>{t('navAdminNotices')}</span>
                </Link>

                <Link to="/dashboard/support" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group ${isActive('/dashboard/support') ? 'bg-navy-900 text-white shadow-lg shadow-navy-900/20' : 'text-gray-500 hover:bg-orange-50 hover:text-orange-700'}`}>
                    <Headset className={`w-5 h-5 ${isActive('/dashboard/support') ? '' : 'group-hover:scale-110 transition-transform'}`} />
                    <span>{t('support')}</span>
                </Link>

                <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all group text-left">
                    <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>{t('logout')}</span>
                </button>

            </nav>
        </aside>
    );
};

export default Sidebar;
