import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { ArabicText } from '../constants/ArabicText';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Picker } from '../components/Picker';
import { Card } from '../components/Card';
import * as OrderQueries from '../database/queries/orders';
import * as ProductQueries from '../database/queries/products';
import * as TemplateQueries from '../database/queries/templates';
import { Product } from '../types/database.types';
import { calculateOrderWeight, formatWeight } from '../utils/weightCalculations';

interface OrderItemInput {
    id: string; // Temporary ID for UI
    product_id: number;
    sku: string;
    product_name: string;
    quantity: number;
}

type AddOrderRouteProp = RouteProp<RootStackParamList, 'AddOrder'>;

export const AddOrderScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<AddOrderRouteProp>();
    const { templateId } = route.params || {};

    const [orderNumber, setOrderNumber] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [items, setItems] = useState<OrderItemInput[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [totalWeight, setTotalWeight] = useState(0);

    useEffect(() => {
        loadProducts();
        if (templateId) {
            loadTemplate(templateId);
        }
    }, [templateId]);

    const loadProducts = async () => {
        try {
            const data = await ProductQueries.getAllProducts();
            setProducts(data);
        } catch (error) {
            console.error(error);
            Alert.alert('خطأ', 'فشل تحميل المنتجات');
        }
    };

    const loadTemplate = async (id: number) => {
        try {
            const template = await TemplateQueries.getTemplateById(id);
            if (template) {
                const parsedItems = JSON.parse(template.products_json || '[]');
                setItems(parsedItems.map((item: any, index: number) => ({
                    id: `${item.product_id || index}_${Date.now()}`,
                    product_id: item.product_id || 0,
                    sku: item.sku || '',
                    product_name: item.product_name || '',
                    quantity: item.quantity || 1
                })));
            }
        } catch (error) {
            console.error(error);
            Alert.alert('خطأ', 'فشل تحميل القالب');
        }
    };

    const addItem = () => {
        setItems([...items, {
            id: Date.now().toString(),
            product_id: 0,
            sku: '',
            product_name: '',
            quantity: 1
        }]);
    };

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const updateItem = (id: string, field: keyof OrderItemInput, value: any) => {
        const updatedItems = items.map(item => {
            if (item.id === id) {
                if (field === 'product_id') {
                    const product = products.find(p => p.id === value);
                    if (product) {
                        return {
                            ...item,
                            product_id: value,
                            sku: product.sku,
                            product_name: product.name_ar
                        };
                    }
                }
                return { ...item, [field]: value };
            }
            return item;
        });
        setItems(updatedItems);
        setTotalWeight(calculateOrderWeight(updatedItems, products));
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!orderNumber.trim()) newErrors.orderNumber = 'رقم الطلب مطلوب';
        if (items.length === 0) newErrors.items = 'يجب إضافة منتج واحد على الأقل';

        items.forEach((item, index) => {
            if (item.product_id === 0) newErrors[`item_${index}`] = 'اختر منتجاً';
            if (item.quantity <= 0) newErrors[`qty_${index}`] = 'الكمية غير صحيحة';
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            await OrderQueries.createOrder({
                order_number: orderNumber.toUpperCase(),
                customer_name: customerName || 'Unknown',
                order_date: new Date().toISOString(),
                status: 'pending',
                items_json: JSON.stringify(items.map(item => ({
                    sku: item.sku,
                    product_id: item.product_id,
                    product_name: item.product_name,
                    quantity: item.quantity
                })))
            });

            Alert.alert(ArabicText.common.success, 'تم إضافة الطلب بنجاح');
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Alert.alert(ArabicText.common.error, 'حدث خطأ أثناء الحفظ');
        } finally {
            setLoading(false);
        }
    };

    const productOptions = products.map(p => ({
        label: `${p.name_ar} (${p.sku})`,
        value: p.id
    }));

    return (
        <ScrollView style={styles.container}>
            <Card style={styles.card}>
                <Input
                    label="رقم الطلب"
                    value={orderNumber}
                    onChangeText={setOrderNumber}
                    error={errors.orderNumber}
                    placeholder="ORD-001"
                    autoCapitalize="characters"
                />

                <Input
                    label="اسم العميل"
                    value={customerName}
                    onChangeText={setCustomerName}
                    placeholder="اختياري"
                />

                {items.length > 0 && (
                    <View style={styles.weightContainer}>
                        <Text style={styles.weightLabel}>الوزن الإجمالي:</Text>
                        <Text style={styles.weightValue}>{formatWeight(totalWeight)}</Text>
                    </View>
                )}

                <View style={styles.itemsHeader}>
                    <Text style={styles.sectionTitle}>المنتجات</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity onPress={() => navigation.navigate('OrderTemplates' as any)} style={styles.templateButton}>
                            <Ionicons name="albums-outline" size={20} color={Colors.primary} />
                            <Text style={styles.templateButtonText}>قالب</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={addItem} style={styles.addButton}>
                            <Ionicons name="add-circle" size={24} color={Colors.primary} />
                            <Text style={styles.addButtonText}>إضافة</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {errors.items && <Text style={styles.errorText}>{errors.items}</Text>}

                {items.map((item, index) => (
                    <Card key={item.id} style={styles.itemCard}>
                        <View style={styles.itemHeader}>
                            <Text style={styles.itemTitle}>منتج {index + 1}</Text>
                            <TouchableOpacity onPress={() => removeItem(item.id)}>
                                <Ionicons name="trash-outline" size={20} color={Colors.danger} />
                            </TouchableOpacity>
                        </View>

                        <Picker
                            label="المنتج"
                            options={productOptions}
                            selectedValue={item.product_id}
                            onValueChange={(value) => updateItem(item.id, 'product_id', value)}
                        />
                        {errors[`item_${index}`] && <Text style={styles.errorText}>{errors[`item_${index}`]}</Text>}

                        <Input
                            label="الكمية"
                            value={item.quantity.toString()}
                            onChangeText={(value) => updateItem(item.id, 'quantity', parseInt(value) || 0)}
                            keyboardType="numeric"
                            error={errors[`qty_${index}`]}
                        />
                    </Card>
                ))}

                <Button
                    title={ArabicText.common.save}
                    onPress={handleSave}
                    loading={loading}
                    style={styles.saveButton}
                />
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
    card: {
        padding: Layout.spacing.lg,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: Layout.spacing.md,
    },
    itemsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Layout.spacing.lg,
        marginBottom: Layout.spacing.md,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addButtonText: {
        color: Colors.primary,
        fontWeight: 'bold',
        marginLeft: 4,
        fontSize: 14,
    },
    templateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    templateButtonText: {
        color: Colors.primary,
        fontWeight: '600',
        marginLeft: 4,
        fontSize: 13,
    },
    itemCard: {
        marginBottom: Layout.spacing.md,
        backgroundColor: '#F9FAFB',
        padding: Layout.spacing.md,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Layout.spacing.sm,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    errorText: {
        color: Colors.danger,
        fontSize: 12,
        marginTop: 4,
    },
    saveButton: {
        marginTop: Layout.spacing.lg,
    },
    weightContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F0F9FF',
        padding: Layout.spacing.md,
        borderRadius: Layout.borderRadius.md,
        marginTop: Layout.spacing.md,
        borderWidth: 1,
        borderColor: Colors.info,
    },
    weightLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    weightValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.info,
    },
});
