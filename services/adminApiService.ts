// This service provides mock data for the admin panel,
// allowing for frontend development without a live backend.

import { CATEGORIES, CategorySchema } from "../constants";
import type { Product, User, Order, Dispute } from '../types';
import type { Icon as AppIcon } from '../types';

// --- TYPES ---

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
    registrationDate: string;
    status: 'Standard' | 'Pro';
    // FIX: Add 'role' property to support admin panel functionality.
    role: 'USER' | 'MODERATOR' | 'SUPER_ADMIN';
    balance: number;
    isBlocked: boolean;
}

export interface AdminPanelUserDetails extends AdminPanelUser {
    products: AdminPanelProduct[];
    sales: any[]; // Using any to avoid circular dependency issues with AdminPanelOrder
    purchases: any[];
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

// FIX: Widened the status type to be compatible with the main app's OrderStatus type.
export type AdminOrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'SHIPPED'
  | 'SHIPPED_TO_EXPERT'
  | 'PENDING_AUTHENTICATION'
  | 'AUTHENTICATION_PASSED'
  | 'NFT_ISSUED'
  | 'AUTHENTICATION_FAILED'
  | 'DELIVERED'
  | 'DISPUTED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface AdminPanelOrder {
    id: string;
    customerName: string;
    date: string;
    total: number;
    status: AdminOrderStatus;
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

export interface AdminLog {
    timestamp: Date;
    level: 'INFO' | 'WARN' | 'ERROR';
    message: string;
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


// --- MOCK DATA ---

let mockUsers: AdminPanelUser[] = [
    { id: 'user-1', name: 'Pottery Master', email: 'pottery@example.com', avatarUrl: 'https://picsum.photos/seed/seller1/100/100', registrationDate: '2023-01-15', status: 'Pro', balance: 1250.75, isBlocked: false, role: 'USER' },
    { id: 'user-2', name: 'Jewelry Queen', email: 'jewelry@example.com', avatarUrl: 'https://picsum.photos/seed/seller2/100/100', registrationDate: '2023-02-20', status: 'Standard', balance: 2500, isBlocked: false, role: 'USER' },
    { id: 'user-3', name: 'Blocked User', email: 'blocked@example.com', avatarUrl: 'https://picsum.photos/seed/seller3/100/100', registrationDate: '2023-03-10', status: 'Standard', balance: 100, isBlocked: true, role: 'USER' },
    { id: 'buyer-1', name: 'Craft Enthusiast', email: 'buyer@example.com', avatarUrl: 'https://picsum.photos/seed/buyer1/100/100', registrationDate: '2023-04-01', status: 'Standard', balance: 50, isBlocked: false, role: 'USER' },
];

let mockProducts: AdminPanelProduct[] = [
    { id: 'prod-1', title: 'Handmade Ceramic Mug', imageUrls: ['https://picsum.photos/seed/prod1/600/400'], sellerName: 'Pottery Master', category: 'Handmade', price: 35.00, status: 'Active', dateAdded: '2023-05-10', description: 'A beautiful mug.', dynamicAttributes: { 'Material': 'Ceramic' } },
    { id: 'prod-2', title: 'Silver Necklace', imageUrls: ['https://picsum.photos/seed/prod2/600/400'], sellerName: 'Jewelry Queen', category: 'Jewelry', price: 120.00, status: 'Active', dateAdded: '2023-05-11', description: 'Elegant necklace.', dynamicAttributes: { 'Metal': 'Silver' } },
    { id: 'prod-pending', title: 'Vintage Leather Jacket', imageUrls: ['https://picsum.photos/seed/prod3/600/400'], sellerName: 'Pottery Master', category: 'Clothing', price: 250.00, status: 'Pending Moderation', dateAdded: '2023-05-12', description: 'Stylish jacket.', dynamicAttributes: { 'Material': 'Leather' } },
    { id: 'prod-rejected', title: 'Forbidden Item', imageUrls: ['https://picsum.photos/seed/prod4/600/400'], sellerName: 'Jewelry Queen', category: 'Other', price: 99.99, status: 'Rejected', dateAdded: '2023-05-12', description: 'Not allowed.', dynamicAttributes: {} },
];

let mockOrders: AdminPanelOrder[] = [
    { id: 'order-1', customerName: 'Craft Enthusiast', date: '2023-05-11', total: 35.00, status: 'SHIPPED', customerInfo: { name: 'Craft Enthusiast', email: 'buyer@example.com', shippingAddress: 'Kyiv, NP 1' }, sellerName: 'Pottery Master', items: [{ productId: 'prod-1', title: 'Handmade Ceramic Mug', imageUrl: 'https://picsum.photos/seed/prod1/100/100', quantity: 1, price: 35.00 }], buyer: mockUsers.find(u => u.name === 'Craft Enthusiast'), seller: mockUsers.find(u => u.name === 'Pottery Master') },
    { id: 'order-2', customerName: 'Craft Enthusiast', date: '2023-05-10', total: 99.00, status: 'DELIVERED', customerInfo: { name: 'Craft Enthusiast', email: 'buyer@example.com', shippingAddress: 'Kyiv, NP 1' }, sellerName: 'Jewelry Queen', items: [{ productId: 'prod-2', title: 'Silver Necklace', imageUrl: 'https://picsum.photos/seed/prod2/100/100', quantity: 1, price: 99.00 }], buyer: {}, seller: {} },
    { id: 'order-3', customerName: 'Pottery Master', date: '2023-05-09', total: 950.00, status: 'PAID', customerInfo: { name: 'Pottery Master', email: 'pottery@example.com', shippingAddress: 'Lviv, NP 5' }, sellerName: 'Car Dealer Pro', items: [{ productId: 'prod-5', title: 'iPhone 14 Pro Max', imageUrl: 'https://picsum.photos/seed/prod5/100/100', quantity: 1, price: 950.00 }], buyer: {}, seller: {} },
];

let mockDisputes: AdminPanelDispute[] = [
    { id: 'order-1', createdAt: '2023-05-12', status: 'UNDER_REVIEW', order: { id: 'order-1', customerName: 'Craft Enthusiast', sellerName: 'Pottery Master', total: 35.00, items: [{ title: 'Handmade Ceramic Mug', imageUrl: 'https://picsum.photos/seed/prod1/100/100' }] }, messages: [ { id: 'm1', senderId: 'buyer-1', senderName: 'Craft Enthusiast', senderAvatar: 'https://picsum.photos/seed/buyer1/100/100', timestamp: Date.now(), text: 'Товар пришел разбитым!' }] }
];

const wait = (ms: number) => new Promise(res => setTimeout(res, ms));


// --- MOCK API SERVICE ---

export const adminApiService = {
    login: async (email: string, pass: string): Promise<{ access_token: string; user: { email: string, role: string } }> => {
        await wait(500);
        if (email === 'admin' && pass === 'admin') {
            return {
                access_token: 'mock-admin-token',
                user: { email: 'admin@cryptocraft.app', role: 'admin' }
            };
        }
        throw new Error('Invalid credentials');
    },
    
    // ... other mock functions
    getDashboardData: async (): Promise<AdminDashboardData> => {
        await wait(800);
        return {
            kpis: { 
                totalRevenueToday: 1250.55, 
                platformProfit: 25.01, 
                newOrdersToday: 12,
                productsForModeration: 1,
                activeDisputes: 1,
            },
            salesData: Array.from({ length: 30 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (29 - i));
                return {
                    name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    sales: Math.floor(Math.random() * 3000) + 1000
                };
            }),
            recentActivity: [
                { id: 'act-1', type: 'new_order', text: 'Новый заказ #order-3 на 950.00 USDT', time: '5 минут назад' },
                { id: 'act-2', type: 'new_user', text: 'Новый пользователь John Doe', time: '1 час назад' },
                { id: 'act-3', type: 'new_order', text: 'Новый заказ #order-2 на 99.00 USDT', time: '3 часа назад' },
            ],
            topSellers: [
                { id: 'user-2', name: 'Jewelry Queen', avatarUrl: 'https://picsum.photos/seed/seller2/100/100', totalRevenue: 25000, salesCount: 150 },
                { id: 'user-1', name: 'Pottery Master', avatarUrl: 'https://picsum.photos/seed/seller1/100/100', totalRevenue: 18000, salesCount: 250 },
            ]
        };
    },

