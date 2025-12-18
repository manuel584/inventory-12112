import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { ArabicText } from '../constants/ArabicText';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ListItem } from '../components/ListItem';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Badge } from '../components/Badge';
import * as OrderQueries from '../database/queries/orders';
import { Order } from '../types/database.types';
import { formatDate } from '../utils/formatting';

type OrderDetailRouteProp = RouteProp<RootStackParamList, 'OrderDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const OrderDetailScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<OrderDetailRouteProp>();
    const { id } = route.params;

    const [order, setOrder] = useState<Order | null>(null);
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const orderData = await OrderQueries.getOrderById(id);
            if (!orderData) {
                Alert.alert('خطأ', 'الطلب غير موجود');
                navigation.goBack();
                return;
            }
            setOrder(orderData);

            // Parse items from JSON
            const parsedItems = JSON.parse(orderData.items_json || '[]');
            setItems(parsedItems);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !order) return <LoadingSpinner fullScreen />;

    return (
        <ScrollView style={styles.container}>
            <Card style={styles.headerCard}>
                <View style={styles.headerRow}>
                    <Text style={styles.orderNumber}>طلب #{order.order_number || order.id}</Text>
                    <Badge
                        label={order.status === 'completed' ? ArabicText.orders.completed : ArabicText.orders.pending}
                        variant={order.status === 'completed' ? 'success' : 'warning'}
                    />
                </View>
                <Text style={styles.date}>{formatDate(order.order_date)}</Text>
                <Text style={styles.customer}>{order.customer_name || 'غير محدد'}</Text>
            </Card>

            <Card>
                <ListItem
                    title="رقم الطلب"
                    subtitle={order.order_number}
                />
                <ListItem
                    title="التاريخ"
                    subtitle={formatDate(order.order_date)}
                />
                <ListItem
                    title="اسم العميل"
                    subtitle={order.customer_name || 'غير محدد'}
                />
            </Card>

            <Text style={styles.sectionTitle}>المنتجات</Text>
            {items.map((item, index) => (
                <ListItem
                    key={index}
                    title={item.product_name || 'منتج غير معروف'}
                    subtitle={`SKU: ${item.sku} | الكمية: ${item.quantity}`}
                    badge={<Text style={styles.qtyBadge}>x{item.quantity}</Text>}
                />
            ))}

            {order.status === 'pending' && (
                <View style={styles.footer}>
                    <Button
                        title={ArabicText.common.edit}
                        onPress={() => navigation.navigate('EditOrder', { id: order.id })}
                        variant="secondary"
                        style={styles.actionButton}
                    />
                    <Button
                        title={ArabicText.packing.start}
                        onPress={() => navigation.navigate('PackOrder', { id: order.id })}
                        style={styles.actionButton}
                    />
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        padding: Layout.spacing.md,
    },
    headerCard: {
        marginBottom: Layout.spacing.lg,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Layout.spacing.sm,
    },
    orderNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
    },
    date: {
        fontSize: 14,
        color: Colors.textLight,
        marginBottom: 4,
        textAlign: 'right',
    },
    customer: {
        fontSize: 16,
        color: Colors.text,
        fontWeight: '600',
        textAlign: 'right',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: Layout.spacing.md,
        textAlign: 'right',
    },
    qtyBadge: {
        fontWeight: 'bold',
        color: Colors.primary,
    },
    footer: {
        flexDirection: 'row',
        gap: Layout.spacing.md,
        marginTop: Layout.spacing.xl,
        marginBottom: Layout.spacing.xl,
    },
    actionButton: {
        flex: 1,
    },
});
