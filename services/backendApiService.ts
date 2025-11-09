// This service handles all communication with the backend API for the admin panel.
import type {
    User as AppUser,
    Product as AppProduct,
    Order as AppOrder,
    Dispute as AppDispute,
    Icon as AppIcon,
    Proposal as AppProposal,
    LiveStream,
    WorkshopPost,
    DisputePriority,
    DisputeTier,
    DisputeAutoAction,
    DisputeAutomationLogEntry,
    DisputeResolutionTemplate,
    DisputeInternalNote,
} from '../types';
import type { CategorySchema } from '../constants';

// --- TYPES ---
// Re-defining some types here for clarity and to match what the admin panel needs.
// In a real monorepo, these would be shared.

// FIX: Added Setting type for settings management.
export interface Setting {
    key: string;
    value: string;
    updatedAt?: string;
    updatedBy?: string;
}

export interface SettingAuditEntry {
    id: string;
    key: string;
    oldValue?: string;
    newValue: string;
    updatedBy?: string;
    createdAt: string;
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
    // FIX: Add 'role' property to support admin panel functionality.
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
    appealMessage?: string;
    moderatedAt?: string;
}

export interface ProductModerationEvent {
    id: string;
    action: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'APPEALED' | 'REOPENED';
    comment?: string;
    moderator?: Pick<AdminPanelUser, 'id' | 'name' | 'avatarUrl'>;
    previousStatus?: AdminPanelProduct['status'];
    nextStatus?: AdminPanelProduct['status'];
    createdAt: string;
}

const mapProductToAdminView = (product: AppProduct): AdminPanelProduct => ({
    id: product.id,
    title: product.title,
    imageUrls: product.imageUrls,
    sellerName: product.seller?.name || 'N/A',
    category: product.category,
    price: product.price || 0,
    status: (product.status as AdminPanelProduct['status']) || 'Pending Moderation',
    dateAdded: new Date(product.createdAt).toLocaleDateString(),
    description: product.description,
    dynamicAttributes: product.dynamicAttributes,
    rejectionReason: product.rejectionReason,
    appealMessage: product.appealMessage,
    moderatedAt: product.moderatedAt ? new Date(product.moderatedAt).toLocaleString() : undefined,
});

const mapGlobalPromoCode = (promo: any): AdminGlobalPromoCode => ({
    id: promo.id,
    code: promo.code,
    discountType: promo.discountType,
    discountValue: Number(promo.discountValue || 0),
    isActive: Boolean(promo.isActive),
    uses: promo.uses ?? 0,
    maxUses: promo.maxUses ?? undefined,
    minPurchaseAmount: promo.minPurchaseAmount ?? undefined,
    validFrom: promo.validFrom ?? null,
    validUntil: promo.validUntil ?? null,
    createdAt: promo.createdAt,
    updatedAt: promo.updatedAt,
    createdBy: promo.createdBy ?? null,
    updatedBy: promo.updatedBy ?? null,
});

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
    validFrom?: string | null;
    validUntil?: string | null;
    createdAt: string;
    updatedAt: string;
    createdBy?: string | null;
    updatedBy?: string | null;
}

export type AdminGlobalPromoCodeInput = Omit<
    AdminGlobalPromoCode,
    'id' | 'uses' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>;


export interface DisputeMessage {
    id: string;
    senderId: string;
    senderName: string;
    senderAvatar: string;
    timestamp: number;
    text?: string;
    imageUrl?: string;
}

export interface AdminPanelDispute {
    id: string; // Order ID
    createdAt: string;
    status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED_BUYER' | 'RESOLVED_SELLER';
    priority: DisputePriority;
    assignedTier: DisputeTier;
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
    responseSlaDueAt?: string;
    pendingAutoAction?: DisputeAutoAction;
    pendingAutoActionAt?: string;
    automationLog?: DisputeAutomationLogEntry[];
    resolutionTemplates?: DisputeResolutionTemplate[];
    internalNotes?: DisputeInternalNote[];
    slaBreachCount?: number;
}

