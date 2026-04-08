import React from 'react';
import Sidebar from '../components/Sidebar';
import VisitsTabs from '../components/my-visits/VisitsTabs';
import VisitsList from '../components/my-visits/VisitsList';
import useVisits from '../hooks/useVisits';

import DigitalIdCard from '../components/DigitalIdCard';

const MyVisits = () => {
    const {
        activeTab,
        upcomingVisits,
        completedVisits,
        printingVisit,
        switchTab,
        cancelVisit,
        downloadEpass
    } = useVisits();

    const userName = 'Shivansh';
    const userRole = 'Primary Devotee';
    const userInitial = 'S';

    const formattedDate = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

    return (
        <div className="bg-sand text-navy-900 font-sans flex h-screen overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col h-full relative overflow-hidden">

                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0 z-10 sticky top-0">
                    <div>
                        <h2 className="font-serif text-2xl font-bold text-navy-800">My Activity</h2>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right hidden md:block">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Today</p>
                            <p className="text-sm font-semibold text-orange-600">{formattedDate}</p>
                        </div>
                        <div className="w-px h-8 bg-gray-200"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm font-bold text-navy-800 leading-none">{userName}</p>
                                <p className="text-[10px] text-gray-500">{userRole}</p>
                            </div>
                            <div className="w-10 h-10 bg-navy-800 text-white rounded-full flex items-center justify-center font-serif font-bold shadow-lg shadow-navy-900/20">{userInitial}</div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 scroll-smooth">
                    <VisitsTabs activeTab={activeTab} onSwitchTab={switchTab} />

                    <VisitsList
                        activeTab={activeTab}
                        upcomingVisits={upcomingVisits}
                        completedVisits={completedVisits}
                        onCancel={cancelVisit}
                        onDownload={downloadEpass}
                    />
                </main>
            </div>

            <div className="hidden print:block fixed inset-0 bg-white z-[100] flex items-center justify-center">
                {printingVisit && <DigitalIdCard bookingData={printingVisit} />}
            </div>
        </div>
    );
};

export default MyVisits;
