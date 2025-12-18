export interface Product {
    id: number;
    sku: string;
    name_ar: string;
    name_en?: string;
    weight_grams: number;
    is_active: number; // 0 or 1
    created_at: string;
}

export interface Component {
    id: number;
    sku?: string;
    name_ar: string;
    type: string; // 'box' | 'card' | 'sticker' | 'wrapping' | 'other'
    unit: string;
    current_stock: number;
    min_stock_alert: number;
    cost_per_unit?: number;
}

export interface ProductKit {
    id: number;
    product_id: number;
    component_id: number;
    quantity_per_order: number;
    is_optional: number; // 0 or 1
}

export interface Sample {
    id: number;
    name_ar: string;
    weight_grams: number;
    is_active: number;
}

export interface Order {
    id: number;
    order_number: string;
    customer_name?: string;
    order_date: string;
    status: 'pending' | 'packing' | 'completed';
    items_json: string; // JSON string of OrderItem[]
    created_at: string;
}

export interface OrderItem {
    sku: string;
    quantity: number;
    product_name: string;
}

export interface PackingRecord {
    id: number;
    order_id: number;
    component_id: number;
    quantity_used: number;
    packed_by?: string;
    packed_at: string;
}

export interface StockAdjustment {
    id: number;
    component_id: number;
    quantity_change: number;
    reason: string;
    adjusted_at: string;
}

export interface GiftCard {
    id: number;
    sku: string;
    name_ar: string;
    is_sold_separately: number;
    is_bundled: number;
}
