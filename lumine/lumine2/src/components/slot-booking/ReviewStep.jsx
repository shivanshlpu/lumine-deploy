import React from "react";
import logoImage from "../../assets/logo.png";

const ReviewStep = ({ isActive, temple, date, timeSlot, memberCount }) => {
    if (!isActive) return null;

    const templeNames = {
        somnath: "Somnath Temple",
        dwarka: "Dwarka Temple",
        nageshwar: "Nageshwar Temple",
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "Not selected";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="p-6 md:p-8 space-y-6">
            <div>
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">
                    Review Your Booking
                </h2>
                <p className="text-gray-600 text-sm">
                    Please review your details before confirming
                </p>
            </div>

            <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-saffron-50 rounded-lg flex items-center justify-center overflow-hidden p-1.5">
                            <img
                                src={logoImage}
                                alt="Temple Logo"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold">
                                Temple
                            </p>
                            <p className="text-lg font-semibold text-gray-900">
                                {templeNames[temple] || "Not selected"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-saffron-100 rounded-lg flex items-center justify-center">
                            <i className="ph ph-calendar text-saffron-600 text-xl"></i>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold">
                                Date
                            </p>
                            <p className="text-lg font-semibold text-gray-900">
                                {formatDate(date)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-saffron-100 rounded-lg flex items-center justify-center">
                            <i className="ph ph-clock text-saffron-600 text-xl"></i>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold">
                                Time Slot
                            </p>
                            <p className="text-lg font-semibold text-gray-900">
                                {timeSlot || "Not selected"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-saffron-100 rounded-lg flex items-center justify-center">
                            <i className="ph ph-users text-saffron-600 text-xl"></i>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold">
                                Members
                            </p>
                            <p className="text-lg font-semibold text-gray-900">
                                {memberCount} {memberCount === 1 ? "member" : "members"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewStep;
