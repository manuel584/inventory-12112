import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { Ionicons } from '@expo/vector-icons';

interface ListItemProps {
    title: string;
    subtitle?: string;
    rightIcon?: keyof typeof Ionicons.glyphMap;
    onPress?: () => void;
    badge?: React.ReactNode;
    leftContent?: React.ReactNode;
}

export const ListItem = ({ title, subtitle, rightIcon, onPress, badge, leftContent }: ListItemProps) => {
    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            disabled={!onPress}
            activeOpacity={0.7}
        >
            <View style={styles.content}>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{title}</Text>
                    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                </View>
                {badge && <View style={styles.badgeContainer}>{badge}</View>}
            </View>

            <View style={styles.leftSide}>
                {leftContent}
                {rightIcon && (
                    <Ionicons name={rightIcon} size={20} color={Colors.textLight} style={styles.icon} />
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Layout.spacing.md,
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        textAlign: 'right',
    },
    subtitle: {
        fontSize: 14,
        color: Colors.textLight,
        marginTop: 2,
        textAlign: 'right',
    },
    badgeContainer: {
        marginLeft: Layout.spacing.sm,
    },
    leftSide: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: Layout.spacing.md,
    },
    icon: {
        marginLeft: Layout.spacing.sm,
    },
});
