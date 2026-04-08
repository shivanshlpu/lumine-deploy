import React from 'react';
import { Check } from 'lucide-react';

const StepWizard = ({ currentStep, totalSteps }) => {
    const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

    return (
        <div className="mb-10 relative px-6">
            <div className="absolute top-5 left-10 right-10 h-1 bg-gray-200 -z-10 rounded-full"></div>
            <div
                id="progressBar"
                className="absolute top-5 left-10 h-1 bg-orange-600 -z-10 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
            ></div>

            <div className="flex justify-between w-full">
                <StepItem step={1} currentStep={currentStep} label="Date & Time" />
                <StepItem step={2} currentStep={currentStep} label="Members" />
                <StepItem step={3} currentStep={currentStep} label="Confirm" />
            </div>
        </div>
    );
};

const StepItem = ({ step, currentStep, label }) => {
    let statusClass = '';
    let content = step;

    if (step < currentStep) {
        statusClass = 'step-completed';
        content = <Check className="w-4 h-4" />;
    } else if (step === currentStep) {
        statusClass = 'step-active';
    }

    return (
        <div className={`step-item ${statusClass} flex flex-col items-center gap-2`}>
            <div className="step-circle w-10 h-10 rounded-full border-4 border-gray-100 bg-white flex items-center justify-center font-bold text-sm text-gray-500 z-10">
                {content}
            </div>
            <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">
                {label}
            </span>
        </div>
    );
};

export default StepWizard;
