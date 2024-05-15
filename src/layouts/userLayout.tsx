import { ModeToggle } from '@/components/mode-toggle';
import React from 'react';
import { Outlet } from 'react-router-dom';


const UserLayout: React.FC = ({  }) => {
    return (
        <div>
            {/* Add your header component here */}
            <header>
                {/* Add your header content */}
                <h2 className='dark:text-red-300 yestext-green-300'>User Layout</h2>
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