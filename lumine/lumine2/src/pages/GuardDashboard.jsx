import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import '../styles/guard-dashboard.css';
import LostChildSearchModal from '../components/admin/LostChildSearchModal';

const GuardDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [tasks, setTasks] = useState([]);
    const [taskState, setTaskState] = useState('idle');
    const [timer, setTimer] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [outcome, setOutcome] = useState('');
    const [reportText, setReportText] = useState('');
    const [currentTask, setCurrentTask] = useState(null);

    // Dynamic API URL for cross-device support
    const API_BASE_URL = `http://${window.location.hostname}:5000`;

    const [, setSocket] = useState(null);

    useEffect(() => {
        // Socket Connection
        const newSocket = io(API_BASE_URL);
        setTimeout(() => setSocket(newSocket), 0);

        newSocket.on('connect', () => {
            console.log('✅ Guard Dashboard Connected to Socket');
        });

        newSocket.on('task_assigned', (task) => {
            console.log('🔥 Task Assigned:', task);
            // Check if task is for THIS guard (Mock ID check or assume all for demo)
            // For demo, we accept all tasks or check against a hardcoded ID
            // if (task.guardId === 'MY_GUARD_ID') ... 

            if (task) {
                setTasks(prev => [task, ...prev]);
                setTaskState('active');
                setShowToast(true);
                setIsTimerRunning(true);
            }
        });

        return () => newSocket.disconnect();
    }, []);

    // Fetch existing assigned tasks on load
    useEffect(() => {
        fetch(`${API_BASE_URL}/api/alerts`)
            .then(res => res.json())
            .then(data => {
                const assignedTasks = data
                    .filter(a => a.status === 'assigned')
                    .map(a => ({
                        id: a.alertId,
                        type: a.type,
                        title: `${a.type.toUpperCase()} Alert`,
                        location: a.location ? `${a.location.lat}, ${a.location.lng}` : 'Unknown Location',
                        desc: a.reason,
                        instruction: a.instruction || 'Proceed to location immediately.',
                        status: 'assigned',
                        guardId: a.assignedTo
                    }));

                if (assignedTasks.length > 0) {
                    // Avoid duplicates if socket also picked it up (simple check)
                    setTasks(prev => {
                        const newTasks = assignedTasks.filter(t => !prev.some(p => p.id === t.id));
                        return [...newTasks, ...prev];
                    });
                    setTaskState('active');
                    setIsTimerRunning(true);
                }
            })
            .catch(err => console.error('Error fetching tasks:', err));
    }, []);

    useEffect(() => {
        let interval = null;
        if (isTimerRunning) {
            interval = setInterval(() => {
                setTimer((prev) => prev + 1);
            }, 1000);
        } else if (!isTimerRunning && timer !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, timer]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // Removed mock triggerMockTask useEffect

    const handleLogout = () => {
        sessionStorage.removeItem('lumine_token');
        sessionStorage.removeItem('lumine_auth');
        localStorage.removeItem('lumine_token');
        navigate('/');
    };

    const openResolveModal = () => {
        setIsModalOpen(true);
    };

    const closeResolveModal = () => {
        setIsModalOpen(false);
        setOutcome('');
        setReportText('');
    };

    const submitResolution = async () => {
        if (!currentTask) return;

        // Use dynamic API URL
        const API_BASE_URL = `http://${window.location.hostname}:5000`;

        try {
            const response = await fetch(`${API_BASE_URL}/api/alerts/${currentTask.id}/resolve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ outcome, report: reportText })
            });

            if (response.ok) {
                setIsModalOpen(false);

                // Remove resolved task
                const updatedTasks = tasks.filter(t => t.id !== currentTask.id);
                setTasks(updatedTasks);

                if (updatedTasks.length === 0) {
                    setIsTimerRunning(false);
                    setTimer(0);
                    setTaskState('idle');
                }

                setCurrentTask(null);
                alert(`Report Submitted Successfully. Task closed.`);
            } else {
                alert('Failed to resolve task on server.');
            }
        } catch (error) {
            console.error('Error resolving task:', error);
            alert('Error resolving task.');
        }
    };

    return (
        <div className="guard-dashboard-body">
            <header className="top-header">
                <div className="flex items-center gap-3">
                    {/* Logo removed to avoid duplication with GovernmentHeader */}
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <div className="font-bold text-gray-800">Vikram Singh</div>
                        <div className="text-xs text-green-600 flex items-center justify-end gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span> Online
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram&backgroundColor=e5e7eb" alt="Avatar" />
                    </div>
                    <button onClick={handleLogout} className="w-10 h-10 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition" title="Logout">
                        <i className="fas fa-power-off"></i>
                    </button>
                </div>
            </header>

            <div className="app-container">
                <aside className="sidebar">
                    <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                        <i className="fas fa-th-large w-6"></i> <span>Dashboard</span>
                    </div>
                    <div className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
                        <i className="fas fa-history w-6"></i> <span>Task History</span>
                    </div>
                    <div className={`nav-item ${activeTab === 'support' ? 'active' : ''}`} onClick={() => setActiveTab('support')}>
                        <i className="fas fa-headset w-6"></i> <span>Support</span>
                    </div>
                    <div className="nav-item" onClick={() => setIsSearchModalOpen(true)}>
                        <i className="fas fa-search w-6"></i> <span>Lost Search</span>
                    </div>

                </aside>

                <main className="guard-main-content">
                    <div id="view-dashboard" className={`view-section ${activeTab === 'dashboard' ? 'active' : ''}`}>
                        <div className="dashboard-grid">
                            <div className="center-col">
                                <div className="card bg-white border border-gray-200 border-l-4 border-l-[var(--navy)] relative overflow-hidden shrink-0 min-h-[250px]">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-800 brand-font">Current Status</h2>
                                            <p className={`text-sm ${taskState === 'idle' ? 'text-gray-500' : 'text-red-600 font-bold animate-pulse'}`}>
                                                {taskState === 'idle' ? "System Status: Monitoring..." : "⚠️ ACTION REQUIRED"}
                                            </p>
                                        </div>
                                        {isTimerRunning && (
                                            <div id="timer-badge" className="bg-red-50 px-4 py-2 rounded-lg text-sm font-mono font-bold text-red-600 border border-red-100 animate-pulse">
                                                <i className="far fa-clock mr-1"></i> ELAPSED: <span>{formatTime(timer)}</span>
                                            </div>
                                        )}
                                    </div>

                                    {taskState === 'idle' && (
                                        <div className="flex flex-col items-center justify-center py-4 text-gray-400">
                                            <i className="fas fa-shield-alt text-5xl mb-3 opacity-20"></i>
                                            <p className="font-medium">No Active Assignments</p>
                                            <p className="text-xs">You are currently available.</p>
                                        </div>
                                    )}

                                    {taskState === 'active' && (
                                        <div className="flex flex-col gap-4 h-full justify-center">
                                            <div className="text-center">
                                                <div className="text-red-600 font-bold text-xl mb-1 animate-bounce">
                                                    <i className="fas fa-exclamation-circle"></i> TASK ASSIGNED
                                                </div>
                                                <p className="text-sm text-gray-600">Proceed to the location immediately.</p>
                                            </div>

                                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800">
                                                <i className="fas fa-info-circle mr-1"></i>
                                                <strong>Instruction:</strong> <span>{tasks.length > 0 ? tasks[0].instruction?.substring(0, 60) : ''}...</span>
                                            </div>

                                            <button onClick={openResolveModal} className="btn-action btn-success mt-auto shadow-lg shadow-green-200">
                                                <i className="fas fa-clipboard-check"></i> MARK TASK AS RESOLVED
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="card border border-gray-200 flex-1 overflow-hidden flex flex-col">
                                    <h2 className="text-lg font-bold text-gray-800 brand-font mb-4">Team: Alpha Squad</h2>

                                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100 mb-4 shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-[var(--navy)] text-white flex items-center justify-center font-bold">V</div>
                                        <div>
                                            <div className="font-bold text-sm text-[var(--navy)]">You (Vikram Singh)</div>
                                            <div className="text-[10px] text-gray-500">Badge: #8821 • GPS: Active</div>
                                        </div>
                                        <span className="ml-auto text-xs font-bold text-green-600">Leader</span>
                                    </div>

                                    <div className="space-y-3 overflow-y-auto pr-2 flex-1">
                                        <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ramesh" className="w-8 h-8 rounded-full bg-gray-100" alt="Ramesh" />
                                            <div>
                                                <div className="font-medium text-sm">Ramesh Kumar</div>
                                                <div className="text-[10px] text-gray-400">Gate 2 • 200m away</div>
                                            </div>
                                            <button className="ml-auto w-8 h-8 rounded-full bg-gray-50 hover:bg-green-50 text-green-600 flex items-center justify-center transition"><i className="fas fa-phone-alt text-xs"></i></button>
                                        </div>
                                        <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Suresh" className="w-8 h-8 rounded-full bg-gray-100" alt="Suresh" />
                                            <div>
                                                <div className="font-medium text-sm">Suresh Patel</div>
                                                <div className="text-[10px] text-gray-400">Locker Room • 450m away</div>
                                            </div>
                                            <button className="ml-auto w-8 h-8 rounded-full bg-gray-50 hover:bg-green-50 text-green-600 flex items-center justify-center transition"><i className="fas fa-phone-alt text-xs"></i></button>
                                        </div>
                                    </div>

                                    <button className="mt-4 w-full py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 shrink-0">
                                        <i className="fas fa-comments mr-2"></i> Message Team
                                    </button>
                                </div>
                            </div>

                            <div className="card border border-gray-200 border-t-4 border-t-[var(--primary)] relative h-full flex flex-col">
                                {/* Task Overlay (Hidden when active) */}
                                {tasks.length === 0 && (
                                    <div className="absolute inset-0 bg-white z-10 flex flex-col items-center justify-center text-center p-8">
                                        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-4 animate-pulse">
                                            <i className="fas fa-satellite-dish text-4xl text-green-500"></i>
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-800">All Systems Normal</h2>
                                        <p className="text-gray-500 mt-2 max-w-xs">You are currently visible on the Admin Grid. Stay alert.</p>
                                    </div>
                                )}

                                <div className={`h-full flex flex-col transition duration-500 overflow-y-auto ${tasks.length === 0 ? 'opacity-50 filter blur-sm' : ''}`}>
                                    <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-4 shrink-0">
                                        <div>
                                            <span className="badge badge-weapon mb-2 inline-block">ALERTS</span>
                                            <h1 className="text-2xl font-bold text-gray-900 leading-tight">Active Tasks ({tasks.length})</h1>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-gray-400 uppercase font-bold">Priority</div>
                                            <div className="text-red-600 font-bold animate-pulse">CRITICAL</div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                                        {tasks.map((task) => (
                                            <div key={task.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                                                <div className="flex gap-4">
                                                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative group cursor-pointer">
                                                        <img src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80" className="w-full h-full object-cover" alt="Location" />
                                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/50 transition">
                                                            <i className="fas fa-map-marked-alt text-white"></i>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <div className="text-xs text-gray-500 uppercase font-bold">Location</div>
                                                                <div className="font-bold text-lg text-[var(--navy)]">{task.location || '...'}</div>
                                                            </div>
                                                            <span className="badge badge-weapon text-[10px]">#{task.id}</span>
                                                        </div>

                                                        <div className="mt-2 text-sm text-gray-600 bg-white p-2 rounded border border-gray-100">
                                                            {task.instruction || 'No instructions provided.'}
                                                        </div>

                                                        <div className="mt-3 flex gap-2">
                                                            <button
                                                                onClick={() => { setCurrentTask(task); openResolveModal(); }}
                                                                className="flex-1 py-1.5 bg-green-600 text-white text-xs font-bold rounded hover:bg-green-700"
                                                            >
                                                                RESOLVE
                                                            </button>
                                                            <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="px-3 py-1.5 border border-gray-300 rounded text-xs font-medium hover:bg-gray-50">
                                                                GPS
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="view-history" className={`view-section ${activeTab === 'history' ? 'active' : ''}`}>
                        <div className="card border border-gray-200 h-full overflow-hidden">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold brand-font text-gray-800">Task History</h2>
                                <div className="flex gap-2">
                                    <select className="border border-gray-300 rounded-lg px-3 py-1 text-sm bg-gray-50"><option>Last 7 Days</option><option>Today</option></select>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-xs text-gray-500 uppercase border-b border-gray-200">
                                            <th className="py-3 pl-4">Time</th>
                                            <th className="py-3">Type</th>
                                            <th className="py-3">Location</th>
                                            <th className="py-3">Outcome</th>
                                            <th className="py-3 text-right pr-4">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm divide-y divide-gray-100">
                                        <tr className="hover:bg-gray-50">
                                            <td className="py-3 pl-4 font-mono text-gray-500">10:42 AM</td>
                                            <td><span className="badge badge-crowd text-[10px]">Crowd</span></td>
                                            <td className="text-gray-700">Gate 1 Entry</td>
                                            <td><span className="text-green-600 font-bold"><i className="fas fa-check mr-1"></i> Resolved</span></td>
                                            <td className="text-right pr-4"><button className="text-[var(--navy)] hover:underline">View</button></td>
                                        </tr>
                                        <tr className="hover:bg-gray-50">
                                            <td className="py-3 pl-4 font-mono text-gray-500">09:15 AM</td>
                                            <td><span className="badge badge-child text-[10px]">Lost Child</span></td>
                                            <td className="text-gray-700">Shoe Counter</td>
                                            <td><span className="text-green-600 font-bold"><i className="fas fa-check mr-1"></i> Reunited</span></td>
                                            <td className="text-right pr-4"><button className="text-[var(--navy)] hover:underline">View</button></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div id="view-support" className={`view-section ${activeTab === 'support' ? 'active' : ''}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                            <div className="card border border-gray-200">
                                <h2 className="text-xl font-bold brand-font text-gray-800 mb-4">Emergency Contacts</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-4 bg-red-50 rounded-xl border border-red-100">
                                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xl"><i className="fas fa-phone-alt"></i></div>
                                        <div>
                                            <div className="font-bold text-gray-800">Control Room (Admin)</div>
                                            <div className="text-lg font-mono font-bold text-red-600">EXT 909</div>
                                        </div>
                                        <button className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Call</button>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl"><i className="fas fa-user-shield"></i></div>
                                        <div>
                                            <div className="font-bold text-gray-800">Police Liaison</div>
                                            <div className="text-lg font-mono font-bold text-blue-600">+91 98765 43210</div>
                                        </div>
                                        <button className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Call</button>
                                    </div>
                                </div>
                            </div>

                            <div className="card border border-gray-200">
                                <h2 className="text-xl font-bold brand-font text-gray-800 mb-4">Report an Issue</h2>
                                <textarea className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none mb-4" placeholder="Describe app issue or suggestion..."></textarea>
                                <button className="w-full py-3 bg-[var(--navy)] text-white font-bold rounded-lg hover:bg-gray-800">Submit Ticket</button>
                            </div>
                        </div>
                    </div>

                </main>
            </div>

            <div className={`toast-notification ${showToast ? 'show' : ''}`}>
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 animate-bounce">
                    <i className="fas fa-exclamation-triangle"></i>
                </div>
                <div>
                    <h4 className="font-bold text-gray-800">New Task Assigned</h4>
                    <p className="text-sm text-gray-500">{tasks.length > 0 ? `${tasks[0].title} - ${tasks[0].location}` : ''}</p>
                </div>
                <button onClick={() => setShowToast(false)} className="text-gray-400 hover:text-gray-600 ml-auto"><i className="fas fa-times"></i></button>
            </div>

            <div className={`modal-overlay ${isModalOpen ? 'open' : ''}`}>
                <div className="modal-card">
                    <h3 className="text-xl font-bold brand-font text-gray-800 mb-4">Resolve Task #{currentTask?.id}</h3>

                    <label className="block text-sm font-bold text-gray-700 mb-2">Outcome Status</label>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        <button onClick={() => setOutcome('resolved')} className={`outcome-btn py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 text-center ${outcome === 'resolved' ? 'bg-[var(--navy)] text-white border-transparent' : ''}`}>Resolved</button>
                        <button onClick={() => setOutcome('false_alarm')} className={`outcome-btn py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 text-center ${outcome === 'false_alarm' ? 'bg-[var(--navy)] text-white border-transparent' : ''}`}>False Alarm</button>
                        <button onClick={() => setOutcome('escalated')} className={`outcome-btn py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 text-center ${outcome === 'escalated' ? 'bg-[var(--navy)] text-white border-transparent' : ''}`}>Escalated</button>
                    </div>

                    <label className="block text-sm font-bold text-gray-700 mb-2">Final Report</label>
                    <textarea value={reportText} onChange={(e) => setReportText(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg text-sm mb-4" rows="3" placeholder="Describe actions taken..."></textarea>

                    <div className="flex gap-3">
                        <button onClick={closeResolveModal} className="flex-1 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button onClick={submitResolution} className="flex-1 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-md">Submit Report</button>
                    </div>
                </div>
            </div>

            <LostChildSearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
        </div>
    );
};

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("GuardDashboard Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-10 text-red-600">
                    <h1 className="text-2xl font-bold">Something went wrong.</h1>
                    <pre className="mt-4 bg-gray-100 p-4 rounded text-sm overflow-auto">
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </pre>
                </div>
            );
        }

        return this.props.children;
    }
}

export default function GuardDashboardWithBoundary() {
    return (
        <ErrorBoundary>
            <GuardDashboard />
        </ErrorBoundary>
    );
}
