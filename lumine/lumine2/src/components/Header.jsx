import React from 'react';

const Header = ({ userInitial = 'D', userName = 'Devotee' }) => {
    return (
        <header class="lumine-header">
            <div class="flex items-center gap-3">
                <img src="/src/assets/logo.png" alt="Lumine Logo" className="h-11 w-auto" />
                <div>
                    <div class="font-serif font-bold text-navy-900 text-lg leading-none">
                        LUMINE
                    </div>
                    <div class="text-[10px] text-orange-700 font-bold tracking-widest uppercase">
                        Devotee Services
                    </div>
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex items-center gap-3 pl-4 border-l border-gray-200">
                    <div
                        class="w-9 h-9 rounded-full bg-navy-900 text-white flex items-center justify-center font-bold text-sm"
                        id="userInitial"
                    >
                        {userInitial}
                    </div>
                    <div class="hidden md:block">
                        <div class="text-xs text-gray-500 font-medium">Welcome</div>
                        <div
                            class="text-sm font-bold text-navy-900 leading-none"
                            id="headerUserName"
                        >
                            {userName}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
