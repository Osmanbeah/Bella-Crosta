'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AppShell from '../AppShell';
import { supabase } from '../supabase';
import { Order, Settings } from '../types';
import { CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function OrderConfirmedContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const [order, setOrder] = useState<Order | null>(null);
  const [settings, setSettings] = useState<Settings>({
    business_whatsapp_number: '201000000000',
    instapay_number: '201000000000',
    vodafone_cash_number: '201000000000',
    delivery_fee: 2.50,
    tax_rate: 0.08,
    store_hours: 'Daily: 11:00 AM - 10:00 PM',
    store_address: '123 Dough Street, Pizza Plaza, FL 33101'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!orderId || orderId === 'default') {
        setLoading(false);
        return;
      }
      try {
        const { data: orderData, error: orderErr } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (orderErr) throw orderErr;
        setOrder(orderData);

        const { data: settingsData, error: settingsErr } = await supabase
          .from('settings')
          .select('*')
          .eq('id', 1)
          .single();

        if (settingsErr) throw settingsErr;
        if (settingsData) {
          setSettings(settingsData);
        }
      } catch (err) {
        console.warn('Error loading confirmation order details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <p className="font-body text-on-surface-variant">Loading your order details...</p>
      </div>
    );
  }

  // Pre-filled WhatsApp link logic
  const isOnlinePayment = order && (order.payment_method === 'instapay' || order.payment_method === 'vodafone_cash');
  const paymentMethodLabel = order?.payment_method === 'instapay' ? 'InstaPay' : 'Vodafone Cash';
  const shortOrderId = orderId ? orderId.substring(0, 8).toUpperCase() : 'NEW';
  
  const waMessage = `Ciao Bella Crosta! I just placed an order. 
Order ID: #${shortOrderId}
Total Amount: $${order?.total.toFixed(2)}
Payment Method: ${paymentMethodLabel}
Here is my proof of payment.`;

  const waLink = `https://wa.me/${settings.business_whatsapp_number}?text=${encodeURIComponent(waMessage)}`;

  return (
    <main className="relative z-10 pt-8 px-4 flex flex-col items-center justify-center min-h-[calc(100vh-128px)] pb-24">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-primary/10 rounded-full scale-150 blur-2xl"></div>
          <div className="bg-surface-container-lowest rounded-full p-6 shadow-md border border-outline-variant/30">
            <CheckCircle className="text-primary w-20 h-20" />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-headline text-3xl md:text-4xl text-on-background leading-tight font-extrabold">
            Grazie!<br /><span className="text-secondary">Your order is placed.</span>
          </h2>
          <p className="font-body text-base text-on-surface-variant max-w-sm mx-auto">
            We've received your order and our pizzaiolos are preparing the dough.
          </p>
        </div>

        {/* Order Info Card */}
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/20 shadow-sm space-y-6">
          <div className="grid grid-cols-2 gap-4 divide-x divide-outline-variant/30">
            <div className="px-2">
              <p className="font-label-md text-xs text-on-surface-variant uppercase tracking-widest mb-1 font-bold">Order #</p>
              <p className="font-headline text-lg text-on-surface font-bold">#{shortOrderId}</p>
            </div>
            <div className="px-2">
              <p className="font-label-md text-xs text-on-surface-variant uppercase tracking-widest mb-1 font-bold">ETA</p>
              <p className="font-headline text-lg text-primary font-bold">35-45 mins</p>
            </div>
          </div>
          <div className="pt-6 border-t border-outline-variant/30 text-center">
            <p className="font-body text-sm text-on-surface">
              Delivery to <strong>{order?.address || 'Your Address'}</strong>
            </p>
          </div>
        </div>

        {/* Custom Whatsapp Prompt Override for Online Payments */}
        {isOnlinePayment && (
          <div className="bg-tertiary-container/10 p-6 rounded-xl border-2 border-dashed border-tertiary text-center space-y-4">
            <h4 className="font-headline text-lg font-bold text-tertiary-container">Payment Action Required</h4>
            <p className="font-body text-sm text-on-surface-variant">
              You selected <strong>{paymentMethodLabel}</strong>. Please transfer the amount of <strong>${order?.total.toFixed(2)}</strong> to 
              the number: <strong>{order?.payment_method === 'instapay' ? settings.instapay_number : settings.vodafone_cash_number}</strong>
            </p>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-tertiary-container text-on-tertiary-container font-label-md py-3 px-6 rounded-lg hover:opacity-90 active:scale-95 transition-all w-full justify-center"
            >
              <span>Send Payment Proof on WhatsApp</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 pt-4">
          <Link href="/menu" className="w-full bg-primary-container text-white py-4 rounded-lg font-label-md text-sm shadow-md active:scale-95 transition-all text-center font-bold">
            Browse Menu
          </Link>
          <Link href="/" className="w-full bg-transparent border-2 border-on-surface text-on-surface py-4 rounded-lg font-label-md text-sm active:scale-95 transition-all text-center font-bold">
            Return to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function OrderConfirmedPage() {
  return (
    <AppShell>
      <Suspense fallback={
        <div className="max-w-md mx-auto text-center py-20 px-4">
          <p className="font-body text-on-surface-variant">Loading your order details...</p>
        </div>
      }>
        <OrderConfirmedContent />
      </Suspense>
    </AppShell>
  );
}
