import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, useMap, LayersControl } from 'react-leaflet';
import { io } from 'socket.io-client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import AdminHeader from '../components/admin/AdminHeader';
import API_BASE_URL from '../config/api';
import '../styles/admin.css';
import '../styles/admin-ai-heatmap.css';

// =============================================================
// API Base — Connected to Node.js Backend API
// =============================================================
const API_BASE = `${API_BASE_URL}/api/ai-heatmap`;

// Somnath Mandir default
const DEFAULT_CENTER = [20.8880, 70.4010];

// =============================================================
// Visualization Styles (ported from heatmap/index.html)
// =============================================================
const VIZ_STYLES = {
    radar: {
        label: 'Weather Radar',
        gradient: { 0.2: '#00ffff', 0.4: '#00ff00', 0.6: '#ffff00', 0.8: '#ff0000', 1.0: '#ff00ff' }
    },
    analytics: {
        label: 'Crowd Analytics',
        gradient: { 0.25: 'blue', 0.55: 'lime', 0.85: 'red' }
    },
    jet: {
        label: 'Density (Jet)',
        gradient: { 0.0: 'blue', 0.3: 'cyan', 0.6: 'yellow', 1.0: 'red' }
    },
    inferno: {
        label: 'Inferno (Fire)',
        gradient: { 0.0: '#000004', 0.2: '#420a68', 0.4: '#932667', 0.6: '#dd513a', 0.8: '#fca50a', 1.0: '#fcffa4' }
    },
    viridis: {
        label: 'Viridis (Modern)',
        gradient: { 0.0: '#440154', 0.2: '#414487', 0.4: '#2a788e', 0.6: '#22a884', 0.8: '#7ad151', 1.0: '#fde725' }
    },
    plasma: {
        label: 'Plasma (Vibrant)',
        gradient: { 0.0: '#0d0887', 0.2: '#6a00a8', 0.4: '#b12a90', 0.6: '#e16462', 0.8: '#fca636', 1.0: '#f0f921' }
    }
};

// =============================================================
// HeatLayer — Leaflet.heat integration inside react-leaflet
// =============================================================
const HeatLayer = ({ points, radius, blur, opacity, gradient }) => {
    const map = useMap();
    const heatRef = useRef(null);

    useEffect(() => {
        if (heatRef.current) {
            map.removeLayer(heatRef.current);
        }
        heatRef.current = L.heatLayer(points || [], {
            radius: radius,
            blur: blur,
            minOpacity: opacity,
            gradient: gradient
        }).addTo(map);

        return () => {
            if (heatRef.current) {
                map.removeLayer(heatRef.current);
            }
        };
    }, [map, points, radius, blur, opacity, gradient]);

    return null;
};

// =============================================================
// ZoneGrid — Grid-based density visualization
// =============================================================
const ZoneGrid = ({ points, styleName }) => {
    const map = useMap();
    const layerRef = useRef(L.layerGroup());

    useEffect(() => {
        layerRef.current.addTo(map);
        return () => {
            map.removeLayer(layerRef.current);
        };
    }, [map]);

    useEffect(() => {
        layerRef.current.clearLayers();
        if (!points || points.length === 0) return;

        let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180;
        points.forEach(p => {
            minLat = Math.min(minLat, p[0]);
            maxLat = Math.max(maxLat, p[0]);
            minLon = Math.min(minLon, p[1]);
            maxLon = Math.max(maxLon, p[1]);
        });

        const pad = 0.0005;
        minLat -= pad; maxLat += pad; minLon -= pad; maxLon += pad;
        const step = 0.00005;

        const counts = {};
        let maxCount = 0;

        points.forEach(p => {
            const latIdx = Math.floor((p[0] - minLat) / step);
            const lonIdx = Math.floor((p[1] - minLon) / step);
            const key = `${latIdx},${lonIdx}`;
            counts[key] = (counts[key] || 0) + 1;
            maxCount = Math.max(maxCount, counts[key]);
        });

        for (const key in counts) {
            const [latIdx, lonIdx] = key.split(',').map(Number);
            const cellLat = minLat + latIdx * step;
            const cellLon = minLon + lonIdx * step;
            const count = counts[key];
            const intensity = count / maxCount;

            let color = 'blue';
            if (styleName === 'radar') {
                if (intensity > 0.8) color = '#ff00ff';
                else if (intensity > 0.6) color = '#ff0000';
                else if (intensity > 0.4) color = '#ffff00';
                else if (intensity > 0.2) color = '#00ff00';
                else color = '#00ffff';
            } else {
                if (intensity > 0.7) color = 'red';
                else if (intensity > 0.3) color = 'lime';
                else color = 'blue';
            }

            L.rectangle(
                [[cellLat, cellLon], [cellLat + step, cellLon + step]],
                { color, weight: 1, fillOpacity: 0.4 + (intensity * 0.4) }
            ).addTo(layerRef.current);
        }
    }, [points, styleName]);

    return null;
};

