// This service provides mock data for the admin panel,
// allowing for frontend development without a live backend.

import { CATEGORIES, CategorySchema } from "../constants";
import type { Product, User, Order, Dispute } from '../../types';
import type { Icon as AppIcon } from '../../types';

// --- TYPES ---

export interface SalesChartDataPoint {
    name: string;
    sales: number;
}
export interface AdminDashboardData {
    kpis: {
        totalRevenue: number;
        platformProfit: number;
        newUsers: number;
        productsForModeration: number;
    };
    salesData: SalesChartDataPoint[];
}

export interface AdminPanelUser {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
    registrationDate: string;
    status: 'Standard' | 'Pro';
    balance: number;
    isBlocked: boolean;
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
    status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';
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

export type AdminIcon = AppIcon;


// --- MOCK DATA ---

let mockUsers: AdminPanelUser[] = [
    { id: 'user-1', name: 'Pottery Master', email: 'pottery@example.com', avatarUrl: 'https://picsum.photos/seed/seller1/100/100', registrationDate: '2023-01-15', status: 'Pro', balance: 1250.75, isBlocked: false },
    { id: 'user-2', name: 'Jewelry Queen', email: 'jewelry@example.com', avatarUrl: 'https://picsum.photos/seed/seller2/100/100', registrationDate: '2023-02-20', status: 'Standard', balance: 2500, isBlocked: false },
    { id: 'user-3', name: 'Blocked User', email: 'blocked@example.com', avatarUrl: 'https://picsum.photos/seed/seller3/100/100', registrationDate: '2023-03-10', status: 'Standard', balance: 100, isBlocked: true },
];

let mockProducts: AdminPanelProduct[] = [
    { id: 'prod-1', title: 'Handmade Ceramic Mug', imageUrls: ['https://picsum.photos/seed/prod1/600/400'], sellerName: 'Pottery Master', category: 'Handmade', price: 35.00, status: 'Active', dateAdded: '2023-05-10', description: 'A beautiful mug.', dynamicAttributes: { 'Material': 'Ceramic' } },
    { id: 'prod-2', title: 'Silver Necklace', imageUrls: ['https://picsum.photos/seed/prod2/600/400'], sellerName: 'Jewelry Queen', category: 'Jewelry', price: 120.00, status: 'Active', dateAdded: '2023-05-11', description: 'Elegant necklace.', dynamicAttributes: { 'Metal': 'Silver' } },
    { id: 'prod-pending', title: 'Vintage Leather Jacket', imageUrls: ['https://picsum.photos/seed/prod3/600/400'], sellerName: 'Pottery Master', category: 'Clothing', price: 250.00, status: 'Pending Moderation', dateAdded: '2023-05-12', description: 'Stylish jacket.', dynamicAttributes: { 'Material': 'Leather' } },
    { id: 'prod-rejected', title: 'Forbidden Item', imageUrls: ['https://picsum.photos/seed/prod4/600/400'], sellerName: 'Jewelry Queen', category: 'Other', price: 99.99, status: 'Rejected', dateAdded: '2023-05-12', description: 'Not allowed.', dynamicAttributes: {} },
];

let mockOrders: AdminPanelOrder[] = [
    { id: 'order-1', customerName: 'Craft Enthusiast', date: '2023-05-11', total: 35.00, status: 'SHIPPED', customerInfo: { name: 'Craft Enthusiast', email: 'buyer@example.com', shippingAddress: 'Kyiv, NP 1' }, sellerName: 'Pottery Master', items: [{ productId: 'prod-1', title: 'Handmade Ceramic Mug', imageUrl: 'https://picsum.photos/seed/prod1/100/100', quantity: 1, price: 35.00 }] },
    { id: 'order-2', customerName: 'Craft Enthusiast', date: '2023-05-10', total: 99.00, status: 'DELIVERED', customerInfo: { name: 'Craft Enthusiast', email: 'buyer@example.com', shippingAddress: 'Kyiv, NP 1' }, sellerName: 'Jewelry Queen', items: [{ productId: 'prod-2', title: 'Silver Necklace', imageUrl: 'https://picsum.photos/seed/prod2/100/100', quantity: 1, price: 99.00 }] },
    { id: 'order-3', customerName: 'Pottery Master', date: '2023-05-09', total: 950.00, status: 'PAID', customerInfo: { name: 'Pottery Master', email: 'pottery@example.com', shippingAddress: 'Lviv, NP 5' }, sellerName: 'Car Dealer Pro', items: [{ productId: 'prod-5', title: 'iPhone 14 Pro Max', imageUrl: 'https://picsum.photos/seed/prod5/100/100', quantity: 1, price: 950.00 }] },
];

let mockDisputes: AdminPanelDispute[] = [
    { id: 'order-1', createdAt: '2023-05-12', status: 'UNDER_REVIEW', order: { id: 'order-1', customerName: 'Craft Enthusiast', sellerName: 'Pottery Master', total: 35.00, items: [{ title: 'Handmade Ceramic Mug', imageUrl: 'https://picsum.photos/seed/prod1/100/100' }] }, messages: [ { id: 'm1', senderId: 'buyer-1', senderName: 'Craft Enthusiast', senderAvatar: '...', timestamp: Date.now(), text: 'Item arrived broken!' }] }
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
            kpis: { totalRevenue: 125340, platformProfit: 2506, newUsers: 152, productsForModeration: 1 },
            salesData: Array.from({ length: 30 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (29 - i));
                return {
                    name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    sales: Math.floor(Math.random() * 3000) + 1000
                };
            })
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
