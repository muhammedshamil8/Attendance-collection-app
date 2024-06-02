import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ModeToggle } from '@/components/mode-toggle';
import { GoHome } from "react-icons/go";
import { IoHeartCircleOutline } from "react-icons/io5";
import { motion } from "framer-motion";

const AuthLayout: React.FC = ({ }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { pathname } = location;

    const handleNavigation = (path: string) => {
        navigate(path);
    }


    return (
        <div className="auth-layout bg-white dark:bg-gray-800 min-h-screen overflow-auto relative">
            <header className="flex p-2 w-full  items-end  gap-4 justify-center mb-10">
                <div className='rounded-md p-2.5  dark:bg-gray-950 dark:hover:bg-gray-800 border dark:border-none hover:bg-slate-100 cursor-pointer transition-all ease-in-out' onClick={() => handleNavigation('/')} >
                    <GoHome className='text-xl dark:text-emerald-500 text-emerald-500 cursor-pointer  dark:hover:text-gray-200' />
                </div>
                <div className='rounded-md p-2.5  dark:bg-gray-950 dark:hover:bg-gray-800  border dark:border-none hover:bg-slate-100 cursor-pointer transition-all ease-in-out' onClick={() => handleNavigation('/about')}>
                    <IoHeartCircleOutline className='text-xl dark:text-emerald-500  text-emerald-500  cursor-pointer  dark:hover:text-gray-200' />
                </div>
                <ModeToggle />
            </header>
            {/* md:border-x */}
            <div className="auth-layout__content custom-container  min-h-full pt-2 mb-10">
                <motion.div
                    initial="initial"
                    animate="enter"
                    exit="exit"
                    variants={{
                        initial: { opacity: 0, y: 0 },
                        enter: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                        exit: { opacity: 0, y: 0, transition: { duration: 0.5 } }
                    }}
                    key={pathname}
                >
                    <Outlet />
                </motion.div>
            </div>
            <footer className='w-full absolute bottom-0 h-auto'>
                {/* Add your footer content */}
                <div className=' p-2 text-center w-fit mx-auto'>
                    <p className='text-sm text-gray-500 dark:text-gray-300' onClick={() => window.open("https://iedc-emea.vercel.app/#/")}>IEDC EMEA &copy; {new Date().getFullYear()}  All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default AuthLayout;