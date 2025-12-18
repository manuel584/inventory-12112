import { db } from '../init';
import { Order } from '../../types/database.types';

export const getAllOrders = async (status?: string): Promise<Order[]> => {
    if (status) {
        return await db.getAllAsync<Order>('SELECT * FROM orders WHERE status = ? ORDER BY order_date DESC', [status]);
    }
    return await db.getAllAsync<Order>('SELECT * FROM orders ORDER BY order_date DESC');
};

export const getOrderById = async (id: number): Promise<Order | null> => {
    return await db.getFirstAsync<Order>('SELECT * FROM orders WHERE id = ?', [id]);
};

export const createOrder = async (order: Omit<Order, 'id' | 'created_at'>): Promise<number> => {
    const result = await db.runAsync(
        'INSERT INTO orders (order_number, customer_name, order_date, status, items_json) VALUES (?, ?, ?, ?, ?)',
        [order.order_number, order.customer_name || null, order.order_date, order.status, order.items_json]
    );
    return result.lastInsertRowId;
};

export const updateOrderStatus = async (id: number, status: string): Promise<void> => {
    await db.runAsync('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
};

export const getOrdersRequiringPacking = async (): Promise<Order[]> => {
    return await db.getAllAsync<Order>("SELECT * FROM orders WHERE status = 'pending' ORDER BY order_date ASC");
};

export const updateOrder = async (id: number, data: Partial<Order>): Promise<void> => {
    const fields = [];
    const values = [];

    if (data.order_number !== undefined) {
        fields.push('order_number = ?');
        values.push(data.order_number);
    }
    if (data.customer_name !== undefined) {
        fields.push('customer_name = ?');
        values.push(data.customer_name);
    }
    if (data.status !== undefined) {
        fields.push('status = ?');
        values.push(data.status);
    }
    if (data.items_json !== undefined) {
        fields.push('items_json = ?');
        values.push(data.items_json);
    }

    if (fields.length > 0) {
        values.push(id);
        await db.runAsync(`UPDATE orders SET ${fields.join(', ')} WHERE id = ?`, values);
    }
};
