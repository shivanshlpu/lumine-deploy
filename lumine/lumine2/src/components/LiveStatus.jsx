import React from 'react';
import { Activity } from 'lucide-react';

const LiveStatus = () => {
    return (
        <div class="lumine-card">
            <h3 class="font-bold text-navy-900 mb-4 flex items-center gap-2">
                <Activity className="text-orange-600 w-5 h-5" /> Live Status
            </h3>
            <div class="p-3 rounded-xl border border-green-100 bg-green-50/50 flex justify-between items-center">
                <div class="flex items-center gap-3">
                    <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span class="text-sm font-bold text-navy-900">General Gate</span>
                </div>
                <span class="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-md">
                    Open
                </span>
            </div>
        </div>
    );
};

export default LiveStatus;
