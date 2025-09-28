import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AdminIcon } from '../services/adminApiService';
import { backendApiService } from '../services/backendApiService';
import { SYSTEM_ICONS, SystemIcon } from '../constants/systemIcons';
import Spinner from '../components/Spinner';

// --- Components ---

interface EditIconModalProps {
    systemIcon: SystemIcon;
    savedIcon: AdminIcon | undefined;
    onClose: () => void;
    onSave: (iconData: Partial<Omit<AdminIcon, 'id'>>) => Promise<void>;
}

const EditIconModal: React.FC<EditIconModalProps> = ({ systemIcon, savedIcon, onClose, onSave }) => {
    const [inputType, setInputType] = useState<'svg' | 'url'>(savedIcon?.svgContent ? 'svg' : 'url');
    const [svgContent, setSvgContent] = useState(savedIcon?.svgContent || '');
    const [iconUrl, setIconUrl] = useState(savedIcon ? '' : systemIcon.suggestionUrl);
    const [width, setWidth] = useState(savedIcon?.width || 24);
    const [height, setHeight] = useState(savedIcon?.height || 24);
    const [previewContent, setPreviewContent] = useState(savedIcon?.svgContent || '');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        if (inputType === 'url' && iconUrl.trim().startsWith('https://')) {
            const fetchPreview = async () => {
                try {
                    const response = await fetch(iconUrl, { signal: controller.signal });
                    if (!response.ok) throw new Error('Network response was not ok');
                    const text = await response.text();
                    if (text.trim().startsWith('<svg')) {
                        setPreviewContent(text);
                    } else {
                        setPreviewContent('');
                    }
                } catch (error) {
                    if ((error as Error).name !== 'AbortError') {
                        setPreviewContent('');
                    }
                }
            };
            const debounce = setTimeout(fetchPreview, 300);
            return () => {
                clearTimeout(debounce);
                controller.abort();
            };
        } else if (inputType === 'svg') {
            setPreviewContent(svgContent);
        }
    }, [iconUrl, svgContent, inputType]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload: Partial<Omit<AdminIcon, 'id'>> = { 
            name: systemIcon.key,
            width: Number(width),
            height: Number(height)
        };

        if (inputType === 'url') {
            if (!iconUrl.trim()) return alert('Пожалуйста, введите URL.');
            // FIX: Cast payload to any to add iconUrl, which is expected by the backend but not in the frontend type.
            (payload as any).iconUrl = iconUrl;
        } else {
            if (!svgContent.trim()) return alert('Пожалуйста, вставьте SVG-код.');
            payload.svgContent = svgContent;
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
                        <h2 className="text-xl font-bold text-white">Редактировать иконку: <span className="text-primary">{systemIcon.label}</span></h2>
                    </div>
                    <div className="p-6 space-y-4">
                         <div className="flex gap-2 p-1 bg-base-200 rounded-lg">
                            <label className={`flex-1 text-center cursor-pointer p-2 rounded-md transition-colors ${inputType === 'url' ? 'bg-primary text-white' : 'hover:bg-base-100'}`}>
                                <input type="radio" name="inputType" value="url" checked={inputType === 'url'} onChange={() => setInputType('url')} className="hidden"/>
                                <span>URL с Iconify</span>
                            </label>
                            <label className={`flex-1 text-center cursor-pointer p-2 rounded-md transition-colors ${inputType === 'svg' ? 'bg-primary text-white' : 'hover:bg-base-100'}`}>
                                <input type="radio" name="inputType" value="svg" checked={inputType === 'svg'} onChange={() => setInputType('svg')} className="hidden"/>
                                <span>Вставить SVG-код</span>
                            </label>
                        </div>

                        {inputType === 'url' ? (
                            <div>
                                <label className="block text-sm font-medium text-base-content/70 mb-1">URL иконки</label>
                                <input type="url" value={iconUrl} onChange={e => setIconUrl(e.target.value)} placeholder="https://api.iconify.design/mdi/cart.svg" className="w-full bg-base-200 border border-base-300 rounded-md p-2 font-mono"/>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-base-content/70 mb-1">SVG-код</label>
                                <textarea value={svgContent} onChange={e => setSvgContent(e.target.value)} rows={6} placeholder='<svg xmlns="http://www.w3.org/2000/svg" ...>' className="w-full bg-base-200 border border-base-300 rounded-md p-2 font-mono text-sm"/>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-base-content/70 mb-1">Ширина (px)</label>
                                <input 
                                    type="number" 
                                    value={width} 
                                    onChange={e => setWidth(Math.max(1, Math.min(512, parseInt(e.target.value) || 1)))} 
                                    className="w-full bg-base-200 border border-base-300 rounded-md p-2"
                                    min="1"
                                    max="512"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-base-content/70 mb-1">Высота (px)</label>
                                <input 
                                    type="number" 
                                    value={height} 
                                    onChange={e => setHeight(Math.max(1, Math.min(512, parseInt(e.target.value) || 1)))} 
                                    className="w-full bg-base-200 border border-base-300 rounded-md p-2"
                                    min="1"
                                    max="512"
                                />
                            </div>
                        </div>
                        
                        <div>
                             <h4 className="text-sm font-medium text-base-content/70 mb-1">Предпросмотр</h4>
                             <div className="bg-base-200 p-4 rounded-md h-24 flex items-center justify-center">
                                {previewContent.trim().startsWith('<svg') ? (
                                     <div 
                                        className="text-primary" 
                                        style={{ width: `${width}px`, height: `${height}px` }}
                                        dangerouslySetInnerHTML={{ __html: previewContent }} 
                                    />
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


interface IconSlotCardProps {
    systemIcon: SystemIcon;
    savedIcon: AdminIcon | undefined;
    onEdit: () => void;
}

const IconSlotCard: React.FC<IconSlotCardProps> = ({ systemIcon, savedIcon, onEdit }) => (
    <div className="bg-base-200 p-4 rounded-lg flex flex-col">
        <div className="flex-grow flex flex-col items-center justify-center gap-3 text-center">
             <div className="h-12 w-12 flex items-center justify-center">
                {savedIcon ? (
                     <div className="text-primary" style={{width: `${savedIcon.width || 24}px`, height: `${savedIcon.height || 24}px`}} dangerouslySetInnerHTML={{ __html: savedIcon.svgContent }} />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-base-300/50 flex items-center justify-center text-base-content/50">?</div>
                )}
            </div>
            <div>
                <p className="font-semibold text-white">{systemIcon.label}</p>
                <p className="text-xs text-base-content/70 font-mono">ключ: {systemIcon.key}</p>
                 <p className="text-xs text-base-content/70">
                    {savedIcon?.width && savedIcon?.height ? `Размер: ${savedIcon.width}x${savedIcon.height}px` : 'Размер не задан'}
                </p>
            </div>
        </div>
        <button onClick={onEdit} className="w-full mt-4 bg-base-300 hover:bg-primary/20 text-sm font-semibold py-2 rounded-md">
            Редактировать
        </button>
    </div>
);

// --- Page ---

const IconsPage: React.FC = () => {
    const [savedIcons, setSavedIcons] = useState<AdminIcon[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingSlot, setEditingSlot] = useState<SystemIcon | null>(null);

    const fetchIcons = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await backendApiService.getIcons();
            setSavedIcons(result);
        } catch (error) {
            console.error("Failed to fetch icons", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchIcons();
    }, [fetchIcons]);

    const handleSaveIcon = async (iconData: Partial<Omit<AdminIcon, 'id'>>) => {
        try {
            await backendApiService.upsertIcon(iconData);
            fetchIcons(); // Refetch to get the latest list
        } catch (error) {
            console.error("Failed to save icon:", error);
            alert("Ошибка сохранения иконки.");
        }
    };

    const iconsMap = useMemo(() => new Map(savedIcons.map(icon => [icon.name, icon])), [savedIcons]);

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-4">Библиотека системных иконок</h1>
            <div className="bg-base-300/50 p-4 rounded-lg mb-6 text-base-content/80 text-sm">
                Здесь отображаются все места в приложении, где используются иконки. Нажмите "Редактировать", чтобы загрузить свою SVG-иконку или указать ссылку на иконку с <a href="https://icon-sets.iconify.design/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Iconify.design</a>. Изменения применятся на всем сайте.
            </div>
            
            <div className="bg-base-100 p-6 rounded-lg shadow-lg">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {SYSTEM_ICONS.map(systemIcon => (
                            <IconSlotCard 
                                key={systemIcon.key} 
                                systemIcon={systemIcon}
                                savedIcon={iconsMap.get(systemIcon.key)}
                                onEdit={() => setEditingSlot(systemIcon)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {editingSlot && (
                <EditIconModal
                    systemIcon={editingSlot}
                    savedIcon={iconsMap.get(editingSlot.key)}
                    onClose={() => setEditingSlot(null)}
                    onSave={handleSaveIcon}
                />
            )}
        </div>
    );
};

export default IconsPage;
