import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, LayersControl, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

// Somnath Mandir Coordinates
const CENTER_POSITION = [20.8880, 70.4010];

// Lane Paths (Single Device Points)
const LANE_PATHS = {
    1: [20.8882, 70.4012], // Lane 1 (Queue Area)
    2: [20.8880, 70.4010], // Lane 2 (Main Gate - Hardware Linked)
    3: [20.8880, 70.4010], // Lane 3 (Main Gate - Hardware Linked)
    4: [20.8880, 70.4010], // Lane 4 (Main Gate - Hardware Linked)
    5: [20.8880, 70.4015], // Lane 5
    6: [20.8875, 70.4010], // Lane 6
    7: [20.8885, 70.4018], // Lane 7
    8: [20.8890, 70.4012]  // Lane 8
};

// Leaflet resize handler to prevent white map rendering issues
const MapResizeHandler = () => {
    const map = useMap();
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 300);
        return () => clearTimeout(timer);
    }, [map]);
    return null;
};

const HeatmapLayer = ({ points }) => {
    const map = useMap();

    useEffect(() => {
        if (!points || points.length === 0) return;

        const heat = L.heatLayer(points, {
            radius: 25,
            blur: 15,
            maxZoom: 17,
            gradient: { 0.4: 'blue', 0.65: 'lime', 1: 'red' }
        }).addTo(map);

        return () => {
            map.removeLayer(heat);
        };
    }, [map, points]);

    return null;
};

const MapDashboard = ({ lanes, className = "h-[350px] lg:h-[400px] w-full", showHeatmap = false }) => {
    const getLaneColor = (lane) => {
        if (lane.status === 'RED') return '#E53E3E'; // Red
        if (lane.status === 'YELLOW') return '#D69E2E'; // Yellow
        return '#38A169'; // Green
    };

    const createPopIcon = () => L.divIcon({
        className: 'custom-sos-icon',
        html: `<div class="relative">
                 <div class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></div>
                 <div class="relative inline-flex rounded-full h-8 w-8 bg-red-600 items-center justify-center border-2 border-white shadow-lg">
                    <i class="fas fa-user-injured text-white text-sm"></i>
                 </div>
               </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
    });

    return (
        <div className={`${className} rounded-xl overflow-hidden border-2 border-border shadow-lg relative z-0 min-h-[350px]`}>
            <MapContainer
                center={CENTER_POSITION}
                zoom={19}
                maxZoom={22}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%', minHeight: '350px' }}
            >
                <MapResizeHandler />

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
                            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{y}/{x}"
                            maxNativeZoom={19}
                            maxZoom={22}
                        />
                    </LayersControl.BaseLayer>
                </LayersControl>

                {showHeatmap && (
                    <HeatmapLayer
                        points={lanes
                            .filter(l => (l.location || LANE_PATHS[l.laneId]))
                            .map(l => {
                                const pos = l.location ? [l.location.lat, l.location.lng] : LANE_PATHS[l.laneId];
                                const intensity = Math.min((l.crowdCount || 0) / 100, 1.0);
                                return [...pos, intensity];
                            })}
                    />
                )}

                {lanes.map((lane) => {
                    let pos = null;
                    if (lane.location && lane.location.lat && lane.location.lng) {
                        pos = [lane.location.lat, lane.location.lng];
                    } else {
                        pos = LANE_PATHS[lane.laneId];
                    }

                    if (!pos) return null;

                    const color = getLaneColor(lane);
                    const isSos = lane.isSos;

                    return (
                        <React.Fragment key={lane.laneId}>
                            <CircleMarker
                                center={pos}
                                pathOptions={{
                                    color: color,
                                    fillColor: color,
                                    fillOpacity: 0.6,
                                    stroke: false
                                }}
                                radius={12}
                            >
                                <Popup>
                                    <div className="p-2 min-w-[150px]">
                                        <h3 className="font-bold text-lg mb-2">Lane {lane.laneId}</h3>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <span className="text-gray-600">Temp:</span>
                                            <span className="font-semibold">{lane.temperature || '--'}°C</span>
                                            <span className="text-gray-600">Humidity:</span>
                                            <span className="font-semibold">{lane.humidity || '--'}%</span>
                                            <span className="text-gray-600">Crowd:</span>
                                            <span className="font-semibold">{lane.crowdCount || 0}</span>
                                            <span className="text-gray-600">Status:</span>
                                            <span className={`font-bold ${color === '#E53E3E' ? 'text-red-600' : color === '#D69E2E' ? 'text-yellow-600' : 'text-green-600'}`}>
                                                {lane.status || (lane.crowdCount > 150 ? 'OVERCROWDED' : lane.crowdCount > 50 ? 'MODERATE' : 'NORMAL')}
                                            </span>
                                        </div>
                                        {['2', '3', '4'].includes(String(lane.laneId)) && (
                                            <div className="mt-2 text-center">
                                                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-blue-400">
                                                    📡 LIVE HARDWARE
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </Popup>
                            </CircleMarker>

                            {isSos && (
                                <Marker position={pos} icon={createPopIcon()}>
                                    <Popup>
                                        <div className="text-center">
                                            <strong className="text-red-600">SOS ALERT!</strong><br />
                                            Lane {lane.laneId}<br />
                                            <button className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-xs">Resolve</button>
                                        </div>
                                    </Popup>
                                </Marker>
                            )}
                        </React.Fragment>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default MapDashboard;
