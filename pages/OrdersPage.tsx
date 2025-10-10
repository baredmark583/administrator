import React, { useState, useEffect, useMemo } from 'react';
import { backendApiService } from '../services/backendApiService';
import type { AdminPanelOrder } from '../services/adminApiService';
import OrdersTable from '../components/OrdersTable';
import OrderDetailsModal from '../components/OrderDetailsModal';

const OrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<AdminPanelOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [viewingOrder, setViewingOrder] = useState<AdminPanelOrder | null>(null);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            // FIX: Corrected the service call to use the implemented `getOrders` method.
            const result = await backendApiService.getOrders();
            setOrders(result);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const filteredOrders = useMemo(() => {
        return orders
            .filter(order => {
                if (statusFilter === 'All') return true;
                return order.status === statusFilter;
            })
            .filter(order =>
                order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.id.toLowerCase().includes(searchQuery.toLowerCase())
            );
    }, [orders, searchQuery, statusFilter]);
    
    const handleViewDetails = (orderId: string) => {
        const orderToView = orders.find(o => o.id === orderId);
        if (orderToView) {
            setViewingOrder(orderToView);
        }
    };
    
    const handleSaveOrder = async (updatedOrder: AdminPanelOrder) => {
        // Optimistic UI update
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
        setViewingOrder(null);
        
        try {
            // FIX: Corrected the service call to use the implemented `updateOrder` method.
            await backendApiService.updateOrder(updatedOrder);
        } catch (error) {
            console.error("Failed to update order status:", error);
            alert("Ошибка сохранения статуса. Данные будут возвращены к исходному состоянию.");
            fetchOrders(); // Revert
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Управление Заказами</h1>

            <div className="bg-base-100 p-6 rounded-lg shadow-lg">
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Поиск по ID или покупателю..."
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
                        <option value="PAID">Оплачен</option>
                        <option value="SHIPPED">Отправлен</option>
                        <option value="DELIVERED">Доставлен</option>
                        <option value="COMPLETED">Завершен</option>
                        <option value="CANCELLED">Отменен</option>
                        <option value="DISPUTED">Спор</option>
                    </select>
                </div>
                
                {isLoading ? (
                     <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div></div>
                ) : (
                    <OrdersTable
                        orders={filteredOrders}
                        onViewDetails={handleViewDetails}
                    />
                )}
            </div>
            {viewingOrder && (
                <OrderDetailsModal
                    order={viewingOrder}
                    onClose={() => setViewingOrder(null)}
                    onSave={handleSaveOrder}
                />
            )}
        </div>
    );
};

export default OrdersPage;
