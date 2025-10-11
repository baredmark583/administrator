import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';

interface NavItemProps {
    to: string;
    icon: React.ReactElement;
    label: string;
    setMobileNavOpen?: (open: boolean) => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, setMobileNavOpen }) => {
    const location = useLocation();
    const isActive = location.pathname.startsWith(to);

    return (
        <li>
            <NavLink
                to={to}
                onClick={() => setMobileNavOpen && setMobileNavOpen(false)}
                className={`flex items-center p-3 my-1 font-medium rounded-lg transition-colors ${
                    isActive ? 'bg-primary text-white shadow-lg' : 'text-base-content/80 hover:bg-base-300'
                }`}
            >
                <span className="w-6 h-6 mr-3">{icon}</span>
                {label}
            </NavLink>
        </li>
    );
};

interface SidebarProps {
    mobileNavOpen: boolean;
    setMobileNavOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ mobileNavOpen, setMobileNavOpen }) => {
    const { user, logout } = useAdminAuth();

    const icon = (d: string) => <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d={d}></path></svg>;
    
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';

    const navItems = [
        { to: '/dashboard', icon: icon("M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"), label: 'Dashboard', visible: true },
        { to: '/users', icon: icon("M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"), label: 'Пользователи', visible: true },
        { to: '/products', icon: icon("M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z"), label: 'Товары', visible: true },
        { to: '/moderation', icon: icon("M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12-.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"), label: 'Модерация', visible: true },
        { to: '/orders', icon: icon("M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"), label: 'Заказы', visible: true },
        { to: '/disputes', icon: icon("M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"), label: 'Споры', visible: true },
        { to: '/governance', icon: icon("M12 3L2 9v2h1v11h16V11h1V9L12 3zm0 2.83L15.17 8H8.83L12 5.83zM18 19H6V11h12v8zM8 13h2v4H8v-4zm4 0h2v4h-2v-4z"), label: 'Управление DAO', visible: isSuperAdmin },
        { to: '/categories', icon: icon("M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"), label: 'Категории', visible: isSuperAdmin },
        { to: '/icons', icon: icon("M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"), label: 'Иконки', visible: isSuperAdmin },
        { to: '/finances', icon: icon("M4 10h12v2H4v-2zm0 4h12v2H4v-2zm0-8h12v2H4V6zm16 14.08c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V4.92c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v16.16zM20 2.08L12 2 4 2.08V4h16V2.08z"), label: 'Финансы', visible: isSuperAdmin },
        { to: '/settings', icon: icon("M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12-.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"), label: 'Настройки', visible: isSuperAdmin },
        { to: '/debug', icon: icon("M7 22h10v-2H7v2zm5-20C6.48 2 2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95C22 6.48 17.52 2 12 2z"), label: 'Отладка', visible: isSuperAdmin },
    ];


    return (
        <>
            {/* Overlay for mobile */}
            {mobileNavOpen && (
                <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setMobileNavOpen(false)}></div>
            )}
            <aside className={`fixed top-0 left-0 z-40 w-80 h-screen bg-base-100 border-r border-base-300 transform transition-transform lg:translate-x-0 ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-6 border-b border-base-300">
                        <NavLink to="/" className="text-3xl text-white font-semibold">
                            Crypto<span className="text-primary">Craft</span>
                        </NavLink>
                         <button className="lg:hidden" onClick={() => setMobileNavOpen(false)}>&times;</button>
                    </div>

                    <nav className="flex-1 p-4 overflow-y-auto">
                        <ul>
                            {navItems.filter(item => item.visible).map(item => <NavItem key={item.to} {...item} setMobileNavOpen={setMobileNavOpen} />)}
                        </ul>
                    </nav>

                    <div className="p-4 border-t border-base-300">
                        <div className="flex items-center mb-3">
                            <div className="ml-3">
                                <p className="font-semibold text-white">{user?.email}</p>
                                <p className="text-sm text-primary">{user?.role}</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="w-full text-left flex items-center p-3 text-base-content/80 hover:bg-red-800/50 hover:text-white rounded-lg"
                        >
                            <span className="w-6 h-6 mr-3">{icon("M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z")}</span>
                            Выйти
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;