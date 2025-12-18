import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { BottomTabNavigator } from './BottomTabNavigator';

export type RootStackParamList = {
    Dashboard: undefined;
    Products: undefined;
    ProductDetail: { id: number };
    AddProduct: { id?: number };
    ManageKit: { productId: number };
    Components: undefined;
    ComponentDetail: { id: number };
    AddComponent: { id?: number };
    BulkStockAdjustment: undefined;
    Orders: undefined;
    OrderDetail: { id: number };
    PackOrder: { id: number };
    ImportOrders: undefined;
    AddOrder: { templateId?: number };
    EditOrder: { id: number };
    Samples: undefined;
    AddSample: { id?: number };
    GiftCards: undefined;
    AddGiftCard: { id?: number };
    GlobalSearch: undefined;
    Export: undefined;
    Settings: undefined;
};

export const AppNavigator = () => {
    return (
        <NavigationContainer>
            <BottomTabNavigator />
        </NavigationContainer>
    );
};
