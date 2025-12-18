import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { ArabicText } from '../constants/ArabicText';
import { ListItem } from '../components/ListItem';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Badge } from '../components/Badge';
import { Ionicons } from '@expo/vector-icons';
import { useOrders } from '../hooks/useOrders';
import { formatDate } from '../utils/formatting';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const OrdersScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const { orders, loading, loadOrders } = useOrders();
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: () => null,
            headerRight: () => (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15, marginRight: 10 }}>
                    <TouchableOpacity onPress={() => navigation.navigate('GlobalSearch')}>
                        <Ionicons name="search" size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('OrdersTable' as any)}>
                        <Ionicons name="grid-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            ),
        });
    }, [navigation]);

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        if (filter === 'pending') return order.status === 'pending';
        if (filter === 'completed') return order.status === 'completed';
        return true;
    });

    const renderItem = ({ item }: { item: typeof orders[0] }) => (
        <ListItem
            title={`طلب #${item.order_number || item.id}`}
            subtitle={`${formatDate(item.order_date)} | ${item.customer_name || 'عميل غير معروف'}`}
            rightIcon="chevron-back"
            onPress={() => navigation.navigate('OrderDetail', { id: item.id })}
            badge={
                <Badge
                    label={item.status === 'completed' ? ArabicText.orders.completed : ArabicText.orders.pending}
                    variant={item.status === 'completed' ? 'success' : 'warning'}
                    size="small"
                />
            }
        />
    );

    return (
        <View style={styles.container}>
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
                    onPress={() => setFilter('all')}
                >
                    <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>الكل</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'pending' && styles.activeFilter]}
                    onPress={() => setFilter('pending')}
                >
                    <Text style={[styles.filterText, filter === 'pending' && styles.activeFilterText]}>{ArabicText.orders.pending}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'completed' && styles.activeFilter]}
                    onPress={() => setFilter('completed')}
                >
                    <Text style={[styles.filterText, filter === 'completed' && styles.activeFilterText]}>{ArabicText.orders.completed}</Text>
                </TouchableOpacity>
            </View>

            {loading && orders.length === 0 ? (
                <LoadingSpinner />
            ) : (
                <FlatList
                    data={filteredOrders}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={loading} onRefresh={loadOrders} />
                    }
                    ListEmptyComponent={
                        <EmptyState
                            title="لا توجد طلبات"
                            subtitle="يمكنك استيراد الطلبات من ملف CSV"
                            icon="document-text-outline"
                            actionLabel={ArabicText.orders.import}
                            onAction={() => navigation.navigate('ImportOrders')}
                        />
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    filterContainer: {
        flexDirection: 'row',
        padding: Layout.spacing.md,
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    filterButton: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: Layout.spacing.sm,
        backgroundColor: Colors.background,
    },
    activeFilter: {
        backgroundColor: Colors.primary,
    },
    filterText: {
        color: Colors.text,
        fontSize: 14,
    },
    activeFilterText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    listContent: {
        flexGrow: 1,
    },
});
