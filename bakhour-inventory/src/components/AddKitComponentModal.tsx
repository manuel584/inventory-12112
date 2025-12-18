import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { ArabicText } from '../constants/ArabicText';
import { Button } from './Button';
import { Input } from './Input';
import { Picker } from './Picker';
import { useComponents } from '../hooks/useComponents';
import { Component } from '../types/database.types';

interface AddKitComponentModalProps {
    visible: boolean;
    onClose: () => void;
    onAdd: (componentId: number, quantity: number, isOptional: boolean) => void;
}

export const AddKitComponentModal = ({ visible, onClose, onAdd }: AddKitComponentModalProps) => {
    const { components, loadComponents } = useComponents();
    const [selectedComponentId, setSelectedComponentId] = useState<number | null>(null);
    const [quantity, setQuantity] = useState('1');
    const [isOptional, setIsOptional] = useState(false);

    useEffect(() => {
        if (visible) {
            loadComponents();
            setQuantity('1');
            setIsOptional(false);
            setSelectedComponentId(null);
        }
    }, [visible]);

    const handleAdd = () => {
        if (!selectedComponentId) {
            Alert.alert('تنبيه', 'الرجاء اختيار مكون');
            return;
        }
        const qty = parseInt(quantity, 10);
        if (isNaN(qty) || qty <= 0) {
            Alert.alert('تنبيه', 'الكمية يجب أن تكون رقماً صحيحاً أكبر من 0');
            return;
        }

        onAdd(selectedComponentId, qty, isOptional);
        onClose();
    };

    const componentOptions = components.map(c => ({
        label: c.name_ar,
        value: c.id,
    }));

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.title}>إضافة مكون للطقم</Text>

                    <Picker
                        label="المكون"
                        options={componentOptions}
                        selectedValue={selectedComponentId}
                        onValueChange={setSelectedComponentId}
                        placeholder="اختر مكون..."
                    />

                    <Input
                        label="الكمية لكل طلب"
                        value={quantity}
                        onChangeText={setQuantity}
                        keyboardType="numeric"
                        placeholder="1"
                    />

                    <TouchableOpacity
                        style={styles.checkboxContainer}
                        onPress={() => setIsOptional(!isOptional)}
                    >
                        <View style={[styles.checkbox, isOptional && styles.checked]}>
                            {isOptional && <View style={styles.checkmark} />}
                        </View>
                        <Text style={styles.checkboxLabel}>مكون اختياري (للعينات)</Text>
                    </TouchableOpacity>

                    <View style={styles.buttons}>
                        <Button
                            title={ArabicText.common.cancel}
                            onPress={onClose}
                            variant="secondary"
                            style={styles.button}
                        />
                        <View style={{ width: Layout.spacing.md }} />
                        <Button
                            title={ArabicText.common.add}
                            onPress={handleAdd}
                            style={styles.button}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: Layout.spacing.lg,
    },
    container: {
        backgroundColor: Colors.surface,
        borderRadius: Layout.borderRadius.lg,
        padding: Layout.spacing.lg,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: Layout.spacing.lg,
        textAlign: 'center',
        color: Colors.text,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Layout.spacing.lg,
        justifyContent: 'flex-end', // RTL
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: Colors.primary,
        borderRadius: 4,
        marginLeft: Layout.spacing.sm,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checked: {
        backgroundColor: Colors.primary,
    },
    checkmark: {
        width: 10,
        height: 10,
        backgroundColor: '#fff',
        borderRadius: 2,
    },
    checkboxLabel: {
        fontSize: 16,
        color: Colors.text,
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        flex: 1,
    },
});
