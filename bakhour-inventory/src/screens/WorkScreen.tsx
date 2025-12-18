import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { Card } from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Ionicons } from '@expo/vector-icons';
import * as OrderQueries from '../database/queries/orders';
import * as PackingQueries from '../database/queries/packing';
import * as KitQueries from '../database/queries/kits';
import { Order } from '../types/database.types';

import { calculateOrderProgress, OrderWithProgress } from '../utils/orderLogic';

// ------------ Component ------------
export const WorkScreen = () => {
    const navigation = useNavigation();
    const [orders, setOrders] = useState<OrderWithProgress[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            // Only fetch active (pending/packing) orders + today's completed
            // For now, let's just fetch "Requiring Packing" from existing query
            // + maybe recently completed?
            // Let's use getOrdersRequiringPacking logic but manually here to be safe
            const pending = await OrderQueries.getOrdersRequiringPacking();

            const processed = await Promise.all(pending.map(calculateOrderProgress));
            setOrders(processed);
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const handlePack = (order: OrderWithProgress, productIndex?: number) => {
        // Navigate to PackOrder
        // We pass orderId. PackOrderScreen will need to handle which product to pack.
        // Let's pass the product index too.
        const targetIndex = productIndex !== undefined ? productIndex : order.nextProductIndex;
        // Find the actual product object to pass? No, ID is safer.
        // We need to pass which *line item* index we are working on.
        // Let's pass `targetProductIndex`.
        (navigation as any).navigate('Work', {
            screen: 'PackOrder',
            params: { id: order.id, targetIndex: targetIndex }
        });
    };

    const getDateString = () => new Date().toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' });

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
        >
            <View style={styles.header}>
                <Text style={styles.headerDate}>{getDateString()}</Text>
                <Text style={styles.headerTitle}>الطلبات اليومية</Text>
            </View>

            {/* Quick Status (Optional, maybe later) */}

            {/* Orders List */}
            {orders.length === 0 && !loading ? (
                <View style={styles.emptyState}>
                    <Ionicons name="checkmark-circle-outline" size={64} color={Colors.success} />
                    <Text style={styles.emptyText}>كل شيء جاهز! لا توجد طلبات معلقة.</Text>
                </View>
            ) : (
                orders.map(order => (
                    <Card key={order.id} style={styles.orderCard}>
                        {/* Header */}
                        <View style={styles.cardHeader}>
                            <Text style={styles.orderId}>📦 طلب #{order.order_number || order.id}</Text>
                            <Text style={styles.orderDate}>{new Date(order.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</Text>
                        </View>

                        {/* Progress Bar */}
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${order.percentComplete * 100}%` }]} />
                        </View>

                        {/* Product List */}
                        <View style={styles.productList}>
                            {order.products.map((p, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={styles.productRow}
                                    onPress={() => handlePack(order, idx)}
                                    disabled={p.isComplete}
                                >
                                    <Ionicons
                                        name={p.isComplete ? "checkbox" : "square-outline"}
                                        size={20}
                                        color={p.isComplete ? Colors.success : Colors.textLight}
                                    />
                                    <Text style={[styles.productName, p.isComplete && styles.textDone]}>
                                        {p.name} {p.totalQty > 1 ? `(${p.packedQty}/${p.totalQty})` : ''}
                                    </Text>
                                    {/* Chevron if actionable */}
                                    {!p.isComplete && <Ionicons name="chevron-back" size={16} color={Colors.textLight} />}
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* CTA */}
                        {order.percentComplete < 1 && (
                            <TouchableOpacity
                                style={styles.mainButton}
                                onPress={() => handlePack(order)}
                            >
                                <Text style={styles.buttonText}>
                                    {order.percentComplete === 0 ? 'ابدأ التغليف' : 'استئناف التغليف'}
                                </Text>
                                <Ionicons name="arrow-back" size={20} color="#FFF" />
                            </TouchableOpacity>
                        )}

                        {order.percentComplete === 1 && (
                            <View style={styles.completedBadge}>
                                <Text style={styles.completedText}>✅ مكتمل</Text>
                            </View>
                        )}
                    </Card>
                ))
            )}

            <View style={{ height: 100 }} />
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
        marginTop: Layout.spacing.lg,
        marginBottom: Layout.spacing.lg,
    },
    headerDate: {
        color: Colors.textLight,
        fontSize: 14,
        textAlign: 'right',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.primary,
        textAlign: 'right',
    },
    orderCard: {
        padding: 0,
        marginBottom: Layout.spacing.md,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: Layout.spacing.md,
        backgroundColor: '#FAFAFA',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    orderId: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    orderDate: {
        color: Colors.textLight,
        fontSize: 12,
    },
    progressBarBg: {
        height: 4,
        backgroundColor: '#EEE',
        width: '100%',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: Colors.success,
    },
    productList: {
        padding: Layout.spacing.md,
    },
    productRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    productName: {
        flex: 1,
        textAlign: 'right',
        marginRight: 12,
        fontSize: 16,
        color: Colors.text,
    },
    textDone: {
        color: Colors.textLight,
        textDecorationLine: 'line-through',
    },
    mainButton: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 14,
        margin: Layout.spacing.md,
        marginTop: 0,
        borderRadius: Layout.borderRadius.md,
    },
    buttonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
        marginRight: 8,
    },
    completedBadge: {
        backgroundColor: '#E8F5E9',
        padding: 12,
        alignItems: 'center',
    },
    completedText: {
        color: Colors.success,
        fontWeight: 'bold',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 60,
        opacity: 0.5,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 18,
        color: Colors.textLight,
    },
});
