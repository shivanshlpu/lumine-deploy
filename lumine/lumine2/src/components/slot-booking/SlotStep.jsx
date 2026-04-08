import React from "react";

const SlotStep = ({
    isActive,
    temple,
    date,
    timeSlot,
    onTempleChange,
    onDateChange,
    onTimeChange,
}) => {
    if (!isActive) return null;

    const temples = [
        { id: "somnath", name: "Somnath Temple" },
        { id: "dwarka", name: "Dwarka Temple" },
        { id: "nageshwar", name: "Nageshwar Temple" },
    ];

    const timeSlots = [
        "06:00 AM - 08:00 AM",
        "08:00 AM - 10:00 AM",
        "10:00 AM - 12:00 PM",
        "12:00 PM - 02:00 PM",
        "02:00 PM - 04:00 PM",
        "04:00 PM - 06:00 PM",
    ];

    const today = new Date().toISOString().split("T")[0];
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    const maxDateStr = maxDate.toISOString().split("T")[0];

    return (
        <div className="p-6 md:p-8 space-y-6">
            <div>
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">
                    Select Your Slot
                </h2>
                <p className="text-gray-600 text-sm">
                    Choose your preferred temple, date, and time slot
                </p>
            </div>

            <div className="space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Temple
                    </label>
                    <select
                        value={temple}
                        onChange={(e) => onTempleChange(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 text-gray-900"
                    >
                        <option value="">Select a temple</option>
                        {temples.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Date
                    </label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => onDateChange(e.target.value)}
                        min={today}
                        max={maxDateStr}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 text-gray-900"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Time Slot
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {timeSlots.map((slot) => (
                            <button
                                key={slot}
                                type="button"
                                onClick={() => onTimeChange(slot)}
                                className={`px-4 py-3 border-2 rounded-lg text-sm font-medium transition-all ${timeSlot === slot
                                        ? "border-saffron-600 bg-saffron-50 text-saffron-700"
                                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                                    }`}
                            >
                                {slot}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SlotStep;
