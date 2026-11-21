import { useState, useEffect, useCallback } from 'react';
import API_BASE_URL from '../config/api';
import {
    predictCrowdLevel,
    predictDateCrowdLevel,
    getCrowdStatus,
    getDateColor,
    getFestivalInfo,
    findBestSlot,
    TIME_SLOTS,
    TEMPLE_METRICS,
} from '../data/crowdData';

// Helper to format local Date object to YYYY-MM-DD without UTC timezone drift
const formatLocalYMD = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * AI-driven crowd prediction hook
 * Combines trained Gradient Boosting model predictions with real-time database bookings
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
            const res = await fetch(`${API_BASE_URL}/api/bookings/availability?temple=${encodeURIComponent(templeId)}&date=${encodeURIComponent(dateStr)}`);
            if (res.ok) {
                const data = await res.json();
                return data; // { "06:00 AM - 08:00 AM": 23, ... }
            }
        } catch (err) {
            console.log('Availability fetch failed, using AI model predictions only:', err.message);
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

        let isMounted = true;

        const calculate = async () => {
            setIsLoading(true);

            // Fetch real booking data
            const bookings = await fetchAvailability(temple, date);
            if (!isMounted) return;
            setDbBookings(bookings);

            // Calculate per-slot predictions using trained ML model
            const predictions = TIME_SLOTS.map(slot => {
                const modelLevel = predictCrowdLevel(temple, date, slot);
                const actualBookings = bookings[slot] || 0;

                // Blend: if we have real booking data, weight it 60/40 with ML model
                // If no real booking data, use ML model directly
                let finalLevel;
                if (actualBookings > 0) {
                    const bookingFraction = Math.min(actualBookings / 500, 1.0);
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

            // Best slot recommendation using live calculated predictions & contextual factors
            const best = findBestSlot(temple, date, predictions);
            setBestSlot(best);

            // Festival info
            setFestivalInfo(getFestivalInfo(date, temple));

            setIsLoading(false);
        };

        calculate();

        return () => {
            isMounted = false;
        };
    }, [temple, date, fetchAvailability]);

    /**
     * Get predictions for a range of dates (for calendar view)
     * Formats dates in local time to avoid UTC offset discrepancies
     */
    const getDateRangePredictions = useCallback((templeId, startDate, days = 92) => {
        if (!templeId) return [];

        const predictions = [];
        let start;
        if (startDate && typeof startDate === 'string') {
            const parts = startDate.split('-').map(Number);
            start = new Date(parts[0], parts[1] - 1, parts[2]);
        } else {
            start = new Date();
        }

        for (let i = 0; i < days; i++) {
            const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
            const dateStr = formatLocalYMD(d);
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
        modelMetrics: TEMPLE_METRICS,
        getDateRangePredictions,
    };
};

export default useCrowdPrediction;
