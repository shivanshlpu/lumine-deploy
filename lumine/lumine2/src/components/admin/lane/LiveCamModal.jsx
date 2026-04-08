import React, { useEffect, useState } from 'react';

const LiveCamModal = ({ lane, onClose }) => {
    const [stats, setStats] = useState({
        ts: new Date().toLocaleTimeString(),
        fps: 24,
        obj: lane ? lane.rawHeadCount : 0,
        raw: lane ? lane.rawHeadCount : 0,
        proc: lane ? Math.ceil(lane.rawHeadCount / 5) : 0
    });

    useEffect(() => {
        if (!lane) return;
        const interval = setInterval(() => {
            setStats({
                ts: new Date().toLocaleTimeString(),
                fps: 20 + Math.floor(Math.random() * 5),
                obj: lane.rawHeadCount,
                raw: lane.rawHeadCount,
                proc: Math.ceil(lane.rawHeadCount / 5)
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [lane]);

    if (!lane) return null;

    return (
        <div className="fixed inset-0 modal-overlay z-50 flex items-center justify-center">
            <div className="bg-black rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
                <div className="flex justify-between items-center p-3 bg-gray-900 text-white">
                    <span className="text-sm font-mono flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        LIVE FEED | {lane.camId} ({lane.name})
                    </span>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><i className="fas fa-times"></i></button>
                </div>
                <div className="aspect-video bg-gray-800 relative flex items-center justify-center overflow-hidden group">
                    {/* Live Cam BG */}
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1509909756405-be0199881695?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center opacity-60 grayscale group-hover:grayscale-0 transition duration-500"></div>

                    {/* Live Overlay Info */}
                    <div className="text-center z-10 pointer-events-none">
                        <i className="fas fa-video text-5xl text-white/50 mb-2 animate-bounce"></i>
                        <p className="text-white/90 text-sm font-mono bg-black/50 px-2 rounded">Live Stream Active</p>
                    </div>

                    <div className="absolute top-4 left-4 text-xs font-mono text-green-400 bg-black/60 p-2 rounded border border-green-900/50">
                        <div>OBJ_DET: <span>{stats.obj}</span></div>
                        <div>FPS: <span>{stats.fps}</span></div>
                    </div>
                    <div className="absolute bottom-4 right-4 text-xs font-mono text-white bg-black/60 p-2 rounded">
                        TS: <span>{stats.ts}</span>
                    </div>
                </div>
                <div className="bg-gray-900 p-4 grid grid-cols-3 gap-4 border-t border-gray-800">
                    <div className="text-center">
                        <div className="text-gray-500 text-xs uppercase">Raw Heads</div>
                        <div className="text-white font-mono text-xl">{stats.raw}</div>
                    </div>
                    <div className="text-center border-l border-gray-700">
                        <div className="text-gray-500 text-xs uppercase">Processed (1:5)</div>
                        <div className="text-lumine-orange font-mono text-xl font-bold">{stats.proc}</div>
                    </div>
                    <div className="text-center border-l border-gray-700">
                        <div className="text-gray-500 text-xs uppercase">Status</div>
                        <div className="text-green-400 font-mono text-sm font-bold mt-1">ONLINE</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveCamModal;
