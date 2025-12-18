import { db } from './init';

export const resetDatabase = async (): Promise<void> => {
    await db.execAsync(`
        DROP TABLE IF EXISTS order_items;
        DROP TABLE IF EXISTS orders;
        DROP TABLE IF EXISTS packing_records;
        DROP TABLE IF EXISTS product_kits;
        DROP TABLE IF EXISTS products;
        DROP TABLE IF EXISTS components;
        DROP TABLE IF EXISTS samples;
        DROP TABLE IF EXISTS gift_cards;
        DROP TABLE IF EXISTS stock_adjustments;
    `);
};
