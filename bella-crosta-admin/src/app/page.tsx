'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { Order, Settings, CartItem } from './types';
import { Check, Clock, Trash2, Edit3, Plus, Settings as SettingsIcon, LogOut, Pizza, Receipt } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'categories' | 'settings'>('orders');
  const [session, setSession] = useState<any>(null);
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Dashboard Data
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [settings, setSettings] = useState<Settings>({
    business_whatsapp_number: '',
    instapay_number: '',
    vodafone_cash_number: '',
    delivery_fee: 0,
    tax_rate: 0,
    store_hours: '',
    store_address: ''
  });

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Custom Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Edit / Add Item States
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemPrice, setNewItemPrice] = useState<string | number>(10);
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemImageUrl, setNewItemImageUrl] = useState('');
  const [newItemTags, setNewItemTags] = useState('');

  // Check auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch admin stats when session exists
  useEffect(() => {
    if (!session) return;
    loadOrders();
    loadMenuItems();
    loadCategories();
    loadSettings();

    // Enable realtime listening to orders
    const ordersChannel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          loadOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
    };
  }, [session]);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error loading orders:', err);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      setCategories(data || []);
      if (data && data.length > 0 && !newItemCategory) {
        setNewItemCategory(data[0].name);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const { error } = await supabase
        .from('categories')
        .insert({ name: newCategoryName.trim() });
      if (error) throw error;
      showToast('Category added successfully!', 'success');
      setNewCategoryName('');
      loadCategories();
    } catch (err: any) {
      console.error('Error adding category:', err);
      showToast(`Failed to add category: ${err.message || 'Error occurred.'}`, 'error');
    }
  };

  const handleDeleteCategory = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Category',
      message: `Are you sure you want to delete the category "${name}"? This will not delete the pizzas inside it, but they won't have a category assigned.`,
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);
          if (error) throw error;
          showToast('Category deleted successfully!', 'success');
          loadCategories();
        } catch (err: any) {
          console.error('Error deleting category:', err);
          showToast(`Failed to delete category: ${err.message || 'Error occurred.'}`, 'error');
        } finally {
          setConfirmModal(null);
        }
      }
    });
  };

  const loadMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      setMenuItems(data || []);
    } catch (err) {
      console.error('Error loading menu items:', err);
    }
  };

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .single();
      if (error) throw error;
      if (data) setSettings(data);
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: newStatus })
        .eq('id', orderId);
      if (error) throw error;
      loadOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('settings')
        .update({
          business_whatsapp_number: settings.business_whatsapp_number,
          instapay_number: settings.instapay_number,
          vodafone_cash_number: settings.vodafone_cash_number,
          delivery_fee: Number(settings.delivery_fee),
          tax_rate: Number(settings.tax_rate),
          store_hours: settings.store_hours,
          store_address: settings.store_address
        })
        .eq('id', 1);

      if (error) throw error;
      showToast('Settings updated successfully!', 'success');
      loadSettings();
    } catch (err: any) {
      console.error('Error updating settings:', err);
      showToast(`Failed to save settings: ${err.message || 'Error occurred.'}`, 'error');
    }
  };

  const handleSaveMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArr = newItemTags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    try {
      if (editingItem) {
        // Edit Mode
        const { error } = await supabase
          .from('menu_items')
          .update({
            name: newItemName,
            description: newItemDesc,
            price: Number(newItemPrice),
            category: newItemCategory,
            image_url: newItemImageUrl,
            tags: tagsArr
          })
          .eq('id', editingItem.id);
        if (error) throw error;
        showToast('Pizza updated successfully!', 'success');
      } else {
        // Add Mode
        const { error } = await supabase
          .from('menu_items')
          .insert({
            name: newItemName,
            description: newItemDesc,
            price: Number(newItemPrice),
            category: newItemCategory,
            image_url: newItemImageUrl,
            tags: tagsArr,
            available: true
          });
        if (error) throw error;
        showToast('New pizza published successfully!', 'success');
      }
      resetMenuForm();
      loadMenuItems();
    } catch (err: any) {
      console.error('Error saving menu item:', err);
      showToast(`Failed to save pizza: ${err.message || 'Database error occurred.'}`, 'error');
    }
  };

  const handleToggleAvailability = async (itemId: string, currentVal: boolean) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ available: !currentVal })
        .eq('id', itemId);
      if (error) throw error;
      loadMenuItems();
    } catch (err) {
      console.error('Error toggling menu item availability:', err);
    }
  };

  const handleDeleteItem = (itemId: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Menu Item',
      message: `Are you sure you want to permanently delete "${name}" from the menu? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('menu_items')
            .delete()
            .eq('id', itemId);
          if (error) throw error;
          showToast('Menu item deleted successfully!', 'success');
          loadMenuItems();
        } catch (err: any) {
          console.error('Error deleting menu item:', err);
          showToast(`Failed to delete item: ${err.message || 'Database error.'}`, 'error');
        } finally {
          setConfirmModal(null);
        }
      }
    });
  };

  const handleEditClick = (item: any) => {
    setEditingItem(item);
    setNewItemName(item.name);
    setNewItemDesc(item.description);
    setNewItemPrice(item.price);
    setNewItemCategory(item.category);
    setNewItemImageUrl(item.image_url);
    setNewItemTags(item.tags ? item.tags.join(', ') : '');
  };

  const resetMenuForm = () => {
    setEditingItem(null);
    setNewItemName('');
    setNewItemDesc('');
    setNewItemPrice(10);
    setNewItemCategory('Classic');
    setNewItemImageUrl('');
    setNewItemTags('');
  };

  // 1. LOGIN SCREEN
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface px-4 py-12 font-body relative overflow-hidden">
        {/* Decorative background gradients */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-tertiary-container/5 rounded-full blur-3xl -z-10"></div>

        <div className="w-full max-w-md space-y-8 bg-surface-container-lowest p-8 md:p-10 rounded-xl border border-outline-variant shadow-xl">
          <div className="text-center">
            <span className="font-headline text-3xl font-bold text-primary tracking-tight">Bella Crosta</span>
            <h2 className="mt-6 text-2xl font-headline font-bold text-on-surface">Admin Portal</h2>
            <p className="mt-2 text-sm font-body text-on-surface-variant">Sign in to manage pizzeria settings & orders</p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            {authError && (
              <div className="bg-error-container text-on-error-container text-xs p-3 rounded-lg border border-error/20">
                {authError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-surface-container text-on-surface border border-outline-variant rounded-lg px-4 py-3 font-body text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="admin@bellacrosta.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-surface-container text-on-surface border border-outline-variant rounded-lg px-4 py-3 font-body text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-primary text-on-primary font-bold px-6 py-3.5 rounded-lg hover:bg-primary-container active:scale-95 transition-all shadow-md flex justify-center items-center gap-2 cursor-pointer"
            >
              {authLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. MAIN ADMIN DASHBOARD INTERFACE
  return (
    <div className="min-h-screen bg-surface flex flex-col font-body">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-surface-container-lowest shadow-sm md:px-10 border-b border-surface-container">
        <div className="flex items-center gap-4">
          <span className="font-headline text-2xl font-bold text-primary tracking-tight">Bella Crosta</span>
          <span className="bg-tertiary-container text-on-tertiary-container text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
            Admin Portal
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary text-sm font-bold transition-all px-3 py-1.5 rounded-lg hover:bg-surface-container cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-grow pt-16 flex flex-col lg:flex-row">
        {/* Sidebar Nav */}
        <aside className="w-full lg:w-64 bg-surface-container-lowest border-b lg:border-b-0 lg:border-r border-surface-container p-4 lg:p-6 lg:fixed lg:top-16 lg:left-0 lg:bottom-0 z-40">
          <div className="space-y-1 lg:space-y-2">
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Incoming Orders</span>
              {orders.filter(o => o.order_status === 'pending_payment' || o.order_status === 'cod').length > 0 && (
                <span className="ml-auto w-5.5 h-5.5 bg-secondary text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                  {orders.filter(o => o.order_status === 'pending_payment' || o.order_status === 'cod').length}
                </span>
              )}
            </button>

             <button
              onClick={() => setActiveTab('menu')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'menu'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <Pizza className="w-4 h-4" />
              <span>Menu Management</span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'categories'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              <span>Category Manager</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              <span>Store Configuration</span>
            </button>
          </div>
        </aside>

        {/* Content Container */}
        <main className="flex-1 lg:ml-64 p-4 md:p-8 max-w-7xl">
          {/* TAB 1: ORDERS LISTING */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-headline text-2xl font-bold text-on-surface">Incoming Pizzas & Deliveries</h3>
                <button
                  onClick={loadOrders}
                  className="flex items-center gap-1 bg-surface-container hover:bg-surface-container-high text-xs px-3 py-2 rounded-lg font-bold border border-outline-variant transition-all cursor-pointer"
                >
                  Refresh Feed
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="bg-surface-container-lowest p-12 text-center rounded-xl border border-outline-variant">
                  <p className="font-body text-on-surface-variant">No orders placed yet.</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {orders.map(order => (
                    <div
                      key={order.id}
                      className={`bg-surface-container-lowest p-6 rounded-xl border transition-all ${
                        order.order_status === 'pending_payment'
                          ? 'border-secondary/40 shadow-sm'
                          : 'border-outline-variant'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 pb-4 border-b border-surface-container">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-headline text-lg font-bold text-on-surface">
                              Order #{order.id?.slice(0, 8)}
                            </span>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              order.order_status === 'pending_payment' ? 'bg-secondary-container text-on-secondary-container' :
                              order.order_status === 'paid' ? 'bg-tertiary-container text-on-tertiary-container' :
                              order.order_status === 'cod' ? 'bg-outline-variant text-on-secondary-container' :
                              'bg-surface-container-high text-on-surface-variant'
                            }`}>
                              {order.order_status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-on-surface-variant font-body mt-1">
                            Placed on {order.created_at ? new Date(order.created_at).toLocaleString() : ''}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <label className="text-xs font-bold text-on-surface-variant mr-1">Status:</label>
                          <select
                            value={order.order_status}
                            onChange={e => handleUpdateStatus(order.id!, e.target.value)}
                            className="bg-surface-container border border-outline-variant rounded px-2 py-1.5 font-body text-xs focus:outline-none"
                          >
                            <option value="cod">Cash on Delivery</option>
                            <option value="pending_payment">Pending Payment</option>
                            <option value="paid">Paid & Confirmed</option>
                            <option value="preparing">In Oven / Preparing</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                          </select>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-2 mb-4">
                        <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">Pizzas Ordered:</h4>
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm font-body text-on-surface-variant bg-surface-container-low px-3 py-2 rounded-lg">
                            <span>
                              <span className="font-bold text-primary mr-1.5">{item.quantity}x</span>
                              {item.name}
                            </span>
                            <span className="font-semibold text-on-surface">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Details & Total */}
                      <div className="grid md:grid-cols-2 gap-6 pt-2">
                        <div className="space-y-1 font-body text-xs text-on-surface-variant">
                          <p><strong className="text-on-surface">Client:</strong> {order.customer_name}</p>
                          <p><strong className="text-on-surface">Phone:</strong> {order.phone}</p>
                          <p><strong className="text-on-surface">Type:</strong> {order.delivery_or_pickup.toUpperCase()}</p>
                          <p><strong className="text-on-surface">Payment:</strong> {order.payment_method.toUpperCase()}</p>
                          <p className="line-clamp-2"><strong className="text-on-surface">Address:</strong> {order.address}</p>
                        </div>

                        <div className="flex flex-col items-end justify-end space-y-1 text-sm font-body">
                          <div className="flex justify-between w-full md:max-w-[200px] text-xs text-on-surface-variant">
                            <span>Subtotal:</span>
                            <span>${order.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between w-full md:max-w-[200px] text-xs text-on-surface-variant">
                            <span>Delivery Fee:</span>
                            <span>${order.delivery_fee.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between w-full md:max-w-[200px] text-xs text-on-surface-variant">
                            <span>Tax:</span>
                            <span>${order.tax.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between w-full md:max-w-[200px] font-bold text-base text-primary border-t border-outline-variant pt-1.5 mt-1.5">
                            <span>Total:</span>
                            <span>${order.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MENU ITEMS */}
          {activeTab === 'menu' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="font-headline text-2xl font-bold text-on-surface">Manage Pizzas & Plates</h3>
                <button
                  onClick={resetMenuForm}
                  className="bg-primary text-on-primary text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-primary-container transition-all flex items-center gap-1.5 shadow cursor-pointer self-start md:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Pizza</span>
                </button>
              </div>

              {/* Edit / Add Pizza Form */}
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-md">
                <h4 className="font-headline text-lg font-bold text-on-surface mb-6">
                  {editingItem ? `Edit Item: ${editingItem.name}` : 'Create a New Pizza / Item'}
                </h4>

                <form onSubmit={handleSaveMenuItem} className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">Item Name</label>
                      <input
                        type="text"
                        required
                        value={newItemName}
                        onChange={e => setNewItemName(e.target.value)}
                        className="w-full bg-surface-container text-on-surface border border-outline-variant rounded-lg px-4 py-2.5 font-body text-sm focus:outline-none focus:border-primary"
                        placeholder="e.g. Quattro Formaggi"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">Description</label>
                      <textarea
                        required
                        rows={3}
                        value={newItemDesc}
                        onChange={e => setNewItemDesc(e.target.value)}
                        className="w-full bg-surface-container text-on-surface border border-outline-variant rounded-lg px-4 py-2.5 font-body text-sm focus:outline-none focus:border-primary resize-none"
                        placeholder="San Marzano, Mozzarella, Gorgonzola, Parmigiano, Pecorino..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">Price ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={newItemPrice === '' ? '' : newItemPrice}
                          onChange={e => setNewItemPrice(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full bg-surface-container text-on-surface border border-outline-variant rounded-lg px-4 py-2.5 font-body text-sm focus:outline-none focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">Category</label>
                        <select
                          value={newItemCategory}
                          onChange={e => setNewItemCategory(e.target.value)}
                          className="w-full bg-surface-container text-on-surface border border-outline-variant rounded-lg px-4 py-2.5 font-body text-sm focus:outline-none focus:border-primary"
                        >
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.name}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">Pizza Photo</label>
                      <div className="flex flex-col gap-2">
                        {newItemImageUrl && (
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-outline-variant">
                            <img src={newItemImageUrl} className="w-full h-full object-cover" alt="Preview" />
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            
                            try {
                              const fileExt = file.name.split('.').pop();
                              const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
                              const filePath = `${fileName}`;

                              // Upload image file to public 'pizza_photos' bucket
                              const { data, error } = await supabase.storage
                                .from('pizza_photos')
                                .upload(filePath, file);

                              if (error) throw error;

                              // Retrieve public URL link
                              const { data: { publicUrl } } = supabase.storage
                                .from('pizza_photos')
                                .getPublicUrl(filePath);

                               showToast('Pizza photo uploaded successfully!', 'success');
                              setNewItemImageUrl(publicUrl);
                            } catch (err: any) {
                              console.error('Error uploading pizza image file:', err);
                              showToast(`Upload failed: ${err.message || 'Make sure the "pizza_photos" storage bucket exists and is Public.'}`, 'error');
                            }
                          }}
                          className="w-full bg-surface-container text-on-surface border border-outline-variant rounded-lg px-4 py-2 font-body text-sm focus:outline-none focus:border-primary file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-on-primary hover:file:opacity-90"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">
                        Tags (comma-separated list)
                      </label>
                      <input
                        type="text"
                        value={newItemTags}
                        onChange={e => setNewItemTags(e.target.value)}
                        className="w-full bg-surface-container text-on-surface border border-outline-variant rounded-lg px-4 py-2.5 font-body text-sm focus:outline-none focus:border-primary"
                        placeholder="e.g. Spicy, Chef Choice, Vegetarian"
                      />
                      <span className="text-[10px] text-on-surface-variant mt-1.5 block">
                        Separated by commas. These show as tags on the client menu.
                      </span>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        className="flex-1 bg-primary text-on-primary font-bold py-3 rounded-lg hover:bg-primary-container active:scale-95 transition-all shadow cursor-pointer"
                      >
                        {editingItem ? 'Save Updates' : 'Publish Pizza'}
                      </button>
                      {editingItem && (
                        <button
                          type="button"
                          onClick={resetMenuForm}
                          className="bg-surface-container hover:bg-surface-container-high font-bold px-6 py-3 rounded-lg border border-outline-variant transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </div>

              {/* Pizza Grid Listing */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menuItems.map(item => (
                  <div key={item.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm flex flex-col">
                    <div className="relative h-44 bg-surface-container-low">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 bg-surface/90 font-bold text-primary font-body text-sm py-1 px-2.5 rounded-lg border border-outline-variant shadow">
                        ${Number(item.price).toFixed(2)}
                      </div>
                    </div>

                    <div className="p-5 flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-headline font-bold text-on-surface text-base">{item.name}</h4>
                          <span className="text-[9px] uppercase font-bold tracking-widest text-on-tertiary-fixed-variant bg-tertiary-container/30 px-1.5 py-0.5 rounded">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant font-body line-clamp-3 mb-4 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-surface-container pt-4 mt-2">
                        <button
                          onClick={() => handleToggleAvailability(item.id, item.available)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                            item.available
                              ? 'bg-tertiary/10 text-tertiary border-tertiary/20 hover:bg-tertiary/20'
                              : 'bg-error/10 text-error border-error/20 hover:bg-error/20'
                          }`}
                        >
                          {item.available ? 'Available' : 'Out of Stock'}
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditClick(item)}
                            className="p-2 text-on-surface-variant hover:text-primary transition-all rounded-lg hover:bg-surface-container cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id, item.name)}
                            className="p-2 text-on-surface-variant hover:text-error transition-all rounded-lg hover:bg-surface-container cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORY MANAGER */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <h3 className="font-headline text-2xl font-bold text-on-surface">Manage Pizzeria Categories</h3>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Add Category Form */}
                <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm h-fit">
                  <h4 className="font-headline text-base font-bold text-on-surface mb-4">Create New Category</h4>
                  <form onSubmit={handleAddCategory} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">Category Name</label>
                      <input
                        type="text"
                        required
                        value={newCategoryName}
                        onChange={e => setNewCategoryName(e.target.value)}
                        className="w-full bg-surface-container text-on-surface border border-outline-variant rounded-lg px-4 py-2.5 font-body text-sm focus:outline-none focus:border-primary"
                        placeholder="e.g. Desserts, Drinks, Calzones"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-primary text-on-primary font-bold px-6 py-2.5 rounded-lg hover:bg-primary-container active:scale-95 transition-all shadow cursor-pointer text-xs"
                    >
                      Add Category
                    </button>
                  </form>
                </div>

                {/* Categories List */}
                <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
                  <h4 className="font-headline text-base font-bold text-on-surface mb-4">Active Categories</h4>
                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
                    {categories.length === 0 ? (
                      <p className="text-sm text-on-surface-variant font-body">No categories added yet.</p>
                    ) : (
                      categories.map(cat => (
                        <div key={cat.id} className="flex justify-between items-center bg-surface-container-low px-4 py-3 rounded-lg border border-outline-variant/30 text-sm">
                          <span className="font-semibold text-on-surface">{cat.name}</span>
                          <button
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            className="p-1.5 text-on-surface-variant hover:text-error transition-all rounded-lg hover:bg-surface-container cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CONFIGURATION SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="font-headline text-2xl font-bold text-on-surface">Store Configuration Parameters</h3>

              <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl border border-outline-variant shadow-md">
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">
                          Store WhatsApp Number
                        </label>
                        <input
                          type="text"
                          required
                          value={settings.business_whatsapp_number}
                          onChange={e => setSettings({ ...settings, business_whatsapp_number: e.target.value })}
                          className="w-full bg-surface-container text-on-surface border border-outline-variant rounded-lg px-4 py-2.5 font-body text-sm focus:outline-none focus:border-primary"
                          placeholder="e.g. 201000000000"
                        />
                        <span className="text-[10px] text-on-surface-variant mt-1 block">
                          Format: International country code + number with no leading zeros or symbols.
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">
                          InstaPay Account Username/ID
                        </label>
                        <input
                          type="text"
                          required
                          value={settings.instapay_number}
                          onChange={e => setSettings({ ...settings, instapay_number: e.target.value })}
                          className="w-full bg-surface-container text-on-surface border border-outline-variant rounded-lg px-4 py-2.5 font-body text-sm focus:outline-none focus:border-primary"
                          placeholder="e.g. username@instapay"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">
                          Vodafone Cash Wallet Number
                        </label>
                        <input
                          type="text"
                          required
                          value={settings.vodafone_cash_number}
                          onChange={e => setSettings({ ...settings, vodafone_cash_number: e.target.value })}
                          className="w-full bg-surface-container text-on-surface border border-outline-variant rounded-lg px-4 py-2.5 font-body text-sm focus:outline-none focus:border-primary"
                          placeholder="e.g. 01012345678"
                        />
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">
                            Delivery Fee ($)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={settings.delivery_fee}
                            onChange={e => setSettings({ ...settings, delivery_fee: Number(e.target.value) })}
                            className="w-full bg-surface-container text-on-surface border border-outline-variant rounded-lg px-4 py-2.5 font-body text-sm focus:outline-none focus:border-primary"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">
                            Tax Rate (0.00 - 1.00)
                          </label>
                          <input
                            type="number"
                            step="0.001"
                            required
                            value={settings.tax_rate}
                            onChange={e => setSettings({ ...settings, tax_rate: Number(e.target.value) })}
                            className="w-full bg-surface-container text-on-surface border border-outline-variant rounded-lg px-4 py-2.5 font-body text-sm focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">
                          Store Operating Hours
                        </label>
                        <input
                          type="text"
                          required
                          value={settings.store_hours}
                          onChange={e => setSettings({ ...settings, store_hours: e.target.value })}
                          className="w-full bg-surface-container text-on-surface border border-outline-variant rounded-lg px-4 py-2.5 font-body text-sm focus:outline-none focus:border-primary"
                          placeholder="e.g. Daily: 11:00 AM - 10:00 PM"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">
                          Pizzeria Physical Address
                        </label>
                        <input
                          type="text"
                          required
                          value={settings.store_address}
                          onChange={e => setSettings({ ...settings, store_address: e.target.value })}
                          className="w-full bg-surface-container text-on-surface border border-outline-variant rounded-lg px-4 py-2.5 font-body text-sm focus:outline-none focus:border-primary"
                          placeholder="e.g. 123 Dough Street, Pizza Plaza, FL 33101"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-surface-container pt-6 flex justify-end">
                    <button
                      type="submit"
                      className="bg-primary text-on-primary font-bold px-8 py-3 rounded-lg hover:bg-primary-container active:scale-95 transition-all shadow cursor-pointer"
                    >
                      Save Configuration
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
      {/* Custom Professional Toast Notification Overlay */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999] animate-fade-in-up">
          <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-xl font-body text-sm font-semibold transition-all ${
            toast.type === 'success'
              ? 'bg-tertiary-container/95 text-on-tertiary-container border-tertiary/20'
              : 'bg-error-container/95 text-on-error-container border-error/20'
          }`}>
            <span className="material-symbols-outlined">
              {toast.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Custom Professional Confirmation Modal Dialog */}
      {confirmModal?.isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container-lowest max-w-md w-full rounded-2xl border border-outline-variant p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center gap-3 text-error">
              <span className="material-symbols-outlined text-3xl">warning</span>
              <h3 className="font-headline text-lg font-bold text-on-surface">{confirmModal.title}</h3>
            </div>
            <p className="font-body text-sm text-on-surface-variant leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-5 py-2.5 rounded-lg border border-outline-variant font-bold text-sm text-on-surface-variant hover:bg-surface-container transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className="px-5 py-2.5 rounded-lg bg-error text-on-error font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
