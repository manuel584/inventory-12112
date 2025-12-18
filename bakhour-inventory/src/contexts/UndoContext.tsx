import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

type UndoAction = () => Promise<void> | void;

interface UndoContextType {
    addUndoAction: (action: UndoAction, message?: string) => void;
    clearUndo: () => void;
}

const UndoContext = createContext<UndoContextType | undefined>(undefined);

export const UndoProvider = ({ children }: { children: React.ReactNode }) => {
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('تم التراجع');
    const undoActionRef = useRef<UndoAction | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const addUndoAction = useCallback((action: UndoAction, msg: string = 'تراجع') => {
        // Clear existing timeout
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        undoActionRef.current = action;
        setMessage(msg);
        setVisible(true);

        // Animate In
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start();

        // Set timeout to hide
        timeoutRef.current = setTimeout(() => {
            hideUndo();
        }, 5000);
    }, []);

    const hideUndo = useCallback(() => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            setVisible(false);
            undoActionRef.current = null;
        });
    }, []);

    const handleUndo = async () => {
        if (undoActionRef.current) {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await undoActionRef.current();
            hideUndo();
        }
    };

    return (
        <UndoContext.Provider value={{ addUndoAction, clearUndo: hideUndo }}>
            {children}
            {visible && (
                <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
                    <TouchableOpacity style={styles.button} onPress={handleUndo}>
                        <Ionicons name="arrow-undo" size={20} color="#FFF" />
                        <Text style={styles.text}>{message}</Text>
                    </TouchableOpacity>
                    <View style={styles.timerBar} />
                </Animated.View>
            )}
        </UndoContext.Provider>
    );
};

export const useUndo = () => {
    const context = useContext(UndoContext);
    if (!context) throw new Error('useUndo must be used within an UndoProvider');
    return context;
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 90, // Above bottom tabs
        right: 20,
        backgroundColor: Colors.primary,
        borderRadius: 25,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        zIndex: 9999,
        overflow: 'hidden',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    text: {
        color: '#FFF',
        fontWeight: 'bold',
        marginLeft: 8,
        fontSize: 16,
    },
    timerBar: {
        height: 3,
        backgroundColor: Colors.secondary,
        width: '100%',
    }
});
