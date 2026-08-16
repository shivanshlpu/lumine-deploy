/**
 * Realistic Crowd Prediction Data for Lumine Temples
 * Based on real visitor statistics:
 * - Somnath: ~97 lakh annual visitors, peak Oct–Feb, Mondays, Maha Shivratri
 * - Dwarka: ~85 lakh annual visitors, peak Oct–Mar, Janmashtami
 * - Nageshwar: Moderate traffic, peak Maha Shivratri, Shravan, weekends
 */

// Slot capacity per temple (max devotees per 2-hour slot)
const TEMPLE_CAPACITY = {
    somnath: 800,
    dwarka: 600,
    nageshwar: 400,
};

// Month-level crowd multipliers (1 = baseline, >1 = busier)
const MONTHLY_MULTIPLIERS = {
    somnath: {
        1: 1.4,  // Jan - peak season
        2: 1.5,  // Feb - Maha Shivratri month
        3: 1.1,  // Mar
        4: 0.7,  // Apr - summer starts
        5: 0.5,  // May - hot
        6: 0.4,  // Jun - hot
        7: 1.2,  // Jul - Shravan
        8: 1.3,  // Aug - Shravan
        9: 0.8,  // Sep
        10: 1.3, // Oct - peak season starts
        11: 1.5, // Nov - Kartik Purnima, Diwali
        12: 1.6, // Dec - peak season
    },
    dwarka: {
        1: 1.3, 2: 1.4, 3: 1.2, 4: 0.8, 5: 0.5, 6: 0.4,
        7: 1.1, 8: 1.5, 9: 0.9, 10: 1.2, 11: 1.4, 12: 1.5,
    },
    nageshwar: {
        1: 1.2, 2: 1.4, 3: 1.1, 4: 0.7, 5: 0.5, 6: 0.4,
        7: 1.3, 8: 1.3, 9: 0.7, 10: 1.1, 11: 1.3, 12: 1.4,
    },
};

// Day-of-week multipliers (0=Sun, 1=Mon, ..., 6=Sat)
const DAY_MULTIPLIERS = {
    somnath: { 0: 1.3, 1: 1.6, 2: 0.9, 3: 0.8, 4: 0.9, 5: 1.1, 6: 1.4 },
    dwarka:  { 0: 1.3, 1: 1.2, 2: 0.9, 3: 0.8, 4: 0.9, 5: 1.1, 6: 1.4 },
    nageshwar: { 0: 1.3, 1: 1.5, 2: 0.9, 3: 0.8, 4: 0.9, 5: 1.0, 6: 1.3 },
};

// Time slot popularity (fraction of daily visitors in each slot)
const SLOT_POPULARITY = {
    somnath: {
        "06:00 AM - 08:00 AM": 0.55,  // Morning aarti rush
        "08:00 AM - 10:00 AM": 0.70,
        "10:00 AM - 12:00 PM": 0.80,  // Peak morning
        "12:00 PM - 02:00 PM": 0.45,  // Afternoon lull
        "02:00 PM - 04:00 PM": 0.60,
        "04:00 PM - 06:00 PM": 0.90,  // Evening aarti, peak
    },
    dwarka: {
        "06:00 AM - 08:00 AM": 0.50,
        "08:00 AM - 10:00 AM": 0.65,
        "10:00 AM - 12:00 PM": 0.75,
        "12:00 PM - 02:00 PM": 0.40,
        "02:00 PM - 04:00 PM": 0.55,
        "04:00 PM - 06:00 PM": 0.85,
    },
    nageshwar: {
        "06:00 AM - 08:00 AM": 0.45,
        "08:00 AM - 10:00 AM": 0.60,
        "10:00 AM - 12:00 PM": 0.70,
        "12:00 PM - 02:00 PM": 0.30,  // Temple closed midday
        "02:00 PM - 04:00 PM": 0.50,
        "04:00 PM - 06:00 PM": 0.80,
    },
};

