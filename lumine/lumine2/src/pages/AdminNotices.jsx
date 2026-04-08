import React from 'react';
import Sidebar from '../components/Sidebar';

const AdminNotices = () => {
    return (
        <div className="bg-sand text-navy-900 font-sans flex min-h-screen">
            <Sidebar />

            <div className="flex-1 flex flex-col relative">
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0 z-10 sticky top-0">
                    <div>
                        <h2 className="font-serif text-2xl font-bold text-navy-800">Admin Notices & Updates</h2>
                    </div>
                </header>

                <main className="flex-1 p-8 overflow-y-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* Left Column: Official Notices */}
                        <div className="space-y-8">
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                                <h3 className="text-xl font-bold font-serif text-navy-900 mb-6 flex items-center gap-2">
                                    <i className="ph-fill ph-megaphone text-orange-600 text-2xl"></i>
                                    Official Announcements
                                </h3>

                                <div className="space-y-6">
                                    {/* ID Proof Alert */}
                                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                                        <div className="flex items-start gap-3">
                                            <i className="ph-fill ph-warning-circle text-red-600 text-xl mt-0.5"></i>
                                            <div>
                                                <h4 className="font-bold text-red-800">Mandatory ID Proof</h4>
                                                <p className="text-sm text-red-700 mt-1">
                                                    All devotees must carry their <strong>Original Government ID Proof</strong> (Aadhaar, Voter ID, etc.) during the visit. Entry will be denied without valid ID.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Temple Timings */}
                                    <div>
                                        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                            <i className="ph-fill ph-clock text-gray-500"></i>
                                            Temple Darshan Timings
                                        </h4>
                                        <div className="overflow-hidden border border-gray-200 rounded-xl">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-gray-50 text-gray-700 font-bold uppercase text-xs">
                                                    <tr>
                                                        <th className="px-4 py-3">Temple</th>
                                                        <th className="px-4 py-3">Opening Hours</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    <tr className="bg-white">
                                                        <td className="px-4 py-3 font-medium text-navy-900">Somnath Temple</td>
                                                        <td className="px-4 py-3 text-gray-600">06:00 AM - 10:00 PM</td>
                                                    </tr>
                                                    <tr className="bg-gray-50/50">
                                                        <td className="px-4 py-3 font-medium text-navy-900">Dwarka Temple</td>
                                                        <td className="px-4 py-3 text-gray-600">
                                                            06:30 AM - 01:00 PM<br />
                                                            05:00 PM - 09:30 PM
                                                        </td>
                                                    </tr>
                                                    <tr className="bg-white">
                                                        <td className="px-4 py-3 font-medium text-navy-900">Nageshwar Temple</td>
                                                        <td className="px-4 py-3 text-gray-600">
                                                            06:00 AM - 12:30 PM<br />
                                                            05:00 PM - 09:30 PM
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Crowd Calendar */}
                        <div className="space-y-8">
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                                <h3 className="text-xl font-bold font-serif text-navy-900 mb-2 flex items-center gap-2">
                                    <i className="ph-fill ph-calendar-check text-green-600 text-2xl"></i>
                                    Crowd Forecast Calendar
                                </h3>
                                <p className="text-gray-500 mb-6 text-sm">
                                    Plan your visit during low-crowd periods for a peaceful Darshan experience.
                                </p>

                                <div className="space-y-4">
                                    {/* Legend */}
                                    <div className="flex gap-4 text-xs font-bold uppercase tracking-wide mb-4">
                                        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500"></span> Low Crowd</div>
                                        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> Moderate</div>
                                        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span> High Crowd</div>
                                    </div>

                                    {/* Calendar Grid */}
                                    <div className="grid grid-cols-1 gap-3">

                                        {/* Summer (Low) */}
                                        <div className="border border-green-200 bg-green-50 rounded-xl p-4 flex justify-between items-center">
                                            <div>
                                                <h4 className="font-bold text-green-800">Summer (April - June)</h4>
                                                <p className="text-xs text-green-700 mt-1">Hot weather results in fewer tourists. Best for peaceful darshan.</p>
                                            </div>
                                            <span className="px-3 py-1 bg-green-200 text-green-800 text-xs font-bold rounded-full">Recommended</span>
                                        </div>

                                        {/* Monsoon (Low/Moderate) */}
                                        <div className="border border-green-200 bg-green-50 rounded-xl p-4 flex justify-between items-center">
                                            <div>
                                                <h4 className="font-bold text-green-800">Monsoon (July - Sept)</h4>
                                                <p className="text-xs text-green-700 mt-1">Lush greenery and moderate crowds, except during Shravan month.</p>
                                            </div>
                                            <span className="px-3 py-1 bg-green-200 text-green-800 text-xs font-bold rounded-full">Good Time</span>
                                        </div>

                                        {/* Winter (Moderate/High) */}
                                        <div className="border border-yellow-200 bg-yellow-50 rounded-xl p-4 flex justify-between items-center">
                                            <div>
                                                <h4 className="font-bold text-yellow-800">Winter (Oct - March)</h4>
                                                <p className="text-xs text-yellow-700 mt-1">Pleasant weather attracts more tourists. Weekends are busy.</p>
                                            </div>
                                            <span className="px-3 py-1 bg-yellow-200 text-yellow-800 text-xs font-bold rounded-full">Popular</span>
                                        </div>

                                        {/* Festivals (High) */}
                                        <div className="border border-red-200 bg-red-50 rounded-xl p-4 flex justify-between items-center">
                                            <div>
                                                <h4 className="font-bold text-red-800">Peak Festivals</h4>
                                                <p className="text-xs text-red-700 mt-1">Maha Shivaratri, Kartik Purnima, Diwali, Shravan Month.</p>
                                            </div>
                                            <span className="px-3 py-1 bg-red-200 text-red-800 text-xs font-bold rounded-full">Very Crowded</span>
                                        </div>

                                    </div>

                                    <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                        <h4 className="font-bold text-blue-800 text-sm mb-2"><i className="ph-fill ph-lightbulb mr-1"></i> Pro Tip</h4>
                                        <p className="text-xs text-blue-700">
                                            For the absolute minimum wait time, visit the temples during <strong>Early Morning (6:00 AM - 7:00 AM)</strong> or <strong>Late Evening (post 8:00 PM)</strong> on weekdays (Tue-Thu).
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminNotices;
