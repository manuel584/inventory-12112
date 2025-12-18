import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Text, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { ArabicText } from '../constants/ArabicText';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { LoadingSpinner } from '../components/LoadingSpinner';
import * as KitQueries from '../database/queries/kits';
import * as ComponentQueries from '../database/queries/components';
import * as ProductQueries from '../database/queries/products';
import { Component, Product } from '../types/database.types';
import { RootStackParamList } from '../navigation/AppNavigator';

type ManageKitRouteProp = RouteProp<RootStackParamList, 'ManageKit'>;

interface KitComponent {
    id: number;
    component_id: number;
    component_name: string;
    quantity_per_order: number;
}

export const ManageKitScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<ManageKitRouteProp>();
    const { productId } = route.params;

    const [product, setProduct] = useState<Product | null>(null);
    const [kitComponents, setKitComponents] = useState<KitComponent[]>([]);
    const [availableComponents, setAvailableComponents] = useState<Component[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showAddDialog, setShowAddDialog] = useState(false);

    useEffect(() => {
        loadData();
    }, [productId]);

    const loadData = async () => {
        try {
            setLoading(true);

            // Load product
            const products = await ProductQueries.getAllProducts();
            const prod = products.find(p => p.id === productId);
            setProduct(prod || null);

            // Load current kit components
            const kit = await KitQueries.getKitByProductId(productId);
            setKitComponents(kit.map(k => ({
                id: k.id,
                component_id: k.component_id,
                component_name: k.component_name || '',
                quantity_per_order: k.quantity_per_order
            })));

            // Load all components
            const allComponents = await ComponentQueries.getAllComponents();
            setAvailableComponents(allComponents);
        } catch (error) {
            console.error(error);
            Alert.alert(ArabicText.common.error, 'فشل تحميل البيانات');
        } finally {
            setLoading(false);
        }
    };

    const addComponentToKit = async (componentId: number) => {
        try {
            await KitQueries.addComponentToKit(productId, componentId, 1);
            await loadData();
            setShowAddDialog(false);
            Alert.alert(ArabicText.common.success, 'تمت إضافة المكون');
        } catch (error) {
            console.error(error);
            Alert.alert(ArabicText.common.error, 'فشل إضافة المكون');
        }
    };

    const removeComponentFromKit = async (kitId: number) => {
        Alert.alert(
            ArabicText.common.confirm,
            'هل تريد إزالة هذا المكون من الطقم؟',
            [
                { text: ArabicText.common.cancel, style: 'cancel' },
                {
                    text: ArabicText.common.delete,
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await KitQueries.removeComponentFromKit(kitId);
                            await loadData();
                            Alert.alert(ArabicText.common.success, 'تم الحذف');
                        } catch (error) {
                            console.error(error);
                            Alert.alert(ArabicText.common.error, 'فشل الحذف');
                        }
                    }
                }
            ]
        );
    };

    const updateQuantity = async (kitId: number, newQuantity: number) => {
        if (newQuantity < 1) return;

        try {
            await KitQueries.updateKitComponentQuantity(kitId, newQuantity);
            await loadData();
        } catch (error) {
            console.error(error);
            Alert.alert(ArabicText.common.error, 'فشل تحديث الكمية');
        }
    };

    const setAllToOne = async () => {
        try {
            setSaving(true);
            for (const kit of kitComponents) {
                await KitQueries.updateKitComponentQuantity(kit.id, 1);
            }
            await loadData();
            Alert.alert(ArabicText.common.success, 'تم التحديث');
        } catch (error) {
            console.error(error);
            Alert.alert(ArabicText.common.error, 'فشل التحديث');
        } finally {
            setSaving(false);
        }
    };

    const renderKitItem = ({ item }: { item: KitComponent }) => (
        <Card style={styles.kitItemCard}>
            <View style={styles.kitItemHeader}>
                <Text style={styles.kitItemName}>{item.component_name}</Text>
                <TouchableOpacity onPress={() => removeComponentFromKit(item.id)}>
                    <Ionicons name="trash-outline" size={20} color={Colors.danger} />
                </TouchableOpacity>
            </View>
            <View style={styles.quantityControl}>
                <TouchableOpacity
                    onPress={() => updateQuantity(item.id, item.quantity_per_order - 1)}
                    style={styles.quantityButton}
                >
                    <Ionicons name="remove-circle-outline" size={28} color={Colors.primary} />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity_per_order}</Text>
                <TouchableOpacity
                    onPress={() => updateQuantity(item.id, item.quantity_per_order + 1)}
                    style={styles.quantityButton}
                >
                    <Ionicons name="add-circle-outline" size={28} color={Colors.primary} />
                </TouchableOpacity>
            </View>
        </Card>
    );

    const renderAvailableComponent = ({ item }: { item: Component }) => {
        const alreadyAdded = kitComponents.some(k => k.component_id === item.id);
        if (alreadyAdded) return null;

        return (
            <TouchableOpacity
                style={styles.availableItem}
                onPress={() => addComponentToKit(item.id)}
            >
                <Text style={styles.availableItemText}>{item.name_ar}</Text>
                <Ionicons name="add-circle" size={24} color={Colors.primary} />
            </TouchableOpacity>
        );
    };

    if (loading) return <LoadingSpinner fullScreen />;

    return (
        <View style={styles.container}>
            <ScrollView>
                <Card style={styles.headerCard}>
                    <Text style={styles.productName}>{product?.name_ar}</Text>
                    <Text style={styles.productSku}>{product?.sku}</Text>
                </Card>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{ArabicText.kits.title}</Text>
                        <Button
                            title={ArabicText.kits.quickSelectAll}
                            onPress={setAllToOne}
                            variant="outline"
                            loading={saving}
                            style={styles.quickButton}
                        />
                    </View>

                    {kitComponents.length === 0 ? (
                        <Card style={styles.emptyCard}>
                            <Text style={styles.emptyText}>{ArabicText.kits.noComponents}</Text>
                        </Card>
                    ) : (
                        <FlatList
                            data={kitComponents}
                            renderItem={renderKitItem}
                            keyExtractor={item => item.id.toString()}
                            scrollEnabled={false}
                        />
                    )}
                </View>

                <Button
                    title={ArabicText.kits.addComponent}
                    onPress={() => setShowAddDialog(true)}
                    variant="secondary"
                    style={styles.addButton}
                />

                {showAddDialog && (
                    <Card style={styles.dialogCard}>
                        <View style={styles.dialogHeader}>
                            <Text style={styles.dialogTitle}>{ArabicText.kits.selectComponents}</Text>
                            <TouchableOpacity onPress={() => setShowAddDialog(false)}>
                                <Ionicons name="close-circle" size={28} color={Colors.textLight} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={availableComponents}
                            renderItem={renderAvailableComponent}
                            keyExtractor={item => item.id.toString()}
                            scrollEnabled={false}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>جميع المكونات مضافة</Text>
                            }
                        />
                    </Card>
                )}
            </ScrollView>
        </View>
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
        marginBottom: Layout.spacing.lg,
    },
    productName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 4,
    },
    productSku: {
        fontSize: 14,
        color: Colors.textLight,
    },
    section: {
        marginBottom: Layout.spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Layout.spacing.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
    },
    quickButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    kitItemCard: {
        marginBottom: Layout.spacing.md,
        padding: Layout.spacing.md,
    },
    kitItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Layout.spacing.sm,
    },
    kitItemName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityButton: {
        padding: 4,
    },
    quantityText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
        marginHorizontal: Layout.spacing.lg,
        minWidth: 40,
        textAlign: 'center',
    },
    addButton: {
        marginTop: Layout.spacing.md,
    },
    dialogCard: {
        marginTop: Layout.spacing.lg,
        padding: Layout.spacing.lg,
        backgroundColor: Colors.surface,
    },
    dialogHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Layout.spacing.md,
    },
    dialogTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
    },
    availableItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Layout.spacing.md,
        backgroundColor: Colors.background,
        borderRadius: Layout.borderRadius.md,
        marginBottom: Layout.spacing.sm,
    },
    availableItemText: {
        fontSize: 16,
        color: Colors.text,
    },
    emptyCard: {
        padding: Layout.spacing.xl,
        alignItems: 'center',
    },
    emptyText: {
        color: Colors.textLight,
        textAlign: 'center',
    },
});
