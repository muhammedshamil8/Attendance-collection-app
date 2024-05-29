import React from 'react';
import { Outlet } from 'react-router-dom';
import { ModeToggle } from '@/components/mode-toggle';


const AuthLayout: React.FC = ({  }) => {
    return (
        <div className="auth-layout bg-white dark:bg-gray-800 min-h-screen overflow-auto relative">
            <header className="flex p-2 w-full justify-end items-end">
                <ModeToggle />
            </header>
            {/* md:border-x */}
            <div className="auth-layout__content custom-container  min-h-full">
                <Outlet />
            </div>
            <footer className='w-full absolute bottom-0 h-auto'>
                    {/* Add your footer content */}
                    <div className='bg-slate-200 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 p-2 text-center'>
                        <p className='text-sm text-gray-500 dark:text-gray-300'>IEDC EMEA &copy; {new Date().getFullYear()}  All rights reserved.</p>
                    </div>
                </footer>
        </div>
    );
};

export default AuthLayout;