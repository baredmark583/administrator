// Mock API service for the admin panel

export interface KpiData {
    totalRevenue: number;
    platformProfit: number;
    newUsers: number;
    productsForModeration: number;
}

export interface SalesChartDataPoint {
    name: string;
    sales: number;
}

export interface AdminDashboardData {
    kpis: KpiData;
    salesData: SalesChartDataPoint[];
}

export interface AdminPanelUser {
    id: string;
    avatarUrl: string;
    name: string;
    email: string;
    registrationDate: string;
    status: 'Pro' | 'Standard';
    balance: number;
    isBlocked: boolean;
}

export interface AdminPanelProduct {
    id: string;
    imageUrls: string[];
    title: string;
    description: string;
    sellerName: string;
    sellerId: string;
    category: string;
    price: number;
    status: 'Active' | 'Pending Moderation' | 'Rejected';
    dateAdded: string;
    dynamicAttributes: Record<string, string | number>;
    rejectionReason?: string;
}

export interface OrderItem {
    productId: string;
    imageUrl: string;
    title: string;
    quantity: number;
    price: number;
}

export interface OrderCustomerInfo {
    id: string;
    name: string;
    email: string;
    shippingAddress: string;
}

export interface AdminPanelOrder {
    id: string;
    customerName: string;
    date: string;
    total: number;
    status: 'Processing' | 'Shipped' | 'Completed' | 'Cancelled';
    items: OrderItem[];
    customerInfo: OrderCustomerInfo;
    sellerName: string;
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

export interface AdminIcon {
    id: string;
    name: string;
    type: 'url' | 'svg';
    content: string; // URL or SVG content
}

export interface AdminLog {
    timestamp: Date;
    level: 'INFO' | 'WARN' | 'ERROR';
    message: string;
}


// --- MOCK DATA ---

// Generate mock sales data for the last 30 days
const generateMockSalesData = (): SalesChartDataPoint[] => {
    const data: SalesChartDataPoint[] = [];
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        
        const sales = 2000 + (30 - i) * 100 + Math.random() * 500 - 250;
        
        data.push({
            name: `${day.toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}`,
            sales: Math.round(sales),
        });
    }
    return data;
};

let mockUsers: AdminPanelUser[] = [
    { id: 'usr_1a2b3c', avatarUrl: 'https://picsum.photos/seed/user1/40/40', name: 'Elena Petrova', email: 'elena.p@example.com', registrationDate: '2023-10-26', status: 'Pro', balance: 1250.75, isBlocked: false },
    { id: 'usr_4d5e6f', avatarUrl: 'https://picsum.photos/seed/user2/40/40', name: 'Ivan Morozov', email: 'ivan.m@example.com', registrationDate: '2023-11-15', status: 'Standard', balance: 250.00, isBlocked: false },
    { id: 'usr_7g8h9i', avatarUrl: 'https://picsum.photos/seed/user3/40/40', name: 'Anna Kovalenko', email: 'anna.k@example.com', registrationDate: '2023-09-01', status: 'Pro', balance: 5300.10, isBlocked: true },
    { id: 'usr_j1k2l3', avatarUrl: 'https://picsum.photos/seed/user4/40/40', name: 'Sergey Volkov', email: 'sergey.v@example.com', registrationDate: '2024-01-05', status: 'Standard', balance: 50.25, isBlocked: false },
];

let mockProducts: AdminPanelProduct[] = [
    { id: 'prod_abc1', imageUrls: ['https://picsum.photos/seed/prod1/400/300', 'https://picsum.photos/seed/prod1_2/400/300'], title: 'Handmade Ceramic Mug', description: 'A beautiful, one-of-a-kind ceramic mug, perfect for your morning coffee.', sellerName: 'Elena Petrova', sellerId: 'usr_1a2b3c', category: 'Товары ручной работы', price: 35.00, status: 'Active', dateAdded: '2024-05-20', dynamicAttributes: {'Материал': 'Керамика', 'Объем (мл)': 350} },
    { id: 'prod_def2', imageUrls: ['https://picsum.photos/seed/prod5/400/300'], title: 'Игровой ноутбук Razer Blade 15', description: 'Мощный игровой ноутбук в отличном состоянии. Intel Core i7, RTX 3070, 16GB RAM, 1TB SSD.', sellerName: 'Sergey Volkov', sellerId: 'usr_j1k2l3', category: 'Электроника', price: 1150.00, status: 'Pending Moderation', dateAdded: '2024-05-21', dynamicAttributes: { 'Бренд': 'Razer', 'Модель': 'Blade 15', 'Состояние': 'Б/у' } },
    { id: 'prod_ghi3', imageUrls: ['https://picsum.photos/seed/prod2/400/300'], title: 'Silver Necklace with Moonstone', description: 'Elegant sterling silver necklace featuring a mesmerizing moonstone pendant.', sellerName: 'Anna Kovalenko', sellerId: 'usr_7g8h9i', category: 'Ювелирные изделия', price: 120.00, status: 'Active', dateAdded: '2024-05-18', dynamicAttributes: {'Металл': 'Серебро 925', 'Камень': 'Лунный камень'} },
];

