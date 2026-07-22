import { CartItem } from './types';

class CartManager {
  private static STORAGE_KEY = 'bella_crosta_cart';
  private static SPECIAL_INSTRUCTIONS_KEY = 'bella_crosta_instructions';
  private static ORDER_MODE_KEY = 'bella_crosta_order_mode';
  private listeners: (() => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', () => this.notify());
    }
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  getItems(): CartItem[] {
    if (typeof window === 'undefined') return [];
    const val = localStorage.getItem(CartManager.STORAGE_KEY);
    return val ? JSON.parse(val) : [];
  }

  setItems(items: CartItem[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CartManager.STORAGE_KEY, JSON.stringify(items));
    this.notify();
  }

  addItem(item: Omit<CartItem, 'quantity'>) {
    const items = this.getItems();
    const existing = items.find(i => i.id === item.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      items.push({ ...item, quantity: 1 });
    }
    this.setItems(items);
  }

  updateQuantity(id: string, delta: number) {
    let items = this.getItems();
    const item = items.find(i => i.id === id);
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        items = items.filter(i => i.id !== id);
      }
      this.setItems(items);
    }
  }

  removeItem(id: string) {
    const items = this.getItems().filter(i => i.id !== id);
    this.setItems(items);
  }

  getInstructions(): string {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(CartManager.SPECIAL_INSTRUCTIONS_KEY) || '';
  }

  setInstructions(text: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CartManager.SPECIAL_INSTRUCTIONS_KEY, text);
    this.notify();
  }

  getOrderMode(): 'delivery' | 'pickup' {
    if (typeof window === 'undefined') return 'delivery';
    return (localStorage.getItem(CartManager.ORDER_MODE_KEY) as 'delivery' | 'pickup') || 'delivery';
  }

  setOrderMode(mode: 'delivery' | 'pickup') {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CartManager.ORDER_MODE_KEY, mode);
    this.notify();
  }

  clear() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(CartManager.STORAGE_KEY);
    localStorage.removeItem(CartManager.SPECIAL_INSTRUCTIONS_KEY);
    this.notify();
  }
}

export const cartManager = new CartManager();
