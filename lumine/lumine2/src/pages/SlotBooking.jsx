import React from 'react';
import useSlotBooking from '../hooks/useSlotBooking';
import HeaderSmall from '../components/slot-booking/HeaderSmall';
import StepWizard from '../components/slot-booking/StepWizard';
import SlotStep from '../components/slot-booking/SlotStep';
import MembersStep from '../components/slot-booking/MembersStep';
import ReviewStep from '../components/slot-booking/ReviewStep';
import SuccessOverlay from '../components/slot-booking/SuccessOverlay';
import FormNav from '../components/slot-booking/FormNav';

const SlotBooking = () => {
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
        <div className="flex flex-col min-h-screen bg-[#fdfbf7] font-sans text-[#012a4a]">
            <HeaderSmall />

            <main className="flex-grow w-full max-w-3xl mx-auto p-4 md:p-8">
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

                    <SuccessOverlay isVisible={showSuccess} />

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
            </main>
        </div>
    );
};

export default SlotBooking;
