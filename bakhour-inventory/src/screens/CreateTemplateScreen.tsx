import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Text } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { ArabicText } from '../constants/ArabicText';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Picker } from '../components/Picker';
import { LoadingSpinner } from '../components/LoadingSpinner';
import * as TemplateQueries from '../database/queries/templates';
import * as ProductQueries from '../database/queries/products';
import { Product } from '../types/database.types';
import { RootStackParamList } from '../navigation/AppNavigator';

type CreateTemplateRouteProp = RouteProp<RootStackParamList, 'CreateTemplate'>;

interface TemplateItem {
    id: string;
    product_id: number;
    sku: string;
    product_name: string;
    quantity: number;
}

export const CreateTemplateScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<CreateTemplateRouteProp>();
    const { id } = route.params || {};

    const [templateName, setTemplateName] = useState('');
    const [items, setItems] = useState<TemplateItem[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        loadProducts();
        if (id) loadTemplate();
    }, [id]);

    const loadProducts = async () => {
        try {
            const allProducts = await ProductQueries.getAllProducts();
            setProducts(allProducts);
        } catch (error) {
            console.error(error);
            Alert.alert(ArabicText.common.error, 'فشل تحميل المنتجات');
        }
    };

    const loadTemplate = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const template = await TemplateQueries.getTemplateById(id);
            if (!template) {
                Alert.alert(ArabicText.common.error, 'القالب غير موجود');
                navigation.goBack();
                return;
            }
            setTemplateName(template.name);
            const parsedItems = JSON.parse(template.products_json || '[]');
            setItems(parsedItems.map((item: any, index: number) => ({
                id: `${item.product_id || index}_${Date.now()}`,
                product_id: item.product_id || 0,
                sku: item.sku || '',
                product_name: item.product_name || '',
                quantity: item.quantity || 1
            })));
        } catch (error) {
            console.error(error);
            Alert.alert(ArabicText.common.error, 'فشل تحميل القالب');
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

    const removeItem = (itemId: string) => {
        setItems(items.filter(item => item.id !== itemId));
    };

    const updateItem = (itemId: string, field: keyof TemplateItem, value: any) => {
        setItems(items.map(item => {
            if (item.id === itemId) {
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
        if (!templateName.trim()) newErrors.templateName = 'اسم القالب مطلوب';
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
            const productsJson = JSON.stringify(items.map(item => ({
                product_id: item.product_id,
                sku: item.sku,
                product_name: item.product_name,
                quantity: item.quantity
            })));

            if (id) {
                await TemplateQueries.updateTemplate(id, {
                    name: templateName,
                    products_json: productsJson
                });
            } else {
                await TemplateQueries.createTemplate({
                    name: templateName,
                    products_json: productsJson
                });
            }

            Alert.alert(ArabicText.common.success, id ? 'تم تحديث القالب' : 'تم إنشاء القالب');
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

    if (loading) return <LoadingSpinner fullScreen />;

    return (
        <ScrollView style={styles.container}>
            <Card style={styles.card}>
                <Input
                    label={ArabicText.templates.templateName}
                    value={templateName}
                    onChangeText={setTemplateName}
                    error={errors.templateName}
                    placeholder="مثال: طلب تايقر 40 - كبير"
                />

                <View style={styles.itemsHeader}>
                    <Text style={styles.sectionTitle}>المنتجات</Text>
                    <Button
                        title="+ إضافة منتج"
                        onPress={addItem}
                        variant="outline"
                        style={styles.addButton}
                    />
                </View>

                {errors.items && <Text style={styles.errorText}>{errors.items}</Text>}

                {items.map((item, index) => (
                    <Card key={item.id} style={styles.itemCard}>
                        <View style={styles.itemHeader}>
                            <Text style={styles.itemTitle}>منتج {index + 1}</Text>
                            <Button
                                title="حذف"
                                onPress={() => removeItem(item.id)}
                                variant="danger"
                                style={styles.removeButton}
                            />
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
    },
    itemsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Layout.spacing.lg,
        marginBottom: Layout.spacing.md,
    },
    addButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
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
    removeButton: {
        paddingVertical: 4,
        paddingHorizontal: 8,
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
