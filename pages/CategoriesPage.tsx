import React, { useState, useEffect } from 'react';
import { adminApiService, CategorySchema, CategoryField, AdminIcon } from '../services/adminApiService';
import { backendApiService } from '../services/backendApiService';

// --- Components ---

interface FieldEditorProps {
    field: CategoryField;
    onUpdate: (fieldId: string, updates: Partial<CategoryField>) => void;
    onRemove: (fieldId: string) => void;
}

const FieldEditor: React.FC<FieldEditorProps> = ({ field, onUpdate, onRemove }) => {
    const [options, setOptions] = useState(field.options.join(', '));

    useEffect(() => {
        const handler = setTimeout(() => {
            onUpdate(field.id, { options: options.split(',').map(o => o.trim()).filter(Boolean) });
        }, 500);
        return () => clearTimeout(handler);
    }, [options, field.id, onUpdate]);

    return (
        <div className="p-3 bg-base-300/50 rounded-md grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <input 
                type="text" 
                value={field.label} 
                onChange={e => onUpdate(field.id, { label: e.target.value })}
                placeholder="Название поля (напр., Цвет)"
                className="col-span-1 bg-base-100 border border-base-300 rounded p-2 text-sm"
            />
            <select 
                value={field.type} 
                onChange={e => onUpdate(field.id, { type: e.target.value as CategoryField['type'] })}
                className="col-span-1 bg-base-100 border border-base-300 rounded p-2 text-sm"
            >
                <option value="text">Текст</option>
                <option value="number">Число</option>
                <option value="select">Выбор</option>
            </select>
            {field.type === 'select' && (
                 <input 
                    type="text" 
                    value={options}
                    onChange={(e) => setOptions(e.target.value)}
                    placeholder="Опции, через запятую"
                    className="col-span-1 bg-base-100 border border-base-300 rounded p-2 text-sm"
                />
            )}
             <div className="col-span-1 flex items-center justify-between gap-2">
                <label className="flex items-center text-sm gap-1 cursor-pointer">
                    <input type="checkbox" checked={field.required} onChange={e => onUpdate(field.id, { required: e.target.checked })} />
                    <span>Обяз.</span>
                </label>
                <button onClick={() => onRemove(field.id)} className="text-red-500 hover:text-red-400 text-xs">Удалить</button>
            </div>
        </div>
    );
};


interface CategoryModalProps {
    category: CategorySchema;
    onClose: () => void;
    onSave: (category: CategorySchema) => Promise<void>;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ category, onClose, onSave }) => {
    const [editedCategory, setEditedCategory] = useState<CategorySchema>(category);
    const [isSaving, setIsSaving] = useState(false);
    const [icons, setIcons] = useState<AdminIcon[]>([]);

    useEffect(() => {
        adminApiService.getIcons().then(setIcons);
    }, []);

    const handleFieldUpdate = (fieldId: string, updates: Partial<CategoryField>) => {
        setEditedCategory(prev => ({
            ...prev,
            fields: prev.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f)
        }));
    };
    
    const handleAddField = () => {
        const newField: CategoryField = {
            id: `new_${Date.now()}`,
            name: '',
            label: '',
            type: 'text',
            required: false,
            options: [],
        };
        setEditedCategory(prev => ({...prev, fields: [...prev.fields, newField]}));
    };

    const handleRemoveField = (fieldId: string) => {
        setEditedCategory(prev => ({...prev, fields: prev.fields.filter(f => f.id !== fieldId)}));
    };

    const handleSave = async () => {
        setIsSaving(true);
        await onSave(editedCategory);
        setIsSaving(false);
        onClose();
    };
    
    const selectedIconSvg = icons.find(i => i.id === editedCategory.iconId)?.svgContent;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b border-base-300">
                    <h2 className="text-xl font-bold">Редактор категории</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <input 
                            type="text" 
                            value={editedCategory.name} 
                            onChange={e => setEditedCategory(prev => ({...prev, name: e.target.value}))}
                            className="w-full bg-base-200 border border-base-300 rounded p-2"
                        />
                         <div className="flex items-center gap-2">
                            {selectedIconSvg && <div className="w-8 h-8 text-primary flex-shrink-0" dangerouslySetInnerHTML={{ __html: selectedIconSvg }} />}
                            <select 
                                value={editedCategory.iconId || ''} 
                                onChange={e => setEditedCategory(prev => ({ ...prev, iconId: e.target.value || null }))}
                                className="w-full bg-base-200 border border-base-300 rounded p-2"
                            >
                                <option value="">- Выбрать иконку -</option>
                                {icons.map(icon => (
                                    <option key={icon.id} value={icon.id}>{icon.name}</option>
                                ))}
                            </select>
                         </div>
                     </div>
                </div>
                <div className="p-4 space-y-3 overflow-y-auto">
                    <h3 className="font-semibold">Поля категории</h3>
                    {editedCategory.fields.map(field => (
                        <FieldEditor key={field.id} field={field} onUpdate={handleFieldUpdate} onRemove={handleRemoveField} />
                    ))}
                    <button onClick={handleAddField} className="text-sm text-primary hover:underline">+ Добавить поле</button>
                </div>
                <div className="p-4 border-t border-base-300 flex justify-end gap-3">
                    <button onClick={onClose} className="bg-base-300 hover:bg-base-200 text-white font-bold py-2 px-4 rounded">Отмена</button>
                    <button onClick={handleSave} disabled={isSaving} className="bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded">
                        {isSaving ? 'Сохранение...' : 'Сохранить'}
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Page ---

