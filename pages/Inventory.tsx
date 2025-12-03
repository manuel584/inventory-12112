import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Component } from '../types';
import { AlertTriangle, Package, Edit, Save } from 'lucide-react';

export const Inventory = () => {
  const [components, setComponents] = useState<Component[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<number>(0);

  useEffect(() => {
    setComponents(db.getComponents());
  }, []);

  const handleUpdateStock = (id: string) => {
    const updated = components.map(c => 
      c.id === id ? { ...c, current_stock: editStock } : c
    );
    setComponents(updated);
    db.saveComponents(updated);
    setEditingId(null);
  };

  const startEdit = (c: Component) => {
    setEditingId(c.id);
    setEditStock(c.current_stock);
  };

  const getStatusColor = (current: number, min: number) => {
    if (current <= 0) return 'bg-red-100 text-red-700 border-red-200';
    if (current <= min) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  const getStatusText = (current: number, min: number) => {
    if (current <= 0) return 'نفذت الكمية';
    if (current <= min) return 'منخفض';
    return 'متوفر';
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">المخزون والمكونات</h2>
          <p className="text-gray-500">إدارة مواد التغليف والمواد الخام</p>
        </div>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center gap-2">
          <Package size={18} />
          <span>إضافة مكون جديد</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
           <div className="text-gray-500 text-sm">إجمالي الأصناف</div>
           <div className="text-2xl font-bold text-gray-800">{components.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
           <div className="text-gray-500 text-sm">تنبيهات انخفاض المخزون</div>
           <div className="text-2xl font-bold text-red-600">
             {components.filter(c => c.current_stock <= c.min_stock_alert).length}
           </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="p-4 font-semibold">اسم المكون</th>
                <th className="p-4 font-semibold">النوع</th>
                <th className="p-4 font-semibold">الكمية الحالية</th>
                <th className="p-4 font-semibold">حد التنبيه</th>
                <th className="p-4 font-semibold">الحالة</th>
                <th className="p-4 font-semibold">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {components.map((comp) => (
                <tr key={comp.id} className="hover:bg-gray-50 transition">
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{comp.name_ar}</div>
                    <div className="text-xs text-gray-400">{comp.name_en}</div>
                  </td>
                  <td className="p-4">
                    <span className="inline-block px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-xs">
                      {comp.type}
                    </span>
                  </td>
                  <td className="p-4">
                    {editingId === comp.id ? (
                      <input 
                        type="number" 
                        value={editStock}
                        onChange={(e) => setEditStock(Number(e.target.value))}
                        className="w-20 p-1 border rounded focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <span className="font-bold">{comp.current_stock}</span>
                    )}
                  </td>
                  <td className="p-4 text-gray-500">{comp.min_stock_alert}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(comp.current_stock, comp.min_stock_alert)}`}>
                      {getStatusText(comp.current_stock, comp.min_stock_alert)}
                    </span>
                  </td>
                  <td className="p-4">
                    {editingId === comp.id ? (
                      <button onClick={() => handleUpdateStock(comp.id)} className="text-green-600 hover:text-green-800 p-2">
                        <Save size={18} />
                      </button>
                    ) : (
                      <button onClick={() => startEdit(comp)} className="text-blue-600 hover:text-blue-800 p-2">
                        <Edit size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};