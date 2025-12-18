import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Switch, Text } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { ArabicText } from '../constants/ArabicText';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { createGiftCard, getGiftCardById, updateGiftCard } from '../database/queries/giftCards';
import { GiftCard } from '../types/database.types';

type AddGiftCardRouteProp = RouteProp<RootStackParamList, 'AddGiftCard'>;

export const AddGiftCardScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<AddGiftCardRouteProp>();
    const editId = route.params?.id;

    const [nameAr, setNameAr] = useState('');
    const [sku, setSku] = useState('');
    const [isSoldSeparately, setIsSoldSeparately] = useState(false);
    const [isBundled, setIsBundled] = useState(true);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (editId) {
            loadData(editId);
        }
    }, [editId]);

    const loadData = async (id: number) => {
        try {
            setLoading(true);
            const result = await getGiftCardById(id);
            if (result) {
                setNameAr(result.name_ar);
                setSku(result.sku);
                setIsSoldSeparately(result.is_sold_separately === 1);
                setIsBundled(result.is_bundled === 1);
                navigation.setOptions({ title: 'تعديل بطاقة' });
            }
        } catch (error) {
            console.error(error);
            Alert.alert('خطأ', 'فشل تحميل البيانات');
        } finally {
            setLoading(false);
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!nameAr.trim()) newErrors.nameAr = 'اسم البطاقة مطلوب';
        if (!sku.trim()) newErrors.sku = 'رمز SKU مطلوب';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            if (editId) {
                await updateGiftCard(editId, {
                    name_ar: nameAr,
                    sku: sku.toUpperCase(),
                    is_sold_separately: isSoldSeparately ? 1 : 0,
                    is_bundled: isBundled ? 1 : 0
                });
                Alert.alert(ArabicText.common.success, 'تم التعديل بنجاح');
            } else {
                await createGiftCard({
                    name_ar: nameAr,
                    sku: sku.toUpperCase(),
                    is_sold_separately: isSoldSeparately ? 1 : 0,
                    is_bundled: isBundled ? 1 : 0
                });
                Alert.alert(ArabicText.common.success, 'تمت الإضافة بنجاح');
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
                    label={ArabicText.giftCards.name}
                    value={nameAr}
                    onChangeText={setNameAr}
                    error={errors.nameAr}
                    placeholder="مثال: بطاقة تهنئة عامة"
                />

                <Input
                    label={ArabicText.giftCards.sku}
                    value={sku}
                    onChangeText={setSku}
                    error={errors.sku}
                    placeholder="مثال: GC-GEN-01"
                    autoCapitalize="characters"
                />

                <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>{ArabicText.giftCards.soldSeparately}</Text>
                    <Switch
                        value={isSoldSeparately}
                        onValueChange={setIsSoldSeparately}
                        trackColor={{ false: '#767577', true: Colors.primary }}
                    />
                </View>

                <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>{ArabicText.giftCards.bundled}</Text>
                    <Switch
                        value={isBundled}
                        onValueChange={setIsBundled}
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
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Layout.spacing.md,
        paddingVertical: Layout.spacing.xs,
    },
    switchLabel: {
        fontSize: 16,
        color: Colors.text,
    },
    saveButton: {
        marginTop: Layout.spacing.md,
    },
});
