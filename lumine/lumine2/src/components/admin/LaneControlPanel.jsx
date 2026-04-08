import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const LaneControlPanel = () => {
    const [lanes, setLanes] = useState([]);

    useEffect(() => {
        const fetchLaneStatus = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/lane-status');
                const data = await response.json();

                // Only show active lanes with numeric IDs
                const formattedLanes = data
                    .filter(l => !isNaN(l.laneId))
                    .map(lane => ({
                        id: lane.laneId,
                        state: lane.gateStatus === 'CLOSED' ? 'closed' : 'open', // Use gateStatus
                        crowdStatus: lane.status // Keep crowd status for reference if needed
                    }));
                setLanes(formattedLanes);
            } catch (error) {
                console.error('Error fetching lane status:', error);
            }
        };

        fetchLaneStatus();

        // Real-time updates
        const socket = io('http://localhost:5000');
        socket.on('lane-update', (updatedLane) => {
            setLanes(prev => prev.map(lane => {
                if (lane.id == updatedLane.laneId) {
                    return {
                        ...lane,
                        state: updatedLane.gateStatus === 'CLOSED' ? 'closed' : 'open',
                        crowdStatus: updatedLane.status
                    };
                }
                return lane;
            }));
        });

        return () => socket.disconnect();
    }, []);

    const toggleLane = async (index) => {
        const lane = lanes[index];
        const newAction = lane.state === 'open' ? 'CLOSED' : 'OPEN';

        // Optimistic Update
        setLanes(prev => {
            const newLanes = [...prev];
            newLanes[index] = { ...lane, state: newAction === 'CLOSED' ? 'closed' : 'open' };
            return newLanes;
        });

        try {
            const response = await fetch(`http://localhost:5000/api/lanes/${lane.id}/gate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: newAction })
            });

            if (!response.ok) throw new Error('Failed to toggle gate');

            console.log(`Toggled Lane ${lane.id} to ${newAction}`);

        } catch (error) {
            console.error('Error toggling lane:', error);
            alert('Failed to update gate status');
            // Revert on error
            setLanes(prev => {
                const newLanes = [...prev];
                newLanes[index] = lane; // Revert to old state
                return newLanes;
            });
        }
    };

    return (
        <div className="panel lane-panel">
            <div className="panel-head">
                <span className="panel-title">Lane Control (Public View)</span>
            </div>
            <div className="lane-grid" id="lane-grid">
                {lanes.map((lane, index) => (
                    <div
                        key={lane.id}
                        className={`lane-btn ${lane.state}`}
                        onClick={() => toggleLane(index)}
                        style={{ cursor: 'pointer' }}
                    >
                        <h5>L-{lane.id}</h5>
                        <span>{lane.state.toUpperCase()}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LaneControlPanel;
