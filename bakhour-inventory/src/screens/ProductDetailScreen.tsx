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
import * as ProductQueries from '../database/queries/products';
import * as KitQueries from '../database/queries/kits';
import { Product } from '../types/database.types';

type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface KitComponentWithDetails {
    id: number;
    product_id: number;
    component_id: number;
    quantity_per_order: number;
    is_optional: number;
    component_name: string;
}

export const ProductDetailScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ProductDetailRouteProp>();
    const { id } = route.params;

    const [product, setProduct] = useState<Product | null>(null);
    const [kitComponents, setKitComponents] = useState<KitComponentWithDetails[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const productData = await ProductQueries.getProductById(id);
            if (!productData) {
                Alert.alert('خطأ', 'المنتج غير موجود');
                navigation.goBack();
                return;
            }
            setProduct(productData);

            // Load kit components
            const components = await KitQueries.getKitByProductId(id);
            setKitComponents(components as any);

        } catch (error) {
            console.error(error);
            Alert.alert('خطأ', 'فشل تحميل بيانات المنتج');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'تأكيد الحذف',
            'هل أنت متأكد من حذف هذا المنتج؟',
            [
                { text: 'إلغاء', style: 'cancel' },
                {
                    text: 'حذف',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await ProductQueries.deleteProduct(id);
                            Alert.alert('تم', 'تم حذف المنتج بنجاح');
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('خطأ', 'فشل حذف المنتج');
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
                    <TouchableOpacity onPress={() => navigation.navigate('AddProduct', { id })} style={{ marginRight: 15 }}>
                        <Ionicons name="create-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDelete} style={{ marginRight: 10 }}>
                        <Ionicons name="trash-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            ),
        });
    }, [navigation, id]);

    if (loading || !product) return <LoadingSpinner fullScreen />;

    return (
        <ScrollView style={styles.container}>
            {/* Header Card with Product Info */}
            <Card style={styles.headerCard}>
                <View style={styles.iconContainer}>
                    <Ionicons name="cube" size={48} color={Colors.primary} />
                </View>
                <Text style={styles.productName}>{product.name_ar}</Text>
                {product.name_en && <Text style={styles.productNameEn}>{product.name_en}</Text>}
                <View style={styles.badgeRow}>
                    <Badge
                        label={product.is_active ? 'نشط' : 'غير نشط'}
                        variant={product.is_active ? 'success' : 'danger'}
                    />
                </View>
            </Card>

            {/* Product Details Card */}
            <Card>
                <Text style={styles.sectionTitle}>تفاصيل المنتج</Text>
                <ListItem
                    title="رمز المنتج (SKU)"
                    subtitle={product.sku}
                />
                <ListItem
                    title="الوزن"
                    subtitle={`${product.weight_grams} جرام`}
                />
                <ListItem
                    title="تاريخ الإضافة"
                    subtitle={new Date(product.created_at).toLocaleDateString('ar-SA')}
                />
            </Card>

            {/* Kit Components Card */}
            <Card style={styles.kitCard}>
                <View style={styles.kitHeader}>
                    <Text style={styles.sectionTitle}>مكونات الطقم</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('ManageKit', { productId: id })}>
                        <Ionicons name="settings-outline" size={24} color={Colors.primary} />
                    </TouchableOpacity>
                </View>

                {kitComponents.length === 0 ? (
                    <View style={styles.emptyKit}>
                        <Ionicons name="cube-outline" size={48} color={Colors.textLight} />
                        <Text style={styles.emptyText}>لا توجد مكونات في هذا الطقم</Text>
                        <Button
                            title="إضافة مكونات"
                            onPress={() => navigation.navigate('ManageKit', { productId: id })}
                            variant="outline"
                            style={styles.addButton}
                        />
                    </View>
                ) : (
                    <>
                        {kitComponents.map((component) => (
                            <ListItem
                                key={component.id}
                                title={component.component_name}
                                subtitle={`الكمية: ${component.quantity_per_order}`}
                                onPress={() => navigation.navigate('ComponentDetail', { id: component.component_id })}
                                rightIcon="chevron-back"
                                badge={
                                    component.is_optional ? (
                                        <Badge label="اختياري" variant="info" size="small" />
                                    ) : null
                                }
                            />
                        ))}
                        <Button
                            title="إدارة المكونات"
                            onPress={() => navigation.navigate('ManageKit', { productId: id })}
                            variant="secondary"
                            style={styles.manageButton}
                        />
                    </>
                )}
            </Card>

            {/* Action Buttons */}
            <View style={styles.footer}>
                <Button
                    title={ArabicText.common.edit}
                    onPress={() => navigation.navigate('AddProduct', { id })}
                    variant="primary"
                    style={styles.actionButton}
                />
                <Button
                    title={ArabicText.common.delete}
                    onPress={handleDelete}
                    variant="danger"
                    style={styles.actionButton}
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
    productName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
        textAlign: 'center',
        marginBottom: Layout.spacing.xs,
    },
    productNameEn: {
        fontSize: 16,
        color: Colors.textLight,
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
    kitCard: {
        marginTop: Layout.spacing.lg,
    },
    kitHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Layout.spacing.md,
    },
    emptyKit: {
        alignItems: 'center',
        paddingVertical: Layout.spacing.xl,
    },
    emptyText: {
        fontSize: 16,
        color: Colors.textLight,
        marginTop: Layout.spacing.md,
        marginBottom: Layout.spacing.lg,
        textAlign: 'center',
    },
    addButton: {
        minWidth: 150,
    },
    manageButton: {
        marginTop: Layout.spacing.md,
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
