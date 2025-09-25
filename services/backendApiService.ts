// This service handles all communication with the real NestJS backend for the admin panel.
import type { AdminPanelUser, AdminPanelProduct, CategorySchema, AdminPanelOrder } from './adminApiService';
// Assuming the backend entities are similar enough to frontend types for this mapping
import type { User, Product } from '@/types.ts'; 
import { CATEGORIES } from '@/constants.ts';

// --- REAL API IMPLEMENTATION ---

// This URL is now dynamic. It uses an environment variable for production
// and falls back to localhost for local development.
// FIX: Cast import.meta to any to resolve TypeScript error in environments where Vite types are not configured.
const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:3001';

/**
 * A helper function to make fetch requests to the backend API.
 * It automatically sets content type to JSON, adds the auth token, and handles errors.
 */
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  try {
    // In a real scenario, the admin token would be managed securely.
    // For now, we use a mock token similar to the frontend's local dev setup.
    const token = 'mock-admin-token';
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
// Functions to convert backend data structures to the format expected by the admin panel UI.

const mapUserToAdminPanelUser = (user: User): AdminPanelUser => ({
    id: user.id,
    name: user.name,
    email: `${user.id.slice(0, 5)}@telegram.user`, // Mock email
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
    status: 'Active', // Assume all products from backend are active for now
    dateAdded: new Date().toISOString().split('T')[0], // Mock date
});

// Assuming backend category structure is the same as frontend for now
const mapCategoryToAdminCategory = (category: any): CategorySchema => ({
    ...category,
    id: category.name, // Use name as ID if backend doesn't provide one
    iconId: null, // Add default iconId
    fields: category.fields.map((f: any) => ({ ...f, id: f.name })),
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
         balance: user.balance,
         verificationLevel: user.status === 'Pro' ? 'PRO' : 'NONE',
     };
     // 'isBlocked' is not on the backend entity, so we can't update it.
     // The change will be local to the admin panel session.
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
  
  // Categories
  getCategories: async (): Promise<CategorySchema[]> => {
    // There's no backend endpoint for categories, so we'll simulate it by returning the constants.
    // In a real app, this would be: `return apiFetch('/categories');`
    return CATEGORIES.map(mapCategoryToAdminCategory);
  },
   updateCategory: async (category: CategorySchema): Promise<CategorySchema> => {
       console.log("Simulating category update. In a real app, this would call a backend endpoint.", category);
       // This would be: await apiFetch(`/categories/${category.id}`, { method: 'PATCH', body: JSON.stringify(category) });
       await new Promise(res => setTimeout(res, 500));
       return category;
   }
};