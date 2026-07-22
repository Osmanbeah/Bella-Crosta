'use client';

import React, { useState } from 'react';
import AppShell from '../AppShell';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import { supabase } from '../supabase';

export const dynamic = 'force-dynamic';

export default function ContactLocationsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  const [settings, setSettings] = useState({
    store_address: '123 Dough Street, Pizza Plaza, FL 33101',
    store_hours: '11:00 AM - 10:00 PM'
  });

  React.useEffect(() => {
    async function loadSettings() {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('store_address, store_hours')
          .eq('id', 1)
          .single();
        if (error) throw error;
        if (data) {
          setSettings({
            store_address: data.store_address,
            store_hours: data.store_hours
          });
        }
      } catch (err) {
        console.warn('Could not load settings database details (using defaults):', err);
      }
    }
    loadSettings();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setName('');
    setEmail('');
    setMessage('');
    setTimeout(() => setSubmitted(false), 5000);
  };

  const mapQuery = encodeURIComponent(settings.store_address);

  return (
    <AppShell>
      <main className="pb-24">
        {/* Interactive Map Section */}
        <section className="relative w-full h-[442px] min-h-[400px] bg-surface-container overflow-hidden">
          <iframe
            className="w-full h-full border-0 grayscale-[0.2] contrast-[1.1] sepia-[40%]"
            src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
            allowFullScreen={false}
            loading="lazy"
            title="Bella Crosta Flagship Location"
          />
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-surface p-6 shadow-xl rounded-xl border border-outline-variant max-w-[90%] md:max-w-md z-20">
            <h2 className="font-headline text-lg font-bold text-primary mb-2">Our Flagship Oven</h2>
            <p className="font-body text-sm text-on-surface-variant mb-4">{settings.store_address}</p>
            <a
              className="inline-flex items-center gap-2 text-secondary font-bold hover:underline text-sm"
              href={`https://maps.google.com/?q=${mapQuery}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Directions <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 md:px-10 py-16 grid grid-cols-1 md:grid-cols-12 gap-16">
          {/* Info Column */}
          <aside className="md:col-span-5 space-y-16">
            {/* Store Hours */}
            <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="font-headline text-lg font-bold text-on-surface">Store Hours</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-outline-variant pb-2">
                  <span className="font-label-md text-sm text-on-surface-variant">Daily</span>
                  <span className="font-body text-base font-bold text-on-surface">{settings.store_hours}</span>
                </div>
                <p className="font-body text-xs text-on-surface-variant italic">
                  Fresh dough prepared daily. Kitchen closes 15 minutes before store hours.
                </p>
              </div>
            </div>

            {/* Direct Contact Details */}
            <div className="space-y-8">
              <h3 className="font-headline text-xl font-bold text-on-surface">Reach Out Directly</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1 w-10 h-10 rounded-full bg-tertiary-container/20 flex items-center justify-center text-tertiary">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-label-md text-xs text-on-surface-variant">Call Us</p>
                    <a className="font-body text-base font-bold text-on-surface hover:text-primary transition-colors" href="tel:+15552767821">
                      +1 (555) CROSTA-1
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="mt-1 w-10 h-10 rounded-full bg-tertiary-container/20 flex items-center justify-center text-tertiary">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-label-md text-xs text-on-surface-variant">Email Us</p>
                    <a className="font-body text-base font-bold text-on-surface hover:text-primary transition-colors" href="mailto:ciao@bellacrosta.com">
                      ciao@bellacrosta.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Contact Form */}
          <section className="md:col-span-7">
            <div className="bg-surface-container-lowest p-8 md:p-12 rounded-xl shadow-lg border border-outline-variant/30">
              <h3 className="font-headline text-2xl font-bold text-primary mb-4">Send a Message</h3>
              <p className="font-body text-sm text-on-surface-variant mb-10">
                Whether it's feedback about your meal or a question about catering, our team is ready to listen.
              </p>
              
              {submitted && (
                <div className="bg-tertiary-container/10 text-on-tertiary-container border border-tertiary/20 p-4 rounded-lg mb-6 text-sm">
                  Grazie! Your message has been sent successfully. We will get back to you shortly.
                </div>
              )}

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-1">
                  <label className="block font-label-md text-xs text-on-surface-variant mb-2" htmlFor="name">Name</label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-sm focus:border-2 focus:border-on-surface focus:outline-none"
                    id="name"
                    placeholder="Lorenzo Dough"
                    type="text"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block font-label-md text-xs text-on-surface-variant mb-2" htmlFor="email">Email Address</label>
                  <input
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-sm focus:border-2 focus:border-on-surface focus:outline-none"
                    id="email"
                    placeholder="ciao@example.com"
                    type="email"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-label-md text-xs text-on-surface-variant mb-2" htmlFor="subject">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-sm focus:border-2 focus:border-on-surface focus:outline-none appearance-none"
                    id="subject"
                  >
                    <option>General Inquiry</option>
                    <option>Catering Request</option>
                    <option>Feedback</option>
                    <option>Join the Team</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block font-label-md text-xs text-on-surface-variant mb-2" htmlFor="message">Your Message</label>
                  <textarea
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-sm focus:border-2 focus:border-on-surface focus:outline-none resize-none"
                    id="message"
                    placeholder="Tell us everything..."
                    rows={5}
                  />
                </div>
                <div className="md:col-span-2 pt-4">
                  <button className="w-full md:w-auto bg-primary text-white font-bold px-12 py-4 rounded-lg hover:bg-primary-container transition-all active:scale-95 shadow-md cursor-pointer" type="submit">
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </main>
    </AppShell>
  );
}
