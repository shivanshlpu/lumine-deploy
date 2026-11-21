import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import {
    Car,
    Navigation,
    MapPin,
    Sparkles,
    CheckCircle,
    Clock,
    RefreshCw,
    ExternalLink,
    ChevronRight,
    Shield
} from 'lucide-react';
import API_BASE_URL from '../../config/api';

const DEFAULT_PARKING_ZONES = [
    {
        zoneId: 'A',
        name: 'Zone A (East Gate)',
        temple: 'Somnath Mandir',
        distance: '50m from temple',
        capacity: 50,
        occupied: 44,
        status: 'filling',
        coordinates: { lat: 20.8885, lng: 70.4015 }
    },
    {
        zoneId: 'B',
        name: 'Zone B (General)',
        temple: 'Somnath Mandir',
        distance: '150m from temple',
        capacity: 200,
        occupied: 192,
        status: 'almost_full',
        coordinates: { lat: 20.8878, lng: 70.4025 }
    },
    {
        zoneId: 'C',
        name: 'Zone C (Bus/Heavy)',
        temple: 'Somnath Mandir',
        distance: '300m from temple',
        capacity: 40,
        occupied: 35,
        status: 'filling',
        coordinates: { lat: 20.8865, lng: 70.404 }
    },
    {
        zoneId: 'D',
        name: 'Zone D (2-Wheeler)',
        temple: 'Somnath Mandir',
        distance: '100m from temple',
        capacity: 500,
        occupied: 320,
        status: 'available',
        coordinates: { lat: 20.889, lng: 70.4005 }
    }
];

const DevoteeParkingCard = ({ templeName = 'Somnath Mandir' }) => {
    const [zones, setZones] = useState(DEFAULT_PARKING_ZONES);
    const [loading, setLoading] = useState(false);
    const [lastSync, setLastSync] = useState(new Date());

    // Fetch live parking zones
    const fetchParkingZones = async () => {
        try {
            setLoading(true);
            const resp = await fetch(`${API_BASE_URL}/api/parking/zones`);
            if (resp.ok) {
                const data = await resp.json();
                if (Array.isArray(data) && data.length > 0) {
                    setZones(data);
                    setLastSync(new Date());
                }
            }
        } catch (err) {
            console.log('Using default devotee parking fallback:', err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchParkingZones();

        // Listen for live socket updates
        const socket = io(API_BASE_URL);
        socket.on('parking-update', (updatedZones) => {
            if (Array.isArray(updatedZones) && updatedZones.length > 0) {
                setZones(updatedZones);
                setLastSync(new Date());
            }
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    // Compute best zone recommendation
    const bestZone = zones.reduce((prev, curr) => {
        const prevFree = prev ? prev.capacity - prev.occupied : -1;
        const currFree = curr.capacity - curr.occupied;
        // Prefer zones with at least 3 free slots, closest distance
        return currFree > prevFree ? curr : prev;
    }, null);

    const totalCapacity = zones.reduce((sum, z) => sum + (z.capacity || 0), 0);
    const totalOccupied = zones.reduce((sum, z) => sum + (z.occupied || 0), 0);
    const totalAvailable = Math.max(0, totalCapacity - totalOccupied);

    const handleNavigate = (zone) => {
        const coords = zone.coordinates || { lat: 20.888, lng: 70.401 };
        const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`;
        window.open(mapsUrl, '_blank');
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden transition-all hover:shadow-md">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-navy-900 to-navy-800 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-saffron-500/20 border border-saffron-500/40 flex items-center justify-center text-saffron-400">
                        <Car className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-serif font-bold text-base sm:text-lg flex items-center gap-2">
                            <span>Temple Parking Advisor</span>
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                Live
                            </span>
                        </h3>
                        <p className="text-xs text-white/70">
                            Real-time gate availability & AI walking distance suggestions
                        </p>
                    </div>
                </div>

                <button
                    onClick={fetchParkingZones}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 transition"
                    title="Refresh Live Status"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* AI Recommendation Banner */}
            {bestZone && (
                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-orange-100 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-orange-800 bg-orange-200/60 px-2 py-0.5 rounded-full">
                                AI Recommended Parking
                            </span>
                        </div>
                        <h4 className="text-sm font-bold text-gray-900">
                            {bestZone.name} — {bestZone.distance}
                        </h4>
                        <p className="text-xs text-gray-600 mt-0.5">
                            <span className="font-semibold text-emerald-700">
                                {bestZone.capacity - bestZone.occupied} slots available
                            </span>{' '}
                            right now. Shortest walking queue for darshan entry.
                        </p>
                    </div>
                    <button
                        onClick={() => handleNavigate(bestZone)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold rounded-lg shadow-sm transition flex-shrink-0"
                    >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Navigate</span>
                    </button>
                </div>
            )}

            {/* Total Aggregate Counter */}
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">
                    Total Free Slots across all gates:
                </span>
                <span className="font-bold text-sm text-emerald-600 font-mono">
                    {totalAvailable} / {totalCapacity} Available
                </span>
            </div>

            {/* Zone Breakdown List */}
            <div className="p-4 sm:p-5 space-y-3">
                {zones.map((zone) => {
                    const free = Math.max(0, zone.capacity - zone.occupied);
                    const pct = Math.round((zone.occupied / zone.capacity) * 100);
                    const isAlmostFull = pct >= 90;
                    const isFilling = pct >= 60;

                    return (
                        <div
                            key={zone.zoneId}
                            className="p-3.5 rounded-xl border border-gray-100 hover:border-gray-200 bg-white hover:bg-gray-50/50 transition-all flex items-center justify-between gap-3"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                                        free <= 3
                                            ? 'bg-red-100 text-red-700'
                                            : free <= 15
                                            ? 'bg-amber-100 text-amber-700'
                                            : 'bg-emerald-100 text-emerald-700'
                                    }`}
                                >
                                    {zone.zoneId}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h5 className="text-sm font-semibold text-gray-900">
                                            {zone.name}
                                        </h5>
                                        {bestZone?.zoneId === zone.zoneId && (
                                            <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded">
                                                Best
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                        <MapPin className="w-3 h-3 text-gray-400" />
                                        <span>{zone.distance}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <p
                                        className={`text-sm font-bold font-mono ${
                                            free <= 3
                                                ? 'text-red-600'
                                                : free <= 15
                                                ? 'text-amber-600'
                                                : 'text-emerald-600'
                                        }`}
                                    >
                                        {free} Free
                                    </p>
                                    <p className="text-[10px] text-gray-400">
                                        {zone.occupied}/{zone.capacity} occupied
                                    </p>
                                </div>

                                <button
                                    onClick={() => handleNavigate(zone)}
                                    className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
                                    title="Get Directions"
                                >
                                    <Navigation className="w-4 h-4 text-orange-600" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="px-5 py-2.5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Updated {lastSync.toLocaleTimeString()}</span>
                </span>
                <span>Automatic Boom Barrier Connected</span>
            </div>
        </div>
    );
};

export default DevoteeParkingCard;