    getUsers: async (): Promise<AdminPanelUser[]> => {
        await wait(500);
        return [...mockUsers];
    },
    
    updateUser: async (user: AdminPanelUser): Promise<AdminPanelUser> => {
        await wait(400);
        mockUsers = mockUsers.map(u => u.id === user.id ? user : u);
        return user;
    },

    getProducts: async (): Promise<AdminPanelProduct[]> => {
        await wait(600);
        return [...mockProducts];
    },

    updateProduct: async (product: AdminPanelProduct): Promise<AdminPanelProduct> => {
        await wait(400);
        mockProducts = mockProducts.map(p => p.id === product.id ? product : p);
        return product;
    },
    
    getOrders: async (): Promise<AdminPanelOrder[]> => {
        await wait(700);
        return [...mockOrders];
    },
    
    updateOrder: async (order: AdminPanelOrder): Promise<AdminPanelOrder> => {
        await wait(300);
        mockOrders = mockOrders.map(o => o.id === order.id ? order : o);
        return order;
    },
    
    getDisputes: async (): Promise<AdminPanelDispute[]> => {
        await wait(500);
        return [...mockDisputes];
    },
    
    getDisputeDetails: async (disputeId: string): Promise<AdminPanelDisputeDetails> => {
        await wait(600);
        const dispute = mockDisputes.find(d => d.id === disputeId);
        if (!dispute) throw new Error("Dispute not found");

        const fullOrder = mockOrders.find(o => o.id === dispute.id);
        const buyer = mockUsers.find(u => u.name === fullOrder.customerName);
        const seller = mockUsers.find(u => u.name === fullOrder.sellerName);

        if (!fullOrder || !buyer || !seller) throw new Error("Could not assemble dispute details");

        return {
            ...dispute,
            buyer,
            seller,
            fullOrder,
            buyerStats: { totalOrders: 15, disputeRate: 6.6 },
            sellerStats: { totalSales: 120, disputeRate: 0.8 },
        };
    },
    
    updateDispute: async (dispute: AdminPanelDispute): Promise<AdminPanelDispute> => {
        await wait(400);
        mockDisputes = mockDisputes.map(d => d.id === dispute.id ? dispute : d);
        return dispute;
    },

    // --- LOGS ---
    subscribeToLogs: (callback: (log: AdminLog) => void): (() => void) => {
        const interval = setInterval(() => {
            const levels: AdminLog['level'][] = ['INFO', 'INFO', 'INFO', 'WARN', 'ERROR'];
            const messages = [
                'User user-1 logged in',
                'New product "Handmade Ceramic Mug" created',
                'API GET /products returned 200',
                'Image upload failed for user-2: timeout',
                'DATABASE_ERROR: Connection refused'
            ];
            callback({
                timestamp: new Date(),
                level: levels[Math.floor(Math.random() * levels.length)],
                message: messages[Math.floor(Math.random() * messages.length)]
            });
        }, 3000);
        return () => clearInterval(interval);
    }
};