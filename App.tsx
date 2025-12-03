import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { Orders } from './pages/Orders';
import { PackingStation } from './pages/PackingStation';
import { Product } from './types';
import { db } from './services/db';

const App = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [packingOrderId, setPackingOrderId] = useState<string | null>(null);

  // Simple Product List View (Hardcoded for demo as separate page wasn't critical path compared to Packing)
  const ProductsView = () => {
    const products = db.getProducts();
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">المنتجات</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(p => (
            <div key={p.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="font-bold text-lg text-gray-800">{p.name_ar}</div>
              <div className="text-sm text-gray-500 mb-4">{p.sku}</div>
              <div className="text-sm font-medium text-gray-600 bg-gray-50 p-3 rounded-lg">
                المكونات:
                <ul className="mt-2 space-y-1 list-disc list-inside text-gray-500 font-normal">
                   <li>علبة + ملصقات + تغليف</li>
                   <li>{p.weight_grams} جرام</li>
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const startPacking = (id: string) => {
    setPackingOrderId(id);
    setCurrentPage('packing');
  };

  const renderContent = () => {
    if (currentPage === 'packing' && packingOrderId) {
      return (
        <PackingStation 
          orderId={packingOrderId} 
          onBack={() => {
            setPackingOrderId(null);
            setCurrentPage('orders');
          }}
          onComplete={() => {
            setPackingOrderId(null);
            setCurrentPage('orders');
          }}
        />
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard navigateTo={setCurrentPage} />;
      case 'inventory':
        return <Inventory />;
      case 'orders':
        return <Orders onStartPacking={startPacking} />;
      case 'products':
        return <ProductsView />;
      case 'settings':
        return <div className="p-8 text-center text-gray-500">صفحة الإعدادات (قيد التطوير)</div>;
      default:
        return <Dashboard navigateTo={setCurrentPage} />;
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen text-right" dir="rtl">
      {/* Sidebar hidden on packing screen for focus mode */}
      {currentPage !== 'packing' && (
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      )}
      
      <main className={`flex-1 transition-all duration-300 ${currentPage !== 'packing' ? 'mr-64' : ''}`}>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;