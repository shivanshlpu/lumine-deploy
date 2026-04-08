import React from 'react';
import {
    CalendarClock,
    CalendarX,
    Download,
    ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const BookingCard = ({ bookingData, onCancel }) => {
    const hasBooking = !!bookingData;

    return (
        <div className="lumine-card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>

            <div className="flex justify-between items-start mb-6 relative z-10">
                <h3 className="text-lg font-bold text-navy-900 flex items-center gap-2">
                    <CalendarClock className="text-orange-600 w-5 h-5" /> Upcoming Darshan
                </h3>
                {hasBooking && (
                    <span
                        id="slotStatusBadge"
                        className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200"
                    >
                        CONFIRMED
                    </span>
                )}
            </div>

            {!hasBooking ? (
                <div id="noBookingState" className="text-center py-8">
                    <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CalendarX className="w-8 h-8 text-orange-600 opacity-60" />
                    </div>
                    <h4 className="text-md font-semibold text-navy-900">No Active Booking</h4>
                    <p className="text-sm text-gray-500 mb-4">
                        Book a slot to see your details here.
                    </p>
                    <Link to="/dashboard/slot-booking" className="btn btn-primary inline-flex items-center gap-2">
                        Book New Slot <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            ) : (
                <div id="bookingFoundState" className="relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-sand p-3 rounded-lg border border-orange-100">
                            <div className="text-xs text-gray-400 uppercase mb-1">Date</div>
                            <div id="bookingDate" className="font-bold text-navy-900 text-lg">
                                {bookingData.date}
                            </div>
                        </div>
                        <div className="bg-sand p-3 rounded-lg border border-orange-100">
                            <div className="text-xs text-gray-400 uppercase mb-1">Time</div>
                            <div id="bookingTime" className="font-bold text-orange-600 text-lg">
                                {bookingData.time_slot}
                            </div>
                        </div>
                        <div className="bg-sand p-3 rounded-lg border border-orange-100">
                            <div className="text-xs text-gray-400 uppercase mb-1">ID</div>
                            <div id="bookingId" className="font-bold text-navy-900 text-lg">
                                {bookingData.booking_id}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">

                        <button
                            onClick={onCancel}
                            className="btn btn-ghost text-red-500 hover:bg-red-50"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingCard;
