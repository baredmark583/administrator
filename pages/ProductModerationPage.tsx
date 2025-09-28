import React, { useState, useEffect } from 'react';
import { backendApiService } from '../services/backendApiService';
import type { AdminPanelProduct } from '../services/adminApiService';
import type { CategorySchema } from '../constants';
import ProductsTable from '../components/ProductsTable';
import ProductModerationModal from '../components/ProductModerationModal';

const ProductModerationPage: React.FC = () => {
    const [products, setProducts] = useState<AdminPanelProduct[]>([]);
    const [categories, setCategories] = useState<CategorySchema[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [moderatingProduct, setModeratingProduct] = useState<AdminPanelProduct | null>(null);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const [productsResult, categoriesResult] = await Promise.all([
                backendApiService.getProducts(),
                backendApiService.getCategories()
            ]);
            setProducts(productsResult.filter(p => p.status === 'Pending Moderation'));
            setCategories(categoriesResult);
        } catch (error) {
            console.error("Failed to fetch products for moderation", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);
    
    const handleAction = (product: AdminPanelProduct) => {
        setModeratingProduct(product);
    };

    const handleDelete = async (product: AdminPanelProduct) => {
        if (window.confirm(`Вы уверены, что хотите удалить товар "${product.title}"? Это действие необратимо.`)) {
            setProducts(prev => prev.filter(p => p.id !== product.id)); // Optimistic update
            try {
                await backendApiService.deleteProduct(product.id);
            } catch (error) {
                console.error("Failed to delete product:", error);
                alert("Ошибка удаления товара.");
                fetchProducts(); // Revert
            }
        }
    };
    
    const handleSaveProduct = async (updates: Partial<AdminPanelProduct>) => {
        if (!moderatingProduct) return;
        
        const originalProducts = [...products];
        // Optimistic update (remove from list as its status will change)
        setProducts(prev => prev.filter(p => p.id !== moderatingProduct.id));
        setModeratingProduct(null);

        try {
            await backendApiService.updateProduct(moderatingProduct.id, updates);
        } catch (error) {
            console.error("Failed to update product:", error);
            alert("Ошибка сохранения. Данные будут возвращены к исходному состоянию.");
            setProducts(originalProducts); // Revert on error by re-adding the item
            fetchProducts(); // Or just refetch
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Модерация Товаров</h1>

            <div className="bg-base-100 p-6 rounded-lg shadow-lg">
                {isLoading ? (
                     <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div></div>
                ) : products.length > 0 ? (
                    <ProductsTable
                        products={products}
                        onAction={handleAction}
                        onDelete={handleDelete}
                    />
                ) : (
                    <div className="text-center py-16">
                        <h2 className="text-2xl font-bold text-white mb-2">Все чисто!</h2>
                        <p className="text-base-content/70">Нет товаров, ожидающих модерации.</p>
                    </div>
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

export default ProductModerationPage;