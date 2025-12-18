import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/Card';

interface MenuItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress: () => void;
    color?: string;
}

const MenuItem = ({ icon, title, subtitle, onPress, color = Colors.primary }: MenuItemProps) => (
    <TouchableOpacity onPress={onPress} style={styles.menuItem}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon} size={24} color={color} />
        </View>
        <View style={styles.textContainer}>
            <Text style={styles.menuTitle}>{title}</Text>
            {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
        </View>
        <Ionicons name="chevron-back" size={20} color={Colors.textLight} />
    </TouchableOpacity>
);

export const ManageScreen = () => {
    const navigation = useNavigation<any>();

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>الإدارة</Text>
                <Text style={styles.headerSubtitle}>إعدادات النظام والمخزون</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>البيانات والأرشيف</Text>
                <Card style={styles.card}>
                    <MenuItem
                        icon="time"
                        title="سجل الطلبات"
                        subtitle="أرشيف الطلبات السابقة والمكتملة"
                        onPress={() => navigation.navigate('OrdersList')}
                    />
                    <View style={styles.divider} />
                    <MenuItem
                        icon="swap-vertical"
                        title="تحديث المخزون"
                        subtitle="الجرد اليدوي وتعديل الكميات"
                        onPress={() => navigation.navigate('BulkStockAdjustment')}
                    />
                </Card>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>تعريفات المخزون</Text>
                <Card style={styles.card}>
                    <MenuItem
                        icon="cube"
                        title="المنتجات والأطقم"
                        subtitle="إدارة المنتجات ومكوناتها"
                        onPress={() => navigation.navigate('ProductsList')}
                    />
                    <View style={styles.divider} />
                    <MenuItem
                        icon="layers"
                        title="المكونات الأولية"
                        subtitle="الخام، العلب، التغليف"
                        onPress={() => navigation.navigate('Components')}
                    />
                    <View style={styles.divider} />
                    <MenuItem
                        icon="gift"
                        title="العينات والهدايا"
                        subtitle="إدارة مخزون العينات وبطاقات الإهداء"
                        onPress={() => navigation.navigate('Samples')} // Or GiftCards if separate
                    />
                </Card>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>أدوات النظام</Text>
                <Card style={styles.card}>
                    <MenuItem
                        icon="download"
                        title="استيراد البيانات"
                        subtitle="إضافة طلبات من ملف خارجي"
                        onPress={() => navigation.navigate('ImportOrders')}
                    />
                    <View style={styles.divider} />
                    <MenuItem
                        icon="share"
                        title="تصدير البيانات"
                        subtitle="تصدير التقارير كملف Excel"
                        onPress={() => navigation.navigate('Export')}
                    />
                    <View style={styles.divider} />
                    <MenuItem
                        icon="settings"
                        title="الإعدادات العامة"
                        onPress={() => navigation.navigate('SettingsList')}
                        color={Colors.textLight}
                    />
                </Card>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        padding: Layout.spacing.md,
    },
    header: {
        marginTop: Layout.spacing.xl,
        marginBottom: Layout.spacing.lg,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.primary,
        textAlign: 'right',
    },
    headerSubtitle: {
        fontSize: 16,
        color: Colors.textLight,
        textAlign: 'right',
        marginTop: 4,
    },
    section: {
        marginBottom: Layout.spacing.xl,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: Layout.spacing.sm,
        textAlign: 'right',
        marginRight: 4,
    },
    card: {
        padding: 0,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 16,
    },
    textContainer: {
        flex: 1,
        alignItems: 'flex-start', // RTL: Align text
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
        textAlign: 'left',
    },
    menuSubtitle: {
        fontSize: 12,
        color: Colors.textLight,
        marginTop: 2,
        textAlign: 'left',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginLeft: 16,
    }
});
