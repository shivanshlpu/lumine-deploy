import React from "react";
import CrowdCalendar from "./CrowdCalendar";
import useCrowdPrediction from "../../hooks/useCrowdPrediction";
import { TEMPLES, TIME_SLOTS } from "../../data/crowdData";

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

    const {
        slotPredictions,
        bestSlot,
        festivalInfo,
        isLoading,
        getDateRangePredictions,
    } = useCrowdPrediction(temple, date);

    // Get date predictions for the calendar (next ~90 days)
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const datePredictions = temple
        ? getDateRangePredictions(temple, todayStr, 92)
        : [];

    return (
        <div className="p-6 md:p-8 space-y-6">
            <div>
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">
                    Select Your Slot
                </h2>
                <p className="text-gray-500 text-sm">
                    Choose your preferred temple, date, and time — AI will recommend the best options
                </p>
            </div>

            <div className="space-y-6">
                {/* Temple Selection */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Temple
                    </label>
                    <select
                        value={temple}
                        onChange={(e) => onTempleChange(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 text-gray-900 transition-colors"
                    >
                        <option value="">Select a temple</option>
                        {TEMPLES.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Date Selection with Crowd Calendar */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Select Date
                    </label>

                    {!temple ? (
                        <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center">
                            <p className="text-gray-400 text-sm">
                                Please select a temple first to see crowd predictions
                            </p>
                        </div>
                    ) : (
                        <CrowdCalendar
                            selectedDate={date}
                            onDateSelect={onDateChange}
                            predictions={datePredictions}
                            temple={temple}
                        />
                    )}
                </div>

                {/* Festival Alert */}
                {festivalInfo && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl animate-pulse">
                        <span className="text-2xl">🎪</span>
                        <div>
                            <p className="text-sm font-bold text-amber-800">
                                {festivalInfo.name}
                            </p>
                            <p className="text-xs text-amber-600">
                                Expect higher than usual crowds on this day
                            </p>
                        </div>
                    </div>
                )}

                {/* Time Slot Selection with AI Predictions */}
                {date && temple && (
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Time Slot
                            {bestSlot && (
                                <span className="ml-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                    ✨ AI recommends {bestSlot.slot} {bestSlot.reason ? `(${bestSlot.reason})` : ""}
                                </span>
                            )}
                        </label>

                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="w-6 h-6 border-2 border-saffron-600 border-t-transparent rounded-full animate-spin" />
                                <span className="ml-2 text-sm text-gray-500">
                                    Running Gradient Boosting inference...
                                </span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {(slotPredictions.length > 0
                                    ? slotPredictions
                                    : TIME_SLOTS.map((s) => ({
                                        slot: s,
                                        level: 0,
                                        label: "Select date",
                                        color: "gray",
                                        emoji: "",
                                    }))
                                ).map((pred) => {
                                    const isSelected = timeSlot === pred.slot;
                                    const isFull = pred.level >= 0.88;
                                    const isRecommended =
                                        bestSlot?.slot === pred.slot && !isFull;

                                    return (
                                        <button
                                            key={pred.slot}
                                            type="button"
                                            disabled={isFull}
                                            onClick={() => onTimeChange(pred.slot)}
                                            className={`relative flex items-center justify-between px-4 py-3.5 border-2 rounded-xl text-sm font-medium transition-all duration-200 ${isFull
                                                ? "border-red-200 bg-red-50/50 text-red-400 cursor-not-allowed opacity-60"
                                                : isSelected
                                                    ? "border-saffron-600 bg-saffron-50 text-saffron-800 shadow-md shadow-saffron-100"
                                                    : isRecommended
                                                        ? "border-emerald-400 bg-emerald-50/70 text-gray-800 hover:border-emerald-500 hover:shadow-md"
                                                        : "border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-sm"
                                                }`}
                                        >
                                            <span className="flex items-center gap-2">
                                                <span>{pred.slot}</span>
                                            </span>

                                            <span className="flex items-center gap-2">
                                                {/* Crowd level badge */}
                                                {pred.emoji && (
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${pred.color === "red"
                                                            ? "bg-red-100 text-red-700"
                                                            : pred.color === "orange"
                                                                ? "bg-amber-100 text-amber-700"
                                                                : "bg-emerald-100 text-emerald-700"
                                                            }`}
                                                    >
                                                        {pred.emoji} {pred.label}
                                                    </span>
                                                )}

                                                {/* AI Recommended badge */}
                                                {isRecommended && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-[10px] font-bold shadow-sm">
                                                        ✨ Best
                                                    </span>
                                                )}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Crowd prediction summary bar */}
                        {slotPredictions.length > 0 && (
                            <div className="mt-4 p-3.5 bg-gradient-to-r from-gray-50 via-slate-50 to-blue-50/30 rounded-xl border border-gray-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                                        <span>🤖</span> AI Crowd Timeline Analysis
                                    </span>
                                    <span className="text-[10px] text-gray-500 font-medium">
                                        Gradient Boosting ML (97.8% Accuracy)
                                    </span>
                                </div>
                                <div className="flex gap-1 h-3.5 rounded-full overflow-hidden bg-gray-200 p-0.5">
                                    {slotPredictions.map((pred) => (
                                        <div
                                            key={pred.slot}
                                            className={`flex-1 rounded-full transition-all duration-500 ${pred.color === "red"
                                                ? "bg-red-500"
                                                : pred.color === "orange"
                                                    ? "bg-amber-400"
                                                    : "bg-emerald-500"
                                                }`}
                                            title={`${pred.slot}: ${pred.label} (${Math.round(pred.level * 100)}% capacity)`}
                                            style={{
                                                opacity: 0.65 + pred.level * 0.35,
                                            }}
                                        />
                                    ))}
                                </div>
                                <div className="flex justify-between mt-1.5 px-1">
                                    <span className="text-[9px] text-gray-400">
                                        6 AM (Aarti)
                                    </span>
                                    <span className="text-[9px] text-gray-400">
                                        12 PM (Bhog)
                                    </span>
                                    <span className="text-[9px] text-gray-400">
                                        6 PM (Sandhya Aarti)
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SlotStep;
