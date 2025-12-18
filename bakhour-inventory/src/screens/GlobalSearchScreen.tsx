import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { ArabicText } from '../constants/ArabicText';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ListItem } from '../components/ListItem';
import { db } from '../database/init';
import { Product, Component } from '../types/database.types';

type SearchResult =
    | { type: 'product'; data: Product }
    | { type: 'component'; data: Component }
    | { type: 'order'; data: any };

export const GlobalSearchScreen = () => {
    const navigation = useNavigation<any>();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (query.trim().length > 1) {
            search(query);
        } else {
            setResults([]);
        }
    }, [query]);

    const search = async (text: string) => {
        setLoading(true);
        try {
            const searchTerm = `%${text}%`;

            // Search Products
            const products = await db.getAllAsync(
                'SELECT * FROM products WHERE name_ar LIKE ? OR sku LIKE ? LIMIT 5',
                [searchTerm, searchTerm]
            ) as Product[];

            // Search Components
            const components = await db.getAllAsync(
                'SELECT * FROM components WHERE name_ar LIKE ? OR sku LIKE ? LIMIT 5',
                [searchTerm, searchTerm]
            ) as Component[];

            // Search Orders
            const orders = await db.getAllAsync(
                'SELECT * FROM orders WHERE order_number LIKE ? OR customer_name LIKE ? LIMIT 5',
                [searchTerm, searchTerm]
            ) as any[];

            const combinedResults: SearchResult[] = [
                ...products.map(p => ({ type: 'product' as const, data: p })),
                ...components.map(c => ({ type: 'component' as const, data: c })),
                ...orders.map(o => ({ type: 'order' as const, data: o })),
            ];

            setResults(combinedResults);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: SearchResult }) => {
        switch (item.type) {
            case 'product':
                return (
                    <ListItem
                        title={item.data.name_ar}
                        subtitle={`منتج | ${item.data.sku}`}
                        leftIcon="cube-outline"
                        onPress={() => navigation.navigate('ProductDetail', { id: item.data.id })}
                    />
                );
            case 'component':
                return (
                    <ListItem
                        title={item.data.name_ar}
                        subtitle={`مكون | ${item.data.sku || '-'}`}
                        leftIcon="layers-outline"
                        onPress={() => navigation.navigate('ComponentDetail', { id: item.data.id })}
                    />
                );
            case 'order':
                return (
                    <ListItem
                        title={`طلب #${item.data.order_number}`}
                        subtitle={`العميل: ${item.data.customer_name || 'غير معروف'}`}
                        leftIcon="document-text-outline"
                        onPress={() => navigation.navigate('OrderDetail', { id: item.data.id })}
                    />
                );
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color={Colors.textLight} />
                    <TextInput
                        style={styles.input}
                        placeholder="بحث عن منتج، مكون، أو طلب..."
                        value={query}
                        onChangeText={setQuery}
                        autoFocus
                        placeholderTextColor={Colors.textLight}
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery('')}>
                            <Ionicons name="close-circle" size={20} color={Colors.textLight} />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelButton}>{ArabicText.common.cancel}</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <LoadingSpinner />
            ) : (
                <FlatList
                    data={results}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => `${item.type}-${index}`}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        query.length > 1 ? (
                            <Text style={styles.emptyText}>لا توجد نتائج</Text>
                        ) : null
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingTop: 50, // For status bar
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Layout.spacing.md,
        gap: Layout.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.surface,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        paddingHorizontal: Layout.spacing.md,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: Colors.text,
        textAlign: 'right',
    },
    cancelButton: {
        color: Colors.primary,
        fontSize: 16,
        fontWeight: '600',
    },
    list: {
        padding: Layout.spacing.md,
    },
    emptyText: {
        textAlign: 'center',
        color: Colors.textLight,
        marginTop: Layout.spacing.xl,
    },
});
