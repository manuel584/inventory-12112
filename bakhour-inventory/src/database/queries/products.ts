import { db } from '../init';
import { Product } from '../../types/database.types';

export const getAllProducts = async (): Promise<Product[]> => {
    return (await db.getAllAsync('SELECT * FROM products WHERE is_active = 1 ORDER BY name_ar ASC')) as Product[];
};

export const getProductBySKU = async (sku: string): Promise<Product | null> => {
    return (await db.getFirstAsync('SELECT * FROM products WHERE sku = ?', [sku])) as Product | null;
};

export const getProductById = async (id: number): Promise<Product | null> => {
    return (await db.getFirstAsync('SELECT * FROM products WHERE id = ?', [id])) as Product | null;
};

export const createProduct = async (product: Omit<Product, 'id' | 'created_at'>): Promise<number> => {
    const result = await db.runAsync(
        'INSERT INTO products (sku, name_ar, name_en, weight_grams, is_active) VALUES (?, ?, ?, ?, ?)',
        [product.sku, product.name_ar, product.name_en || null, product.weight_grams, product.is_active]
    );
    return result.lastInsertRowId;
};

export const updateProduct = async (id: number, product: Partial<Product>): Promise<void> => {
    const fields = Object.keys(product).map(key => `${key} = ?`).join(', ');
    const values = Object.values(product);
    await db.runAsync(`UPDATE products SET ${fields} WHERE id = ?`, [...values, id]);
};

export const deleteProduct = async (id: number): Promise<void> => {
    await db.runAsync('UPDATE products SET is_active = 0 WHERE id = ?', [id]);
};
