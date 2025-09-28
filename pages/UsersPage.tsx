import React, { useState, useEffect, useMemo } from 'react';
import { adminApiService, AdminPanelUser } from '../services/adminApiService';
import { backendApiService } from '../services/backendApiService';
import UsersTable from '../components/UsersTable';
import Spinner from '../components/Spinner';

const UsersPage: React.FC = () => {
    const [users, setUsers] = useState<AdminPanelUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                const result = await backendApiService.getUsers();
                setUsers(result);
            } catch (error) {
                console.error("Failed to fetch users", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        if (!searchQuery) {
            return users;
        }
        return users.filter(user =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [users, searchQuery]);
    

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Управление Пользователями</h1>
                <button className="bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded-lg">
                    Добавить пользователя
                </button>
            </div>

            <div className="bg-base-100 p-6 rounded-lg shadow-lg">
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Поиск по имени или email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full max-w-sm bg-base-300 border border-base-100 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                
                {isLoading ? (
                     <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
                ) : (
                    <UsersTable 
                        users={filteredUsers}
                    />
                )}
            </div>
        </div>
    );
};

export default UsersPage;
 