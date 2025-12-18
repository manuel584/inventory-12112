import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { ArabicText } from '../constants/ArabicText';

// Screens
import { DashboardScreen } from '../screens/DashboardScreen'; // Maybe reuse for something else or deprecate?
import { WorkScreen } from '../screens/WorkScreen'; // NEW
import { OrdersScreen } from '../screens/OrdersScreen';
import { OrderDetailScreen } from '../screens/OrderDetailScreen';
import { PackOrderScreen } from '../screens/PackOrderScreen';
import { ImportOrdersScreen } from '../screens/ImportOrdersScreen';
import { ProductsScreen } from '../screens/ProductsScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { AddProductScreen } from '../screens/AddProductScreen';
import { ManageKitScreen } from '../screens/ManageKitScreen';
import { ComponentsScreen } from '../screens/ComponentsScreen';
import { ComponentDetailScreen } from '../screens/ComponentDetailScreen';
import { AddComponentScreen } from '../screens/AddComponentScreen';
import { BulkStockAdjustmentScreen } from '../screens/BulkStockAdjustmentScreen';
import { SamplesScreen } from '../screens/SamplesScreen';
import { AddSampleScreen } from '../screens/AddSampleScreen';
import { GiftCardsScreen } from '../screens/GiftCardsScreen';
import { AddGiftCardScreen } from '../screens/AddGiftCardScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ExportScreen } from '../screens/ExportScreen';
import { AddOrderScreen } from '../screens/AddOrderScreen';
import { EditOrderScreen } from '../screens/EditOrderScreen';
import { OrderTemplatesScreen } from '../screens/OrderTemplatesScreen';
import { CreateTemplateScreen } from '../screens/CreateTemplateScreen';
import { InventoryTableScreen } from '../screens/InventoryTableScreen';
import { OrdersTableScreen } from '../screens/OrdersTableScreen';
import { ManageComponentStockScreen } from '../screens/ManageComponentStockScreen';
import { InventoryReportScreen } from '../screens/InventoryReportScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { ManageScreen } from '../screens/ManageScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Work Stack (Replacing OrdersStack as primary)
const WorkStack = () => (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: Colors.primary }, headerTintColor: '#fff', contentStyle: { direction: 'rtl' } }}>
        <Stack.Screen name="Work" component={WorkScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PackOrder" component={PackOrderScreen} options={{ headerShown: false }} />
        <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'تفاصيل الطلب' }} />
    </Stack.Navigator>
);

const ReportStack = () => (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: Colors.primary }, headerTintColor: '#fff', contentStyle: { direction: 'rtl' } }}>
        <Stack.Screen name="InventoryReport" component={InventoryReportScreen} options={{ title: 'تقرير المخزون', headerShown: false }} />
    </Stack.Navigator>
);

const ManageStack = () => (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: Colors.primary }, headerTintColor: '#fff', contentStyle: { direction: 'rtl' } }}>
        <Stack.Screen name="ManageMenu" component={ManageScreen} options={{ headerShown: false }} />

        {/* Inventory Definitions */}
        <Stack.Screen name="ProductsList" component={ProductsScreen} options={{ title: ArabicText.products.title }} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: ArabicText.products.name }} />
        <Stack.Screen name="AddProduct" component={AddProductScreen} options={{ title: ArabicText.dashboard.addProduct }} />
        <Stack.Screen name="ManageKit" component={ManageKitScreen} options={{ title: ArabicText.kits.manageKit }} />
        <Stack.Screen name="Components" component={ComponentsScreen} options={{ title: 'المكونات' }} />
        <Stack.Screen name="ComponentDetail" component={ComponentDetailScreen} options={{ title: 'تفاصيل المكون' }} />
        <Stack.Screen name="AddComponent" component={AddComponentScreen} options={{ title: 'إضافة مكون' }} />
        <Stack.Screen name="Samples" component={SamplesScreen} options={{ title: 'العينات' }} />
        <Stack.Screen name="AddSample" component={AddSampleScreen} options={{ title: 'إضافة عينة' }} />
        <Stack.Screen name="GiftCards" component={GiftCardsScreen} options={{ title: 'بطاقات الهدايا' }} />
        <Stack.Screen name="AddGiftCard" component={AddGiftCardScreen} options={{ title: 'إضافة بطاقة' }} />

        {/* History & Data */}
        <Stack.Screen name="OrdersList" component={OrdersScreen} options={{ title: 'سجل الطلبات' }} />
        <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'تفاصيل الطلب' }} />
        <Stack.Screen name="ImportOrders" component={ImportOrdersScreen} options={{ title: ArabicText.orders.import }} />
        <Stack.Screen name="Export" component={ExportScreen} options={{ title: ArabicText.dashboard.exportExcel }} />
        <Stack.Screen name="BulkStockAdjustment" component={BulkStockAdjustmentScreen} options={{ title: 'تحديث المخزون' }} />

        {/* Settings */}
        <Stack.Screen name="SettingsList" component={SettingsScreen} options={{ title: 'الإعدادات' }} />
        <Stack.Screen name="Analytics" component={AnalyticsScreen} options={{ title: 'الإحصائيات' }} />
        <Stack.Screen name="InventoryTable" component={InventoryTableScreen} options={{ title: ArabicText.tableView.inventoryTable }} />
        <Stack.Screen name="ManageStock" component={ManageComponentStockScreen} options={{ title: 'إدارة كميات المخزون' }} />
    </Stack.Navigator>
);



export const BottomTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'home';

                    if (route.name === 'Work') {
                        iconName = focused ? 'clipboard' : 'clipboard-outline';
                    } else if (route.name === 'Report') {
                        iconName = focused ? 'bar-chart' : 'bar-chart-outline';
                    } else if (route.name === 'Manage') {
                        iconName = focused ? 'grid' : 'grid-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: { direction: 'rtl' }, // RTL for tabs
            })}
        >
            <Tab.Screen name="Work" component={WorkStack} options={{ title: 'العمل' }} />
            <Tab.Screen name="Report" component={ReportStack} options={{ title: 'التقرير' }} />
            <Tab.Screen name="Manage" component={ManageStack} options={{ title: 'الإدارة' }} />
        </Tab.Navigator>
    );
};
