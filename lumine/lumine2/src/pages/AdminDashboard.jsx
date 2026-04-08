import React, { useState, useRef } from 'react';
import { io } from 'socket.io-client';
import '../styles/admin.css';
import AdminHeader from '../components/admin/AdminHeader';
import StatsBar from '../components/admin/StatsBar';
import HeatmapPanel from '../components/admin/HeatmapPanel';
import AlertsMapPanel from '../components/admin/AlertsMapPanel';
import AlertDetailPanel from '../components/admin/AlertDetailPanel';
import LaneControlPanel from '../components/admin/LaneControlPanel';
import GuardListPanel from '../components/admin/GuardListPanel';
import Toast from '../components/admin/Toast';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import AddTeamModal from '../components/admin/AddTeamModal';


const INITIAL_GUARDS = [
    { id: 'g1', name: 'Team Alpha', status: 'Available', lat: 20.8885, lon: 70.4005, dist: 'Calculating...' },
    { id: 'g2', name: 'Team Beta', status: 'Available', lat: 20.8870, lon: 70.4020, dist: 'Calculating...' },
    { id: 'g3', name: 'Team Gamma', status: 'Available', lat: 20.8890, lon: 70.4015, dist: 'Calculating...' },
    { id: 'g4', name: 'Team Delta', status: 'Available', lat: 20.8895, lon: 70.4025, dist: 'Calculating...' },
];

const INITIAL_ALERTS = [];


