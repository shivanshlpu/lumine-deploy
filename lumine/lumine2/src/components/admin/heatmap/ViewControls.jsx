import React from 'react';

const ViewControls = ({ showHeatmap, setShowHeatmap, showCameras, setShowCameras }) => {
    return (
        <div className="absolute top-4 left-4 z-[1000] w-64 glass-panel rounded-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                    <i className="fas fa-layer-group text-lumine-orange"></i> View Controls
                </h2>
            </div>
            <div className="p-4 space-y-4">
                <div className="space-y-3">
                    <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-xs font-medium text-gray-600 group-hover:text-lumine-navy">Heatmap Overlay</span>
                        <input
                            type="checkbox"
                            checked={showHeatmap}
                            onChange={(e) => setShowHeatmap(e.target.checked)}
                            className="accent-lumine-orange w-4 h-4 cursor-pointer"
                        />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-xs font-medium text-gray-600 group-hover:text-lumine-navy">Cameras (52 Active)</span>
                        <input
                            type="checkbox"
                            checked={showCameras}
                            onChange={(e) => setShowCameras(e.target.checked)}
                            className="accent-lumine-orange w-4 h-4 cursor-pointer"
                        />
                    </label>
                </div>

                <div className="pt-2 border-t border-gray-100">
                    <div className="text-[10px] uppercase font-bold text-gray-400 mb-2">Cluster Density</div>
                    <div className="text-[10px] text-gray-500 mb-2">1 Dot = 20 People</div>
                    <div className="flex justify-between items-center text-[10px] font-medium text-gray-500">
                        <span>Low</span>
                        <div className="h-1.5 w-24 bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 rounded-full mx-2"></div>
                        <span>Critical</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewControls;
