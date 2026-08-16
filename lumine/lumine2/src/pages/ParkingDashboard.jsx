import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
    LayoutGrid,
    LogOut,
    Car,
    MapPin,
    Navigation,
    CircleAlert,
    RefreshCw,
    CheckCircle,
    X,
    List,
    Bell,
    Send,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    Zap,
    Eye,
    Megaphone,
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

const API_BASE = `http://${window.location.hostname}:5000`;

const ParkingDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // --- State ---
    const [parkingData, setParkingData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [isLive, setIsLive] = useState(false);

    // Modal
    const [selectedZone, setSelectedZone] = useState(null);
    const [zoneLogs, setZoneLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    // Tabs
    const [activeTab, setActiveTab] = useState('overview');

    // Vehicle log (all zones)
    const [allEvents, setAllEvents] = useState([]);
    const eventLogRef = useRef(null);

    // Notice publishing
    const [noticeTitle, setNoticeTitle] = useState('');
    const [noticeMessage, setNoticeMessage] = useState('');
    const [noticePublishing, setNoticePublishing] = useState(false);
    const [noticeSuccess, setNoticeSuccess] = useState(false);

    // Socket ref
    const socketRef = useRef(null);

    const logout = () => {
        sessionStorage.clear();
        localStorage.clear();
        navigate('/');
    };

    // --- Initial Fetch ---
    useEffect(() => {
        const fetchZones = async () => {
            try {
                const resp = await fetch(`${API_BASE}/api/parking/zones`);
                const data = await resp.json();
                if (Array.isArray(data) && data.length > 0) {
                    setParkingData(data);
                }
            } catch (err) {
                console.error('Failed to fetch parking zones:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchZones();
    }, []);

    // --- Socket.IO for real-time updates ---
    useEffect(() => {
        const socket = io(API_BASE);
        socketRef.current = socket;

        socket.on('connect', () => {
            setIsLive(true);
        });

        socket.on('disconnect', () => {
            setIsLive(false);
        });

        socket.on('parking-update', (zones) => {
            if (Array.isArray(zones) && zones.length > 0) {
                setParkingData(zones);
                setLastUpdated(new Date());

                // Aggregate recent events from all zones for the vehicle log
                const combined = [];
                zones.forEach(z => {
                    if (z.recentEvents) {
                        z.recentEvents.forEach(e => {
                            combined.push({ ...e, zoneName: z.name, zoneId: z.zoneId });
                        });
                    }
                });
                // Sort by timestamp descending
                combined.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                setAllEvents(combined.slice(0, 100));
            }
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    // Auto-scroll vehicle log
    useEffect(() => {
        if (eventLogRef.current) {
            eventLogRef.current.scrollTop = 0;
        }
    }, [allEvents]);

    // --- Zone click → fetch logs ---
    const handleZoneClick = async (zone) => {
        setSelectedZone(zone);
        setLoadingLogs(true);

        try {
            const resp = await fetch(`${API_BASE}/api/parking/zones/${zone.zoneId}/logs`);
            const data = await resp.json();
            setZoneLogs(Array.isArray(data) ? data : []);
        } catch {
            setZoneLogs([]);
        } finally {
            setLoadingLogs(false);
        }
    };

    const closeModal = () => {
        setSelectedZone(null);
        setZoneLogs([]);
    };

    // --- Publish Notice ---
    const handlePublishNotice = async () => {
        if (!noticeTitle.trim()) return;
        setNoticePublishing(true);
        setNoticeSuccess(false);
        try {
            const resp = await fetch(`${API_BASE}/api/parking/notice`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: noticeTitle, message: noticeMessage })
            });
            const data = await resp.json();
            if (data.success) {
                setNoticeSuccess(true);
                setNoticeTitle('');
                setNoticeMessage('');
                setTimeout(() => setNoticeSuccess(false), 4000);
            }
        } catch (err) {
            console.error('Notice publish error:', err);
        } finally {
            setNoticePublishing(false);
        }
    };

    // --- Computed ---
    const totalCapacity = parkingData.reduce((sum, z) => sum + (z.capacity || 0), 0);
    const totalOccupied = parkingData.reduce((sum, z) => sum + (z.occupied || 0), 0);
    const totalAvailable = totalCapacity - totalOccupied;

    const bestZone = parkingData.reduce((prev, current) => {
        const prevFree = prev ? (prev.capacity - prev.occupied) / prev.capacity : -1;
        const currFree = (current.capacity - current.occupied) / current.capacity;
        return currFree > prevFree ? current : prev;
    }, null);

    const getStatusColor = (capacity, occupied) => {
        const pct = (occupied / capacity) * 100;
        if (pct >= 95) return 'bg-red-500 text-white';
        if (pct >= 75) return 'bg-orange-500 text-white';
        return 'bg-green-500 text-white';
    };

    const getStatusText = (capacity, occupied) => {
        const pct = (occupied / capacity) * 100;
        if (pct >= 100) return 'FULL';
        if (pct >= 90) return 'Almost Full';
        if (pct >= 50) return 'Filling Fast';
        return 'Available';
    };

    const getStatusDot = (status) => {
        switch (status) {
            case 'full': return 'bg-red-500';
            case 'almost_full': return 'bg-orange-500';
            case 'filling': return 'bg-yellow-500';
            default: return 'bg-green-500';
        }
    };

    return (
        <div className="bg-sand text-navy-900 font-sans flex flex-col md:flex-row min-h-screen">

            {/* --- SIDEBAR (Desktop) --- */}
            <aside className="w-64 bg-white border-r border-gray-200 flex-col flex-shrink-0 z-20 h-full fixed md:relative hidden md:flex">
                <div className="p-6">
                    <div className="font-serif font-bold text-navy-900 text-xl">LUMINE</div>
                    <div className="text-[10px] text-orange-700 font-bold tracking-widest uppercase">Smart Parking</div>
                </div>

                <nav className="flex-1 overflow-y-auto px-4 space-y-1 no-scrollbar">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'overview' ? 'bg-navy-900 text-white shadow-lg shadow-navy-900/20' : 'text-gray-500 hover:bg-orange-50 hover:text-orange-700'}`}
                    >
                        <LayoutGrid className="w-5 h-5" />
                        <span>Live Status</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('all-zones')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'all-zones' ? 'bg-navy-900 text-white shadow-lg shadow-navy-900/20' : 'text-gray-500 hover:bg-orange-50 hover:text-orange-700'}`}
                    >
                        <Car className="w-5 h-5" />
                        <span>All Zones</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('vehicle-log')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'vehicle-log' ? 'bg-navy-900 text-white shadow-lg shadow-navy-900/20' : 'text-gray-500 hover:bg-orange-50 hover:text-orange-700'}`}
                    >
                        <List className="w-5 h-5" />
                        <span>Vehicle Log</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('publish-notice')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'publish-notice' ? 'bg-navy-900 text-white shadow-lg shadow-navy-900/20' : 'text-gray-500 hover:bg-orange-50 hover:text-orange-700'}`}
                    >
                        <Megaphone className="w-5 h-5" />
                        <span>Publish Notice</span>
                    </button>

                    <div className="my-4 border-t border-gray-100 mx-2"></div>

                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all group text-left">
                        <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>Logout</span>
                    </button>
                </nav>
            </aside>

            {/* --- MOBILE NAVIGATION STRIP --- */}
            <div className="md:hidden bg-white border-b border-gray-200 p-2 flex items-center justify-around gap-1 sticky top-0 z-30 shadow-xs">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex-1 py-2 px-1 text-[11px] font-bold rounded-lg flex flex-col items-center gap-1 ${activeTab === 'overview' ? 'bg-navy-900 text-white' : 'text-gray-600'}`}
                >
                    <LayoutGrid className="w-4 h-4" />
                    <span>Live</span>
                </button>
                <button
                    onClick={() => setActiveTab('all-zones')}
                    className={`flex-1 py-2 px-1 text-[11px] font-bold rounded-lg flex flex-col items-center gap-1 ${activeTab === 'all-zones' ? 'bg-navy-900 text-white' : 'text-gray-600'}`}
                >
                    <Car className="w-4 h-4" />
                    <span>Zones</span>
                </button>
                <button
                    onClick={() => setActiveTab('vehicle-log')}
                    className={`flex-1 py-2 px-1 text-[11px] font-bold rounded-lg flex flex-col items-center gap-1 ${activeTab === 'vehicle-log' ? 'bg-navy-900 text-white' : 'text-gray-600'}`}
                >
                    <List className="w-4 h-4" />
                    <span>Logs</span>
                </button>
                <button
                    onClick={() => setActiveTab('publish-notice')}
                    className={`flex-1 py-2 px-1 text-[11px] font-bold rounded-lg flex flex-col items-center gap-1 ${activeTab === 'publish-notice' ? 'bg-navy-900 text-white' : 'text-gray-600'}`}
                >
                    <Megaphone className="w-4 h-4" />
                    <span>Notice</span>
                </button>
                <button
                    onClick={logout}
                    className="p-2 text-red-600 rounded-lg"
                    aria-label="Logout"
                >
                    <LogOut className="w-4 h-4" />
                </button>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="flex-1 flex flex-col relative w-full">

                {/* --- HEADER --- */}
                <header className="h-16 sm:h-20 bg-white/90 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 flex-shrink-0 z-10 sticky top-0">
                    <div>
                        <h2 className="font-serif text-2xl font-bold text-navy-800">Parking Overview</h2>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right hidden md:block">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Camera System</p>
                            <p className={`text-sm font-semibold flex items-center gap-1 justify-end ${isLive ? 'text-green-600' : 'text-gray-400'}`}>
                                {isLive ? (
                                    <>
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                        </span>
                                        Live Connected
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="w-3 h-3 animate-spin" /> Connecting...
                                    </>
                                )}
                            </p>
                        </div>
                        <div className="w-px h-8 bg-gray-200 hidden md:block"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm font-bold text-navy-800 leading-none">Parking Admin</p>
                                <p className="text-[10px] text-gray-500">Zone Manager</p>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-navy-900 to-navy-700 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                                P
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-6 md:p-8 overflow-y-auto relative">

                    {/* ============================== */}
                    {/* TAB: LIVE STATUS (Overview)    */}
                    {/* ============================== */}
                    {activeTab === 'overview' && (
                        <>
                            {/* Top Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                            <Car className="w-6 h-6" />
                                        </div>
                                        <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-full uppercase">All Zones</span>
                                    </div>
                                    <h3 className="text-3xl font-bold text-navy-900">{totalCapacity}</h3>
                                    <p className="text-sm text-gray-500 font-medium">Total Parking Capacity</p>
                                </div>

                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
                                            <CheckCircle className="w-6 h-6" />
                                        </div>
                                        <span className="text-xs font-bold bg-green-100 text-green-600 px-2 py-1 rounded-full uppercase">Real-time</span>
                                    </div>
                                    <h3 className="text-3xl font-bold text-gray-800">
                                        {loading ? '...' : totalAvailable}
                                    </h3>
                                    <p className="text-sm text-gray-500 font-medium">Available Slots Across Zones</p>
                                </div>

                                <div className="bg-navy-900 text-white p-6 rounded-3xl shadow-xl shadow-navy-900/20 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-white/10 text-white rounded-2xl">
                                                <Navigation className="w-6 h-6" />
                                            </div>
                                            <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-1 rounded-full uppercase tracking-wider">Recommended</span>
                                        </div>
                                        <h3 className="text-xl font-bold mb-1">
                                            {bestZone ? bestZone.name : 'Analyzing...'}
                                        </h3>
                                        <p className="text-blue-100 text-sm">
                                            {bestZone ? `${bestZone.capacity - bestZone.occupied} slots available • ${bestZone.distance}` : 'Please wait'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-navy-900 font-serif">Live Zone Monitoring <span className="text-sm font-normal text-gray-400">(Click for Details)</span></h3>
                                <div className="text-xs text-gray-400 font-mono flex items-center gap-2">
                                    <Clock className="w-3 h-3" />
                                    Last update: {lastUpdated.toLocaleTimeString()}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                                {parkingData.map((zone) => {
                                    const available = zone.capacity - zone.occupied;
                                    const percentFull = (zone.occupied / zone.capacity) * 100;
                                    const statusColor = getStatusColor(zone.capacity, zone.occupied);

                                    return (
                                        <div
                                            key={zone.zoneId}
                                            onClick={() => handleZoneClick(zone)}
                                            className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:border-orange-200 transition-all group cursor-pointer relative"
                                        >
                                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-[10px] font-bold bg-navy-50 text-navy-900 px-2 py-1 rounded">Click to View Logs</span>
                                            </div>

                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center text-navy-900 group-hover:bg-navy-900 group-hover:text-white transition-colors relative">
                                                        <MapPin className="w-5 h-5" />
                                                        {/* Pulsing status dot */}
                                                        <span className={`absolute -top-1 -right-1 h-3 w-3 rounded-full ${getStatusDot(zone.status)} ring-2 ring-white`}></span>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-bold text-navy-900 leading-tight">{zone.name}</h4>
                                                        <p className="text-xs text-gray-500 font-medium">{zone.temple} • {zone.distance}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
                                                    {getStatusText(zone.capacity, zone.occupied)}
                                                </span>
                                            </div>

                                            <div className="bg-gray-50 rounded-2xl p-4 mb-4 text-center border border-gray-100 group-hover:bg-orange-50/50 transition-colors">
                                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Available Parking</p>
                                                <h2 className={`text-4xl font-black ${available < 20 ? 'text-red-500' : 'text-green-600'}`}>
                                                    {available}
                                                </h2>
                                                <p className="text-xs text-gray-400 mt-1">Slots Left</p>
                                            </div>

                                            {/* In/Out mini counters */}
                                            <div className="flex gap-4 mb-3">
                                                <div className="flex-1 bg-green-50 rounded-xl p-2 text-center">
                                                    <div className="flex items-center justify-center gap-1 text-green-700">
                                                        <ArrowDownRight className="w-3 h-3" />
                                                        <span className="text-xs font-bold">IN</span>
                                                    </div>
                                                    <p className="text-lg font-black text-green-700">{zone.carsIn || 0}</p>
                                                </div>
                                                <div className="flex-1 bg-orange-50 rounded-xl p-2 text-center">
                                                    <div className="flex items-center justify-center gap-1 text-orange-700">
                                                        <ArrowUpRight className="w-3 h-3" />
                                                        <span className="text-xs font-bold">OUT</span>
                                                    </div>
                                                    <p className="text-lg font-black text-orange-700">{zone.carsOut || 0}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-medium text-gray-500">
                                                    <span>Occupied: <strong className="text-navy-900">{zone.occupied}</strong></span>
                                                    <span>Capacity: <strong>{zone.capacity}</strong></span>
                                                </div>
                                                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all duration-1000 ease-out ${available < 50 ? 'bg-red-500' : 'bg-green-500'}`}
                                                        style={{ width: `${Math.min(percentFull, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* ============================== */}
                    {/* TAB: ALL ZONES TABLE           */}
                    {/* ============================== */}
                    {activeTab === 'all-zones' && (
                        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm animate-fade-in">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold text-navy-900">All Zones Status</h3>
                                    <p className="text-sm text-gray-500">Real-time occupancy and traffic flow</p>
                                </div>
                                <div className="text-xs font-mono text-gray-400">
                                    Last: {lastUpdated.toLocaleTimeString()}
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 font-bold text-navy-900 text-xs uppercase tracking-wider">Zone Name</th>
                                            <th className="px-6 py-4 font-bold text-navy-900 text-xs uppercase tracking-wider text-center">Capacity</th>
                                            <th className="px-6 py-4 font-bold text-navy-900 text-xs uppercase tracking-wider text-center">Occupied</th>
                                            <th className="px-6 py-4 font-bold text-navy-900 text-xs uppercase tracking-wider text-center">Vacant</th>
                                            <th className="px-6 py-4 font-bold text-green-700 text-xs uppercase tracking-wider text-center">Cars In</th>
                                            <th className="px-6 py-4 font-bold text-orange-700 text-xs uppercase tracking-wider text-center">Cars Out</th>
                                            <th className="px-6 py-4 font-bold text-navy-900 text-xs uppercase tracking-wider text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {parkingData.map(zone => (
                                            <tr key={zone.zoneId} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-navy-900">
                                                    {zone.name}
                                                    <div className="text-[10px] text-gray-500 font-normal">{zone.temple} • {zone.distance}</div>
                                                </td>
                                                <td className="px-6 py-4 text-center font-mono text-gray-600">{zone.capacity}</td>
                                                <td className="px-6 py-4 text-center font-mono font-bold text-navy-900">{zone.occupied}</td>
                                                <td className="px-6 py-4 text-center font-mono font-bold text-green-600">{zone.capacity - zone.occupied}</td>
                                                <td className="px-6 py-4 text-center font-mono text-green-700 bg-green-50/50">+{zone.carsIn || 0}</td>
                                                <td className="px-6 py-4 text-center font-mono text-orange-700 bg-orange-50/50">-{zone.carsOut || 0}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(zone.capacity, zone.occupied)}`}>
                                                        {getStatusText(zone.capacity, zone.occupied)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ============================== */}
                    {/* TAB: VEHICLE LOG               */}
                    {/* ============================== */}
                    {activeTab === 'vehicle-log' && (
                        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm animate-fade-in">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold text-navy-900 flex items-center gap-2">
                                        <Eye className="w-5 h-5 text-orange-600" />
                                        Real-Time Vehicle Log
                                    </h3>
                                    <p className="text-sm text-gray-500">All entry/exit events from camera system</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    <span className="text-xs text-gray-400 font-mono">{allEvents.length} events</span>
                                </div>
                            </div>

                            <div className="overflow-x-auto max-h-[60vh] overflow-y-auto" ref={eventLogRef}>
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Time</th>
                                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Zone</th>
                                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Gate</th>
                                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Plate No.</th>
                                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Event</th>
                                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Color</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {allEvents.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="text-center py-16 text-gray-400">
                                                    <Zap className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                                                    <p className="font-medium">No vehicle events yet</p>
                                                    <p className="text-xs mt-1">Events will appear here in real-time when the camera system detects vehicles</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            allEvents.map((evt, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-3 text-sm text-gray-600 font-mono">
                                                        {new Date(evt.timestamp).toLocaleTimeString()}
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <span className="text-xs font-bold bg-navy-900/10 text-navy-900 px-2 py-1 rounded">{evt.zoneName || `Zone ${evt.zoneId}`}</span>
                                                    </td>
                                                    <td className="px-6 py-3 text-sm text-gray-500">{evt.gateId}</td>
                                                    <td className="px-6 py-3 text-sm font-bold text-navy-900 font-mono">
                                                        {evt.plateNumber || '—'}
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${evt.eventType === 'entering' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {evt.eventType === 'entering' ? 'ENTRY' : 'EXIT'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-3 text-sm text-gray-500 capitalize">{evt.carType || '—'}</td>
                                                    <td className="px-6 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className="w-3 h-3 rounded-full border border-gray-200"
                                                                style={{
                                                                    backgroundColor: ['black', 'white', 'silver', 'red', 'blue', 'green', 'yellow'].includes(evt.carColor) ? evt.carColor : '#ccc'
                                                                }}
                                                            ></span>
                                                            <span className="text-sm text-gray-500 capitalize">{evt.carColor || '—'}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 bg-gray-50 border-t border-gray-100 text-center text-xs text-gray-400">
                                Data sourced from ALPR Camera System • Auto-updates in real-time
                            </div>
                        </div>
                    )}

                    {/* ============================== */}
                    {/* TAB: PUBLISH NOTICE            */}
                    {/* ============================== */}
                    {activeTab === 'publish-notice' && (
                        <div className="max-w-3xl mx-auto animate-fade-in">
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-gray-100">
                                    <h3 className="text-xl font-bold text-navy-900 flex items-center gap-2">
                                        <Megaphone className="w-5 h-5 text-orange-600" />
                                        Publish Parking Notice to Devotees
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Publish current parking availability for devotees to see on the Admin Notices page. The notice will include a live snapshot of all zone availability.
                                    </p>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Current Snapshot Preview */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Current Parking Snapshot (will be included)</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {parkingData.map(zone => {
                                                const avail = zone.capacity - zone.occupied;
                                                return (
                                                    <div key={zone.zoneId} className={`rounded-xl p-4 border ${avail < 10 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="font-bold text-sm text-navy-900">{zone.name}</span>
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${avail < 10 ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
                                                                {avail} slots
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500">{zone.distance}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Notice Title *</label>
                                        <input
                                            type="text"
                                            value={noticeTitle}
                                            onChange={e => setNoticeTitle(e.target.value)}
                                            placeholder="e.g., Evening Parking Update — Zone A now available"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all outline-none text-sm"
                                        />
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Additional Message (Optional)</label>
                                        <textarea
                                            value={noticeMessage}
                                            onChange={e => setNoticeMessage(e.target.value)}
                                            rows={3}
                                            placeholder="e.g., Devotees coming from the east side are advised to use Zone A parking. Zone B is currently filling up."
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all outline-none text-sm resize-none"
                                        />
                                    </div>

                                    {/* Publish Button */}
                                    <button
                                        onClick={handlePublishNotice}
                                        disabled={!noticeTitle.trim() || noticePublishing}
                                        className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-white transition-all ${noticeTitle.trim() && !noticePublishing ? 'bg-navy-900 hover:bg-navy-800 shadow-lg shadow-navy-900/20' : 'bg-gray-300 cursor-not-allowed'}`}
                                    >
                                        {noticePublishing ? (
                                            <><RefreshCw className="w-4 h-4 animate-spin" /> Publishing...</>
                                        ) : (
                                            <><Send className="w-4 h-4" /> Publish to Devotees</>
                                        )}
                                    </button>

                                    {/* Success Message */}
                                    {noticeSuccess && (
                                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
                                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-bold text-green-800">Notice Published Successfully!</p>
                                                <p className="text-xs text-green-600">Devotees will see this on the Admin Notices page with current parking availability.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}


                    {/* ============================== */}
                    {/* DETAILS MODAL                  */}
                    {/* ============================== */}
                    {selectedZone && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl flex flex-col animate-scale-in">
                                {/* Modal Header */}
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                    <div>
                                        <h3 className="text-xl font-bold text-navy-900 flex items-center gap-2">
                                            <MapPin className="w-5 h-5 text-orange-600" />
                                            {selectedZone.name}
                                        </h3>
                                        <p className="text-sm text-gray-500">Real-time Entry/Exit Log • {selectedZone.distance}</p>
                                    </div>
                                    <button onClick={closeModal} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                        <X className="w-6 h-6 text-gray-500" />
                                    </button>
                                </div>

                                {/* Quick Stats */}
                                <div className="grid grid-cols-4 gap-0 border-b border-gray-100">
                                    <div className="p-4 text-center border-r border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Capacity</p>
                                        <p className="text-xl font-black text-navy-900">{selectedZone.capacity}</p>
                                    </div>
                                    <div className="p-4 text-center border-r border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Occupied</p>
                                        <p className="text-xl font-black text-navy-900">{selectedZone.occupied}</p>
                                    </div>
                                    <div className="p-4 text-center border-r border-gray-100 bg-green-50/50">
                                        <p className="text-[10px] font-bold text-green-600 uppercase">Cars In</p>
                                        <p className="text-xl font-black text-green-700">+{selectedZone.carsIn || 0}</p>
                                    </div>
                                    <div className="p-4 text-center bg-orange-50/50">
                                        <p className="text-[10px] font-bold text-orange-600 uppercase">Cars Out</p>
                                        <p className="text-xl font-black text-orange-700">-{selectedZone.carsOut || 0}</p>
                                    </div>
                                </div>

                                {/* Modal Body (Table) */}
                                <div className="flex-1 overflow-y-auto p-0">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                                            <tr>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Time</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Vehicle No.</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Event</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Gate</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {loadingLogs ? (
                                                <tr>
                                                    <td colSpan="4" className="text-center py-8 text-gray-400">Loading logs...</td>
                                                </tr>
                                            ) : zoneLogs.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" className="text-center py-8 text-gray-400">No recent activity.</td>
                                                </tr>
                                            ) : (
                                                zoneLogs.map((log, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-3 text-sm text-gray-600 font-mono">
                                                            {new Date(log.timestamp).toLocaleTimeString()}
                                                        </td>
                                                        <td className="px-6 py-3 text-sm font-bold text-navy-900 font-mono">
                                                            {log.plateNumber || '—'}
                                                        </td>
                                                        <td className="px-6 py-3">
                                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${log.eventType === 'entering' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                {log.eventType === 'entering' ? 'ENTRY' : 'EXIT'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-3 text-sm text-gray-500">
                                                            {log.gateId}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="p-4 bg-gray-50 border-t border-gray-100 text-center text-xs text-gray-400">
                                    Showing last 50 records • Auto-updates with camera data
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ParkingDashboard;
