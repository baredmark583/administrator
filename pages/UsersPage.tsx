import React, { useState, useEffect, useMemo } from 'react';
import { adminApiService, AdminPanelUser } from '../services/adminApiService';
import { backendApiService } from '../services/backendApiService';
import UsersTable from '../components/UsersTable';
import EditUserModal from '../components/EditUserModal';

const UsersPage: React.FC = () => {
    const [users, setUsers] = useState<AdminPanelUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingUser, setEditingUser] = useState<AdminPanelUser | null>(null);

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

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        if (!searchQuery) {
            return users;
        }
        return users.filter(user =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [users, searchQuery]);
    
    const handleEditUser = (userId: string) => {
        const userToEdit = users.find(u => u.id === userId);
        if (userToEdit) {
            setEditingUser(userToEdit);
        }
    };
    
    const handleSaveUser = async (updatedUser: AdminPanelUser) => {
        // Optimistic UI update
        setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
        setEditingUser(null);
        
        try {
            await backendApiService.updateUser(updatedUser);
        } catch (error) {
            console.error("Failed to update user:", error);
            // Revert on error
            alert("Ошибка сохранения. Данные будут возвращены к исходному состоянию.");
            fetchUsers();
        }
    };

    const handleBlockUser = async (userId: string) => {
        const userToBlock = users.find(u => u.id === userId);
        if (!userToBlock) return;
        
        const updatedUser = { ...userToBlock, isBlocked: !userToBlock.isBlocked };
        
        setUsers(prevUsers => prevUsers.map(u => u.id === userId ? updatedUser : u));
        
        try {
            // Note: 'isBlocked' is a UI-only feature for now, backend doesn't support it yet.
            // We call updateUser to save other potential changes.
            await backendApiService.updateUser(updatedUser);
        } catch (error) {
            console.error("Failed to block/unblock user:", error);
            alert("Ошибка. Данные будут возвращены к исходному состоянию.");
            fetchUsers();
        }
    };

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
                     <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div></div>
                ) : (
                    <UsersTable 
                        users={filteredUsers} 
                        onEdit={handleEditUser}
                        onBlock={handleBlockUser}
                    />
                )}
            </div>
            
            {editingUser && (
                <EditUserModal 
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSave={handleSaveUser}
                />
            )}
        </div>
    );
};

export default UsersPage;
