import { useState, useCallback } from 'react';
import { Component } from '../types/database.types';
import * as ComponentQueries from '../database/queries/components';
import { useFocusEffect } from '@react-navigation/native';

export const useComponents = () => {
    const [components, setComponents] = useState<Component[]>([]);
    const [lowStockComponents, setLowStockComponents] = useState<Component[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const loadComponents = useCallback(async () => {
        setLoading(true);
        try {
            const all = await ComponentQueries.getAllComponents();
            const low = await ComponentQueries.getLowStockComponents();
            setComponents(all);
            setLowStockComponents(low);
            setError(null);
        } catch (e) {
            setError(e as Error);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadComponents();
        }, [loadComponents])
    );

    const updateStock = async (id: number, newQuantity: number) => {
        try {
            await ComponentQueries.updateComponentStock(id, newQuantity);
            await loadComponents();
        } catch (e) {
            setError(e as Error);
            throw e;
        }
    };

    return {
        components,
        lowStockComponents,
        loading,
        error,
        loadComponents,
        updateStock,
    };
};
