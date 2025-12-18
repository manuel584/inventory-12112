import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { db } from '../database/init';
import { Alert } from 'react-native';

interface BackupData {
    version: string;
    timestamp: string;
    products: any[];
    components: any[];
    product_kits: any[];
    orders: any[];
    samples: any[];
    gift_cards: any[];
    stock_adjustments: any[];
    packing_records: any[];
    order_templates: any[];
}

/**
 * Export entire database to JSON file
 */
export const exportDatabase = async (): Promise<void> => {
    try {
        // Fetch all data from all tables
        const products = await db.getAllAsync('SELECT * FROM products');
        const components = await db.getAllAsync('SELECT * FROM components');
        const product_kits = await db.getAllAsync('SELECT * FROM product_kits');
        const orders = await db.getAllAsync('SELECT * FROM orders');
        const samples = await db.getAllAsync('SELECT * FROM samples');
        const gift_cards = await db.getAllAsync('SELECT * FROM gift_cards');
        const stock_adjustments = await db.getAllAsync('SELECT * FROM stock_adjustments');
        const packing_records = await db.getAllAsync('SELECT * FROM packing_records');
        const order_templates = await db.getAllAsync('SELECT * FROM order_templates');

        const backup: BackupData = {
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            products,
            components,
            product_kits,
            orders,
            samples,
            gift_cards,
            stock_adjustments,
            packing_records,
            order_templates,
        };

        const jsonString = JSON.stringify(backup, null, 2);
        const filename = `bakhour_backup_${new Date().toISOString().split('T')[0]}.json`;
        const fileUri = FileSystem.documentDirectory + filename;

        await FileSystem.writeAsStringAsync(fileUri, jsonString, {
            encoding: FileSystem.EncodingType.UTF8,
        });

        // Share the file
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
            await Sharing.shareAsync(fileUri, {
                mimeType: 'application/json',
                dialogTitle: 'حفظ النسخة الاحتياطية',
            });
        } else {
            Alert.alert('نجح', `تم حفظ النسخة الاحتياطية في: ${fileUri}`);
        }

        return;
    } catch (error) {
        console.error('Backup failed:', error);
        throw error;
    }
};

/**
 * Import database from JSON file
 */
export const importDatabase = async (): Promise<void> => {
    try {
        // Pick a file
        const result = await DocumentPicker.getDocumentAsync({
            type: 'application/json',
            copyToCacheDirectory: true,
        });

        if (result.canceled) {
            return;
        }

        const fileUri = result.assets[0].uri;

        // Read the file
        const fileContent = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.UTF8,
        });

        const backup: BackupData = JSON.parse(fileContent);

        // Validate the backup structure
        if (!backup.version || !backup.timestamp) {
            throw new Error('Invalid backup file format');
        }

        // Clear existing data
        await db.execAsync(`
            DELETE FROM packing_records;
            DELETE FROM stock_adjustments;
            DELETE FROM product_kits;
            DELETE FROM orders;
            DELETE FROM samples;
            DELETE FROM gift_cards;
            DELETE FROM products;
            DELETE FROM components;
            DELETE FROM order_templates;
        `);

        // Restore components first (dependencies)
        for (const component of backup.components || []) {
            await db.runAsync(
                'INSERT INTO components (id, sku, name_ar, type, unit, current_stock, min_stock_alert, cost_per_unit) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [component.id, component.sku, component.name_ar, component.type, component.unit, component.current_stock, component.min_stock_alert, component.cost_per_unit]
            );
        }

        // Restore products
        for (const product of backup.products || []) {
            await db.runAsync(
                'INSERT INTO products (id, sku, name_ar, name_en, weight_grams, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [product.id, product.sku, product.name_ar, product.name_en, product.weight_grams, product.is_active, product.created_at]
            );
        }

        // Restore product kits
        for (const kit of backup.product_kits || []) {
            await db.runAsync(
                'INSERT INTO product_kits (id, product_id, component_id, quantity_per_order, is_optional) VALUES (?, ?, ?, ?, ?)',
                [kit.id, kit.product_id, kit.component_id, kit.quantity_per_order, kit.is_optional]
            );
        }

        // Restore orders
        for (const order of backup.orders || []) {
            await db.runAsync(
                'INSERT INTO orders (id, order_number, customer_name, order_date, status, items_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [order.id, order.order_number, order.customer_name, order.order_date, order.status, order.items_json, order.created_at]
            );
        }

        // Restore samples
        for (const sample of backup.samples || []) {
            await db.runAsync(
                'INSERT INTO samples (id, name_ar, weight_grams, is_active) VALUES (?, ?, ?, ?)',
                [sample.id, sample.name_ar, sample.weight_grams, sample.is_active]
            );
        }

        // Restore gift cards
        for (const card of backup.gift_cards || []) {
            await db.runAsync(
                'INSERT INTO gift_cards (id, sku, name_ar, is_sold_separately, is_bundled) VALUES (?, ?, ?, ?, ?)',
                [card.id, card.sku, card.name_ar, card.is_sold_separately, card.is_bundled]
            );
        }

        // Restore stock adjustments
        for (const adjustment of backup.stock_adjustments || []) {
            await db.runAsync(
                'INSERT INTO stock_adjustments (id, component_id, quantity_change, reason, adjusted_at) VALUES (?, ?, ?, ?, ?)',
                [adjustment.id, adjustment.component_id, adjustment.quantity_change, adjustment.reason, adjustment.adjusted_at]
            );
        }

        // Restore packing records
        for (const record of backup.packing_records || []) {
            await db.runAsync(
                'INSERT INTO packing_records (id, order_id, component_id, quantity_used, packed_by, packed_at) VALUES (?, ?, ?, ?, ?, ?)',
                [record.id, record.order_id, record.component_id, record.quantity_used, record.packed_by, record.packed_at]
            );
        }

        // Restore order templates
        for (const template of backup.order_templates || []) {
            await db.runAsync(
                'INSERT INTO order_templates (id, name, products_json, created_at) VALUES (?, ?, ?, ?)',
                [template.id, template.name, template.products_json, template.created_at]
            );
        }

        Alert.alert('نجح', 'تم استعادة النسخة الاحتياطية بنجاح');
    } catch (error) {
        console.error('Import failed:', error);
        throw error;
    }
};

/**
 * Get the size of the database
 */
export const getDatabaseSize = async (): Promise<string> => {
    try {
        const products = await db.getFirstAsync('SELECT COUNT(*) as count FROM products') as { count: number };
        const components = await db.getFirstAsync('SELECT COUNT(*) as count FROM components') as { count: number };
        const orders = await db.getFirstAsync('SELECT COUNT(*) as count FROM orders') as { count: number };

        return `${products?.count || 0} منتجات، ${components?.count || 0} مكونات، ${orders?.count || 0} طلبات`;
    } catch (error) {
        return 'غير معروف';
    }
};
