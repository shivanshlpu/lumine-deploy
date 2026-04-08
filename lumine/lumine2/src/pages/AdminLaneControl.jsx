import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import AdminHeader from '../components/admin/AdminHeader';
import LaneCard from '../components/admin/lane/LaneCard';
import LiveCamModal from '../components/admin/lane/LiveCamModal';
import GuardAssignModal from '../components/admin/lane/GuardAssignModal';
import Toast from '../components/admin/Toast';
import '../styles/admin.css';
import '../styles/admin-lane.css';

const AdminLaneControl = () => {
    const [lanesData, setLanesData] = useState([]);
    const [totalCapacity] = useState(0);
    const [toast, setToast] = useState({ show: false, message: '', isError: false });
    const [activeCamLane, setActiveCamLane] = useState(null);
    const [activeGuardLane, setActiveGuardLane] = useState(null);

    useEffect(() => {
        const fetchLanesData = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/lanes');
                const data = await response.json();

                setLanesData(prevLanes => {
                    // Only show lanes that exist in the backend AND have numeric IDs
                    return data
                        .filter(l => !isNaN(l.laneId))
                        .map((apiLane) => {
                            const laneId = apiLane.laneId;

                            // If we have previous state, preserve it
                            const existingState = prevLanes.find(l => l.laneId == laneId);

                            return {
                                id: laneId,
                                laneId: laneId,
                                name: `Lane ${laneId}`,
                                camId: `CAM-0${laneId}`,
                                location: apiLane.location || { lat: 20.8880, lng: 70.4010 },
                                rawHeadCount: apiLane.crowdCount || 0,
                                capacity: 300,
                                throughput: 0,
                                lastMove: apiLane.lastUpdated || Date.now(),
                                status: apiLane.status === 'RED' ? 'STUCK' : (apiLane.status === 'YELLOW' ? 'BUSY' : 'OPEN'),
                                gateStatus: apiLane.gateStatus || 'OPEN', // Add gateStatus
                                manualOverride: false,
                                temp: apiLane.temperature || '--',
                                humidity: apiLane.humidity || '--',
                                history: existingState?.history || Array(15).fill(0),
                                isJammed: false
                            };
                        });
                });
            } catch (error) {
                console.error('Error fetching lanes data:', error);
            }
        };

        fetchLanesData();

        // Socket Connection
        const socket = io('http://localhost:5000');

        socket.on('connect', () => {
            console.log('✅ Connected to WebSocket in Lane Control');
        });

        socket.on('lane-update', (updatedLane) => {
            console.log('🔥 [LaneControl] DATA RECEIVED:', updatedLane);

            setLanesData(prevLanes => {
                return prevLanes.map(lane => {
                    if (lane.laneId == updatedLane.laneId) {
                        const newStatus = updatedLane.status === 'RED' ? 'STUCK' : (updatedLane.status === 'YELLOW' ? 'BUSY' : 'OPEN');
                        return {
                            ...lane,
                            rawHeadCount: updatedLane.crowdCount !== undefined ? updatedLane.crowdCount : lane.rawHeadCount,
                            temp: updatedLane.temperature || lane.temp,
                            humidity: updatedLane.humidity || lane.humidity,
                            status: !lane.manualOverride ? newStatus : lane.status,
                            gateStatus: updatedLane.gateStatus || lane.gateStatus, // Update gateStatus
                            lastMove: new Date()
                        };
                    }
                    return lane;
                });
            });
        });

        // Handle New Lane Auto-Creation
        socket.on('receiver_added', (newReceiver) => {
            console.log('🆕 New Receiver Added:', newReceiver);
            setLanesData(prev => {
                if (prev.find(l => l.laneId == newReceiver.receiver_id)) return prev; // Already exists

                const newLane = {
                    id: newReceiver.receiver_id,
                    laneId: newReceiver.receiver_id,
                    name: newReceiver.label || `Lane ${newReceiver.receiver_id}`,
                    camId: `CAM-0${newReceiver.receiver_id}`,
                    location: { lat: newReceiver.x || 0, lng: newReceiver.y || 0 },
                    rawHeadCount: 0,
                    capacity: 300,
                    throughput: 0,
                    lastMove: Date.now(),
                    status: 'OPEN',
                    manualOverride: false,
                    temp: '--',
                    humidity: '--',
                    history: Array(15).fill(0),
                    isJammed: false,
                    isUnplaced: !newReceiver.x // Flag for UI to show "Unplaced" warning
                };
                showToast(`New Lane Detected: ${newLane.name}`);
                return [...prev, newLane];
            });
        });

        // Handle Card Seen
        socket.on('cardseen', (data) => {
            console.log('👀 Card Seen Event:', data);
            setLanesData(prev => prev.map(lane => {
                if (lane.laneId == data.receiver_id) {
                    return { ...lane, lastCardSeen: { id: data.sender_id, ts: Date.now() } };
                }
                return lane;
            }));
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const showToast = (msg, isError = false) => {
        setToast({ show: true, message: msg, isError });
    };

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = "/";
        }
    };

    const handleStatusChange = (id, newStatus) => {
        setLanesData(prev => prev.map(lane => {
            if (lane.id === id) {
                const updated = { ...lane, status: newStatus, manualOverride: true };
                if (newStatus === 'OPEN') {
                    updated.manualOverride = false;
                    showToast(`${lane.name} is set to AUTO/OPEN`);
                } else {
                    showToast(`${lane.name} marked as ${newStatus}`, newStatus === 'STUCK' || newStatus === 'CLOSED');
                }
                return updated;
            }
            return lane;
        }));
    };

    // New Function to Toggle Gate
    const handleGateToggle = async (laneId, action) => {
        try {
            const response = await fetch(`http://localhost:5000/api/lanes/${laneId}/gate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });

            if (!response.ok) throw new Error('Failed to toggle gate');

            showToast(`Gate ${action} for Lane ${laneId}`);
        } catch (error) {
            console.error('Error toggling gate:', error);
            showToast('Failed to update gate', true);
        }
    };

    const handleGuardAssignConfirm = () => {
        showToast(`Alpha Team dispatched to ${activeGuardLane.name}`);
        setActiveGuardLane(null);
    };

    return (
        <div className="bg-lumine-bg text-gray-800 overflow-hidden h-screen flex flex-col">
            <AdminHeader onLogout={handleLogout} />

            <div className="flex-1 overflow-hidden relative bg-[#F8FAFC] p-6 overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h2 className="text-2xl font-bold brand-font text-gray-800">Lane Status Overview</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Control lane availability and view live occupancy.
                            <span className="inline-block bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-bold ml-2 border border-blue-100">Logic: 5 Heads = 1 Unit</span>
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <div className="text-right bg-white p-2 rounded-lg border border-gray-200 shadow-sm px-4">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Total Effective Capacity</p>
                            <p className="text-xl font-bold text-lumine-orange">{totalCapacity} / {lanesData.length * 300}</p>
                        </div>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                    {lanesData.map(lane => (
                        <LaneCard
                            key={lane.id}
                            lane={lane}
                            onStatusChange={handleStatusChange}
                            onGateToggle={handleGateToggle} // Pass new toggle function
                            onOpenCam={setActiveCamLane}
                            onAssignGuard={setActiveGuardLane}
                        />
                    ))}
                </div>
            </div>

            <LiveCamModal
                lane={activeCamLane}
                onClose={() => setActiveCamLane(null)}
            />

            <GuardAssignModal
                lane={activeGuardLane}
                onClose={() => setActiveGuardLane(null)}
                onConfirm={handleGuardAssignConfirm}
            />

            <Toast
                message={toast.message}
                show={toast.show}
                onClose={() => setToast({ ...toast, show: false })}
            />
        </div>
    );
};

export default AdminLaneControl;
