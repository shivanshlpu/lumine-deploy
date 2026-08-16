import React from 'react';
import useSlotBooking from '../hooks/useSlotBooking';
import StepWizard from '../components/slot-booking/StepWizard';
import SlotStep from '../components/slot-booking/SlotStep';
import MembersStep from '../components/slot-booking/MembersStep';
import ReviewStep from '../components/slot-booking/ReviewStep';
import SuccessOverlay from '../components/slot-booking/SuccessOverlay';
import FormNav from '../components/slot-booking/FormNav';

/**
 * SlotBooking - Embeddable panel version
 * Renders inside the Dashboard shell (no standalone layout/header)
 */
const SlotBooking = ({ onGoHome }) => {
    const {
        currentStep,
        totalSteps,
        temple,
        date,
        timeSlot,
        members,
        isSubmitting,
        showSuccess,
        handleTempleChange,
        handleDateChange,
        handleTimeChange,
        addMember,
        removeMember,
        updateMember,
        verifyAadhaar,
        nextStep,
        prevStep,
        submitBooking
    } = useSlotBooking();

    return (
        <div className="w-full max-w-3xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-navy-900 font-serif">Slot Booking</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Book your darshan slot with smart crowd predictions
                </p>
            </div>

            <StepWizard currentStep={currentStep} totalSteps={totalSteps} />

            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden min-h-[500px] relative flex flex-col">
                <SlotStep
                    isActive={currentStep === 1}
                    temple={temple}
                    date={date}
                    timeSlot={timeSlot}
                    onTempleChange={handleTempleChange}
                    onDateChange={handleDateChange}
                    onTimeChange={handleTimeChange}
                />

                <MembersStep
                    isActive={currentStep === 2}
                    members={members}
                    onAddMember={addMember}
                    onRemoveMember={removeMember}
                    onUpdateMember={updateMember}
                    onVerifyAadhaar={verifyAadhaar}
                />

                <ReviewStep
                    isActive={currentStep === 3}
                    temple={temple}
                    date={date}
                    timeSlot={timeSlot}
                    memberCount={members.length}
                />

                <SuccessOverlay isVisible={showSuccess} onGoHome={onGoHome} />

                {!showSuccess && (
                    <FormNav
                        currentStep={currentStep}
                        totalSteps={totalSteps}
                        onNext={nextStep}
                        onPrev={prevStep}
                        onSubmit={submitBooking}
                        isSubmitting={isSubmitting}
                    />
                )}
            </div>
        </div>
    );
};

export default SlotBooking;
