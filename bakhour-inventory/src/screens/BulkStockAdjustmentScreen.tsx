import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { ArabicText } from '../constants/ArabicText';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useComponents } from '../hooks/useComponents';

export const BulkStockAdjustmentScreen = () => {
    const navigation = useNavigation();
    const { components, loading, updateStock } = useComponents();
    const [adjustments, setAdjustments] = useState<Record<number, string>>({});
    const [saving, setSaving] = useState(false);

    const handleAdjustmentChange = (id: number, value: string) => {
        setAdjustments(prev => ({ ...prev, [id]: value }));
    };

    const handleSave = async () => {
        const updates = Object.entries(adjustments)
            .filter(([_, value]) => value && !isNaN(Number(value)) && Number(value) !== 0)
            .map(([id, value]) => ({
                id: Number(id),
                change: Number(value)
            }));

        if (updates.length === 0) {
            Alert.alert('تنبيه', 'لا توجد تغييرات للحفظ');
            return;
        }

        setSaving(true);
        try {
            for (const update of updates) {
                const component = components.find(c => c.id === update.id);
                if (component) {
                    const newStock = component.current_stock + update.change;
                    if (newStock < 0) {
                        Alert.alert('خطأ', `المخزون لا يمكن أن يكون سالباً لـ ${component.name_ar}`);
                        setSaving(false);
                        return;
                    }
                    await updateStock(update.id, newStock);
                }
            }
            Alert.alert(ArabicText.common.success, 'تم تحديث المخزون بنجاح');
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Alert.alert(ArabicText.common.error, 'حدث خطأ أثناء الحفظ');
        } finally {
            setSaving(false);
        }
    };

    const renderItem = ({ item }: { item: typeof components[0] }) => (
        <Card style={styles.itemCard}>
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name_ar}</Text>
                <Text style={styles.itemStock}>الحالي: {item.current_stock}</Text>
            </View>
            <View style={styles.inputContainer}>
                <Input
                    placeholder="+/-"
                    value={adjustments[item.id] || ''}
                    onChangeText={(text) => handleAdjustmentChange(item.id, text)}
                    keyboardType="numeric"
                    style={styles.input}
                />
            </View>
        </Card>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            {loading ? (
                <LoadingSpinner />
            ) : (
                <FlatList
                    data={components}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                />
            )}

            <View style={styles.footer}>
                <Button
                    title="حفظ التغييرات"
                    onPress={handleSave}
                    loading={saving}
                />
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    listContent: {
        padding: Layout.spacing.md,
        paddingBottom: 100,
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Layout.spacing.sm,
    },
    itemInfo: {
        flex: 2,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        textAlign: 'right',
    },
    itemStock: {
        fontSize: 12,
        color: Colors.textLight,
        textAlign: 'right',
    },
    inputContainer: {
        flex: 1,
        maxWidth: 100,
    },
    input: {
        textAlign: 'center',
        marginBottom: 0,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.surface,
        padding: Layout.spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
});
