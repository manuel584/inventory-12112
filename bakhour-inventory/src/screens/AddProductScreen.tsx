import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Switch, Text } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { ArabicText } from '../constants/ArabicText';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Picker } from '../components/Picker';
import { useProducts } from '../hooks/useProducts';
import { validateSKU } from '../utils/validation';
import * as ProductQueries from '../database/queries/products';

type AddProductRouteProp = RouteProp<RootStackParamList, 'AddProduct'>;

export const AddProductScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<AddProductRouteProp>();
    const { addProduct, updateProduct } = useProducts();
    const editId = route.params?.id;

    const [nameAr, setNameAr] = useState('');
    const [sku, setSku] = useState('');
    const [weight, setWeight] = useState('');
    const [weightUnit, setWeightUnit] = useState('g');
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (editId) {
            loadProductData(editId);
        }
    }, [editId]);

    const loadProductData = async (id: number) => {
        try {
            setLoading(true);
            const product = await ProductQueries.getAllProducts().then(list => list.find(p => p.id === id));
            if (product) {
                setNameAr(product.name_ar);
                setSku(product.sku);
                setWeight(product.weight_grams.toString());
                setIsActive(product.is_active === 1);
                navigation.setOptions({ title: 'تعديل منتج' });
            }
        } catch (error) {
            console.error(error);
            Alert.alert('خطأ', 'فشل تحميل بيانات المنتج');
        } finally {
            setLoading(false);
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!nameAr.trim()) newErrors.nameAr = 'اسم المنتج مطلوب';
        if (!sku.trim()) newErrors.sku = 'رمز SKU مطلوب';
        // if (!validateSKU(sku)) newErrors.sku = 'صيغة SKU غير صحيحة'; // Optional strict check
        if (!weight || isNaN(Number(weight)) || Number(weight) <= 0) newErrors.weight = 'الوزن يجب أن يكون رقماً صحيحاً';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        console.log('=== SAVE BUTTON CLICKED ===');
        console.log('Validation starting...');

        if (!validate()) {
            console.log('Validation failed');
            return;
        }

        console.log('Validation passed');
        setLoading(true);
        try {
            const weightInGrams = Number(weight); // Add unit conversion logic if needed later

            console.log('Data to save:', { nameAr, sku, weightInGrams, isActive, editId });

            if (editId) {
                console.log('Updating existing product...');
                await updateProduct(editId, {
                    name_ar: nameAr,
                    sku: sku.toUpperCase(),
                    weight_grams: weightInGrams,
                    is_active: isActive ? 1 : 0,
                });
                console.log('Update successful');
                Alert.alert(ArabicText.common.success, 'تم تعديل المنتج بنجاح');
            } else {
                console.log('Creating new product...');
                await addProduct({
                    name_ar: nameAr,
                    sku: sku.toUpperCase(),
                    weight_grams: weightInGrams,
                    is_active: isActive ? 1 : 0,
                });
                console.log('Create successful');
                Alert.alert(ArabicText.common.success, 'تم إضافة المنتج بنجاح');
            }
            navigation.goBack();
        } catch (error) {
            console.error('Save error:', error);
            Alert.alert(ArabicText.common.error, 'حدث خطأ أثناء الحفظ. تأكد من عدم تكرار SKU.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                <Input
                    label={ArabicText.products.name}
                    value={nameAr}
                    onChangeText={setNameAr}
                    error={errors.nameAr}
                    placeholder="مثال: عود تايقر 40 قرام"
                />

                <Input
                    label={ArabicText.products.sku}
                    value={sku}
                    onChangeText={setSku}
                    error={errors.sku}
                    placeholder="مثال: MALT-BK-TGR-40"
                    autoCapitalize="characters"
                />

                <View style={styles.row}>
                    <View style={{ flex: 2, marginLeft: Layout.spacing.md }}>
                        <Input
                            label={ArabicText.products.weight}
                            value={weight}
                            onChangeText={setWeight}
                            error={errors.weight}
                            keyboardType="numeric"
                            placeholder="40"
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Picker
                            label="الوحدة"
                            options={[
                                { label: 'جرام', value: 'g' },
                                { label: 'كيلو', value: 'kg' },
                                { label: 'وقية', value: 'oz' },
                            ]}
                            selectedValue={weightUnit}
                            onValueChange={setWeightUnit}
                        />
                    </View>
                </View>

                <View style={styles.switchContainer}>
                    <Text style={styles.switchLabel}>منتج نشط</Text>
                    <Switch
                        value={isActive}
                        onValueChange={setIsActive}
                        trackColor={{ false: '#767577', true: Colors.primary }}
                    />
                </View>

                <Button
                    title={ArabicText.common.save}
                    onPress={handleSave}
                    loading={loading}
                    style={styles.saveButton}
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
    card: {
        backgroundColor: Colors.surface,
        padding: Layout.spacing.lg,
        borderRadius: Layout.borderRadius.lg,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Layout.spacing.xl,
        marginTop: Layout.spacing.sm,
    },
    switchLabel: {
        fontSize: 16,
        color: Colors.text,
        fontWeight: '600',
    },
    saveButton: {
        marginTop: Layout.spacing.md,
    },
});
