'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '../AppShell';
import { supabase } from '../supabase';
import { Order } from '../types';
import Link from 'next/link';

export default function OrdersStatusPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (err) {
        console.warn('Could not fetch active orders from database:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
    
    // Subscribe to real-time changes
    const channel = supabase
      .channel('realtime-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        loadOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <AppShell>
      <main className="max-w-4xl mx-auto pt-8 pb-24 px-4 w-full">
        <h2 className="font-headline text-3xl font-bold mb-8">Active Orders Status</h2>

        {loading ? (
          <p className="font-body text-on-surface-variant text-center">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="font-body text-on-surface-variant mb-6">No orders placed yet.</p>
            <Link href="/menu" className="bg-primary text-white py-3 px-8 rounded-full font-label-md">
              Order Pizza
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((o) => {
              const shortId = o.id ? o.id.substring(0, 8).toUpperCase() : 'NEW';
              return (
                <div key={o.id} className="bg-white p-6 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                  <div>
                    <h4 className="font-headline text-lg font-bold">Order #{shortId}</h4>
                    <p className="text-sm text-on-surface-variant">Method: {o.delivery_or_pickup.toUpperCase()} | {o.payment_method.toUpperCase()}</p>
                    <p className="text-xs text-outline">{o.address}</p>
                  </div>
                  <div className="flex flex-col items-start md:items-end gap-2">
                    <span className="font-headline text-base text-primary font-bold">${Number(o.total).toFixed(2)}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      o.order_status === 'cod' ? 'bg-secondary-container text-on-secondary-container' : 
                      o.order_status === 'pending_payment' ? 'bg-error-container text-on-error-container' :
                      'bg-tertiary-container text-on-tertiary-container'
                    }`}>
                      {o.order_status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </AppShell>
  );
}
