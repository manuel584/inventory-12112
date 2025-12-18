import { Product } from '../types/database.types';

interface OrderItem {
    product_id: number;
    quantity: number;
    sku: string;
    product_name: string;
}

/**
 * Calculate total weight for order items
 * @param items Order items
 * @param products All products to lookup weights
 * @returns Total weight in grams
 */
export const calculateOrderWeight = (items: OrderItem[], products: Product[]): number => {
    let totalWeight = 0;

    for (const item of items) {
        const product = products.find(p => p.id === item.product_id);
        if (product) {
            totalWeight += product.weight_grams * item.quantity;
        }
    }

    return totalWeight;
};

/**
 * Format weight for display
 * @param grams Weight in grams
 * @returns Formatted string (e.g., "1.5 كجم" or "500 جم")
 */
export const formatWeight = (grams: number): string => {
    if (grams >= 1000) {
        const kg = (grams / 1000).toFixed(1);
        return `${kg} كجم`;
    }
    return `${grams} جم`;
};
