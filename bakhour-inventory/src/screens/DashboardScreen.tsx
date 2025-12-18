import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { ArabicText } from '../constants/ArabicText';
import { Card } from '../components/Card';
import { Ionicons } from '@expo/vector-icons';
import * as ProductQueries from '../database/queries/products';
import * as OrderQueries from '../database/queries/orders';
import * as ComponentQueries from '../database/queries/components';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const DashboardScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        productsCount: 0,
        pendingOrdersCount: 0,
        lowStockCount: 0,
    });

    const loadStats = async () => {
        try {
            const products = await ProductQueries.getAllProducts();
            const pendingOrders = await OrderQueries.getOrdersRequiringPacking();
            const lowStock = await ComponentQueries.getLowStockComponents();

            setStats({
                productsCount: products.length,
                pendingOrdersCount: pendingOrders.length,
                lowStockCount: lowStock.length,
            });
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadStats();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadStats();
        setRefreshing(false);
    };

    const StatCard = ({ title, value, icon, color, onPress }: any) => (
        <TouchableOpacity onPress={onPress} style={{ flex: 1 }}>
            <Card style={[styles.statCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
                <View style={styles.statIconContainer}>
                    <Ionicons name={icon} size={24} color={color} />
                </View>
                <View>
                    <Text style={styles.statValue}>{value}</Text>
                    <Text style={styles.statTitle}>{title}</Text>
                </View>
            </Card>
        </TouchableOpacity>
    );

    const ActionButton = ({ title, icon, onPress }: any) => (
        <TouchableOpacity style={styles.actionButton} onPress={onPress}>
            <View style={styles.actionIcon}>
                <Ionicons name={icon} size={28} color={Colors.primary} />
            </View>
            <Text style={styles.actionText}>{title}</Text>
        </TouchableOpacity>
    );

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.header}>
                <Text style={styles.welcomeText}>مرحباً بك 👋</Text>
                <Text style={styles.dateText}>{new Date().toLocaleDateString('ar-SA')}</Text>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statsRow}>
                    <StatCard
                        title={ArabicText.products.title}
                        value={stats.productsCount}
                        icon="cube"
                        color={Colors.info}
                        onPress={() => navigation.navigate('Products')}
                    />
                    <View style={{ width: Layout.spacing.md }} />
                    <StatCard
                        title={ArabicText.orders.pending}
                        value={stats.pendingOrdersCount}
                        icon="time"
                        color={Colors.warning}
                        onPress={() => navigation.navigate('Orders')}
                    />
                </View>
                <View style={styles.statsRow}>
                    <StatCard
                        title={ArabicText.dashboard.lowStock}
                        value={stats.lowStockCount}
                        icon="alert-circle"
                        color={Colors.danger}
                        onPress={() => navigation.navigate('Components')}
                    />
                </View>
            </View>

            <Text style={styles.sectionTitle}>إجراءات سريعة</Text>
            <View style={styles.actionsGrid}>
                <ActionButton
                    title={ArabicText.dashboard.newOrders}
                    icon="cloud-download-outline"
                    onPress={() => navigation.navigate('ImportOrders')}
                />
                <ActionButton
                    title={ArabicText.dashboard.packOrder}
                    icon="checkbox-outline"
                    onPress={() => navigation.navigate('Orders')}
                />
                <ActionButton
                    title={ArabicText.dashboard.addProduct}
                    icon="add-circle-outline"
                    onPress={() => navigation.navigate('Products', { screen: 'AddProduct' } as any)}
                />
                <ActionButton
                    title={ArabicText.dashboard.exportExcel}
                    icon="document-text-outline"
                    onPress={() => navigation.navigate('Components', { screen: 'Export' } as any)}
                />
            </View>

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
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
        textAlign: 'right',
    },
    dateText: {
        fontSize: 14,
        color: Colors.textLight,
        textAlign: 'right',
        marginTop: 4,
    },
    statsContainer: {
        marginBottom: Layout.spacing.xl,
    },
    statsRow: {
        flexDirection: 'row',
        marginBottom: Layout.spacing.md,
    },
    statCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Layout.spacing.md,
    },
    statIconContainer: {
        marginRight: Layout.spacing.md,
        padding: 8,
        backgroundColor: Colors.background,
        borderRadius: Layout.borderRadius.round,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
        textAlign: 'left',
    },
    statTitle: {
        fontSize: 12,
        color: Colors.textLight,
        textAlign: 'left',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: Layout.spacing.md,
        textAlign: 'right',
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    actionButton: {
        width: '48%',
        backgroundColor: Colors.surface,
        padding: Layout.spacing.lg,
        borderRadius: Layout.borderRadius.lg,
        alignItems: 'center',
        marginBottom: Layout.spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    actionIcon: {
        marginBottom: Layout.spacing.sm,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
        textAlign: 'center',
    },
});
