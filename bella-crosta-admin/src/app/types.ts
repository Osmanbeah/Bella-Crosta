export interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  quantity: number;
  category?: string;
  tags?: string[];
}

export interface Order {
  id?: string;
  customer_name: string;
  phone: string;
  address: string;
  items: CartItem[];
  subtotal: number;
  delivery_fee: number;
  tax: number;
  total: number;
  delivery_or_pickup: 'delivery' | 'pickup';
  payment_method: 'cod' | 'instapay' | 'vodafone_cash';
  order_status: 'cod' | 'pending_payment' | 'paid' | 'preparing' | 'out_for_delivery' | 'delivered';
  created_at?: string;
}

export interface Settings {
  business_whatsapp_number: string;
  instapay_number: string;
  vodafone_cash_number: string;
  delivery_fee: number;
  tax_rate: number;
  store_hours: string;
  store_address: string;
}
