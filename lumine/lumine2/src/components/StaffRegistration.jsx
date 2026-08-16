import React, { useState } from "react";
import API_BASE_URL from "../config/api";

function StaffRegistration({ onBackToLogin, role }) {
    const [formData, setFormData] = useState({
        fullName: "",
        phoneNumber: "",
        aadhaar: "",
        userId: "",
        password: ""
    });
    const [errors, setErrors] = useState({});
    const [globalError, setGlobalError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isShaking, setIsShaking] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
        if (!formData.phoneNumber.trim() || !/^\d{10}$/.test(formData.phoneNumber.trim())) {
            newErrors.phoneNumber = "Valid 10-digit phone number is required";
        }
        if (!formData.aadhaar.trim()) {
            newErrors.aadhaar = "Aadhaar number or staff ID proof is required";
        }
        if (!formData.userId.trim()) newErrors.userId = "Custom Login ID is required";
        if (!formData.password.trim() || formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGlobalError("");

        if (!validateForm()) {
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
            return;
        }

        setIsLoading(true);

        try {
            const apiUrl = API_BASE_URL;
            const response = await fetch(`${apiUrl}/api/auth/staff/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName: formData.fullName.trim(),
                    phoneNumber: formData.phoneNumber.trim(),
                    aadhaar: formData.aadhaar.trim(),
                    userId: formData.userId.trim(),
                    password: formData.password.trim(),
                    role: role
                }),
            });
            const data = await response.json();
            
            if (!response.ok) throw new Error(data.error || "Registration failed");
            
            setIsSuccess(true);
            setTimeout(() => {
                onBackToLogin();
            }, 2500);
            
        } catch (error) {
            setGlobalError(error.message || "Something went wrong.");
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
        setGlobalError("");
    };

    const roleTitles = {
        'security_guard': 'Security Guard',
        'counter': 'Counter Staff',
        'parking': 'Parking Staff'
    };
    const displayRole = roleTitles[role] || 'Staff';

    if (isSuccess) {
        return (
            <div className="w-full max-w-md mx-auto">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-green-500 p-8 text-center text-white">
                        <i className="ph-fill ph-check-circle text-6xl mb-4"></i>
                        <h2 className="text-2xl font-bold">Registration Successful</h2>
                        <p className="text-sm opacity-90 mt-2">You can now login with your credentials.</p>
                        <p className="text-xs text-green-100 mt-4 animate-pulse">Redirecting to login...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className={`bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative transition-colors duration-200 ${isShaking ? "animate-[shake_0.5s_ease-in-out]" : ""}`}>
                
                {isLoading && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-gray-900"></div>
                        <p className="mt-3 text-sm text-gray-600 font-medium animate-pulse">Generating credentials...</p>
                    </div>
                )}

                <div className="p-6 md:p-8 pt-4">
                    <div className="mb-6">
                        <button onClick={onBackToLogin} className="mb-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
                            <i className="ph ph-arrow-left text-lg"></i>
                            <span>Back to Login</span>
                        </button>
                        <h2 className="text-2xl font-serif font-bold text-gray-900">
                            Register {displayRole}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Create your staff account manually.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        <div className="space-y-1">
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <i className="ph ph-user text-lg"></i>
                                </div>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-colors ${errors.fullName ? "border-red-500" : "border-gray-300"}`}
                                    placeholder="Enter your full name"
                                />
                            </div>
                            {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                Phone Number
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <i className="ph ph-phone text-lg"></i>
                                </div>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    maxLength={10}
                                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-colors ${errors.phoneNumber ? "border-red-500" : "border-gray-300"}`}
                                    placeholder="10-digit phone number"
                                />
                            </div>
                            {errors.phoneNumber && <p className="text-red-500 text-xs">{errors.phoneNumber}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                Aadhaar / Gov ID
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <i className="ph ph-identification-card text-lg"></i>
                                </div>
                                <input
                                    type="text"
                                    name="aadhaar"
                                    value={formData.aadhaar}
                                    onChange={handleChange}
                                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-colors ${errors.aadhaar ? "border-red-500" : "border-gray-300"}`}
                                    placeholder="12-digit Aadhaar number"
                                />
                            </div>
                            {errors.aadhaar && <p className="text-red-500 text-xs">{errors.aadhaar}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                Create Staff ID
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <i className="ph ph-identification-badge text-lg"></i>
                                </div>
                                <input
                                    type="text"
                                    name="userId"
                                    value={formData.userId}
                                    onChange={handleChange}
                                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-colors ${errors.userId ? "border-red-500" : "border-gray-300"}`}
                                    placeholder="Enter custom Login ID"
                                />
                            </div>
                            {errors.userId && <p className="text-red-500 text-xs">{errors.userId}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <i className="ph ph-lock text-lg"></i>
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-colors ${errors.password ? "border-red-500" : "border-gray-300"}`}
                                    placeholder="Create password"
                                />
                            </div>
                            {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
                        </div>

                        {globalError && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                                <i className="ph-fill ph-warning-circle text-lg"></i>
                                <span>{globalError}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-transform transform active:scale-95 mt-4"
                        >
                            Register Identity
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default StaffRegistration;
