import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { ArabicText } from '../constants/ArabicText';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';
import * as TemplateQueries from '../database/queries/templates';
import { OrderTemplate } from '../database/queries/templates';

export const OrderTemplatesScreen = () => {
    const navigation = useNavigation<any>();
    const [templates, setTemplates] = useState<OrderTemplate[]>([]);
    const [loading, setLoading] = useState(true);

    const loadTemplates = useCallback(async () => {
        try {
            setLoading(true);
            const data = await TemplateQueries.getAllTemplates();
            setTemplates(data);
        } catch (error) {
            console.error(error);
            Alert.alert(ArabicText.common.error, 'فشل تحميل القوالب');
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadTemplates();
        }, [loadTemplates])
    );

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    onPress={() => navigation.navigate('CreateTemplate')}
                    style={{ marginRight: 10 }}
                >
                    <Ionicons name="add-circle" size={28} color="#fff" />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    const handleDeleteTemplate = async (id: number, name: string) => {
        Alert.alert(
            'حذف القالب',
            `هل تريد حذف قالب "${name}"؟`,
            [
                { text: ArabicText.common.cancel, style: 'cancel' },
                {
                    text: ArabicText.common.delete,
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await TemplateQueries.deleteTemplate(id);
                            await loadTemplates();
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

    const handleApplyTemplate = (template: OrderTemplate) => {
        navigation.navigate('AddOrder', { templateId: template.id });
    };

    const renderTemplate = ({ item }: { item: OrderTemplate }) => {
        const products = JSON.parse(item.products_json || '[]');
        const productCount = products.length;

        return (
            <Card style={styles.templateCard}>
                <View style={styles.templateHeader}>
                    <Text style={styles.templateName}>{item.name}</Text>
                    <TouchableOpacity onPress={() => handleDeleteTemplate(item.id, item.name)}>
                        <Ionicons name="trash-outline" size={20} color={Colors.danger} />
                    </TouchableOpacity>
                </View>
                <Text style={styles.productCount}>
                    {productCount} {productCount === 1 ? 'منتج' : 'منتجات'}
                </Text>
                <View style={styles.templateActions}>
                    <Button
                        title={ArabicText.templates.applyTemplate}
                        onPress={() => handleApplyTemplate(item)}
                        variant="primary"
                        style={styles.actionButton}
                    />
                    <Button
                        title={ArabicText.common.edit}
                        onPress={() => navigation.navigate('CreateTemplate', { id: item.id })}
                        variant="outline"
                        style={styles.actionButton}
                    />
                </View>
            </Card>
        );
    };

    if (loading) return <LoadingSpinner fullScreen />;

    return (
        <View style={styles.container}>
            {templates.length === 0 ? (
                <Card style={styles.emptyCard}>
                    <Ionicons name="document-text-outline" size={64} color={Colors.textLight} />
                    <Text style={styles.emptyText}>{ArabicText.templates.noTemplates}</Text>
                    <Text style={styles.emptyHint}>
                        اضغط على + لإنشاء قالب جديد
                    </Text>
                </Card>
            ) : (
                <FlatList
                    data={templates}
                    renderItem={renderTemplate}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        padding: Layout.spacing.md,
    },
    listContent: {
        paddingBottom: Layout.spacing.lg,
    },
    templateCard: {
        marginBottom: Layout.spacing.md,
        padding: Layout.spacing.lg,
    },
    templateHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Layout.spacing.sm,
    },
    templateName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        flex: 1,
    },
    productCount: {
        fontSize: 14,
        color: Colors.textLight,
        marginBottom: Layout.spacing.md,
    },
    templateActions: {
        flexDirection: 'row',
        gap: Layout.spacing.sm,
    },
    actionButton: {
        flex: 1,
    },
    emptyCard: {
        padding: Layout.spacing.xl * 2,
        alignItems: 'center',
        marginTop: Layout.spacing.xl,
    },
    emptyText: {
        fontSize: 16,
        color: Colors.textLight,
        marginTop: Layout.spacing.lg,
        marginBottom: Layout.spacing.sm,
        textAlign: 'center',
    },
    emptyHint: {
        fontSize: 14,
        color: Colors.textLight,
        textAlign: 'center',
    },
});
