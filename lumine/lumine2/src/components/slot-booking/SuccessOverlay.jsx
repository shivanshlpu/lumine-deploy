import React from "react";
import logoImage from "../../assets/logo.png";

const SuccessOverlay = ({ isVisible }) => {
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
                        Your slot has been successfully booked. You will receive a
                        confirmation email shortly.
                    </p>
                </div>
                <div className="pt-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-3 px-4 bg-saffron-600 text-white rounded-lg font-semibold hover:bg-saffron-700 transition-colors"
                    >
                        Book Another Slot
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SuccessOverlay;
