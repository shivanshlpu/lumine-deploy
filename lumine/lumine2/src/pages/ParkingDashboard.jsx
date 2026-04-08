import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';


const INITIAL_ZONES = [
    {
        id: 'A',
        name: 'Zone A (east zone)',
        city: 'Somnath Mandir',
        distance: '50m',
        capacity: 50,
        occupied: 12,
        carsIn: 45,
        carsOut: 33,
        coordinates: { lat: 20.8885, lng: 70.4005 }
    },
    {
        id: 'B',
        name: 'Zone B (General)',
        city: 'Somnath Mandir',
        distance: '150m',
        capacity: 200,
        occupied: 145,
        carsIn: 320,
        carsOut: 175,
        coordinates: { lat: 20.8870, lng: 70.4020 }
    },
    {
        id: 'C',
        name: 'Zone C (Bus/Heavy)',
        city: 'Somnath Mandir',
        distance: '300m',
        capacity: 40,
        occupied: 35,
        carsIn: 50,
        carsOut: 15,
        coordinates: { lat: 20.8890, lng: 70.4015 }
    },
    {
        id: 'D',
        name: 'Zone D (2-Wheeler)',
        city: 'Somnath Mandir',
        distance: '100m',
        capacity: 500,
        occupied: 310,
        carsIn: 890,
        carsOut: 580,
        coordinates: { lat: 20.8880, lng: 70.4010 }
    },
];

const ParkingDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [parkingData, setParkingData] = useState(INITIAL_ZONES);
    const [loading, setLoading] = useState(false); // No loading needed for mock data
    const [lastUpdated, setLastUpdated] = useState(new Date());

    // --- Modal Logic ---
    const [selectedZone, setSelectedZone] = useState(null);
    const [zoneLogs, setZoneLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    // --- View Logic ---
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'all-zones' | 'map'

    const logout = () => {
        sessionStorage.clear();
        navigate('/');
    };

    // Simulation Effect
    useEffect(() => {
        const interval = setInterval(() => {
            setParkingData(prevZones => prevZones.map(zone => {
                const change = Math.random() > 0.5 ? 1 : -1;
                // Don't go below 0 or above capacity
                let newOccupied = zone.occupied + change;
                if (newOccupied < 0) newOccupied = 0;
                if (newOccupied > zone.capacity) newOccupied = zone.capacity;

                // Update In/Out counts based on occupancy change logic
                let newIn = zone.carsIn;
                let newOut = zone.carsOut;

                // If occupancy increased, a car came in. If decreased, one left.
                if (change > 0) newIn++;
                else if (change < 0) newOut++;

                return {
                    ...zone,
                    occupied: newOccupied,
                    carsIn: newIn,
                    carsOut: newOut
                };
            }));
            setLastUpdated(new Date());
        }, 3000); // 3 seconds

        return () => clearInterval(interval);
    }, []);


    const handleZoneClick = async (zone) => {
        setSelectedZone(zone);
        setLoadingLogs(true);

        // Simulate Logs
        setTimeout(() => {
            const mockLogs = Array.from({ length: 15 }).map((_, i) => ({
                id: i,
                timestamp: new Date(Date.now() - i * 1000 * 60 * 2).toISOString(), // Every 2 mins
                plate: `GJ-${Math.floor(10 + Math.random() * 20)}-${String.fromCharCode(65 + Math.random() * 26)}${String.fromCharCode(65 + Math.random() * 26)}-${Math.floor(1000 + Math.random() * 9000)}`,
                type: Math.random() > 0.5 ? 'ENTRY' : 'EXIT',
                gate: Math.floor(Math.random() * 3) + 1
            }));
            setZoneLogs(mockLogs);
            setLoadingLogs(false);
        }, 500);
    };

    const closeModal = () => {
        setSelectedZone(null);
        setZoneLogs([]);
    };

    const totalCapacity = parkingData.reduce((sum, zone) => sum + zone.capacity, 0);
    const totalOccupied = parkingData.reduce((sum, zone) => sum + zone.occupied, 0);
    const totalAvailable = totalCapacity - totalOccupied;

    // Smart Suggestion Logic: Find zone with most percentage free
    const bestZone = parkingData.reduce((prev, current) => {
        const prevFree = prev ? (prev.capacity - prev.occupied) / prev.capacity : -1;
        const currFree = (current.capacity - current.occupied) / current.capacity;
        return currFree > prevFree ? current : prev;
    }, null);

    const getStatusColor = (capacity, occupied) => {
        const percentage = (occupied / capacity) * 100;
        if (percentage >= 95) return 'bg-red-500 text-white';
        if (percentage >= 75) return 'bg-orange-500 text-white';
        return 'bg-green-500 text-white';
    };

    const getStatusText = (capacity, occupied) => {
        const percentage = (occupied / capacity) * 100;
        if (percentage >= 100) return 'FULL';
        if (percentage >= 90) return 'Almost Full';
        if (percentage >= 50) return 'Filling Fast';
        return 'Available';
    };

    return (
        <div className="bg-sand text-navy-900 font-sans flex min-h-screen">

            {/* --- SIDEBAR --- */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 z-20 h-full fixed md:relative hidden md:flex">
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



                    <div className="my-4 border-t border-gray-100 mx-2"></div>

                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all group text-left">
                        <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>Logout</span>
                    </button>
                </nav>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <div className="flex-1 flex flex-col relative w-full">

                {/* --- HEADER --- */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0 z-10 sticky top-0">
                    <div>
                        <h2 className="font-serif text-2xl font-bold text-navy-800">Parking Overview</h2>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right hidden md:block">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Simulation Active</p>
                            <p className="text-sm font-semibold text-green-600 flex items-center gap-1 justify-end">
                                <RefreshCw className="w-3 h-3 animate-spin" /> Live Updates
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
                                            {bestZone ? `${bestZone.capacity - bestZone.occupied} slots available • ${bestZone.distance} away` : 'Please wait'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-navy-900 mb-6 font-serif">Live Zone Monitoring (Click for Details)</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                                {parkingData.map((zone) => {
                                    const available = zone.capacity - zone.occupied;
                                    const percentFull = (zone.occupied / zone.capacity) * 100;
                                    const statusColor = getStatusColor(zone.capacity, zone.occupied);

                                    return (
                                        <div
                                            key={zone.id}
                                            onClick={() => handleZoneClick(zone)}
                                            className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:border-orange-200 transition-all group cursor-pointer relative"
                                        >
                                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-[10px] font-bold bg-navy-50 text-navy-900 px-2 py-1 rounded">Click to View Logs</span>
                                            </div>

                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center text-navy-900 group-hover:bg-navy-900 group-hover:text-white transition-colors">
                                                        <MapPin className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-bold text-navy-900 leading-tight">{zone.name}</h4>
                                                        <p className="text-xs text-gray-500 font-medium">{zone.city} • {zone.distance}</p>
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

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-medium text-gray-500">
                                                    <span>Occupied: <strong className="text-navy-900">{zone.occupied}</strong></span>
                                                    <span>Capacity: <strong>{zone.capacity}</strong></span>
                                                </div>
                                                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all duration-1000 ease-out ${available < 50 ? 'bg-red-500' : 'bg-green-500'}`}
                                                        style={{ width: `${percentFull}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {activeTab === 'all-zones' && (
                        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm animate-fade-in">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold text-navy-900">All Zones Status</h3>
                                    <p className="text-sm text-gray-500">Real-time occupancy and traffic flow</p>
                                </div>
                                <div className="text-xs font-mono text-gray-400">
                                    Capacity: Varies
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
                                            <tr key={zone.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-navy-900">
                                                    {zone.name}
                                                    <div className="text-[10px] text-gray-500 font-normal">{zone.city} • {zone.distance}</div>
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



                    {/* --- DETAILS MODAL --- */}
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
                                        <p className="text-sm text-gray-500">Real-time Entry/Exit Log</p>
                                    </div>
                                    <button onClick={closeModal} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                        <X className="w-6 h-6 text-gray-500" />
                                    </button>
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
                                                zoneLogs.map((log) => (
                                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-3 text-sm text-gray-600 font-mono">
                                                            {new Date(log.timestamp).toLocaleTimeString()}
                                                        </td>
                                                        <td className="px-6 py-3 text-sm font-bold text-navy-900 font-mono">
                                                            {log.plate}
                                                        </td>
                                                        <td className="px-6 py-3">
                                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${log.type === 'ENTRY' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                                }`}>
                                                                {log.type}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-3 text-sm text-gray-500">
                                                            Gate {log.gate}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="p-4 bg-gray-50 border-t border-gray-100 text-center text-xs text-gray-400">
                                    Showing last 50 records • Auto-updates every 3s
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
