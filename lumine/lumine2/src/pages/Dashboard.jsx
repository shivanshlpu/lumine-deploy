import React from 'react';
import Sidebar from '../components/Sidebar';
import BookingCard from '../components/BookingCard';
import MembersCard from '../components/MembersCard';
import DigitalIdCard from '../components/DigitalIdCard';

import useBooking from '../hooks/useBooking';

import { useTranslation } from '../context/LanguageContext';

const Dashboard = () => {
    const { t, language } = useTranslation();
    const { bookingData, downloadTicket, cancelBooking } = useBooking();

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

    return (
        <div className="bg-sand text-navy-900 font-sans flex min-h-screen">
            <Sidebar />

            <div className="flex-1 flex flex-col relative">
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0 z-10 sticky top-0">
                    <div>
                        <h2 className="font-serif text-2xl font-bold text-navy-800">Dashboard</h2>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right hidden md:block">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('today')}</p>
                            <p className="text-sm font-semibold text-orange-600">{currentDate}</p>
                        </div>
                        <div className="w-px h-8 bg-gray-200"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm font-bold text-navy-800 leading-none">{headerUserName}</p>
                                <p className="text-[10px] text-gray-500">{userRole}</p>
                            </div>
                            <div className="w-10 h-10 bg-navy-900 text-white rounded-full flex items-center justify-center font-serif font-bold shadow-lg shadow-navy-900/20">
                                {userInitial}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-8">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-navy-900 font-serif">
                                {t('namaste')} <span id="welcomeName">{userName}</span>
                            </h1>
                            <p className="text-gray-500 text-sm mt-1">
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
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
