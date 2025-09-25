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
}


// --- MOCK DATA (Only for modules NOT yet on backend) ---

let mockOrders: AdminPanelOrder[] = [
    { id: 'order-abc', customerName: 'John Doe', sellerName: 'Pottery Master', date: '2023-10-25', total: 70, status: 'Shipped', items: [{ productId: 'prod-1', title: 'Handmade Ceramic Mug', imageUrl: 'https://picsum.photos/seed/prod1/100/100', quantity: 2, price: 35 }], customerInfo: { name: 'John Doe', email: 'john@example.com', shippingAddress: '123 Craft Lane, Kiev' } },
    { id: 'order-def', customerName: 'Jane Smith', sellerName: 'Jewelry Queen', date: '2023-10-24', total: 120, status: 'Completed', items: [{ productId: 'prod-2', title: 'Silver Necklace', imageUrl: 'https://picsum.photos/seed/prod2/100/100', quantity: 1, price: 120 }], customerInfo: { name: 'Jane Smith', email: 'jane@example.com', shippingAddress: '456 Art St, Lviv' } },
    { id: 'order-ghi', customerName: 'Alex Ray', sellerName: 'Jewelry Queen', date: '2023-10-26', total: 240, status: 'Processing', items: [{ productId: 'prod-2', title: 'Silver Necklace', imageUrl: 'https://picsum.photos/seed/prod2/100/100', quantity: 2, price: 120 }], customerInfo: { name: 'Alex Ray', email: 'alex@example.com', shippingAddress: '789 Design Ave, Odessa' } },
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