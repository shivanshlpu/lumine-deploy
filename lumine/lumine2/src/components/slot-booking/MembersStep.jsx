import React from "react";

const MembersStep = ({
    isActive,
    members,
    onAddMember,
    onRemoveMember,
    onUpdateMember,
    onVerifyAadhaar,
}) => {
    if (!isActive) return null;

    return (
        <div className="p-6 md:p-8">
            {/* Header - Fixed */}
            <div className="mb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">
                            Add Members
                        </h2>
                        <p className="text-gray-600 text-sm">
                            Add details of all members who will be visiting
                        </p>
                    </div>
                    <div className="bg-saffron-50 text-saffron-700 px-3 py-1 rounded-full text-sm font-medium">
                        {members.length} {members.length === 1 ? "Member" : "Members"}
                    </div>
                </div>
            </div>

            {/* Members List */}
            <div className="space-y-4">
                {members.map((member, index) => (
                    <div
                        key={member.id}
                        className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50/50 transition-colors"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <span className="w-6 h-6 bg-saffron-100 text-saffron-700 rounded-full flex items-center justify-center text-xs font-bold">
                                    {index + 1}
                                </span>
                                Member {index + 1}
                                {index === 0 && (
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                        Primary
                                    </span>
                                )}
                            </h3>
                            {members.length > 1 && (
                                <button
                                    onClick={() => onRemoveMember(member.id)}
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-all"
                                    type="button"
                                    title="Remove member"
                                >
                                    <i className="ph ph-trash text-lg"></i>
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={member.name}
                                    onChange={(e) =>
                                        onUpdateMember(member.id, "name", e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 text-gray-900 bg-white placeholder-gray-400 transition-colors"
                                    placeholder="Enter full name"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Age
                                </label>
                                <input
                                    type="number"
                                    value={member.age}
                                    onChange={(e) =>
                                        onUpdateMember(member.id, "age", e.target.value)
                                    }
                                    min="1"
                                    max="120"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 text-gray-900 bg-white placeholder-gray-400 transition-colors"
                                    placeholder="Enter age"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Gender
                                </label>
                                <select
                                    value={member.gender}
                                    onChange={(e) =>
                                        onUpdateMember(member.id, "gender", e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 text-gray-900 bg-white transition-colors"
                                >
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    PwD (Divyangjan)
                                </label>
                                <select
                                    value={member.pwd || "no"}
                                    onChange={(e) =>
                                        onUpdateMember(member.id, "pwd", e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 text-gray-900 bg-white transition-colors"
                                >
                                    <option value="no">No</option>
                                    <option value="yes">Yes</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Mobile Number
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <i className="ph ph-phone text-sm"></i>
                                    </div>
                                    <input
                                        type="tel"
                                        value={member.mobile || ""}
                                        onChange={(e) =>
                                            onUpdateMember(member.id, "mobile", e.target.value)
                                        }
                                        maxLength="10"
                                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 text-gray-900 bg-white placeholder-gray-400 transition-colors"
                                        placeholder="10-digit Mobile"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <i className="ph ph-envelope text-sm"></i>
                                    </div>
                                    <input
                                        type="email"
                                        value={member.email || ""}
                                        onChange={(e) =>
                                            onUpdateMember(member.id, "email", e.target.value)
                                        }
                                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 text-gray-900 bg-white placeholder-gray-400 transition-colors"
                                        placeholder="member@example.com"
                                        required
                                    />
                                </div>
                                {member.emailError && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {member.emailError}
                                    </p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Aadhaar Number
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={member.aadhaar}
                                        onChange={(e) =>
                                            onUpdateMember(member.id, "aadhaar", e.target.value)
                                        }
                                        maxLength="12"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 text-gray-900 bg-white placeholder-gray-400 transition-colors"
                                        placeholder="12-digit Aadhaar"
                                    />
                                    <button
                                        onClick={() => onVerifyAadhaar(member.id)}
                                        disabled={
                                            !member.aadhaar ||
                                            member.aadhaar.length !== 12 ||
                                            member.isVerified
                                        }
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${member.isVerified
                                            ? "bg-green-100 text-green-700 cursor-not-allowed"
                                            : member.aadhaar && member.aadhaar.length === 12
                                                ? "bg-saffron-600 text-white hover:bg-saffron-700"
                                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                            }`}
                                    >
                                        {member.isVerified ? (
                                            <i className="ph ph-check-circle text-lg"></i>
                                        ) : (
                                            "Verify"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Member Button - Fixed at bottom */}
            <div className="pt-4 mt-4 border-t border-gray-100">
                <button
                    onClick={onAddMember}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-saffron-600 hover:text-saffron-600 hover:bg-saffron-50 transition-all flex items-center justify-center gap-2"
                >
                    <i className="ph ph-plus-circle text-xl"></i>
                    <span className="font-medium">Add Another Member</span>
                </button>
            </div>
        </div>
    );
};

export default MembersStep;
