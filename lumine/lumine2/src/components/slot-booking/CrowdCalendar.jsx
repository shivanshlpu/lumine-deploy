import React, { useState, useMemo } from "react";

const CrowdCalendar = ({ selectedDate, onDateSelect, predictions, temple }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [viewYear, setViewYear] = useState(today.getFullYear());

    // Build prediction lookup map
    const predMap = useMemo(() => {
        const map = {};
        (predictions || []).forEach((p) => {
            map[p.date] = p;
        });
        return map;
    }, [predictions]);

    // Generate calendar grid
    const calendarDays = useMemo(() => {
        const firstDay = new Date(viewYear, viewMonth, 1);
        const lastDay = new Date(viewYear, viewMonth + 1, 0);
        const startPad = firstDay.getDay(); // 0=Sun

        const days = [];

        // Padding days from previous month
        for (let i = 0; i < startPad; i++) {
            days.push({ day: null, dateStr: null, isPad: true });
        }

        // Actual days
        for (let d = 1; d <= lastDay.getDate(); d++) {
            const date = new Date(viewYear, viewMonth, d);
            const dateStr = date.toISOString().split("T")[0];
            const isPast = date < today;
            const isToday = date.getTime() === today.getTime();

            // Max 3 months ahead
            const maxDate = new Date(today);
            maxDate.setMonth(maxDate.getMonth() + 3);
            const isFuture = date > maxDate;

            days.push({
                day: d,
                dateStr,
                isPast,
                isToday,
                isFuture,
                isDisabled: isPast || isFuture,
                prediction: predMap[dateStr] || null,
            });
        }

        return days;
    }, [viewMonth, viewYear, predMap, today]);

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ];

    const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    const goNextMonth = () => {
        const maxDate = new Date(today);
        maxDate.setMonth(maxDate.getMonth() + 3);
        const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
        const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
        if (new Date(nextYear, nextMonth, 1) <= maxDate) {
            setViewMonth(nextMonth);
            setViewYear(nextYear);
        }
    };

    const goPrevMonth = () => {
        const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
        const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
        const lastOfPrev = new Date(prevYear, prevMonth + 1, 0);
        if (lastOfPrev >= today) {
            setViewMonth(prevMonth);
            setViewYear(prevYear);
        }
    };

    const getDateBgClass = (pred, dateStr) => {
        if (!pred || !temple) return "bg-white hover:bg-gray-50";
        const isSelected = dateStr === selectedDate;

        if (pred.color === "red") {
            return isSelected
                ? "bg-red-600 text-white ring-2 ring-red-400 ring-offset-1"
                : "bg-red-100 text-red-800 hover:bg-red-200";
        }
        if (pred.color === "orange") {
            return isSelected
                ? "bg-orange-500 text-white ring-2 ring-orange-400 ring-offset-1"
                : "bg-orange-100 text-orange-800 hover:bg-orange-200";
        }
        // green
        return isSelected
            ? "bg-green-600 text-white ring-2 ring-green-400 ring-offset-1"
            : "bg-green-100 text-green-800 hover:bg-green-200";
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-navy-900 to-navy-800">
                <button
                    onClick={goPrevMonth}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-white/80 hover:bg-white/10 transition"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h3 className="text-white font-semibold text-sm">
                    {monthNames[viewMonth]} {viewYear}
                </h3>
                <button
                    onClick={goNextMonth}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-white/80 hover:bg-white/10 transition"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Day names */}
            <div className="grid grid-cols-7 border-b border-gray-100">
                {dayNames.map((d) => (
                    <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase py-2">
                        {d}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1 p-2">
                {calendarDays.map((item, idx) => {
                    if (item.isPad) {
                        return <div key={`pad-${idx}`} className="h-10" />;
                    }

                    const isSelected = item.dateStr === selectedDate;
                    const bgClass = item.isDisabled
                        ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                        : getDateBgClass(item.prediction, item.dateStr);

                    return (
                        <button
                            key={item.dateStr}
                            disabled={item.isDisabled}
                            onClick={() => onDateSelect(item.dateStr)}
                            className={`relative h-10 rounded-lg text-sm font-medium transition-all duration-150 ${bgClass} ${!item.isDisabled ? "cursor-pointer" : ""
                                }`}
                            title={
                                item.prediction?.festival
                                    ? `${item.prediction.festival}`
                                    : item.isDisabled
                                        ? "Not available"
                                        : "Select date"
                            }
                        >
                            {item.day}
                            {item.isToday && (
                                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-saffron-600" />
                            )}
                            {item.prediction?.festival && !item.isDisabled && (
                                <span className="absolute top-0.5 right-0.5 text-[8px]">🎪</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-green-400" />
                    <span className="text-[10px] text-gray-500 font-medium">Low Crowd</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-orange-400" />
                    <span className="text-[10px] text-gray-500 font-medium">Moderate</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-[10px] text-gray-500 font-medium">Crowded</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-[10px]">🎪</span>
                    <span className="text-[10px] text-gray-500 font-medium">Festival</span>
                </div>
            </div>
        </div>
    );
};

export default CrowdCalendar;
