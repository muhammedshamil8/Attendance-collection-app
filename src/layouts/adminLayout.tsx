import React from 'react';
import { Outlet } from 'react-router-dom';

const AdminLayout: React.FC = ({  }) => {
    return (
        <div>
            <header>
                {/* Add your header content here */}
                <h1>Admin Layout</h1>
            </header>
            <main>
                {/* Add your main content here */}
                <Outlet />
            </main>
            <footer>
                {/* Add your footer content here */}
            </footer>
        </div>
    );
};

export default AdminLayout;