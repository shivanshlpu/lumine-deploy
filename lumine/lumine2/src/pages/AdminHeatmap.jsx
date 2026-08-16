import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import AdminHeader from '../components/admin/AdminHeader';
import MapDashboard from '../components/MapDashboard';
import ViewControls from '../components/admin/heatmap/ViewControls';
import DetailsPanel from '../components/admin/heatmap/DetailsPanel';
import ToastNotification from '../components/admin/heatmap/ToastNotification';
import '../styles/admin-heatmap.css';
import '../styles/admin.css';

const AdminHeatmap = () => {
    const [lanesData, setLanesData] = useState([]);
    const [showHeatmap, setShowHeatmap] = useState(true);
    const [showCameras, setShowCameras] = useState(true);
    const [selectedLane, setSelectedLane] = useState(null);
    const [showToast, setShowToast] = useState(false);

    const API_BASE = `http://${window.location.hostname}:5000`;

    useEffect(() => {
        // 1. Initial Fetch
        const fetchLanes = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/lanes`);
                const data = await response.json();
                setLanesData(data);
            } catch (error) {
                console.error("Failed to fetch lanes:", error);
            }
        };

        fetchLanes();

        // 2. Socket Connection
        const socket = io(API_BASE);

        socket.on('connect', () => {
            console.log('✅ Connected to WebSocket');
        });

        socket.on('lane-update', (updatedLane) => {
            console.log('🔥 [HeatmapPage] DATA RECEIVED:', updatedLane);
            setLanesData(prevLanes => {
                return prevLanes.map(lane => {
                    if (lane.laneId == updatedLane.laneId) {
                        return { ...lane, ...updatedLane };
                    }
                    return lane;
                });
            });
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = "/";
        }
    };

    return (
        <div className="bg-sand text-navy-900 min-h-screen flex flex-col relative overflow-x-hidden">
            <AdminHeader onLogout={handleLogout} />

            <div className="relative w-full flex-1 flex flex-col">
                <ViewControls
                    showHeatmap={showHeatmap}
                    setShowHeatmap={setShowHeatmap}
                    showCameras={showCameras}
                    setShowCameras={setShowCameras}
                />

                <div className="flex-1 bg-gray-100 relative z-0 min-h-[400px]">
                    <MapDashboard
                        lanes={lanesData}
                        showHeatmap={showHeatmap}
                        className="h-[400px] sm:h-[550px] lg:h-full w-full"
                    />
                </div>

                <DetailsPanel
                    selectedLane={selectedLane}
                    onClose={() => setSelectedLane(null)}
                    onDeploy={() => setShowToast(true)}
                />

                <ToastNotification
                    show={showToast}
                    laneName={selectedLane ? selectedLane.name : 'Lane 1'}
                    onClose={() => setShowToast(false)}
                />
            </div>
        </div>
    );
};

export default AdminHeatmap;
