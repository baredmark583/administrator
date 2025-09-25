import React, { useState, useEffect } from 'react';
import { adminApiService, AdminIcon } from '../services/adminApiService';

// --- Components ---

const IconCard: React.FC<{ icon: AdminIcon }> = ({ icon }) => {
    return (
        <div className="bg-base-200 p-4 rounded-lg flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 flex items-center justify-center text-primary">
                {icon.type === 'svg' ? (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full" dangerouslySetInnerHTML={{ __html: icon.content }} />
                ) : (
                    <img src={icon.content} alt={icon.name} className="w-full h-full object-contain" />
                )}
            </div>
            <p className="text-sm font-semibold truncate">{icon.name}</p>
        </div>
    );
};

const AddIconForm: React.FC<{ onAdd: (icon: Omit<AdminIcon, 'id'>) => void }> = ({ onAdd }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<'url' | 'svg'>('url');
    const [content, setContent] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !content.trim()) return;
        onAdd({ name, type, content });
        setName('');
        setContent('');
    };

    return (
        <form onSubmit={handleSubmit} className="bg-base-100 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-4">Добавить новую иконку</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-base-content/70 mb-1">Название иконки</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Например, 'Автомобили'"
                        className="w-full bg-base-200 border border-base-300 rounded-md p-2"
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-base-content/70 mb-1">Тип иконки</label>
                    <select value={type} onChange={e => setType(e.target.value as any)} className="w-full bg-base-200 border border-base-300 rounded-md p-2">
                        <option value="url">URL-ссылка</option>
                        <option value="svg">SVG-код</option>
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-base-content/70 mb-1">
                        {type === 'url' ? 'URL-адрес' : 'SVG-содержимое'}
                    </label>
                    <textarea
                        rows={type === 'svg' ? 5 : 2}
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder={type === 'url' ? 'https://... .svg' : '<path d="..."/>'}
                        className="w-full bg-base-200 border border-base-300 rounded-md p-2 font-mono text-sm"
                    />
                </div>
                <button type="submit" className="w-full bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded-lg">
                    Добавить иконку
                </button>
            </div>
        </form>
    );
}

// --- Page ---

const IconsPage: React.FC = () => {
    const [icons, setIcons] = useState<AdminIcon[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
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
        fetchIcons();
    }, []);
    
    const handleAddIcon = (iconData: Omit<AdminIcon, 'id'>) => {
        // Mock implementation
        const newIcon: AdminIcon = {
            id: `icon_${Date.now()}`,
            ...iconData
        };
        setIcons(prev => [newIcon, ...prev]);
        alert(`Иконка "${iconData.name}" добавлена!`);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                 <h1 className="text-3xl font-bold text-white mb-6">Библиотека Иконок</h1>
                 {isLoading ? (
                     <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div></div>
                 ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {icons.map(icon => <IconCard key={icon.id} icon={icon} />)}
                    </div>
                 )}
            </div>
            <div className="lg:col-span-1">
                <AddIconForm onAdd={handleAddIcon} />
            </div>
        </div>
    );
};

export default IconsPage;