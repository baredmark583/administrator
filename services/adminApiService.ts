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
    status: 'Processing' | 'Shipped' | 'Completed' | 'Cancelled';
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
}


// --- MOCK DATA ---

let mockUsers: AdminPanelUser[] = [
    { id: 'user-1', name: 'Pottery Master', email: 'pottery@example.com', avatarUrl: 'https://picsum.photos/seed/seller1/100/100', registrationDate: '2023-10-01', status: 'Pro', balance: 1250.75, isBlocked: false },
    { id: 'user-2', name: 'Jewelry Queen', email: 'jewelry@example.com', avatarUrl: 'https://picsum.photos/seed/seller2/100/100', registrationDate: '2023-10-05', status: 'Standard', balance: 2500, isBlocked: false },
    { id: 'user-3', name: 'Leather Crafter', email: 'leather@example.com', avatarUrl: 'https://picsum.photos/seed/seller3/100/100', registrationDate: '2023-10-15', status: 'Standard', balance: 500, isBlocked: true },
];

let mockProducts: AdminPanelProduct[] = [
    { id: 'prod-1', title: 'Handmade Ceramic Mug', sellerName: 'Pottery Master', sellerId: 'user-1', imageUrls: ['https://picsum.photos/seed/prod1/600/400'], description: "A beautiful mug.", dynamicAttributes: { "Material": "Ceramic" }, category: 'Handmade', price: 35, status: 'Active', dateAdded: '2023-10-02' },
    { id: 'prod-2', title: 'Silver Necklace', sellerName: 'Jewelry Queen', sellerId: 'user-2', imageUrls: ['https://picsum.photos/seed/prod2/600/400'], description: "An elegant necklace.", dynamicAttributes: { "Metal": "Silver" }, category: 'Jewelry', price: 120, status: 'Active', dateAdded: '2023-10-06' },
    { id: 'prod-3', title: 'Forbidden Item', sellerName: 'Leather Crafter', sellerId: 'user-3', imageUrls: ['https://picsum.photos/seed/prod3/600/400'], description: "This item violates our terms of service.", dynamicAttributes: { "Material": "Forbidden" }, category: 'Handmade', price: 999, status: 'Pending Moderation', dateAdded: '2023-10-20' },
    { id: 'prod-4', title: 'Poor Quality Photo', sellerName: 'Pottery Master', sellerId: 'user-1', imageUrls: ['https://picsum.photos/seed/prod4/600/400'], description: "A blurry photo.", dynamicAttributes: { "Material": "Clay" }, category: 'Handmade', price: 20, status: 'Rejected', dateAdded: '2023-10-21', rejectionReason: 'Low quality images' },
];

let mockOrders: AdminPanelOrder[] = [
    { id: 'order-abc', customerName: 'John Doe', sellerName: 'Pottery Master', date: '2023-10-25', total: 70, status: 'Shipped', items: [{ productId: 'prod-1', title: 'Handmade Ceramic Mug', imageUrl: 'https://picsum.photos/seed/prod1/100/100', quantity: 2, price: 35 }], customerInfo: { name: 'John Doe', email: 'john@example.com', shippingAddress: '123 Craft Lane, Kiev' } },
    { id: 'order-def', customerName: 'Jane Smith', sellerName: 'Jewelry Queen', date: '2023-10-24', total: 120, status: 'Completed', items: [{ productId: 'prod-2', title: 'Silver Necklace', imageUrl: 'https://picsum.photos/seed/prod2/100/100', quantity: 1, price: 120 }], customerInfo: { name: 'Jane Smith', email: 'jane@example.com', shippingAddress: '456 Art St, Lviv' } },
    { id: 'order-ghi', customerName: 'Alex Ray', sellerName: 'Jewelry Queen', date: '2023-10-26', total: 240, status: 'Processing', items: [{ productId: 'prod-2', title: 'Silver Necklace', imageUrl: 'https://picsum.photos/seed/prod2/100/100', quantity: 2, price: 120 }], customerInfo: { name: 'Alex Ray', email: 'alex@example.com', shippingAddress: '789 Design Ave, Odessa' } },
];

