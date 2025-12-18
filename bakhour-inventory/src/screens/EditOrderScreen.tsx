import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Text, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { ArabicText } from '../constants/ArabicText';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Picker } from '../components/Picker';
import { LoadingSpinner } from '../components/LoadingSpinner';
import * as OrderQueries from '../database/queries/orders';
import * as ProductQueries from '../database/queries/products';
import { Product, Order } from '../types/database.types';
import { RootStackParamList } from '../navigation/AppNavigator';

type EditOrderRouteProp = RouteProp<RootStackParamList, 'EditOrder'>;

interface OrderItemInput {
    id: string;
    product_id: number;
    sku: string;
    product_name: string;
    quantity: number;
}

export const EditOrderScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<EditOrderRouteProp>();
    const { id } = route.params;

    const [orderNumber, setOrderNumber] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [orderDate, setOrderDate] = useState('');
    const [status, setStatus] = useState<'pending' | 'completed'>('pending');
    const [items, setItems] = useState<OrderItemInput[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);

            // Load order
            const order = await OrderQueries.getOrderById(id);
            if (!order) {
                Alert.alert(ArabicText.common.error, 'الطلب غير موجود');
                navigation.goBack();
                return;
            }

            setOrderNumber(order.order_number);
            setCustomerName(order.customer_name || '');
            setOrderDate(order.order_date);
            setStatus(order.status as 'pending' | 'completed');

            // Parse items
            const parsedItems = JSON.parse(order.items_json || '[]');
            setItems(parsedItems.map((item: any, index: number) => ({
                id: `${item.product_id || index}_${Date.now()}`,
                product_id: item.product_id || 0,
                sku: item.sku || '',
                product_name: item.product_name || '',
                quantity: item.quantity || 1
            })));

            // Load products
            const allProducts = await ProductQueries.getAllProducts();
            setProducts(allProducts);
        } catch (error) {
            console.error(error);
            Alert.alert(ArabicText.common.error, 'فشل تحميل البيانات');
        } finally {
            setLoading(false);
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
        setItems(items.map(item => {
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
        }));
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

        setSaving(true);
        try {
            await OrderQueries.updateOrder(id, {
                order_number: orderNumber.toUpperCase(),
                customer_name: customerName || 'Unknown',
                status: status,
                items_json: JSON.stringify(items.map(item => ({
                    product_id: item.product_id,
                    sku: item.sku,
                    product_name: item.product_name,
                    quantity: item.quantity
                })))
            });

            Alert.alert(ArabicText.common.success, 'تم تحديث الطلب بنجاح');
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Alert.alert(ArabicText.common.error, 'حدث خطأ أثناء الحفظ');
        } finally {
            setSaving(false);
        }
    };

    const productOptions = products.map(p => ({
        label: `${p.name_ar} (${p.sku})`,
        value: p.id
    }));

    const statusOptions = [
        { label: ArabicText.orders.pending, value: 'pending' },
        { label: ArabicText.orders.completed, value: 'completed' }
    ];

    if (loading) return <LoadingSpinner fullScreen />;

    return (
        <ScrollView style={styles.container}>
            <Card style={styles.card}>
                <Input
                    label="رقم الطلب"
                    value={orderNumber}
                    onChangeText={setOrderNumber}
                    error={errors.orderNumber}
                    autoCapitalize="characters"
                />

                <Input
                    label="اسم العميل"
                    value={customerName}
                    onChangeText={setCustomerName}
                />

                <Picker
                    label="حالة الطلب"
                    options={statusOptions}
                    selectedValue={status}
                    onValueChange={(value) => setStatus(value as 'pending' | 'completed')}
                />

                <View style={styles.itemsHeader}>
                    <Text style={styles.sectionTitle}>المنتجات</Text>
                    <TouchableOpacity onPress={addItem} style={styles.addButton}>
                        <Ionicons name="add-circle" size={24} color={Colors.primary} />
                        <Text style={styles.addButtonText}>إضافة منتج</Text>
                    </TouchableOpacity>
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
                    loading={saving}
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
});
