import { Component, Product, ProductKit } from '../types/database.types';

export const convertWeightToGrams = (weight: number, unit: 'kg' | 'وقية' | 'g'): number => {
    switch (unit) {
        case 'kg':
            return weight * 1000;
        case 'وقية':
            return weight * 28.2; // Standard Ounce for Oud
        case 'g':
        default:
            return weight;
    }
};

export interface ComponentRequirement {
    componentId: number;
    requiredQuantity: number;
    availableQuantity: number;
    componentName: string;
}

export const calculateRequiredComponents = (
    product: Product,
    kit: ProductKit[],
    allComponents: Component[],
    orderQuantity: number
): ComponentRequirement[] => {
    return kit.map(kitItem => {
        const component = allComponents.find(c => c.id === kitItem.componentId);
        if (!component) {
            // Should not happen if DB integrity is maintained
            return {
                componentId: kitItem.componentId,
                requiredQuantity: kitItem.quantity_per_order * orderQuantity,
                availableQuantity: 0,
                componentName: 'Unknown Component',
            };
        }
        return {
            componentId: component.id,
            requiredQuantity: kitItem.quantity_per_order * orderQuantity,
            availableQuantity: component.current_stock,
            componentName: component.name_ar,
        };
    });
};

export interface StockCheck {
    isAvailable: boolean;
    missingComponents: ComponentRequirement[];
}

export const checkStockAvailability = (requirements: ComponentRequirement[]): StockCheck => {
    const missing = requirements.filter(req => req.availableQuantity < req.requiredQuantity);
    return {
        isAvailable: missing.length === 0,
        missingComponents: missing,
    };
};

export const calculateTotalWeight = (items: { weight_grams: number; quantity: number }[]): number => {
    return items.reduce((sum, item) => sum + item.weight_grams * item.quantity, 0);
};
