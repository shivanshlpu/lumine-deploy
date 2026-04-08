import React from 'react';

import { MapContainer, TileLayer, Marker, LayersControl, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CENTER_COORDS = [20.8880, 70.4010];

const AlertsMapPanel = ({ alerts, onAlertClick }) => {

    const createAlertIcon = (iconHtml) => {
        return L.divIcon({
            className: 'custom-div-icon',
            html: `<div class="pulse-marker">${iconHtml}</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
    };

    return (
        <div className="panel alert-map-panel flex flex-col h-full">
            <div className="panel-head shrink-0">
                <span className="panel-title">SOS & Alerts Map View</span>
                <span className="badge" style={{ background: 'var(--navy)', color: 'white' }}>INTERACTIVE</span>
            </div>
            <div className="flex-1 min-h-0 relative rounded-xl overflow-hidden border border-gray-200">
                <MapContainer
                    center={CENTER_COORDS}
                    zoom={19}
                    maxZoom={22}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={true}
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
                                attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                maxNativeZoom={19}
                                maxZoom={22}
                            />
                        </LayersControl.BaseLayer>
                    </LayersControl>

                    {/* Alerts Markers */}
                    {alerts.map(alert => (
                        <Marker
                            key={alert.id}
                            position={[alert.lat, alert.lon]}
                            icon={createAlertIcon(alert.icon)}
                            eventHandlers={{
                                click: () => onAlertClick(alert)
                            }}
                        />
                    ))}


                </MapContainer>
            </div>
        </div>
    );
};

export default AlertsMapPanel;
