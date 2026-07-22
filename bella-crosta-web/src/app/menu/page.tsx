'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '../AppShell';
import { cartManager } from '../cartStore';
import { supabase } from '../supabase';
import { CartItem } from '../types';
import { ShoppingBag } from 'lucide-react';

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [items, setItems] = useState<Omit<CartItem, 'quantity'>[]>([]);
  const [loading, setLoading] = useState(true);

  const [categoriesList, setCategoriesList] = useState<string[]>(['All']);

  // Fetch real items and categories from Supabase if connection details exist
  useEffect(() => {
    async function fetchMenu() {
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .eq('available', true);

        if (error) throw error;
        if (data && data.length > 0) {
          setItems(data.map(d => ({
            id: d.id,
            name: d.name,
            description: d.description,
            price: Number(d.price),
            image_url: d.image_url,
            category: d.category,
            tags: d.tags || []
          })));
        }
      } catch (err) {
        console.warn('Could not load real data from database (using fallback defaults):', err);
      } finally {
        setLoading(false);
      }
    }

    async function fetchCategories() {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('name')
          .order('name', { ascending: true });
        
        if (error) throw error;
        if (data && data.length > 0) {
          setCategoriesList(['All', ...data.map(c => c.name)]);
        }
      } catch (err) {
        console.warn('Could not load categories list from database:', err);
      }
    }

    fetchMenu();
    fetchCategories();
  }, []);

  const filteredItems = activeCategory === 'All'
    ? items
    : items.filter(item => item.category?.toLowerCase() === activeCategory.toLowerCase());

  const handleAddToCart = (pizza: Omit<CartItem, 'quantity'>) => {
    cartManager.addItem(pizza);
  };

  return (
    <AppShell>
      <main className="mt-8 px-4 md:px-10 max-w-7xl mx-auto">
        {/* Category Filter Chips */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 py-4 mb-6 sticky top-16 bg-surface/80 backdrop-blur-md z-40">
          {categoriesList.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-2 rounded-full font-label-md text-sm whitespace-nowrap active:scale-95 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary-container text-white'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Section Title */}
        <div className="mb-8">
          <h2 className="font-headline text-2xl font-bold text-on-surface-variant mb-2">Our Artisanal Pizzas</h2>
          <div className="w-12 h-1 bg-primary rounded-full" />
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filteredItems.map((pizza) => (
            <div key={pizza.id} className="pizza-card bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant hover:shadow-lg transition-all flex flex-col items-center text-center">
              <div className="relative w-48 h-48 mb-6 overflow-hidden rounded-full border-4 border-surface shadow-md">
                <img className="w-full h-full object-cover" src={pizza.image_url} alt={pizza.name} />
              </div>
              <div className="flex-grow">
                <h3 className="font-headline text-lg font-bold text-on-surface mb-2">{pizza.name}</h3>
                <p className="font-body text-sm text-on-surface-variant px-2 mb-4 leading-relaxed">
                  {pizza.description}
                </p>
              </div>
              <div className="w-full flex items-center justify-between mt-4">
                <div className="flex flex-col items-start">
                  {pizza.tags && pizza.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 mb-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant text-[10px] uppercase font-bold tracking-wider">
                      {tag}
                    </span>
                  ))}
                  <span className="font-headline text-lg font-bold text-primary">${pizza.price.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => handleAddToCart(pizza)}
                  className="bg-primary-container text-white font-label-md text-xs py-3 px-6 rounded-lg active:scale-95 transition-transform cursor-pointer hover:brightness-110"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}

          {/* Upcoming Card */}
          <div className="border-2 border-dashed border-outline-variant rounded-xl p-6 flex flex-col items-center justify-center text-center opacity-60">
            <ShoppingBag className="w-10 h-10 text-primary mb-2" />
            <p className="font-headline text-lg font-bold">New Seasonal Pizza</p>
            <p className="font-body text-sm">Coming next week</p>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
