import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Ionicons } from '@expo/vector-icons';
import * as ComponentQueries from '../database/queries/components';
import * as PackingQueries from '../database/queries/packing';
import { Component } from '../types/database.types';

export const ManageComponentStockScreen = () => {
    const navigation = useNavigation();
    const [components, setComponents] = useState<Component[]>([]);
    const [loading, setLoading] = useState(true);
    const [adjustments, setAdjustments] = useState<Record<number, string>>({});

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await ComponentQueries.getAllComponents();
            setComponents(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdjustStock = (componentId: number, change: number, reason: string) => {
        Alert.alert(
            'تأكيد التعديل',
            `هل تريد ${change > 0 ? 'إضافة' : 'خصم'} ${Math.abs(change)} وحدة؟\nالسبب: ${reason}`,
            [
                { text: 'إلغاء', style: 'cancel' },
                {
                    text: 'تأكيد',
                    onPress: async () => {
                        try {
                            await PackingQueries.adjustComponentStock(componentId, change, reason);
                            Alert.alert('نجح', 'تم تحديث المخزون');
                            loadData();
                            setAdjustments({});
                        } catch (error) {
                            console.error(error);
                            Alert.alert('خطأ', 'فشل تحديث المخزون');
                        }
                    },
                },
            ]
        );
    };

    const quickAdjust = (componentId: number, amount: number) => {
        const reason = amount > 0 ? 'إضافة يدوية' : 'خصم يدوي';
        handleAdjustStock(componentId, amount, reason);
    };

    const customAdjust = (component: Component) => {
        const value = adjustments[component.id];
        if (!value || value.trim() === '') {
            Alert.alert('خطأ', 'أدخل الكمية أولاً');
            return;
        }

        const change = parseInt(value);
        if (isNaN(change) || change === 0) {
            Alert.alert('خطأ', 'أدخل رقم صحيح');
            return;
        }

        handleAdjustStock(component.id, change, change > 0 ? 'إضافة مخصصة' : 'خصم مخصص');
    };

    const renderItem = ({ item }: { item: Component }) => {
        const isLow = item.current_stock <= item.min_stock_alert;

        return (
            <Card style={styles.itemCard}>
                <View style={styles.itemHeader}>
                    <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{item.name_ar}</Text>
                        <Text style={styles.itemType}>{item.type}</Text>
                    </View>
                    <View style={styles.stockBadge}>
                        <Text style={[styles.stockText, isLow && styles.lowStock]}>
                            {item.current_stock}
                        </Text>
                        <Text style={styles.stockLabel}>وحدة</Text>
                    </View>
                </View>

                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={styles.quickButton}
                        onPress={() => quickAdjust(item.id, -10)}
                    >
                        <Ionicons name="remove-circle" size={24} color={Colors.danger} />
                        <Text style={styles.quickText}>-10</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickButton}
                        onPress={() => quickAdjust(item.id, -1)}
                    >
                        <Ionicons name="remove" size={20} color={Colors.danger} />
                        <Text style={styles.quickText}>-1</Text>
                    </TouchableOpacity>

                    <View style={styles.customInput}>
                        <Input
                            value={adjustments[item.id] || ''}
                            onChangeText={(text) =>
                                setAdjustments({ ...adjustments, [item.id]: text })
                            }
                            keyboardType="numeric"
                            placeholder="0"
                            style={styles.inputField}
                        />
                        <TouchableOpacity
                            style={styles.applyButton}
                            onPress={() => customAdjust(item)}
                        >
                            <Ionicons name="checkmark" size={20} color={Colors.success} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.quickButton}
                        onPress={() => quickAdjust(item.id, 1)}
                    >
                        <Ionicons name="add" size={20} color={Colors.success} />
                        <Text style={styles.quickText}>+1</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickButton}
                        onPress={() => quickAdjust(item.id, 10)}
                    >
                        <Ionicons name="add-circle" size={24} color={Colors.success} />
                        <Text style={styles.quickText}>+10</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.minStock}>الحد الأدنى: {item.min_stock_alert}</Text>
            </Card>
        );
    };

    if (loading) return <LoadingSpinner fullScreen />;

    return (
        <View style={styles.container}>
            <Card style={styles.infoCard}>
                <Text style={styles.infoTitle}>إدارة كميات المخزون</Text>
                <Text style={styles.infoText}>
                    يمكنك إضافة أو خصم الكميات باستخدام الأزرار السريعة أو إدخال رقم مخصص
                </Text>
            </Card>

            <FlatList
                data={components}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>لا توجد مكونات</Text>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        padding: Layout.spacing.md,
    },
    infoCard: {
        marginBottom: Layout.spacing.md,
        padding: Layout.spacing.md,
        backgroundColor: '#EBF8FF',
        borderLeftWidth: 4,
        borderLeftColor: Colors.info,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 4,
        textAlign: 'right',
    },
    infoText: {
        fontSize: 13,
        color: Colors.textLight,
        textAlign: 'right',
    },
    list: {
        paddingBottom: Layout.spacing.lg,
    },
    itemCard: {
        marginBottom: Layout.spacing.md,
        padding: Layout.spacing.md,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Layout.spacing.md,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
        textAlign: 'right',
    },
    itemType: {
        fontSize: 13,
        color: Colors.textLight,
        textAlign: 'right',
    },
    stockBadge: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: Layout.borderRadius.md,
        alignItems: 'center',
    },
    stockText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    lowStock: {
        color: '#FED7D7',
    },
    stockLabel: {
        fontSize: 11,
        color: '#fff',
        marginTop: 2,
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 8,
        marginBottom: Layout.spacing.sm,
    },
    quickButton: {
        alignItems: 'center',
        padding: 4,
    },
    quickText: {
        fontSize: 11,
        color: Colors.text,
        marginTop: 2,
    },
    customInput: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    inputField: {
        flex: 1,
        marginBottom: 0,
        textAlign: 'center',
    },
    applyButton: {
        backgroundColor: Colors.success,
        padding: 8,
        borderRadius: Layout.borderRadius.sm,
    },
    minStock: {
        fontSize: 12,
        color: Colors.textLight,
        textAlign: 'right',
        marginTop: 4,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: Layout.spacing.xl,
        fontSize: 16,
        color: Colors.textLight,
    },
});
