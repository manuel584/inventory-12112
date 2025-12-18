import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { ArabicText } from '../constants/ArabicText';
import { Card } from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';
import * as ComponentQueries from '../database/queries/components';
import { Component } from '../types/database.types';

export const InventoryTableScreen = () => {
    const navigation = useNavigation();
    const [components, setComponents] = useState<Component[]>([]);
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
            const data = await ComponentQueries.getAllComponents();
            setComponents(data);
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

    const TableHeader = () => (
        <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.nameCell]}>المكون</Text>
            <Text style={[styles.headerCell, styles.typeCell]}>النوع</Text>
            <Text style={[styles.headerCell, styles.stockCell]}>المخزون</Text>
            <Text style={[styles.headerCell, styles.minCell]}>الحد الأدنى</Text>
        </View>
    );

    const renderItem = ({ item }: { item: Component }) => {
        const isLowStock = item.current_stock <= item.min_stock_alert;

        return (
            <View style={[styles.tableRow, isLowStock && styles.lowStockRow]}>
                <Text style={[styles.cell, styles.nameCell]} numberOfLines={1}>{item.name_ar}</Text>
                <Text style={[styles.cell, styles.typeCell]} numberOfLines={1}>{item.type}</Text>
                <Text style={[styles.cell, styles.stockCell, isLowStock && styles.lowStockText]}>
                    {item.current_stock}
                </Text>
                <Text style={[styles.cell, styles.minCell]}>{item.min_stock_alert}</Text>
            </View>
        );
    };

    if (loading) return <LoadingSpinner fullScreen />;

    return (
        <View style={styles.container}>
            <Card style={styles.tableCard}>
                <TableHeader />
                <FlatList
                    data={components}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>لا توجد مكونات في المخزون</Text>
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
        fontSize: 14,
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
    lowStockRow: {
        backgroundColor: '#FFF5F5',
    },
    cell: {
        fontSize: 13,
        color: Colors.text,
        textAlign: 'center',
    },
    nameCell: {
        flex: 3,
        textAlign: 'right',
    },
    typeCell: {
        flex: 2,
    },
    stockCell: {
        flex: 1.5,
        fontWeight: '600',
    },
    minCell: {
        flex: 1.5,
    },
    lowStockText: {
        color: Colors.danger,
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: Layout.spacing.xl,
        fontSize: 16,
        color: Colors.textLight,
    },
});
