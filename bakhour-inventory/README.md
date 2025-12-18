# Bakhour Inventory Management App (إدارة مخزون البخور)

A comprehensive inventory management system built with React Native (Expo) and SQLite, designed specifically for small businesses managing products, components, orders, and packing processes.

## 🚀 Features

### 📦 Product Management
- **Product Catalog**: View, add, edit, and delete products.
- **Product Kits**: Define products as "kits" composed of multiple components (e.g., box, bottle, sticker).
- **Stock Tracking**: Monitor product weight and availability.

### 🧩 Component Inventory
- **Raw Materials**: Manage inventory for boxes, cards, stickers, wrapping, etc.
- **Stock Alerts**: Set minimum stock levels and get visual alerts when stock is low.
- **Bulk Adjustment**: Quickly update stock levels for multiple components at once.

### 🛍️ Order Management
- **Order Tracking**: Manage orders through states: Pending -> Packing -> Completed.
- **Order Import**: Import orders via CSV files.
- **Packing System**: Dedicated "Pack Order" mode that guides users through the packing process, ensuring all components (kits) are included.
- **Stock Deduction**: Automatically deducts component stock when orders are packed.

### 🎁 Gift Cards & Samples
- **Gift Cards**: Manage gift card inventory (sold separately or bundled).
- **Samples**: Track promotional samples given with orders.

### 📊 Utilities
- **Excel Export**: Export Products, Orders, and Inventory data to Excel (.xlsx).
- **Database Management**: Reset database functionality for testing/maintenance.
- **Bilingual Support**: Built with Arabic-first UI (RTL).

## 📱 Screens

| Screen | Description |
|--------|-------------|
| **Dashboard** | Overview of new orders, low stock alerts, and quick actions. |
| **Products** | List of all products with search and filter. |
| **ProductDetail** | Detailed view of a product, including its kit components. |
| **AddProduct** | Form to create or edit products and define their kit components. |
| **Components** | Inventory of raw materials/components. |
| **ComponentDetail** | Detailed view of a component and its usage history. |
| **AddComponent** | Form to add/edit components. |
| **BulkStockAdjustment** | Tool to adjust stock for multiple components simultaneously. |
| **Orders** | List of orders filtered by status (Pending, Packing, Completed). |
| **OrderDetail** | Detailed view of an order and its items. |
| **PackOrder** | Interactive checklist for packing an order. |
| **ImportOrders** | Interface to upload and parse CSV order files. |
| **GiftCards** | Management of gift cards. |
| **Samples** | Management of product samples. |
| **Export** | Tools to export data to Excel. |
| **Settings** | App version info and database management. |

## 🧩 Reusable Components

The app is built using a set of reusable UI components located in `src/components`:

- `Button`: Standardized buttons with variants (primary, outline, danger).
- `Card`: Container for grouping content.
- `Input`: Text input fields with label and error support.
- `ListItem`: Standard list item for products, orders, etc.
- `Badge`: Visual indicators for status (e.g., "Low Stock", "Pending").
- `LoadingSpinner`: Activity indicator.
- `EmptyState`: Placeholder view when lists are empty.
- `AlertBanner`: In-app notifications/warnings.
- `Picker`: Dropdown selection component.
- `AddKitComponentModal`: Modal for adding components to a product kit.

## 🛠️ Tech Stack

- **Framework**: React Native (Expo SDK 52)
- **Language**: TypeScript
- **Database**: `expo-sqlite` (Native), Mock DB (Web)
- **Navigation**: React Navigation (Native Stack)
- **File Handling**: `expo-file-system`, `expo-sharing`, `expo-document-picker`
- **Data Processing**: `xlsx` (Excel), `papaparse` (CSV)

## 🏃‍♂️ How to Run

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run on Mobile (iOS/Android)**:
    ```bash
    npx expo start
    ```
    Scan the QR code with Expo Go.

3.  **Run on Web**:
    ```bash
    npx expo start --web
    ```
    *Note: The web version uses a mocked database and does not persist data permanently.*

## 📂 Project Structure

```
src/
├── components/     # Reusable UI components
├── constants/      # Colors, Layout, Arabic strings
├── database/       # SQLite init, queries, seeds, management
├── hooks/          # Custom React hooks (useProducts, useOrders, etc.)
├── navigation/     # Navigation configuration
├── screens/        # Application screens
├── services/       # External services (Excel export, CSV import)
├── types/          # TypeScript interfaces
└── utils/          # Helper functions (validation, formatting)
```
