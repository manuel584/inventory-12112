import { useState, useCallback } from 'react';
import { Order } from '../types/database.types';
import * as OrderQueries from '../database/queries/orders';
import { useFocusEffect } from '@react-navigation/native';

export const useOrders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const loadOrders = useCallback(async () => {
        setLoading(true);
        try {
            const all = await OrderQueries.getAllOrders();
            const pending = await OrderQueries.getOrdersRequiringPacking();
            setOrders(all);
            setPendingOrders(pending);
            setError(null);
        } catch (e) {
            setError(e as Error);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadOrders();
        }, [loadOrders])
    );

    const updateOrderStatus = async (id: number, status: string) => {
        try {
            await OrderQueries.updateOrderStatus(id, status);
            await loadOrders();
        } catch (e) {
            setError(e as Error);
            throw e;
        }
    };

    return {
        orders,
        pendingOrders,
        loading,
        error,
        loadOrders,
        updateOrderStatus,
    };
};
