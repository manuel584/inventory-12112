import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
}

export const Input = ({ label, error, style, ...props }: InputProps) => {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[
                    styles.input,
                    error ? styles.inputError : null,
                    style
                ]}
                placeholderTextColor="#999"
                textAlign="right" // Default for Arabic
                {...props}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: Layout.spacing.md,
        width: '100%',
    },
    label: {
        marginBottom: Layout.spacing.xs,
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
        textAlign: 'right',
    },
    input: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: Layout.borderRadius.md,
        padding: Layout.spacing.md,
        fontSize: 16,
        color: Colors.text,
    },
    inputError: {
        borderColor: Colors.danger,
    },
    errorText: {
        marginTop: Layout.spacing.xs,
        fontSize: 12,
        color: Colors.danger,
        textAlign: 'right',
    },
});
