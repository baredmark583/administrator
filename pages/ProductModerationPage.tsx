import React, { useState, useEffect, useMemo } from 'react';
import { adminApiService, AdminPanelProduct } from '../services/adminApiService';
import { backendApiService } from '../services/backendApiService';
import ProductsTable from '../components/ProductsTable';
import ProductModerationModal from '../components/ProductModerationModal';

const ProductModerationPage: React.FC = () => {
    const [products, setProducts] = useState<AdminPanelProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [moderatingProduct, setModeratingProduct] = useState<AdminPanelProduct | null>(null);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const result = await backendApiService.getProducts();
            setProducts(result.filter(p => p.status === 'Pending Moderation'));
        } catch (error) {
            console.error("Failed to fetch products for moderation", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);
    
    const handleSaveModeration = async (product: AdminPanelProduct, newStatus: 'Active' | 'Rejected', rejectionReason?: string) => {
        const updatedProduct = { ...product, status: newStatus, rejectionReason };
        
        // Optimistic update (remove from list)
        setProducts(prev => prev.filter(p => p.id !== product.id));
        setModeratingProduct(null);

        try {
            // FIX: Pass the correct payload with status and rejectionReason to the backend service.
            await backendApiService.updateProduct(product.id, { status: newStatus, rejectionReason });
        } catch (error) {
            console.error("Failed to update product status:", error);
            alert("Ошибка сохранения статуса. Данные будут возвращены к исходному состоянию.");
            fetchProducts(); // Revert on error
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
                        onModerate={setModeratingProduct}
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
                    onSave={handleSaveModeration}
                />
            )}
        </div>
    );
};

export default ProductModerationPage;