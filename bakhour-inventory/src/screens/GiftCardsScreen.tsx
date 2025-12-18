import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Text } from 'react-native';
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
import { Badge } from '../components/Badge';
import { Ionicons } from '@expo/vector-icons';
import { getAllGiftCards } from '../database/queries/giftCards';
import { GiftCard } from '../types/database.types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const GiftCardsScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredCards, setFilteredCards] = useState<GiftCard[]>([]);

    const loadGiftCards = async () => {
        try {
            setLoading(true);
            const data = await getAllGiftCards();
            setGiftCards(data);
            setFilteredCards(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadGiftCards();
        }, [])
    );

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={() => navigation.navigate('AddGiftCard', {})}>
                    <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    React.useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredCards(giftCards);
        } else {
            const lowerQuery = searchQuery.toLowerCase();
            setFilteredCards(
                giftCards.filter(
                    c =>
                        c.name_ar.toLowerCase().includes(lowerQuery) ||
                        c.sku.toLowerCase().includes(lowerQuery)
                )
            );
        }
    }, [searchQuery, giftCards]);

    const renderItem = ({ item }: { item: GiftCard }) => (
        <ListItem
            title={item.name_ar}
            subtitle={item.sku}
            rightIcon="chevron-back"
            onPress={() => navigation.navigate('AddGiftCard', { id: item.id })}
            badge={
                <View style={styles.badgeContainer}>
                    {item.is_sold_separately === 1 && <Badge label="للبيع" variant="success" size="small" />}
                    {item.is_bundled === 1 && <Badge label="مرفق" variant="info" size="small" />}
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

            {loading && giftCards.length === 0 ? (
                <LoadingSpinner />
            ) : (
                <FlatList
                    data={filteredCards}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={loading} onRefresh={loadGiftCards} />
                    }
                    ListEmptyComponent={
                        <EmptyState
                            title="لا توجد بطاقات هدايا"
                            subtitle="اضغط على + لإضافة بطاقة جديدة"
                            icon="card-outline"
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
    badgeContainer: {
        flexDirection: 'row',
        gap: 4,
    },
});
