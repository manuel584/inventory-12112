import { db } from '../init';
import type { Component } from '../../types/database.types';

/**
 * Decrease component stock
 */
export const decrementComponentStock = async (componentId: number, quantity: number): Promise<void> => {
    await db.runAsync(
        'UPDATE components SET current_stock = current_stock - ? WHERE id = ?',
        [quantity, componentId]
    );
};

/**
 * Record component usage in packing
 */
export const recordComponentUsage = async (record: {
    order_id: number;
    component_id: number;
    quantity_used: number;
    packed_by?: string;
}): Promise<void> => {
    await db.runAsync(
        `INSERT INTO packing_records (order_id, component_id, quantity_used, packed_by)
         VALUES (?, ?, ?, ?)`,
        [record.order_id, record.component_id, record.quantity_used, record.packed_by || 'System']
    );
};

/**
 * Get packing records for an order
 */
export const getPackingRecordsByOrderId = async (orderId: number) => {
    return await db.getAllAsync(
        `SELECT pr.*, c.name_ar as component_name
         FROM packing_records pr
         LEFT JOIN components c ON pr.component_id = c.id
         WHERE pr.order_id = ?`,
        [orderId]
    );
};

/**
 * Adjust component stock manually
 */
export const adjustComponentStock = async (
    componentId: number,
    quantityChange: number,
    reason: string
): Promise<void> => {
    // Update stock
    await db.runAsync(
        'UPDATE components SET current_stock = current_stock + ? WHERE id = ?',
        [quantityChange, componentId]
    );

    // Record adjustment
    await db.runAsync(
        `INSERT INTO stock_adjustments (component_id, quantity_change, reason)
         VALUES (?, ?, ?)`,
        [componentId, quantityChange, reason]
    );
};

/**
 * Get current stock for component
 */
export const getComponentStock = async (componentId: number): Promise<number> => {
    const result = await db.getFirstAsync<{ current_stock: number }>(
        'SELECT current_stock FROM components WHERE id = ?',
        [componentId]
    );
    return result?.current_stock || 0;
};
