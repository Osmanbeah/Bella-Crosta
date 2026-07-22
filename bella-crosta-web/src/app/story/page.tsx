'use client';

import React from 'react';
import AppShell from '../AppShell';

export default function StoryPage() {
  return (
    <AppShell>
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCb4WveJmpyLkMXqZUZ-2knpP-VazOdnYh8wF4H7nfqEjqjez_-MAdmEz83bLJO3skBgt7-ipcTDErJ7jVFIQJevNjpVzp-RcvlUZn_FJBywlvdOM_ZMd6v1NZ6oRJwdvKqKFLDVhZOGCJ8x2eI5_18tFdOGWi-EZ3jC28kMmEph0XWSzxexIocQG2huHIwkIaBKwZWkY30Gz__dSwdAi79-7zz6fuzVS0lg8w2JeQrri64GybzpLaIZdbjeiM1sf8FzhebpUMo6_M')`
          }}
        />
        <div className="relative z-20 text-center px-4">
          <h2 className="font-headline text-4xl md:text-5xl text-white mb-6 font-extrabold tracking-tight">The Soul of Bella Crosta</h2>
          <div className="w-24 h-1 bg-primary-container mx-auto rounded-full"></div>
        </div>
      </section>

      {/* Brand Heritage */}
      <section className="relative py-24 px-4 md:px-10 bg-surface overflow-hidden">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <span className="font-label-md text-sm text-primary tracking-widest block font-bold">EST. 1964</span>
            <h3 className="font-headline text-3xl font-bold text-on-surface">Our Roots</h3>
            <div className="space-y-6 text-on-surface-variant font-body text-base leading-relaxed">
              <p>
                Before the first flame was lit in our modern hearth, Bella Crosta lived as a whispered secret in the cobblestone alleys of a small mountain village near Naples. It was here that our family perfected the rhythm of the dough—a dance of timing, temperature, and touch.
              </p>
              <p>
                We carried that tradition across oceans, not just in recipes, but in the memory of the way a perfect crust should shatter upon the first bite. Today, we bridge the gap between ancient artistry and modern culinary precision, honoring every ingredient that touches our flour-dusted boards.
              </p>
            </div>
          </div>
          <div className="relative h-[450px] rounded-xl overflow-hidden shadow-lg rotate-2 hover:rotate-0 transition-transform duration-700">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBIvyC1_LFd6I3ufqvnKr16utQ43HL3ik1cIwDskA4RXhqxr_8mVS_vgFzFOXQ4fdJsgPIeS6feJpxPMpVdiPwLF31ocElit466hHYh7LUOOBnYrWQjkcFEjWhIV2rc0XP8t1TOGWIaBAfCDJx41gWqLl0pgMgXHkc0WxAfYGUGthOR5h0q8l-YQtD1KIomRBHBXDWsMp2QESqv5Y7JNuuOMSWtFWSTQC1-fH81S19hsox3mSSoymasCVz17Ay8p8I2dmyhwHQ8FmY')`
              }}
            />
          </div>
        </div>
      </section>

      {/* Founder's Story */}
      <section className="py-24 bg-surface-container-low px-4">
        <div className="max-w-4xl mx-auto bg-white p-8 md:p-16 rounded-xl shadow-sm border border-outline-variant flex flex-col md:flex-row gap-12 items-center">
          <div className="w-48 h-48 md:w-64 md:h-64 flex-shrink-0 rounded-full overflow-hidden border-4 border-primary-container shadow-lg">
            <img
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDo0Ub38kjS0zspqCBc0OhrpHC1PI2dlxAeHHUyn1bXp26r04xFCVYgJwiLluBekGSBS9TONejeCwiLwMVen2rOb4dlZGCS1x3UekNSdyqYyoBFl_W181Qb6UaW1fzspr9Z91FixjuZj64ZRRAN8aTPZ3wn2GHn7etrGej2vnqIkgbw-lGyUlOOIc6PJ6w_2l6v-aK8r-KgcbGxu52hKWxhFHtcHk_rxR3H2bgcSPJ3u-vraUY-m9dt6ZEDrUtnegkITcqn8teTRE4"
              alt="Giuseppe"
            />
          </div>
          <div className="flex-1 space-y-6">
            <h3 className="font-headline text-2xl font-bold text-on-surface">A Legacy in the Dough</h3>
            <blockquote className="italic font-headline text-lg text-primary leading-snug">
              "The dough is a living thing. You don't master it; you listen to it. The 'crosta' isn't just bread—it's the soul of the grain, transformed by fire and patience."
            </blockquote>
            <p className="font-label-md text-sm text-on-surface-variant font-bold">— Nonno Giuseppe, Master Pizzaiolo</p>
          </div>
        </div>
      </section>

      {/* Quality & Values */}
      <section className="py-24 px-4 md:px-10 bg-surface relative max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h3 className="font-headline text-3xl font-bold text-on-surface mb-4">The Pillars of Perfection</h3>
          <p className="font-body text-base text-on-surface-variant max-w-2xl mx-auto">
            We don't cut corners. From the soil where our tomatoes grow to the time our dough spends fermenting, every detail is intentional.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-12">
          <div className="group flex flex-col items-center text-center space-y-6">
            <div className="w-40 h-40 rounded-full overflow-hidden shadow-md ring-4 ring-white ring-offset-4 ring-offset-outline-variant group-hover:scale-105 transition-transform duration-500">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAec5tknfmChuXUzRdD6szXLdhNDQ097nGeZTcUzagXt92Ifv-OL3Edp_kPxA0O__twOY9-WRo77WYNgBcpnU0pGYVbLCYpVZmeX94i38Kex0y_3s2tC2MAw444urc_O1RfmKt2H1IAspQHGnXz7FXq6JMRkJWcrvNiPbR-Mw0wEOdDR5jVfS4e9maR46LNGPYPvwAZ3wunQMzu0I9_fRPxQpwSMIS3jDVb3u1Cpp6e33Faz0KWKGtfwFbp4I8AQSXrWQvzk_uN-VE"
                alt="Ingredients"
              />
            </div>
            <h4 className="font-headline text-xl font-bold text-on-surface">Fresh Ingredients</h4>
            <p className="font-body text-sm text-on-surface-variant leading-relaxed">
              Sun-drenched San Marzano tomatoes and locally sourced mozzarella di bufala, delivered every morning.
            </p>
          </div>

          <div className="group flex flex-col items-center text-center space-y-6">
            <div className="w-40 h-40 rounded-full overflow-hidden shadow-md ring-4 ring-white ring-offset-4 ring-offset-outline-variant group-hover:scale-105 transition-transform duration-500">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAoS4iuYsD5pdDDbjXSGB5VCh1KKZTvOeqGhQgMQwN7HGFMZ0OXhIldkfI7E5NxvgaifnfAr9_Yk9HCZtacOtnvE7oVyRLG1dTaku_TDkd5GK5V4uHY4py-cr9RAMXRJlKmrNm1pb7fePeKKE_WN-pNqZeGIZOaj4Z6oxV_VK_p5GloUV78rzbRE4Zw7tCBO35rARbbjkriC9K-dpcjhZ1dGgeGtB1crThYwLN89GITipjZwP3Tf2Val51-c775xLHcYCZd9GvlzF4"
                alt="Fermentation"
              />
            </div>
            <h4 className="font-headline text-xl font-bold text-on-surface">Wild Fermentation</h4>
            <p className="font-body text-sm text-on-surface-variant leading-relaxed">
              Our signature dough ferments for 48 hours using wild yeast strains for a light, digestible, and flavorful crust.
            </p>
          </div>

          <div className="group flex flex-col items-center text-center space-y-6">
            <div className="w-40 h-40 rounded-full overflow-hidden shadow-md ring-4 ring-white ring-offset-4 ring-offset-outline-variant group-hover:scale-105 transition-transform duration-500">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMPpVSSw2JwBId-1GLTUuK3IuSwyRRmW_DQJyCrRBoERjHe4Mv2qsODhWvt97GIJyScPlulWLfaLO09tHIP96y2PolBX7kSfrrdkAFR8Bsa_jClb-2AyRvLdiZuqywGIG7EVnj6XkoOpNm07Yc7JbtWftObB91yjCYOMs31HxpsIaFGlnA9sIAo9GEj2FFVgKmK1UuyPf1RU_VqOpeu23cr-fZD7n8sDGlZHw4ZcwjpDCMIQArzYnMh4uQAbA9v4lEPWLigEt0chI"
                alt="Community"
              />
            </div>
            <h4 className="font-headline text-xl font-bold text-on-surface">Community First</h4>
            <p className="font-body text-sm text-on-surface-variant leading-relaxed">
              We believe the best memories are made over shared crusts. Our pizzeria is a home for your family and ours.
            </p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
