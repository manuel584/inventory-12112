import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { ArabicText } from '../constants/ArabicText';
import { Input } from '../components/Input';
import { ListItem } from '../components/ListItem';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Ionicons } from '@expo/vector-icons';
import { useProducts } from '../hooks/useProducts';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ProductsScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const { products, loading, loadProducts } = useProducts();
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredProducts, setFilteredProducts] = useState(products);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredProducts(products);
        } else {
            const lowerQuery = searchQuery.toLowerCase();
            setFilteredProducts(
                products.filter(
                    p =>
                        p.name_ar.toLowerCase().includes(lowerQuery) ||
                        p.sku.toLowerCase().includes(lowerQuery)
                )
            );
        }
    }, [searchQuery, products]);

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginRight: 10 }}>
                    <TouchableOpacity onPress={() => navigation.navigate('GlobalSearch')}>
                        <Ionicons name="search" size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            console.log('Add Product button pressed');
                            navigation.navigate('AddProduct', {});
                        }}
                    >
                        <Ionicons name="add" size={28} color="#fff" />
                    </TouchableOpacity>
                </View>
            ),
        });
    }, [navigation]);

    const renderItem = ({ item }: { item: typeof products[0] }) => (
        <ListItem
            title={item.name_ar}
            subtitle={item.sku}
            rightIcon="chevron-back" // RTL arrow
            onPress={() => navigation.navigate('ProductDetail', { id: item.id })}
            badge={
                <View style={styles.weightBadge}>
                    <Text style={styles.weightText}>{item.weight_grams}g</Text>
                </View>
            }
        />
    );

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <Input
                    placeholder={ArabicText.common.search}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={styles.searchInput}
                />
            </View>

            {loading && products.length === 0 ? (
                <LoadingSpinner />
            ) : (
                <FlatList
                    data={filteredProducts}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={loading} onRefresh={loadProducts} />
                    }
                    ListEmptyComponent={
                        <EmptyState
                            title="لا توجد منتجات"
                            subtitle="اضغط على + لإضافة منتج جديد"
                            icon="cube-outline"
                        />
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
    },
    searchContainer: {
        padding: Layout.spacing.md,
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    searchInput: {
        marginBottom: 0,
    },
    listContent: {
        flexGrow: 1,
    },
    weightBadge: {
        backgroundColor: Colors.background,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    weightText: {
        fontSize: 12,
        color: Colors.textLight,
    },
});
