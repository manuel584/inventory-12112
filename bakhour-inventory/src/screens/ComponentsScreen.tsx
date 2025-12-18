import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { ArabicText } from '../constants/ArabicText';
import { Input } from '../components/Input';
import { ListItem } from '../components/ListItem';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Badge } from '../components/Badge';
import { Ionicons } from '@expo/vector-icons';
import { useComponents } from '../hooks/useComponents';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ComponentsScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const { components, loading, loadComponents } = useComponents();
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredComponents, setFilteredComponents] = useState(components);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredComponents(components);
        } else {
            const lowerQuery = searchQuery.toLowerCase();
            setFilteredComponents(
                components.filter(
                    c => c.name_ar.toLowerCase().includes(lowerQuery)
                )
            );
        }
    }, [searchQuery, components]);

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity onPress={() => navigation.navigate('ManageStock' as any)} style={{ marginRight: 15 }}>
                        <Ionicons name="create-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('InventoryTable' as any)} style={{ marginRight: 15 }}>
                        <Ionicons name="grid-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('BulkStockAdjustment' as any)} style={{ marginRight: 15 }}>
                        <Ionicons name="layers-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('AddComponent', {} as any)}>
                        <Ionicons name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            ),
        });
    }, [navigation]);

    const renderItem = ({ item }: { item: typeof components[0] }) => {
        const isLowStock = item.current_stock <= item.min_stock_alert;

        return (
            <ListItem
                title={item.name_ar}
                subtitle={`الكمية المتوفرة: ${item.current_stock} ${item.unit} | الحد الأدنى: ${item.min_stock_alert} ${item.unit}`}
                rightIcon="chevron-back"
                onPress={() => navigation.navigate('ComponentDetail', { id: item.id })}
                badge={
                    isLowStock ? (
                        <Badge label="منخفض" variant="danger" size="small" />
                    ) : (
                        <Badge label={item.type} variant="info" size="small" />
                    )
                }
            />
        );
    };

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

            {loading && components.length === 0 ? (
                <LoadingSpinner />
            ) : (
                <FlatList
                    data={filteredComponents}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={loading} onRefresh={loadComponents} />
                    }
                    ListEmptyComponent={
                        <EmptyState
                            title="لا توجد مكونات"
                            subtitle="اضغط على + لإضافة مكون جديد"
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
});
