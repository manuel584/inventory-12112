import { db } from '../init';
import { Component } from '../../types/database.types';

export const getAllComponents = async (): Promise<Component[]> => {
    const result = await db.getAllAsync(
        'SELECT * FROM components ORDER BY name_ar ASC'
    );
    return result as Component[];
};

export const getComponentsByType = async (type: string): Promise<Component[]> => {
    const result = await db.getAllAsync(
        'SELECT * FROM components WHERE type = ? ORDER BY name_ar ASC',
        [type]
    );
    return result as Component[];
};

export const updateComponentStock = async (id: number, newStock: number): Promise<void> => {
    await db.runAsync(
        'UPDATE components SET current_stock = ? WHERE id = ?',
        [newStock, id]
    );
};

export const updateComponent = async (id: number, data: Partial<Component>): Promise<void> => {
    const { name_ar, type, current_stock, min_stock_alert } = data;
    await db.runAsync(
        `UPDATE components 
     SET name_ar = COALESCE(?, name_ar), 
         type = COALESCE(?, type), 
         current_stock = COALESCE(?, current_stock), 
         min_stock_alert = COALESCE(?, min_stock_alert) 
     WHERE id = ?`,
        [name_ar ?? null, type ?? null, current_stock ?? null, min_stock_alert ?? null, id]
    );
};

export const getLowStockComponents = async (): Promise<Component[]> => {
    const result = await db.getAllAsync(
        'SELECT * FROM components WHERE current_stock <= min_stock_alert'
    );
    return result as Component[];
};

export const createComponent = async (component: Omit<Component, 'id'>): Promise<number> => {
    const result = await db.runAsync(
        'INSERT INTO components (name_ar, type, current_stock, min_stock_alert) VALUES (?, ?, ?, ?)',
        [component.name_ar, component.type, component.current_stock, component.min_stock_alert]
    );
    return result.lastInsertRowId;
};

export const getComponentById = async (id: number): Promise<Component | null> => {
    return (await db.getFirstAsync('SELECT * FROM components WHERE id = ?', [id])) as Component | null;
};

export const deleteComponent = async (id: number): Promise<void> => {
    await db.runAsync('DELETE FROM components WHERE id = ?', [id]);
};

