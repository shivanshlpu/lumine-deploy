import React from 'react';
import { User } from 'lucide-react';

const DigitalIdCard = ({ bookingData }) => {
    if (!bookingData) return null;

    const primaryUser = bookingData.members?.[0]?.name || 'Devotee';
    const bookingId = bookingData.booking_id || '--';
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
        bookingId
    )}`;

    return (
        <div
            id="digitalIdCard"
            class="lumine-card p-0 overflow-hidden border-t-4 border-t-orange-600"
        >
            <div class="bg-navy-900 p-4 text-center">
                <div class="text-white font-bold tracking-widest text-sm uppercase">
                    E-Pass
                </div>
                <div class="text-[10px] text-orange-200">Somnath Mandir Trust</div>
            </div>
            <div class="p-6 flex flex-col items-center">
                <div class="w-20 h-20 rounded-full border-4 border-white shadow-lg bg-gray-200 mb-3 flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-400" />
                </div>
                <div
                    id="idCardName"
                    class="text-lg font-bold text-navy-900 text-center"
                >
                    {primaryUser}
                </div>
                <div class="text-xs text-gray-500 mb-2">Primary Devotee</div>
                <div
                    id="idCardBookingId"
                    class="text-xs font-mono font-bold text-navy-900 mb-4 bg-gray-100 px-3 py-1 rounded"
                >
                    {bookingId}
                </div>

                <div class="p-2 bg-white border border-gray-200 rounded-lg mb-4">
                    <img
                        id="qrCodeImage"
                        src={qrUrl}
                        alt="QR"
                        class="w-32 h-32 opacity-90"
                    />
                </div>
                <div class="text-[10px] text-gray-400">Scan at Gate Entry</div>
            </div>
        </div>
    );
};

export default DigitalIdCard;
