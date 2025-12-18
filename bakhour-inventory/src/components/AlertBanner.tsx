import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { Ionicons } from '@expo/vector-icons';

interface AlertBannerProps {
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    visible: boolean;
    onDismiss: () => void;
    autoDismiss?: boolean;
}

export const AlertBanner = ({ message, type = 'info', visible, onDismiss, autoDismiss = true }: AlertBannerProps) => {
    useEffect(() => {
        if (visible && autoDismiss) {
            const timer = setTimeout(onDismiss, 3000);
            return () => clearTimeout(timer);
        }
    }, [visible, autoDismiss, onDismiss]);

    if (!visible) return null;

    const getBackgroundColor = () => {
        switch (type) {
            case 'success': return Colors.success;
            case 'error': return Colors.danger;
            case 'warning': return Colors.warning;
            case 'info': return Colors.info;
            default: return Colors.info;
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success': return 'checkmark-circle';
            case 'error': return 'alert-circle';
            case 'warning': return 'warning';
            case 'info': return 'information-circle';
            default: return 'information-circle';
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
            <View style={styles.content}>
                <Ionicons name={getIcon()} size={24} color="#fff" />
                <Text style={styles.text}>{message}</Text>
            </View>
            <TouchableOpacity onPress={onDismiss}>
                <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: Layout.spacing.md,
        paddingTop: Layout.spacing.xl, // Status bar padding
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 1000,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    text: {
        color: '#fff',
        marginLeft: Layout.spacing.sm,
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
        textAlign: 'left',
    },
});
