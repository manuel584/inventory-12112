import { db } from '../init';

export interface OrderTemplate {
    id: number;
    name: string;
    products_json: string;
    created_at?: string;
}

export const getAllTemplates = async (): Promise<OrderTemplate[]> => {
    return await db.getAllAsync<OrderTemplate>('SELECT * FROM order_templates ORDER BY created_at DESC');
};

export const getTemplateById = async (id: number): Promise<OrderTemplate | null> => {
    return await db.getFirstAsync<OrderTemplate>('SELECT * FROM order_templates WHERE id = ?', [id]);
};

export const createTemplate = async (template: Omit<OrderTemplate, 'id' | 'created_at'>): Promise<number> => {
    const result = await db.runAsync(
        'INSERT INTO order_templates (name, products_json) VALUES (?, ?)',
        [template.name, template.products_json]
    );
    return result.lastInsertRowId;
};

export const updateTemplate = async (id: number, data: Partial<OrderTemplate>): Promise<void> => {
    const fields = [];
    const values = [];

    if (data.name !== undefined) {
        fields.push('name = ?');
        values.push(data.name);
    }
    if (data.products_json !== undefined) {
        fields.push('products_json = ?');
        values.push(data.products_json);
    }

    if (fields.length > 0) {
        values.push(id);
        await db.runAsync(`UPDATE order_templates SET ${fields.join(', ')} WHERE id = ?`, values);
    }
};

export const deleteTemplate = async (id: number): Promise<void> => {
    await db.runAsync('DELETE FROM order_templates WHERE id = ?', [id]);
};