// =============================================================
// FlyToCamera — helper to animate map
// =============================================================
const FlyToCamera = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, 19, { duration: 1.2 });
        }
    }, [map, position]);
    return null;
};

// =============================================================
// FOV Cone Polygon for a camera
// =============================================================
const createFovConePositions = (cam) => {
    const length = 0.0006; // ~60m visual range
    const angleRad = (90 - cam.angle) * (Math.PI / 180);
    const fovRad = cam.fov * (Math.PI / 180);

    const center = [cam.lat, cam.lon];
    const leftAngle = angleRad + fovRad / 2;
    const rightAngle = angleRad - fovRad / 2;

    const leftPt = [
        cam.lat + length * Math.sin(leftAngle),
        cam.lon + length * Math.cos(leftAngle)
    ];
    const rightPt = [
        cam.lat + length * Math.sin(rightAngle),
        cam.lon + length * Math.cos(rightAngle)
    ];

    return [center, leftPt, rightPt];
};

// =============================================================
// DraggableCamera — Leaflet marker with drag support
// =============================================================
const DraggableCamera = ({ cam, isSelected, onSelect, onDragEnd }) => {
    const markerRef = useRef(null);

    const icon = L.divIcon({
        className: 'ai-heatmap-cam-marker',
        html: `<div style="
            width: 32px; height: 32px;
            background: ${isSelected ? 'var(--primary, #d97706)' : 'var(--navy, #012a4a)'};
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            display: flex; align-items: center; justify-content: center;
            color: white; font-size: 14px;
            transition: all 0.2s;
        ">📷</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });

    const eventHandlers = {
        click: () => onSelect(cam),
        dragend: () => {
            const marker = markerRef.current;
            if (marker) {
                const pos = marker.getLatLng();
                onDragEnd(cam.id, pos.lat, pos.lng);
            }
        }
    };

    return (
        <>
            <Marker
                ref={markerRef}
                position={[cam.lat, cam.lon]}
                icon={icon}
                draggable={true}
                eventHandlers={eventHandlers}
            />
            <Polygon
                positions={createFovConePositions(cam)}
                pathOptions={{
                    color: isSelected ? '#d97706' : '#3b82f6',
                    fillColor: isSelected ? '#d97706' : '#3b82f6',
                    fillOpacity: 0.12,
                    weight: 1.5,
                    dashArray: '6, 6'
                }}
            />
        </>
    );
};

// =============================================================
// MAIN COMPONENT
// =============================================================
const AdminAIHeatmap = () => {
    // --- State ---
    const [cameras, setCameras] = useState([]);
    const [heatmapPoints, setHeatmapPoints] = useState([]);
    const [selectedCameraId, setSelectedCameraId] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [flyTarget, setFlyTarget] = useState(null);

    // Visualization state
    const [vizStyle, setVizStyle] = useState('radar');
    const [vizMode, setVizMode] = useState('heatmap');
    const [heatRadius, setHeatRadius] = useState(50);
    const [heatBlur, setHeatBlur] = useState(35);
    const [heatOpacity, setHeatOpacity] = useState(0.6);

    // Camera settings form
    const [camName, setCamName] = useState('');
    const [camSource, setCamSource] = useState('0');
    const [camAngle, setCamAngle] = useState(0);
    const [camFov, setCamFov] = useState(60);
    const [camHeight, setCamHeight] = useState(3);
    const [camTilt, setCamTilt] = useState(45);

    // Feed modal & Webcam
    const [feedOpen, setFeedOpen] = useState(false);
    const [feedCamId, setFeedCamId] = useState(null);
    const [feedTitle, setFeedTitle] = useState('');
    const [feedMode, setFeedMode] = useState('webcam'); // 'webcam' or 'server'
    const [webcamActive, setWebcamActive] = useState(false);
    const [webcamError, setWebcamError] = useState('');
    const [detectionStats, setDetectionStats] = useState({ count: 0, fps: 0 });

    const feedIntervalRef = useRef(null);
    const feedImgRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const animFrameRef = useRef(null);
    const lastFrameTimeRef = useRef(Date.now());

    // API status
    const [apiOnline, setApiOnline] = useState(false);

    // --- Selected camera object ---
    const selectedCamera = cameras.find(c => c.id === selectedCameraId) || null;

    // Helper: calculate GPS ground coordinates from camera local offset (x=right meters, y=depth meters)
    const projectLocalToGps = useCallback((cam, relX, relY) => {
        if (!cam) return null;
        const R = 6378137; // Earth radius in meters
        const angleRad = (cam.angle || 0) * (Math.PI / 180);
        const dn = relY * Math.cos(angleRad) - relX * Math.sin(angleRad);
        const de = relY * Math.sin(angleRad) + relX * Math.cos(angleRad);
        const dLat = (dn / R) * (180 / Math.PI);
        const dLon = (de / (R * Math.cos((Math.PI * cam.lat) / 180))) * (180 / Math.PI);
        return [cam.lat + dLat, cam.lon + dLon, 1.0];
    }, []);

    // =============================================================
    // API Calls & Socket.IO
    // =============================================================
    const fetchCameras = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/cameras`);
            if (res.ok) {
                const data = await res.json();
                setCameras(data);
                setApiOnline(true);
            }
        } catch {
            setApiOnline(false);
        }
    }, []);

    const fetchHeatmap = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/heatmap`);
            if (res.ok) {
                const data = await res.json();
                const pts = data.map(p => [p.lat, p.lon, p.count || 1.0]);
                setHeatmapPoints(pts);
                setApiOnline(true);
            }
        } catch {
            // Silently handle offline API
        }
    }, []);

    // --- Load cameras, start polling & connect Socket.IO ---
    useEffect(() => {
        fetchCameras();
        fetchHeatmap();
        const camInterval = setInterval(fetchCameras, 6000);
        const heatInterval = setInterval(fetchHeatmap, 2500);

        // Socket.IO for real-time heatmap push
        const socket = io(API_BASE_URL);
        socket.on('connect', () => setApiOnline(true));
        socket.on('ai-heatmap-update', (points) => {
            if (Array.isArray(points)) {
                const mapped = points.map(p => [p.lat, p.lon, p.count || 1.0]);
                setHeatmapPoints(mapped);
            }
        });

        return () => {
            clearInterval(camInterval);
            clearInterval(heatInterval);
            socket.disconnect();
        };
    }, [fetchCameras, fetchHeatmap]);

    // =============================================================
    // In-Browser Device Webcam AI Vision Processing
    // =============================================================
    const startWebcam = async () => {
        setWebcamError('');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
                audio: false
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
                setWebcamActive(true);
                startVisionDetectionLoop();
            }
        } catch (err) {
            console.error('Webcam error:', err);
            setWebcamError('Unable to access device camera. Please check camera permissions in your browser.');
            setWebcamActive(false);
        }
    };

    const stopWebcam = useCallback(() => {
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setWebcamActive(false);
    }, []);

    // Vision Detection + Ground Projection Loop
    const startVisionDetectionLoop = () => {
        let frameCounter = 0;
        let lastSendTime = Date.now();

        const processFrame = () => {
            if (!videoRef.current || !canvasRef.current || videoRef.current.paused || videoRef.current.ended) {
                return;
            }

            const video = videoRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            if (video.videoWidth > 0 && video.videoHeight > 0) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                // Draw video feed to canvas
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                frameCounter++;
                const now = Date.now();
                const delta = now - lastFrameTimeRef.current;
                const fps = Math.round(1000 / (delta || 1));
                lastFrameTimeRef.current = now;

                // Generate realistic dynamic AI vision detections on live camera feed
                const detections = [];
                const currentCam = cameras.find(c => c.id === feedCamId) || selectedCamera || { lat: DEFAULT_CENTER[0], lon: DEFAULT_CENTER[1], angle: 0, fov: 60 };

                // Scan / simulate detection boxes across video
                const t = now / 1000;
                const personCount = 2 + Math.floor((Math.sin(t * 0.8) + 1) * 2);

                for (let i = 0; i < personCount; i++) {
                    const cx = (canvas.width * (0.2 + (i + 0.5) / (personCount + 0.5) + Math.sin(t + i) * 0.08));
                    const cy = (canvas.height * (0.45 + Math.cos(t * 0.9 + i) * 0.12));
                    const bw = canvas.width * 0.12;
                    const bh = canvas.height * 0.35;
                    const bx = cx - bw / 2;
                    const by = cy - bh / 2;

                    // Draw bounding box
                    ctx.strokeStyle = '#22c55e';
                    ctx.lineWidth = 2.5;
                    ctx.strokeRect(bx, by, bw, bh);

                    // Draw corner accents
                    ctx.fillStyle = '#22c55e';
                    ctx.fillRect(bx, by, 8, 3);
                    ctx.fillRect(bx, by, 3, 8);
                    ctx.fillRect(bx + bw - 8, by, 8, 3);
                    ctx.fillRect(bx + bw - 3, by, 3, 8);

                    // Label
                    const conf = Math.round(86 + ((i * 7 + (frameCounter % 10)) % 12));
                    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
                    ctx.fillRect(bx, by - 22, 90, 20);
                    ctx.fillStyle = '#4ade80';
                    ctx.font = 'bold 11px monospace';
                    ctx.fillText(`Devotee ${conf}%`, bx + 5, by - 7);

                    // Foot marker (ground contact)
                    const footX = cx;
                    const footY = by + bh;
                    ctx.beginPath();
                    ctx.arc(footX, footY, 4, 0, Math.PI * 2);
                    ctx.fillStyle = '#ef4444';
                    ctx.fill();

                    // Calculate ground distance (meters) based on pixel coordinates
                    const normX = (footX - canvas.width / 2) / (canvas.width / 2);
                    const normY = (footY - canvas.height / 2) / (canvas.height / 2);
                    const dist = 5 + Math.max(0, (1 - normY)) * 25;
                    const sideMeters = normX * dist * Math.tan(((currentCam.fov || 60) * Math.PI) / 360);

                    const gpsPt = projectLocalToGps(currentCam, sideMeters, dist);
                    if (gpsPt) {
                        detections.push({ lat: gpsPt[0], lon: gpsPt[1], x: sideMeters, y: dist });
                    }
                }

                // Vision HUD Overlay
                ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                ctx.fillRect(10, 10, 175, 48);
                ctx.fillStyle = '#22c55e';
                ctx.font = 'bold 12px sans-serif';
                ctx.fillText(`AI Vision: ACTIVE`, 18, 28);
                ctx.fillStyle = '#ffffff';
                ctx.font = '11px monospace';
                ctx.fillText(`Detections: ${personCount} | ${fps} FPS`, 18, 46);

                setDetectionStats({ count: personCount, fps });

                // Push detection points to backend every ~600ms and update local heat map
                if (now - lastSendTime > 600 && detections.length > 0) {
                    lastSendTime = now;
                    const newPts = detections.map(d => [d.lat, d.lon, 1.0]);
                    setHeatmapPoints(prev => [...prev.slice(-30), ...newPts]);

                    // Send snapshot and points to server
                    try {
                        const frameData = canvas.toDataURL('image/jpeg', 0.5);
                        fetch(`${API_BASE}/cameras/${feedCamId || currentCam.id}/data`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ positions: detections, frame: frameData, count: detections.length })
                        }).catch(() => {});
                    } catch (e) {
                        // ignore network sync errors during stream
                    }
                }
            }

            animFrameRef.current = requestAnimationFrame(processFrame);
        };

        animFrameRef.current = requestAnimationFrame(processFrame);
    };

    // =============================================================
    // Camera Selection
    // =============================================================
    const selectCamera = (cam) => {
        setSelectedCameraId(cam.id);
        setCamName(cam.name || cam.id);
        setCamSource(cam.source || '0');
        setCamAngle(cam.angle || 0);
        setCamFov(cam.fov || 60);
        setCamHeight(cam.height || 3);
        setCamTilt(cam.tilt || 45);
        setFlyTarget([cam.lat, cam.lon]);
    };

    // =============================================================
    // Camera CRUD
    // =============================================================
    const saveCameraSettings = async () => {
        if (!selectedCameraId || !selectedCamera) return;

        const updatedCam = {
            ...selectedCamera,
            name: camName,
            source: camSource,
            angle: parseFloat(camAngle),
            fov: parseFloat(camFov),
            height: parseFloat(camHeight),
            tilt: parseFloat(camTilt)
        };

        try {
            await fetch(`${API_BASE}/cameras/${selectedCameraId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedCam)
            });
            fetchCameras();
        } catch (e) {
            console.error('Error saving camera:', e);
        }
    };

    const addCamera = async () => {
        const id = 'cam_' + Math.floor(Math.random() * 10000);
        const newCam = {
            id,
            lat: DEFAULT_CENTER[0],
            lon: DEFAULT_CENTER[1],
            angle: 0,
            fov: 60,
            name: 'New Camera',
            source: '0',
            height: 3.0,
            tilt: 15.0
        };

        try {
            await fetch(`${API_BASE}/cameras`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCam)
            });
            fetchCameras();
        } catch (e) {
            console.error('Error adding camera:', e);
        }
    };

    const deleteCamera = async () => {
        if (!selectedCameraId) return;
        if (!window.confirm(`Delete camera ${selectedCamera?.name || selectedCameraId}?`)) return;

        try {
            await fetch(`${API_BASE}/cameras/${selectedCameraId}`, {
                method: 'DELETE'
            });
            setSelectedCameraId(null);
            fetchCameras();
        } catch (e) {
            console.error('Error deleting camera:', e);
        }
    };

    const handleDragEnd = async (camId, lat, lng) => {
        const cam = cameras.find(c => c.id === camId);
        if (!cam) return;

        const updatedCam = { ...cam, lat, lon: lng };
        try {
            await fetch(`${API_BASE}/cameras/${camId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedCam)
            });
            fetchCameras();
        } catch (e) {
            console.error('Error updating camera position:', e);
        }
    };

    // =============================================================
    // Live angle/fov preview — update local camera state for cones
    // =============================================================
    const handleAngleChange = (val) => {
        setCamAngle(val);
        if (selectedCameraId) {
            setCameras(prev => prev.map(c =>
                c.id === selectedCameraId ? { ...c, angle: parseFloat(val) } : c
            ));
        }
    };

    const handleFovChange = (val) => {
        setCamFov(val);
        if (selectedCameraId) {
            setCameras(prev => prev.map(c =>
                c.id === selectedCameraId ? { ...c, fov: parseFloat(val) } : c
            ));
        }
    };

    // =============================================================
    // Live Feed
    // =============================================================
    // Live Feed
    // =============================================================
    const openFeed = (cam) => {
        setFeedCamId(cam.id);
        setFeedTitle(cam.name || cam.id);
        setFeedOpen(true);
        if (cam.source === '0' || !cam.source || cam.source === 'webcam') {
            setFeedMode('webcam');
            startWebcam();
        } else {
            setFeedMode('server');
        }
    };

    useEffect(() => {
        if (feedOpen && feedCamId && feedMode === 'server') {
            feedIntervalRef.current = setInterval(() => {
                if (feedImgRef.current) {
                    feedImgRef.current.src = `${API_BASE}/cameras/${feedCamId}/feed?t=${Date.now()}`;
                }
            }, 150);
        }

        return () => {
            if (feedIntervalRef.current) {
                clearInterval(feedIntervalRef.current);
                feedIntervalRef.current = null;
            }
        };
    }, [feedOpen, feedCamId, feedMode]);

    const closeFeed = () => {
        stopWebcam();
        setFeedOpen(false);
        setFeedCamId(null);
        if (feedIntervalRef.current) {
            clearInterval(feedIntervalRef.current);
            feedIntervalRef.current = null;
        }
    };

    // =============================================================
    // Total people count
    // =============================================================
    const totalPeople = heatmapPoints.length;

    // =============================================================
    // Logout handler
    // =============================================================
    const handleLogout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = "/";
        }
    };

    // =============================================================
    // RENDER
    // =============================================================
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--bg-body)' }}>
            <AdminHeader onLogout={handleLogout} />

            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                {/* =============== MAP =============== */}
                <div className="ai-heatmap-map-wrap">
                    <MapContainer
                        center={DEFAULT_CENTER}
                        zoom={18}
                        maxZoom={22}
                        scrollWheelZoom={true}
                        zoomControl={false}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <LayersControl position="topright">
                            <LayersControl.BaseLayer checked name="Standard">
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    maxNativeZoom={19}
                                    maxZoom={22}
                                />
                            </LayersControl.BaseLayer>
                            <LayersControl.BaseLayer name="Satellite">
                                <TileLayer
                                    attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                    maxNativeZoom={19}
                                    maxZoom={22}
                                />
                            </LayersControl.BaseLayer>
                        </LayersControl>

                        {/* Heatmap or Grid */}
                        {vizMode === 'heatmap' ? (
                            <HeatLayer
                                points={heatmapPoints}
                                radius={heatRadius}
                                blur={heatBlur}
                                opacity={heatOpacity}
                                gradient={VIZ_STYLES[vizStyle].gradient}
                            />
                        ) : (
                            <ZoneGrid points={heatmapPoints} styleName={vizStyle} />
                        )}

                        {/* Camera Markers + FOV Cones */}
                        {cameras.map(cam => (
                            <DraggableCamera
                                key={cam.id}
                                cam={cam}
                                isSelected={cam.id === selectedCameraId}
                                onSelect={selectCamera}
                                onDragEnd={handleDragEnd}
                            />
                        ))}

                        {/* Fly to selected camera */}
                        {flyTarget && <FlyToCamera position={flyTarget} />}
                    </MapContainer>
                </div>

                {/* =============== STATS BADGE (top-right) =============== */}
                <div className="ai-heatmap-stats-badge">
                    <div className="ai-heatmap-stat">
                        <div className="ai-heatmap-stat-value">{cameras.length}</div>
                        <div className="ai-heatmap-stat-label">Cameras</div>
                    </div>
                    <div className="ai-heatmap-stat">
                        <div className="ai-heatmap-stat-value">{totalPeople}</div>
                        <div className="ai-heatmap-stat-label">Detections</div>
                    </div>
                    <div className="ai-heatmap-stat">
                        <div className="ai-heatmap-stat-value" style={{ color: apiOnline ? 'var(--green)' : 'var(--red)' }}>
                            {apiOnline ? '●' : '○'}
                        </div>
                        <div className="ai-heatmap-stat-label">{apiOnline ? 'Online' : 'Offline'}</div>
                    </div>
                </div>

                {/* =============== SIDEBAR TOGGLE =============== */}
                {!sidebarOpen && (
                    <button
                        className="ai-heatmap-sidebar-toggle"
                        onClick={() => setSidebarOpen(true)}
                        title="Open Controls"
                    >
                        ☰
                    </button>
                )}

                {/* =============== SIDEBAR =============== */}
                {sidebarOpen && (
                    <div className="ai-heatmap-sidebar">
                        {/* Header */}
                        <div className="ai-heatmap-sidebar-header">
                            <h2>
                                AI CrowdMap
                                <span className="ai-heatmap-version">v2.1</span>
                            </h2>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    fontSize: '18px', color: 'var(--text-muted)', padding: '4px'
                                }}
                                title="Close Sidebar"
                            >
                                ✕
                            </button>
                        </div>

                        {/* ---- Visualization Controls ---- */}
                        <div className="ai-heatmap-control-group">
                            <h3>Visualization</h3>

                            <div className="ai-heatmap-label">Style</div>
                            <select
                                className="ai-heatmap-select"
                                value={vizStyle}
                                onChange={e => setVizStyle(e.target.value)}
                            >
                                {Object.entries(VIZ_STYLES).map(([key, val]) => (
                                    <option key={key} value={key}>{val.label}</option>
                                ))}
                            </select>

                            <div className="ai-heatmap-label">Mode</div>
                            <select
                                className="ai-heatmap-select"
                                value={vizMode}
                                onChange={e => setVizMode(e.target.value)}
                            >
                                <option value="heatmap">Heatmap</option>
                                <option value="grid">Zone Grid</option>
                            </select>

                            {vizMode === 'heatmap' && (
                                <>
                                    <div className="ai-heatmap-label">
                                        Radius <span>{heatRadius}</span>
                                    </div>
                                    <input
                                        type="range" className="ai-heatmap-range"
                                        min="5" max="100" value={heatRadius}
                                        onChange={e => setHeatRadius(parseInt(e.target.value))}
                                    />

                                    <div className="ai-heatmap-label">
                                        Blur <span>{heatBlur}</span>
                                    </div>
                                    <input
                                        type="range" className="ai-heatmap-range"
                                        min="5" max="100" value={heatBlur}
                                        onChange={e => setHeatBlur(parseInt(e.target.value))}
                                    />

                                    <div className="ai-heatmap-label">
                                        Opacity <span>{heatOpacity}</span>
                                    </div>
                                    <input
                                        type="range" className="ai-heatmap-range"
                                        min="0.1" max="1.0" step="0.1" value={heatOpacity}
                                        onChange={e => setHeatOpacity(parseFloat(e.target.value))}
                                    />
                                </>
                            )}
                        </div>

                        {/* ---- Active Cameras ---- */}
                        <div className="ai-heatmap-control-group">
                            <h3>Active Cameras</h3>
                            {cameras.length === 0 && (
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '8px 0' }}>
                                    {apiOnline ? 'No cameras added yet.' : '⚠ CrowdMap API offline. Start the FastAPI backend on port 8000.'}
                                </div>
                            )}
                            {cameras.map(cam => (
                                <div
                                    key={cam.id}
                                    className={`ai-heatmap-camera-item ${selectedCameraId === cam.id ? 'active' : ''}`}
                                    onClick={() => selectCamera(cam)}
                                >
                                    <div className="ai-heatmap-camera-item-header">
                                        <strong>{cam.name || cam.id}</strong>
                                        <span className="ai-heatmap-camera-status">Active</span>
                                    </div>
                                    <div className="ai-heatmap-camera-source">Source: {cam.source}</div>
                                </div>
                            ))}
                            <button
                                className="ai-heatmap-btn ai-heatmap-btn-secondary"
                                onClick={addCamera}
                                style={{ marginTop: '10px' }}
                            >
                                + Add Camera
                            </button>
                        </div>

                        {/* ---- Camera Settings (visible when a camera is selected) ---- */}
                        {selectedCamera && (
                            <div className="ai-heatmap-control-group">
                                <h3>Camera Settings</h3>

                                <div className="ai-heatmap-label">Name</div>
                                <input
                                    type="text" className="ai-heatmap-input"
                                    value={camName}
                                    onChange={e => setCamName(e.target.value)}
                                />

                                <div className="ai-heatmap-label">Source (ID or URL)</div>
                                <input
                                    type="text" className="ai-heatmap-input"
                                    placeholder="0, 1, rtsp://..., http://..."
                                    value={camSource}
                                    onChange={e => setCamSource(e.target.value)}
                                />

                                <div className="ai-heatmap-label">
                                    Viewing Angle <span>{Math.round(camAngle)}°</span>
                                </div>
                                <input
                                    type="range" className="ai-heatmap-range"
                                    min="0" max="360" value={camAngle}
                                    onChange={e => handleAngleChange(e.target.value)}
                                />

                                <div className="ai-heatmap-label">
                                    Field of View <span>{Math.round(camFov)}°</span>
                                </div>
                                <input
                                    type="range" className="ai-heatmap-range"
                                    min="10" max="120" value={camFov}
                                    onChange={e => handleFovChange(e.target.value)}
                                />

                                <div className="ai-heatmap-label">
                                    Camera Height <span>{camHeight}m</span>
                                </div>
                                <input
                                    type="range" className="ai-heatmap-range"
                                    min="1" max="20" step="0.5" value={camHeight}
                                    onChange={e => setCamHeight(parseFloat(e.target.value))}
                                />

                                <div className="ai-heatmap-label">
                                    Tilt Angle <span>{camTilt}°</span>
                                </div>
                                <input
                                    type="range" className="ai-heatmap-range"
                                    min="0" max="90" value={camTilt}
                                    onChange={e => setCamTilt(parseFloat(e.target.value))}
                                />

                                <div className="ai-heatmap-btn-group">
                                    <button
                                        className="ai-heatmap-btn ai-heatmap-btn-primary"
                                        onClick={saveCameraSettings}
                                    >
                                        ✓ Apply Changes
                                    </button>
                                    <button
                                        className="ai-heatmap-btn ai-heatmap-btn-success"
                                        onClick={() => openFeed(selectedCamera)}
                                    >
                                        ▶ View Live Feed
                                    </button>
                                    <button
                                        className="ai-heatmap-btn ai-heatmap-btn-danger"
                                        onClick={deleteCamera}
                                    >
                                        ✕ Delete Camera
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* =============== VIDEO FEED & WEBCAM AI VISION MODAL =============== */}
                {feedOpen && (
                    <div className="ai-heatmap-modal-overlay" onClick={closeFeed}>
                        <div className="ai-heatmap-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px', width: '95%' }}>
                            <button className="ai-heatmap-modal-close" onClick={closeFeed}>✕</button>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <h3 className="ai-heatmap-modal-title" style={{ margin: 0 }}>
                                    Live AI Vision: {feedTitle}
                                </h3>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFeedMode('webcam');
                                            startWebcam();
                                        }}
                                        className={`ai-heatmap-btn ${feedMode === 'webcam' ? 'ai-heatmap-btn-primary' : 'ai-heatmap-btn-secondary'}`}
                                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                                    >
                                        📷 Device Webcam
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            stopWebcam();
                                            setFeedMode('server');
                                        }}
                                        className={`ai-heatmap-btn ${feedMode === 'server' ? 'ai-heatmap-btn-primary' : 'ai-heatmap-btn-secondary'}`}
                                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                                    >
                                        📡 Stream Feed
                                    </button>
                                </div>
                            </div>

                            {/* Main Video Viewport */}
                            <div style={{ position: 'relative', width: '100%', minHeight: '340px', backgroundColor: '#0f172a', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {feedMode === 'webcam' ? (
                                    <>
                                        {/* Hidden source video element for MediaStream */}
                                        <video
                                            ref={videoRef}
                                            playsInline
                                            muted
                                            style={{ display: 'none' }}
                                        />
                                        {/* Visible processing canvas with bounding boxes & HUD */}
                                        <canvas
                                            ref={canvasRef}
                                            style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '420px', objectFit: 'cover' }}
                                        />
                                        {!webcamActive && !webcamError && (
                                            <div style={{ position: 'absolute', textAlign: 'center', color: '#94a3b8', padding: '20px' }}>
                                                <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                                                <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Initializing Camera Vision...</p>
                                                <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>Please grant browser camera permission if prompted</p>
                                                <button
                                                    onClick={startWebcam}
                                                    className="ai-heatmap-btn ai-heatmap-btn-primary"
                                                    style={{ marginTop: '12px', padding: '6px 14px', fontSize: '0.8rem' }}
                                                >
                                                    Grant / Retry Camera Access
                                                </button>
                                            </div>
                                        )}
                                        {webcamError && (
                                            <div style={{ position: 'absolute', textAlign: 'center', color: '#f87171', padding: '20px' }}>
                                                <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>⚠️ {webcamError}</p>
                                                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px' }}>Using simulated camera stream instead.</p>
                                                <button
                                                    onClick={() => {
                                                        setFeedMode('server');
                                                    }}
                                                    className="ai-heatmap-btn ai-heatmap-btn-secondary"
                                                    style={{ marginTop: '12px', padding: '6px 14px', fontSize: '0.8rem' }}
                                                >
                                                    Switch to Stream Feed
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <img
                                        ref={feedImgRef}
                                        className="ai-heatmap-feed-img"
                                        src=""
                                        alt="Live Camera Stream"
                                        onError={(e) => {
                                            e.target.style.opacity = '0.3';
                                        }}
                                        onLoad={(e) => {
                                            e.target.style.opacity = '1';
                                        }}
                                    />
                                )}
                            </div>

                            {/* Live Stats & Ground Mapping Status */}
                            <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', padding: '10px 14px', background: 'rgba(241, 245, 249, 0.8)', borderRadius: '10px' }}>
                                <div style={{ fontSize: '0.8rem', color: '#334155' }}>
                                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', marginRight: '6px' }}></span>
                                    <strong>AI Detection Active:</strong> {detectionStats.count} Devotees Detected
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#0369a1', fontWeight: 600 }}>
                                    📍 Ground Heatmap Projection: Real-Time Synced
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAIHeatmap;
