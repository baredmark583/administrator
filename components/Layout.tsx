import React, { useState } from 'react';
import Sidebar from './Sidebar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    return (
        <div className="relative min-h-screen bg-base-200 text-base-content">
            <Sidebar mobileNavOpen={mobileNavOpen} setMobileNavOpen={setMobileNavOpen} />
            
            <div className="lg:ml-80">
                 <header className="lg:hidden py-4 px-6 bg-base-100 border-b border-base-300 flex items-center justify-between sticky top-0 z-30">
                    <a className="text-2xl text-white font-semibold" href="#">
                        Crypto<span className='text-primary'>Craft</span>
                    </a>
                    <button onClick={() => setMobileNavOpen(true)} className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary">
                        <svg className="text-white h-6 w-6" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                            <title>Mobile menu</title>
                            <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
                        </svg>
                    </button>
                </header>

                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