const CategoriesPage: React.FC = () => {
    const [categories, setCategories] = useState<CategorySchema[]>([]);
    const [icons, setIcons] = useState<AdminIcon[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingCategory, setEditingCategory] = useState<CategorySchema | null>(null);

    useEffect(() => {
        fetchData();
    }, []);
    
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [catResult, iconResult] = await Promise.all([
                backendApiService.getCategories(),
                adminApiService.getIcons() // Icons are UI-specific, mock is fine
            ]);
            setCategories(catResult);
            setIcons(iconResult);
        } catch (error) {
            console.error("Failed to fetch page data", error);
        } finally {
            setIsLoading(false);
        }
    }

    const handleEdit = (category: CategorySchema) => {
        setEditingCategory(JSON.parse(JSON.stringify(category))); // Deep copy to avoid direct mutation
    };
    
    const handleCreate = () => {
        const newCategory: CategorySchema = {
            id: `new_cat_${Date.now()}`,
            name: 'Новая категория',
            iconId: null,
            fields: [],
        };
        setEditingCategory(newCategory);
    };

    const handleSave = async (categoryToSave: CategorySchema) => {
        await backendApiService.updateCategory(categoryToSave);
        fetchData();
    };

    const getIconForCategory = (categoryId: string | null) => {
        if (!categoryId) return null;
        const icon = icons.find(i => i.id === categoryId);
        return icon ? <div className="w-6 h-6 text-primary" dangerouslySetInnerHTML={{ __html: icon.svgContent }} /> : null;
    }

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div></div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Управление Категориями</h1>
                <button onClick={handleCreate} className="bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded-lg">
                    + Создать категорию
                </button>
            </div>
            
            <div className="bg-base-100 p-6 rounded-lg shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map(cat => (
                        <div key={cat.id} className="bg-base-200 p-4 rounded-md">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    {getIconForCategory(cat.iconId)}
                                    <h3 className="font-bold text-lg">{cat.name}</h3>
                                </div>
                                <button onClick={() => handleEdit(cat)} className="text-sm text-sky-400 hover:underline">Редактировать</button>
                            </div>
                            <p className="text-xs text-base-content/70">{cat.fields.length} полей</p>
                        </div>
                    ))}
                </div>
            </div>

            {editingCategory && (
                <CategoryModal 
                    category={editingCategory}
                    onClose={() => setEditingCategory(null)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default CategoriesPage;
