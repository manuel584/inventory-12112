import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { ArabicText } from '../constants/ArabicText';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import * as OrderQueries from '../database/queries/orders';
import { Order } from '../types/database.types';
import { formatDate } from '../utils/formatting';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const OrdersTableScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await OrderQueries.getAllOrders();
            setOrders(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const getProductsCount = (itemsJson: string) => {
        try {
            const items = JSON.parse(itemsJson || '[]');
            return items.length;
        } catch {
            return 0;
        }
    };

    const TableHeader = () => (
        <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.numberCell]}>الرقم</Text>
            <Text style={[styles.headerCell, styles.customerCell]}>العميل</Text>
            <Text style={[styles.headerCell, styles.dateCell]}>التاريخ</Text>
            <Text style={[styles.headerCell, styles.statusCell]}>الحالة</Text>
            <Text style={[styles.headerCell, styles.productsCell]}>المنتجات</Text>
        </View>
    );

    const renderItem = ({ item }: { item: Order }) => (
        <TouchableOpacity
            style={styles.tableRow}
            onPress={() => navigation.navigate('OrderDetail', { id: item.id })}
        >
            <Text style={[styles.cell, styles.numberCell]} numberOfLines={1}>
                {item.order_number}
            </Text>
            <Text style={[styles.cell, styles.customerCell]} numberOfLines={1}>
                {item.customer_name || 'غير محدد'}
            </Text>
            <Text style={[styles.cell, styles.dateCell]}>
                {new Date(item.order_date).toLocaleDateString('ar-SA', {
                    month: 'short',
                    day: 'numeric'
                })}
            </Text>
            <View style={[styles.cell, styles.statusCell]}>
                <Badge
                    label={item.status === 'completed' ? 'مكتمل' : 'معلق'}
                    variant={item.status === 'completed' ? 'success' : 'warning'}
                />
            </View>
            <Text style={[styles.cell, styles.productsCell]}>
                {getProductsCount(item.items_json)}
            </Text>
        </TouchableOpacity>
    );

    if (loading) return <LoadingSpinner fullScreen />;

    return (
        <View style={styles.container}>
            <Card style={styles.tableCard}>
                <TableHeader />
                <FlatList
                    data={orders}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>لا توجد طلبات</Text>
                    }
                />
            </Card>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        padding: Layout.spacing.md,
    },
    tableCard: {
        flex: 1,
        padding: 0,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: Colors.primary,
        padding: Layout.spacing.sm,
        borderTopLeftRadius: Layout.borderRadius.lg,
        borderTopRightRadius: Layout.borderRadius.lg,
    },
    headerCell: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        padding: Layout.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.surface,
    },
    cell: {
        fontSize: 12,
        color: Colors.text,
        textAlign: 'center',
        justifyContent: 'center',
    },
    numberCell: {
        flex: 2,
        textAlign: 'right',
    },
    customerCell: {
        flex: 2.5,
        textAlign: 'right',
    },
    dateCell: {
        flex: 2,
    },
    statusCell: {
        flex: 1.5,
        alignItems: 'center',
    },
    productsCell: {
        flex: 1,
        fontWeight: '600',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: Layout.spacing.xl,
        fontSize: 16,
        color: Colors.textLight,
    },
});
