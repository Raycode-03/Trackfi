import { CartItem } from "@/types";

export const cartApi = {
  getCart: async (): Promise<CartItem[]> => {
    const res = await fetch('/api/users/cart');
    if (res.status === 401) {
      throw new Error('Session expired'); 
    }
    if (!res.ok) throw new Error('Failed to fetch cart');
    
    const data = await res.json();
    return data.items;
  },

  addCart: async (menuId: string): Promise<CartItem> => {
    const res = await fetch('/api/users/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ menuId }),
    });
    if (!res.ok) throw new Error('Failed to add item to cart');
    const data = await res.json();
    return data.item;
  },

  removeFromCart: async (cartItemId: string) => {
    const res = await fetch(`/api/users/cart/remove/${cartItemId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to remove item');
    return res.json();
  },

  updateCartItem: async (cartItemId: string, quantity: number) => {
    const res = await fetch(`/api/users/cart/update/${cartItemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    });
    if (!res.ok) throw new Error('Failed to update item');
    return res.json();
  },
};