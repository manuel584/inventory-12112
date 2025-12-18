import React from 'react';
import { View, StyleSheet, Text, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { ArabicText } from '../constants/ArabicText';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ListItem } from '../components/ListItem';
import { resetDatabase } from '../database/management';
import { useTheme } from '../contexts/ThemeContext';
import { Switch } from 'react-native';
import * as BackupService from '../services/backupService';
// Mock Updates for web compatibility
const Updates = {
    reloadAsync: async () => {
        // @ts-ignore
        if (typeof window !== 'undefined') window.location.reload();
    }
};

export const SettingsScreen = () => {
    const navigation = useNavigation();
    const { theme, toggleTheme } = useTheme();
    const handleResetDatabase = () => {
        Alert.alert(
            'تصفير قاعدة البيانات',
            'تحذير: سيتم حذف جميع البيانات (المنتجات، الطلبات، المخزون) ولا يمكن استرجاعها. هل أنت متأكد؟',
            [
                { text: ArabicText.common.cancel, style: 'cancel' },
                {
                    text: 'نعم، حذف الكل',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Drop all tables
                            await resetDatabase();

                            Alert.alert(
                                'تمت العملية',
                                'تم حذف البيانات بنجاح. سيتم إعادة تشغيل التطبيق.',
                                [{
                                    text: 'حسناً',
                                    onPress: async () => {
                                        try {
                                            if (Updates.reloadAsync) {
                                                await Updates.reloadAsync();
                                            } else {
                                                // Fallback for web or dev client
                                                console.log('Reloading app...');
                                            }
                                        } catch (e) {
                                            console.log('Reload not supported');
                                        }
                                    }
                                }]
                            );
                        } catch (error) {
                            console.error(error);
                            Alert.alert(ArabicText.common.error, 'فشل تصفير قاعدة البيانات');
                        }
                    },
                },
            ]
        );
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.sectionTitle}>معلومات التطبيق</Text>
            <Card style={styles.card}>
                <ListItem title="الإصدار" subtitle="1.0.0" />
                <ListItem title="بناء" subtitle="Expo SDK 52" />
            </Card>

            <Card style={styles.card}>
                <Button
                    title="تقرير المخزون الشامل"
                    onPress={() => navigation.navigate('InventoryReport' as any)}
                    variant="secondary"
                    style={styles.reportButton}
                />
                <Button
                    title="الإحصائيات"
                    onPress={() => navigation.navigate('Analytics' as any)}
                    variant="secondary"
                    style={styles.reportButton}
                />
                <Button
                    title={ArabicText.dashboard.exportExcel}
                    onPress={() => navigation.navigate('Export' as any)}
                    variant="secondary"
                    style={styles.reportButton}
                />
            </Card>

            <Text style={styles.sectionTitle}>المظهر</Text>
            <Card style={styles.card}>
                <View style={styles.toggleRow}>
                    <Switch
                        value={theme === 'dark'}
                        onValueChange={toggleTheme}
                        trackColor={{ false: '#CBD5E0', true: Colors.primary }}
                    />
                    <View style={styles.toggleTextContainer}>
                        <Text style={styles.toggleTitle}>الوضع الليلي</Text>
                        <Text style={styles.toggleSubtitle}>Dark Mode</Text>
                    </View>
                </View>
            </Card>

            <Text style={styles.sectionTitle}>النسخ الاحتياطي</Text>
            <Card style={styles.card}>
                <Button
                    title="حفظ نسخة احتياطية"
                    onPress={async () => {
                        try {
                            await BackupService.exportDatabase();
                        } catch (error) {
                            Alert.alert('خطأ', 'فشل إنشاء النسخة الاحتياطية');
                        }
                    }}
                    variant="primary"
                    style={styles.backupButton}
                />
                <Button
                    title="استعادة نسخة احتياطية"
                    onPress={() => {
                        Alert.alert(
                            'تحذير',
                            'سيتم استبدال جميع البيانات الحالية بالنسخة الاحتياطية. هل أنت متأكد؟',
                            [
                                { text: 'إلغاء', style: 'cancel' },
                                {
                                    text: 'استعادة',
                                    style: 'destructive',
                                    onPress: async () => {
                                        try {
                                            await BackupService.importDatabase();
                                            // Reload app after import
                                            if (Updates.reloadAsync) {
                                                await Updates.reloadAsync();
                                            }
                                        } catch (error) {
                                            Alert.alert('خطأ', 'فشل استعادة النسخة الاحتياطية');
                                        }
                                    },
                                },
                            ]
                        );
                    }}
                    variant="secondary"
                    style={styles.backupButton}
                />
                <Text style={styles.infoText}>
                    احفظ نسخة احتياطية من بياناتك بانتظام لحمايتها من الفقدان.
                </Text>
            </Card>

            <Text style={styles.sectionTitle}>إدارة البيانات</Text>
            <Card style={styles.card}>
                <Button
                    title="تصفير قاعدة البيانات"
                    onPress={handleResetDatabase}
                    variant="danger"
                    style={styles.dangerButton}
                />
                <Text style={styles.warningText}>
                    تنبيه: هذا الإجراء سيقوم بحذف جميع البيانات المسجلة في التطبيق بشكل نهائي.
                </Text>
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
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: Layout.spacing.md,
        marginTop: Layout.spacing.md,
        textAlign: 'right',
    },
    card: {
        padding: 0,
        overflow: 'hidden',
    },
    dangerButton: {
        margin: Layout.spacing.md,
    },
    warningText: {
        color: Colors.danger,
        fontSize: 12,
        textAlign: 'center',
        marginBottom: Layout.spacing.md,
        paddingHorizontal: Layout.spacing.md,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Layout.spacing.md,
        paddingVertical: Layout.spacing.md,
    },
    toggleTextContainer: {
        flex: 1,
        marginRight: Layout.spacing.md,
    },
    toggleTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        textAlign: 'right',
    },
    toggleSubtitle: {
        fontSize: 12,
        color: Colors.textLight,
        marginTop: 2,
        textAlign: 'right',
    },
    reportButton: {
        margin: Layout.spacing.md,
    },
    backupButton: {
        margin: Layout.spacing.md,
    },
    infoText: {
        color: Colors.textLight,
        fontSize: 12,
        textAlign: 'center',
        marginBottom: Layout.spacing.md,
        marginHorizontal: Layout.spacing.md,
    },
});
