import React from 'react';

const VisitsTabs = ({ activeTab, onSwitchTab }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1.5 inline-flex mb-8">
            <button
                onClick={() => onSwitchTab('upcoming')}
                id="tab-upcoming"
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'upcoming'
                        ? 'shadow-md bg-navy-800 text-white'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
            >
                Upcoming Visits
            </button>
            <button
                onClick={() => onSwitchTab('completed')}
                id="tab-completed"
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'completed'
                        ? 'shadow-md bg-navy-800 text-white'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
            >
                Past History
            </button>
        </div>
    );
};

export default VisitsTabs;
