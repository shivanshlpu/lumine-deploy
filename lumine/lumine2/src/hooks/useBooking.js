import { useState, useEffect } from 'react';

const useBooking = () => {
    const [bookingData, setBookingData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadBookingData = () => {
            try {
                const savedDataString = localStorage.getItem('lumine_active_booking');
                if (savedDataString) {
                    const data = JSON.parse(savedDataString);
                    setBookingData(data);
                } else {
                    setBookingData(null);
                }
            } catch (error) {
                console.error('Failed to load booking data', error);
                setBookingData(null);
            } finally {
                setLoading(false);
            }
        };

        loadBookingData();
    }, []);

    const downloadTicket = () => {
        window.print();
    };

    const cancelBooking = () => {
        if (window.confirm('Are you sure you want to cancel this booking?')) {
            localStorage.removeItem('lumine_active_booking');
            window.location.reload();
        }
    };

    return {
        bookingData,
        loading,
        downloadTicket,
        cancelBooking,
    };
};

export default useBooking;
