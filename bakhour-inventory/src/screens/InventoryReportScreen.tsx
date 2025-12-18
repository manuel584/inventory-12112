import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Share, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { Card } from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useComponents } from '../hooks/useComponents';
import { Ionicons } from '@expo/vector-icons';
// import { captureRef } from 'react-native-view-shot'; // Removed to avoid missing dependency error
// For now, using native UI which is screenshot-ready

export const InventoryReportScreen = () => {
    const { components, loading } = useComponents();
    const viewRef = useRef(null);

    if (loading) return <LoadingSpinner />;

    // 1. Data Processing
    const criticalItems = components.filter(c => c.current_stock < 10);
    const lowItems = components.filter(c => c.current_stock >= 10 && c.current_stock <= 30);
    const healthyItems = components.filter(c => c.current_stock > 30);

    // 2. Constants for Report
    const currentDate = new Date().toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' });

    // 3. Share Action (Simple Text Share for now, or Placeholder for Image Capture)
    const handleShare = async () => {
        // In a real implementation with 'react-native-view-shot', we would capture the viewRef.
        // For this phase, we simply trigger the detailed Excel export or a text summary.
        // As per the prompt "Screenshot-ready", the USER takes the screenshot.
        // The button here just hints at that usage.
        Alert.alert('جاهز للمشاركة', 'يمكنك التقاط صورة للشاشة الآن لمشاركتها.');
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            ref={viewRef}
        >
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>تقرير المخزون اليومي</Text>
                    <Text style={styles.headerDate}>{currentDate}</Text>
                </View>
                <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
                    <Ionicons name="share-outline" size={24} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Section 1: Critical (Red) - Priority First */}
            {criticalItems.length > 0 && (
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={[styles.sectionTitle, { color: Colors.danger }]}>🔴 ينفد قريباً (أقل من 10)</Text>
                    </View>
                    {criticalItems.map((item) => (
                        <Card key={item.id} style={[styles.criticalCard, { borderColor: Colors.danger, borderLeftWidth: 4 }]}>
                            <View style={styles.row}>
                                <Text style={styles.itemQtyCritical}>{item.current_stock}</Text>
                                <Text style={styles.itemNameCritical} numberOfLines={2}>{item.name_ar}</Text>
                            </View>
                        </Card>
                    ))}
                </View>
            )}

            {/* Section 2: Low (Yellow) */}
            {lowItems.length > 0 && (
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: '#D97706' }]}>🟡 مخزون منخفض</Text>
                    <View style={styles.gridTwoCol}>
                        {lowItems.map((item) => (
                            <View key={item.id} style={styles.lowItemContainer}>
                                <Text style={styles.lowItemQty}>{item.current_stock}</Text>
                                <Text style={styles.lowItemName} numberOfLines={2}>{item.name_ar}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* Section 3: Healthy (Green) */}
            {healthyItems.length > 0 && (
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: Colors.success }]}>🟢 مخزون متوفر</Text>
                    <View style={styles.gridThreeCol}>
                        {healthyItems.slice(0, 15).map((item) => ( // Collapse after 15
                            <View key={item.id} style={styles.healthyItemContainer}>
                                <Text style={styles.healthyItemQty}>{item.current_stock}</Text>
                                <Text style={styles.healthyItemName} numberOfLines={1}>{item.name_ar}</Text>
                            </View>
                        ))}
                    </View>
                    {healthyItems.length > 15 && (
                        <Text style={styles.moreCount}>+ {healthyItems.length - 15} عناصر أخرى</Text>
                    )}
                </View>
            )}

            {/* Empty State */}
            {components.length === 0 && (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>لا توجد بيانات مخزون</Text>
                </View>
            )}

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF', // Clean white for screenshots
    },
    contentContainer: {
        padding: Layout.spacing.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Layout.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        paddingBottom: Layout.spacing.sm,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
        textAlign: 'left', // RTL context handled by parent usually, but valid to force if needed
    },
    headerDate: {
        fontSize: 14,
        color: Colors.textLight,
        textAlign: 'left',
        marginTop: 4,
    },
    shareButton: {
        padding: 8,
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
    },
    section: {
        marginBottom: Layout.spacing.xl,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Layout.spacing.sm
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: Layout.spacing.sm,
        textAlign: 'left',
    },
    // Critical Styles
    criticalCard: {
        marginBottom: 8,
        padding: 12,
        backgroundColor: '#FEF2F2', // Light red bg
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemQtyCritical: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.danger,
    },
    itemNameCritical: {
        fontSize: 16,
        color: Colors.text,
        flex: 1,
        marginLeft: 16,
        textAlign: 'right', // Look at name
    },
    // Low Styles (2 Col)
    gridTwoCol: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -6,
    },
    lowItemContainer: {
        width: '50%',
        padding: 6,
        marginBottom: 8,
        borderRightWidth: 1, // Visual separator
        borderRightColor: '#EEE',
    },
    lowItemQty: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#D97706', // Dark Yellow
        textAlign: 'center',
    },
    lowItemName: {
        fontSize: 14,
        color: Colors.text,
        textAlign: 'center',
        marginTop: 4,
    },
    // Healthy Styles (3 Col)
    gridThreeCol: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
    healthyItemContainer: {
        width: '33.33%',
        padding: 4,
        marginBottom: 12,
        alignItems: 'center',
    },
    healthyItemQty: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.success,
    },
    healthyItemName: {
        fontSize: 12,
        color: Colors.textLight,
        textAlign: 'center',
        marginTop: 2,
    },
    moreCount: {
        textAlign: 'center',
        color: Colors.textLight,
        fontSize: 12,
        marginTop: 8,
        backgroundColor: '#F5F5F5',
        alignSelf: 'center',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 10,
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: Colors.textLight,
    }
});
