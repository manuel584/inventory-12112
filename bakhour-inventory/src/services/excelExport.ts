import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import XLSX from 'xlsx';
import { Alert } from 'react-native';
import { ArabicText } from '../constants/ArabicText';

export const exportToExcel = async <T>(data: T[], fileName: string, sheetName: string) => {
    try {
        if (!data || data.length === 0) {
            Alert.alert(ArabicText.common.error, 'لا توجد بيانات للتصدير');
            return;
        }

        // 1. Create workbook and worksheet
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, sheetName);

        // 2. Write to base64 string
        const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

        // 3. Save to file system
        const uri = FileSystem.documentDirectory + `${fileName}.xlsx`;
        await FileSystem.writeAsStringAsync(uri, wbout, {
            encoding: FileSystem.EncodingType.Base64,
        });

        // 4. Share the file
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri, {
                mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                dialogTitle: `تصدير ${fileName}`,
                UTI: 'com.microsoft.excel.xlsx',
            });
        } else {
            Alert.alert(ArabicText.common.error, 'المشاركة غير مدعومة على هذا الجهاز');
        }
    } catch (error) {
        console.error('Export error:', error);
        Alert.alert(ArabicText.common.error, 'فشل تصدير الملف');
    }
};

import { Product, Order, Component } from '../types/database.types';

// Helper to format data for export (flatten objects, translate headers if needed)
export const formatProductsForExport = (products: Product[]) => {
    return products.map(p => ({
        'ID': p.id,
        'الاسم': p.name_ar,
        'SKU': p.sku,
        'الوزن (جرام)': p.weight_grams,
        'نشط': p.is_active ? 'نعم' : 'لا',
    }));
};

export const formatOrdersForExport = (orders: Order[]) => {
    return orders.map(o => ({
        'رقم الطلب': o.order_number || o.id,
        'العميل': o.customer_name,
        'التاريخ': new Date(o.order_date).toLocaleDateString('ar-SA'),
        'الحالة': o.status === 'completed' ? 'مكتمل' : (o.status === 'pending' ? 'قيد الانتظار' : o.status),
        'ملاحظات': '', // Order type doesn't have notes yet, but keeping for future
    }));
};

export const formatComponentsForExport = (components: Component[]) => {
    return components.map(c => ({
        'ID': c.id,
        'الاسم': c.name_ar,
        'النوع': c.type,
        'المخزون الحالي': c.current_stock,
        'حد التنبيه': c.min_stock_alert,
    }));
};
