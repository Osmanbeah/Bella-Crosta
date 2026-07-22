'use client';

import React, { useEffect, useState, useRef, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AppShell from '../AppShell';
import { supabase } from '../supabase';
import { Order, Settings } from '../types';
import { CheckCircle, XCircle, ArrowRight, Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const PROOF_TIMEOUT_SECONDS = 10 * 60; // 10 minutes

function OrderConfirmedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
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

  // Timer & proof state
  const [timeLeft, setTimeLeft] = useState(PROOF_TIMEOUT_SECONDS);
  const [proofSent, setProofSent] = useState(false);
  const [orderCancelled, setOrderCancelled] = useState(false);
  const [cancelReason, setCancelReason] = useState<'timeout' | 'left_page' | null>(null);
  const [showLeaveWarning, setShowLeaveWarning] = useState(false);
  const pendingNavRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isOnlinePayment = order &&
    (order.payment_method === 'instapay' || order.payment_method === 'vodafone_cash');

  // --- Cancel order in Supabase ---
  const cancelOrder = useCallback(async (reason: 'timeout' | 'left_page') => {
    if (!orderId || orderCancelled || proofSent) return;

    setOrderCancelled(true);
    setCancelReason(reason);
    if (timerRef.current) clearInterval(timerRef.current);

    await supabase
      .from('orders')
      .update({ order_status: 'cancelled' } as any)
      .eq('id', orderId);

    // Remove from localStorage since it's cancelled
    try {
      const stored = JSON.parse(localStorage.getItem('bella_crosta_order_ids') || '[]');
      const filtered = stored.filter((id: string) => id !== orderId);
      localStorage.setItem('bella_crosta_order_ids', JSON.stringify(filtered));
    } catch { /* ignore */ }
  }, [orderId, orderCancelled, proofSent]);

  // --- Load order & settings ---
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
        if (settingsData) setSettings(settingsData);
      } catch (err) {
        console.warn('Error loading confirmation order details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [orderId]);

  // --- Start 10-minute countdown for online payments ---
  useEffect(() => {
    if (!isOnlinePayment || proofSent || orderCancelled || loading) return;

    // Check if there's a saved deadline in sessionStorage for this order
    const storageKey = `proof_deadline_${orderId}`;
    let deadline: number;
    const stored = sessionStorage.getItem(storageKey);
    if (stored) {
      deadline = parseInt(stored, 10);
    } else {
      deadline = Date.now() + PROOF_TIMEOUT_SECONDS * 1000;
      sessionStorage.setItem(storageKey, String(deadline));
    }

    const tick = () => {
      const remaining = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timerRef.current!);
        cancelOrder('timeout');
      }
    };

    tick(); // run immediately
    timerRef.current = setInterval(tick, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOnlinePayment, proofSent, orderCancelled, loading, orderId, cancelOrder]);

  // --- Intercept navigation away before proof is sent ---
  useEffect(() => {
    if (!isOnlinePayment || proofSent || orderCancelled) return;

    // Intercept browser back button / beforeunload
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isOnlinePayment, proofSent, orderCancelled]);

  // --- Mark proof as sent ---
  const handleProofSent = () => {
    setProofSent(true);
    if (timerRef.current) clearInterval(timerRef.current);
    // Mark in sessionStorage so timer doesn't restart on reload
    sessionStorage.removeItem(`proof_deadline_${orderId}`);
  };

  // --- Handle internal link clicks that try to leave the page ---
  const handleInternalNav = (e: React.MouseEvent, href: string) => {
    if (!isOnlinePayment || proofSent || orderCancelled) return;
    e.preventDefault();
    pendingNavRef.current = href;
    setShowLeaveWarning(true);
  };

  const confirmLeave = async () => {
    setShowLeaveWarning(false);
    await cancelOrder('left_page');
    if (pendingNavRef.current) {
      router.push(pendingNavRef.current);
    }
  };

  const stayOnPage = () => {
    setShowLeaveWarning(false);
    pendingNavRef.current = null;
  };

  // --- Format time ---
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const timerUrgent = timeLeft <= 60 && !proofSent && !orderCancelled;

  // --- Derived ---
  const paymentMethodLabel = order?.payment_method === 'instapay' ? 'InstaPay' : 'Vodafone Cash';
  const shortOrderId = orderId ? orderId.substring(0, 8).toUpperCase() : 'NEW';

  const waMessage = `Ciao Bella Crosta! I just placed an order. \nOrder ID: #${shortOrderId}\nTotal Amount: $${order?.total.toFixed(2)}\nPayment Method: ${paymentMethodLabel}\nHere is my proof of payment.`;
  const waLink = `https://wa.me/${settings.business_whatsapp_number}?text=${encodeURIComponent(waMessage)}`;

  if (loading) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <p className="font-body text-on-surface-variant">Loading your order details...</p>
      </div>
    );
  }

  // ===================== CANCELLED SCREEN =====================
  if (orderCancelled) {
    return (
      <main className="relative z-10 pt-8 px-4 flex flex-col items-center justify-center min-h-[calc(100vh-128px)] pb-24">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-red-500/10 rounded-full scale-150 blur-2xl" />
            <div className="bg-surface-container-lowest rounded-full p-6 shadow-md border border-red-300/40">
              <XCircle className="text-red-500 w-20 h-20" />
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="font-headline text-3xl text-on-background font-extrabold">
              Order <span className="text-red-500">Cancelled</span>
            </h2>
            <p className="font-body text-base text-on-surface-variant">
              {cancelReason === 'timeout'
                ? 'Your 10-minute payment window has expired. Your order has been automatically cancelled.'
                : 'You left the page before sending your payment proof. Your order has been cancelled.'}
            </p>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/20 shadow-sm space-y-3">
            <p className="font-label-md text-xs text-on-surface-variant uppercase tracking-widest font-bold">
              Cancelled Order
            </p>
            <p className="font-headline text-xl text-on-surface font-bold">#{shortOrderId}</p>
            <p className="font-body text-sm text-on-surface-variant">
              If you still want to order, please place a new order and send payment proof within 10 minutes.
            </p>
          </div>

          <div className="flex flex-col gap-4 pt-4">
            <Link href="/menu" className="w-full bg-primary-container text-white py-4 rounded-lg font-label-md text-sm shadow-md active:scale-95 transition-all text-center font-bold">
              Place a New Order
            </Link>
            <Link href="/" className="w-full bg-transparent border-2 border-on-surface text-on-surface py-4 rounded-lg font-label-md text-sm active:scale-95 transition-all text-center font-bold">
              Return to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ===================== PROOF SENT SUCCESS =====================
  if (proofSent) {
    return (
      <main className="relative z-10 pt-8 px-4 flex flex-col items-center justify-center min-h-[calc(100vh-128px)] pb-24">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-primary/10 rounded-full scale-150 blur-2xl" />
            <div className="bg-surface-container-lowest rounded-full p-6 shadow-md border border-outline-variant/30">
              <CheckCircle className="text-primary w-20 h-20" />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="font-headline text-3xl md:text-4xl text-on-background leading-tight font-extrabold">
              Grazie!<br /><span className="text-secondary">Proof Sent!</span>
            </h2>
            <p className="font-body text-base text-on-surface-variant max-w-sm mx-auto">
              We received your payment proof on WhatsApp. Our team will confirm your order shortly.
            </p>
          </div>

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

          <div className="flex flex-col gap-4 pt-4">
            <Link href="/orders" className="w-full bg-primary-container text-white py-4 rounded-lg font-label-md text-sm shadow-md active:scale-95 transition-all text-center font-bold">
              Track My Order
            </Link>
            <Link href="/" className="w-full bg-transparent border-2 border-on-surface text-on-surface py-4 rounded-lg font-label-md text-sm active:scale-95 transition-all text-center font-bold">
              Return to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ===================== MAIN ORDER CONFIRMED =====================
  return (
    <>
      {/* Leave Warning Overlay */}
      {showLeaveWarning && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-8 shadow-2xl text-center space-y-6">
            <div className="flex justify-center">
              <div className="bg-red-100 rounded-full p-4">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Wait! Order will be cancelled</h3>
              <p className="text-gray-600 text-sm">
                If you leave now without sending your payment proof, your order <strong>#{shortOrderId}</strong> will be <strong className="text-red-500">automatically cancelled</strong>.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={stayOnPage}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-700 transition-colors"
              >
                Stay & Send Proof
              </button>
              <button
                onClick={confirmLeave}
                className="w-full bg-red-100 text-red-600 py-3 rounded-xl font-bold text-sm hover:bg-red-200 transition-colors"
              >
                Leave & Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="relative z-10 pt-8 px-4 flex flex-col items-center justify-center min-h-[calc(100vh-128px)] pb-24">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-primary/10 rounded-full scale-150 blur-2xl" />
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

          {/* Payment Proof Section for Online Payments */}
          {isOnlinePayment && (
            <div className="space-y-4">
              {/* Countdown Timer */}
              <div className={`rounded-xl border-2 p-4 flex items-center gap-4 transition-all ${
                timerUrgent
                  ? 'border-red-400 bg-red-50 animate-pulse'
                  : 'border-amber-400 bg-amber-50'
              }`}>
                <Clock className={`w-8 h-8 flex-shrink-0 ${timerUrgent ? 'text-red-500' : 'text-amber-600'}`} />
                <div className="text-left">
                  <p className={`font-bold text-lg tabular-nums ${timerUrgent ? 'text-red-600' : 'text-amber-700'}`}>
                    {formatTime(timeLeft)}
                  </p>
                  <p className={`text-xs font-medium ${timerUrgent ? 'text-red-500' : 'text-amber-600'}`}>
                    {timerUrgent
                      ? 'Less than 1 minute left! Send proof now!'
                      : 'Time left to send payment proof'}
                  </p>
                </div>
              </div>

              {/* Payment Action Card */}
              <div className="bg-tertiary-container/10 p-6 rounded-xl border-2 border-dashed border-tertiary text-center space-y-4">
                <h4 className="font-headline text-lg font-bold text-tertiary-container">Payment Action Required</h4>
                <p className="font-body text-sm text-on-surface-variant">
                  You selected <strong>{paymentMethodLabel}</strong>. Please transfer the amount of{' '}
                  <strong>${order?.total.toFixed(2)}</strong> to the number:{' '}
                  <strong>{order?.payment_method === 'instapay' ? settings.instapay_number : settings.vodafone_cash_number}</strong>
                </p>
                <p className="font-body text-xs text-red-500 font-semibold">
                  ⚠️ You must send the proof within {formatTime(timeLeft)} or your order will be cancelled.
                </p>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleProofSent}
                  className="inline-flex items-center gap-2 bg-tertiary-container text-on-tertiary-container font-label-md py-3 px-6 rounded-lg hover:opacity-90 active:scale-95 transition-all w-full justify-center"
                >
                  <span>Send Payment Proof on WhatsApp</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 pt-4">
            <Link
              href="/menu"
              onClick={(e) => handleInternalNav(e, '/menu')}
              className="w-full bg-primary-container text-white py-4 rounded-lg font-label-md text-sm shadow-md active:scale-95 transition-all text-center font-bold"
            >
              Browse Menu
            </Link>
            <Link
              href="/"
              onClick={(e) => handleInternalNav(e, '/')}
              className="w-full bg-transparent border-2 border-on-surface text-on-surface py-4 rounded-lg font-label-md text-sm active:scale-95 transition-all text-center font-bold"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </main>
    </>
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
