import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { ArabicText } from '../constants/ArabicText';

interface LoadingSpinnerProps {
    fullScreen?: boolean;
    text?: string;
}

export const LoadingSpinner = ({ fullScreen = false, text = ArabicText.common.loading }: LoadingSpinnerProps) => {
    if (fullScreen) {
        return (
            <View style={styles.fullScreen}>
                <ActivityIndicator size="large" color={Colors.primary} />
                {text && <Text style={styles.text}>{text}</Text>}
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ActivityIndicator size="small" color={Colors.primary} />
            {text && <Text style={styles.text}>{text}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    fullScreen: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.background,
    },
    container: {
        padding: Layout.spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        marginTop: Layout.spacing.sm,
        color: Colors.textLight,
        fontSize: 14,
    },
});
