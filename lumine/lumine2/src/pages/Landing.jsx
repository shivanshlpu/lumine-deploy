import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import LoginCard from '../components/LoginCard';
import ForgotPassword from '../components/ForgotPassword';
import Registration from '../components/Registration';
import AdminVerifyIdentity from '../components/AdminVerifyIdentity';
import AdminRegistration from '../components/AdminRegistration';
import StaffRegistration from '../components/StaffRegistration';
import { useTranslation } from '../context/LanguageContext';

const Landing = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [currentRole, setCurrentRole] = useState('devotee');
    const [isLoading, setIsLoading] = useState(false);
    const [globalError, setGlobalError] = useState('');
    const [view, setView] = useState('login'); // 'login', 'forgotPassword', 'register', 'adminVerify'
    const [tempAdminEmail, setTempAdminEmail] = useState(''); // Store email for 2FA

    const handleLogin = async ({ userId, password, role }) => {
        setIsLoading(true);
        setGlobalError('');

        try {
            const uidLower = userId.toLowerCase().trim();

            // Guard Role Mismatch Check
            if (uidLower === 'guard' && role !== 'security_guard') {
                throw new Error("Access Denied: 'guard' credentials belong to Security Guard role. Please select the Security Guard tab.");
            }
            // Parking Role Mismatch Check
            if (uidLower === 'parking' && role !== 'parking') {
                throw new Error("Access Denied: 'parking' credentials belong to Parking Staff role. Please select the Parking Staff tab.");
            }
            // Counter Role Mismatch Check
            if (uidLower === 'counter' && role !== 'counter') {
                throw new Error("Access Denied: 'counter' credentials belong to Counter Staff role. Please select the Counter Staff tab.");
            }
            // Admin Role Mismatch Check
            if (uidLower === 'admin' && role !== 'mandir_admin') {
                throw new Error("Access Denied: 'admin' credentials belong to Mandir Admin role. Please select the Mandir Admin tab.");
            }

            // Mock Admin Login Success
            if (role === 'mandir_admin' && uidLower === 'admin' && password === 'admin123') {
                await new Promise(resolve => setTimeout(resolve, 800));
                setTempAdminEmail('admin@lumine.com');
                setView('adminVerify');
                setIsLoading(false);
                return;
            }

            // Mock Guard Login
            if (role === 'security_guard' && uidLower === 'guard' && (password === 'shivansh' || password === 'SHIVANSH')) {
                await new Promise(resolve => setTimeout(resolve, 800));
                handleSuccess({ token: 'mock-guard-token', redirectUrl: '/guard/dashboard', role: 'security_guard' });
                return;
            }

            // Mock Parking Login
            if (role === 'parking' && uidLower === 'parking' && (password === 'shivansh' || password === 'SHIVANSH')) {
                await new Promise(resolve => setTimeout(resolve, 800));
                handleSuccess({ token: 'mock-parking-token', redirectUrl: '/parking/dashboard', role: 'parking' });
                return;
            }

            // Mock Counter Login
            if (role === 'counter' && uidLower === 'counter' && (password === 'shivansh' || password === 'SHIVANSH')) {
                await new Promise(resolve => setTimeout(resolve, 800));
                handleSuccess({ token: 'mock-counter-token', redirectUrl: '/counter/dashboard', role: 'counter' });
                return;
            }

            // Standard API Login
            const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, password, role })
            });

            const data = await response.json();

            if (response.ok) {
                // If Admin, intercept for 2FA
                if (role === 'mandir_admin') {
                    setTempAdminEmail(data.user?.email || userId); // Assume email comes back or use ID
                    setView('adminVerify');
                } else {
                    handleSuccess(data);
                }
                return true;
            } else {
                throw new Error(data.error || "Invalid Credentials or Server Offline.");
            }

        } catch (error) {
            setGlobalError(error.message || "Invalid Credentials or Server Offline.");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuccess = (data) => {
        sessionStorage.setItem('lumine_token', data.token);
        sessionStorage.setItem('lumine_redirect_url', data.redirectUrl);
        sessionStorage.setItem('lumine_role', data.role || currentRole);

        setTimeout(() => {
            navigate(data.redirectUrl);
        }, 1000);
    };

    return (
        <div className="bg-white font-sans text-gray-800 min-h-screen flex flex-col">

            <main className="flex-grow flex items-center justify-center p-3 sm:p-6 lg:p-8">
                <div className="max-w-[1400px] w-full min-h-[85vh] lg:h-[85vh] grid lg:grid-cols-2 gap-6 lg:gap-8 items-center bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-gray-100">

                    {/* Left Side - Image & Welcome Text */}
                    <div className="relative h-full w-full hidden lg:block overflow-hidden">
                        <img
                            src="/src/assets/somnath-temple.jpg"
                            alt="Somnath Temple"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                        <div className="absolute bottom-12 left-12 right-12 text-white space-y-6 animate-fade-in-up">
                            <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md text-white rounded-full text-sm font-medium border border-white/30">
                                ✨ Jai Shree Ram
                            </span>

                            <h1 className="font-serif text-5xl xl:text-6xl font-bold leading-tight">
                                <span data-key="welcomeMain">{t('welcomeMain')}</span> <br />
                                <span className="text-saffron-400" data-key="welcomeSub">{t('welcomeSub')}</span>
                            </h1>

                            <p className="text-lg text-gray-200 max-w-md">
                                Seva, Darshan & Management — one dashboard for the entire mandir ecosystem.
                            </p>
                        </div>
                    </div>

                    {/* Right Side - Login Form */}
                    <div className="h-full flex flex-col relative bg-white overflow-y-auto">

                        <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-16">
                            <div className="w-full max-w-md space-y-8">

                                {/* Mobile Header */}
                                <div className="lg:hidden text-center mb-8">
                                    <h1 className="font-serif text-3xl font-bold text-gray-900">
                                        <span data-key="welcomeMain">{t('welcomeMain')}</span>
                                    </h1>
                                </div>

                                {view === 'login' ? (
                                    <LoginCard
                                        currentRole={currentRole}
                                        onRoleChange={setCurrentRole}
                                        onLogin={handleLogin}
                                        isLoading={isLoading}
                                        globalError={globalError}

                                        onForgotPassword={() => setView('forgotPassword')}
                                        onRegister={() => setView('register')}
                                    />
                                ) : view === 'forgotPassword' ? (
                                    <ForgotPassword
                                        currentRole={currentRole}
                                        onRoleChange={setCurrentRole}
                                        onBackToLogin={() => setView('login')}
                                    />
                                ) : view === 'adminVerify' ? (
                                    <AdminVerifyIdentity
                                        adminEmail={tempAdminEmail}
                                        onBackToLogin={() => setView('login')}
                                        onVerificationSuccess={(data) => {
                                            handleSuccess({
                                                token: 'verified-admin-token',
                                                redirectUrl: '/admin/dashboard',
                                                role: 'mandir_admin'
                                            });
                                        }}
                                    />
                                ) : (
                                    currentRole === 'mandir_admin' ? (
                                        <AdminRegistration
                                            onBackToLogin={() => setView('login')}
                                            onRegistrationSuccess={() => setView('login')}
                                        />
                                    ) : ['security_guard', 'counter', 'parking'].includes(currentRole) ? (
                                        <StaffRegistration
                                            role={currentRole}
                                            onBackToLogin={() => setView('login')}
                                        />
                                    ) : (
                                        <Registration
                                            role={currentRole}
                                            onBackToLogin={() => setView('login')}
                                            onRegistrationSuccess={() => {
                                                handleSuccess({ 
                                                    token: `mock-devotee-token`, 
                                                    redirectUrl: '/dashboard',
                                                    role: 'devotee' 
                                                });
                                            }}
                                        />
                                    )
                                )}


                            </div>
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Landing;
