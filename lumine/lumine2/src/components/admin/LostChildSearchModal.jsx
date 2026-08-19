import React, { useState } from 'react';
import { X, Search, User, MapPin, Clock, AlertTriangle } from 'lucide-react';
import API_BASE_URL from '../../config/api';

const LostChildSearchModal = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const res = await fetch(`${API_BASE_URL}/api/search/lost-child?q=${query.trim()}`);
            const data = await res.json();

            if (res.ok) {
                setResult(data);
            } else {
                setError(data.error || 'Child not found');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-red-50">
                    <h3 className="text-lg font-bold text-red-900 flex items-center gap-2">
                        <Search className="w-5 h-5" />
                        Lost Search
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Enter Card Number..."
                            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all"
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 shadow-lg shadow-red-900/20 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </form>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-700 rounded-xl text-center mb-4">
                            {error}
                        </div>
                    )}

                    {result && (
                        <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                            {/* Member Details */}
                            <div className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                                    <User className="w-8 h-8" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900">{result.member.name}</h4>
                                    <p className="text-sm text-gray-500">Age: {result.member.age} • Gender: {result.member.gender}</p>
                                    <p className="text-sm text-gray-500">Parent Mobile: <span className="font-mono text-gray-700">{result.member.parentMobile}</span></p>
                                    <p className="text-xs text-gray-400 mt-1">ID: {result.member.cardId}</p>
                                </div>
                            </div>

                            {/* Last Seen Status */}
                            <div className="p-4 bg-white rounded-xl border-2 border-dashed border-red-100">
                                <h5 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Latest Status</h5>

                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-red-500 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                Last Detected at Lane {result.lastSeen?.laneId || 'Unknown'}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Hardware Terminal: {result.lastSeen?.laneId ? `Terminal #${result.lastSeen.laneId}` : 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                Time: {result.lastSeen?.timestamp ? new Date(result.lastSeen.timestamp).toLocaleString() : 'N/A'}
                                            </p>
                                            {result.lastSeen?.timestamp && (
                                                <p className="text-xs text-gray-500">
                                                    ({Math.floor((new Date() - new Date(result.lastSeen.timestamp)) / 60000)} mins ago)
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {result.currentExistance && (
                                        <div className="flex items-start gap-3 pt-2 border-t border-gray-100 mt-2">
                                            <AlertTriangle className={`w-5 h-5 mt-0.5 ${result.currentExistance.status === 'RED' ? 'text-red-600' : 'text-yellow-600'}`} />
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    Lane Status: <span className={`font-bold ${result.currentExistance.status === 'RED' ? 'text-red-600' : 'text-green-600'}`}>
                                                        {result.currentExistance.status}
                                                    </span>
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Gate is currently {result.currentExistance.gateStatus}.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LostChildSearchModal;
