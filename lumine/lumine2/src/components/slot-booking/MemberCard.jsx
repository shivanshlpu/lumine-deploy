import React, { useState } from 'react';
import { X, Smartphone, Mail, CreditCard, Loader2, CheckCircle } from 'lucide-react';

const MemberCard = ({ member, index, onRemove, onUpdate, onVerify }) => {
    const [isVerifying, setIsVerifying] = useState(false);

    const handleAadhaarInput = (e) => {
        let val = e.target.value.replace(/[^0-9]/g, '');
        if (val.length > 12) val = val.slice(0, 12);

        onUpdate(member.id, 'aadhaar', val);

        if (val.length === 12 && !member.verified) {
            setIsVerifying(true);
            onVerify(member.id, val).then(() => {
                setIsVerifying(false);
            });
        } else if (val.length < 12 && member.verified) {
            onUpdate(member.id, 'verified', false);
        }
    };

    return (
        <div
            id={`member-${index + 1}`}
            className="member-card border border-gray-200 rounded-xl p-5 bg-gray-50 relative animate-slide-up shadow-sm"
        >
            <div className="absolute -left-2 top-4 bg-navy-900 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full shadow border-2 border-white font-bold">
                {index + 1}
            </div>
            {index > 0 && (
                <button
                    onClick={() => onRemove(member.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                >
                    <X className="w-4 h-4" />
                </button>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pl-2">
                <div className="md:col-span-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">
                        Full Name
                    </label>
                    <input
                        type="text"
                        className="lumine-input member-name"
                        placeholder="Devotee Name"
                        value={member.name}
                        onChange={(e) => onUpdate(member.id, 'name', e.target.value)}
                    />
                </div>
                <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">
                        Age
                    </label>
                    <input
                        type="number"
                        className="lumine-input member-age"
                        placeholder="Age"
                        value={member.age}
                        onChange={(e) => onUpdate(member.id, 'age', e.target.value)}
                    />
                </div>
                <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">
                        Gender
                    </label>
                    <select
                        className="lumine-input member-gender"
                        value={member.gender}
                        onChange={(e) => onUpdate(member.id, 'gender', e.target.value)}
                    >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div className="md:col-span-2 relative">
                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">
                        Mobile No.
                    </label>
                    <div className="relative">
                        <input
                            type="tel"
                            className="lumine-input member-mobile pl-9"
                            placeholder="9876543210"
                            maxLength="10"
                            value={member.mobile}
                            onChange={(e) => onUpdate(member.id, 'mobile', e.target.value)}
                        />
                        <Smartphone className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                    </div>
                </div>
                <div className="md:col-span-2 relative">
                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">
                        Email ID
                    </label>
                    <div className="relative">
                        <input
                            type="email"
                            className="lumine-input member-email pl-9"
                            placeholder="devotee@example.com"
                            value={member.email}
                            onChange={(e) => onUpdate(member.id, 'email', e.target.value)}
                        />
                        <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                    </div>
                </div>

                <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">
                        Blood Group <span className="text-gray-300">(Opt)</span>
                    </label>
                    <select
                        className="lumine-input member-blood"
                        value={member.blood_group}
                        onChange={(e) => onUpdate(member.id, 'blood_group', e.target.value)}
                    >
                        <option value="">--</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                    </select>
                </div>

                <div
                    className="md:col-span-3 relative aadhaar-wrapper"
                    data-verified={member.verified}
                >
                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">
                        Aadhaar Number
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            className={`lumine-input member-aadhaar pl-10 tracking-widest font-mono transition-colors duration-300 ${member.verified
                                    ? 'border-green-500 bg-green-50 text-green-800 font-bold'
                                    : isVerifying
                                        ? 'border-orange-400'
                                        : ''
                                }`}
                            placeholder="Enter 12-Digit Aadhaar No."
                            maxLength="12"
                            value={member.aadhaar}
                            onChange={handleAadhaarInput}
                            disabled={isVerifying || member.verified}
                        />

                        <CreditCard className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                        <div className="absolute right-3 top-3 status-icon">
                            {isVerifying && (
                                <Loader2 className="w-5 h-5 text-orange-600 loader-spin" />
                            )}
                            {member.verified && (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            )}
                        </div>
                    </div>
                    <div className="text-[10px] text-gray-400 pl-1 verification-text h-4 transition-all mt-1">
                        {isVerifying && (
                            <span className="text-orange-600 font-medium">
                                Verifying with DigiLocker...
                            </span>
                        )}
                        {member.verified && (
                            <span className="text-green-600 font-bold">
                                Verified via DigiLocker ✅
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberCard;
