import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

interface BadgeProps {
    label: string | number;
    variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
    size?: 'small' | 'medium';
}

export const Badge = ({ label, variant = 'default', size = 'medium' }: BadgeProps) => {
    const getBackgroundColor = () => {
        switch (variant) {
            case 'success': return Colors.success + '20'; // 20% opacity
            case 'warning': return Colors.warning + '20';
            case 'danger': return Colors.danger + '20';
            case 'info': return Colors.info + '20';
            default: return '#eee';
        }
    };

    const getTextColor = () => {
        switch (variant) {
            case 'success': return Colors.success;
            case 'warning': return Colors.warning;
            case 'danger': return Colors.danger;
            case 'info': return Colors.info;
            default: return '#666';
        }
    };

    return (
        <View style={[
            styles.container,
            { backgroundColor: getBackgroundColor() },
            size === 'small' && styles.smallContainer
        ]}>
            <Text style={[
                styles.text,
                { color: getTextColor() },
                size === 'small' && styles.smallText
            ]}>
                {label}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: Layout.borderRadius.sm,
        alignSelf: 'flex-start',
    },
    smallContainer: {
        paddingVertical: 2,
        paddingHorizontal: 6,
    },
    text: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    smallText: {
        fontSize: 10,
    },
});
