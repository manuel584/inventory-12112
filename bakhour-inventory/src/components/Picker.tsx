import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList } from 'react-native';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { Ionicons } from '@expo/vector-icons';

interface Option {
    label: string;
    value: any;
}

interface PickerProps {
    label?: string;
    options: Option[];
    selectedValue: any;
    onValueChange: (value: any) => void;
    placeholder?: string;
}

export const Picker = ({ label, options, selectedValue, onValueChange, placeholder = 'اختر...' }: PickerProps) => {
    const [visible, setVisible] = React.useState(false);

    const selectedOption = options.find(opt => opt.value === selectedValue);

    const handleSelect = (value: any) => {
        onValueChange(value);
        setVisible(false);
    };

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TouchableOpacity style={styles.selector} onPress={() => setVisible(true)}>
                <Text style={[styles.valueText, !selectedOption && styles.placeholder]}>
                    {selectedOption ? selectedOption.label : placeholder}
                </Text>
                <Ionicons name="chevron-down" size={20} color={Colors.textLight} />
            </TouchableOpacity>

            <Modal visible={visible} transparent animationType="fade">
                <TouchableOpacity style={styles.modalOverlay} onPress={() => setVisible(false)} activeOpacity={1}>
                    <View style={styles.modalContent}>
                        <FlatList
                            data={options}
                            keyExtractor={(item) => String(item.value)}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.option, item.value === selectedValue && styles.selectedOption]}
                                    onPress={() => handleSelect(item.value)}
                                >
                                    <Text style={[styles.optionText, item.value === selectedValue && styles.selectedOptionText]}>
                                        {item.label}
                                    </Text>
                                    {item.value === selectedValue && (
                                        <Ionicons name="checkmark" size={20} color={Colors.primary} />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
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
    selector: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: Layout.borderRadius.md,
        padding: Layout.spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    valueText: {
        fontSize: 16,
        color: Colors.text,
    },
    placeholder: {
        color: '#999',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: Layout.spacing.lg,
    },
    modalContent: {
        backgroundColor: Colors.surface,
        borderRadius: Layout.borderRadius.lg,
        maxHeight: '50%',
    },
    option: {
        padding: Layout.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectedOption: {
        backgroundColor: Colors.background,
    },
    optionText: {
        fontSize: 16,
        color: Colors.text,
    },
    selectedOptionText: {
        color: Colors.primary,
        fontWeight: 'bold',
    },
});
