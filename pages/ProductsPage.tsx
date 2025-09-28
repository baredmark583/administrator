import React, { useState, useEffect, useMemo } from 'react';
import { backendApiService } from '../services/backendApiService';
import type { AdminPanelProduct } from '../services/adminApiService';
import type { CategorySchema } from '../constants';
import ProductsTable from '../components/ProductsTable';
import ProductModerationModal from '../components/ProductModerationModal';

const ProductsPage: React.FC = () => {
    const [products, setProducts] = useState<AdminPanelProduct[]>([]);
    const [categories, setCategories] = useState<CategorySchema[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [moderatingProduct, setModeratingProduct] = useState<AdminPanelProduct | null>(null);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const [productsResult, categoriesResult] = await Promise.all([
                backendApiService.getProducts(),
                backendApiService.getCategories()
            ]);
            setProducts(productsResult);
            setCategories(categoriesResult);
        } catch (error) {
            console.error("Failed to fetch products or categories", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        return products
            .filter(product => {
                if (statusFilter === 'All') return true;
                const normalizedStatus = product.status.replace(' ', '');
                return normalizedStatus === statusFilter;
            })
            .filter(product =>
                product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.sellerName.toLowerCase().includes(searchQuery.toLowerCase())
            );
    }, [products, searchQuery, statusFilter]);
    
    const handleAction = (product: AdminPanelProduct) => {
        setModeratingProduct(product);
    };

    const handleDelete = async (product: AdminPanelProduct) => {
        if (window.confirm(`Вы уверены, что хотите удалить товар "${product.title}"? Это действие необратимо.`)) {
            // Optimistic update
            setProducts(prev => prev.filter(p => p.id !== product.id));
            try {
                await backendApiService.deleteProduct(product.id);
            } catch (error) {
                console.error("Failed to delete product:", error);
                alert("Ошибка удаления товара.");
                fetchProducts(); // Revert on error
            }
        }
    };
    
    const handleSaveProduct = async (updates: Partial<AdminPanelProduct>) => {
        if (!moderatingProduct) return;
        
        const originalProducts = [...products];
        // Optimistic update
        setProducts(prev => prev.map(p => p.id === moderatingProduct.id ? { ...p, ...updates } : p));
        setModeratingProduct(null);

        try {
            const updatedProduct = await backendApiService.updateProduct(moderatingProduct.id, updates);
            // Sync with the exact backend response
            setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        } catch (error) {
            console.error("Failed to update product:", error);
            alert("Ошибка сохранения. Данные будут возвращены к исходному состоянию.");
            setProducts(originalProducts); // Revert on error
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Все товары</h1>
                <button className="bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded-lg">
                    Добавить товар
                </button>
            </div>

            <div className="bg-base-100 p-6 rounded-lg shadow-lg">
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Поиск по названию или продавцу..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:max-w-xs bg-base-300 border border-base-100 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full sm:max-w-xs bg-base-300 border border-base-100 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="All">Все статусы</option>
                        <option value="Active">Активные</option>
                        <option value="PendingModeration">На модерации</option>
                        <option value="Rejected">Отклоненные</option>
                    </select>
                </div>
                
                {isLoading ? (
                     <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div></div>
                ) : (
                    <ProductsTable
                        products={filteredProducts}
                        onAction={handleAction}
                        onDelete={handleDelete}
                    />
                )}
            </div>
            {moderatingProduct && (
                <ProductModerationModal
                    product={moderatingProduct}
                    onClose={() => setModeratingProduct(null)}
                    onSave={handleSaveProduct}
                />
            )}
        </div>
    );
};

export default ProductsPage;