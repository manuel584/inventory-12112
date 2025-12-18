import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

// Mock DB for web to prevent crashes
const mockDb = {
  execSync: (sql: string) => console.log('Web DB execSync:', sql),
  runAsync: async (sql: string, params: any[]) => { console.log('Web DB runAsync:', sql, params); return { lastInsertRowId: 1, changes: 1 }; },
  getAllAsync: async (sql: string, params: any[]) => { console.log('Web DB getAllAsync:', sql, params); return []; },
  getFirstAsync: async (sql: string, params: any[]) => { console.log('Web DB getFirstAsync:', sql, params); return null; },
  execAsync: async (sql: string) => { console.log('Web DB execAsync:', sql); },
};

export const db = Platform.OS === 'web'
  ? mockDb as any
  : SQLite.openDatabaseSync('bakhour.db');

export const initDatabase = () => {
  if (Platform.OS === 'web') {
    console.log('Running on Web - Database is mocked');
    return;
  }

  try {
    db.execSync(`
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sku TEXT UNIQUE NOT NULL,
        name_ar TEXT NOT NULL,
        name_en TEXT,
        weight_grams REAL NOT NULL,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS components (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sku TEXT,
        name_ar TEXT NOT NULL,
        type TEXT NOT NULL,
        unit TEXT DEFAULT 'piece',
        current_stock INTEGER DEFAULT 0,
        min_stock_alert INTEGER DEFAULT 10,
        cost_per_unit REAL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS product_kits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        component_id INTEGER NOT NULL,
        quantity_per_order INTEGER DEFAULT 1,
        is_optional INTEGER DEFAULT 0,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (component_id) REFERENCES components(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS samples (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name_ar TEXT NOT NULL,
        weight_grams REAL DEFAULT 0,
        is_active INTEGER DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number TEXT UNIQUE NOT NULL,
        customer_name TEXT,
        order_date TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        items_json TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS packing_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        component_id INTEGER NOT NULL,
        quantity_used INTEGER NOT NULL,
        packed_by TEXT,
        packed_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (component_id) REFERENCES components(id) ON DELETE NO ACTION
      );

      CREATE TABLE IF NOT EXISTS stock_adjustments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        component_id INTEGER NOT NULL,
        quantity_change INTEGER NOT NULL,
        reason TEXT,
        adjusted_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (component_id) REFERENCES components(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS gift_cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sku TEXT UNIQUE NOT NULL,
        name_ar TEXT NOT NULL,
        is_sold_separately INTEGER DEFAULT 0,
        is_bundled INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS order_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        products_json TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};
