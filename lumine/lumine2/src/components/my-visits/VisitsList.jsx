import React from 'react';
import VisitCard from './VisitCard';

const VisitsList = ({ activeTab, upcomingVisits, completedVisits, onCancel, onDownload }) => {
    return (
        <>
            <div id="section-upcoming" className={`max-w-4xl animate-fade-in ${activeTab === 'upcoming' ? '' : 'hidden'}`}>
                {upcomingVisits.length > 0 ? (
                    upcomingVisits.map((visit) => (
                        <VisitCard
                            key={visit.booking_id}
                            visit={visit}
                            type="upcoming"
                            onCancel={onCancel}
                            onDownload={onDownload}
                        />
                    ))
                ) : (
                    <div className="text-center py-10 text-gray-400">No upcoming visits found.</div>
                )}
                {upcomingVisits.length > 0 && (
                    <p className="text-center text-xs text-gray-400 mt-8">Showing all upcoming bookings.</p>
                )}
            </div>

            <div id="section-completed" className={`max-w-4xl ${activeTab === 'completed' ? '' : 'hidden'}`}>
                {completedVisits.length > 0 ? (
                    completedVisits.map((visit) => (
                        <VisitCard
                            key={visit.booking_id}
                            visit={visit}
                            type="completed"
                        />
                    ))
                ) : (
                    <div className="text-center py-10 text-gray-400">No past visits found.</div>
                )}
            </div>
        </>
    );
};

export default VisitsList;
