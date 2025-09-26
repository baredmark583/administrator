// This service handles all communication with the real NestJS backend for the admin panel.
import type { AdminPanelUser, AdminPanelProduct, CategorySchema, AdminPanelOrder, AdminIcon, AdminDashboardData } from './adminApiService';
// Assuming the backend entities are similar enough to frontend types for this mapping
import type { User, Product } from '../../types'; 

// --- REAL API IMPLEMENTATION ---
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
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || 'An API error occurred');
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
    }
    return;
  } catch (error) {
    console.error(`API fetch error: ${options.method || 'GET'} ${endpoint}`, error);
    throw error;
  }
};


// --- DATA MAPPERS ---
const mapUserToAdminPanelUser = (user: User): AdminPanelUser => ({
    id: user.id,
    name: user.name,
    email: user.email || `tg_id_${user.telegramId}`,
    avatarUrl: user.avatarUrl,
    registrationDate: new Date().toISOString().split('T')[0], // Mock date
    status: user.verificationLevel === 'PRO' ? 'Pro' : 'Standard',
    balance: user.balance,
    isBlocked: false, // Backend entity doesn't have this, default to false
});

const mapProductToAdminPanelProduct = (product: Product): AdminPanelProduct => ({
    id: product.id,
    title: product.title,
    sellerName: product.seller.name,
    sellerId: product.seller.id,
    imageUrls: product.imageUrls,
    description: product.description,
    dynamicAttributes: product.dynamicAttributes,
    category: product.category,
    price: product.price ?? 0,
    status: product.status || 'Pending Moderation',
    dateAdded: new Date(product.createdAt || Date.now()).toISOString().split('T')[0],
    rejectionReason: product.rejectionReason,
});

// A temporary type to represent the shape of the order data coming from the backend.
type BackendOrder = any;

const mapOrderToAdminPanelOrder = (order: BackendOrder): AdminPanelOrder => ({
  id: order.id,
  customerName: order.buyer.name,
  sellerName: order.seller.name,
  date: new Date(order.createdAt).toISOString().split('T')[0],
  total: order.total,
  status: order.status,
  items: order.items.map(item => ({
    productId: item.product.id,
    title: item.product.title,
    imageUrl: item.product.imageUrls[0],
    quantity: item.quantity,
    price: item.price,
  })),
  customerInfo: {
    name: order.buyer.name,
    email: order.buyer.email || `tg_id_${order.buyer.telegramId}`,
    shippingAddress: `${order.shippingAddress.city}, ${order.shippingAddress.postOffice}`,
  },
});

export interface AdminSetting {
    key: string;
    value: string;
}

export const backendApiService = {
  // FIX: Added missing login method.
  login: async (email, password) => {
    return apiFetch('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  
  // Dashboard
  getDashboardData: async (): Promise<AdminDashboardData> => {
    return apiFetch('/dashboard');
  },

  // Users
  getUsers: async (): Promise<AdminPanelUser[]> => {
    const users: User[] = await apiFetch('/users');
    return users.map(mapUserToAdminPanelUser);
  },
  updateUser: async (user: AdminPanelUser): Promise<AdminPanelUser> => {
     const updates: Partial<User> = {
         name: user.name,
         email: user.email,
         balance: user.balance,
         verificationLevel: user.status === 'Pro' ? 'PRO' : 'NONE',
     };
     await apiFetch(`/users/${user.id}`, {
         method: 'PATCH',
         body: JSON.stringify(updates),
     });
     return user;
  },
  
  // Products
  getProducts: async (): Promise<AdminPanelProduct[]> => {
    const products: Product[] = await apiFetch('/products');
    return products.map(mapProductToAdminPanelProduct);
  },
  updateProduct: async (id: string, updates: Partial<Product>): Promise<Product> => {
      return apiFetch(`/products/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(updates),
      });
  },
  
  // FIX: Added missing getOrders method.
  getOrders: async (): Promise<AdminPanelOrder[]> => {
    const orders: BackendOrder[] = await apiFetch('/orders');
    return orders.map(mapOrderToAdminPanelOrder);
  },
  
  // FIX: Added missing updateOrder method.
  updateOrder: async (order: AdminPanelOrder): Promise<AdminPanelOrder> => {
    const updates = { status: order.status };
    const updatedOrder: BackendOrder = await apiFetch(`/orders/${order.id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
    });
    return mapOrderToAdminPanelOrder(updatedOrder);
  },

  // Categories
  getCategories: async (): Promise<CategorySchema[]> => {
    return apiFetch('/categories');
  },
  createCategory: async (category: Omit<CategorySchema, 'id'>): Promise<CategorySchema> => {
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
   
   // Icons
   getIcons: async (): Promise<AdminIcon[]> => {
       return apiFetch('/icons');
   },
   upsertIcon: async (icon: Partial<Omit<AdminIcon, 'id'>>): Promise<AdminIcon> => {
       return apiFetch('/icons/upsert', {
           method: 'PATCH',
           body: JSON.stringify(icon),
       });
   },

   // Settings
   getSettings: async (): Promise<AdminSetting[]> => {
       return apiFetch('/settings');
   },
   updateSettings: async (settings: { key: string; value: string }[]): Promise<AdminSetting[]> => {
       return apiFetch('/settings', {
           method: 'PATCH',
           body: JSON.stringify(settings),
       });
   },
};