let mockCategories: CategorySchema[] = [
    { id: 'cat-1', name: 'Электроника', fields: [{ id: 'f1', name: 'brand', label: 'Бренд', type: 'text', required: true, options: [] }] },
    { id: 'cat-2', name: 'Товары ручной работы', fields: [{ id: 'f2', name: 'material', label: 'Материал', type: 'text', required: true, options: [] }] },
];

let mockIcons: AdminIcon[] = [
    { id: 'icon-1', name: 'Электроника', svgContent: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-8 h-8"><path d="M3.25 4A2.25 2.25 0 001 6.25v7.5A2.25 2.25 0 003.25 16h13.5A2.25 2.25 0 0019 13.75v-7.5A2.25 2.25 0 0016.75 4H3.25zM10 8a.75.75 0 01.75.75v2.5a.75.75 0 01-1.5 0v-2.5A.75.75 0 0110 8zM5.75 9.5a.75.75 0 00-1.5 0v1a.75.75 0 001.5 0v-1zM14.25 9.5a.75.75 0 00-1.5 0v1a.75.75 0 001.5 0v-1z" /></svg>' },
    { id: 'icon-2', name: 'Автомобили', svgContent: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-8 h-8"><path fill-rule="evenodd" d="M12.5 2.75a.75.75 0 00-1.5 0V4h-2V2.75a.75.75 0 00-1.5 0V4H6V2.75a.75.75 0 00-1.5 0V4H3.75A2.25 2.25 0 001.5 6.25v8.5A2.25 2.25 0 003.75 17h12.5A2.25 2.25 0 0018.5 14.75v-8.5A2.25 2.25 0 0016.25 4H15V2.75a.75.75 0 00-1.5 0V4h-1V2.75zM4.75 10a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5zM6.5 10.75a.75.75 0 01.75-.75h5a.75.75 0 010 1.5h-5a.75.75 0 01-.75-.75zM14.75 10a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5z" clip-rule="evenodd" /></svg>' },
];


// --- MOCK API SERVICE ---

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const adminApiService = {
    getDashboardData: async (): Promise<AdminDashboardData> => {
        await delay(800);
        return {
            kpis: {
                totalRevenue: 157890.50,
                platformProfit: 3157.81,
                newUsers: 124,
                productsForModeration: mockProducts.filter(p => p.status === 'Pending Moderation').length,
            },
            salesData: Array.from({ length: 30 }, (_, i) => ({
                name: `Day ${i + 1}`,
                sales: 2000 + Math.random() * 5000 + (i * 150),
            })),
        };
    },

    getUsers: async (): Promise<AdminPanelUser[]> => {
        await delay(500);
        return [...mockUsers];
    },
    
    updateUser: async (user: AdminPanelUser): Promise<AdminPanelUser> => {
        await delay(500);
        mockUsers = mockUsers.map(u => u.id === user.id ? user : u);
        return user;
    },

    getProducts: async (): Promise<AdminPanelProduct[]> => {
        await delay(700);
        return [...mockProducts];
    },
    
    updateProductStatus: async (product: AdminPanelProduct): Promise<AdminPanelProduct> => {
        await delay(500);
        mockProducts = mockProducts.map(p => p.id === product.id ? product : p);
        return product;
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
    
    getCategories: async (): Promise<CategorySchema[]> => {
        await delay(300);
        return [...mockCategories];
    },
    
    updateCategory: async (category: CategorySchema): Promise<CategorySchema> => {
        await delay(500);
        const index = mockCategories.findIndex(c => c.id === category.id);
        if (index > -1) {
            mockCategories[index] = category;
        } else {
            mockCategories.push(category);
        }
        return category;
    },
    
    getIcons: async (): Promise<AdminIcon[]> => {
        await delay(300);
        return [...mockIcons];
    },

    addIcon: async (icon: Omit<AdminIcon, 'id'>): Promise<AdminIcon> => {
        await delay(500);
        const newIcon = { ...icon, id: `icon-${Date.now()}` };
        mockIcons.unshift(newIcon);
        return newIcon;
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