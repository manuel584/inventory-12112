import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
    theme: ThemeMode;
    toggleTheme: () => void;
    colors: typeof lightColors;
}

const lightColors = {
    primary: '#2B6CB0',
    secondary: '#4299E1',
    background: '#F7FAFC',
    surface: '#FFFFFF',
    text: '#1A202C',
    textLight: '#718096',
    border: '#E2E8F0',
    success: '#38A169',
    warning: '#D69E2E',
    danger: '#E53E3E',
    info: '#3182CE',
};

const darkColors = {
    primary: '#4299E1',
    secondary: '#63B3ED',
    background: '#1A202C',
    surface: '#2D3748',
    text: '#F7FAFC',
    textLight: '#A0AEC0',
    border: '#4A5568',
    success: '#48BB78',
    warning: '#ECC94B',
    danger: '#FC8181',
    info: '#63B3ED',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@app_theme';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setTheme] = useState<ThemeMode>('light');

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
            if (savedTheme === 'dark' || savedTheme === 'light') {
                setTheme(savedTheme);
            }
        } catch (error) {
            console.error('Failed to load theme:', error);
        }
    };

    const toggleTheme = async () => {
        const newTheme: ThemeMode = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
    };

    const colors = theme === 'light' ? lightColors : darkColors;

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

// Export color schemes for direct use
export { lightColors, darkColors };
