import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { Card } from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../database/init';

interface AnalyticsData {
    // Order Stats
    totalOrders: number;
    pendingOrders: number;
    packingOrders: number;
    completedOrders: number;

    // Inventory Stats
    totalComponents: number;
    lowStockCount: number;
    outOfStockCount: number;

    // Product Stats
    totalProducts: number;
    activeProducts: number;

    // Top Products
    topProducts: Array<{ name: string; orderCount: number }>;
}

export const AnalyticsScreen = () => {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            setLoading(true);

            // Get order stats
            const totalOrders = await db.getFirstAsync('SELECT COUNT(*) as count FROM orders') as { count: number };
            const pendingOrders = await db.getFirstAsync('SELECT COUNT(*) as count FROM orders WHERE status = "pending"') as { count: number };
            const packingOrders = await db.getFirstAsync('SELECT COUNT(*) as count FROM orders WHERE status = "packing"') as { count: number };
            const completedOrders = await db.getFirstAsync('SELECT COUNT(*) as count FROM orders WHERE status = "completed"') as { count: number };

            // Get inventory stats
            const totalComponents = await db.getFirstAsync('SELECT COUNT(*) as count FROM components') as { count: number };
            const lowStockCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM components WHERE current_stock <= min_stock_alert AND current_stock > 0') as { count: number };
            const outOfStockCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM components WHERE current_stock = 0') as { count: number };

            // Get product stats
            const totalProducts = await db.getFirstAsync('SELECT COUNT(*) as count FROM products') as { count: number };
            const activeProducts = await db.getFirstAsync('SELECT COUNT(*) as count FROM products WHERE is_active = 1') as { count: number };

            // Get top products (most ordered)
            // This is a simplified version - in production you'd parse items_json and aggregate
            const topProducts: Array<{ name: string; orderCount: number }> = [];

            setData({
                totalOrders: totalOrders?.count || 0,
                pendingOrders: pendingOrders?.count || 0,
                packingOrders: packingOrders?.count || 0,
                completedOrders: completedOrders?.count || 0,
                totalComponents: totalComponents?.count || 0,
                lowStockCount: lowStockCount?.count || 0,
                outOfStockCount: outOfStockCount?.count || 0,
                totalProducts: totalProducts?.count || 0,
                activeProducts: activeProducts?.count || 0,
                topProducts,
            });

        } catch (error) {
            console.error('Failed to load analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !data) return <LoadingSpinner fullScreen />;

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={loading} onRefresh={loadAnalytics} />
            }
        >
            <Text style={styles.pageTitle}>لوحة الإحصائيات</Text>

            {/* Orders Analytics */}
            <Text style={styles.sectionTitle}>إحصائيات الطلبات</Text>

            <View style={styles.statsRow}>
                <Card style={styles.statCard}>
                    <View style={[styles.iconContainer, { backgroundColor: Colors.primary + '20' }]}>
                        <Ionicons name="list" size={32} color={Colors.primary} />
                    </View>
                    <Text style={styles.statValue}>{data.totalOrders}</Text>
                    <Text style={styles.statLabel}>إجمالي الطلبات</Text>
                </Card>

                <Card style={styles.statCard}>
                    <View style={[styles.iconContainer, { backgroundColor: '#FFA500' + '20' }]}>
                        <Ionicons name="time" size={32} color="#FFA500" />
                    </View>
                    <Text style={styles.statValue}>{data.pendingOrders}</Text>
                    <Text style={styles.statLabel}>قيد الانتظار</Text>
                </Card>
            </View>

            <View style={styles.statsRow}>
                <Card style={styles.statCard}>
                    <View style={[styles.iconContainer, { backgroundColor: '#4169E1' + '20' }]}>
                        <Ionicons name="cube" size={32} color="#4169E1" />
                    </View>
                    <Text style={styles.statValue}>{data.packingOrders}</Text>
                    <Text style={styles.statLabel}>جاري التعبئة</Text>
                </Card>

                <Card style={styles.statCard}>
                    <View style={[styles.iconContainer, { backgroundColor: Colors.success + '20' }]}>
                        <Ionicons name="checkmark-circle" size={32} color={Colors.success} />
                    </View>
                    <Text style={styles.statValue}>{data.completedOrders}</Text>
                    <Text style={styles.statLabel}>مكتملة</Text>
                </Card>
            </View>

            {/* Inventory Analytics */}
            <Text style={styles.sectionTitle}>إحصائيات المخزون</Text>

            <View style={styles.statsRow}>
                <Card style={styles.statCard}>
                    <View style={[styles.iconContainer, { backgroundColor: Colors.primary + '20' }]}>
                        <Ionicons name="layers" size={32} color={Colors.primary} />
                    </View>
                    <Text style={styles.statValue}>{data.totalComponents}</Text>
                    <Text style={styles.statLabel}>إجمالي المكونات</Text>
                </Card>

                <Card style={styles.statCard}>
                    <View style={[styles.iconContainer, { backgroundColor: Colors.warning + '20' }]}>
                        <Ionicons name="warning" size={32} color={Colors.warning} />
                    </View>
                    <Text style={styles.statValue}>{data.lowStockCount}</Text>
                    <Text style={styles.statLabel}>مخزون منخفض</Text>
                </Card>
            </View>

            <View style={styles.statsRow}>
                <Card style={styles.statCard}>
                    <View style={[styles.iconContainer, { backgroundColor: Colors.danger + '20' }]}>
                        <Ionicons name="alert-circle" size={32} color={Colors.danger} />
                    </View>
                    <Text style={styles.statValue}>{data.outOfStockCount}</Text>
                    <Text style={styles.statLabel}>نفذ من المخزون</Text>
                </Card>

                <Card style={styles.statCard}>
                    <View style={[styles.iconContainer, { backgroundColor: Colors.success + '20' }]}>
                        <Ionicons name="checkmark" size={32} color={Colors.success} />
                    </View>
                    <Text style={styles.statValue}>
                        {data.totalComponents - data.lowStockCount - data.outOfStockCount}
                    </Text>
                    <Text style={styles.statLabel}>متوفر</Text>
                </Card>
            </View>

            {/* Products Analytics */}
            <Text style={styles.sectionTitle}>إحصائيات المنتجات</Text>

            <View style={styles.statsRow}>
                <Card style={styles.statCard}>
                    <View style={[styles.iconContainer, { backgroundColor: Colors.primary + '20' }]}>
                        <Ionicons name="cube" size={32} color={Colors.primary} />
                    </View>
                    <Text style={styles.statValue}>{data.totalProducts}</Text>
                    <Text style={styles.statLabel}>إجمالي المنتجات</Text>
                </Card>

                <Card style={styles.statCard}>
                    <View style={[styles.iconContainer, { backgroundColor: Colors.success + '20' }]}>
                        <Ionicons name="checkmark-circle" size={32} color={Colors.success} />
                    </View>
                    <Text style={styles.statValue}>{data.activeProducts}</Text>
                    <Text style={styles.statLabel}>منتجات نشطة</Text>
                </Card>
            </View>

            {/* Summary Card */}
            <Card style={styles.summaryCard}>
                <Ionicons name="analytics" size={48} color={Colors.primary} />
                <Text style={styles.summaryTitle}>ملخص النظام</Text>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>معدل إتمام الطلبات:</Text>
                    <Text style={styles.summaryValue}>
                        {data.totalOrders > 0
                            ? `${((data.completedOrders / data.totalOrders) * 100).toFixed(1)}%`
                            : '0%'
                        }
                    </Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>نسبة المخزون المنخفض:</Text>
                    <Text style={styles.summaryValue}>
                        {data.totalComponents > 0
                            ? `${((data.lowStockCount / data.totalComponents) * 100).toFixed(1)}%`
                            : '0%'
                        }
                    </Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>المنتجات غير النشطة:</Text>
                    <Text style={styles.summaryValue}>
                        {data.totalProducts - data.activeProducts}
                    </Text>
                </View>
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
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: Layout.spacing.lg,
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        marginTop: Layout.spacing.lg,
        marginBottom: Layout.spacing.md,
        textAlign: 'right',
    },
    statsRow: {
        flexDirection: 'row',
        gap: Layout.spacing.md,
        marginBottom: Layout.spacing.md,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        padding: Layout.spacing.lg,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Layout.spacing.md,
    },
    statValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: Layout.spacing.xs,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.textLight,
        textAlign: 'center',
    },
    summaryCard: {
        marginTop: Layout.spacing.xl,
        marginBottom: Layout.spacing.xl,
        alignItems: 'center',
        padding: Layout.spacing.xl,
    },
    summaryTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
        marginTop: Layout.spacing.md,
        marginBottom: Layout.spacing.lg,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingVertical: Layout.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    summaryLabel: {
        fontSize: 14,
        color: Colors.textLight,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.primary,
    },
});
