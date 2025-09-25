import React, { useState, useEffect } from 'react';
import { adminApiService, AdminIcon } from '../services/adminApiService';

// --- Components ---

interface AddIconModalProps {
    onClose: () => void;
    onSave: (icon: Omit<AdminIcon, 'id'>) => Promise<void>;
}

const AddIconModal: React.FC<AddIconModalProps> = ({ onClose, onSave }) => {
    const [name, setName] = useState('');
    const [svgContent, setSvgContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !svgContent.trim()) {
            alert('Пожалуйста, заполните все поля.');
            return;
        }
        setIsSaving(true);
        await onSave({ name, svgContent });
        setIsSaving(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-base-300">
                        <h2 className="text-xl font-bold text-white">Добавить новую иконку</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-base-content/70 mb-1">Название</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Например, 'Иконка Доставки'"
                                className="w-full bg-base-200 border border-base-300 rounded-md p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-base-content/70 mb-1">SVG-код</label>
                            <textarea
                                value={svgContent}
                                onChange={e => setSvgContent(e.target.value)}
                                rows={6}
                                placeholder='<svg xmlns="http://www.w3.org/2000/svg" ...>'
                                className="w-full bg-base-200 border border-base-300 rounded-md p-2 font-mono text-sm"
                            />
                        </div>
                        <div>
                             <h4 className="text-sm font-medium text-base-content/70 mb-1">Предпросмотр</h4>
                             <div className="bg-base-200 p-4 rounded-md h-24 flex items-center justify-center">
                                {svgContent.startsWith('<svg') ? (
                                     <div className="w-12 h-12 text-primary" dangerouslySetInnerHTML={{ __html: svgContent }} />
                                ) : (
                                    <p className="text-xs text-base-content/70">Неверный SVG-код</p>
                                )}
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


const IconCard: React.FC<{ icon: AdminIcon }> = ({ icon }) => (
    <div className="bg-base-200 p-4 rounded-lg flex flex-col items-center justify-center gap-3 aspect-square">
        <div
            className="w-12 h-12 text-primary"
            dangerouslySetInnerHTML={{ __html: icon.svgContent }}
        />
        <p className="text-xs text-base-content/70 text-center break-all">{icon.name}</p>
    </div>
);


// --- Page ---

const IconsPage: React.FC = () => {
    const [icons, setIcons] = useState<AdminIcon[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchIcons = async () => {
        setIsLoading(true);
        try {
            const result = await adminApiService.getIcons();
            setIcons(result);
        } catch (error) {
            console.error("Failed to fetch icons", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchIcons();
    }, []);

    const handleSaveIcon = async (icon: Omit<AdminIcon, 'id'>) => {
        try {
            await adminApiService.addIcon(icon);
            fetchIcons(); // Refetch to get the latest list
        } catch (error) {
            console.error("Failed to save icon:", error);
            alert("Ошибка сохранения иконки.");
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Библиотека Иконок</h1>
                <button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded-lg">
                    + Добавить иконку
                </button>
            </div>

            <div className="bg-base-100 p-6 rounded-lg shadow-lg">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div></div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                        {icons.map(icon => (
                            <IconCard key={icon.id} icon={icon} />
                        ))}
                    </div>
                )}
            </div>

            {isModalOpen && (
                <AddIconModal
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveIcon}
                />
            )}
        </div>
    );
};

export default IconsPage;