const AdminDashboard = () => {
    const [guards, setGuards] = useState(INITIAL_GUARDS);
    const [alerts, setAlerts] = useState(INITIAL_ALERTS);
    const [activeAlert, setActiveAlert] = useState(null);
    const [highlightedGuardId] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '' });
    const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false);
    const mapInstanceRef = useRef(null);

    // Dynamic API URL for cross-device support
    const API_BASE_URL = `http://${window.location.hostname}:5000`;

    // --- Socket & Alert Logic ---
    React.useEffect(() => {
        // Fetch specific Main Gate initial status - no status setting in frontend needed if just logging
        // Defined fetchAlerts inside useEffect or use useCallback to avoid dependency issues if moved out
        const fetchAlerts = () => {
            fetch(`${API_BASE_URL}/api/alerts`)
                .then(res => res.json())
                .then(data => {
                    const mappedAlerts = data.map(a => ({
                        id: a.alertId,
                        type: a.type === 'sos' ? 'Medical Assistance' : 'Crowd Alert',
                        icon: a.type === 'sos' ? '🚑' : '👥',
                        loc: `Lane ${a.receiverId}`,
                        lat: a.location?.lat || 20.8880,
                        lon: a.location?.lng || 70.4010,
                        desc: a.reason || 'Emergency reported',
                        status: a.status
                    }));
                    // Completely replace state to avoid duplicates and ensure sync
                    setAlerts(mappedAlerts);
                })
                .catch(err => console.error('Error fetching alerts:', err));
        };

        // Initial Fetch
        fetchAlerts();

        // Polling Interval (5 seconds)
        const intervalId = setInterval(fetchAlerts, 5000);

        // Fetch specific Main Gate initial status
        fetch(`${API_BASE_URL}/api/lane-status`)
            .then(res => res.json())
            .then(data => {
                const gateData = data.find(l => ['2', '3', '4'].includes(String(l.laneId)));
                if (gateData) {
                    console.log("Main Gate Status Initial:", gateData);
                }
            })
            .catch(err => console.error('Error fetching lane status:', err));

        const socket = io(API_BASE_URL);

        socket.on('lane-update', (updatedLane) => {
            // Check if update is for Main Gate hardware
            if (['2', '3', '4'].includes(String(updatedLane.laneId))) {
                console.log('📡 Main Gate Update:', updatedLane);
            }
        });

        socket.on('alert', (newAlert) => {
            console.log('🚨 New Alert Received:', newAlert);
            const mappedAlert = {
                id: newAlert.alert_id,
                type: newAlert.alert_type === 'sos' ? 'Medical Assistance' : 'Crowd Alert',
                icon: newAlert.alert_type === 'sos' ? '🚑' : '👥',
                loc: `Lane ${newAlert.receiver_id}`,
                lat: newAlert.x || 20.8880,
                lon: newAlert.y || 70.4010,
                desc: newAlert.reason || 'Emergency reported',
                status: 'new'
            };

            setAlerts(prev => [mappedAlert, ...prev]);
            setToast({ show: true, message: `🚨 New Alert: ${mappedAlert.type} at ${mappedAlert.loc}` });

            // Play Sound
            const audio = new Audio('/alert.mp3'); // Ensure this file exists or use a CDN
            audio.play().catch(e => console.log('Audio play failed', e));
        });

        socket.on('alert_status', (update) => {
            setAlerts(prev => prev.map(a => a.id === update.alert_id ? { ...a, status: update.status } : a));
        });

        return () => {
            clearInterval(intervalId);
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

    const handleAlertClick = (alert) => {
        setActiveAlert(alert);
        if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([alert.lat, alert.lon], 18, { // Reduced zoom level from 21 to 18
                animate: true,
                duration: 1.5
            });
        }
    };

    const handleCloseAlert = () => {
        setActiveAlert(null);
    };

    const handleAssignGuard = () => {
        if (!activeAlert) return;

        let nearest = null;
        let minDist = Infinity;

        guards.forEach(g => {
            if (g.status === 'Available') {
                const d = Math.sqrt(Math.pow(g.lat - activeAlert.lat, 2) + Math.pow(g.lon - activeAlert.lon, 2));
                if (d < minDist) {
                    minDist = d;
                    nearest = g;
                }
            }
        });

        if (nearest) {
            const instruction = prompt(`Assigning ${nearest.name} to ${activeAlert.type}. Enter instruction:`, "Proceed to location immediately.");
            if (instruction === null) return; // Cancelled

            if (mapInstanceRef.current) {
                const path = [[nearest.lat, nearest.lon], [activeAlert.lat, activeAlert.lon]];
                L.polyline(path, { color: 'var(--navy)', dashArray: '5, 10', weight: 3 }).addTo(mapInstanceRef.current);
            }

            setToast({ show: true, message: `✅ ${nearest.name} dispatched to ${activeAlert.loc}` });

            setGuards(prev => prev.map(g => g.id === nearest.id ? {
                ...g,
                status: 'Available',
                currentTask: `${activeAlert.type}: ${instruction}`
            } : g));

            // Call Backend to Assign Alert
            fetch(`${API_BASE_URL}/api/alerts/${activeAlert.id}/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    guardId: nearest.id,
                    guardName: nearest.name,
                    instruction: instruction
                })
            })
                .then(res => res.json())
                .then(data => {
                    console.log('Alert assigned:', data);
                    // Update local state to show as assigned
                    setAlerts(prev => prev.map(a => a.id === activeAlert.id ? { ...a, status: 'assigned' } : a));
                    setActiveAlert(null);
                })
                .catch(err => console.error('Error assigning alert:', err));

        } else {
            alert("No available guard teams nearby!");
        }
    };

    const handleAddTeamClick = () => {
        setIsAddTeamModalOpen(true);
    };

    const handleRemoveTeam = (guardId) => {
        if (window.confirm("Are you sure you want to remove this team?")) {
            setGuards(prev => prev.filter(g => g.id !== guardId));
            setToast({ show: true, message: "🗑️ Team removed successfully." });
        }
    };

    const handleConfirmAddTeam = (name, locationString) => {
        const [lat, lon] = locationString.split(',').map(coord => parseFloat(coord.trim()));

        if (isNaN(lat) || isNaN(lon)) {
            alert("Invalid coordinates! Please enter in format: Lat, Lon");
            return;
        }

        const newGuard = {
            id: `g${Date.now()}`,
            name: name,
            status: 'Available',
            lat: lat,
            lon: lon,
            dist: 'Calculating...',
            currentTask: 'Patrolling assigned sector'
        };

        setGuards(prev => [...prev, newGuard]);
        setToast({ show: true, message: `✅ New Team "${name}" added successfully!` });
        setIsAddTeamModalOpen(false);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--bg-body)' }}>
            <AdminHeader onLogout={handleLogout} />



            <StatsBar activeAlertsCount={alerts.filter(a => a.status !== 'resolved').length} />

            <main className="main-layout">
                <HeatmapPanel />

                <div className="center-col">
                    <div style={{ flex: 2, position: 'relative', display: 'flex', flexDirection: 'column' }}>
                        <AlertsMapPanel
                            alerts={alerts}
                            guards={guards}
                            onAlertClick={handleAlertClick}
                            activeAlertId={activeAlert?.id}
                            onMapReady={(map) => mapInstanceRef.current = map}
                        />
                        <AlertDetailPanel
                            activeAlert={activeAlert}
                            onClose={handleCloseAlert}
                            onAssign={handleAssignGuard}
                        />
                    </div>

                    <LaneControlPanel />
                </div>

                <GuardListPanel
                    guards={guards}
                    highlightedGuardId={highlightedGuardId}
                    onAddTeam={handleAddTeamClick}
                    onRemoveTeam={handleRemoveTeam}
                />
            </main>

            <AddTeamModal
                isOpen={isAddTeamModalOpen}
                onClose={() => setIsAddTeamModalOpen(false)}
                onAdd={handleConfirmAddTeam}
            />



            <Toast
                message={toast.message}
                show={toast.show}
                onClose={() => setToast({ ...toast, show: false })}
            />
        </div>
    );
};

export default AdminDashboard;
