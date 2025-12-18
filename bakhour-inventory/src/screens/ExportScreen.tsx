import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { ArabicText } from '../constants/ArabicText';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Ionicons } from '@expo/vector-icons';
import * as ExcelExport from '../services/excelExport';
import * as ProductQueries from '../database/queries/products';
import * as OrderQueries from '../database/queries/orders';
import * as ComponentQueries from '../database/queries/components';

export const ExportScreen = () => {
    const [loading, setLoading] = useState(false);

    const handleExportProducts = async () => {
        try {
            setLoading(true);
            const products = await ProductQueries.getAllProducts();
            const formatted = ExcelExport.formatProductsForExport(products);
            await ExcelExport.exportToExcel(formatted, 'Products_Inventory', 'Products');
        } finally {
            setLoading(false);
        }
    };

    const handleExportOrders = async () => {
        try {
            setLoading(true);
            const orders = await OrderQueries.getAllOrders();
            const formatted = ExcelExport.formatOrdersForExport(orders);
            await ExcelExport.exportToExcel(formatted, 'Orders_History', 'Orders');
        } finally {
            setLoading(false);
        }
    };

    const handleExportInventory = async () => {
        try {
            setLoading(true);
            const components = await ComponentQueries.getAllComponents();
            const formatted = ExcelExport.formatComponentsForExport(components);
            await ExcelExport.exportToExcel(formatted, 'Components_Inventory', 'Components');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.description}>
                    يمكنك تصدير البيانات إلى ملفات Excel (.xlsx) لمشاركتها أو حفظها كنسخة احتياطية.
                </Text>
            </View>

            {loading && <LoadingSpinner />}

            <Card style={styles.card}>
                <View style={styles.iconContainer}>
                    <Ionicons name="cube-outline" size={32} color={Colors.primary} />
                </View>
                <Text style={styles.cardTitle}>المنتجات</Text>
                <Text style={styles.cardDesc}>تصدير قائمة جميع المنتجات وتفاصيلها.</Text>
                <Button
                    title="تصدير المنتجات"
                    onPress={handleExportProducts}
                    disabled={loading}
                    variant="outline"
                />
            </Card>

            <Card style={styles.card}>
                <View style={styles.iconContainer}>
                    <Ionicons name="list-outline" size={32} color={Colors.primary} />
                </View>
                <Text style={styles.cardTitle}>الطلبات</Text>
                <Text style={styles.cardDesc}>تصدير سجل الطلبات وحالاتها.</Text>
                <Button
                    title="تصدير الطلبات"
                    onPress={handleExportOrders}
                    disabled={loading}
                    variant="outline"
                />
            </Card>

            <Card style={styles.card}>
                <View style={styles.iconContainer}>
                    <Ionicons name="layers-outline" size={32} color={Colors.primary} />
                </View>
                <Text style={styles.cardTitle}>المخزون (المكونات)</Text>
                <Text style={styles.cardDesc}>تصدير جرد المخزون الحالي للمكونات.</Text>
                <Button
                    title="تصدير المخزون"
                    onPress={handleExportInventory}
                    disabled={loading}
                    variant="outline"
                />
            </Card>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        padding: Layout.spacing.md,
    },
    header: {
        marginBottom: Layout.spacing.lg,
    },
    description: {
        fontSize: 16,
        color: Colors.textLight,
        textAlign: 'center',
        lineHeight: 24,
    },
    card: {
        marginBottom: Layout.spacing.lg,
        alignItems: 'center',
        padding: Layout.spacing.xl,
    },
    iconContainer: {
        marginBottom: Layout.spacing.md,
        padding: Layout.spacing.md,
        backgroundColor: Colors.background,
        borderRadius: 50,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: Layout.spacing.xs,
    },
    cardDesc: {
        fontSize: 14,
        color: Colors.textLight,
        textAlign: 'center',
        marginBottom: Layout.spacing.lg,
    },
});
