import { useState, useCallback, useEffect } from 'react';
import { Product } from '../types/database.types';
import * as ProductQueries from '../database/queries/products';
import { useFocusEffect } from '@react-navigation/native';

export const useProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const loadProducts = useCallback(async () => {
        setLoading(true);
        try {
            const data = await ProductQueries.getAllProducts();
            setProducts(data);
            setError(null);
        } catch (e) {
            setError(e as Error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Reload when screen focuses
    useFocusEffect(
        useCallback(() => {
            loadProducts();
        }, [loadProducts])
    );

    const addProduct = async (product: Omit<Product, 'id' | 'created_at'>) => {
        try {
            await ProductQueries.createProduct(product);
            await loadProducts();
        } catch (e) {
            setError(e as Error);
            throw e;
        }
    };

    const updateProduct = async (id: number, data: Partial<Product>) => {
        try {
            await ProductQueries.updateProduct(id, data);
            await loadProducts();
        } catch (e) {
            setError(e as Error);
            throw e;
        }
    };

    const deleteProduct = async (id: number) => {
        try {
            await ProductQueries.deleteProduct(id);
            await loadProducts();
        } catch (e) {
            setError(e as Error);
            throw e;
        }
    };

    return {
        products,
        loading,
        error,
        loadProducts,
        addProduct,
        updateProduct,
        deleteProduct,
    };
};
