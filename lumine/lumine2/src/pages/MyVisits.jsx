import React, { useState } from 'react';
import { Menu } from 'lucide-react';
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

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const userName = 'Shivansh';
    const userRole = 'Primary Devotee';
    const userInitial = 'S';

    const formattedDate = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

    return (
        <div className="bg-sand text-navy-900 font-sans flex min-h-screen relative">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

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
                        <h2 className="font-serif text-lg sm:text-2xl font-bold text-navy-800 truncate">My Activity</h2>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-6">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Today</p>
                            <p className="text-xs sm:text-sm font-semibold text-orange-600">{formattedDate}</p>
                        </div>
                        <div className="hidden sm:block w-px h-8 bg-gray-200"></div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="text-right max-w-[120px] sm:max-w-none truncate">
                                <p className="text-xs sm:text-sm font-bold text-navy-800 leading-none truncate">{userName}</p>
                                <p className="text-[9px] sm:text-[10px] text-gray-500 truncate">{userRole}</p>
                            </div>
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-navy-800 text-white rounded-full flex items-center justify-center font-serif font-bold text-sm sm:text-base shadow-md shrink-0">
                                {userInitial}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
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
