import React from 'react';

const LaneCard = ({ lane, onStatusChange, onGateToggle, onOpenCam, onAssignGuard }) => {

    const getStatusColor = (status, percentage) => {
        if (status === 'STUCK') return '#E53E3E';
        if (status === 'CLOSED') return '#718096';
        if (status === 'BUSY') return '#DD6B20'; // Orange
        if (percentage > 85) return '#E53E3E';
        if (percentage > 70) return '#DD6B20';
        if (percentage > 50) return '#F59E0B';
        return '#38A169'; // Green
    };

    const generateSparkline = (data) => {
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;
        const width = 80;
        const height = 30;
        const points = data.map((val, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = height - ((val - min) / range) * height;
            return `${x},${y}`;
        }).join(' ');

        return (
            <svg width={width} height={height} className="sparkline overflow-visible">
                <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6" />
            </svg>
        );
    };

    const effectiveCount = Math.ceil(lane.rawHeadCount / 5);
    const percentage = Math.round((effectiveCount / lane.capacity) * 100);
    const colorHex = getStatusColor(lane.status, percentage);

    let statusClass = 'badge-open';
    let cardClass = '';
    let statusText = lane.status;
    let strokeColor = '#38A169';

    const [showCardBadge, setShowCardBadge] = React.useState(false);
    const [cardId, setCardId] = React.useState(null);

    React.useEffect(() => {
        if (lane.lastCardSeen && lane.lastCardSeen.ts > Date.now() - 3000) {
            setCardId(lane.lastCardSeen.id);
            setShowCardBadge(true);
            const timer = setTimeout(() => setShowCardBadge(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [lane.lastCardSeen]);

    if (lane.status === 'STUCK') {
        statusClass = 'badge-stuck'; cardClass = 'stuck'; strokeColor = '#E53E3E'; statusText = '⚠️ STUCK';
    } else if (lane.status === 'BUSY') {
        statusClass = 'badge-busy'; statusText = 'BUSY'; strokeColor = '#DD6B20';
    } else if (lane.status === 'CLOSED') {
        statusClass = 'badge-closed'; cardClass = 'closed'; strokeColor = '#CBD5E0'; statusText = 'CLOSED';
    } else if (percentage > 85) {
        statusClass = 'bg-red-100 text-red-800'; statusText = 'CRITICAL'; strokeColor = '#E53E3E';
    } else if (percentage > 60) {
        statusClass = 'bg-orange-100 text-orange-800'; statusText = 'HEAVY'; strokeColor = '#DD6B20';
    }

    return (
        <div className={`lane-card ${cardClass} p-5 h-full flex flex-col`}>
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 font-bold text-lg border border-gray-100 shadow-sm">
                        {lane.id}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg leading-none text-gray-800">{lane.name}</h3>
                        <div className="text-[10px] text-gray-400 font-mono mt-1">
                            <i className="fas fa-map-marker-alt"></i> {lane.location.lat.toFixed(4)}, {lane.location.lng.toFixed(4)}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    {showCardBadge && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded animate-pulse">
                            💳 {cardId}
                        </span>
                    )}
                    <span className={`badge ${statusClass}`}>{statusText}</span>
                </div>
            </div>

            <div className="flex gap-1 mb-4 bg-gray-50 p-1 rounded-md justify-between">
                <button onClick={() => onGateToggle(lane.id, 'OPEN')} className={`status-btn btn-open ${lane.gateStatus === 'OPEN' ? 'active' : ''} flex-1`}>OPEN</button>
                <button onClick={() => onStatusChange(lane.id, 'BUSY')} className={`status-btn btn-busy ${lane.status === 'BUSY' ? 'active' : ''} flex-1`}>BUSY</button>
                <button onClick={() => onGateToggle(lane.id, 'CLOSED')} className={`status-btn btn-close ${lane.gateStatus === 'CLOSED' ? 'active' : ''} flex-1`}>BLOCK</button>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 mb-4">
                <div className="flex justify-between items-end mb-1">
                    <span className="text-xs text-gray-500 uppercase font-semibold">Effective Count</span>
                    <span className="text-[10px] text-lumine-orange font-bold">Cap: {percentage}%</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-800">{effectiveCount}</span>
                    <span className="text-xs text-gray-400 font-medium">/ {lane.capacity}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: colorHex }}></div>
                </div>
            </div>

            <div className="flex justify-between items-center mb-4 mt-auto">
                <div>
                    <div className="text-[10px] text-gray-400 uppercase">Throughput</div>
                    <div className="font-bold text-gray-700">{lane.throughput} <span className="text-[10px] font-normal">/min</span></div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] text-gray-400 uppercase">Environment</div>
                    <div className="flex gap-2 text-xs font-bold text-gray-600">
                        <span><i className="fas fa-thermometer-half text-red-400"></i> {lane.temp}°C</span>
                        <span><i className="fas fa-tint text-blue-400"></i> {lane.humidity}%</span>
                    </div>
                </div>
            </div>
            <div className="text-gray-500 mb-2" style={{ color: strokeColor }}>
                {generateSparkline(lane.history)}
            </div>

            <div className="grid grid-cols-2 gap-2">
                <button onClick={() => onOpenCam(lane)} className="flex items-center justify-center gap-1 py-2 rounded bg-gray-800 text-white text-xs font-medium hover:bg-black transition shadow-lg ring-1 ring-white/10">
                    <i className="fas fa-video animate-pulse text-red-400"></i> LIVE CAM
                </button>
                <button onClick={() => onAssignGuard(lane)} className="flex items-center justify-center gap-1 py-2 rounded border border-gray-300 text-gray-700 text-xs font-medium hover:bg-gray-50 hover:text-lumine-orange transition">
                    <i className="fas fa-user-shield"></i> Assign
                </button>
            </div>
        </div>
    );
};

export default LaneCard;
