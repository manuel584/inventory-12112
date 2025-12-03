import { Component, Order, Product, PackingRecord } from '../types';

const STORAGE_KEYS = {
  COMPONENTS: 'bakhour_components',
  PRODUCTS: 'bakhour_products',
  ORDERS: 'bakhour_orders',
  PACKING_LOGS: 'bakhour_packing_logs',
};

// Seed Data based on PDF Checklist Phase 1
const DEFAULT_COMPONENTS: Component[] = [
  { id: 'c1', name_ar: 'علبة منتج', name_en: 'Product Box', type: 'box', current_stock: 150, min_stock_alert: 20, cost_per_unit: 2.5 },
  { id: 'c2', name_ar: 'كرتون شحن', name_en: 'Shipping Box', type: 'box', current_stock: 45, min_stock_alert: 50, cost_per_unit: 1.0 },
  { id: 'c3', name_ar: 'كرت باركود', name_en: 'Barcode Card', type: 'card', current_stock: 500, min_stock_alert: 100, cost_per_unit: 0.1 },
  { id: 'c4', name_ar: 'كرت طريقة الاستخدام', name_en: 'How-to Card', type: 'card', current_stock: 480, min_stock_alert: 100, cost_per_unit: 0.1 },
  { id: 'c5', name_ar: 'كرت كوبون', name_en: 'Coupon Card', type: 'card', current_stock: 200, min_stock_alert: 50, cost_per_unit: 0.1 },
  { id: 'c6', name_ar: 'ملصق اسم المنتج', name_en: 'Product Name Sticker', type: 'sticker', current_stock: 120, min_stock_alert: 30, cost_per_unit: 0.2 },
  { id: 'c7', name_ar: 'ملصق دائري براندنق', name_en: 'Brand Sticker', type: 'sticker', current_stock: 600, min_stock_alert: 100, cost_per_unit: 0.15 },
  { id: 'c8', name_ar: 'ورقة خبز', name_en: 'Wrapping Paper', type: 'wrapping', current_stock: 300, min_stock_alert: 50, cost_per_unit: 0.05 },
  { id: 'c9', name_ar: 'كيس بلاستيك صغير', name_en: 'Small Plastic Bag', type: 'other', current_stock: 1000, min_stock_alert: 200, cost_per_unit: 0.02 },
  { id: 'c10', name_ar: 'لاصق كبير للختم', name_en: 'Sealing Tape', type: 'other', current_stock: 20, min_stock_alert: 5, cost_per_unit: 5.0 },
  { id: 'c11', name_ar: 'ورق طباعة البوليصة', name_en: 'Label Paper', type: 'other', current_stock: 100, min_stock_alert: 20, cost_per_unit: 0.05 },
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'p1',
    sku: 'MALT-BK-TGRRR-40',
    name_ar: 'عود تايقر 40 قرام',
    weight_grams: 40,
    // Each product consumes 1 box, 1 name sticker, 1 brand sticker, 1 wrapping paper
    kit: [
      { componentId: 'c1', quantity: 1 },
      { componentId: 'c6', quantity: 1 },
      { componentId: 'c7', quantity: 1 },
      { componentId: 'c8', quantity: 1 },
    ]
  },
  {
    id: 'p2',
    sku: 'MALT-BK-DQQ-40',
    name_ar: 'عود دقة 40 قرام',
    weight_grams: 40,
    kit: [
      { componentId: 'c1', quantity: 1 },
      { componentId: 'c6', quantity: 1 },
      { componentId: 'c7', quantity: 1 },
      { componentId: 'c8', quantity: 1 },
    ]
  }
];

const DEFAULT_ORDERS: Order[] = [
  {
    id: 'o1',
    order_number: 'ORD-001',
    customer_name: 'أحمد محمد',
    order_date: new Date().toISOString(),
    status: 'pending',
    items: [{ productId: 'p1', quantity: 2 }]
  },
  {
    id: 'o2',
    order_number: 'ORD-002',
    customer_name: 'سارة خالد',
    order_date: new Date().toISOString(),
    status: 'pending',
    items: [{ productId: 'p2', quantity: 1 }]
  }
];

// Helper to load or seed
const load = <T,>(key: string, defaultData: T): T => {
  const stored = localStorage.getItem(key);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(key, JSON.stringify(defaultData));
  return defaultData;
};

const save = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const db = {
  getComponents: () => load<Component[]>(STORAGE_KEYS.COMPONENTS, DEFAULT_COMPONENTS),
  saveComponents: (data: Component[]) => save(STORAGE_KEYS.COMPONENTS, data),
  
  getProducts: () => load<Product[]>(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS),
  saveProducts: (data: Product[]) => save(STORAGE_KEYS.PRODUCTS, data),

  getOrders: () => load<Order[]>(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS),
  saveOrders: (data: Order[]) => save(STORAGE_KEYS.ORDERS, data),

  getPackingLogs: () => load<PackingRecord[]>(STORAGE_KEYS.PACKING_LOGS, []),
  savePackingLog: (log: PackingRecord) => {
    const logs = load<PackingRecord[]>(STORAGE_KEYS.PACKING_LOGS, []);
    save(STORAGE_KEYS.PACKING_LOGS, [...logs, log]);
  },
  
  // Logic to decrement stock based on order
  processOrderPacking: (order: Order, components: Component[], products: Product[]) => {
    const newComponents = [...components];
    
    order.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return;

      // Deduct per product kit * quantity in order
      product.kit.forEach(kitItem => {
        const compIndex = newComponents.findIndex(c => c.id === kitItem.componentId);
        if (compIndex > -1) {
          // Additional items like shipping box or invoice paper are per ORDER, 
          // but for simplicity here we assume kit logic handles product-level consumption.
          // Order-level consumption (1 shipping box per order) should be added to logic,
          // but strictly following the kit definition for now.
          newComponents[compIndex].current_stock -= (kitItem.quantity * item.quantity);
        }
      });
    });

    // Hardcoded: 1 Shipping Box per order, 1 Invoice paper per order
    const shipBoxIdx = newComponents.findIndex(c => c.name_en === 'Shipping Box');
    if (shipBoxIdx > -1) newComponents[shipBoxIdx].current_stock -= 1;
    
    const labelIdx = newComponents.findIndex(c => c.name_en === 'Label Paper');
    if (labelIdx > -1) newComponents[labelIdx].current_stock -= 1;

    return newComponents;
  }
};