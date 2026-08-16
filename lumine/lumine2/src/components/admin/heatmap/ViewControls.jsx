import React, { useState } from 'react';
import { Layers, X, Settings2 } from 'lucide-react';

const ViewControls = ({ showHeatmap, setShowHeatmap, showCameras, setShowCameras }) => {
    const [isOpen, setIsOpen] = useState(true);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg border border-gray-200/80 flex items-center gap-2 text-xs font-bold text-navy-900 hover:bg-orange-50 hover:text-orange-700 transition-all active:scale-95"
                aria-label="Open view controls"
            >
                <Layers className="w-4 h-4 text-orange-600" />
                <span>View Controls</span>
            </button>
        );
    }

    return (
        <div className="absolute top-3 left-3 z-[1000] w-[calc(100vw-24px)] max-w-[260px] bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/80 overflow-hidden flex flex-col transition-all animate-fade-in">
            {/* Panel Header */}
            <div className="p-3 sm:p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h2 className="font-bold text-navy-900 text-xs sm:text-sm flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-orange-600" />
                    <span>View Controls</span>
                </h2>
                <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors"
                    aria-label="Close view controls"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Panel Body */}
            <div className="p-3 sm:p-4 space-y-3">
                <div className="space-y-2.5">
                    <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-xs font-medium text-gray-700 group-hover:text-orange-700">Heatmap Overlay</span>
                        <input
                            type="checkbox"
                            checked={showHeatmap}
                            onChange={(e) => setShowHeatmap(e.target.checked)}
                            className="accent-orange-600 w-4 h-4 cursor-pointer rounded"
                        />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-xs font-medium text-gray-700 group-hover:text-orange-700">Cameras (52 Active)</span>
                        <input
                            type="checkbox"
                            checked={showCameras}
                            onChange={(e) => setShowCameras(e.target.checked)}
                            className="accent-orange-600 w-4 h-4 cursor-pointer rounded"
                        />
                    </label>
                </div>

                <div className="pt-2 border-t border-gray-100">
                    <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Cluster Density</div>
                    <div className="text-[10px] text-gray-500 mb-1.5">1 Dot = 20 People</div>
                    <div className="flex justify-between items-center text-[10px] font-medium text-gray-500">
                        <span>Low</span>
                        <div className="h-1.5 flex-1 bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 rounded-full mx-2"></div>
                        <span>Critical</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewControls;
