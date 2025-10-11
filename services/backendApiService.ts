// This service handles all communication with the backend API for the admin panel.
import type { User as AppUser, Product as AppProduct, Order as AppOrder, Dispute as AppDispute, Icon as AppIcon, Proposal as AppProposal } from '../../types';
import type { CategorySchema } from '../constants';

// --- TYPES ---
// Re-defining some types here for clarity and to match what the admin panel needs.
// In a real monorepo, these would be shared.

// FIX: Added Setting type for settings management.
export interface Setting {
    key: string;
    value: string;
}

export interface SalesChartDataPoint {
    name: string;
    sales: number;
}
export interface AdminDashboardData {
    kpis: {
        totalRevenueToday: number;
        platformProfit: number;
        newOrdersToday: number;
        productsForModeration: number;
        activeDisputes: number;
    };
    salesData: SalesChartDataPoint[];
    recentActivity: {
        id: string;
        type: 'new_user' | 'new_order';
        text: string;
        time: string;
    }[];
    topSellers: {
        id: string;
        name: string;
        avatarUrl: string;
        totalRevenue: number;
        salesCount: number;
    }[];
}

export interface AdminPanelUser {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
    registrationDate: string; // Formatted date string
    status: 'Standard' | 'Pro'; // Mapped from verificationLevel
    role: 'USER' | 'MODERATOR' | 'SUPER_ADMIN';
    balance: number;
    isBlocked: boolean;
}

export interface AdminPanelUserDetails extends AdminPanelUser {
    products: AdminPanelProduct[];
    sales: AdminPanelOrder[];
    purchases: AdminPanelOrder[];
    disputes: AdminPanelDispute[];
    financials: {
        gmv: number;
        totalSpent: number;
        platformCommission: number;
    };
}

export interface AdminPanelProduct {
    id: string;
    title: string;
    imageUrls: string[];
    sellerName: string;
    category: string;
    price: number;
    status: 'Active' | 'Pending Moderation' | 'Rejected';
    dateAdded: string;
    description: string;
    dynamicAttributes: Record<string, string | number>;
    rejectionReason?: string;
}

export interface AdminPanelOrder {
    id: string;
    customerName: string;
    date: string;
    total: number;
    status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED' | 'SHIPPED_TO_EXPERT' | 'PENDING_AUTHENTICATION' | 'AUTHENTICATION_PASSED' | 'NFT_ISSUED' | 'AUTHENTICATION_FAILED';
    customerInfo: {
        name: string;
        email: string;
        shippingAddress: string;
    };
    sellerName: string;
    items: {
        productId: string;
        title: string;
        imageUrl: string;
        quantity: number;
        price: number;
    }[];
    buyer: any;
    seller: any;
}

export interface AdminTransaction {
    id: string;
    date: string;
    type: 'Sale' | 'Withdrawal' | 'Deposit' | 'Commission' | 'Refund';
    from: { name: string };
    to: { name: string };
    amount: number;
    status: 'Completed' | 'Pending' | 'Failed';
}

export interface AdminGlobalPromoCode {
    id: string;
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue: number;
    isActive: boolean;
    uses: number;
    maxUses?: number;
    minPurchaseAmount?: number;
}


export interface DisputeMessage {
    id: string;
    senderId: string;
    senderName: string;
    senderAvatar: string;
    timestamp: number;
    text?: string;
}

export interface AdminPanelDispute {
    id: string; // Order ID
    createdAt: string;
    status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED_BUYER' | 'RESOLVED_SELLER';
    order: {
        id: string;
        customerName: string;
        sellerName: string;
        total: number;
        items: {
            title: string,
            imageUrl: string,
        }[];
    };
    messages: DisputeMessage[];
}

export interface AdminPanelDisputeDetails extends AdminPanelDispute {
    buyer: AdminPanelUser;
    seller: AdminPanelUser;
    fullOrder: AdminPanelOrder;
    buyerStats: { totalOrders: number; disputeRate: number; };
    sellerStats: { totalSales: number; disputeRate: number; };
}

export type AdminIcon = AppIcon;

