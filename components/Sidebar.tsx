import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

interface NavItemProps {
    to: string;
    icon: JSX.Element;
    label: string;
    subItems?: { to: string; label: string }[];
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, subItems }) => {
    const location = useLocation();
    const isParentActive = location.pathname.startsWith(to);

    const baseClasses = "flex items-center p-3 rounded-lg transition-colors";
    const activeClasses = "bg-primary text-white font-semibold";
    const inactiveClasses = "text-base-content/80 hover:bg-base-300";
    
    const isActive = location.pathname === to;

    return (
         <li>
            <NavLink
                to={to}
                end={!subItems}
                className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
            >
                {icon}
                <span className="ml-3">{label}</span>
            </NavLink>
             {subItems && isParentActive && (
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
    );
};

const icon = (d: string) => <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d={d}></path></svg>;

const Sidebar: React.FC = () => {
    return (
        <aside className="w-64 bg-base-100 flex-shrink-0 p-4 border-r border-base-300">
            <div className="text-2xl font-bold text-white mb-8 text-center">
                Crypto<span className="text-primary">Craft</span>
            </div>
            <nav>
                <ul className="space-y-2">
                    <NavItem to="/dashboard" icon={icon("M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z")} label="Dashboard" />
                    <NavItem to="/users" icon={icon("M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z")} label="Пользователи" />
                    <NavItem 
                        to="/products" 
                        icon={icon("M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4V6h16v12z")} 
                        label="Товары"
                        subItems={[
                            { to: "/products", label: "Все товары" },
                            { to: "/products/moderation", label: "Модерация" },
                            { to: "/products/categories", label: "Категории" }
                        ]}
                    />
                    <NavItem to="/orders" icon={icon("M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z")} label="Заказы" />
                    <NavItem 
                        to="/finances" 
                        icon={icon("M5 21V3h14v18l-7-3-7 3z")}
                        label="Финансы"
                        subItems={[
                            { to: "/finances/transactions", label: "Транзакции" },
                            { to: "/finances/promocodes", label: "Промокоды" },
                        ]}
                     />
                    <NavItem to="/disputes" icon={icon("M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z")} label="Споры" />
                    <NavItem to="/settings" icon={icon("M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z")} label="Настройки" />
                    <NavItem to="/debug" icon={icon("M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2v2z")} label="Отладка" />
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
