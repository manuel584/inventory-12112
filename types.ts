export type OrderStatus = 'pending' | 'packing' | 'completed';

export interface Component {
  id: string;
  name_ar: string;
  name_en: string;
  type: 'box' | 'sticker' | 'card' | 'wrapping' | 'other';
  current_stock: number;
  min_stock_alert: number;
  cost_per_unit: number;
}

export interface Product {
  id: string;
  sku: string;
  name_ar: string;
  weight_grams: number;
  kit: { componentId: string; quantity: number }[];
}

export interface OrderItem {
  productId: string;
  quantity: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  order_date: string; // ISO date
  status: OrderStatus;
  items: OrderItem[];
}

export interface PackingRecord {
  id: string;
  order_id: string;
  packed_at: string;
  packed_by: string; // Placeholder for user system
}