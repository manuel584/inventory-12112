import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    variant?: 'default' | 'outlined' | 'elevated';
}

export const Card = ({ children, style, variant = 'default' }: CardProps) => {
    return (
        <View style={[
            styles.container,
            variant === 'outlined' && styles.outlined,
            variant === 'elevated' && styles.elevated,
            style
        ]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.surface,
        padding: Layout.spacing.md,
        borderRadius: Layout.borderRadius.lg,
        marginBottom: Layout.spacing.md,
    },
    outlined: {
        borderWidth: 1,
        borderColor: Colors.border,
    },
    elevated: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
});
