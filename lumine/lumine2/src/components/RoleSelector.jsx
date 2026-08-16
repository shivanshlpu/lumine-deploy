import React from 'react';
import * as PhosphorIcons from '@phosphor-icons/react';
import { ROLES } from '../constants/roles';
import { useTranslation } from '../context/LanguageContext';

const RoleSelector = ({ currentRole, onRoleChange }) => {
    const { language } = useTranslation();

    return (
        <div className="bg-orange-50/80 p-1 my-2 rounded-xl flex items-center gap-1 overflow-x-auto no-scrollbar shadow-inner" id="roleSelector">
            {Object.values(ROLES).map((role) => {
                const Icon = PhosphorIcons[role.icon];
                const isActive = currentRole === role.id;

                return (
                    <button
                        key={role.id}
                        type="button"
                        onClick={() => onRoleChange(role.id)}
                        className={`role-btn flex-1 min-w-[70px] flex flex-col items-center justify-center py-2 px-1.5 rounded-lg text-[10px] sm:text-xs font-semibold transition-all duration-200 shrink-0 ${isActive ? 'bg-white text-orange-700 shadow-md ring-1 ring-black/5 scale-[1.02]' : 'text-gray-500 hover:bg-white/50 hover:text-gray-700'}`}
                        data-role={role.id}
                    >
                        <Icon weight="fill" className="text-base sm:text-lg mb-0.5" />
                        <span className="truncate max-w-full">{role[language]?.label || role.en?.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default RoleSelector;
