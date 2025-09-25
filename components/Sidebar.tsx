import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

interface NavItemProps {
    to: string;
    icon: JSX.Element;
    children: React.ReactNode;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, children }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center p-2 rounded-lg transition-colors text-gray-300 hover:bg-base-300 hover:text-white ${isActive ? 'bg-primary/20 text-primary' : ''}`
        }
    >
        <span className="w-6 h-6 mr-3">{icon}</span>
        <span>{children}</span>
    </NavLink>
);

interface AccordionProps {
    icon: JSX.Element;
    title: string;
    children: React.ReactNode;
}

const AccordionMenu: React.FC<AccordionProps> = ({ icon, title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-2 rounded-lg text-gray-300 hover:bg-base-300 hover:text-white"
            >
                <div className="flex items-center">
                    <span className="w-6 h-6 mr-3">{icon}</span>
                    <span>{title}</span>
                </div>
                <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && <div className="pl-8 mt-1 space-y-1">{children}</div>}
        </div>
    );
}

const Sidebar: React.FC = () => {
    const icon = (d: string) => <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d={d}></path></svg>;

    return (
        <aside className="w-64 bg-base-100 flex-shrink-0 p-4 flex flex-col">
            <div className="text-2xl font-bold text-center mb-6">
                Crypto<span className="text-primary">Craft</span>
            </div>
            <nav className="flex-1 space-y-2">
                <NavItem to="/dashboard" icon={icon("M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z")}>Dashboard</NavItem>
                <NavItem to="/users" icon={icon("M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z")}>Пользователи</NavItem>
                <AccordionMenu title="Товары" icon={icon("M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z")}>
                    <NavLink to="/products" end className={({isActive}) => `block p-1 rounded-md text-sm ${isActive ? 'text-primary' : 'text-gray-400'}`}>Все товары</NavLink>
                    <NavLink to="/products/moderation" className={({isActive}) => `block p-1 rounded-md text-sm ${isActive ? 'text-primary' : 'text-gray-400'}`}>Модерация</NavLink>
                </AccordionMenu>
                <NavItem to="/orders" icon={icon("M19.5 3.5 18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2v17l1.5 1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5V2zM15 15H9V9h6v6z")}>Заказы</NavItem>
                <NavItem to="/disputes" icon={icon("M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z")}>Споры</NavItem>
                <AccordionMenu title="Финансы" icon={icon("M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-.96.74-1.75 2.2-1.75 1.31 0 2.2.65 2.2 1.75h2.1c0-1.98-1.7-3.5-4.3-3.5-2.76 0-4.8 1.76-4.8 4.25 0 2.23 1.5 3.33 3.9 3.89 2.1.49 2.9.9 2.9 1.85 0 .86-.75 1.75-2.2 1.75-1.52 0-2.25-.7-2.25-1.75H6.1c0 2.07 1.75 3.5 4.3 3.5 2.89 0 4.8-1.59 4.8-4.25 0-2.31-1.5-3.39-4.1-3.94z")}>
                    <NavLink to="/finances/transactions" className={({isActive}) => `block p-1 rounded-md text-sm ${isActive ? 'text-primary' : 'text-gray-400'}`}>Транзакции</NavLink>
                    <NavLink to="/finances/promocodes" className={({isActive}) => `block p-1 rounded-md text-sm ${isActive ? 'text-primary' : 'text-gray-400'}`}>Промокоды</NavLink>
                </AccordionMenu>
                 <AccordionMenu title="Контент" icon={icon("M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-12h2v4h-2zm0 6h2v2h-2z")}>
                    <NavLink to="/content/categories" className={({isActive}) => `block p-1 rounded-md text-sm ${isActive ? 'text-primary' : 'text-gray-400'}`}>Категории</NavLink>
                    <NavLink to="/content/icons" className={({isActive}) => `block p-1 rounded-md text-sm ${isActive ? 'text-primary' : 'text-gray-400'}`}>Иконки</NavLink>
                </AccordionMenu>
                <NavItem to="/settings" icon={icon("M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z")}>Настройки</NavItem>
                <NavItem to="/debug" icon={icon("M20 8h-2.81c-.45-.78-1.07-1.45-1.82-1.96L17 4.41 15.59 3l-1.63 1.63c-.51-.25-1.06-.44-1.65-.57L12 2h-2l-.31 2.06c-.59.13-1.14.32-1.65.57L6.41 3 5 4.41l1.63 1.63c-.75.51-1.37 1.18-1.82 1.96H2v2h2.81c.45.78 1.07 1.45 1.82 1.96L3 15.59 4.41 17l1.63-1.63c.51.25 1.06.44 1.65.57L8 18h2l.31-2.06c.59-.13 1.14-.32 1.65-.57L13.59 17 15 15.59l-1.63-1.63c.75-.51 1.37-1.18 1.82-1.96H20v-2z")}>Отладка</NavItem>
            </nav>
        </aside>
    );
};

export default Sidebar;