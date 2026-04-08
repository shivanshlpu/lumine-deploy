import React from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';

const FormNav = ({ currentStep, totalSteps, onNext, onPrev, onSubmit, isSubmitting }) => {
    return (
        <div
            className="p-6 bg-white border-t border-gray-100 flex justify-between items-center z-10"
            id="formNav"
        >
            <button
                type="button"
                id="prevBtn"
                onClick={onPrev}
                className={`px-5 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 font-semibold transition ${currentStep === 1 ? 'hidden' : ''
                    }`}
            >
                Back
            </button>
            <div className="flex-grow"></div>

            {currentStep < totalSteps ? (
                <button
                    type="button"
                    id="nextBtn"
                    onClick={onNext}
                    className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-700 shadow-lg shadow-orange-200 transition flex items-center gap-2"
                >
                    Next Step <ArrowRight className="w-4 h-4" />
                </button>
            ) : (
                <button
                    type="button"
                    id="submitBtn"
                    onClick={onSubmit}
                    disabled={isSubmitting}
                    className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200 transition flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Processing...' : 'Confirm Booking'}{' '}
                    {!isSubmitting && <CheckCircle className="w-4 h-4" />}
                </button>
            )}
        </div>
    );
};

export default FormNav;
