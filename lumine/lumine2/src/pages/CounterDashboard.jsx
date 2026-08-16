import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutGrid,
    UserPlus,
    CheckCircle,
    Search,
    LogOut,
    User,
    Calendar,
    CreditCard,
    AlertCircle,
    Users,
    Filter,
    ShieldCheck,
    QrCode,
    CheckCheck,
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

const CounterDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('verification'); // 'verification', 'walkin', 'search'

    // --- Verification State ---
    const [bookingId, setBookingId] = useState('');
    const [bookingData, setBookingData] = useState(null);
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [verifyError, setVerifyError] = useState('');
    const [verifyingMember, setVerifyingMember] = useState(null);
    const [verifyAllMode, setVerifyAllMode] = useState(false);
    const [verifySuccess, setVerifySuccess] = useState('');

    // --- Walk-in State ---
    const [walkinForm, setWalkinForm] = useState({
        name: '',
        age: '',
        gender: 'Male',
        disability: 'None',
        email: '',
        mobile: '',
        aadhaar_full: '',
        cardId: ''
    });
    const [walkinLoading, setWalkinLoading] = useState(false);
    const [walkinSuccess, setWalkinSuccess] = useState('');

    // --- Search User State ---
    const [searchFilter, setSearchFilter] = useState('all'); // 'all', 'online', 'walkin'
    const [searchQuery, setSearchQuery] = useState('');
    const [userList, setUserList] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    const API_BASE = `http://${window.location.hostname}:5000`;

    const logout = () => {
        sessionStorage.clear();
        navigate('/');
    };

    // --- Actions ---

    // Fetch users based on tab/filter
    useEffect(() => {
        if (activeTab === 'search') {
            fetchUsers(searchFilter);
        }
    }, [activeTab, searchFilter]);

    const fetchUsers = async (type) => {
        setLoadingUsers(true);
        try {
            const url = type === 'all'
                ? `${API_BASE}/api/bookings`
                : `${API_BASE}/api/bookings?type=${type}`;

            const response = await fetch(url);
            const data = await response.json();

            if (response.ok) {
                setUserList(data);
            } else {
                console.error("Failed to fetch users");
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleSearchBooking = async (overrideId) => {
        const searchTerm = (overrideId || bookingId).trim();
        if (!searchTerm) return;
        setVerifyLoading(true);
        setVerifyError('');
        setBookingData(null);
        setVerifySuccess('');

        try {
            const response = await fetch(`${API_BASE}/api/bookings/${encodeURIComponent(searchTerm)}`);
            const data = await response.json();

            if (response.ok) {
                setBookingData(data);
            } else {
                setVerifyError(data.error || 'Booking not found');
            }
        } catch (err) {
            setVerifyError('Server error. Please try again.');
        } finally {
            setVerifyLoading(false);
        }
    };

    const handleVerifyMember = async (aadhaarInput, cardIdInput) => {
        if (!verifyingMember) return;

        if (verifyingMember.aadhaar_full && verifyingMember.aadhaar_full !== aadhaarInput) {
            alert('Aadhaar number does not match record!');
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/api/bookings/verify-member`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookingId: bookingData.bookingId,
                    memberId: verifyingMember._id,
                    cardId: cardIdInput,
                    aadhaar_full: aadhaarInput
                })
            });
            const data = await response.json();

            if (response.ok) {
                // Refresh the booking data to show updated status
                setBookingData(data.booking);
                setVerifyingMember(null);
                setVerifySuccess(`✅ ${verifyingMember.name} verified successfully!`);
                setTimeout(() => setVerifySuccess(''), 4000);
            } else {
                alert(data.error || 'Verification failed');
            }
        } catch (err) {
            alert('Server error during verification');
        }
    };

    // Verify ALL members with a single Aadhaar + cardId
    const handleVerifyAll = async (aadhaarInput, cardIdInput) => {
        try {
            const response = await fetch(`${API_BASE}/api/bookings/verify-member`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookingId: bookingData.bookingId,
                    aadhaar_full: aadhaarInput,
                    cardId: cardIdInput,
                    verifyAll: true
                })
            });
            const data = await response.json();

            if (response.ok) {
                setBookingData(data.booking);
                setVerifyAllMode(false);
                setVerifySuccess(`✅ All ${data.booking.members.length} members verified successfully!`);
                setTimeout(() => setVerifySuccess(''), 5000);
            } else {
                alert(data.error || 'Verification failed');
            }
        } catch (err) {
            alert('Server error during verification');
        }
    };

    const handleWalkinSubmit = async (e) => {
        e.preventDefault();
        setWalkinLoading(true);
        setWalkinSuccess('');

        try {
            const response = await fetch(`${API_BASE}/api/bookings/walkin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(walkinForm)
            });
            const data = await response.json();

            if (response.ok) {
                setWalkinSuccess(`Registration Successful! Booking ID: ${data.booking.bookingId}`);
                setWalkinForm({
                    name: '',
                    age: '',
                    gender: 'Male',
                    disability: 'None',
                    email: '',
                    mobile: '',
                    aadhaar_full: '',
                    cardId: ''
                });
            } else {
                alert(data.error || 'Registration failed');
            }
        } catch (err) {
            alert('Server error during registration');
        } finally {
            setWalkinLoading(false);
        }
    };

    // Filter userList client-side based on search query
    const filteredUserList = userList.filter(user => {
        const lowerQ = searchQuery.toLowerCase();
        return (
            user.bookingId?.toLowerCase().includes(lowerQ) ||
            user.members?.[0]?.name?.toLowerCase().includes(lowerQ)
        );
    });

    const currentDate = new Date().toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    });

    // Count verified/unverified members
    const verifiedCount = bookingData?.members?.filter(m => m.cardId).length || 0;
    const totalMembers = bookingData?.members?.length || 0;
    const allVerified = totalMembers > 0 && verifiedCount === totalMembers;

    return (
        <div className="bg-sand text-navy-900 font-sans flex flex-col md:flex-row min-h-screen">

            {/* --- SIDEBAR (Desktop) --- */}
            <aside className="w-64 bg-white border-r border-gray-200 flex-col flex-shrink-0 z-20 h-full fixed md:relative hidden md:flex">
                <div className="p-6">
                    <div className="font-serif font-bold text-navy-900 text-xl">LUMINE</div>
                    <div className="text-[10px] text-orange-700 font-bold tracking-widest uppercase">Counter Staff</div>
                </div>

                <nav className="flex-1 overflow-y-auto px-4 space-y-1 no-scrollbar">
                    <button
                        onClick={() => setActiveTab('verification')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group ${activeTab === 'verification' ? 'bg-navy-900 text-white shadow-lg shadow-navy-900/20' : 'text-gray-500 hover:bg-orange-50 hover:text-orange-700'}`}
                    >
                        <LayoutGrid className={`w-5 h-5 ${activeTab === 'verification' ? '' : 'group-hover:scale-110 transition-transform'}`} />
                        <span>Slot Verification</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('search')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group ${activeTab === 'search' ? 'bg-navy-900 text-white shadow-lg shadow-navy-900/20' : 'text-gray-500 hover:bg-orange-50 hover:text-orange-700'}`}
                    >
                        <Users className={`w-5 h-5 ${activeTab === 'search' ? '' : 'group-hover:scale-110 transition-transform'}`} />
                        <span>Search User</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('walkin')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group ${activeTab === 'walkin' ? 'bg-navy-900 text-white shadow-lg shadow-navy-900/20' : 'text-gray-500 hover:bg-orange-50 hover:text-orange-700'}`}
                    >
                        <UserPlus className={`w-5 h-5 ${activeTab === 'walkin' ? '' : 'group-hover:scale-110 transition-transform'}`} />
                        <span>Walk-in Registration</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all group"
                    >
                        <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* --- MOBILE NAVIGATION STRIP --- */}
            <div className="md:hidden bg-white border-b border-gray-200 p-2 flex items-center justify-around gap-1 sticky top-0 z-30 shadow-xs">
                <button
                    onClick={() => setActiveTab('verification')}
                    className={`flex-1 py-2 px-1 text-[11px] font-bold rounded-lg flex flex-col items-center gap-1 ${activeTab === 'verification' ? 'bg-navy-900 text-white' : 'text-gray-600'}`}
                >
                    <LayoutGrid className="w-4 h-4" />
                    <span>Verify</span>
                </button>
                <button
                    onClick={() => setActiveTab('search')}
                    className={`flex-1 py-2 px-1 text-[11px] font-bold rounded-lg flex flex-col items-center gap-1 ${activeTab === 'search' ? 'bg-navy-900 text-white' : 'text-gray-600'}`}
                >
                    <Users className="w-4 h-4" />
                    <span>Search</span>
                </button>
                <button
                    onClick={() => setActiveTab('walkin')}
                    className={`flex-1 py-2 px-1 text-[11px] font-bold rounded-lg flex flex-col items-center gap-1 ${activeTab === 'walkin' ? 'bg-navy-900 text-white' : 'text-gray-600'}`}
                >
                    <UserPlus className="w-4 h-4" />
                    <span>Walk-in</span>
                </button>
                <button
                    onClick={logout}
                    className="p-2 text-red-600 rounded-lg"
                    aria-label="Logout"
                >
                    <LogOut className="w-4 h-4" />
                </button>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="flex-1 flex flex-col relative w-full">

                {/* --- HEADER --- */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-4 md:px-8 flex-shrink-0 z-10 sticky top-0">
                    <div>
                        <h2 className="font-serif text-2xl font-bold text-navy-800">Counter Dashboard</h2>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right hidden md:block">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Today</p>
                            <p className="text-sm font-semibold text-orange-600">{currentDate}</p>
                        </div>
                        <div className="w-px h-8 bg-gray-200 hidden md:block"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm font-bold text-navy-800 leading-none">Counter Staff</p>
                                <p className="text-[10px] text-gray-500">Active</p>
                            </div>
                            <div className="w-10 h-10 bg-navy-900 text-white rounded-full flex items-center justify-center font-serif font-bold shadow-lg shadow-navy-900/20">
                                C
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-3 sm:p-6 md:p-8 overflow-y-auto">

                    {/* Welcome Section */}
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-xl sm:text-2xl font-bold text-navy-900 font-serif">
                            Namaste!
                        </h1>
                        <p className="text-gray-500 text-xs sm:text-sm mt-1">
                            {activeTab === 'verification' ? 'Verify incoming devotees details.' :
                                activeTab === 'walkin' ? 'Register new walk-in devotees.' :
                                    'Search and manage existing bookings.'}
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xs border border-gray-100 p-3 sm:p-6 min-h-[500px]">

                        {/* --- SEARCH USER CONTENT --- */}
                        {activeTab === 'search' && (
                            <div className="space-y-6">
                                {/* Search & Filter Controls */}
                                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                                    {/* Filters - Scrollable on mobile */}
                                    <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto no-scrollbar shrink-0">
                                        <button
                                            onClick={() => setSearchFilter('all')}
                                            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all shrink-0 whitespace-nowrap ${searchFilter === 'all' ? 'bg-white text-navy-900 shadow-xs' : 'text-gray-500 hover:text-navy-900'}`}
                                        >
                                            All Users
                                        </button>
                                        <button
                                            onClick={() => setSearchFilter('online')}
                                            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all shrink-0 whitespace-nowrap ${searchFilter === 'online' ? 'bg-white text-navy-900 shadow-xs' : 'text-gray-500 hover:text-navy-900'}`}
                                        >
                                            Slot Booking Used
                                        </button>
                                        <button
                                            onClick={() => setSearchFilter('walkin')}
                                            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all shrink-0 whitespace-nowrap ${searchFilter === 'walkin' ? 'bg-white text-navy-900 shadow-xs' : 'text-gray-500 hover:text-navy-900'}`}
                                        >
                                            Counter Register Users
                                        </button>
                                    </div>

                                    {/* Search Bar */}
                                    <div className="relative w-full md:w-64">
                                        <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Search by ID or Name..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-navy-900 outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Results Table - Overflow scrollable for mobile */}
                                <div className="border border-gray-200 rounded-2xl overflow-x-auto no-scrollbar shadow-xs">
                                    <table className="w-full text-left min-w-[550px]">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-4 sm:px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Booking ID</th>
                                                <th className="px-4 sm:px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Name</th>
                                                <th className="px-4 sm:px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Type</th>
                                                <th className="px-4 sm:px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Date / Time</th>
                                                <th className="px-4 sm:px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right whitespace-nowrap">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {loadingUsers ? (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading data...</td>
                                                </tr>
                                            ) : filteredUserList.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No records found.</td>
                                                </tr>
                                            ) : (
                                                filteredUserList.map((user) => (
                                                    <tr key={user.bookingId} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm font-mono font-bold text-navy-900 whitespace-nowrap">
                                                            {user.bookingId}
                                                        </td>
                                                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-800 font-medium whitespace-nowrap">
                                                            {user.members?.[0]?.name || 'N/A'}
                                                        </td>
                                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide inline-block whitespace-nowrap ${user.timeSlot === 'WALK-IN'
                                                                    ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                                                    : 'bg-orange-50 text-orange-700 border border-orange-100'
                                                                }`}>
                                                                {user.timeSlot === 'WALK-IN' ? 'Counter / Walk-in' : 'Online Slot'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                                                            {user.date} <span className="text-gray-300 mx-1">|</span> {user.timeSlot}
                                                        </td>
                                                        <td className="px-4 sm:px-6 py-4 text-right whitespace-nowrap">
                                                            <button
                                                                onClick={() => {
                                                                    setBookingId(user.bookingId);
                                                                    setActiveTab('verification');
                                                                    setTimeout(() => handleSearchBooking(user.bookingId), 100);
                                                                }}
                                                                className="text-navy-900 font-bold text-xs hover:underline bg-gray-100 hover:bg-navy-900 hover:text-white px-3 py-1.5 rounded-lg transition-all"
                                                            >
                                                                View Details
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* --- SLOT VERIFICATION CONTENT --- */}
                        {activeTab === 'verification' && (
                            <div className="space-y-6 max-w-4xl mx-auto">

                                {/* Search bar with helper text */}
                                <div>
                                    <div className="flex gap-4">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                                            <input
                                                type="text"
                                                placeholder="Enter Booking ID, Aadhaar No., or Scan QR Code"
                                                value={bookingId}
                                                onChange={(e) => setBookingId(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') handleSearchBooking(); }}
                                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-navy-900 focus:border-transparent outline-none transition-all"
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleSearchBooking()}
                                            disabled={verifyLoading}
                                            className="px-8 py-3 bg-navy-900 text-white rounded-xl hover:bg-navy-800 transition-colors disabled:opacity-50 font-medium shadow-lg shadow-navy-900/20"
                                        >
                                            {verifyLoading ? 'Searching...' : 'Search'}
                                        </button>
                                    </div>
                                    <div className="mt-2 flex items-center gap-4 text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                                        <span className="flex items-center gap-1"><QrCode className="w-3 h-3" /> Scan QR</span>
                                        <span className="text-gray-200">|</span>
                                        <span>Enter Booking ID (BK-XXXXXX)</span>
                                        <span className="text-gray-200">|</span>
                                        <span>Enter 12-digit Aadhaar</span>
                                    </div>
                                </div>

                                {/* Error message */}
                                {verifyError && (
                                    <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center space-x-2 border border-red-100">
                                        <AlertCircle className="w-5 h-5" />
                                        <span>{verifyError}</span>
                                    </div>
                                )}

                                {/* Success message */}
                                {verifySuccess && (
                                    <div className="p-4 bg-green-50 text-green-700 rounded-xl flex items-center space-x-2 border border-green-200 animate-fade-in">
                                        <CheckCircle className="w-5 h-5" />
                                        <span className="font-bold">{verifySuccess}</span>
                                    </div>
                                )}

                                {bookingData && (
                                    <div className="animate-fade-in-up space-y-6">
                                        {/* Booking Info Header */}
                                        <div className="p-6 bg-orange-50 rounded-2xl border border-orange-100 flex justify-between items-center">
                                            <div>
                                                <h3 className="text-lg font-bold text-navy-900">{bookingData.temple}</h3>
                                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {bookingData.date}</span>
                                                    <span>•</span>
                                                    <span>{bookingData.timeSlot}</span>
                                                </div>
                                                <p className="text-xs font-mono text-gray-500 mt-1">Booking: <strong>{bookingData.bookingId}</strong></p>
                                            </div>
                                            <div className="text-right">
                                                {allVerified ? (
                                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                                        <CheckCheck className="w-4 h-4" /> All Verified
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase tracking-wider">
                                                        {verifiedCount}/{totalMembers} Verified
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Verify All Button */}
                                        {!allVerified && totalMembers > 1 && (
                                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3">
                                                <div className="flex items-center gap-3">
                                                    <ShieldCheck className="w-6 h-6 text-blue-600" />
                                                    <div>
                                                        <p className="font-bold text-blue-900 text-sm">Quick Group Verification</p>
                                                        <p className="text-xs text-blue-600">Verify one member's Aadhaar to confirm the entire group ({totalMembers} members)</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setVerifyAllMode(true)}
                                                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 flex items-center gap-2 flex-shrink-0"
                                                >
                                                    <CheckCheck className="w-4 h-4" />
                                                    Verify All Members
                                                </button>
                                            </div>
                                        )}

                                        {/* Members List */}
                                        <h3 className="text-lg font-bold text-navy-900">Members ({totalMembers})</h3>
                                        <div className="grid gap-4">
                                            {bookingData.members.map((member, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:border-gray-300 transition-all bg-white shadow-sm">
                                                    <div className="flex items-center space-x-4">
                                                        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${member.cardId ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                                            {member.cardId ? <CheckCircle className="w-6 h-6" /> : <User className="w-6 h-6" />}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-navy-900">{member.name}
                                                                {idx === 0 && <span className="ml-2 text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-bold uppercase">Primary</span>}
                                                            </p>
                                                            <div className="text-sm text-gray-500 flex flex-wrap gap-x-3 gap-y-1">
                                                                <span>{member.age} Y • {member.gender}</span>
                                                                <span className="text-gray-300">|</span>
                                                                <span>Aadhaar: {member.aadhaar_mask || 'N/A'}</span>
                                                                {member.mobile && (
                                                                    <>
                                                                        <span className="text-gray-300">|</span>
                                                                        <span>📱 {member.mobile}</span>
                                                                    </>
                                                                )}
                                                                {member.email && (
                                                                    <>
                                                                        <span className="text-gray-300">|</span>
                                                                        <span>✉ {member.email}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center space-x-4 flex-shrink-0">
                                                        {member.cardId ? (
                                                            <div className="text-right px-4 py-2 bg-green-50 rounded-xl border border-green-100">
                                                                <span className="block text-[10px] text-green-600 uppercase font-bold tracking-wider">Verified ✓</span>
                                                                <span className="text-green-700 font-mono font-bold text-sm">{member.cardId}</span>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => setVerifyingMember(member)}
                                                                className="px-5 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-medium hover:bg-navy-800 transition-colors shadow-lg shadow-navy-900/10"
                                                            >
                                                                Verify & Assign
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* --- WALK-IN REGISTRATION CONTENT --- */}
                        {activeTab === 'walkin' && (
                            <div className="max-w-3xl mx-auto">
                                {walkinSuccess && (
                                    <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl flex items-center space-x-2 border border-green-200">
                                        <CheckCircle className="w-5 h-5" />
                                        <span>{walkinSuccess}</span>
                                    </div>
                                )}

                                <form onSubmit={handleWalkinSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-navy-900">Full Name</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-navy-900 outline-none transition-all"
                                            value={walkinForm.name}
                                            onChange={e => setWalkinForm({ ...walkinForm, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-navy-900">Age</label>
                                            <input
                                                required
                                                type="number"
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-navy-900 outline-none transition-all"
                                                value={walkinForm.age}
                                                onChange={e => setWalkinForm({ ...walkinForm, age: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-navy-900">Gender</label>
                                            <select
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-navy-900 outline-none transition-all cursor-pointer bg-white"
                                                value={walkinForm.gender}
                                                onChange={e => setWalkinForm({ ...walkinForm, gender: e.target.value })}
                                            >
                                                <option>Male</option>
                                                <option>Female</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-navy-900">Mobile Number</label>
                                        <input
                                            required
                                            type="tel"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-navy-900 outline-none transition-all"
                                            value={walkinForm.mobile}
                                            onChange={e => setWalkinForm({ ...walkinForm, mobile: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-navy-900">Email ID (Optional)</label>
                                        <input
                                            type="email"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-navy-900 outline-none transition-all"
                                            value={walkinForm.email}
                                            onChange={e => setWalkinForm({ ...walkinForm, email: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-navy-900">Disability / Special Needs</label>
                                        <select
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-navy-900 outline-none transition-all cursor-pointer bg-white"
                                            value={walkinForm.disability}
                                            onChange={e => setWalkinForm({ ...walkinForm, disability: e.target.value })}
                                        >
                                            <option>None</option>
                                            <option>Wheelchair Required</option>
                                            <option>Visually Impaired</option>
                                            <option>Senior Citizen</option>
                                            <option>Other</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-navy-900">Aadhaar Number (Full)</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-navy-900 outline-none transition-all"
                                            value={walkinForm.aadhaar_full}
                                            onChange={e => setWalkinForm({ ...walkinForm, aadhaar_full: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-bold text-navy-900">Assign Card ID</label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <CreditCard className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                                                <input
                                                    required
                                                    type="text"
                                                    placeholder="Scan Card or Enter ID"
                                                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-navy-900 outline-none font-mono"
                                                    value={walkinForm.cardId}
                                                    onChange={e => setWalkinForm({ ...walkinForm, cardId: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Tap the RFID card to autofill.</p>
                                    </div>

                                    <div className="md:col-span-2 pt-4">
                                        <button
                                            type="submit"
                                            disabled={walkinLoading}
                                            className="w-full bg-navy-900 text-white py-4 rounded-xl font-bold hover:bg-navy-800 transition-colors shadow-lg shadow-navy-900/20 disabled:opacity-50 text-lg"
                                        >
                                            {walkinLoading ? 'Registering...' : 'Complete Registration'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* --- Single Member Verification Modal --- */}
            {verifyingMember && !verifyAllMode && (
                <div className="fixed inset-0 bg-navy-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-scale-in">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-bold font-serif text-navy-900">Verify Member</h3>
                            <button onClick={() => setVerifyingMember(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                <p className="text-xs text-orange-700 uppercase font-bold tracking-widest mb-1">Authenticating</p>
                                <p className="text-lg font-bold text-navy-900">{verifyingMember.name}</p>
                                {verifyingMember.aadhaar_mask && (
                                    <p className="text-sm text-gray-600 font-mono mt-1">Aadhaar: {verifyingMember.aadhaar_mask}</p>
                                )}
                            </div>

                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.target);
                                handleVerifyMember(
                                    formData.get('aadhaar'),
                                    formData.get('cardId')
                                );
                            }}>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-navy-900">Verify Aadhaar Number</label>
                                        <input
                                            name="aadhaar"
                                            required
                                            defaultValue={verifyingMember.aadhaar_full || ''}
                                            type="text"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-navy-900 outline-none transition-all"
                                            placeholder="Enter full Aadhaar to verify"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-navy-900">Assign Card ID</label>
                                        <div className="relative">
                                            <CreditCard className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                                            <input
                                                name="cardId"
                                                required
                                                type="text"
                                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-navy-900 outline-none font-mono"
                                                placeholder="Scan Card"
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full mt-8 bg-navy-900 text-white py-4 rounded-xl font-bold hover:bg-navy-800 transition-colors shadow-lg shadow-navy-900/20"
                                >
                                    Confirm & Assign Card
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Verify ALL Members Modal --- */}
            {verifyAllMode && (
                <div className="fixed inset-0 bg-navy-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-scale-in">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold font-serif text-navy-900">Verify All Members</h3>
                            <button onClick={() => setVerifyAllMode(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Show all members that will be verified */}
                            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                                <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-3">
                                    {totalMembers} Members Will Be Verified
                                </p>
                                <div className="space-y-2">
                                    {bookingData?.members?.map((m, idx) => (
                                        <div key={idx} className="flex items-center gap-3 text-sm">
                                            <span className="w-6 h-6 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                                            <span className="font-medium text-navy-900">{m.name}</span>
                                            <span className="text-gray-400 text-xs">{m.age}Y • {m.gender}</span>
                                            {m.cardId && <span className="text-green-600 text-xs font-bold">(Already Verified)</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                <p className="text-xs text-amber-800"><strong>How it works:</strong> Enter ANY one member's Aadhaar number to verify the entire group at once. All {totalMembers} members will be marked as verified.</p>
                            </div>

                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.target);
                                handleVerifyAll(
                                    formData.get('aadhaar'),
                                    formData.get('cardId')
                                );
                            }}>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-navy-900">Any Member's Aadhaar Number</label>
                                        <input
                                            name="aadhaar"
                                            required
                                            type="text"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            placeholder="Enter 12-digit Aadhaar of any member"
                                            autoFocus
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-navy-900">Primary Card ID (Optional)</label>
                                        <div className="relative">
                                            <CreditCard className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                                            <input
                                                name="cardId"
                                                type="text"
                                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                                placeholder="Scan primary card (optional)"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full mt-8 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                                >
                                    <CheckCheck className="w-5 h-5" />
                                    Verify All {totalMembers} Members
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CounterDashboard;