// Festival dates (2026) with extreme crowd multipliers
const FESTIVAL_DATES = {
    // Maha Shivratri 2026 - Feb 15
    "2026-02-15": { name: "Maha Shivratri", multiplier: 3.0, temples: ["somnath", "dwarka", "nageshwar"] },
    // Shravan Mondays 2026 (approximate)
    "2026-07-13": { name: "Shravan Monday", multiplier: 2.2, temples: ["somnath", "nageshwar"] },
    "2026-07-20": { name: "Shravan Monday", multiplier: 2.2, temples: ["somnath", "nageshwar"] },
    "2026-07-27": { name: "Shravan Monday", multiplier: 2.2, temples: ["somnath", "nageshwar"] },
    "2026-08-03": { name: "Shravan Monday", multiplier: 2.2, temples: ["somnath", "nageshwar"] },
    // Janmashtami 2026 - Aug 14
    "2026-08-14": { name: "Janmashtami", multiplier: 2.8, temples: ["dwarka"] },
    "2026-08-15": { name: "Independence Day", multiplier: 1.8, temples: ["somnath", "dwarka", "nageshwar"] },
    // Navratri 2026 (approx Oct 2-11)
    "2026-10-02": { name: "Navratri Begins", multiplier: 2.0, temples: ["somnath", "dwarka", "nageshwar"] },
    "2026-10-03": { name: "Navratri", multiplier: 2.0, temples: ["somnath", "dwarka", "nageshwar"] },
    "2026-10-04": { name: "Navratri", multiplier: 2.0, temples: ["somnath", "dwarka", "nageshwar"] },
    "2026-10-05": { name: "Navratri", multiplier: 2.0, temples: ["somnath", "dwarka", "nageshwar"] },
    "2026-10-06": { name: "Navratri", multiplier: 2.1, temples: ["somnath", "dwarka", "nageshwar"] },
    "2026-10-07": { name: "Navratri", multiplier: 2.1, temples: ["somnath", "dwarka", "nageshwar"] },
    "2026-10-08": { name: "Navratri", multiplier: 2.2, temples: ["somnath", "dwarka", "nageshwar"] },
    "2026-10-09": { name: "Navratri", multiplier: 2.3, temples: ["somnath", "dwarka", "nageshwar"] },
    "2026-10-10": { name: "Navratri", multiplier: 2.5, temples: ["somnath", "dwarka", "nageshwar"] },
    "2026-10-11": { name: "Dussehra", multiplier: 2.5, temples: ["somnath", "dwarka", "nageshwar"] },
    // Diwali 2026 - approx Oct 31
    "2026-10-29": { name: "Dhanteras", multiplier: 1.6, temples: ["somnath", "dwarka", "nageshwar"] },
    "2026-10-31": { name: "Diwali", multiplier: 2.0, temples: ["somnath", "dwarka", "nageshwar"] },
    "2026-11-01": { name: "Govardhan Puja", multiplier: 1.8, temples: ["somnath", "dwarka", "nageshwar"] },
    // Kartik Purnima 2026 - approx Nov 15
    "2026-11-15": { name: "Kartik Purnima", multiplier: 2.0, temples: ["somnath"] },
    // Makar Sankranti/ Uttarayan
    "2026-01-14": { name: "Makar Sankranti", multiplier: 1.8, temples: ["somnath", "dwarka", "nageshwar"] },
    // Republic Day
    "2026-01-26": { name: "Republic Day", multiplier: 1.5, temples: ["somnath", "dwarka", "nageshwar"] },
    // Holi 2026 - approx Mar 3
    "2026-03-03": { name: "Holi", multiplier: 1.6, temples: ["somnath", "dwarka", "nageshwar"] },
    // Ram Navami 2026 - approx Mar 26
    "2026-03-26": { name: "Ram Navami", multiplier: 1.9, temples: ["somnath", "dwarka"] },
    // Hanuman Jayanti - approx Apr 6
    "2026-04-06": { name: "Hanuman Jayanti", multiplier: 1.7, temples: ["somnath", "dwarka", "nageshwar"] },
    // Weekends near current date for demo (April-July 2026)
    "2026-04-19": { name: "Weekend Rush", multiplier: 1.4, temples: ["somnath", "dwarka", "nageshwar"] },
    "2026-04-20": { name: "Weekend Rush", multiplier: 1.5, temples: ["somnath", "dwarka", "nageshwar"] },
    "2026-04-26": { name: "Weekend", multiplier: 1.3, temples: ["somnath", "dwarka", "nageshwar"] },
    "2026-04-27": { name: "Weekend", multiplier: 1.3, temples: ["somnath", "dwarka", "nageshwar"] },
    "2026-05-01": { name: "May Day", multiplier: 1.5, temples: ["somnath", "dwarka", "nageshwar"] },
};

