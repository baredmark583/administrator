// This service handles all communication with the real NestJS backend for the admin panel.
import type { AdminPanelUser, AdminPanelProduct, CategorySchema, AdminPanelOrder, AdminIcon } from './adminApiService';
// Assuming the backend entities are similar enough to frontend types for this mapping
import type { User, Product } from '../types'; 

// --- REAL API IMPLEMENTATION ---
const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:3001';

const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const token = 'mock-admin-token';
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
    dateAdded: new Date(product.createdAt).toISOString().split('T')[0],
    rejectionReason: product.rejectionReason,
});


export const backendApiService = {
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
   createIcon: async (icon: Partial<Omit<AdminIcon, 'id'>>): Promise<AdminIcon> => {
       return apiFetch('/icons', {
           method: 'POST',
           body: JSON.stringify(icon),
       });
   }
};