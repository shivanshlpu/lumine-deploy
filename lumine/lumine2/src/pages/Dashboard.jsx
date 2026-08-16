import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import BookingCard from '../components/BookingCard';
import MembersCard from '../components/MembersCard';
import DigitalIdCard from '../components/DigitalIdCard';
import SlotBooking from './SlotBooking';

import useBooking from '../hooks/useBooking';
import { useTranslation } from '../context/LanguageContext';

const Dashboard = () => {
    const { t, language } = useTranslation();
    const { bookingData, downloadTicket, cancelBooking } = useBooking();
    const [searchParams, setSearchParams] = useSearchParams();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Active tab state — read from URL search params
    const tabParam = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState(tabParam || 'home');

    // Sync tab with URL search params
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && tab !== activeTab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'home') {
            setSearchParams({});
        } else {
            setSearchParams({ tab });
        }
    };

    const userName = bookingData?.members?.[0]?.name?.split(' ')[0] || 'Devotee';
    const headerUserName = bookingData?.members?.[0]?.name || 'Devotee';
    const userRole = t('primaryDevotee');
    const userInitial = headerUserName.charAt(0).toUpperCase();

    // Date formatting
    const currentDate = new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    });

    // Page title based on active tab
    const pageTitle = activeTab === 'slot-booking' ? 'Slot Booking' : 'Dashboard';

    return (
        <div className="bg-sand text-navy-900 font-sans flex min-h-screen relative">
            <Sidebar
                activeTab={activeTab}
                onTabChange={handleTabChange}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div className="flex-1 flex flex-col min-w-0 relative">
                <header className="h-16 sm:h-20 bg-white/90 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 flex-shrink-0 z-10 sticky top-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
                            aria-label="Open menu"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className="font-serif text-lg sm:text-2xl font-bold text-navy-800 truncate">{pageTitle}</h2>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-6">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('today')}</p>
                            <p className="text-xs sm:text-sm font-semibold text-orange-600">{currentDate}</p>
                        </div>
                        <div className="hidden sm:block w-px h-8 bg-gray-200"></div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="text-right max-w-[120px] sm:max-w-none truncate">
                                <p className="text-xs sm:text-sm font-bold text-navy-800 leading-none truncate">{headerUserName}</p>
                                <p className="text-[9px] sm:text-[10px] text-gray-500 truncate">{userRole}</p>
                            </div>
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-navy-900 text-white rounded-full flex items-center justify-center font-serif font-bold text-sm sm:text-base shadow-md shrink-0">
                                {userInitial}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    {/* HOME TAB */}
                    {activeTab === 'home' && (
                        <>
                            <div className="flex justify-between items-end mb-6 sm:mb-8">
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-bold text-navy-900 font-serif">
                                        {t('namaste')} <span id="welcomeName">{userName}</span>
                                    </h1>
                                    <p className="text-gray-500 text-xs sm:text-sm mt-1">
                                        {t('dashboardSubtitle')}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                <div className="lg:col-span-8 space-y-6">
                                    <BookingCard
                                        bookingData={bookingData}
                                        onDownload={downloadTicket}
                                        onCancel={cancelBooking}
                                    />

                                    <MembersCard members={bookingData?.members} />
                                </div>

                                <div className="lg:col-span-4 space-y-6">
                                    <DigitalIdCard bookingData={bookingData} />
                                </div>
                            </div>
                        </>
                    )}

                    {/* SLOT BOOKING TAB */}
                    {activeTab === 'slot-booking' && (
                        <SlotBooking onGoHome={() => handleTabChange('home')} />
                    )}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
