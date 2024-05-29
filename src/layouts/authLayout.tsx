import React from 'react';
import { Outlet } from 'react-router-dom';
import { ModeToggle } from '@/components/mode-toggle';


const AuthLayout: React.FC = ({  }) => {
    return (
        <div className="auth-layout bg-white dark:bg-gray-800 min-h-screen overflow-auto ">
            <header className="flex p-2 w-full justify-end items-end">
                <ModeToggle />
            </header>
            {/* md:border-x */}
            <div className="auth-layout__content custom-container  min-h-full">
                <Outlet />
            </div>
        </div>
    );
};

export default AuthLayout;