export interface AdminPanelDisputeDetails extends AdminPanelDispute {
    buyer: AdminPanelUser;
    seller: AdminPanelUser;
    fullOrder: AdminPanelOrder;
    buyerStats: { totalOrders: number; disputeRate: number; };
    sellerStats: { totalSales: number; disputeRate: number; };
}

export interface DisputesReport {
    total: number;
    open: number;
    resolvedBuyer: number;
    resolvedSeller: number;
    averageResolutionHours: number;
    slaBreaches: number;
    priorityBreakdown: Record<DisputePriority, number>;
    autoActionsExecuted: number;
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
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            credentials: 'include',
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

const mapBackendDispute = (dispute: AppDispute): AdminPanelDispute => {
    const orderTotal =
        (dispute.order as any)?.total ??
        dispute.order.items.reduce((sum, item) => sum + (item.price || 0), 0);
    return {
        id: dispute.id,
        createdAt: new Date(dispute.createdAt).toLocaleDateString(),
        status: dispute.status,
        priority: dispute.priority ?? 'NORMAL',
        assignedTier: dispute.assignedTier ?? 'LEVEL1',
        order: {
            id: dispute.order.id,
            customerName: dispute.order.buyer?.name ?? '—',
            sellerName: dispute.order.seller?.name ?? '—',
            total: orderTotal,
            items: dispute.order.items.map((item) => ({
                title: item.product.title,
                imageUrl: item.product.imageUrls?.[0],
            })),
        },
        messages: dispute.messages,
        responseSlaDueAt: dispute.responseSlaDueAt,
        pendingAutoAction: dispute.pendingAutoAction,
        pendingAutoActionAt: dispute.pendingAutoActionAt,
        automationLog: dispute.automationLog,
        resolutionTemplates: dispute.resolutionTemplates,
        internalNotes: dispute.internalNotes,
        slaBreachCount: dispute.slaBreachCount,
    };
};

export const backendApiService = {
    login: async (email: string, password: string): Promise<{ user: { email: string, role: string } }> => {
        return apiFetch('/auth/admin/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    },

    getFlaggedWorkshopPosts: async (limit = 20, offset = 0): Promise<{ items: WorkshopPost[]; total: number }> => {
        const query = new URLSearchParams({ limit: String(limit), offset: String(offset) });
        const [items, total] = await apiFetch(`/workshop/moderation/posts?${query.toString()}`);
        return { items, total };
    },

    moderateWorkshopPost: async (postId: string, action: 'APPROVE' | 'HIDE' | 'DELETE' | 'LOCK_COMMENTS' | 'UNLOCK_COMMENTS', notes?: string): Promise<void> => {
        await apiFetch(`/workshop/posts/${postId}/moderate`, {
            method: 'PATCH',
            body: JSON.stringify({ action, notes }),
        });
    },

    moderateWorkshopComment: async (commentId: string, action: 'APPROVE' | 'HIDE' | 'DELETE', notes?: string): Promise<void> => {
        await apiFetch(`/workshop/comments/${commentId}/moderate`, {
            method: 'PATCH',
            body: JSON.stringify({ action, notes }),
        });
    },

    getMe: async (): Promise<{id?: string, name?: string, email: string, role: 'SUPER_ADMIN' | 'MODERATOR'}> => {
        return apiFetch('/auth/me');
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
        return products.map(mapProductToAdminView);
    },
    
    updateProduct: async(productId: string, updates: Partial<AdminPanelProduct>): Promise<AdminPanelProduct> => {
        const updatedProduct: AppProduct = await apiFetch(`/products/${productId}`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
        });
        return mapProductToAdminView(updatedProduct);
    },

    approveProduct: async (productId: string, payload: { note?: string } = {}): Promise<AdminPanelProduct> => {
        const updatedProduct: AppProduct = await apiFetch(`/products/${productId}/moderation/approve`, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        return mapProductToAdminView(updatedProduct);
    },

    rejectProduct: async (productId: string, payload: { reason: string; note?: string }): Promise<AdminPanelProduct> => {
        const updatedProduct: AppProduct = await apiFetch(`/products/${productId}/moderation/reject`, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        return mapProductToAdminView(updatedProduct);
    },

    getProductModerationEvents: async (productId: string): Promise<ProductModerationEvent[]> => {
        const events = await apiFetch(`/products/${productId}/moderation/events`);
        return events.map((event: any) => ({
            id: event.id,
            action: event.action,
            comment: event.comment,
            previousStatus: event.previousStatus,
            nextStatus: event.nextStatus,
            createdAt: new Date(event.createdAt).toLocaleString(),
            moderator: event.moderator
                ? {
                    id: event.moderator.id,
                    name: event.moderator.name,
                    avatarUrl: event.moderator.avatarUrl,
                }
                : undefined,
        }));
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
    
    syncCategoriesFromBlueprint: async(categories: CategorySchema[]): Promise<void> => {
        await apiFetch('/categories/batch-create', {
            method: 'POST',
            body: JSON.stringify({ categories }),
        });
    },

    replaceCategorySubtree: async(parentId: string, categories: CategorySchema[]): Promise<void> => {
        await apiFetch(`/categories/${parentId}/import-subtree`, {
            method: 'POST',
            body: JSON.stringify({ categories }),
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

    syncMissingIcons: async(icons: Array<Partial<Omit<AdminIcon, 'id'>> & { iconUrl?: string }>): Promise<{ created: number }> => {
        return apiFetch('/icons/sync-missing', {
            method: 'PATCH',
            body: JSON.stringify({ icons }),
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
        return disputes.map(mapBackendDispute);
    },

    getDisputeDetails: async(disputeId: string): Promise<AdminPanelDisputeDetails> => {
        const dispute: AppDispute = await apiFetch(`/disputes/${disputeId}`);
        const mapped = mapBackendDispute(dispute);
        const buyer: AdminPanelUser = {
            id: dispute.order.buyer.id,
            name: dispute.order.buyer.name,
            email: dispute.order.buyer.email || 'unknown@cryptocraft.app',
            avatarUrl: dispute.order.buyer.avatarUrl || 'https://picsum.photos/seed/buyer/100/100',
            registrationDate: dispute.order.buyer.createdAt
                ? new Date(dispute.order.buyer.createdAt).toLocaleDateString()
                : '-',
            status: 'Standard',
            balance: dispute.order.buyer.balance ?? 0,
            isBlocked: false,
            role: dispute.order.buyer.role || 'USER',
        };
        const seller: AdminPanelUser = {
            id: dispute.order.seller.id,
            name: dispute.order.seller.name,
            email: dispute.order.seller.email || 'unknown@cryptocraft.app',
            avatarUrl: dispute.order.seller.avatarUrl || 'https://picsum.photos/seed/seller/100/100',
            registrationDate: dispute.order.seller.createdAt
                ? new Date(dispute.order.seller.createdAt).toLocaleDateString()
                : '-',
            status: 'Standard',
            balance: dispute.order.seller.balance ?? 0,
            isBlocked: false,
            role: dispute.order.seller.role || 'USER',
        };
        const fullOrder: AdminPanelOrder = {
            id: dispute.order.id,
            customerName: dispute.order.buyer.name,
            date: new Date(dispute.order.createdAt).toLocaleDateString(),
            total: mapped.order.total,
            status: dispute.order.status,
            customerInfo: {
                name: dispute.order.buyer.name,
                email: dispute.order.buyer.email || 'unknown@cryptocraft.app',
                shippingAddress: `${dispute.order.shippingAddress?.city ?? ''} ${dispute.order.shippingAddress?.postOffice ?? ''}`.trim(),
            },
            sellerName: dispute.order.seller.name,
            items: dispute.order.items.map(item => ({
                productId: item.product.id,
                title: item.product.title,
                imageUrl: item.product.imageUrls?.[0],
                quantity: item.quantity,
                price: item.price,
            })),
            buyer,
            seller,
            paymentMethod: dispute.order.paymentMethod ?? 'ESCROW',
            checkoutMode: dispute.order.checkoutMode ?? 'CART',
        };
        return {
            ...mapped,
            buyer,
            seller,
            fullOrder,
            buyerStats: { totalOrders: 1, disputeRate: 0 },
            sellerStats: { totalSales: 1, disputeRate: 0 },
        };
    },
    updateDispute: async(dispute: AdminPanelDispute): Promise<AdminPanelDispute> => {
        return apiFetch(`/disputes/${dispute.id}`, {
            method: 'PATCH',
            body: JSON.stringify({
                status: dispute.status,
                messages: dispute.messages,
                priority: dispute.priority,
                assignedTier: dispute.assignedTier,
                responseSlaDueAt: dispute.responseSlaDueAt,
                pendingAutoAction: dispute.pendingAutoAction,
                pendingAutoActionAt: dispute.pendingAutoActionAt,
                resolutionTemplates: dispute.resolutionTemplates,
                internalNotes: dispute.internalNotes,
            }),
        });
    },
    getDisputesReport: async (): Promise<DisputesReport> => {
        return apiFetch('/disputes/report');
    },

    getTransactions: async(): Promise<AdminTransaction[]> => {
        return apiFetch('/transactions');
    },
    getGlobalPromoCodes: async(): Promise<AdminGlobalPromoCode[]> => {
        const promos = await apiFetch('/global-promocodes');
        return promos.map(mapGlobalPromoCode);
    },
    createGlobalPromoCode: async(data: AdminGlobalPromoCodeInput): Promise<AdminGlobalPromoCode> => {
        const created = await apiFetch('/global-promocodes', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return mapGlobalPromoCode(created);
    },
    updateGlobalPromoCode: async(id: string, data: Partial<AdminGlobalPromoCodeInput>): Promise<AdminGlobalPromoCode> => {
        const updated = await apiFetch(`/global-promocodes/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
        return mapGlobalPromoCode(updated);
    },
    deleteGlobalPromoCode: async(id: string): Promise<void> => {
        await apiFetch(`/global-promocodes/${id}`, { method: 'DELETE' });
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
        const settings = await apiFetch('/settings');
        return settings.map((item: any) => ({
            key: item.key,
            value: item.value,
            updatedAt: item.updatedAt,
            updatedBy: item.updatedBy,
        }));
    },

    updateSettings: async(settings: Setting[]): Promise<Setting[]> => {
        const payload = settings.map(setting => ({ key: setting.key, value: setting.value }));
        const updated = await apiFetch('/settings', {
            method: 'PATCH',
            body: JSON.stringify(payload),
        });
        return updated.map((item: any) => ({
            key: item.key,
            value: item.value,
            updatedAt: item.updatedAt,
            updatedBy: item.updatedBy,
        }));
    },

    getSettingsAudit: async(limit = 50): Promise<SettingAuditEntry[]> => {
        const audit = await apiFetch(`/settings/audit?limit=${limit}`);
        return audit.map((entry: any) => ({
            id: entry.id,
            key: entry.key,
            oldValue: entry.oldValue ?? undefined,
            newValue: entry.newValue,
            updatedBy: entry.updatedBy ?? undefined,
            createdAt: entry.createdAt,
        }));
    },

    // LIVESTREAMS
    getLiveStreams: async(): Promise<LiveStream[]> => {
        // This is a public endpoint, so we can call it directly.
        return apiFetch('/livestreams');
    },
};
