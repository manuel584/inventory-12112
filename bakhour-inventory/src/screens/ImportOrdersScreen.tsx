import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { ArabicText } from '../constants/ArabicText';
import { parseOrderCSV, importOrdersToDatabase } from '../services/csvImport';
import { useNavigation } from '@react-navigation/native';

export const ImportOrdersScreen = () => {
    const navigation = useNavigation();
    const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['text/csv', 'application/vnd.ms-excel', 'text/comma-separated-values'],
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            setFile(result.assets[0]);
            setLogs([]);
        } catch (err) {
            console.error(err);
        }
    };

    const handleImport = async () => {
        if (!file) return;

        setLoading(true);
        setLogs(['Reading file...']);

        try {
            const { orders, errors: parseErrors } = await parseOrderCSV(file.uri);

            if (parseErrors.length > 0) {
                setLogs(prev => [...prev, ...parseErrors]);
                if (orders.length === 0) {
                    setLoading(false);
                    return;
                }
            }

            setLogs(prev => [...prev, `Found ${orders.length} orders. Importing...`]);

            const result = await importOrdersToDatabase(orders);

            setLogs(prev => [
                ...prev,
                `Import Completed.`,
                `Success: ${result.successCount}`,
                `Failed: ${result.errorCount}`,
                ...result.errors
            ]);

            if (result.successCount > 0) {
                Alert.alert(ArabicText.common.success, `تم استيراد ${result.successCount} طلب بنجاح`);
                // Optional: Navigate back after delay
                // setTimeout(() => navigation.goBack(), 2000);
            }

        } catch (error) {
            setLogs(prev => [...prev, `Critical Error: ${(error as Error).message}`]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>{ArabicText.orders.import}</Text>

                <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
                    <Text style={styles.uploadButtonText}>
                        {file ? file.name : 'اختر ملف CSV'}
                    </Text>
                </TouchableOpacity>

                {file && (
                    <TouchableOpacity
                        style={[styles.importButton, loading && styles.disabledButton]}
                        onPress={handleImport}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.importButtonText}>استيراد</Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView style={styles.logsContainer}>
                {logs.map((log, index) => (
                    <Text key={index} style={styles.logText}>{log}</Text>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: Layout.spacing.md,
        backgroundColor: Colors.background,
    },
    card: {
        backgroundColor: Colors.surface,
        padding: Layout.spacing.lg,
        borderRadius: Layout.borderRadius.lg,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: Layout.spacing.lg,
        color: Colors.text,
    },
    uploadButton: {
        borderWidth: 2,
        borderColor: Colors.primary,
        borderStyle: 'dashed',
        padding: Layout.spacing.xl,
        borderRadius: Layout.borderRadius.md,
        width: '100%',
        alignItems: 'center',
        marginBottom: Layout.spacing.lg,
    },
    uploadButtonText: {
        color: Colors.primary,
        fontSize: 16,
    },
    importButton: {
        backgroundColor: Colors.primary,
        paddingVertical: Layout.spacing.md,
        paddingHorizontal: Layout.spacing.xl,
        borderRadius: Layout.borderRadius.md,
        width: '100%',
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.7,
    },
    importButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    logsContainer: {
        marginTop: Layout.spacing.lg,
        flex: 1,
    },
    logText: {
        marginBottom: Layout.spacing.xs,
        color: Colors.textLight,
        textAlign: 'left', // Logs usually read better LTR or aligned start
    },
});
