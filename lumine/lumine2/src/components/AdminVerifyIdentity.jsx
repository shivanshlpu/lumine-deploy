import React, { useState } from 'react';
import { DeviceMobile, IdentificationCard, ArrowRight, XCircle } from '@phosphor-icons/react';
import { useTranslation } from '../context/LanguageContext';

const AdminVerifyIdentity = ({ onVerificationSuccess, onBackToLogin, adminEmail }) => {
    const { t } = useTranslation();
    const [method, setMethod] = useState(null); // 'mobile' | 'aadhaar'
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/admin/verify-identity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: adminEmail,
                    identifier: method,
                    value: inputValue.trim()
                })
            });

            const data = await response.json();

            if (data.success) {
                onVerificationSuccess(data);
            } else {
                setError(data.error || 'Verification Failed');
            }
        } catch (err) {
            setError('Server Error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-white rounded-2xl shadow-xl border border-gray-100 animate-fade-in-up">
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Verify Identity</h2>
            <p className="text-sm text-gray-500 mb-8">
                Please verify your identity using your registered Mobile or Aadhaar number associated with this Admin account.
            </p>

            {!method ? (
                <div className="space-y-4">
                    <button
                        onClick={() => setMethod('mobile')}
                        className="w-full p-4 flex items-center justify-between border rounded-xl hover:border-saffron-500 hover:bg-saffron-50 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white text-gray-600 group-hover:text-saffron-600">
                                <DeviceMobile size={24} weight="duotone" />
                            </div>
                            <span className="font-semibold text-gray-700">Verify via Mobile</span>
                        </div>
                        <ArrowRight size={20} className="text-gray-400 group-hover:text-saffron-600" />
                    </button>

                    <button
                        onClick={() => setMethod('aadhaar')}
                        className="w-full p-4 flex items-center justify-between border rounded-xl hover:border-saffron-500 hover:bg-saffron-50 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white text-gray-600 group-hover:text-saffron-600">
                                <IdentificationCard size={24} weight="duotone" />
                            </div>
                            <span className="font-semibold text-gray-700">Verify via Aadhaar</span>
                        </div>
                        <ArrowRight size={20} className="text-gray-400 group-hover:text-saffron-600" />
                    </button>

                    <button
                        onClick={onBackToLogin}
                        className="w-full text-center text-sm text-gray-400 hover:text-gray-600 mt-4"
                    >
                        Cancel
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                            {method === 'mobile' ? 'Enter Mobile Number' : 'Enter Aadhaar Number'}
                        </label>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="block w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 outline-none transition-all"
                            placeholder={method === 'mobile' ? 'e.g. 9876543210' : 'e.g. 1234 5678 9012'}
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                            <XCircle size={20} weight="fill" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => { setMethod(null); setInputValue(''); setError(''); }}
                            className="flex-1 py-3 px-4 border border-gray-200 rounded-lg font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !inputValue}
                            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-white transition-transform transform active:scale-95 ${isLoading ? 'bg-gray-400' : 'bg-saffron-600 hover:bg-saffron-700 shadow-lg shadow-saffron-200'}`}
                        >
                            {isLoading ? 'Verifying...' : 'Verify Schema Hash'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default AdminVerifyIdentity;
