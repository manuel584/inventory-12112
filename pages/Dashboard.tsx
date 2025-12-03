import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import { Order, Component } from '../types';
import { ShoppingBag, AlertOctagon, TrendingUp, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const Dashboard = ({ navigateTo }: { navigateTo: (page: string) => void }) => {
  const [stats, setStats] = useState({
    pendingOrders: 0,
    lowStockItems: 0,
    completedToday: 0,
    totalProducts: 0
  });

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    const orders = db.getOrders();
    const components = db.getComponents();
    const products = db.getProducts();

    setStats({
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      lowStockItems: components.filter(c => c.current_stock <= c.min_stock_alert).length,
      completedToday: orders.filter(o => o.status === 'completed' && new Date(o.order_date).toDateString() === new Date().toDateString()).length,
      totalProducts: products.length
    });

    setRecentOrders(orders.slice(0, 5));
  }, []);

  const data = [
    { name: 'السبت', orders: 4 },
    { name: 'الأحد', orders: 7 },
    { name: 'الاثنين', orders: 5 },
    { name: 'الثلاثاء', orders: 12 },
    { name: 'الأربعاء', orders: 9 },
    { name: 'الخميس', orders: 15 },
    { name: 'الجمعة', orders: 6 },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">لوحة التحكم</h1>
        <p className="text-gray-500 text-lg">مرحباً بك في نظام إدارة البخور</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:shadow-md transition" onClick={() => navigateTo('orders')}>
          <div>
            <p className="text-gray-500 mb-1">طلبات جديدة</p>
            <h3 className="text-3xl font-bold text-primary-700">{stats.pendingOrders}</h3>
          </div>
          <div className="bg-primary-50 p-4 rounded-full text-primary-600">
            <ShoppingBag size={28} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:shadow-md transition" onClick={() => navigateTo('inventory')}>
          <div>
            <p className="text-gray-500 mb-1">تنبيهات المخزون</p>
            <h3 className={`text-3xl font-bold ${stats.lowStockItems > 0 ? 'text-red-600' : 'text-green-600'}`}>{stats.lowStockItems}</h3>
          </div>
          <div className="bg-orange-50 p-4 rounded-full text-orange-600">
            <AlertOctagon size={28} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 mb-1">أكملت اليوم</p>
            <h3 className="text-3xl font-bold text-blue-600">{stats.completedToday}</h3>
          </div>
          <div className="bg-blue-50 p-4 rounded-full text-blue-600">
            <TrendingUp size={28} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 mb-1">منتجات نشطة</p>
            <h3 className="text-3xl font-bold text-purple-600">{stats.totalProducts}</h3>
          </div>
          <div className="bg-purple-50 p-4 rounded-full text-purple-600">
            <Clock size={28} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="text-xl font-bold text-gray-800 mb-6">إحصائيات الطلبات الأسبوعية</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fill: '#6b7280'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: '#6b7280'}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                <Bar dataKey="orders" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions / Recent */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4">نشاط حديث</h3>
          <div className="space-y-4">
            {recentOrders.length === 0 && <p className="text-gray-400 text-center py-4">لا توجد نشاطات حديثة</p>}
            {recentOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${order.status === 'completed' ? 'bg-green-500' : 'bg-orange-500'}`} />
                  <div>
                    <div className="font-bold text-gray-800 text-sm">{order.order_number}</div>
                    <div className="text-xs text-gray-500">{order.customer_name}</div>
                  </div>
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-white rounded border border-gray-200">
                  {order.status === 'completed' ? 'مكتمل' : 'قيد الانتظار'}
                </span>
              </div>
            ))}
          </div>
          <button onClick={() => navigateTo('orders')} className="w-full mt-4 py-2 text-primary-600 text-sm font-bold hover:bg-primary-50 rounded-lg transition">
            عرض كل الطلبات
          </button>
        </div>
      </div>
    </div>
  );
};