import * as PackingQueries from '../database/queries/packing';
import * as KitQueries from '../database/queries/kits';
import { Order } from '../types/database.types';

export interface ProductStatus {
    name: string;
    totalQty: number; // Qty in order (e.g., 2 x Royal Oud)
    packedQty: number; // How many fully packed (e.g., 1/2)
    isComplete: boolean;
    productId: number;
    // We add kit info here to avoid re-fetching
    kit?: any[];
}

export interface OrderWithProgress extends Order {
    products: ProductStatus[];
    percentComplete: number;
    nextProductIndex: number;
}

export const calculateOrderProgress = async (order: Order): Promise<OrderWithProgress> => {
    // 1. Get Items
    const items = JSON.parse(order.items_json || '[]');

    // 2. Get Packed Records (The "Pool")
    const records = await PackingQueries.getPackingRecordsByOrderId(order.id);
    const packedPool = new Map<number, number>(); // ComponentID -> Qty Used
    records.forEach((r: any) => {
        packedPool.set(r.component_id, (packedPool.get(r.component_id) || 0) + r.quantity_used);
    });

    const productStatuses: ProductStatus[] = [];

    // 3. Iterate Items (Greedy allocation)
    for (const item of items) {
        const kit = await KitQueries.getKitByProductId(item.product_id);
        let packedCount = 0;

        // Determine how many of this item (e.g., Qty 3) are fully packed
        for (let i = 0; i < item.quantity; i++) {
            let canPackThisInstance = true;

            if (kit.length === 0) {
                // If no kit, assume packed? or special handling?
                // For safety, let's treat no-kit items as auto-packed only if we have logic for it.
                // But generally, we assume everything has components.
                // If no components, it consumes nothing, so technically "packed".
                canPackThisInstance = true;
            } else {
                for (const comp of kit) {
                    if (comp.is_optional) continue;
                    const available = packedPool.get(comp.component_id) || 0;
                    if (available < comp.quantity_per_order) {
                        canPackThisInstance = false;
                        break;
                    }
                }
            }

            if (canPackThisInstance) {
                packedCount++;
                // Deduct from pool
                kit.forEach(comp => {
                    if (comp.is_optional) return;
                    const current = packedPool.get(comp.component_id) || 0;
                    packedPool.set(comp.component_id, current - comp.quantity_per_order);
                });
            }
        }

        productStatuses.push({
            name: item.product_name || 'Unknown Product',
            totalQty: item.quantity,
            packedQty: packedCount,
            isComplete: packedCount >= item.quantity,
            productId: item.product_id,
            kit: kit // Pass kit to save fetching again if needed
        });
    }

    // 4. Summary
    const totalItems = items.reduce((acc: number, item: any) => acc + item.quantity, 0);
    const totalPacked = productStatuses.reduce((acc, p) => acc + p.packedQty, 0);
    const percent = totalItems > 0 ? totalPacked / totalItems : 0;

    // Find first incomplete product (Flattened view logic?)
    // No, index matching the `products` array.
    const nextIdx = productStatuses.findIndex(p => !p.isComplete);

    return {
        ...order,
        products: productStatuses,
        percentComplete: percent,
        nextProductIndex: nextIdx === -1 ? 0 : nextIdx
    };
};
