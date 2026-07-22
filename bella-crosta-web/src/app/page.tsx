'use client';

import React from 'react';
import Link from 'next/link';
import AppShell from './AppShell';
import { ArrowRight, Star } from 'lucide-react';
import { cartManager } from './cartStore';
import { supabase } from './supabase';

export const dynamic = 'force-dynamic';

export default function Home() {
  const [bestSellers, setBestSellers] = React.useState<any[]>([]);

  React.useEffect(() => {
    async function loadBestSellers() {
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .eq('available', true)
          .limit(3);
        if (error) throw error;
        if (data && data.length > 0) {
          setBestSellers(data.map(d => ({
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
        console.warn('Could not load best sellers from database:', err);
      }
    }
    loadBestSellers();
  }, []);

  const handleAddToCart = (pizza: any) => {
    cartManager.addItem({
      id: pizza.id,
      name: pizza.name,
      description: pizza.description,
      price: pizza.price,
      image_url: pizza.image_url,
      category: pizza.category,
      tags: pizza.tags
    });
  };

  return (
    <AppShell>
      {/* Hero Section */}
      <section className="relative h-[707px] w-full overflow-hidden flex items-center justify-center text-center px-4">
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCfACjXXB-bgE_9GI4XmiLBVdmHnaimP3TGjlqnj226SniVmXcUSQE7vp9uruMUD9ioqzZc30HVYABLnnsR9fsuCsohrkL2rsJTYmr2wYQVodNwBhrkzOtHPW0c6VJEfF-SsTCCVRCVhL_xxOhK9Uwq-GdQZ9mGS1tCUjKxXPQ4QlvI8wH8fQT27axuKjDv8KKy20TzmRXz9bN1SNqC9kKjAmL6vnoquaaBbGAzBTb3NZsuDrwTszJD9UZljJVwGPn2UzH4BFXswMk')`
            }}
          />
          <div className="absolute inset-0 bg-black/45" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <h1 className="font-headline text-4xl md:text-6xl text-white mb-8 font-extrabold tracking-tight leading-tight">
            Authentic Pizza, <br />Delivered to Your Door
          </h1>
          <Link href="/menu" className="inline-block bg-primary-container text-white font-label-md px-10 py-4 rounded-full shadow-lg hover:brightness-110 active:scale-95 transition-all">
            Order Now
          </Link>
        </div>
      </section>

      {/* Featured Pizzas */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col items-center mb-16 text-center">
          <h2 className="font-headline text-3xl md:text-4xl text-on-surface mb-2 font-bold">Our Best Sellers</h2>
          <div className="w-16 h-1 bg-primary rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {bestSellers.map((pizza) => (
            <div key={pizza.id} className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm border border-[#EAEAEA] hover:shadow-md transition-shadow group">
              <div className="relative w-48 h-48 mb-6 overflow-hidden rounded-full shadow-inner border-4 border-surface-container">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src={pizza.image_url}
                  alt={pizza.name}
                />
              </div>
              <h3 className="font-headline text-xl font-bold text-on-surface mb-2">{pizza.name}</h3>
              <p className="font-body text-sm text-on-surface-variant mb-4 px-4 leading-relaxed">{pizza.description}</p>
              <span className="font-headline text-xl text-primary mb-6 font-bold">${pizza.price.toFixed(2)}</span>
              <button
                onClick={() => handleAddToCart(pizza)}
                className="w-full bg-primary text-white font-label-md py-3 rounded-lg hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Brand Story */}
      <section className="linen-texture bg-surface-container-low py-24 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="rounded-2xl overflow-hidden shadow-2xl">
            <img
              className="w-full h-auto aspect-[4/3] object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxELF2_hDBkVGt7U6WD3SPCYo4BJPMvGDYxFVvna_UxYc1AkeH4eG1Wp-fg4YwumeI6ZIlJUNGhuBfTVIxoNcT9qYMW5M6e2qtjN2KmnR7la6e-QOcLA8N5Yjc0XTLYMijzqpjLNYyFRc5OfX-A8dC-mBQc95iHxxbEiZ2EDwbRJMA6e5grPzLJufrzF4mTIbLb5O5oBpEibJTdneo_dJ6QoCeflzjr2y0BYFReBSdOLXWW1lAcBY2RCm_st6RtwRQvIpJoNoCzCE"
              alt="Artisanal Baking"
            />
          </div>
          <div className="space-y-6">
            <span className="font-label-md text-sm text-tertiary uppercase tracking-widest block font-bold">Heritage</span>
            <h2 className="font-headline text-3xl font-bold text-on-surface">The Bella Crosta Story</h2>
            <p className="font-body text-base text-on-surface-variant leading-relaxed">
              Rooted in the sun-drenched hills of Tuscany, our family has been perfecting the art of the perfect 'crosta' for three generations. We believe that true pizza is a balance of chemistry and heart—using only wild-fermented dough and the freshest ingredients sourced from local artisans.
            </p>
            <Link href="/story" className="inline-flex items-center gap-2 font-label-md text-tertiary hover:opacity-70 transition-all font-bold">
              Learn more <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 overflow-hidden">
        <div className="px-4 max-w-7xl mx-auto mb-12">
          <h2 className="font-headline text-3xl font-bold text-on-surface">What Our Family Says</h2>
        </div>
        <div className="flex overflow-x-auto hide-scrollbar gap-8 px-4 pb-8 snap-x snap-mandatory max-w-7xl mx-auto">
          <div className="min-w-[300px] md:min-w-[400px] snap-center bg-white p-8 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
            <div>
              <div className="flex gap-1 text-secondary mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="font-body text-sm text-on-surface-variant italic leading-relaxed">
                "The best crust I've ever had outside of Naples. The char is perfection and the toppings are so fresh you can taste the sun."
              </p>
            </div>
            <div className="mt-8 flex items-center gap-4">
              <img
                className="w-12 h-12 rounded-full object-cover border-2 border-primary-fixed"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKkr3dGt0-IUap909RvQWFIcGSnSoNVLqBtktPo-5BSdSUQ9clROiehA6VDtGRV4FvEu99bWXlGJzdxaHjsSEw5Gez-l1088Cd8-U4bhK6aLoAVuI-IK59CHhY2WpaM1ccmcgUxNJR7mv1_4tNRgDZpjg3mUtaJ9QmYIJBzKplx3ZAdKd_s0BYMR-5AWE3y8TyZZSf5yOlo8StItVj6emr8rVYZ9Iky956s5RrMeph5QyxCXF4KaVt_Xi78ic_Mvp0E9LSPF2aVJU"
                alt="Sophia Rossi"
              />
              <div>
                <p className="font-label-md text-sm text-on-surface font-bold">Sophia Rossi</p>
                <p className="text-xs text-outline font-semibold">Verified Pizza Lover</p>
              </div>
            </div>
          </div>

          <div className="min-w-[300px] md:min-w-[400px] snap-center bg-white p-8 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
            <div>
              <div className="flex gap-1 text-secondary mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="font-body text-sm text-on-surface-variant italic leading-relaxed">
                "Ordering was seamless, and the delivery was surprisingly fast. The pizza arrived piping hot, just as if it came right out of the oven!"
              </p>
            </div>
            <div className="mt-8 flex items-center gap-4">
              <img
                className="w-12 h-12 rounded-full object-cover border-2 border-primary-fixed"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDiWUJ6f147R5U41R16r0enAa2elNPVZtHD2y_QZzXLTs8ZNOZE3tvROt4fo9AjTCi7JYA3K4lLS-hcpZuUtHT2UXM-sEsYOpTbxTEfCV3FS0MSnQhAs4n_tKjtFedneGEFJdfdCeawr2HAlcxJJKpGmGYqQpEog3uj2SCHK_j1isRoF7uF4x6RzoKC6H-PGKDWvSjgl43AsgyXpT09Ip-NHUU4TOWpT6ufljD0ZshOLuitHmRfIsxJZI4BnlUAoukeorH82HjPp4k"
                alt="Marco Belini"
              />
              <div>
                <p className="font-label-md text-sm text-on-surface font-bold">Marco Belini</p>
                <p className="text-xs text-outline font-semibold">Loyal Customer</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-inverse-surface text-inverse-on-surface pt-20 pb-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="space-y-8">
            <h3 className="font-headline text-2xl text-primary-fixed font-bold">Bella Crosta</h3>
            <div className="space-y-4">
              <p className="font-body text-sm text-surface-variant">Join the Family</p>
              <p className="font-label-md text-xs text-outline-variant">Sign up for exclusive offers and secret recipes.</p>
              <div className="flex gap-2">
                <input
                  className="bg-surface/10 border border-outline-variant/30 rounded-lg px-4 py-2 flex-grow text-white placeholder:text-outline-variant focus:ring-2 focus:ring-primary-fixed focus:border-transparent outline-none"
                  placeholder="Email Address"
                  type="email"
                />
                <button className="bg-primary text-white px-4 py-2 rounded-lg font-bold">Subscribe</button>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="font-label-md text-sm uppercase tracking-widest text-primary-fixed font-bold">Contact</h4>
            <ul className="space-y-4 font-body text-sm text-surface-variant">
              <li>123 Dough Street, Pizza Plaza, FL 33101</li>
              <li>+1 (555) CROSTA-1</li>
              <li>Daily: 11:00 AM - 10:00 PM</li>
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="font-label-md text-sm uppercase tracking-widest text-primary-fixed font-bold">Links</h4>
            <div className="flex flex-col gap-2 font-body text-sm text-surface-variant">
              <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white">Terms of Service</Link>
              <Link href="/contact" className="hover:text-white">Locations &amp; Contact</Link>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-20 pt-8 border-t border-outline-variant/10 text-center">
          <p className="font-body text-xs text-outline-variant opacity-60">© 2024 Bella Crosta Artisanal Pizza. Crafted with passion.</p>
        </div>
      </footer>
    </AppShell>
  );
}
