import { db } from './init';

export const seedDatabase = async () => {
    try {
        // Check if components exist
        const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM components');
        if (result && result.count > 0) {
            console.log('Database already seeded');
            return;
        }

        console.log('Seeding database...');

        const components = [
            { name_ar: 'علبة منتج', type: 'box', unit: 'piece', current_stock: 100, min_stock_alert: 20 },
            { name_ar: 'كرتون شحن', type: 'box', unit: 'piece', current_stock: 50, min_stock_alert: 10 },
            { name_ar: 'كرت باركود', type: 'card', unit: 'piece', current_stock: 500, min_stock_alert: 50 },
            { name_ar: 'كرت طريقة الاستخدام', type: 'card', unit: 'piece', current_stock: 500, min_stock_alert: 50 },
            { name_ar: 'كرت كوبون', type: 'card', unit: 'piece', current_stock: 200, min_stock_alert: 20 },
            { name_ar: 'ملصق اسم المنتج', type: 'sticker', unit: 'piece', current_stock: 200, min_stock_alert: 30 },
            { name_ar: 'ملصق الكوبون', type: 'sticker', unit: 'piece', current_stock: 200, min_stock_alert: 20 },
            { name_ar: 'ملصق دائري براندنق', type: 'sticker', unit: 'piece', current_stock: 1000, min_stock_alert: 100 },
            { name_ar: 'ورقة خبز', type: 'wrapping', unit: 'sheet', current_stock: 300, min_stock_alert: 50 },
            { name_ar: 'كيس بلاستك صغير', type: 'wrapping', unit: 'piece', current_stock: 500, min_stock_alert: 50 },
            { name_ar: 'ورق طباعة البوليصة', type: 'other', unit: 'sheet', current_stock: 100, min_stock_alert: 10 },
            { name_ar: 'لاصق كبير للختم', type: 'other', unit: 'roll', current_stock: 10, min_stock_alert: 2 },
        ];

        for (const comp of components) {
            await db.runAsync(
                'INSERT INTO components (name_ar, type, unit, current_stock, min_stock_alert) VALUES (?, ?, ?, ?, ?)',
                [comp.name_ar, comp.type, comp.unit, comp.current_stock, comp.min_stock_alert]
            );
        }

        console.log('Seeding completed');
    } catch (error) {
        console.error('Error seeding database:', error);
    }
};
