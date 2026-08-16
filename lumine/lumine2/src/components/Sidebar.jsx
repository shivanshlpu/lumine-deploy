import React from 'react';
import {
    LayoutGrid,
    CalendarPlus,
    History,
    Bell,
    Headset,
    LogOut,
    X,
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Sidebar = ({ activeTab, onTabChange, isOpen, onClose }) => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const isActive = (path) => location.pathname === path;

    const isSlotBookingActive = activeTab === 'slot-booking';
    const isDashboardHome = location.pathname === '/dashboard' && activeTab === 'home';

    const logout = () => {
        localStorage.removeItem('lumine_token');
        localStorage.removeItem('lumine_redirect_url');
        localStorage.removeItem('lumine_role');
        sessionStorage.removeItem('lumine_token');
        sessionStorage.removeItem('lumine_redirect_url');
        sessionStorage.removeItem('lumine_role');
        navigate('/');
    };

    const handleNavClick = (action) => {
        action();
        if (onClose) onClose();
    };

    return (
        <>
            {/* Mobile Backdrop Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-xs z-30 lg:hidden transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar / Mobile Drawer Container */}
            <aside className={`
                fixed lg:static top-0 bottom-0 left-0 z-40
                w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 h-full
                transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Mobile Drawer Header */}
                <div className="flex lg:hidden items-center justify-between p-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <img src="/src/assets/logo.png" alt="Lumine Logo" className="h-8 w-auto" />
                        <span className="font-bold text-navy-900 font-serif">LUMINE</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
                        aria-label="Close sidebar"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-1 no-scrollbar">
                    {/* Dashboard Home */}
                    <button
                        onClick={() => handleNavClick(() => {
                            if (location.pathname !== '/dashboard') {
                                navigate('/dashboard');
                            } else {
                                onTabChange?.('home');
                            }
                        })}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group text-left ${isDashboardHome ? 'bg-navy-900 text-white shadow-lg shadow-navy-900/20' : 'text-gray-500 hover:bg-orange-50 hover:text-orange-700'}`}
                    >
                        <LayoutGrid className={`w-5 h-5 ${isDashboardHome ? '' : 'group-hover:scale-110 transition-transform'}`} />
                        <span>{t('navDashboard')}</span>
                    </button>

                    {/* Slot Booking */}
                    <button
                        onClick={() => handleNavClick(() => {
                            if (location.pathname !== '/dashboard') {
                                navigate('/dashboard?tab=slot-booking');
                            } else {
                                onTabChange?.('slot-booking');
                            }
                        })}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group text-left ${isSlotBookingActive ? 'bg-navy-900 text-white shadow-lg shadow-navy-900/20' : 'text-gray-500 hover:bg-orange-50 hover:text-orange-700'}`}
                    >
                        <CalendarPlus className={`w-5 h-5 ${isSlotBookingActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
                        <span>{t('navSlotBooking')}</span>
                    </button>

                    <Link
                        to="/dashboard/my-visits"
                        onClick={() => onClose && onClose()}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group ${isActive('/dashboard/my-visits') ? 'bg-navy-800 text-white font-semibold shadow-lg shadow-navy-900/20' : 'text-gray-500 hover:bg-orange-50 hover:text-orange-700'}`}
                    >
                        <History className={`w-5 h-5 ${isActive('/dashboard/my-visits') ? '' : 'group-hover:scale-110 transition-transform'}`} />
                        <span>{t('navMyVisits')}</span>
                    </Link>

                    <div className="my-4 border-t border-gray-100 mx-2"></div>

                    <Link
                        to="/dashboard/admin-notices"
                        onClick={() => onClose && onClose()}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group ${isActive('/dashboard/admin-notices') ? 'bg-navy-900 text-white shadow-lg shadow-navy-900/20' : 'text-gray-500 hover:bg-orange-50 hover:text-orange-700'}`}
                    >
                        <Bell className={`w-5 h-5 ${isActive('/dashboard/admin-notices') ? '' : 'group-hover:scale-110 transition-transform'}`} />
                        <span>{t('navAdminNotices')}</span>
                    </Link>

                    <Link
                        to="/dashboard/support"
                        onClick={() => onClose && onClose()}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group ${isActive('/dashboard/support') ? 'bg-navy-900 text-white shadow-lg shadow-navy-900/20' : 'text-gray-500 hover:bg-orange-50 hover:text-orange-700'}`}
                    >
                        <Headset className={`w-5 h-5 ${isActive('/dashboard/support') ? '' : 'group-hover:scale-110 transition-transform'}`} />
                        <span>{t('support')}</span>
                    </Link>

                    <button
                        onClick={() => handleNavClick(logout)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all group text-left"
                    >
                        <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>{t('logout')}</span>
                    </button>
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
