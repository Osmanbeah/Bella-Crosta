'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '../AppShell';
import { cartManager } from '../cartStore';
import { supabase } from '../supabase';
import { CartItem, Settings } from '../types';
import { CreditCard, Wallet, Landmark, PhoneCall } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [mode, setMode] = useState<'delivery' | 'pickup'>('delivery');
  
  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'instapay' | 'vodafone_cash'>('cod');
  
  // Settings Config
  const [settings, setSettings] = useState<Settings>({
    business_whatsapp_number: '201000000000',
    instapay_number: '201000000000',
    vodafone_cash_number: '201000000000',
    delivery_fee: 2.50,
    tax_rate: 0.08,
    store_hours: 'Daily: 11:00 AM - 10:00 PM',
    store_address: '123 Dough Street, Pizza Plaza, FL 33101'
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const cartItems = cartManager.getItems();
    if (cartItems.length === 0) {
      router.push('/menu');
    } else {
      setItems(cartItems);
    }
    setMode(cartManager.getOrderMode());
  }, [router]);

  // Fetch Settings Config Live
  useEffect(() => {
    async function loadSettings() {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .eq('id', 1)
          .single();

        if (error) throw error;
        if (data) {
          setSettings({
            business_whatsapp_number: data.business_whatsapp_number,
            instapay_number: data.instapay_number,
            vodafone_cash_number: data.vodafone_cash_number,
            delivery_fee: Number(data.delivery_fee),
            tax_rate: Number(data.tax_rate),
            store_hours: data.store_hours,
            store_address: data.store_address
          });
        }
      } catch (err) {
        console.warn('Could not fetch checkout settings config from database (using fallback defaults):', err);
      }
    }
    loadSettings();
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * settings.tax_rate;
  const deliveryCost = mode === 'delivery' ? settings.delivery_fee : 0;
  const total = subtotal + tax + deliveryCost;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || (mode === 'delivery' && !address)) {
      setErrorMsg('Please fill in all required customer details.');
      return;
    }
    
    setSubmitting(true);
    setErrorMsg('');

    const orderStatus = paymentMethod === 'cod' ? 'cod' : 'pending_payment';

    try {
      const orderPayload = {
        customer_name: name,
        phone,
        address: mode === 'delivery' ? address : 'PICKUP AT STORE: ' + settings.store_address,
        items: items,
        subtotal,
        delivery_fee: deliveryCost,
        tax,
        total,
        delivery_or_pickup: mode,
        payment_method: paymentMethod,
        order_status: orderStatus
      };

      const { data, error } = await supabase
        .from('orders')
        .insert([orderPayload])
        .select();

      if (error) throw error;

      // Clear the local cart
      cartManager.clear();

      // Navigate to order-confirmed page
      const insertedOrder = data?.[0];
      router.push(`/order-confirmed?id=${insertedOrder?.id || 'default'}`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to place order. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <main className="max-w-7xl mx-auto px-4 pt-8 pb-24 w-full">
        <h2 className="font-headline text-3xl font-bold mb-8">Checkout</h2>
        
        {errorMsg && (
          <div className="bg-error-container text-on-error-container p-4 rounded-lg mb-6 border border-error/20">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Checkout Form Section */}
          <div className="lg:col-span-7 space-y-8">
            {/* Toggle Selector */}
            <section>
              <div className="bg-surface-container-low p-1 rounded-xl flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('delivery');
                    cartManager.setOrderMode('delivery');
                  }}
                  className={`flex-1 py-3 rounded-lg font-label-md text-sm transition-all cursor-pointer ${
                    mode === 'delivery' ? 'bg-primary-container text-white' : 'text-on-surface-variant hover:bg-surface-variant/50'
                  }`}
                >
                  DELIVERY
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('pickup');
                    cartManager.setOrderMode('pickup');
                  }}
                  className={`flex-1 py-3 rounded-lg font-label-md text-sm transition-all cursor-pointer ${
                    mode === 'pickup' ? 'bg-primary-container text-white' : 'text-on-surface-variant hover:bg-surface-variant/50'
                  }`}
                >
                  PICKUP
                </button>
              </div>
            </section>

            {/* Personal Info */}
            <section className="space-y-6">
              <h3 className="font-headline text-xl font-semibold">Your Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-label-md text-xs text-on-surface-variant px-1 block">FULL NAME *</label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 text-sm focus:border-2 focus:border-on-surface focus:outline-none"
                    placeholder="Enzo Ferrari"
                    type="text"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-label-md text-xs text-on-surface-variant px-1 block">PHONE NUMBER *</label>
                  <input
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 text-sm focus:border-2 focus:border-on-surface focus:outline-none"
                    placeholder="+39 012 345 6789"
                    type="tel"
                  />
                </div>
              </div>
            </section>

            {/* Address Section */}
            {mode === 'delivery' && (
              <section className="space-y-6 transition-all">
                <h3 className="font-headline text-xl font-semibold">Delivery Address</h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="font-label-md text-xs text-on-surface-variant px-1 block">STREET ADDRESS *</label>
                    <input
                      required={mode === 'delivery'}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 text-sm focus:border-2 focus:border-on-surface focus:outline-none"
                      placeholder="Via del Corso, 12"
                      type="text"
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Custom Payment Methods Override */}
            <section className="space-y-6">
              <h3 className="font-headline text-xl font-semibold">Payment Method</h3>
              <div className="grid grid-cols-1 gap-4">
                {/* Cash on Delivery */}
                <label className={`relative flex items-center p-4 bg-white border-2 rounded-xl cursor-pointer shadow-sm transition-colors ${
                  paymentMethod === 'cod' ? 'border-primary' : 'border-outline-variant hover:border-outline'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="hidden"
                  />
                  <Wallet className="w-6 h-6 text-primary mr-3" />
                  <div className="flex flex-col">
                    <span className="font-label-md text-sm">CASH ON DELIVERY</span>
                    <span className="text-xs text-on-surface-variant">Pay in cash when you receive your order</span>
                  </div>
                </label>

                {/* InstaPay */}
                <label className={`relative flex items-center p-4 bg-white border-2 rounded-xl cursor-pointer shadow-sm transition-colors ${
                  paymentMethod === 'instapay' ? 'border-primary' : 'border-outline-variant hover:border-outline'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="instapay"
                    checked={paymentMethod === 'instapay'}
                    onChange={() => setPaymentMethod('instapay')}
                    className="hidden"
                  />
                  <Landmark className="w-6 h-6 text-primary mr-3" />
                  <div className="flex flex-col">
                    <span className="font-label-md text-sm">INSTAPAY</span>
                    <span className="text-xs text-on-surface-variant">Transfer using InstaPay (Coordinate: {settings.instapay_number})</span>
                  </div>
                </label>

                {/* Vodafone Cash */}
                <label className={`relative flex items-center p-4 bg-white border-2 rounded-xl cursor-pointer shadow-sm transition-colors ${
                  paymentMethod === 'vodafone_cash' ? 'border-primary' : 'border-outline-variant hover:border-outline'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="vodafone_cash"
                    checked={paymentMethod === 'vodafone_cash'}
                    onChange={() => setPaymentMethod('vodafone_cash')}
                    className="hidden"
                  />
                  <PhoneCall className="w-6 h-6 text-primary mr-3" />
                  <div className="flex flex-col">
                    <span className="font-label-md text-sm">VODAFONE CASH</span>
                    <span className="text-xs text-on-surface-variant">Transfer using Vodafone Cash (Number: {settings.vodafone_cash_number})</span>
                  </div>
                </label>
              </div>
            </section>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-md border border-surface-variant">
                <h3 className="font-headline text-lg font-bold mb-6 border-b border-surface-variant pb-4">Order Summary</h3>
                
                <div className="space-y-4 mb-8">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-lg bg-cover bg-center bg-surface-container"
                          style={{ backgroundImage: `url('${item.image_url}')` }}
                        />
                        <div>
                          <p className="font-label-md text-sm font-semibold">{item.name} x{item.quantity}</p>
                          <p className="text-xs text-on-surface-variant line-clamp-1">{item.description}</p>
                        </div>
                      </div>
                      <span className="font-label-md text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-6 border-t border-surface-variant">
                  <div className="flex justify-between text-on-surface-variant text-sm">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {mode === 'delivery' && (
                    <div className="flex justify-between text-on-surface-variant text-sm">
                      <span>Delivery Fee</span>
                      <span>${settings.delivery_fee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-on-surface-variant text-sm">
                    <span>Estimated Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 text-primary font-bold">
                    <span className="font-headline text-base">Grand Total</span>
                    <span className="font-headline text-lg">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Complete checkout CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary-container text-white py-4 rounded-xl font-headline text-lg shadow-lg hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </form>
      </main>
    </AppShell>
  );
}
