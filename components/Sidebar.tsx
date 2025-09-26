import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';

const NavItem: React.FC<{ to: string; icon: JSX.Element; label: string; subItems?: { to: string; label: string }[]; end?: boolean }> = ({ to, icon, label, subItems, end = true }) => {
    const location = useLocation();
    const isParentActive = location.pathname.startsWith(to) && to !== '/dashboard';

    const [isSubmenuOpen, setIsSubmenuOpen] = useState(isParentActive);
    
    useEffect(() => {
        setIsSubmenuOpen(isParentActive);
    }, [isParentActive]);

    const baseClasses = "flex items-center pl-3 py-3 pr-4 rounded text-sm font-medium w-full";
    const activeClasses = "bg-primary text-primary-content";
    const inactiveClasses = "text-base-content/80 hover:bg-base-300";

    if (subItems && subItems.length > 0) {
        return (
             <li>
                <button
                    onClick={() => setIsSubmenuOpen(!isSubmenuOpen)}
                    className={`${baseClasses} ${isParentActive ? 'text-white' : inactiveClasses}`}
                >
                    {icon}
                    <span className="ml-3 flex-1 text-left">{label}</span>
                    <svg className={`w-4 h-4 transform transition-transform ${isSubmenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                {isSubmenuOpen && (
                    <ul className="pl-8 pt-2 space-y-1">
                        {subItems.map(item => (
                             <li key={item.to}>
                                <NavLink to={item.to} end className={({ isActive }) => `block text-sm py-1 px-3 rounded-md ${isActive ? 'text-primary font-bold' : 'text-base-content/70 hover:text-white'}`}>
                                    {item.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                )}
            </li>
        )
    }

    return (
         <li>
            <NavLink
                to={to}
                end={end}
                className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
            >
                {icon}
                <span className="ml-3">{label}</span>
            </NavLink>
        </li>
    );
};


const icon = (d: string) => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d={d}></path></svg>;

const SidebarNavContent: React.FC = () => {
    const { user, logout } = useAdminAuth();

    return (
        <div className="flex flex-col h-full">
            <div className="flex w-full items-center px-6 pb-6 mb-6 lg:border-b border-base-300">
                <NavLink className="text-xl text-white font-semibold" to="/dashboard">
                     Crypto<span className="text-primary">Craft</span>
                </NavLink>
            </div>
            <div className="px-4 pb-6 flex-grow overflow-y-auto">
                <h3 className="mb-2 text-xs uppercase text-base-content/60 font-medium">Главное</h3>
                <ul className="mb-8 space-y-1">
                   <NavItem to="/dashboard" icon={icon("M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z")} label="Dashboard" />
                </ul>

                <h3 className="mb-2 text-xs uppercase text-base-content/60 font-medium">Управление</h3>
                <ul className="mb-8 space-y-1">
                    <NavItem to="/users" icon={icon("M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z")} label="Пользователи" />
                    <NavItem 
                        to="/products" 
                        end={false}
                        icon={icon("M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4V6h16v12z")} 
                        label="Товары"
                        subItems={[
                            { to: "/products", label: "Все товары" },
                            { to: "/products/moderation", label: "Модерация" }
                        ]}
                    />
                    <NavItem to="/orders" icon={icon("M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z")} label="Заказы" />
                    <NavItem to="/disputes" icon={icon("M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z")} label="Споры" />
                </ul>
                
                <h3 className="mb-2 text-xs uppercase text-base-content/60 font-medium">Контент</h3>
                <ul className="mb-8 space-y-1">
                     <NavItem to="/products/categories" icon={icon("M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.86L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM3 21.5h8v-8H3v8zm2-6h4v4H5v-4z")} label="Категории" />
                     <NavItem to="/content/icons" icon={icon("M3.375 3C2.339 3 1.5 3.84 1.5 4.875v11.25C1.5 17.16 2.34 18 3.375 18H13.5v-1.5H3.375a.375.375 0 01-.375-.375V4.875c0-.207.168-.375.375-.375h9.75v1.5H13.5V3H3.375z M9 4.5a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H9z M10.5 9a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0V9z M6 9a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5H6.75A.75.75 0 016 9z M15.375 6H12v1.5h3.375a.375.375 0 01.375.375v9.75a.375.375 0 01-.375-.375H6.375a.375.375 0 01-.375-.375V15H4.5v1.125C4.5 17.16 5.34 18 6.375 18h9.75c1.035 0 1.875-.84 1.875-1.875V7.875C18 6.839 17.16 6 16.125 6H15.375z")} label="Иконки" />
                </ul>

                 <h3 className="mb-2 text-xs uppercase text-base-content/60 font-medium">Система</h3>
                <ul className="space-y-1">
                    <NavItem 
                        to="/finances"
                        end={false}
                        icon={icon("M5 21V3h14v18l-7-3-7 3z")}
                        label="Финансы"
                        subItems={[
                            { to: "/finances/transactions", label: "Транзакции" },
                            { to: "/finances/promocodes", label: "Промокоды" },
                        ]}
                     />
                    <NavItem to="/settings" icon={icon("M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24-.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61.22l2-3.46c.12-.22-.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z")} label="Настройки" />
                    <NavItem to="/debug" icon={icon("M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2v2z")} label="Отладка" />
                </ul>
            </div>
            <div className="pt-8 mt-auto px-4">
                 <div className='mb-4'>
                    <p className='text-sm font-semibold text-white'>{user?.email}</p>
                    <p className='text-xs text-base-content/60'>Super Admin</p>
                </div>
                 <button onClick={logout} className="flex items-center w-full pl-3 py-3 pr-2 text-red-400 hover:bg-red-500/20 rounded">
                    <span className="inline-block mr-3">
                       {icon("M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z")}
                    </span>
                    <span>Выйти</span>
                </button>
            </div>
        </div>
    );
};

interface SidebarProps {
    mobileNavOpen: boolean;
    setMobileNavOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ mobileNavOpen, setMobileNavOpen }) => {
    return (
        <div>
            {/* Mobile overlay */}
            <div 
                className={`fixed lg:hidden inset-0 bg-base-300 bg-opacity-75 z-40 transition-opacity ${mobileNavOpen ? 'block' : 'hidden'}`}
                onClick={() => setMobileNavOpen(false)}
            ></div>

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 bottom-0 flex flex-col w-3/4 lg:w-80 sm:max-w-xs pt-6 pb-8 bg-base-100 overflow-y-auto z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                 <SidebarNavContent />
            </aside>
        </div>
    );
};

export default Sidebar;