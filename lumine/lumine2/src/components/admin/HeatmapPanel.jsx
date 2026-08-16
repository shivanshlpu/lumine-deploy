import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import MapDashboard from '../MapDashboard';

const HeatmapPanel = () => {
    const [lanes, setLanes] = useState([]);

    useEffect(() => {
        const fetchLanes = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/lanes');
                const data = await response.json();
                setLanes(data);
            } catch (error) {
                console.error('Error fetching lanes:', error);
            }
        };

        fetchLanes();

        const socket = io('http://localhost:5000');
        socket.on('lane-update', (updatedLane) => {
            console.log('🔥 [DashboardPanel] DATA RECEIVED:', updatedLane);
            setLanes(prev => {
                const exists = prev.find(l => l.laneId == updatedLane.laneId);
                if (exists) {
                    return prev.map(l => l.laneId == updatedLane.laneId ? { ...l, ...updatedLane } : l);
                } else {
                    return [...prev, updatedLane];
                }
            });
        });

        return () => socket.disconnect();
    }, []);

    return (
        <div className="panel left-col flex flex-col h-full">
            <div className="panel-head shrink-0">
                <span className="panel-title">Real-Time Heatmap View</span>
                <span className="badge badge-live">LIVE FEED</span>
            </div>
            <div className="h-[350px] lg:h-full w-full relative p-2">
                <MapDashboard lanes={lanes} className="h-full w-full" />
            </div>
        </div>
    );
};

export default HeatmapPanel;
