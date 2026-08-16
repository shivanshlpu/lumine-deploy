import React from "react";
import logoImage from "../../assets/logo.png";

const SuccessOverlay = ({ isVisible, onGoHome }) => {
    if (!isVisible) return null;

    return (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center p-6 transition-colors duration-200">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center space-y-6 transition-colors duration-200">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden bg-transparent">
                        <img
                            src={logoImage}
                            alt="Lumine Temple Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <i className="ph ph-check-circle text-green-600 text-4xl"></i>
                    </div>
                </div>
                <div>
                    <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">
                        Booking Confirmed!
                    </h3>
                    <p className="text-gray-600">
                        Your slot has been successfully booked.
                    </p>
                    <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-sm text-blue-700 font-medium flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Confirmation emails with QR codes have been sent to all members
                        </p>
                    </div>
                </div>
                <div className="pt-4 space-y-3">
                    <button
                        onClick={() => onGoHome?.()}
                        className="w-full py-3 px-4 bg-navy-900 text-white rounded-lg font-semibold hover:bg-navy-800 transition-colors shadow-lg shadow-navy-900/20"
                    >
                        Go to Dashboard
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-3 px-4 bg-saffron-600 text-white rounded-lg font-semibold hover:bg-saffron-500 transition-colors"
                    >
                        Book Another Slot
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SuccessOverlay;
