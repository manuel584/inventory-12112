import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
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
import { Ionicons } from '@expo/vector-icons';
import * as ComponentQueries from '../database/queries/components';
import { Component } from '../types/database.types';
import { db } from '../database/init';

type ComponentDetailRouteProp = RouteProp<RootStackParamList, 'ComponentDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ProductUsingComponent {
    id: number;
    name_ar: string;
    sku: string;
    quantity_per_order: number;
}

export const ComponentDetailScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ComponentDetailRouteProp>();
    const { id } = route.params;

    const [component, setComponent] = useState<Component | null>(null);
    const [productsUsing, setProductsUsing] = useState<ProductUsingComponent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const componentData = await ComponentQueries.getComponentById(id);
            if (!componentData) {
                Alert.alert('خطأ', 'المكون غير موجود');
                navigation.goBack();
                return;
            }
            setComponent(componentData);

            // Get products using this component
            const products = await db.getAllAsync<ProductUsingComponent>(
                `SELECT p.id, p.name_ar, p.sku, pk.quantity_per_order
                 FROM products p
                 INNER JOIN product_kits pk ON p.id = pk.product_id
                 WHERE pk.component_id = ? AND p.is_active = 1
                 ORDER BY p.name_ar ASC`,
                [id]
            );
            setProductsUsing(products);

        } catch (error) {
            console.error(error);
            Alert.alert('خطأ', 'فشل تحميل بيانات المكون');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        // Check if component is used in any products
        if (productsUsing.length > 0) {
            Alert.alert(
                'لا يمكن الحذف',
                `هذا المكون مستخدم في ${productsUsing.length} منتج. يرجى إزالته من المنتجات أولاً.`,
                [{ text: 'حسناً' }]
            );
            return;
        }

        Alert.alert(
            'تأكيد الحذف',
            'هل أنت متأكد من حذف هذا المكون؟ سيتم حذفه نهائياً.',
            [
                { text: 'إلغاء', style: 'cancel' },
                {
                    text: 'حذف',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await ComponentQueries.deleteComponent(id);
                            Alert.alert('تم', 'تم حذف المكون بنجاح');
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('خطأ', 'فشل حذف المكون');
                        }
                    },
                },
            ]
        );
    };

    // Add header actions
    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity onPress={() => navigation.navigate('AddComponent', { id })} style={{ marginRight: 15 }}>
                        <Ionicons name="create-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDelete} style={{ marginRight: 10 }}>
                        <Ionicons name="trash-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            ),
        });
    }, [navigation, id, productsUsing.length]);

    if (loading || !component) return <LoadingSpinner fullScreen />;

    const isLowStock = component.current_stock <= component.min_stock_alert;
    const stockPercentage = (component.current_stock / component.min_stock_alert) * 100;

    return (
        <ScrollView style={styles.container}>
            {/* Header Card with Component Info */}
            <Card style={styles.headerCard}>
                <View style={styles.iconContainer}>
                    <Ionicons name="layers" size={48} color={Colors.primary} />
                </View>
                <Text style={styles.componentName}>{component.name_ar}</Text>
                <View style={styles.badgeRow}>
                    <Badge label={component.type} variant="info" />
                    {isLowStock && <Badge label="مخزون منخفض" variant="danger" />}
                </View>
            </Card>

            {/* Stock Status Card */}
            <Card>
                <Text style={styles.sectionTitle}>حالة المخزون</Text>

                <View style={styles.stockRow}>
                    <View style={styles.stockItem}>
                        <Text style={styles.stockLabel}>المخزون الحالي</Text>
                        <Text style={[styles.stockValue, isLowStock && styles.lowStockValue]}>
                            {component.current_stock} {component.unit}
                        </Text>
                    </View>
                    <View style={styles.stockItem}>
                        <Text style={styles.stockLabel}>الحد الأدنى</Text>
                        <Text style={styles.stockValue}>
                            {component.min_stock_alert} {component.unit}
                        </Text>
                    </View>
                </View>

                {/* Stock Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${Math.min(stockPercentage, 100)}%` },
                                isLowStock && styles.progressFillLow
                            ]}
                        />
                    </View>
                    <Text style={styles.progressText}>
                        {stockPercentage.toFixed(0)}% من الحد الأدنى
                    </Text>
                </View>

                {component.cost_per_unit && (
                    <ListItem
                        title="التكلفة لكل وحدة"
                        subtitle={`${component.cost_per_unit} ريال`}
                    />
                )}
            </Card>

            {/* Component Details Card */}
            <Card style={styles.detailsCard}>
                <Text style={styles.sectionTitle}>تفاصيل المكون</Text>
                {component.sku && (
                    <ListItem
                        title="رمز المكون (SKU)"
                        subtitle={component.sku}
                    />
                )}
                <ListItem
                    title="النوع"
                    subtitle={component.type}
                />
                <ListItem
                    title="الوحدة"
                    subtitle={component.unit}
                />
            </Card>

            {/* Products Using This Component */}
            <Card style={styles.usageCard}>
                <View style={styles.usageHeader}>
                    <Text style={styles.sectionTitle}>المنتجات المستخدمة</Text>
                    <Badge
                        label={productsUsing.length.toString()}
                        variant="info"
                        size="small"
                    />
                </View>

                {productsUsing.length === 0 ? (
                    <View style={styles.emptyUsage}>
                        <Ionicons name="cube-outline" size={48} color={Colors.textLight} />
                        <Text style={styles.emptyText}>
                            لا يوجد منتجات تستخدم هذا المكون
                        </Text>
                    </View>
                ) : (
                    <>
                        {productsUsing.map((product) => (
                            <ListItem
                                key={product.id}
                                title={product.name_ar}
                                subtitle={`SKU: ${product.sku} | الكمية المطلوبة: ${product.quantity_per_order}`}
                                onPress={() => navigation.navigate('ProductDetail', { id: product.id })}
                                rightIcon="chevron-back"
                            />
                        ))}
                    </>
                )}
            </Card>

            {/* Action Buttons */}
            <View style={styles.footer}>
                <Button
                    title="تعديل المعلومات"
                    onPress={() => navigation.navigate('AddComponent', { id })}
                    variant="primary"
                    style={styles.actionButton}
                />
                <Button
                    title="تحديث المخزون"
                    onPress={() => navigation.navigate('BulkStockAdjustment' as any)}
                    variant="secondary"
                    style={styles.actionButton}
                />
            </View>

            {productsUsing.length === 0 && (
                <Button
                    title={ArabicText.common.delete}
                    onPress={handleDelete}
                    variant="danger"
                    style={styles.deleteButton}
                />
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
        alignItems: 'center',
        paddingVertical: Layout.spacing.xl,
        marginBottom: Layout.spacing.lg,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Layout.spacing.md,
    },
    componentName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
        textAlign: 'center',
        marginBottom: Layout.spacing.sm,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: Layout.spacing.sm,
        marginTop: Layout.spacing.sm,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: Layout.spacing.md,
        textAlign: 'right',
    },
    stockRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: Layout.spacing.lg,
    },
    stockItem: {
        alignItems: 'center',
    },
    stockLabel: {
        fontSize: 14,
        color: Colors.textLight,
        marginBottom: Layout.spacing.xs,
    },
    stockValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    lowStockValue: {
        color: Colors.danger,
    },
    progressContainer: {
        marginTop: Layout.spacing.md,
        marginBottom: Layout.spacing.lg,
    },
    progressBar: {
        height: 12,
        backgroundColor: Colors.border,
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: Layout.spacing.xs,
    },
    progressFill: {
        height: '100%',
        backgroundColor: Colors.success,
        borderRadius: 6,
    },
    progressFillLow: {
        backgroundColor: Colors.danger,
    },
    progressText: {
        fontSize: 12,
        color: Colors.textLight,
        textAlign: 'center',
    },
    detailsCard: {
        marginTop: Layout.spacing.lg,
    },
    usageCard: {
        marginTop: Layout.spacing.lg,
    },
    usageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Layout.spacing.md,
    },
    emptyUsage: {
        alignItems: 'center',
        paddingVertical: Layout.spacing.xl,
    },
    emptyText: {
        fontSize: 16,
        color: Colors.textLight,
        marginTop: Layout.spacing.md,
        textAlign: 'center',
    },
    footer: {
        flexDirection: 'row',
        gap: Layout.spacing.md,
        marginTop: Layout.spacing.xl,
        marginBottom: Layout.spacing.md,
    },
    actionButton: {
        flex: 1,
    },
    deleteButton: {
        marginBottom: Layout.spacing.xl,
    },
});
