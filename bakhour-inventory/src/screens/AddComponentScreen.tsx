import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { ArabicText } from '../constants/ArabicText';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Picker } from '../components/Picker';
import { useComponents } from '../hooks/useComponents';
import * as ComponentQueries from '../database/queries/components';

type AddComponentRouteProp = RouteProp<RootStackParamList, 'AddComponent'>;

export const AddComponentScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<AddComponentRouteProp>();
    const { createComponent, updateStock } = useComponents();
    const editId = route.params?.id;

    const [nameAr, setNameAr] = useState('');
    const [type, setType] = useState('علبة منتج');
    const [currentStock, setCurrentStock] = useState('');
    const [minStockAlert, setMinStockAlert] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (editId) {
            loadComponentData(editId);
        }
    }, [editId]);

    const loadComponentData = async (id: number) => {
        try {
            setLoading(true);
            const components = await ComponentQueries.getAllComponents();
            const component = components.find(c => c.id === id);
            if (component) {
                setNameAr(component.name_ar);
                setType(component.type);
                setCurrentStock(component.current_stock.toString());
                setMinStockAlert(component.min_stock_alert.toString());
                navigation.setOptions({ title: 'تعديل مكون' });
            }
        } catch (error) {
            console.error(error);
            Alert.alert('خطأ', 'فشل تحميل بيانات المكون');
        } finally {
            setLoading(false);
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!nameAr.trim()) newErrors.nameAr = 'اسم المكون مطلوب';
        if (!currentStock || isNaN(Number(currentStock)) || Number(currentStock) < 0) newErrors.currentStock = 'الكمية غير صحيحة';
        if (!minStockAlert || isNaN(Number(minStockAlert)) || Number(minStockAlert) < 0) newErrors.minStockAlert = 'حد التنبيه غير صحيح';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            const stock = parseInt(currentStock, 10);
            const minAlert = parseInt(minStockAlert, 10);

            if (editId) {
                // For editing, we might need a specific update function if we want to update name/type as well.
                // The current useComponents hook mainly exposes updateStock. 
                // We should probably add a generic updateComponent to the hook or queries if we want to edit names.
                // For now, let's assume we can update everything via a direct query or extended hook.
                // Since the hook only has updateStock, I'll use a direct query here for full update if needed, 
                // or just update stock if that's the limitation. 
                // Let's check ComponentQueries... it has updateComponentStock. 
                // I should probably add `updateComponent` to queries/components.ts if it doesn't exist.
                // Checking previous context... `components.ts` has `createComponent` and `updateComponentStock`.
                // It seems I missed a full `updateComponent` in Phase 1. I will implement a basic one here or just update stock.
                // For a robust app, I should add `updateComponent`. I'll do a quick fix here to use a direct SQL execution or add the function.
                // Actually, let's just update what we can.

                // Wait, I can't easily add a function to `components.ts` without editing it.
                // I will assume for now we just update stock via the hook, and maybe name via a new query function I'll add later if strictly needed.
                // But wait, the user expects to edit.
                // Let's check `components.ts` content again...
                // It has: getAllComponents, getComponentsByType, updateComponentStock, getLowStockComponents, createComponent.
                // It is missing `updateComponent`.
                // I will add `updateComponent` to `src/database/queries/components.ts` in a separate step if I can, or just handle it here.
                // For now, let's just create a new component if it's new, and for edit, we'll just update stock.
                // actually, I should fix this properly. I will add `updateComponent` to the query file.

                await ComponentQueries.updateComponent(editId, {
                    name_ar: nameAr,
                    type: type,
                    current_stock: stock,
                    min_stock_alert: minAlert
                });

                Alert.alert(ArabicText.common.success, 'تم تعديل المكون بنجاح');
            } else {
                await createComponent({
                    name_ar: nameAr,
                    type: type,
                    current_stock: stock,
                    min_stock_alert: minAlert,
                });
                Alert.alert(ArabicText.common.success, 'تم إضافة المكون بنجاح');
            }
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Alert.alert(ArabicText.common.error, 'حدث خطأ أثناء الحفظ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                <Input
                    label="اسم المكون"
                    value={nameAr}
                    onChangeText={setNameAr}
                    error={errors.nameAr}
                    placeholder="مثال: علبة مخمل"
                />

                <Picker
                    label="النوع"
                    options={[
                        { label: 'علبة منتج', value: 'علبة منتج' },
                        { label: 'كرتون شحن', value: 'كرتون شحن' },
                        { label: 'كيس', value: 'كيس' },
                        { label: 'ملصق', value: 'ملصق' },
                        { label: 'آخر', value: 'آخر' },
                    ]}
                    selectedValue={type}
                    onValueChange={setType}
                />

                <Input
                    label="المخزون الحالي"
                    value={currentStock}
                    onChangeText={setCurrentStock}
                    error={errors.currentStock}
                    keyboardType="numeric"
                    placeholder="0"
                />

                <Input
                    label="تنبيه انخفاض المخزون عند"
                    value={minStockAlert}
                    onChangeText={setMinStockAlert}
                    error={errors.minStockAlert}
                    keyboardType="numeric"
                    placeholder="10"
                />

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
    saveButton: {
        marginTop: Layout.spacing.md,
    },
});
