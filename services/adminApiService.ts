// A mock API service for the admin panel.
// This simulates fetching and updating data that an admin would manage.

// --- TYPES ---

export interface AdminPanelUser {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
    registrationDate: string;
    status: 'Pro' | 'Standard';
    balance: number;
    isBlocked: boolean;
}

export interface AdminPanelProduct {
    id: string;
    title: string;
    sellerName: string;
    sellerId: string;
    imageUrls: string[];
    description: string;
    dynamicAttributes: Record<string, string | number>;
    category: string;
    price: number;
    status: 'Active' | 'Pending Moderation' | 'Rejected';
    dateAdded: string;
    rejectionReason?: string;
}

export interface AdminPanelOrder {
    id: string;
    customerName: string;
    sellerName: string;
    date: string;
    total: number;
    // FIX: The status type was updated to match the backend's OrderStatus enum, ensuring type consistency.
    status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'DISPUTED' | 'COMPLETED' | 'CANCELLED';
    items: {
        productId: string;
        title: string;
        imageUrl: string;
        quantity: number;
        price: number;
    }[];
    customerInfo: {
        name: string;
        email: string;
        shippingAddress: string;
    };
}

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

export interface CategoryField {
    id: string;
    name: string;
    label: string;
    type: 'text' | 'number' | 'select';
    required: boolean;
    options: string[];
}
export interface CategorySchema {
    id: string;
    name: string;
    iconId: string | null;
    fields: CategoryField[];
}

export interface AdminLog {
    timestamp: Date;
    level: 'INFO' | 'WARN' | 'ERROR';
    message: string;
}

export interface AdminIcon {
    id: string;
    name: string;
    svgContent: string;
    iconUrl?: string;
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
    id: string; // Same as orderId
    order: AdminPanelOrder;
    messages: DisputeMessage[];
    status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED_BUYER' | 'RESOLVED_SELLER';
    createdAt: string;
}

