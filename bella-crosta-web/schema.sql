'use strict';

import { createClient } from '@supabase/supabase-js';

const sql = `
-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  available BOOLEAN NOT NULL DEFAULT true
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  delivery_fee NUMERIC NOT NULL,
  tax NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  delivery_or_pickup TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  order_status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY DEFAULT 1,
  business_whatsapp_number TEXT NOT NULL DEFAULT '201000000000',
  instapay_number TEXT NOT NULL DEFAULT '201000000000',
  vodafone_cash_number TEXT NOT NULL DEFAULT '201000000000',
  delivery_fee NUMERIC NOT NULL DEFAULT 2.50,
  tax_rate NUMERIC NOT NULL DEFAULT 0.08,
  store_hours TEXT NOT NULL DEFAULT 'Daily: 11:00 AM - 10:00 PM',
  store_address TEXT NOT NULL DEFAULT '123 Dough Street, Pizza Plaza, FL 33101',
  CONSTRAINT one_row CHECK (id = 1)
);

-- Populate default settings if not exists
INSERT INTO settings (id, business_whatsapp_number, instapay_number, vodafone_cash_number, delivery_fee, tax_rate, store_hours, store_address)
VALUES (1, '201000000000', '201000000000', '201000000000', 2.50, 0.08, 'Daily: 11:00 AM - 10:00 PM', '123 Dough Street, Pizza Plaza, FL 33101')
ON CONFLICT (id) DO NOTHING;

-- Populate default menu items
INSERT INTO menu_items (name, description, price, category, image_url, tags, available) VALUES
('Margherita', 'San Marzano tomatoes, fresh mozzarella, basil, and EVOO.', 14.00, 'Classic', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAgQBWV8SCUjO7XmPVdY4ep88hVC1t9AdD0_bf91qnEV6egjsCBWUhwktP7yhvEykHL-K52PCIsuuT-OY0X_j7kHQmXgEMG-KA1jxbVhwzX4LJW7BO77s4dbcmMOO-EfX2t_d1Gv3qanbVzV0ddMQkINXaj_kAIbC8M3L6bIaq9dF2H2-5I568ouyZLExD6GcXbJUSgt9A-e19KMIxs0um_rfVCNd_Kxlmxb5K3Ql-wKz5ur95MdrWwg1pENrn4v-psEKxtdaQ-2Es', '{"Chef Choice"}', true),
('Diavola', 'Spicy salami, San Marzano tomatoes, chili flakes, and black olives.', 16.50, 'Specialty', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVOzLqI9EmdakC1Yp4MWG-x78jzt6mnO4QqAci7ccqFy2idwP-xnKTvvDMatobcSmvD_jbUk_vkdqoSTcEIeZ5lywoDN_c02ySphnzOK0gXVxn4V-Wr4Su7A3c_JfoInDbnoR09EoE_lrmDRs24bHnUpUrsx2VY80G8W3bw-spdGbR9ZqzZFkOfZZVV3krKrMsCl9G2ItfEjiLscE1kM2dPH1pbgSR4Sjvyg3yZpfkDUgkVwRnbdp8x9ar0uwb47RxAtf02Pxv7tc', '{"Spicy"}', true),
('Ortolana', 'Roasted zucchini, peppers, eggplant, and smoked provolone.', 15.00, 'Vegetarian', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtDWGaJ0Z8qx4hhXoTWvsht_VJTQDaN3Usb_rB9jPWOClhaUWMqj-T-d6R8kFChY10ok7pUCv5T7y5YFdjrRIUMo18118XBBKwPuYL5mC4pRXLGzckFuGPT-xu1wabMr-8rVPvbL6GrDNp50omLInQMzqOH82qT1AP7uLV952ZkNh9F0GQdf66tebWxrowoSYuJ3YxnGvQxwaP7NRkpv5m4XeiyeUvTB7cskC5R91yLXnGkyn0Bh9D04bwHQmdHM84BIer1CRsVQg', '{"Vegan Option"}', true)
ON CONFLICT DO NOTHING;
`;

console.log("SQL Schema definition to execute in Supabase dashboard or supabase-mcp-server:");
console.log(sql);
