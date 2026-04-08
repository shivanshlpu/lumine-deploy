import React, { useEffect, useState } from 'react';

const DetailsPanel = ({ selectedLane, onClose, onDeploy }) => {
    const [isDeploying, setIsDeploying] = useState(false);
    const [sparklines, setSparklines] = useState([]);

    useEffect(() => {
        setTimeout(() => {
            setSparklines(Array.from({ length: 25 }, () => Math.floor(Math.random() * 100)));
        }, 0);
    }, [selectedLane]);

    const handleDeploy = () => {
        setIsDeploying(true);
        setTimeout(() => {
            setIsDeploying(false);
            onDeploy();
        }, 1500);
    };

    if (!selectedLane) return null;

    const { name, id, current, capacity } = selectedLane;
    const pct = Math.min((current / capacity) * 100, 100);

    let statusClass = "bg-green-100 text-green-700";
    let statusText = "NORMAL";
    let broadcastMsg = null;

    if (pct > 90) {
        statusClass = "bg-red-100 text-red-700";
        statusText = "FULL / CRITICAL";
        broadcastMsg = { icon: "fas fa-broadcast-tower text-red-500", text: "CLOSED / FULL", color: "text-red-700" };
    } else if (pct > 60) {
        statusClass = "bg-orange-100 text-orange-700";
        statusText = "HEAVY TRAFFIC";
        broadcastMsg = { icon: "fas fa-broadcast-tower text-orange-500", text: "WAIT TIME 15m", color: "text-orange-700" };
    }

    return (
        <div id="details-panel" className={`absolute top-4 bottom-4 right-4 w-80 glass-panel rounded-xl z-[1000] slide-over ${selectedLane ? 'open' : 'closed'} flex flex-col overflow-hidden`}>
            <div className="p-4 bg-white border-b border-gray-100 flex justify-between items-center">
                <div>
                    <h3 id="panel-title" className="font-bold text-gray-800 text-lg">{name}</h3>
                    <p id="panel-id" className="text-xs text-gray-400 font-mono">ID: #{id}</p>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition">
                    <i className="fas fa-times"></i>
                </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto bg-gray-50/50">
                <div className="bg-white p-4 rounded-xl shadow-card mb-4 border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Current Status</span>
                        <span id="panel-status-badge" className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusClass}`}>{statusText}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span id="panel-count" className="text-3xl font-bold text-gray-800">{current}</span>
                        <span className="text-sm text-gray-400">devotees</span>
                    </div>

                    {broadcastMsg && (
                        <div id="dashboard-broadcast-msg" className="mt-3 text-[10px] font-mono bg-gray-100 p-2 rounded text-gray-600 border border-gray-200">
                            <i className={`${broadcastMsg.icon} mr-1 ${pct > 90 ? 'animate-pulse' : ''}`}></i> App Status: <span className={`font-bold ${broadcastMsg.color}`}>{broadcastMsg.text}</span>
                        </div>
                    )}

                    <div className="w-full h-1.5 bg-gray-100 rounded-full mt-3 overflow-hidden">
                        <div id="panel-progress" className="h-full bg-lumine-orange rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-card mb-4 border border-gray-100">
                    <h4 className="text-xs font-semibold text-gray-700 mb-3">Live Trend (30m)</h4>
                    <div className="h-16 w-full flex items-end gap-1" id="sparkline-container">
                        {sparklines.map((h, i) => (
                            <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-orange-100 rounded-sm hover:bg-lumine-orange transition-colors"></div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:border-lumine-orange hover:shadow-md transition text-left group">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-2 group-hover:bg-blue-500 group-hover:text-white transition">
                            <i className="fas fa-video"></i>
                        </div>
                        <span className="text-xs font-medium text-gray-600 block">View Cam</span>
                    </button>
                    <button className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:border-lumine-orange hover:shadow-md transition text-left group">
                        <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center mb-2 group-hover:bg-purple-500 group-hover:text-white transition">
                            <i className="fas fa-bullhorn"></i>
                        </div>
                        <span className="text-xs font-medium text-gray-600 block">Broadcast</span>
                    </button>
                </div>
            </div>

            <div className="p-4 bg-white border-t border-gray-100">
                <button onClick={handleDeploy} disabled={isDeploying} className="w-full bg-gray-900 hover:bg-black text-white font-medium py-3 rounded-xl shadow-lg shadow-gray-200 transition flex items-center justify-center gap-2 group disabled:opacity-70">
                    {isDeploying ? (
                        <>
                            <i className="fas fa-circle-notch fa-spin"></i> Dispatching...
                        </>
                    ) : (
                        <>
                            <i className="fas fa-shield-alt group-hover:text-lumine-orange transition"></i>
                            <span>Deploy Guard Team</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default DetailsPanel;
