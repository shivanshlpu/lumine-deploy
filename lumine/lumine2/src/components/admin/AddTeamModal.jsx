import React, { useState } from 'react';
import { X } from 'lucide-react';

const PREDEFINED_LOCATIONS = {
    'Main Gate': '20.8880, 70.4010',
    'Lane 1': '20.8881, 70.4011',
    'Lane 2': '20.8882, 70.4012',
    'Lane 3': '20.8883, 70.4013',
    'Lane 4': '20.8884, 70.4014',
    'Lane 5': '20.8885, 70.4015',
    'Lane 6': '20.8886, 70.4016',
    'Lane 7': '20.8887, 70.4017',
    'Lane 8': '20.8888, 70.4018',
    'Shoe House': '20.8890, 70.4005',
    'Prasad Counter': '20.8892, 70.4025',
    'Parking Area': '20.8860, 70.4000',
};

const AddTeamModal = ({ isOpen, onClose, onAdd }) => {
    const [teamName, setTeamName] = useState('');
    const [selectedLocationName, setSelectedLocationName] = useState('Main Gate');
    const [customLocation, setCustomLocation] = useState(PREDEFINED_LOCATIONS['Main Gate']);
    const [isCustom, setIsCustom] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const finalLocation = isCustom ? customLocation : PREDEFINED_LOCATIONS[selectedLocationName];
        onAdd(teamName, finalLocation);
        resetForm();
        onClose();
    };

    const resetForm = () => {
        setTeamName('');
        setSelectedLocationName('Main Gate');
        setCustomLocation(PREDEFINED_LOCATIONS['Main Gate']);
        setIsCustom(false);
    };

    const handleSmartSearch = () => {
        setIsSearching(true);
        // Simulate an "Internet Search" / AI Analysis
        setTimeout(() => {
            const strategicSpots = ['Shoe House', 'Prasad Counter', 'Parking Area'];
            const randomSpot = strategicSpots[Math.floor(Math.random() * strategicSpots.length)];
            setSelectedLocationName(randomSpot);
            setIsCustom(false);
            setIsSearching(false);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-bold text-navy-900">Deploy New Team</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                        <input
                            type="text"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            placeholder="e.g., Team Delta"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-navy-500 focus:ring-2 focus:ring-navy-200 outline-none transition-all"
                            required
                            autoFocus
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700">Deployment Location</label>
                            <button
                                type="button"
                                onClick={handleSmartSearch}
                                disabled={isSearching}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                            >
                                {isSearching ? 'Analyzing...' : '✨ Suggest Strategic Spot'}
                            </button>
                        </div>

                        {!isCustom ? (
                            <select
                                value={selectedLocationName}
                                onChange={(e) => {
                                    if (e.target.value === 'custom') {
                                        setIsCustom(true);
                                    } else {
                                        setSelectedLocationName(e.target.value);
                                    }
                                }}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-navy-500 focus:ring-2 focus:ring-navy-200 outline-none transition-all bg-white"
                            >
                                <optgroup label="Key Entry Points">
                                    <option value="Main Gate">Main Gate</option>
                                </optgroup>
                                <optgroup label="Queue Lanes">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                                        <option key={num} value={`Lane ${num}`}>Lane {num}</option>
                                    ))}
                                </optgroup>
                                <optgroup label="Strategic Zones">
                                    <option value="Shoe House">Shoe House</option>
                                    <option value="Prasad Counter">Prasad Counter</option>
                                    <option value="Parking Area">Parking Area</option>
                                </optgroup>
                                <option value="custom">+ Enter Custom Coordinates</option>
                            </select>
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={customLocation}
                                    onChange={(e) => setCustomLocation(e.target.value)}
                                    placeholder="Lat, Lon"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-navy-500 focus:ring-2 focus:ring-navy-200 outline-none transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setIsCustom(false)}
                                    className="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500"
                                >
                                    List
                                </button>
                            </div>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                            {isSearching ? 'Searching internet for high-traffic zones...' : 'Select a predefined location or enter custom coordinates.'}
                        </p>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2.5 rounded-xl bg-navy-900 text-white font-medium hover:bg-navy-800 shadow-lg shadow-navy-900/20 transition-all"
                        >
                            Deploy Team
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTeamModal;
