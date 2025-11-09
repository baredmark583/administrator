import React, { useState, useEffect } from 'react';
import { backendApiService } from '../services/backendApiService';
import type { AdminPanelProduct } from '../services/adminApiService';
import type { CategorySchema } from '../constants';
import ProductsTable from '../components/ProductsTable';
import ProductModerationModal from '../components/ProductModerationModal';
import Spinner from '../components/Spinner';

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
    
    const handleApproveProduct = async (productId: string, note?: string) => {
        try {
            await backendApiService.approveProduct(productId, { note });
            await fetchProducts();
            setModeratingProduct(null);
        } catch (error) {
            console.error("Failed to approve product:", error);
            alert("Не удалось одобрить товар. Попробуйте снова.");
        }
    };

    const handleRejectProduct = async (productId: string, reason: string, note?: string) => {
        try {
            await backendApiService.rejectProduct(productId, { reason, note });
            await fetchProducts();
            setModeratingProduct(null);
        } catch (error) {
            console.error("Failed to reject product:", error);
            alert("Не удалось отклонить товар. Попробуйте снова.");
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Модерация Товаров</h1>

            <div className="bg-base-100 p-6 rounded-lg shadow-lg">
                {isLoading ? (
                     <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
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
                    onApprove={(note) => handleApproveProduct(moderatingProduct.id, note)}
                    onReject={(reason, note) => handleRejectProduct(moderatingProduct.id, reason, note)}
                />
            )}
        </div>
    );
};

export default ProductModerationPage;
