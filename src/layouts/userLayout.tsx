import { ModeToggle } from '@/components/mode-toggle';
import React from 'react';
import { Outlet } from 'react-router-dom';


const UserLayout: React.FC = ({  }) => {

    return (
        <div className='bg-slate-200 dark:bg-slate-900 min-h-screen overflow-auto'>
            {/* Add your header component here */}
            <header className='border-b border-slate-900 dark:border-slate-200  flex items-center justify-around p-2'>
                {/* Add your header content */}
                <h2 className='dark:text-red-300 text-green-300'>User Layout</h2>
                <ModeToggle />
            </header>

            {/* Add your main content */}
            <main>
                <Outlet />
            </main>

            {/* Add your footer component here */}
            <footer>
                {/* Add your footer content */}
            </footer>
        </div>
    );
};

export default UserLayout;