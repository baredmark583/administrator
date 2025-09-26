import React, { useState, useEffect } from 'react';
// FIX: Corrected import to pull backendApiService from the correct file.
import { backendApiService } from '../services/backendApiService';
import { AdminIcon } from '../services/adminApiService';
// FIX: Import CategorySchema and CategoryField from constants where they are exported.
import { CategorySchema, CategoryField } from '../constants';

// --- Components ---

interface FieldEditorProps {
    field: CategoryField;
    onUpdate: (fieldId: string, updates: Partial<CategoryField>) => void;
    onRemove: (fieldId: string) => void;
}

const FieldEditor: React.FC<FieldEditorProps> = ({ field, onUpdate, onRemove }) => {
    const [options, setOptions] = useState((field.options || []).join(', '));

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
                onChange={e => onUpdate(field.id, { label: e.target.value, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
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
    parentName?: string;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ category, onClose, onSave, parentName }) => {
    const [editedCategory, setEditedCategory] = useState<CategorySchema>(category);
    const [isSaving, setIsSaving] = useState(false);
    
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
    
    const modalTitle = parentName ? `Редактор подкатегории для "${parentName}"` : "Редактор категории";

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b border-base-300">
                    <h2 className="text-xl font-bold">{modalTitle}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <input 
                            type="text" 
                            value={editedCategory.name} 
                            onChange={e => setEditedCategory(prev => ({...prev, name: e.target.value}))}
                            className="w-full bg-base-200 border border-base-300 rounded p-2"
                        />
                         <div className="flex items-center gap-2">
                            {editedCategory.iconUrl && <img src={editedCategory.iconUrl} alt="Preview" className="w-8 h-8 rounded" />}
                            <input 
                                type="text" 
                                placeholder="URL иконки"
                                value={editedCategory.iconUrl || ''} 
                                onChange={e => setEditedCategory(prev => ({ ...prev, iconUrl: e.target.value || null }))}
                                className="w-full bg-base-200 border border-base-300 rounded p-2"
                            />
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


interface CategoryTreeItemProps {
    category: CategorySchema;
    level: number;
    getIconForCategory: (iconUrl: string | null) => JSX.Element | null;
    onEdit: (category: CategorySchema) => void;
    onCreateSubcategory: (parentId: string) => void;
}

const CategoryTreeItem: React.FC<CategoryTreeItemProps> = ({ category, level, getIconForCategory, onEdit, onCreateSubcategory }) => {
    return (
        <div style={{ marginLeft: `${level * 20}px` }}>
            <div className="bg-base-200 p-3 rounded-md">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        {getIconForCategory(category.iconUrl)}
                        <h3 className="font-bold text-white">{category.name}</h3>
                        <span className="text-xs text-base-content/70">({category.fields.length} полей)</span>
                    </div>
                    <div className="flex items-center gap-3">
                        {level < 3 && ( // Allow creating subcategories up to level 4
                             <button onClick={() => onCreateSubcategory(category.id)} className="text-sm text-primary hover:underline">+ Добавить подкатегорию</button>
                        )}
                        <button onClick={() => onEdit(category)} className="text-sm text-sky-400 hover:underline">Редактировать</button>
                    </div>
                </div>
            </div>
             {category.subcategories && category.subcategories.length > 0 && (
               <div className="mt-2 space-y-2">
                   {category.subcategories.map(sub => (
                       <CategoryTreeItem 
                           key={sub.id} 
                           category={sub} 
                           level={level + 1} 
                           getIconForCategory={getIconForCategory} 
                           onEdit={onEdit} 
                           onCreateSubcategory={onCreateSubcategory} 
                       />
                   ))}
               </div>
           )}
        </div>
    );
};


// --- Page ---

const CategoriesPage: React.FC = () => {
    const [categories, setCategories] = useState<CategorySchema[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingCategory, setEditingCategory] = useState<CategorySchema | null>(null);

    useEffect(() => {
        fetchData();
    }, []);
    
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const catResult = await backendApiService.getCategories();
            setCategories(catResult);
        } catch (error) {
            console.error("Failed to fetch page data", error);
        } finally {
            setIsLoading(false);
        }
    }

    const handleEdit = (category: CategorySchema) => {
        setEditingCategory(JSON.parse(JSON.stringify(category))); // Deep copy to avoid direct mutation
    };
    
    const handleCreateParent = () => {
        const newCategory: CategorySchema = {
            id: `new_cat_${Date.now()}`,
            name: 'Новая категория',
            iconUrl: null,
            fields: [],
            parentId: null,
        };
        setEditingCategory(newCategory);
    };

    const handleCreateSubcategory = (parentId: string) => {
        const newSubcategory: CategorySchema = {
            id: `new_subcat_${Date.now()}`,
            name: 'Новая подкатегория',
            iconUrl: null,
            fields: [],
            parentId: parentId,
        };
        setEditingCategory(newSubcategory);
    };


    const handleSave = async (categoryToSave: CategorySchema) => {
        const isNew = categoryToSave.id.startsWith('new_');
        if (isNew) {
            await backendApiService.createCategory(categoryToSave);
        } else {
            await backendApiService.updateCategory(categoryToSave.id, categoryToSave);
        }
        fetchData();
    };

    const getIconForCategory = (iconUrl: string | null) => {
        if (!iconUrl) return null;
        return <img src={iconUrl} alt="icon" className="w-6 h-6 rounded object-contain flex-shrink-0" />;
    }

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div></div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Управление Категориями</h1>
                <button onClick={handleCreateParent} className="bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded-lg">
                    + Создать родительскую категорию
                </button>
            </div>
            
            <div className="bg-base-100 p-6 rounded-lg shadow-lg">
                <div className="space-y-4">
                    {categories.map(cat => (
                        <CategoryTreeItem 
                           key={cat.id} 
                           category={cat} 
                           level={0}
                           getIconForCategory={getIconForCategory}
                           onEdit={handleEdit}
                           onCreateSubcategory={handleCreateSubcategory}
                       />
                    ))}
                </div>
            </div>

            {editingCategory && (
                <CategoryModal 
                    category={editingCategory}
                    onClose={() => setEditingCategory(null)}
                    onSave={handleSave}
                    parentName={editingCategory.parentId ? categories.find(c => c.id === editingCategory.parentId)?.name : undefined}
                />
            )}
        </div>
    );
};

export default CategoriesPage;