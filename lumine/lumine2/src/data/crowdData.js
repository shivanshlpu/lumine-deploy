/**
 * Realistic Crowd Prediction System for Lumine Temples
 * Powered by trained Machine Learning Engine (Gradient Boosting / Random Forest)
 * Evaluated on 19,728 empirical samples across Somnath, Dwarka, and Nageshwar temples.
 */

import {
    TEMPLES as ENGINE_TEMPLES,
    TIME_SLOTS as ENGINE_TIME_SLOTS,
    TEMPLE_METRICS,
    FESTIVAL_DATES as ENGINE_FESTIVALS,
    predictCrowdLevel as enginePredictCrowdLevel,
    predictDateCrowdLevel as enginePredictDateCrowdLevel,
    getCrowdStatus as engineGetCrowdStatus,
    getDateColor as engineGetDateColor,
    getFestivalInfo as engineGetFestivalInfo,
    findBestSlot as engineFindBestSlot,
} from './crowdModelEngine';

// Slot capacity per temple (max devotees per 2-hour slot)
export const TEMPLE_CAPACITY = {
    somnath: 800,
    dwarka: 600,
    nageshwar: 400,
};

// Re-export constants
export const TEMPLES = ENGINE_TEMPLES;
export const TIME_SLOTS = ENGINE_TIME_SLOTS;
export const FESTIVAL_DATES = ENGINE_FESTIVALS;
export { TEMPLE_METRICS };

// Legacy compatibility multipliers
export const MONTHLY_MULTIPLIERS = {
    somnath: { 1: 1.32, 2: 1.45, 3: 1.10, 4: 0.78, 5: 0.70, 6: 0.65, 7: 1.25, 8: 1.25, 9: 0.85, 10: 1.10, 11: 1.32, 12: 1.35 },
    dwarka:  { 1: 1.30, 2: 1.35, 3: 1.15, 4: 0.80, 5: 0.70, 6: 0.65, 7: 1.15, 8: 1.45, 9: 0.90, 10: 1.15, 11: 1.32, 12: 1.35 },
    nageshwar: { 1: 1.25, 2: 1.40, 3: 1.10, 4: 0.75, 5: 0.65, 6: 0.60, 7: 1.25, 8: 1.25, 9: 0.80, 10: 1.10, 11: 1.30, 12: 1.32 },
};

export const DAY_MULTIPLIERS = {
    somnath: { 0: 1.35, 1: 1.55, 2: 0.90, 3: 0.85, 4: 0.80, 5: 0.85, 6: 1.25 },
    dwarka:  { 0: 1.45, 1: 0.95, 2: 0.85, 3: 0.80, 4: 1.15, 5: 0.90, 6: 1.10 },
    nageshwar: { 0: 1.30, 1: 1.50, 2: 0.85, 3: 0.80, 4: 0.80, 5: 0.85, 6: 1.15 },
};

export const SLOT_POPULARITY = {
    somnath: {
        "06:00 AM - 08:00 AM": 0.42,
        "08:00 AM - 10:00 AM": 0.64,
        "10:00 AM - 12:00 PM": 0.76,
        "12:00 PM - 02:00 PM": 0.32,
        "02:00 PM - 04:00 PM": 0.38,
        "04:00 PM - 06:00 PM": 0.82,
    },
    dwarka: {
        "06:00 AM - 08:00 AM": 0.58,
        "08:00 AM - 10:00 AM": 0.68,
        "10:00 AM - 12:00 PM": 0.74,
        "12:00 PM - 02:00 PM": 0.22,
        "02:00 PM - 04:00 PM": 0.32,
        "04:00 PM - 06:00 PM": 0.80,
    },
    nageshwar: {
        "06:00 AM - 08:00 AM": 0.34,
        "08:00 AM - 10:00 AM": 0.52,
        "10:00 AM - 12:00 PM": 0.62,
        "12:00 PM - 02:00 PM": 0.18,
        "02:00 PM - 04:00 PM": 0.28,
        "04:00 PM - 06:00 PM": 0.72,
    },
};

// Delegate to trained Machine Learning Engine
export const predictCrowdLevel = (templeId, dateStr, timeSlot) => {
    return enginePredictCrowdLevel(templeId, dateStr, timeSlot);
};

export const predictDateCrowdLevel = (templeId, dateStr) => {
    return enginePredictDateCrowdLevel(templeId, dateStr);
};

export const getCrowdStatus = (level) => {
    return engineGetCrowdStatus(level);
};

export const getDateColor = (level) => {
    return engineGetDateColor(level);
};

export const getFestivalInfo = (dateStr, templeId) => {
    return engineGetFestivalInfo(dateStr, templeId);
};

export const findBestSlot = (templeId, dateStr, existingPredictions = null) => {
    return engineFindBestSlot(templeId, dateStr, existingPredictions);
};

export default {
    TEMPLE_CAPACITY,
    MONTHLY_MULTIPLIERS,
    DAY_MULTIPLIERS,
    SLOT_POPULARITY,
    FESTIVAL_DATES,
    predictCrowdLevel,
    predictDateCrowdLevel,
    getCrowdStatus,
    getDateColor,
    getFestivalInfo,
    findBestSlot,
    TIME_SLOTS,
    TEMPLES,
    TEMPLE_METRICS,
};
