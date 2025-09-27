import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { backendApiService } from '../services/backendApiService';
import type { CategorySchema, CategoryField } from '../constants';

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
    onDataChange: () => void;
    parentName?: string;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ category, onClose, onDataChange, parentName }) => {
    const [editedCategory, setEditedCategory] = useState<CategorySchema>(category);
    const [isSaving, setIsSaving] = useState(false);
    
    const modalTitle = category.id?.startsWith('new_')
        ? (parentName ? `Новая подкатегория для "${parentName}"` : "Новая категория")
        : `Редактор категории "${category.name}"`;


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
        const isNew = editedCategory.id.startsWith('new_');
        if (isNew) {
            await backendApiService.createCategory(editedCategory);
        } else {
            await backendApiService.updateCategory(editedCategory.id, editedCategory);
        }
        onDataChange();
        setIsSaving(false);
        onClose();
    };

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
                <div className="p-4 mt-auto border-t border-base-300 flex justify-end items-center">
                    <div className="flex justify-end gap-3">
                        <button onClick={onClose} className="bg-base-300 hover:bg-base-200 text-white font-bold py-2 px-4 rounded">Отмена</button>
                        <button onClick={handleSave} disabled={isSaving} className="bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded">
                            {isSaving ? 'Сохранение...' : 'Сохранить'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Page ---

type Breadcrumb = { id: string | null; name: string };

const CategoriesPage: React.FC = () => {
    const [allCategories, setAllCategories] = useState<CategorySchema[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingCategory, setEditingCategory] = useState<CategorySchema | null>(null);
    const [isAiGenerating, setIsAiGenerating] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    
    const [currentParentId, setCurrentParentId] = useState<string | null>(null);
    const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([{ id: null, name: 'Главная' }]);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const catResult = await backendApiService.getCategories();
            setAllCategories(catResult);
        } catch (error) {
            console.error("Failed to fetch page data", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const findCategoryById = (categories: CategorySchema[], id: string): CategorySchema | null => {
        for (const category of categories) {
            if (category.id === id) return category;
            if (category.subcategories) {
                const found = findCategoryById(category.subcategories, id);
                if (found) return found;
            }
        }
        return null;
    };
    
    const currentCategories = useMemo(() => {
        if (currentParentId === null) {
            return allCategories;
        }
        const parent = findCategoryById(allCategories, currentParentId);
        return parent?.subcategories || [];
    }, [currentParentId, allCategories]);

    const handleCategoryClick = (category: CategorySchema) => {
        setCurrentParentId(category.id);
        setBreadcrumbs(prev => [...prev, { id: category.id, name: category.name }]);
    };
    
    const handleBreadcrumbClick = (id: string | null, index: number) => {
        setCurrentParentId(id);
        setBreadcrumbs(prev => prev.slice(0, index + 1));
    };

    const handleEdit = (category: CategorySchema) => {
        setEditingCategory(JSON.parse(JSON.stringify(category)));
    };
    
    const handleCreate = () => {
        const newCategory: CategorySchema = {
            id: `new_cat_${Date.now()}`,
            name: 'Новая категория',
            iconUrl: null,
            fields: [],
            parentId: currentParentId,
        };
        setEditingCategory(newCategory);
    };
    
    const handleDelete = async (category: CategorySchema) => {
        if (deletingId) return;

        const confirmation = window.confirm(
            `Вы уверены, что хотите удалить категорию "${category.name}"? Все вложенные подкатегории будут также удалены.`
        );
        if (!confirmation) return;

        setDeletingId(category.id);
        try {
            await backendApiService.deleteCategory(category.id);
            fetchData();
        } catch (error) {
            console.error("Failed to delete category:", error);
            alert('Не удалось удалить категорию. ' + (error as Error).message);
        } finally {
            setDeletingId(null);
        }
    };

    const handleAiGenerate = async () => {
        const parentCategory = currentParentId ? findCategoryById(allCategories, currentParentId) : null;
        if (!parentCategory) return;
        
        const confirmation = window.confirm(
            `Это действие сгенерирует и сохранит полную структуру подкатегорий для "${parentCategory.name}", заменив все существующие. Продолжить?`
        );
        if (!confirmation) return;

        setIsAiGenerating(true);
        try {
            await backendApiService.generateAndSaveSubcategories(parentCategory.id, parentCategory.name);
            alert('Подкатегории успешно сгенерированы и сохранены!');
            fetchData(); // Refresh all data
        } catch (error) {
            console.error(error);
            alert('Не удалось сгенерировать подкатегории. ' + (error as Error).message);
        } finally {
            setIsAiGenerating(false);
        }
    };
    
    const currentParentName = breadcrumbs[breadcrumbs.length - 1]?.name || 'Главная';

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div></div>;
    }

    return (
        <div>
             <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Управление Категориями</h1>
                    <div className="text-sm text-base-content/70 mt-1">
                        {breadcrumbs.map((crumb, index) => (
                            <span key={crumb.id || 'root'}>
                                <button onClick={() => handleBreadcrumbClick(crumb.id, index)} className="hover:underline">
                                    {crumb.name}
                                </button>
                                {index < breadcrumbs.length - 1 && ' / '}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="flex gap-2">
                    {currentParentId && (
                         <button 
                            onClick={handleAiGenerate}
                            disabled={isAiGenerating}
                            className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 disabled:bg-gray-500"
                        >
                             {isAiGenerating ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : '🤖'}
                            <span>{isAiGenerating ? 'Генерация...' : 'Сгенерировать подкатегории с AI'}</span>
                        </button>
                    )}
                    <button onClick={handleCreate} className="bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded-lg">
                        + Создать категорию
                    </button>
                </div>
            </div>
            
            <div className="bg-base-100 p-6 rounded-lg shadow-lg">
                {currentCategories.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {currentCategories.map(cat => (
                           <div key={cat.id} className="group relative">
                                <button
                                    onClick={() => handleCategoryClick(cat)}
                                    className="w-full bg-base-200 p-4 rounded-lg text-left transition-all duration-200 hover:bg-base-300 hover:shadow-lg hover:ring-2 hover:ring-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            {cat.iconUrl && <img src={cat.iconUrl} alt={cat.name} className="w-8 h-8 rounded-md object-contain flex-shrink-0" />}
                                            <div>
                                                <h3 className="font-bold text-white">{cat.name}</h3>
                                                <p className="text-xs text-base-content/70">
                                                    {cat.subcategories?.length || 0} подкатегорий, {cat.fields.length} полей
                                                </p>
                                            </div>
                                        </div>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-base-content/50 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </button>
                                
                                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                                    <button
                                        onClick={() => handleEdit(cat)}
                                        className="p-1.5 bg-sky-600/80 hover:bg-sky-600 text-white rounded-full"
                                        title={`Настроить поля для "${cat.name}"`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cat)}
                                        disabled={deletingId === cat.id}
                                        className="p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-full disabled:opacity-50"
                                        title={`Удалить "${cat.name}"`}
                                    >
                                        {deletingId === cat.id ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <h2 className="text-2xl font-bold text-white mb-2">Здесь пока пусто</h2>
                        <p className="text-base-content/70">Создайте первую подкатегорию для раздела "{currentParentName}".</p>
                    </div>
                )}
            </div>

            {editingCategory && (
                <CategoryModal 
                    category={editingCategory}
                    onClose={() => setEditingCategory(null)}
                    onDataChange={fetchData}
                    parentName={currentParentName}
                />
            )}
        </div>
    );
};

export default CategoriesPage;