import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useTranslation } from '../context/LanguageContext';
import { Menu } from 'lucide-react';

const Support = () => {
    useTranslation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Query submitted successfully! We will contact you shortly.');
        setFormData({ name: '', email: '', message: '' });
    };

    return (
        <div className="bg-sand text-navy-900 font-sans flex min-h-screen relative">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-w-0 relative">
                <header className="h-16 sm:h-20 bg-white/90 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 flex-shrink-0 z-10 sticky top-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
                            aria-label="Open menu"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className="font-serif text-lg sm:text-2xl font-bold text-navy-800 truncate">Support & Helpdesk</h2>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* Left Column: Contact & Notice Board */}
                        <div className="space-y-8">

                            {/* Contact Card */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-bl-full -mr-16 -mt-16 opacity-50"></div>
                                <h3 className="text-xl font-bold font-serif text-navy-900 mb-4 flex items-center gap-2">
                                    <i className="ph-fill ph-phone-call text-orange-600 text-2xl"></i>
                                    24x7 Admin Support
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    For any emergency or immediate assistance, please contact our dedicated support line.
                                </p>
                                <div className="bg-navy-50 rounded-xl p-6 text-center border border-navy-100">
                                    <p className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-1">Helpline Number</p>
                                    <a href="tel:9009149694" className="text-3xl font-bold text-orange-600 hover:text-orange-700 transition-colors font-mono">
                                        9009149694
                                    </a>
                                </div>
                            </div>


                        </div>

                        {/* Right Column: Query Form */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 h-fit">
                            <h3 className="text-xl font-bold font-serif text-navy-900 mb-2">Submit a Query</h3>
                            <p className="text-gray-500 mb-6 text-sm">Have a question? Fill out the form below and we'll get back to you.</p>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                        placeholder="Enter your name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                        placeholder="Enter your email"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Message / Query</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows="5"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none"
                                        placeholder="Type your message here..."
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 bg-navy-900 text-white font-bold rounded-lg hover:bg-navy-800 transition-colors shadow-lg shadow-navy-900/20"
                                >
                                    Submit Query
                                </button>
                            </form>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default Support;
