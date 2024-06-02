import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { ModeToggle } from '@/components/mode-toggle';
import { FaHome, FaGrinStars } from "react-icons/fa";


const AuthLayout: React.FC = ({ }) => {
    const navigate = useNavigate();

    const handleNavigation = (path: string) => {
        navigate(path);
    }


    return (
        <div className="auth-layout bg-white dark:bg-gray-800 min-h-screen overflow-auto relative">
            <header className="flex p-2 w-full  items-end  gap-4 justify-center mb-10">
                <div className='rounded-md p-2.5  dark:bg-gray-950 dark:hover:bg-gray-800 border dark:border-none hover:bg-slate-100 cursor-pointer transition-all ease-in-out' onClick={() => handleNavigation('/')} >
                    <FaHome className='text-xl dark:text-slate-100 cursor-pointer  dark:hover:text-gray-200' />
                </div>
                <div className='rounded-md p-2.5  dark:bg-gray-950 dark:hover:bg-gray-800  border dark:border-none hover:bg-slate-100 cursor-pointer transition-all ease-in-out' onClick={() => handleNavigation('/about')}>
                    <FaGrinStars className='text-xl dark:text-slate-100  cursor-pointer  dark:hover:text-gray-200' />
                </div>
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