import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
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
import * as SampleQueries from '../database/queries/samples';
import { Sample } from '../types/database.types';
import { formatDate } from '../utils/formatting';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SamplesScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const [samples, setSamples] = useState<Sample[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredSamples, setFilteredSamples] = useState<Sample[]>([]);

    const loadSamples = async () => {
        try {
            setLoading(true);
            const data = await SampleQueries.getAllSamples();
            setSamples(data);
            setFilteredSamples(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadSamples();
        }, [])
    );

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={() => navigation.navigate('AddSample', {})}>
                    <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    React.useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredSamples(samples);
        } else {
            const lowerQuery = searchQuery.toLowerCase();
            setFilteredSamples(
                samples.filter(
                    s => s.recipient_name.toLowerCase().includes(lowerQuery)
                )
            );
        }
    }, [searchQuery, samples]);

    const renderItem = ({ item }: { item: Sample }) => (
        <ListItem
            title={item.recipient_name}
            subtitle={formatDate(item.date_sent)}
            rightIcon="chevron-back"
            onPress={() => navigation.navigate('AddSample', { id: item.id })}
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

            {loading && samples.length === 0 ? (
                <LoadingSpinner />
            ) : (
                <FlatList
                    data={filteredSamples}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={loading} onRefresh={loadSamples} />
                    }
                    ListEmptyComponent={
                        <EmptyState
                            title="لا توجد عينات"
                            subtitle="اضغط على + لإضافة عينة جديدة"
                            icon="gift-outline"
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
