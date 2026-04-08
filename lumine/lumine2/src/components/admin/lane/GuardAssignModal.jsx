import React from 'react';

const GuardAssignModal = ({ lane, onClose, onConfirm }) => {
    if (!lane) return null;

    return (
        <div className="fixed inset-0 modal-overlay z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
                <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold brand-font text-lg">Assign Guard Team</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><i className="fas fa-times"></i></button>
                </div>

                <div className="p-6">
                    <p className="text-sm text-gray-600 mb-4">Select available team for <strong>{lane.name}</strong>.</p>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border border-orange-200 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100 transition">
                            <div className="flex items-center gap-3">
                                <div className="bg-white p-2 rounded-full shadow-sm text-lumine-orange font-bold">A1</div>
                                <div>
                                    <div className="font-bold text-sm text-gray-800">Alpha Team</div>
                                    <div className="text-xs text-gray-500">2 Guards • <span className="text-green-600">Idle</span></div>
                                </div>
                            </div>
                            <div className="text-xs font-bold text-gray-700">~2m ETA</div>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium text-white bg-lumine-orange hover:bg-orange-600 rounded-lg shadow-md transition">Dispatch</button>
                </div>
            </div>
        </div>
    );
};

export default GuardAssignModal;