/**
 * Calculate predicted crowd level for a specific temple, date, and time slot
 * Returns a value between 0 and 1 (fraction of capacity)
 */
export const predictCrowdLevel = (templeId, dateStr, timeSlot) => {
    if (!templeId || !dateStr) return 0;

    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const dayOfWeek = date.getDay();

    // Base popularity for this slot
    const slotPop = SLOT_POPULARITY[templeId]?.[timeSlot] || 0.5;

    // Monthly multiplier
    const monthMult = MONTHLY_MULTIPLIERS[templeId]?.[month] || 1.0;

    // Day of week multiplier
    const dayMult = DAY_MULTIPLIERS[templeId]?.[dayOfWeek] || 1.0;

    // Festival multiplier
    const festival = FESTIVAL_DATES[dateStr];
    let festivalMult = 1.0;
    if (festival && festival.temples.includes(templeId)) {
        festivalMult = festival.multiplier;
    }

    // Combined prediction (capped at 1.0)
    const raw = slotPop * monthMult * dayMult * festivalMult;
    // Normalize: the raw can be > 1 in extreme cases, so we use a sigmoid-like cap
    const predicted = Math.min(raw / (raw + 0.3), 1.0);

    return predicted;
};

/**
 * Get the overall crowd level for an entire date (average across all slots)
 */
export const predictDateCrowdLevel = (templeId, dateStr) => {
    if (!templeId || !dateStr) return 0;
    const slots = Object.keys(SLOT_POPULARITY[templeId] || {});
    if (slots.length === 0) return 0;

    const total = slots.reduce((sum, slot) => sum + predictCrowdLevel(templeId, dateStr, slot), 0);
    return total / slots.length;
};

/**
 * Get the status label for a crowd level
 */
export const getCrowdStatus = (level) => {
    if (level >= 0.90) return { label: "Full", color: "red", emoji: "⛔" };
    if (level >= 0.75) return { label: "Crowded", color: "red", emoji: "🔴" };
    if (level >= 0.50) return { label: "Moderate", color: "orange", emoji: "🟠" };
    if (level >= 0.25) return { label: "Low", color: "green", emoji: "🟢" };
    return { label: "Very Low", color: "green", emoji: "🟢" };
};

/**
 * Get the date status color for calendar
 */
export const getDateColor = (level) => {
    if (level >= 0.85) return "red";
    if (level >= 0.50) return "orange";
    return "green";
};

/**
 * Get the festival info for a date if any
 */
export const getFestivalInfo = (dateStr, templeId) => {
    const festival = FESTIVAL_DATES[dateStr];
    if (!festival) return null;
    if (templeId && !festival.temples.includes(templeId)) return null;
    return festival;
};

/**
 * Find the best (least crowded) time slot for a given temple and date
 */
export const findBestSlot = (templeId, dateStr) => {
    const slots = Object.keys(SLOT_POPULARITY[templeId] || {});
    if (slots.length === 0) return null;

    let bestSlot = null;
    let bestLevel = 1.0;

    slots.forEach(slot => {
        const level = predictCrowdLevel(templeId, dateStr, slot);
        if (level < bestLevel) {
            bestLevel = level;
            bestSlot = slot;
        }
    });

    return { slot: bestSlot, level: bestLevel };
};

export const TIME_SLOTS = [
    "06:00 AM - 08:00 AM",
    "08:00 AM - 10:00 AM",
    "10:00 AM - 12:00 PM",
    "12:00 PM - 02:00 PM",
    "02:00 PM - 04:00 PM",
    "04:00 PM - 06:00 PM",
];

export const TEMPLES = [
    { id: "somnath", name: "Somnath Temple" },
    { id: "dwarka", name: "Dwarka Temple" },
    { id: "nageshwar", name: "Nageshwar Temple" },
];

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
};
