'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Pizza, Receipt, BookOpen, User, ShoppingBag } from 'lucide-react';
import { cartManager } from './cartStore';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      const items = cartManager.getItems();
      setCartCount(items.reduce((sum, item) => sum + item.quantity, 0));
    };
    updateCount();
    return cartManager.subscribe(updateCount);
  }, []);

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Menu', path: '/menu', icon: Pizza },
    { label: 'Orders', path: '/orders', icon: Receipt },
    { label: 'Story', path: '/story', icon: BookOpen },
    { label: 'Contact', path: '/contact', icon: User },
  ];

  return (
    <div className="flex flex-col min-h-screen text-on-surface bg-surface font-body">
      {/* Top App Bar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-surface shadow-sm md:px-10 border-b border-surface-container">
        <div className="flex items-center gap-4">
          <span className="font-headline text-2xl font-bold text-primary tracking-tight">Bella Crosta</span>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`font-label-md text-sm transition-all ${
                  isActive ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-6">
          <Link href="/cart" className="relative p-2 text-primary active:scale-95 transition-transform" aria-label="Open Cart">
            <ShoppingBag className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-primary text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow pt-16 pb-24 md:pb-12">
        {children}
      </main>

      {/* Bottom Navigation Bar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe bg-surface border-t border-outline-variant shadow-lg rounded-t-xl">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center rounded-xl px-4 py-1 transition-all duration-200 ${
                isActive
                  ? 'bg-primary-container text-white'
                  : 'text-on-surface-variant hover:bg-surface-variant/50'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="font-label-md text-xs">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
