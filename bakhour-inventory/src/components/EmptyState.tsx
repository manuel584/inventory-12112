import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';

interface EmptyStateProps {
    icon?: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export const EmptyState = ({ icon = 'cube-outline', title, subtitle, actionLabel, onAction }: EmptyStateProps) => {
    return (
        <View style={styles.container}>
            <Ionicons name={icon} size={64} color={Colors.textLight} style={styles.icon} />
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            {actionLabel && onAction && (
                <Button
                    title={actionLabel}
                    onPress={onAction}
                    style={styles.button}
                    variant="secondary"
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: Layout.spacing.xl,
    },
    icon: {
        marginBottom: Layout.spacing.lg,
        opacity: 0.5,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: Layout.spacing.sm,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: Colors.textLight,
        textAlign: 'center',
        marginBottom: Layout.spacing.lg,
    },
    button: {
        minWidth: 150,
    },
});