let mockOrders: AdminPanelOrder[] = [
    { 
        id: 'ORD-202405-001', 
        customerName: 'Ivan Morozov', 
        date: '2024-05-21', 
        total: 35.00, 
        status: 'Processing',
        items: [
            { productId: 'prod_abc1', imageUrl: 'https://picsum.photos/seed/prod1/40/40', title: 'Handmade Ceramic Mug', quantity: 1, price: 35.00 }
        ],
        customerInfo: { id: 'usr_4d5e6f', name: 'Ivan Morozov', email: 'ivan.m@example.com', shippingAddress: 'г. Киев, Новая Почта #15, +380501234567' },
        sellerName: 'Elena Petrova'
    },
    { 
        id: 'ORD-202405-002', 
        customerName: 'Elena Petrova', 
        date: '2024-05-20', 
        total: 1150.00, 
        status: 'Shipped',
        items: [
            { productId: 'prod_def2', imageUrl: 'https://picsum.photos/seed/prod5/40/40', title: 'Игровой ноутбук Razer Blade 15', quantity: 1, price: 1150.00 }
        ],
        customerInfo: { id: 'usr_1a2b3c', name: 'Elena Petrova', email: 'elena.p@example.com', shippingAddress: 'г. Львов, Новая Почта #3, +380997654321' },
        sellerName: 'Sergey Volkov'
    },
    { 
        id: 'ORD-202405-003', 
        customerName: 'Sergey Volkov', 
        date: '2024-05-19', 
        total: 275.00, 
        status: 'Completed',
        items: [
            { productId: 'prod_ghi3', imageUrl: 'https://picsum.photos/seed/prod2/40/40', title: 'Silver Necklace with Moonstone', quantity: 2, price: 120.00 },
            { productId: 'prod_abc1', imageUrl: 'https://picsum.photos/seed/prod1/40/40', title: 'Handmade Ceramic Mug', quantity: 1, price: 35.00 }
        ],
        customerInfo: { id: 'usr_j1k2l3', name: 'Sergey Volkov', email: 'sergey.v@example.com', shippingAddress: 'г. Одесса, Новая Почта #22, +380671112233' },
        sellerName: 'Anna Kovalenko'
    },
];

let mockCategories: CategorySchema[] = [
    {
        id: 'cat_electronics',
        name: 'Электроника',
        fields: [
            { id: 'f_brand', name: 'brand', label: 'Бренд', type: 'text', required: true, options: [] },
            { id: 'f_model', name: 'model', label: 'Модель', type: 'text', required: true, options: [] },
            { id: 'f_condition_el', name: 'condition', label: 'Состояние', type: 'select', required: true, options: ['Новое', 'Б/у', 'На запчасти'] },
        ],
    },
    {
        id: 'cat_handmade',
        name: 'Товары ручной работы',
        fields: [
            { id: 'f_material', name: 'material', label: 'Основной материал', type: 'text', required: true, options: [] },
            { id: 'f_color', name: 'color', label: 'Цвет', type: 'text', required: false, options: [] },
        ],
    },
];

const mockIcons: AdminIcon[] = [
    { id: 'icon_art', name: 'Искусство', type: 'svg', content: '<path d="M10 3.5a.75.75 0 01.75.75v2.502a.75.75 0 01-1.5 0V4.25A.75.75 0 0110 3.5zM8.328 6.022a.75.75 0 011.06 0l.75.75a.75.75 0 01-1.06 1.06l-.75-.75a.75.75 0 010-1.06zM5.25 8.5a.75.75 0 000 1.5h.563a.75.75 0 000-1.5H5.25zM15.25 9.25a.75.75 0 01-.75-.75h-.563a.75.75 0 010-1.5h.563a.75.75 0 01.75.75v.75zM11.672 6.022a.75.75 0 011.06 0l.75.75a.75.75 0 01-1.06 1.06l-.75-.75a.75.75 0 010-1.06zM10 15.5a.75.75 0 01.75.75v.563a.75.75 0 01-1.5 0v-.563a.75.75 0 01.75-.75zM8.328 12.478a.75.75 0 011.06 0l.75.75a.75.75 0 01-1.06 1.06l-.75-.75a.75.75 0 010-1.06zM5.25 10.75a.75.75 0 000 1.5h.563a.75.75 0 000-1.5H5.25zM15.25 11.5a.75.75 0 01-.75-.75h-.563a.75.75 0 010-1.5h.563a.75.75 0 01.75.75v.75zM11.672 12.478a.75.75 0 011.06 0l.75.75a.75.75 0 01-1.06 1.06l-.75-.75a.75.75 0 010-1.06zM10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" />'},
    { id: 'icon_cars', name: 'Автомобили', type: 'url', content: 'https://api.iconify.design/mdi:car.svg' },
];


