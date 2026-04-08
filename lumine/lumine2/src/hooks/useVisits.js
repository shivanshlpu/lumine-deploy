import { useState, useEffect } from 'react';

const SAMPLE_VISITS = {
    upcoming: [
        {
            booking_id: "BK-301907",
            date: "2025-11-26",
            day: "Wed",
            dayNumber: "26",
            monthShort: "Nov",
            time_slot: "09:00 AM - 12:00 PM",
            members_count: 1,
            status: "confirmed"
        }
    ],
    completed: [
        {
            booking_id: "BK-102938",
            date: "2025-10-15",
            dayNumber: "15",
            monthShort: "Oct",
            status: "verified"
        },
        {
            booking_id: "BK-992100",
            date: "2025-08-01",
            dayNumber: "01",
            monthShort: "Aug",
            status: "verified"
        }
    ]
};

const useVisits = () => {
    const [activeTab, setActiveTab] = useState('upcoming');
    const [upcomingVisits, setUpcomingVisits] = useState([]);
    const [completedVisits, setCompletedVisits] = useState([]);
    const [printingVisit, setPrintingVisit] = useState(null);

    useEffect(() => {
        const activeBooking = localStorage.getItem('lumine_active_booking');
        let activeVisits = [];

        if (activeBooking) {
            try {
                const parsedBooking = JSON.parse(activeBooking);
                const dateObj = new Date(parsedBooking.date);
                const monthShort = dateObj.toLocaleString('default', { month: 'short' });
                const dayNumber = dateObj.getDate().toString().padStart(2, '0');
                const day = dateObj.toLocaleString('default', { weekday: 'short' });

                activeVisits.push({
                    booking_id: parsedBooking.booking_id,
                    temple: parsedBooking.temple || 'Somnath Temple',
                    date: parsedBooking.date,
                    day: day,
                    dayNumber: dayNumber,
                    monthShort: monthShort,
                    time_slot: parsedBooking.time_slot,
                    members_count: parsedBooking.members ? parsedBooking.members.length : 1,
                    members: parsedBooking.members,
                    status: "confirmed"
                });
            } catch (e) {
                console.error("Error parsing lumine_active_booking", e);
            }
        }

        const storedVisits = localStorage.getItem('lumine_visits');
        let storedUpcoming = [];
        let storedCompleted = [];

        if (storedVisits) {
            const parsed = JSON.parse(storedVisits);
            storedUpcoming = parsed.upcoming || [];
            storedCompleted = parsed.completed || [];
        } else {
            storedUpcoming = SAMPLE_VISITS.upcoming;
            storedCompleted = SAMPLE_VISITS.completed;
        }

        const allUpcoming = [...activeVisits];
        storedUpcoming.forEach(v => {
            if (!allUpcoming.find(existing => existing.booking_id === v.booking_id)) {
                allUpcoming.push(v);
            }
        });

        setTimeout(() => {
            setUpcomingVisits(allUpcoming);
            setCompletedVisits(storedCompleted);
        }, 0);

    }, []);

    const switchTab = (tab) => {
        setActiveTab(tab);
    };

    const cancelVisit = (bookingId) => {
        if (window.confirm("Are you sure you want to cancel this visit?")) {
            const updatedUpcoming = upcomingVisits.filter(v => v.booking_id !== bookingId);
            setUpcomingVisits(updatedUpcoming);

            const activeBooking = localStorage.getItem('lumine_active_booking');
            if (activeBooking) {
                const parsed = JSON.parse(activeBooking);
                if (parsed.booking_id === bookingId) {
                    localStorage.removeItem('lumine_active_booking');
                }
            }
        }
    };

    const downloadEpass = (bookingId) => {
        const visit = upcomingVisits.find(v => v.booking_id === bookingId) || completedVisits.find(v => v.booking_id === bookingId);

        if (visit) {
            setPrintingVisit(visit);
            alert(`Preparing E-Pass for Booking ID: ${bookingId}. Please save as PDF or print from the dialog.`);
            setTimeout(() => {
                window.print();
            }, 100);
        } else {
            alert("Error: Visit details not found.");
        }
    };

    return {
        activeTab,
        upcomingVisits,
        completedVisits,
        printingVisit,
        switchTab,
        cancelVisit,
        downloadEpass
    };
};

export default useVisits;
