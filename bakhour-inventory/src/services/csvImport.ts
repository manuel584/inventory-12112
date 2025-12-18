import * as FileSystem from 'expo-file-system';
import Papa from 'papaparse';
import { Order, OrderItem } from '../types/database.types';
import * as OrderQueries from '../database/queries/orders';
import * as ProductQueries from '../database/queries/products';
import { validateCSVStructure } from '../utils/validation';

export interface ImportResult {
    successCount: number;
    errorCount: number;
    errors: string[];
}

export const parseOrderCSV = async (fileUri: string): Promise<{ orders: Partial<Order>[]; errors: string[] }> => {
    try {
        const fileContent = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.UTF8 });

        return new Promise((resolve) => {
            Papa.parse(fileContent, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const rows = results.data as any[];
                    const errors: string[] = [];

                    if (!validateCSVStructure(rows)) {
                        resolve({ orders: [], errors: ['Invalid CSV structure. Required columns: Order Number, Product SKU, Quantity'] });
                        return;
                    }

                    // Group by Order Number
                    const ordersMap = new Map<string, Partial<Order>>();

                    rows.forEach((row, index) => {
                        // Flexible column matching
                        const keys = Object.keys(row);
                        const findKey = (search: string) => keys.find(k => k.toLowerCase().includes(search.toLowerCase()));

                        const orderNumKey = findKey('order number');
                        const skuKey = findKey('product sku');
                        const qtyKey = findKey('quantity');
                        const customerKey = findKey('customer name');
                        const productNameKey = findKey('product name');

                        const orderNum = orderNumKey ? row[orderNumKey] : undefined;
                        const sku = skuKey ? row[skuKey] : undefined;
                        const qtyStr = qtyKey ? row[qtyKey] : undefined;
                        const qty = qtyStr ? parseInt(qtyStr, 10) : NaN;
                        const customer = customerKey ? row[customerKey] : 'Unknown';

                        if (!orderNum || !sku || isNaN(qty)) {
                            errors.push(`Row ${index + 2}: Missing required data (Order: ${orderNum}, SKU: ${sku}, Qty: ${qtyStr})`);
                            return;
                        }

                        if (!ordersMap.has(orderNum)) {
                            ordersMap.set(orderNum, {
                                order_number: orderNum,
                                customer_name: customer,
                                order_date: new Date().toISOString(),
                                status: 'pending',
                                items_json: '[]',
                            });
                        }

                        const order = ordersMap.get(orderNum)!;
                        const currentItems = order.items_json ? JSON.parse(order.items_json) : [];
                        currentItems.push({
                            sku,
                            quantity: qty,
                            product_name: productNameKey ? row[productNameKey] : 'Unknown Product'
                        });
                        order.items_json = JSON.stringify(currentItems);
                    });

                    resolve({ orders: Array.from(ordersMap.values()), errors });
                },
                error: (error: any) => {
                    resolve({ orders: [], errors: [`CSV Parse Error: ${error.message}`] });
                }
            });
        });
    } catch (error) {
        return { orders: [], errors: [`File Read Error: ${(error as Error).message}`] };
    }
};

export const importOrdersToDatabase = async (orders: Partial<Order>[]): Promise<ImportResult> => {
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const order of orders) {
        try {
            // Check if order exists
            // Ideally we should have a check, but unique constraint on order_number will throw error
            if (!order.order_number) continue;
            await OrderQueries.createOrder(order as Order);
            successCount++;

            // Check for missing products
            const items: OrderItem[] = JSON.parse(order.items_json || '[]');
            for (const item of items) {
                const product = await ProductQueries.getProductBySKU(item.sku);
                if (!product) {
                    // Create placeholder product if missing
                    await ProductQueries.createProduct({
                        sku: item.sku,
                        name_ar: item.product_name || `New Product (${item.sku})`,
                        weight_grams: 0,
                        is_active: 1
                    });
                    errors.push(`Warning: Created new product for SKU ${item.sku}`);
                }
            }

        } catch (error) {
            errorCount++;
            errors.push(`Failed to import order ${order.order_number}: ${(error as Error).message}`);
        }
    }

    return { successCount, errorCount, errors };
};