export interface AdminTransaction {
    id: string;
    date: string;
    type: 'Sale' | 'Withdrawal' | 'Deposit' | 'Commission' | 'Refund';
    from: { id: string; name: string };
    to: { id: string; name: string };
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


// --- MOCK DATA (Only for modules NOT yet on backend) ---

let mockOrders: AdminPanelOrder[] = [
    { id: 'order-abc', customerName: 'John Doe', sellerName: 'Pottery Master', date: '2023-10-25', total: 70, status: 'DISPUTED', items: [{ productId: 'prod-1', title: 'Handmade Ceramic Mug', imageUrl: 'https://picsum.photos/seed/prod1/100/100', quantity: 2, price: 35 }], customerInfo: { name: 'John Doe', email: 'john@example.com', shippingAddress: '123 Craft Lane, Kiev' } },
    { id: 'order-def', customerName: 'Jane Smith', sellerName: 'Jewelry Queen', date: '2023-10-24', total: 120, status: 'COMPLETED', items: [{ productId: 'prod-2', title: 'Silver Necklace', imageUrl: 'https://picsum.photos/seed/prod2/100/100', quantity: 1, price: 120 }], customerInfo: { name: 'Jane Smith', email: 'jane@example.com', shippingAddress: '456 Art St, Lviv' } },
    { id: 'order-ghi', customerName: 'Alex Ray', sellerName: 'Jewelry Queen', date: '2023-10-26', total: 240, status: 'PAID', items: [{ productId: 'prod-2', title: 'Silver Necklace', imageUrl: 'https://picsum.photos/seed/prod2/100/100', quantity: 2, price: 120 }], customerInfo: { name: 'Alex Ray', email: 'alex@example.com', shippingAddress: '789 Design Ave, Odessa' } },
    { id: 'order-jkl', customerName: 'Sam Wilson', sellerName: 'Leather Crafter', date: '2023-10-27', total: 250, status: 'DISPUTED', items: [{ productId: 'prod-3', title: 'Кожаная куртка', imageUrl: 'https://picsum.photos/seed/prod3/100/100', quantity: 1, price: 250 }], customerInfo: { name: 'Sam Wilson', email: 'sam@example.com', shippingAddress: '321 Maker Blvd, Kharkiv' } },
];

let mockDisputes: AdminPanelDispute[] = [
    { 
        id: 'order-abc', 
        order: mockOrders.find(o => o.id === 'order-abc')!,
        status: 'UNDER_REVIEW',
        createdAt: '2023-10-26',
        messages: [
            { id: 'dm-1', senderId: 'buyer-1', senderName: 'John Doe', senderAvatar: 'https://picsum.photos/seed/buyer1/100/100', timestamp: Date.now() - 900000, text: 'Я получил чашку, но она разбита! Требую возврата.' },
            { id: 'dm-2', senderId: 'user-1', senderName: 'Pottery Master', senderAvatar: 'https://picsum.photos/seed/seller1/100/100', timestamp: Date.now() - 840000, text: 'Я очень хорошо упаковал ее. Возможно, это вина службы доставки.' },
            { id: 'dm-3', senderId: 'arbitrator-01', senderName: 'CryptoCraft Support', senderAvatar: 'https://picsum.photos/seed/support/100/100', timestamp: Date.now() - 600000, text: 'Здравствуйте. Я арбитр CryptoCraft. Пожалуйста, предоставьте фото упаковки и поврежденного товара.' },
        ]
    },
    { 
        id: 'order-jkl', 
        order: mockOrders.find(o => o.id === 'order-jkl')!,
        status: 'OPEN',
        createdAt: '2023-10-28',
        messages: [
            { id: 'dm-4', senderId: 'buyer-2', senderName: 'Sam Wilson', senderAvatar: 'https://picsum.photos/seed/buyer2/100/100', timestamp: Date.now() - 500000, text: 'Куртка не того размера, который был указан в объявлении.' },
        ]
    },
     { 
        id: 'order-xyz', 
        order: { id: 'order-xyz', customerName: 'Peter Jones', sellerName: 'Digital Artist', date: '2023-10-20', total: 50, status: 'COMPLETED', items: [{ productId: 'prod-4', title: 'Шаблон для Figma', imageUrl: 'https://picsum.photos/seed/prod4/100/100', quantity: 1, price: 50 }], customerInfo: { name: 'Peter Jones', email: 'peter@example.com', shippingAddress: 'N/A' } },
        status: 'RESOLVED_SELLER',
        createdAt: '2023-10-22',
        messages: []
    }
];

let mockTransactions: AdminTransaction[] = [
    { id: 'txn-1', date: '2023-10-25', type: 'Sale', from: { id: 'user-2', name: 'John Doe' }, to: { id: 'user-1', name: 'Pottery Master' }, amount: 70, status: 'Completed' },
    { id: 'txn-2', date: '2023-10-25', type: 'Commission', from: { id: 'user-1', name: 'Pottery Master' }, to: { id: 'platform', name: 'CryptoCraft' }, amount: 1.4, status: 'Completed' },
    { id: 'txn-3', date: '2023-10-24', type: 'Withdrawal', from: { id: 'user-2', name: 'Jewelry Queen' }, to: { id: 'external', name: 'TON Wallet' }, amount: 500, status: 'Pending' },
    { id: 'txn-4', date: '2023-10-23', type: 'Deposit', from: { id: 'external', name: 'External Source' }, to: { id: 'user-3', name: 'Leather Crafter' }, amount: 200, status: 'Completed' },
    { id: 'txn-5', date: '2023-10-22', type: 'Sale', from: { id: 'user-4', name: 'Jane Smith' }, to: { id: 'user-2', name: 'Jewelry Queen' }, amount: 120, status: 'Completed' },
    { id: 'txn-6', date: '2023-10-22', type: 'Commission', from: { id: 'user-2', name: 'Jewelry Queen' }, to: { id: 'platform', name: 'CryptoCraft' }, amount: 2.4, status: 'Completed' },
    { id: 'txn-7', date: '2023-10-21', type: 'Refund', from: { id: 'user-1', name: 'Pottery Master' }, to: { id: 'user-2', name: 'John Doe' }, amount: 35, status: 'Failed' },
];

let mockGlobalPromoCodes: AdminGlobalPromoCode[] = [
    { id: 'promo-global-1', code: 'WELCOME15', discountType: 'PERCENTAGE', discountValue: 15, isActive: true, uses: 125, maxUses: 1000 },
    { id: 'promo-global-2', code: 'BLACKFRIDAY', discountType: 'PERCENTAGE', discountValue: 25, isActive: false, uses: 850, maxUses: 1000 },
    { id: 'promo-global-3', code: 'NEWYEAR10', discountType: 'FIXED_AMOUNT', discountValue: 10, isActive: true, uses: 42, minPurchaseAmount: 50 },
];


// --- MOCK API SERVICE ---

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const adminApiService = {
    getDashboardData: async (): Promise<AdminDashboardData> => {
        await delay(800);
        // NOTE: This now gets one piece of real data to show integration is working.
        // In a real app, a dedicated backend endpoint would provide all this data.
        // const products = await backendApiService.getProducts();
        
        return {
            kpis: {
                totalRevenue: 157890.50,
                platformProfit: 3157.81,
                newUsers: 124,
                productsForModeration: 5, // Static mock for now
            },
            salesData: Array.from({ length: 30 }, (_, i) => ({
                name: `Day ${i + 1}`,
                sales: 2000 + Math.random() * 5000 + (i * 150),
            })),
        };
    },
    
    getOrders: async (): Promise<AdminPanelOrder[]> => {
        await delay(600);
        return [...mockOrders];
    },
    
    updateOrderStatus: async (order: AdminPanelOrder): Promise<AdminPanelOrder> => {
        await delay(400);
        mockOrders = mockOrders.map(o => o.id === order.id ? order : o);
        return order;
    },

    getDisputes: async (): Promise<AdminPanelDispute[]> => {
        await delay(700);
        return [...mockDisputes];
    },

    updateDispute: async (dispute: AdminPanelDispute): Promise<AdminPanelDispute> => {
        await delay(500);
        mockDisputes = mockDisputes.map(d => d.id === dispute.id ? dispute : d);
        return dispute;
    },

    getTransactions: async (): Promise<AdminTransaction[]> => {
        await delay(900);
        return [...mockTransactions];
    },

    getGlobalPromoCodes: async (): Promise<AdminGlobalPromoCode[]> => {
        await delay(500);
        return [...mockGlobalPromoCodes];
    },

    createGlobalPromoCode: async (data: Omit<AdminGlobalPromoCode, 'id' | 'uses'>): Promise<AdminGlobalPromoCode> => {
        await delay(400);
        const newPromo: AdminGlobalPromoCode = {
            id: `promo-global-${Date.now()}`,
            uses: 0,
            ...data
        };
        mockGlobalPromoCodes.push(newPromo);
        return newPromo;
    },

    deleteGlobalPromoCode: async (id: string): Promise<void> => {
        await delay(300);
        mockGlobalPromoCodes = mockGlobalPromoCodes.filter(p => p.id !== id);
    },

    // Log streaming simulation
    subscribeToLogs: (callback: (log: AdminLog) => void): (() => void) => {
        const mockLogSources = ["API", "Database", "Auth", "Payments"];
        const mockMessages = [
            "User logged in successfully",
            "Product fetch query executed",
            "Failed payment attempt",
            "New user registration",
            "Cache cleared"
        ];
        
        const interval = setInterval(() => {
            const level: AdminLog['level'] = Math.random() > 0.9 ? 'ERROR' : Math.random() > 0.7 ? 'WARN' : 'INFO';
            const message = `${mockLogSources[Math.floor(Math.random() * mockLogSources.length)]}: ${mockMessages[Math.floor(Math.random() * mockMessages.length)]}`;
            
            const newLog: AdminLog = {
                timestamp: new Date(),
                level,
                message: message + (level === 'ERROR' ? ` - Trace ID: ${Math.random().toString(36).substring(7)}` : ''),
            };
            callback(newLog);
        }, 3000); // New log every 3 seconds

        return () => clearInterval(interval); // Unsubscribe function
    },
};