export interface AdminPanelProposal {
    id: string;
    title: string;
    proposerName: string;
    createdAt: string;
    endsAt: string;
    status: 'ACTIVE' | 'PASSED' | 'REJECTED' | 'EXECUTED';
    votesFor: number;
    votesAgainst: number;
}


// --- API IMPLEMENTATION ---

// FIX: Cast import.meta to any to resolve TypeScript error in environments where Vite types are not configured.
const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:3001';

const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    try {
        const token = localStorage.getItem('adminToken');
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || 'An API error occurred');
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return response.json();
        }
    } catch (error) {
        console.error(`Admin API fetch error: ${options.method || 'GET'} ${endpoint}`, error);
        throw error;
    }
};

export const backendApiService = {
    login: async (email: string, password: string): Promise<{ access_token: string; user: { email: string, role: string } }> => {
        return apiFetch('/auth/admin/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    },

    getDashboardData: async (): Promise<AdminDashboardData> => {
        const data = await apiFetch('/dashboard');
        // Simple mapping, in real app might be more complex
        return {
            ...data,
            kpis: {
                ...data.kpis,
                platformProfit: data.kpis.platformProfit || 0
            }
        };
    },
    
    // USERS
    getUsers: async (): Promise<AdminPanelUser[]> => {
        const users: AppUser[] = await apiFetch('/users');
        return users.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email || 'N/A',
            avatarUrl: u.avatarUrl,
            registrationDate: new Date((u as any).createdAt).toLocaleDateString(),
            status: u.verificationLevel === 'PRO' ? 'Pro' : 'Standard',
            // FIX: Add role to the user object mapping.
            role: (u as any).role || 'USER',
            balance: u.balance,
            isBlocked: false, // This field is missing on backend entity, mocking it.
        }));
    },

    getUserDetails: async(userId: string): Promise<AdminPanelUserDetails> => {
        const userDetails = await apiFetch(`/users/${userId}/details`);
        return {
            id: userDetails.id,
            name: userDetails.name,
            email: userDetails.email || 'N/A',
            avatarUrl: userDetails.avatarUrl,
            registrationDate: new Date(userDetails.createdAt).toLocaleDateString(),
            status: userDetails.verificationLevel === 'PRO' ? 'Pro' : 'Standard',
            // FIX: Add role to the user details object mapping.
            role: userDetails.role || 'USER',
            balance: userDetails.balance,
            isBlocked: false, // Mock
            products: userDetails.products.map(p => ({
                id: p.id,
                title: p.title,
                imageUrls: p.imageUrls,
                sellerName: userDetails.name,
                category: p.category,
                price: p.price,
                status: p.status,
                dateAdded: new Date(p.createdAt).toLocaleDateString(),
                description: p.description,
                dynamicAttributes: p.dynamicAttributes,
                rejectionReason: p.rejectionReason,
            })),
            sales: userDetails.sales.map(o => ({
                ...o,
                customerName: o.buyer.name,
                date: new Date(o.createdAt).toLocaleDateString(),
            })),
            purchases: userDetails.purchases.map(o => ({
                ...o,
                customerName: o.buyer.name,
                date: new Date(o.createdAt).toLocaleDateString(),
            })),
            disputes: userDetails.disputes.map(d => ({
                ...d,
                createdAt: new Date(d.createdAt).toLocaleDateString(),
            })),
            financials: userDetails.financials,
        };
    },
    
    updateUser: async (user: Partial<AdminPanelUser>): Promise<AdminPanelUser> => {
        // FIX: Added role to the payload to be sent to the backend.
        const payload: Partial<AppUser> = {
            name: user.name,
            email: user.email,
            balance: user.balance,
            verificationLevel: user.status === 'Pro' ? 'PRO' : 'NONE',
            role: user.role,
        };
        const updatedUser: AppUser = await apiFetch(`/users/${user.id}`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
        });
        return {
            ...user,
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            balance: updatedUser.balance,
            status: updatedUser.verificationLevel === 'PRO' ? 'Pro' : 'Standard',
            role: (updatedUser as any).role,
        } as AdminPanelUser;
    },

    // PRODUCTS
    getProducts: async (): Promise<AdminPanelProduct[]> => {
        const products: AppProduct[] = await apiFetch('/products');
        return products.map(p => ({
            id: p.id,
            title: p.title,
            imageUrls: p.imageUrls,
            sellerName: p.seller?.name || 'N/A',
            category: p.category,
            price: p.price || 0,
            status: p.status,
            dateAdded: new Date(p.createdAt).toLocaleDateString(),
            description: p.description,
            dynamicAttributes: p.dynamicAttributes,
            rejectionReason: p.rejectionReason,
        }));
    },
    
    updateProduct: async(productId: string, updates: Partial<AdminPanelProduct>): Promise<AdminPanelProduct> => {
        const updatedProduct: AppProduct = await apiFetch(`/products/${productId}`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
        });
        return {
            id: updatedProduct.id,
            title: updatedProduct.title,
            imageUrls: updatedProduct.imageUrls,
            sellerName: updatedProduct.seller?.name || 'N/A',
            category: updatedProduct.category,
            price: updatedProduct.price || 0,
            status: updatedProduct.status,
            dateAdded: new Date(updatedProduct.createdAt).toLocaleDateString(),
            description: updatedProduct.description,
            dynamicAttributes: updatedProduct.dynamicAttributes,
            rejectionReason: updatedProduct.rejectionReason,
        };
    },
    
    deleteProduct: async (productId: string): Promise<void> => {
        return apiFetch(`/products/${productId}`, { method: 'DELETE' });
    },
    
    // CATEGORIES
    getCategories: async(): Promise<CategorySchema[]> => {
        return apiFetch('/categories');
    },

    createCategory: async (category: CategorySchema): Promise<CategorySchema> => {
        return apiFetch('/categories', {
            method: 'POST',
            body: JSON.stringify(category),
        });
    },

    updateCategory: async (id: string, category: CategorySchema): Promise<CategorySchema> => {
        return apiFetch(`/categories/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(category),
        });
    },

    deleteCategory: async (id: string): Promise<void> => {
        return apiFetch(`/categories/${id}`, { method: 'DELETE' });
    },
    
    generateAndSaveSubcategories: async (parentId: string, parentName: string): Promise<{ success: boolean }> => {
        return apiFetch('/ai/generate-and-save-subcategories', {
            method: 'POST',
            body: JSON.stringify({ parentId, parentName }),
        });
    },
    
    // ICONS
    getIcons: async (): Promise<AdminIcon[]> => {
        return apiFetch('/icons');
    },
    
    upsertIcon: async (icon: Partial<Omit<AdminIcon, 'id'>>): Promise<AdminIcon> => {
        return apiFetch('/icons/upsert', {
            method: 'PATCH',
            body: JSON.stringify(icon),
        });
    },

    // ORDERS, DISPUTES, ETC. (Need to implement mapping from backend entities)
    getOrders: async (): Promise<AdminPanelOrder[]> => {
        const orders: AppOrder[] = await apiFetch('/orders');
        // FIX: Added missing 'buyer' and 'seller' properties and used 'orderDate' instead of 'createdAt'.
        return orders.map(o => ({
            id: o.id,
            customerName: o.buyer.name,
            date: new Date(o.orderDate).toLocaleDateString(),
            total: o.total,
            status: o.status,
            customerInfo: {
                name: o.buyer.name,
                email: o.buyer.email || 'N/A',
                shippingAddress: `${o.shippingAddress.city}, ${o.shippingAddress.postOffice}`,
            },
            sellerName: o.seller.name,
            items: o.items.map(i => ({
                productId: i.product.id,
                title: i.product.title,
                imageUrl: i.product.imageUrls[0],
                quantity: i.quantity,
                price: i.price,
            })),
            buyer: o.buyer,
            seller: o.seller,
        }));
    },

    updateOrder: async (order: AdminPanelOrder): Promise<AdminPanelOrder> => {
        // FIX: The status type mismatch is resolved by widening the AdminPanelOrder['status'] type.
        const updatedOrder: AppOrder = await apiFetch(`/orders/${order.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status: order.status }),
        });
        return { ...order, status: updatedOrder.status };
    },

    getDisputes: async (): Promise<AdminPanelDispute[]> => {
        const disputes: AppDispute[] = await apiFetch('/disputes');
        return disputes.map(d => ({
            id: d.id,
            // FIX: Use 'createdAt' from the dispute object, which is now available on the AppDispute type.
            createdAt: new Date(d.createdAt).toLocaleDateString(),
            status: d.status,
            order: {
                id: d.order.id,
                customerName: d.order.buyer.name,
                sellerName: d.order.seller.name,
                total: d.order.total,
                items: d.order.items.map(i => ({ title: i.product.title, imageUrl: i.product.imageUrls[0] })),
            },
            messages: d.messages,
        }));
    },

    // The other methods need full implementations...
    getDisputeDetails: async(disputeId: string): Promise<AdminPanelDisputeDetails> => {
        // This would be a new backend endpoint
        const dispute = (await backendApiService.getDisputes()).find(d => d.id === disputeId);
        const order = (await backendApiService.getOrders()).find(o => o.id === disputeId);
        const users = await backendApiService.getUsers();
        const buyer = users.find(u => u.name === order.customerName);
        const seller = users.find(u => u.name === order.sellerName);
        return {
            ...dispute,
            buyer,
            seller,
            fullOrder: order,
            buyerStats: { totalOrders: 1, disputeRate: 100 },
            sellerStats: { totalSales: 1, disputeRate: 100 },
        } as AdminPanelDisputeDetails
    },
    updateDispute: async(dispute: AdminPanelDispute): Promise<AdminPanelDispute> => {
        return apiFetch(`/disputes/${dispute.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status: dispute.status, messages: dispute.messages }),
        });
    },

    getTransactions: async(): Promise<AdminTransaction[]> => {
        return apiFetch('/transactions');
    },
    getGlobalPromoCodes: async(): Promise<AdminGlobalPromoCode[]> => {
        // Mocked as backend doesn't have this yet.
        return Promise.resolve([]);
    },
    createGlobalPromoCode: async(data: Omit<AdminGlobalPromoCode, 'id' | 'uses'>): Promise<AdminGlobalPromoCode> => {
        return Promise.resolve({ ...data, id: 'promo-global-1', uses: 0 });
    },
    deleteGlobalPromoCode: async(id: string): Promise<void> => {
        return Promise.resolve();
    },

    // GOVERNANCE
    getAdminProposals: async (): Promise<AdminPanelProposal[]> => {
        const proposals: AppProposal[] = await apiFetch('/governance/proposals/admin');
        return proposals.map(p => ({
            id: p.id,
            title: p.title,
            proposerName: p.proposer.name,
            createdAt: new Date(p.createdAt).toLocaleDateString(),
            endsAt: new Date(p.endsAt).toLocaleDateString(),
            status: p.status,
            votesFor: p.votesFor,
            votesAgainst: p.votesAgainst,
        }));
    },
    updateProposal: async (id: string, updates: { status: 'EXECUTED' }): Promise<AdminPanelProposal> => {
        const updated: AppProposal = await apiFetch(`/governance/proposals/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
        });
        return {
            id: updated.id,
            title: updated.title,
            proposerName: updated.proposer.name,
            createdAt: new Date(updated.createdAt).toLocaleDateString(),
            endsAt: new Date(updated.endsAt).toLocaleDateString(),
            status: updated.status,
            votesFor: updated.votesFor,
            votesAgainst: updated.votesAgainst,
        };
    },
    deleteProposal: async (id: string): Promise<void> => {
        return apiFetch(`/governance/proposals/${id}`, { method: 'DELETE' });
    },


    // FIX: Added missing methods for Telegram and Settings.
    // TELEGRAM
    sendMessageToUser: async(userId: string, message: string): Promise<{ message: string }> => {
        return apiFetch('/telegram/send-message', {
            method: 'POST',
            body: JSON.stringify({ userId, message }),
        });
    },

    broadcastMessage: async (message: string): Promise<{ message: string }> => {
        return apiFetch('/telegram/broadcast', {
            method: 'POST',
            body: JSON.stringify({ message }),
        });
    },

    // SETTINGS
    getSettings: async (): Promise<Setting[]> => {
        return apiFetch('/settings');
    },

    updateSettings: async(settings: Setting[]): Promise<Setting[]> => {
        return apiFetch('/settings', {
            method: 'PATCH',
            body: JSON.stringify(settings),
        });
    },
};