const mockDashboardData: AdminDashboardData = {
    kpis: {
        totalRevenue: 125430,
        platformProfit: 12543,
        newUsers: 134,
        productsForModeration: mockProducts.filter(p => p.status === 'Pending Moderation').length,
    },
    salesData: generateMockSalesData(),
};


export const adminApiService = {
    getDashboardData: async (): Promise<AdminDashboardData> => {
        await new Promise(res => setTimeout(res, 800));
        return mockDashboardData;
    },

    getUsers: async (): Promise<AdminPanelUser[]> => {
        await new Promise(res => setTimeout(res, 1000));
        return mockUsers;
    },

    updateUser: async (updatedUser: AdminPanelUser): Promise<AdminPanelUser> => {
        await new Promise(res => setTimeout(res, 500));
        const index = mockUsers.findIndex(u => u.id === updatedUser.id);
        if (index > -1) {
            mockUsers[index] = updatedUser;
        } else {
            throw new Error("User not found");
        }
        return updatedUser;
    },
    
    getProducts: async (): Promise<AdminPanelProduct[]> => {
        await new Promise(res => setTimeout(res, 1000));
        return mockProducts;
    },

    updateProductStatus: async (updatedProduct: AdminPanelProduct): Promise<AdminPanelProduct> => {
        await new Promise(res => setTimeout(res, 500));
        const index = mockProducts.findIndex(p => p.id === updatedProduct.id);
        if (index > -1) {
            mockProducts[index] = updatedProduct;
        } else {
            throw new Error("Product not found");
        }
        return updatedProduct;
    },
    
    getOrders: async (): Promise<AdminPanelOrder[]> => {
        await new Promise(res => setTimeout(res, 1000));
        return mockOrders;
    },
    
    updateOrderStatus: async (updatedOrder: AdminPanelOrder): Promise<AdminPanelOrder> => {
        await new Promise(res => setTimeout(res, 500));
        const index = mockOrders.findIndex(o => o.id === updatedOrder.id);
        if (index > -1) {
            mockOrders[index] = updatedOrder;
        } else {
            throw new Error("Order not found");
        }
        return updatedOrder;
    },

    getCategories: async (): Promise<CategorySchema[]> => {
        await new Promise(res => setTimeout(res, 500));
        return JSON.parse(JSON.stringify(mockCategories)); // Return a deep copy
    },

    updateCategory: async (category: CategorySchema): Promise<CategorySchema> => {
        await new Promise(res => setTimeout(res, 500));
        const index = mockCategories.findIndex(c => c.id === category.id);
        if (index > -1) {
            mockCategories[index] = category;
        } else {
            mockCategories.push(category);
        }
        return category;
    },

    getIcons: async (): Promise<AdminIcon[]> => {
        await new Promise(res => setTimeout(res, 500));
        return mockIcons;
    },
    
    // Simulates a WebSocket connection for logs
    subscribeToLogs: (callback: (log: AdminLog) => void): (() => void) => {
        const mockLogMessages = [
            "User 'elena.p@example.com' logged in successfully.",
            "New product 'Старинная ваза' created by seller 'usr_7g8h9i'.",
            "Payment of 35.00 USDT received for order 'ORD-202405-001'.",
            "Database connection timeout on replica-2.",
            "User 'ivan.m@example.com' updated their profile.",
            "Image upload failed: file size exceeds limit (15MB).",
            "New order 'ORD-202405-004' created, total 150.00 USDT.",
            "API rate limit exceeded for IP 192.168.1.100.",
        ];
        const levels: AdminLog['level'][] = ['INFO', 'INFO', 'INFO', 'ERROR', 'INFO', 'WARN', 'INFO', 'WARN'];

        const intervalId = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * mockLogMessages.length);
            const log: AdminLog = {
                timestamp: new Date(),
                level: levels[randomIndex],
                message: mockLogMessages[randomIndex],
            };
            callback(log);
        }, 2000); // Send a new log every 2 seconds

        // Return a cleanup function to stop the interval
        return () => {
            clearInterval(intervalId);
        };
    },
};