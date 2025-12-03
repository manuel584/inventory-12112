import React from 'react';
import { LayoutDashboard, Package, Archive, ShoppingCart, Settings, LogOut } from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const menuItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'orders', label: 'الطلبات', icon: ShoppingCart },
    { id: 'inventory', label: 'المخزون', icon: Archive },
    { id: 'products', label: 'المنتجات', icon: Package },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ];

  return (
    <div className="w-64 bg-white h-screen shadow-lg flex flex-col fixed right-0 top-0 z-10">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-bold text-primary-700">إدارة مخزون البخور</h1>
        <p className="text-xs text-gray-500 mt-1">نسخة الويب التجريبية</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center space-x-reverse space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-primary-50 text-primary-700 font-bold shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button className="w-full flex items-center space-x-reverse space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors">
          <LogOut size={20} />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
};