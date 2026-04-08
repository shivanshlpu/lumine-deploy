import React from 'react';
import { CheckCircle2, Clock, Users, Download, CheckCircle } from 'lucide-react';

const VisitCard = ({ visit, type, onCancel, onDownload }) => {
    if (type === 'upcoming') {
        return (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow mb-6 relative">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500"></div>
                <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                        <div className="flex gap-5 items-center">
                            <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 flex flex-col items-center justify-center text-orange-700 shadow-sm">
                                <span className="text-2xl font-bold font-serif leading-none">
                                    {visit.dayNumber}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wide">
                                    {visit.monthShort}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-navy-800 font-serif">
                                    Somnath Mandir Darshan
                                </h3>
                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                    Booking ID:{' '}
                                    <span className="font-mono text-navy-800 bg-gray-100 px-1.5 rounded text-xs">
                                        {visit.booking_id}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold border border-green-200 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Confirmed
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-orange-600 shadow-sm border border-gray-100">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-gray-400">
                                    Time Slot
                                </p>
                                <p className="text-sm font-semibold text-navy-900">
                                    {visit.time_slot}
                                </p>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-orange-600 shadow-sm border border-gray-100">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-gray-400">
                                    Devotees
                                </p>
                                <p className="text-sm font-semibold text-navy-900">
                                    {visit.members_count} Person(s)
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => onDownload(visit.booking_id)}
                            className="flex-1 bg-navy-800 hover:bg-navy-900 text-white py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-navy-900/10"
                        >
                            <Download className="w-4 h-4" /> Download E-Pass
                        </button>
                        <button
                            onClick={() => onCancel(visit.booking_id)}
                            className="px-6 py-3 border border-gray-200 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl font-semibold text-sm transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }



    return (
        <div className="bg-white/60 rounded-xl border border-gray-200 p-6 mb-4 opacity-80 hover:opacity-100 transition-opacity">
            <div className="flex justify-between items-center">
                <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex flex-col items-center justify-center text-gray-500 grayscale">
                        <span className="text-lg font-bold font-serif leading-none">
                            {visit.dayNumber}
                        </span>
                        <span className="text-[9px] font-bold uppercase">
                            {visit.monthShort}
                        </span>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-700">Somnath Mandir</h3>
                        <p className="text-xs text-gray-400">
                            Completed • {visit.booking_id}
                        </p>
                    </div>
                </div>
                <span className="text-gray-400 text-sm font-medium flex items-center gap-1">
                    Verified <CheckCircle className="w-4 h-4 text-green-500" />
                </span>
            </div>
        </div>
    );
};

export default VisitCard;
