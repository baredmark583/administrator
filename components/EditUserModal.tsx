import React, { useState } from 'react';
import type { AdminPanelUser } from '../services/adminApiService';

interface EditUserModalProps {
    user: AdminPanelUser;
    onClose: () => void;
    onSave: (user: AdminPanelUser) => Promise<void>;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState<AdminPanelUser>(user);
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'balance' ? parseFloat(value) || 0 : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave(formData);
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-base-300">
                        <h2 className="text-xl font-bold text-white">Редактировать пользователя</h2>
                        <p className="text-sm text-base-content/70">{user.name}</p>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-base-content/70 mb-1">Имя</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-base-200 border border-base-300 rounded-md p-2"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-base-content/70 mb-1">Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-base-200 border border-base-300 rounded-md p-2"/>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-base-content/70 mb-1">Статус</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-base-200 border border-base-300 rounded-md p-2">
                                    <option value="Standard">Standard</option>
                                    <option value="Pro">Pro</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-base-content/70 mb-1">Баланс (USDT)</label>
                                <input type="number" name="balance" value={formData.balance} onChange={handleChange} step="0.01" className="w-full bg-base-200 border border-base-300 rounded-md p-2"/>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-base-200/50 flex justify-end gap-3 rounded-b-lg">
                        <button type="button" onClick={onClose} disabled={isSaving} className="bg-base-300 hover:bg-base-200 text-white font-bold py-2 px-4 rounded">Отмена</button>
                        <button type="submit" disabled={isSaving} className="bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded">
                            {isSaving ? 'Сохранение...' : 'Сохранить'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUserModal;