import React, { useState, useEffect } from 'react';
import { AdminIcon } from '../services/adminApiService';
import { backendApiService } from '../services/backendApiService';

// --- Components ---

interface AddIconModalProps {
    onClose: () => void;
    onSave: (icon: Partial<Omit<AdminIcon, 'id'>>) => Promise<void>;
}

const AddIconModal: React.FC<AddIconModalProps> = ({ onClose, onSave }) => {
    const [inputType, setInputType] = useState<'svg' | 'url'>('svg');
    const [name, setName] = useState('');
    const [svgContent, setSvgContent] = useState('');
    const [iconUrl, setIconUrl] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (inputType === 'url' && iconUrl.trim().startsWith('https://')) {
            const controller = new AbortController();
            const signal = controller.signal;
    
            const fetchPreview = async () => {
                try {
                    const response = await fetch(iconUrl, { signal });
                    if (!response.ok) throw new Error('Network response was not ok');
                    const text = await response.text();
                    if (text.trim().startsWith('<svg')) {
                        setSvgContent(text); // Update the preview
                    }
                } catch (error) {
                    if ((error as Error).name !== 'AbortError') {
                        console.error("Failed to fetch SVG preview:", error);
                        setSvgContent(''); // Clear preview on error
                    }
                }
            };
    
            const debounce = setTimeout(() => {
                fetchPreview();
            }, 300);
    
            return () => {
                clearTimeout(debounce);
                controller.abort();
            };
        }
    }, [iconUrl, inputType]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            alert('Пожалуйста, введите название.');
            return;
        }

        let payload: Partial<Omit<AdminIcon, 'id'>>;

        if (inputType === 'url') {
            if (!iconUrl.trim()) {
                alert('Пожалуйста, введите URL иконки.');
                return;
            }
            payload = { name, iconUrl }; 
        } else {
            if (!svgContent.trim()) {
                alert('Пожалуйста, вставьте SVG-код.');
                return;
            }
            payload = { name, svgContent };
        }

        setIsSaving(true);
        await onSave(payload);
        setIsSaving(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-base-300">
                        <h2 className="text-xl font-bold text-white">Добавить новую иконку</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-base-content/70 mb-1">Название (ключ)</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Например, 'cart' или 'search'"
                                className="w-full bg-base-200 border border-base-300 rounded-md p-2 font-mono"
                                required
                            />
                        </div>

                        <div className="flex gap-2 p-1 bg-base-200 rounded-lg">
                            <label className={`flex-1 text-center cursor-pointer p-2 rounded-md transition-colors ${inputType === 'svg' ? 'bg-primary text-white' : 'hover:bg-base-100'}`}>
                                <input type="radio" name="inputType" value="svg" checked={inputType === 'svg'} onChange={() => setInputType('svg')} className="hidden"/>
                                <span>Вставить SVG-код</span>
                            </label>
                            <label className={`flex-1 text-center cursor-pointer p-2 rounded-md transition-colors ${inputType === 'url' ? 'bg-primary text-white' : 'hover:bg-base-100'}`}>
                                <input type="radio" name="inputType" value="url" checked={inputType === 'url'} onChange={() => setInputType('url')} className="hidden"/>
                                <span>URL с Iconify</span>
                            </label>
                        </div>

                        {inputType === 'svg' ? (
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
                        ) : (
                             <div>
                                <label className="block text-sm font-medium text-base-content/70 mb-1">URL иконки</label>
                                <input
                                    type="url"
                                    value={iconUrl}
                                    onChange={e => setIconUrl(e.target.value)}
                                    placeholder="https://api.iconify.design/mdi/cart.svg"
                                    className="w-full bg-base-200 border border-base-300 rounded-md p-2 font-mono"
                                />
                            </div>
                        )}
                        
                        <div>
                             <h4 className="text-sm font-medium text-base-content/70 mb-1">Предпросмотр</h4>
                             <div className="bg-base-200 p-4 rounded-md h-24 flex items-center justify-center">
                                {svgContent.trim().startsWith('<svg') ? (
                                     <div className="w-12 h-12 text-primary" dangerouslySetInnerHTML={{ __html: svgContent }} />
                                ) : (
                                    <p className="text-xs text-base-content/70">{inputType === 'url' && iconUrl ? 'Загрузка...' : 'Нет данных для предпросмотра'}</p>
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
        <p className="text-xs text-base-content/70 text-center break-all font-mono">{icon.name}</p>
    </div>
);

const systemIcons = [
    { name: 'cart', description: 'Корзина в шапке сайта' },
    { name: 'back-arrow', description: 'Кнопка "Назад" в шапке сайта' },
    { name: 'search', description: 'Иконка поиска' },
    { name: 'community', description: 'Иконка сообщества' },
    { name: 'bell', description: 'Иконка уведомлений' },
    { name: 'chat', description: 'Иконка чата' },
];

// --- Page ---

const IconsPage: React.FC = () => {
    const [icons, setIcons] = useState<AdminIcon[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchIcons = async () => {
        setIsLoading(true);
        try {
            const result = await backendApiService.getIcons();
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

    const handleSaveIcon = async (icon: Partial<Omit<AdminIcon, 'id'>>) => {
        try {
            await backendApiService.createIcon(icon);
            fetchIcons(); // Refetch to get the latest list
        } catch (error) {
            console.error("Failed to save icon:", error);
            alert("Ошибка сохранения иконки.");
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Библиотека UI Иконок</h1>
                <button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded-lg">
                    + Добавить иконку
                </button>
            </div>
             <div className="bg-base-300/50 p-4 rounded-lg mb-6 text-base-content/80 text-sm">
                Здесь хранятся иконки, используемые в интерфейсе всего приложения. Чтобы заменить системную иконку на сайте (например, корзину), создайте новую иконку с таким же названием-ключом из списка ниже.
            </div>
            
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-3">Системные Иконки (ключи)</h2>
                <div className="bg-base-100 p-4 rounded-lg">
                    <ul className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                        {systemIcons.map(icon => (
                            <li key={icon.name}>
                                <code className="text-primary font-mono">{icon.name}</code>
                                <span className="text-base-content/70"> — {icon.description}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="bg-base-100 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold text-white mb-4">Загруженные иконки</h2>
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