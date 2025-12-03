import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Order } from '../types';
import { FileUp, Box, CheckCircle, Clock } from 'lucide-react';

export const Orders = ({ onStartPacking }: { onStartPacking: (id: string) => void }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

  useEffect(() => {
    refreshOrders();
  }, []);

  const refreshOrders = () => {
    setOrders(db.getOrders());
  };

  const handleSimulateCSV = () => {
    const newOrder: Order = {
      id: `o${Date.now()}`,
      order_number: `ORD-${Math.floor(Math.random() * 1000)}`,
      customer_name: 'عميل مستورد (CSV)',
      order_date: new Date().toISOString(),
      status: 'pending',
      items: [{ productId: 'p1', quantity: 1 }]
    };
    
    const updated = [...orders, newOrder];
    setOrders(updated);
    db.saveOrders(updated);
    alert('تم استيراد الطلب بنجاح من الملف!');
  };

  const filteredOrders = orders.filter(o => o.status === activeTab);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة الطلبات</h1>
          <p className="text-gray-500">متابعة طلبات المتجر وتجهيزها</p>
        </div>
        <button 
          onClick={handleSimulateCSV}
          className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 shadow-sm"
        >
          <FileUp size={18} />
          <span>استيراد طلبات (CSV)</span>
        </button>
      </div>

      <div className="flex space-x-reverse space-x-2 mb-6 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`pb-3 px-4 font-medium transition ${
            activeTab === 'pending' 
            ? 'text-primary-600 border-b-2 border-primary-600' 
            : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          قيد الانتظار ({orders.filter(o => o.status === 'pending').length})
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          className={`pb-3 px-4 font-medium transition ${
            activeTab === 'completed' 
            ? 'text-primary-600 border-b-2 border-primary-600' 
            : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          مكتملة ({orders.filter(o => o.status === 'completed').length})
        </button>
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <Box className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <p className="text-gray-500">لا توجد طلبات في هذه القائمة</p>
          </div>
        )}
        
        {filteredOrders.map(order => (
          <div key={order.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-primary-200 transition">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className={`p-3 rounded-full ${order.status === 'pending' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>
                {order.status === 'pending' ? <Clock size={24} /> : <CheckCircle size={24} />}
              </div>
              <div>
                <div className="font-bold text-lg text-gray-900">{order.order_number}</div>
                <div className="text-gray-500 text-sm">{order.customer_name} • {new Date(order.order_date).toLocaleDateString('ar-SA')}</div>
                <div className="mt-1 text-sm text-gray-600 bg-gray-50 inline-block px-2 py-0.5 rounded">
                  {order.items.length} منتجات
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto flex justify-end">
              {order.status === 'pending' ? (
                <button 
                  onClick={() => onStartPacking(order.id)}
                  className="w-full md:w-auto bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition shadow-sm shadow-primary-200 flex items-center justify-center gap-2"
                >
                  <Box size={18} />
                  <span>بدء التعبئة</span>
                </button>
              ) : (
                <span className="px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-bold border border-green-100">
                  تم الشحن
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};