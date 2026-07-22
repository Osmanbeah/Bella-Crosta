'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '../AppShell';
import { cartManager } from '../cartStore';
import { CartItem } from '../types';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { supabase } from '../supabase';

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [instructions, setInstructions] = useState('');
  const [taxRate, setTaxRate] = useState(0.08); // 8% Default
  const [deliveryFee, setDeliveryFee] = useState(2.50); // $2.50 Default

  useEffect(() => {
    const updateCart = () => {
      setItems(cartManager.getItems());
      setInstructions(cartManager.getInstructions());
    };
    updateCart();
    return cartManager.subscribe(updateCart);
  }, []);

  // Fetch settings dynamically from settings table
  useEffect(() => {
    async function loadSettings() {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('tax_rate, delivery_fee')
          .eq('id', 1)
          .single();

        if (error) throw error;
        if (data) {
          setTaxRate(Number(data.tax_rate));
          setDeliveryFee(Number(data.delivery_fee));
        }
      } catch (err) {
        console.warn('Could not fetch settings config from database (using fallback defaults):', err);
      }
    }
    loadSettings();
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax + deliveryFee;

  const handleUpdateQuantity = (id: string, delta: number) => {
    cartManager.updateQuantity(id, delta);
  };

  const handleRemove = (id: string) => {
    cartManager.removeItem(id);
  };

  const handleInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInstructions(text);
    cartManager.setInstructions(text);
  };

  if (items.length === 0) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto text-center py-20 px-4">
          <h2 className="font-headline text-3xl font-bold mb-4">Your Cart is Empty</h2>
          <p className="font-body text-on-surface-variant mb-8">Add some delicious wood-fired pizzas to get started!</p>
          <Link href="/menu" className="inline-block bg-primary text-white font-label-md px-8 py-3 rounded-full hover:opacity-90 active:scale-95 transition-all">
            Browse Menu
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <main className="max-w-4xl mx-auto pt-8 pb-32 px-4 w-full">
        <h2 className="font-headline text-3xl font-bold mb-8">Your Cart</h2>

        <div className="space-y-6">
          {items.map((item) => (
            <div key={item.id} className="bg-surface-container-lowest p-4 rounded-xl flex items-center gap-4 shadow-sm border border-outline-variant/30">
              <div className="w-24 h-24 flex-shrink-0">
                <img className="w-full h-full object-cover rounded-full" src={item.image_url} alt={item.name} />
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-headline text-lg text-on-surface font-bold">{item.name}</h3>
                    <p className="text-on-surface-variant text-xs">{item.description}</p>
                  </div>
                  <p className="font-headline text-lg text-primary font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center gap-4 bg-surface-container-high rounded-full px-3 py-1">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, -1)}
                      className="text-primary hover:bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-on-surface">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, 1)}
                      className="text-primary hover:bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Special Instructions */}
          <div className="mt-8">
            <label className="block font-bold text-sm text-on-surface-variant mb-2 ml-1">Special Instructions</label>
            <textarea
              className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-4 focus:ring-2 focus:ring-primary focus:border-primary transition-all font-body placeholder:text-on-surface-variant/50 outline-none"
              placeholder="Any allergies or crust preferences?"
              rows={3}
              value={instructions}
              onChange={handleInstructionsChange}
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="mt-10 bg-surface-container-low rounded-2xl p-6 space-y-4">
          <div className="flex justify-between text-sm text-on-surface-variant">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-on-surface-variant">
            <span>Estimated Tax ({(taxRate * 100).toFixed(0)}%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-on-surface-variant">
            <span>Delivery Fee</span>
            <span>${deliveryFee.toFixed(2)}</span>
          </div>
          <div className="pt-4 border-t border-outline-variant flex justify-between items-center">
            <span className="font-headline text-lg text-on-surface font-bold">Total</span>
            <span className="font-headline text-xl text-primary font-bold">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Proceed Button */}
        <div className="mt-8">
          <Link
            href="/checkout"
            className="w-full bg-primary-container text-white font-headline text-lg py-4 rounded-xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </main>
    </AppShell>
  );
}
