import React, { useState } from "react";
import { useTranslation } from "../context/LanguageContext";

function AdminRegistration({ onBackToLogin, onRegistrationSuccess }) {
    const { t, language: currentLang } = useTranslation();
    const [formData, setFormData] = useState({
        fullName: "",
        phoneNumber: "",
        aadhaar: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState({});
    const [globalError, setGlobalError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isShaking, setIsShaking] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = t('nameRequired');
        }

        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = t('phoneRequired');
        } else if (!/^\d{10}$/.test(formData.phoneNumber.trim())) {
            newErrors.phoneNumber = t('phoneInvalid');
        }

        if (!formData.aadhaar.trim()) {
            newErrors.aadhaar = "Aadhaar number is required";
        } else if (!/^\d{12}$/.test(formData.aadhaar.trim())) {
            newErrors.aadhaar = "Invalid Aadhaar number (must be 12 digits)";
        }

        if (!formData.email.trim()) {
            newErrors.email = t('emailRequired');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            newErrors.email = t('invalidEmail');
        }

        if (!formData.password || formData.password.length < 8) {
            const errPass =
                currentLang === "en"
                    ? "Password must be at least 8 characters."
                    : "पासवर्ड कम से कम 8 अक्षर का होना चाहिए।";
            newErrors.password = errPass;
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = t('passwordMismatch');
        }

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
        setGlobalError("");

        try {
            console.log("Starting Admin registration with Backend Blockchain...");

            // Register via Backend API
            const response = await fetch('http://localhost:5000/api/auth/admin/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fullName: formData.fullName.trim(),
                    email: formData.email.trim(),
                    password: formData.password,
                    phoneNumber: formData.phoneNumber.trim(),
                    aadhaar: formData.aadhaar.trim()
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Registration failed");
            }

            console.log("Registration successful:", result);


            // Save user data to localStorage
            localStorage.setItem("lumine_user", JSON.stringify(result.user));
            localStorage.setItem("lumine_just_registered", "true");

            // Show success briefly then redirect
            setIsLoading(false);
            setRegistrationSuccess(true);

            // Redirect after 1 second
            setTimeout(() => {
                console.log("Redirecting...");
                if (onRegistrationSuccess) {
                    onRegistrationSuccess();
                } else {
                    window.location.reload();
                }
            }, 1000);
        } catch (error) {
            console.error("Registration error:", error);
            handleError(error);
            setIsLoading(false);
        }
    };



    const handleError = (error) => {
        const msg = error.message || "Something went wrong. Please try again.";
        setGlobalError(msg);
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
        setGlobalError("");
    };

    if (registrationSuccess) {
        return (
            <div className="w-full max-w-md mx-auto lg:mx-0">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="p-6 md:p-8">
                        <div className="space-y-5">
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                                <i className="ph-fill ph-check-circle text-2xl text-green-600"></i>
                                <div>
                                    <p className="font-semibold text-green-800">
                                        Admin Registration Successful
                                    </p>
                                    <p className="text-sm text-green-700">
                                        Blockchain Hash Generated. Redirecting...
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-4 border-saffron-100 border-t-saffron-600"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="lg:hidden text-center mb-8 space-y-2">
                <h1 className="font-serif text-3xl font-bold text-gray-900">
                    <span className="text-saffron-600">
                        Admin Registration
                    </span>
                </h1>
            </div>
            <div
                className={`bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative transition-colors duration-200 ${isShaking ? "animate-[shake_0.5s_ease-in-out]" : ""
                    }`}
            >
                {isLoading && !registrationSuccess && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-saffron-100 border-t-saffron-600"></div>
                        <p className="mt-3 text-sm text-saffron-800 font-medium animate-pulse">
                            Generating Blockchain Hash...
                        </p>
                    </div>
                )}

                <div className="p-6 md:p-8 pt-4">
                    <div className="mb-6">
                        <button
                            onClick={onBackToLogin}
                            className="mb-4 flex items-center gap-2 text-sm text-saffron-600 hover:text-saffron-700 font-medium transition-colors"
                        >
                            <i className="ph ph-arrow-left text-lg"></i>
                            <span>Back to Admin Login</span>
                        </button>
                        <h2 className="text-2xl font-serif font-bold text-gray-900">
                            Register as Admin
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Create your secure admin account
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        <div className="space-y-1">
                            <label
                                htmlFor="fullName"
                                className="block text-xs font-semibold text-gray-700 uppercase tracking-wide"
                            >
                                {t('fullName')}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <i className="ph ph-user text-lg"></i>
                                </div>
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:ring-saffron-500 focus:border-saffron-500 sm:text-sm transition-colors ${errors.fullName
                                        ? "border-red-500 focus:ring-red-500"
                                        : "border-gray-300"
                                        }`}
                                    placeholder="Enter your full name"
                                />
                            </div>
                            {errors.fullName && (
                                <p className="text-red-500 text-xs">{errors.fullName}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label
                                htmlFor="phoneNumber"
                                className="block text-xs font-semibold text-gray-700 uppercase tracking-wide"
                            >
                                {t('phoneNumber')}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <i className="ph ph-phone text-lg"></i>
                                </div>
                                <input
                                    type="tel"
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    required
                                    maxLength={10}
                                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:ring-saffron-500 focus:border-saffron-500 sm:text-sm transition-colors ${errors.phoneNumber
                                        ? "border-red-500 focus:ring-red-500"
                                        : "border-gray-300"
                                        }`}
                                    placeholder="10-digit phone number"
                                />
                            </div>
                            {errors.phoneNumber && (
                                <p className="text-red-500 text-xs">{errors.phoneNumber}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label
                                htmlFor="aadhaar"
                                className="block text-xs font-semibold text-gray-700 uppercase tracking-wide"
                            >
                                Aadhaar Number
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <i className="ph ph-identification-card text-lg"></i>
                                </div>
                                <input
                                    type="text"
                                    id="aadhaar"
                                    name="aadhaar"
                                    value={formData.aadhaar}
                                    onChange={handleChange}
                                    required
                                    maxLength={12}
                                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:ring-saffron-500 focus:border-saffron-500 sm:text-sm transition-colors ${errors.aadhaar
                                        ? "border-red-500 focus:ring-red-500"
                                        : "border-gray-300"
                                        }`}
                                    placeholder="12-digit Aadhaar number"
                                />
                            </div>
                            {errors.aadhaar && (
                                <p className="text-red-500 text-xs">{errors.aadhaar}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label
                                htmlFor="email"
                                className="block text-xs font-semibold text-gray-700 uppercase tracking-wide"
                            >
                                {t('email')}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <i className="ph ph-envelope text-lg"></i>
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:ring-saffron-500 focus:border-saffron-500 sm:text-sm transition-colors ${errors.email
                                        ? "border-red-500 focus:ring-red-500"
                                        : "border-gray-300"
                                        }`}
                                    placeholder="admin@lumine.com"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-red-500 text-xs">{errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label
                                htmlFor="password"
                                className="block text-xs font-semibold text-gray-700 uppercase tracking-wide"
                            >
                                {t('labelPassword')}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <i className="ph ph-lock-key text-lg"></i>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={8}
                                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:ring-saffron-500 focus:border-saffron-500 sm:text-sm transition-colors ${errors.password
                                        ? "border-red-500 focus:ring-red-500"
                                        : "border-gray-300"
                                        }`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                    <i
                                        className={`ph ${showPassword ? "ph-eye text-saffron-600" : "ph-eye-slash"
                                            } text-lg`}
                                    ></i>
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-xs">{errors.password}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label
                                htmlFor="confirmPassword"
                                className="block text-xs font-semibold text-gray-700 uppercase tracking-wide"
                            >
                                {t('confirmPassword')}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <i className="ph ph-lock-key text-lg"></i>
                                </div>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    minLength={8}
                                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:ring-saffron-500 focus:border-saffron-500 sm:text-sm transition-colors ${errors.confirmPassword
                                        ? "border-red-500 focus:ring-red-500"
                                        : "border-gray-300"
                                        }`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                    <i
                                        className={`ph ${showConfirmPassword
                                            ? "ph-eye text-saffron-600"
                                            : "ph-eye-slash"
                                            } text-lg`}
                                    ></i>
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-xs">{errors.confirmPassword}</p>
                            )}
                        </div>

                        {globalError && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                                <i className="ph-fill ph-warning-circle text-lg"></i>
                                <span>{globalError}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-saffron-600 hover:bg-saffron-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-saffron-500 transition-transform transform active:scale-95"
                        >
                            Complete Admin Registration
                        </button>
                    </form>
                </div>

                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 text-center transition-colors duration-200">
                    <p className="text-xs text-gray-500">
                        <span>Already have an admin account?</span>{" "}
                        <button
                            onClick={onBackToLogin}
                            className="font-medium text-saffron-600 hover:text-saffron-500"
                        >
                            Sign In
                        </button>
                    </p>
                </div>
            </div>

            <div className="mt-6 text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                <i className="ph-fill ph-lock-key"></i>
                <span>Secured by Blockchain Ledger</span>
            </div>
        </div>
    );
}

export default AdminRegistration;

