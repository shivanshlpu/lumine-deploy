import React, { useState, useEffect } from 'react';
import { User, LockKey, Eye, EyeSlash, WarningCircle, CheckCircle } from '@phosphor-icons/react';
import { useTranslation } from '../context/LanguageContext';
import { ROLES } from '../constants/roles';
import RoleSelector from './RoleSelector';
import LoadingOverlay from './LoadingOverlay';

const LoginCard = ({ currentRole, onRoleChange, onLogin, isLoading, globalError, onForgotPassword, onRegister }) => {
    const { t, language } = useTranslation();
    const roleData = ROLES[currentRole];

    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);


    const [errors, setErrors] = useState({ userId: '', password: '' });
    const [isShaking, setIsShaking] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setUserId('');
            setPassword('');
            setErrors({ userId: '', password: '' });
            setIsSuccess(false);
        }, 0);
        return () => clearTimeout(timer);
    }, [currentRole]);

    useEffect(() => {
        if (globalError) {
            const startTimer = setTimeout(() => setIsShaking(true), 50);
            const endTimer = setTimeout(() => setIsShaking(false), 550);
            return () => {
                clearTimeout(startTimer);
                clearTimeout(endTimer);
            };
        }
    }, [globalError]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        let newErrors = {};
        let isValid = true;

        if (!userId.trim()) {
            newErrors.userId = language === 'en' ? "User ID is required." : "यूज़र आईडी आवश्यक है।";
            isValid = false;
        }

        if (!password || password.length < 8) {
            newErrors.password = language === 'en' ? "Password must be at least 8 chars." : "पासवर्ड कम से कम 8 अक्षर का होना चाहिए।";
            isValid = false;
        }

        setErrors(newErrors);

        if (!isValid) return;

        if (!isValid) return;

        const success = await onLogin({ userId, password, role: currentRole });
        if (success) {
            setIsSuccess(true);
        }
    };

    return (
        <div className={`bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative ${isShaking ? 'animate-shake' : ''}`}>
            <LoadingOverlay isVisible={isLoading} />

            <RoleSelector currentRole={currentRole} onRoleChange={onRoleChange} />

            <div className="p-6 md:p-8 pt-4">
                <div className="mb-6">
                    <h2 className="text-2xl font-serif font-bold text-gray-900" data-key="signIn">{t('signIn')}</h2>
                    <p className="text-sm text-gray-500 mt-1 transition-opacity duration-300">
                        {roleData[language].helper}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <div className="space-y-1">
                        <label htmlFor="userId" className="block text-xs font-semibold text-gray-700 uppercase tracking-wide" data-key="labelUserId">{t('labelUserId')}</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <User className="text-lg" />
                            </div>
                            <input
                                type="text"
                                id="userId"
                                value={userId}
                                onChange={(e) => { setUserId(e.target.value); setErrors({ ...errors, userId: '' }); }}
                                className={`block w-full pl-10 pr-3 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:ring-saffron-500 focus:border-saffron-500 sm:text-sm transition-colors ${errors.userId ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                                placeholder={roleData[language].placeholder}
                            />
                        </div>
                        {errors.userId && <p className="text-red-500 text-xs" id="userIdError">{errors.userId}</p>}
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="password" className="block text-xs font-semibold text-gray-700 uppercase tracking-wide" data-key="labelPassword">{t('labelPassword')}</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <LockKey className="text-lg" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: '' }); }}
                                className={`block w-full pl-10 pr-10 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:ring-saffron-500 focus:border-saffron-500 sm:text-sm transition-colors ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                                {showPassword ? <EyeSlash className="text-lg" /> : <Eye className="text-lg text-saffron-600" />}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs" id="passwordError">{errors.password}</p>}
                    </div>

                    <div className="flex items-center justify-between">

                        <div className="text-sm">
                            <button type="button" onClick={onForgotPassword} className="font-medium text-saffron-600 hover:text-saffron-500 hover:underline" data-key="forgotPass">{t('forgotPass')}</button>
                        </div>
                    </div>

                    {globalError && (
                        <div id="globalError" className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                            <WarningCircle weight="fill" className="text-lg" />
                            <span id="globalErrorText">{globalError}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-saffron-500 transition-transform transform active:scale-95 ${isSuccess ? 'bg-green-600' : 'bg-saffron-600 hover:bg-saffron-700'}`}
                        data-key="loginBtn"
                    >
                        {isSuccess ? (
                            <>
                                <CheckCircle weight="bold" className="animate-bounce mr-2 text-lg" /> Success
                            </>
                        ) : (
                            t('loginBtn')
                        )}
                    </button>
                </form>
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-500">
                    <span data-key="newHere">{t('newHere')}</span>{' '}
                    <button onClick={onRegister} className="font-medium text-saffron-600 hover:text-saffron-500" data-key="registerLink">
                        {currentRole === 'mandir_admin' ? 'Register as Admin' : 
                         currentRole === 'security_guard' ? 'Register as Guard' :
                         currentRole === 'counter' ? 'Register as Counter Staff' :
                         currentRole === 'parking' ? 'Register as Parking Staff' : 
                         t('registerLink')}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default LoginCard;
