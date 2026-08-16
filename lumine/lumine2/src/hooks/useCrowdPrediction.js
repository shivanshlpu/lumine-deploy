import { useState, useEffect, useCallback } from 'react';
import {
    predictCrowdLevel,
    predictDateCrowdLevel,
    getCrowdStatus,
    getDateColor,
    getFestivalInfo,
    findBestSlot,
    TIME_SLOTS,
} from '../data/crowdData';

/**
 * AI-like crowd prediction hook
 * Combines static crowd model data with real booking data from backend
 */
const useCrowdPrediction = (temple, date) => {
    const [slotPredictions, setSlotPredictions] = useState([]);
    const [dateLevel, setDateLevel] = useState(0);
    const [dateColor, setDateColor] = useState('green');
    const [bestSlot, setBestSlot] = useState(null);
    const [festivalInfo, setFestivalInfo] = useState(null);
    const [dbBookings, setDbBookings] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // Fetch actual booking counts from backend
    const fetchAvailability = useCallback(async (templeId, dateStr) => {
        if (!templeId || !dateStr) return {};
        try {
            const API_BASE_URL = `http://${window.location.hostname}:5000`;
            const res = await fetch(`${API_BASE_URL}/api/bookings/availability?temple=${templeId}&date=${dateStr}`);
            if (res.ok) {
                const data = await res.json();
                return data; // { "06:00 AM - 08:00 AM": 23, ... }
            }
        } catch (err) {
            console.log('Availability fetch failed, using predictions only:', err.message);
        }
        return {};
    }, []);

    // Calculate predictions when temple or date changes
    useEffect(() => {
        if (!temple || !date) {
            setSlotPredictions([]);
            setDateLevel(0);
            setDateColor('green');
            setBestSlot(null);
            setFestivalInfo(null);
            return;
        }

        const calculate = async () => {
            setIsLoading(true);

            // Fetch real booking data
            const bookings = await fetchAvailability(temple, date);
            setDbBookings(bookings);

            // Calculate per-slot predictions
            const predictions = TIME_SLOTS.map(slot => {
                const modelLevel = predictCrowdLevel(temple, date, slot);
                const actualBookings = bookings[slot] || 0;

                // Blend: if we have real data, weight it 60/40 with model
                // If no real data, use model only
                let finalLevel;
                if (actualBookings > 0) {
                    const bookingFraction = Math.min(actualBookings / 500, 1.0); // ~500 capacity baseline
                    finalLevel = modelLevel * 0.4 + bookingFraction * 0.6;
                } else {
                    finalLevel = modelLevel;
                }

                finalLevel = Math.min(finalLevel, 1.0);
                const status = getCrowdStatus(finalLevel);

                return {
                    slot,
                    level: finalLevel,
                    actualBookings,
                    ...status,
                };
            });

            setSlotPredictions(predictions);

            // Overall date level
            const avgLevel = predictDateCrowdLevel(temple, date);
            setDateLevel(avgLevel);
            setDateColor(getDateColor(avgLevel));

            // Best slot recommendation
            const best = findBestSlot(temple, date);
            setBestSlot(best);

            // Festival info
            setFestivalInfo(getFestivalInfo(date, temple));

            setIsLoading(false);
        };

        calculate();
    }, [temple, date, fetchAvailability]);

    /**
     * Get predictions for a range of dates (for calendar view)
     */
    const getDateRangePredictions = useCallback((templeId, startDate, days = 42) => {
        if (!templeId) return [];

        const predictions = [];
        const start = new Date(startDate);

        for (let i = 0; i < days; i++) {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            const level = predictDateCrowdLevel(templeId, dateStr);
            const festival = getFestivalInfo(dateStr, templeId);

            predictions.push({
                date: dateStr,
                level,
                color: getDateColor(level),
                festival: festival?.name || null,
            });
        }

        return predictions;
    }, []);

    return {
        slotPredictions,
        dateLevel,
        dateColor,
        bestSlot,
        festivalInfo,
        dbBookings,
        isLoading,
        getDateRangePredictions,
    };
};

export default useCrowdPrediction;
