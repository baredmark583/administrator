// This service handles REAL API calls to the NestJS backend for the admin panel.

import type { AdminDashboardData, AdminPanelUser, AdminPanelProduct, AdminPanelOrder, AdminTransaction, AdminGlobalPromoCode, AdminPanelDispute, AdminIcon, AdminPanelUserDetails } from './adminApiService';
import type { CategorySchema } from '../constants';

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
    
    if (response.status === 204 || response.headers.get('content-length') === '0') { // No Content
        return;
    }

    return response.json();
  } catch (error) {
    console.error(`API fetch error: ${options.method || 'GET'} ${endpoint}`, error);
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
        return apiFetch('/dashboard');
    },

    getUsers: async (): Promise<AdminPanelUser[]> => {
        const users = await apiFetch('/users');
        // Map backend User to AdminPanelUser
        return users.map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email || 'N/A',
            avatarUrl: u.avatarUrl,
            registrationDate: new Date(u.createdAt).toLocaleDateString(),
            status: u.verificationLevel === 'PRO' ? 'Pro' : 'Standard',
            balance: u.balance,
            isBlocked: false, // This is a UI-only feature for now
        }));
    },
    
    getUserDetails: async (id: string): Promise<AdminPanelUserDetails> => {
        const user = await apiFetch(`/users/${id}/details`);
        // Map backend data to AdminPanelUserDetails
        return {
            ...user,
            registrationDate: new Date(user.createdAt).toLocaleDateString(),
            status: user.verificationLevel === 'PRO' ? 'Pro' : 'Standard',
            isBlocked: false, // UI-only feature
            // You can add more detailed mapping for nested objects if needed
        };
    },

    updateUser: async (user: AdminPanelUser): Promise<AdminPanelUser> => {
        const payload = {
            name: user.name,
            email: user.email,
            balance: user.balance,
            verificationLevel: user.status === 'Pro' ? 'PRO' : 'NONE',
        };
        return apiFetch(`/users/${user.id}`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
        });
    },
    
    getProducts: async (): Promise<AdminPanelProduct[]> => {
        const products = await apiFetch('/products');
        return products.map((p: any) => ({
            id: p.id,
            title: p.title,
            imageUrls: p.imageUrls,
            sellerName: p.seller?.name || 'Unknown',
            category: p.category,
            price: p.price,
            status: p.status,
            dateAdded: new Date(p.createdAt).toLocaleDateString(),
            description: p.description,
            dynamicAttributes: p.dynamicAttributes,
            rejectionReason: p.rejectionReason,
        }));
    },
    
    updateProduct: async (productId: string, updates: Partial<AdminPanelProduct>): Promise<AdminPanelProduct> => {
        return apiFetch(`/products/${productId}`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
        });
    },

    getOrders: async (): Promise<AdminPanelOrder[]> => {
        const orders = await apiFetch('/orders');
        return orders.map((o: any) => ({
            id: o.id,
            customerName: o.buyer.name,
            date: new Date(o.orderDate).toLocaleDateString(),
            total: o.total,
            status: o.status,
            customerInfo: {
                name: o.buyer.name,
                email: o.buyer.email || 'N/A',
                shippingAddress: `${o.shippingAddress.city}, ${o.shippingAddress.postOffice}`
            },
            sellerName: o.seller.name,
            items: o.items.map((item: any) => ({
                productId: item.product.id,
                title: item.product.title,
                imageUrl: item.product.imageUrls[0],
                quantity: item.quantity,
                price: item.price,
            }))
        }));
    },
    
    updateOrder: async (order: AdminPanelOrder): Promise<AdminPanelOrder> => {
        return apiFetch(`/orders/${order.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status: order.status }),
        });
    },

    getDisputes: async (): Promise<AdminPanelDispute[]> => {
        return apiFetch('/disputes');
    },

    updateDispute: async (dispute: AdminPanelDispute): Promise<AdminPanelDispute> => {
        return apiFetch(`/disputes/${dispute.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status: dispute.status, messages: dispute.messages }),
        });
    },

    getTransactions: async (): Promise<AdminTransaction[]> => {
        return apiFetch('/transactions');
    },
    
    getGlobalPromoCodes: async (): Promise<AdminGlobalPromoCode[]> => {
        // This would be a real endpoint in a full implementation
        return Promise.resolve([]);
    },

    createGlobalPromoCode: async (data: any): Promise<AdminGlobalPromoCode> => {
        console.log("Creating global promo code (mock):", data);
        await new Promise(res => setTimeout(res, 500));
        return { ...data, id: `promo_${Date.now()}`, uses: 0 };
    },

    deleteGlobalPromoCode: async (id: string): Promise<void> => {
        console.log("Deleting global promo code (mock):", id);
        await new Promise(res => setTimeout(res, 300));
    },

    getCategories: async(): Promise<CategorySchema[]> => {
        return apiFetch('/categories');
    },

    createCategory: async(category: CategorySchema): Promise<CategorySchema> => {
        return apiFetch('/categories', {
            method: 'POST',
            body: JSON.stringify(category),
        });
    },

    updateCategory: async(id: string, category: CategorySchema): Promise<CategorySchema> => {
        return apiFetch(`/categories/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(category),
        });
    },
    
    deleteCategory: async (id: string): Promise<void> => {
        return apiFetch(`/categories/${id}`, {
            method: 'DELETE',
        });
    },

    batchCreateCategories: async(categories: CategorySchema[]): Promise<void> => {
        return apiFetch('/categories/batch-create', {
            method: 'POST',
            body: JSON.stringify({ categories }),
        });
    },
    
    generateCategoryStructure: async (description: string): Promise<CategorySchema[]> => {
        return apiFetch('/ai/generate-category-structure', {
            method: 'POST',
            body: JSON.stringify({ description }),
        });
    },

    generateAndSaveSubcategories: async(parentId: string, parentName: string): Promise<void> => {
        return apiFetch('/ai/generate-and-save-subcategories', {
            method: 'POST',
            body: JSON.stringify({ parentId, parentName }),
        });
    },

    getIcons: async(): Promise<AdminIcon[]> => {
        return apiFetch('/icons');
    },
    
    upsertIcon: async(iconData: Partial<Omit<AdminIcon, 'id'>>): Promise<AdminIcon> => {
        return apiFetch('/icons/upsert', {
            method: 'PATCH',
            body: JSON.stringify(iconData),
        });
    },

    getSettings: async(): Promise<{key: string, value: string}[]> => {
        return apiFetch('/settings');
    },

    updateSettings: async(settings: {key: string, value: string}[]): Promise<void> => {
        return apiFetch('/settings', {
            method: 'PATCH',
            body: JSON.stringify(settings),
        });
    },
};