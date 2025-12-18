import { db } from '../init';
import { ProductKit } from '../../types/database.types';

export const getKitByProductId = async (productId: number): Promise<ProductKit[]> => {
    return await db.getAllAsync<ProductKit>(
        `SELECT 
            product_kits.*, 
            components.name_ar as component_name
         FROM product_kits 
         LEFT JOIN components ON product_kits.component_id = components.id
         WHERE product_kits.product_id = ?`,
        [productId]
    );
};

export const createKitComponent = async (kit: Omit<ProductKit, 'id'>): Promise<number> => {
    const result = await db.runAsync(
        'INSERT INTO product_kits (product_id, component_id, quantity_per_order, is_optional) VALUES (?, ?, ?, ?)',
        [kit.product_id, kit.component_id, kit.quantity_per_order, kit.is_optional]
    );
    return result.lastInsertRowId;
};

export const updateKitComponent = async (id: number, quantity: number): Promise<void> => {
    await db.runAsync('UPDATE product_kits SET quantity_per_order = ? WHERE id = ?', [quantity, id]);
};

export const deleteKitComponent = async (id: number): Promise<void> => {
    await db.runAsync('DELETE FROM product_kits WHERE id = ?', [id]);
};

// Helper functions for ManageKit screen
export const addComponentToKit = async (productId: number, componentId: number, quantity: number = 1): Promise<number> => {
    const result = await db.runAsync(
        'INSERT INTO product_kits (product_id, component_id, quantity_per_order, is_optional) VALUES (?, ?, ?, 0)',
        [productId, componentId, quantity]
    );
    return result.lastInsertRowId;
};

export const removeComponentFromKit = async (kitId: number): Promise<void> => {
    await db.runAsync('DELETE FROM product_kits WHERE id = ?', [kitId]);
};

export const updateKitComponentQuantity = async (kitId: number, quantity: number): Promise<void> => {
    await db.runAsync('UPDATE product_kits SET quantity_per_order = ? WHERE id = ?', [quantity, kitId]);
};
