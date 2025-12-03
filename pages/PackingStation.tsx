import React, { useState, useEffect } from 'react';
import { Order, Product, Component } from '../types';
import { db } from '../services/db';
import { CheckCircle2, Circle, ArrowRight, AlertTriangle, PackageCheck } from 'lucide-react';

interface PackingStationProps {
  orderId: string;
  onBack: () => void;
  onComplete: () => void;
}

export const PackingStation: React.FC<PackingStationProps> = ({ orderId, onBack, onComplete }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [stockStatus, setStockStatus] = useState<'ok' | 'warning' | 'error'>('ok');
  
  // Checklist States
  const [checklist, setChecklist] = useState({
    mainProduct: false,
    weightChecked: false,
    inBox: false,
    boxUsed: false,
    nameSticker: false,
    barcode: false,
    howtoCard: false,
    coupon: false,
    wrappingPaper: false,
    shippingBox: false,
    brandSticker: false,
    sealTape: false,
    labelPrinted: false,
    labelStuck: false,
  });

  useEffect(() => {
    const orders = db.getOrders();
    const foundOrder = orders.find(o => o.id === orderId);
    setOrder(foundOrder || null);
    setProducts(db.getProducts());
  }, [orderId]);

  if (!order) return <div className="p-8">جاري التحميل...</div>;

  const orderProduct = products.find(p => p.id === order.items[0].productId);
  const progress = Object.values(checklist).filter(Boolean).length;
  const totalSteps = Object.keys(checklist).length;
  const progressPercent = Math.round((progress / totalSteps) * 100);
  const isComplete = progressPercent === 100;

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFinishPacking = () => {
    if (!window.confirm("هل أنت متأكد من إنهاء التعبئة وخصم المخزون؟")) return;

    // Perform Stock Deduction
    const currentComponents = db.getComponents();
    const allProducts = db.getProducts();
    const updatedComponents = db.processOrderPacking(order, currentComponents, allProducts);
    
    // Save new stock
    db.saveComponents(updatedComponents);
    
    // Update Order Status
    const allOrders = db.getOrders();
    const updatedOrders = allOrders.map(o => 
      o.id === order.id ? { ...o, status: 'completed' as const } : o
    );
    db.saveOrders(updatedOrders);

    // Create Packing Log
    db.savePackingLog({
      id: Date.now().toString(),
      order_id: order.id,
      packed_at: new Date().toISOString(),
      packed_by: 'User'
    });

    onComplete();
  };

  const CheckItem = ({ id, label, isChecked }: { id: keyof typeof checklist, label: string, isChecked: boolean }) => (
    <div 
      onClick={() => toggleCheck(id)}
      className={`flex items-center p-3 rounded-lg cursor-pointer transition border mb-2 ${
        isChecked ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:border-primary-300'
      }`}
    >
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ml-3 transition ${
        isChecked ? 'bg-green-500 border-green-500' : 'border-gray-300'
      }`}>
        {isChecked && <CheckCircle2 size={16} className="text-white" />}
      </div>
      <span className={`text-lg ${isChecked ? 'text-green-800 font-medium' : 'text-gray-700'}`}>{label}</span>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-white/95 backdrop-blur py-4 z-10 border-b">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowRight size={24} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">تعبئة الطلب #{order.order_number}</h1>
            <p className="text-gray-500 text-sm">للعميل: {order.customer_name}</p>
          </div>
        </div>
        <div className="text-left">
          <div className="text-2xl font-bold text-primary-600">{progressPercent}%</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-3 rounded-full mb-8 overflow-hidden">
        <div 
          className="bg-primary-500 h-full transition-all duration-300 ease-out" 
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Sections */}
      <div className="space-y-8 pb-32">
        
        {/* Section 1: Main Product */}
        <section>
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <PackageCheck className="text-primary-600" />
            1. المنتج الرئيسي
          </h3>
          <div className="bg-blue-50 p-4 rounded-xl mb-4 border border-blue-100">
            <div className="font-bold text-lg text-blue-900">{orderProduct?.name_ar || 'منتج غير معروف'}</div>
            <div className="text-blue-700">الكمية: {order.items[0].quantity} | الوزن: {orderProduct?.weight_grams}g</div>
          </div>
          <CheckItem id="mainProduct" isChecked={checklist.mainProduct} label={`وزن المنتج (${orderProduct?.weight_grams}g)`} />
          <CheckItem id="weightChecked" isChecked={checklist.weightChecked} label="التأكد من سلامة المنتج" />
          <CheckItem id="inBox" isChecked={checklist.inBox} label="وضع في العلبة" />
        </section>

        {/* Section 2: Packaging */}
        <section>
          <h3 className="text-xl font-bold text-gray-800 mb-4">2. التغليف والعلب</h3>
          <CheckItem id="boxUsed" isChecked={checklist.boxUsed} label="علبة المنتج نظيفة وسليمة" />
          <CheckItem id="nameSticker" isChecked={checklist.nameSticker} label="ملصق اسم المنتج" />
        </section>

        {/* Section 3: Cards */}
        <section>
          <h3 className="text-xl font-bold text-gray-800 mb-4">3. البطاقات والمرفقات</h3>
          <CheckItem id="barcode" isChecked={checklist.barcode} label="كرت باركود" />
          <CheckItem id="howtoCard" isChecked={checklist.howtoCard} label="كرت طريقة الاستخدام" />
          <CheckItem id="coupon" isChecked={checklist.coupon} label="كرت كوبون الخصم" />
        </section>

        {/* Section 4: Wrapping */}
        <section>
          <h3 className="text-xl font-bold text-gray-800 mb-4">4. التغليف النهائي</h3>
          <CheckItem id="wrappingPaper" isChecked={checklist.wrappingPaper} label="لف المنتج بورقة الخبز" />
          <CheckItem id="shippingBox" isChecked={checklist.shippingBox} label="وضع في كرتون الشحن" />
        </section>

        {/* Section 5: Final Steps */}
        <section>
          <h3 className="text-xl font-bold text-gray-800 mb-4">5. الخطوات الأخيرة</h3>
          <CheckItem id="brandSticker" isChecked={checklist.brandSticker} label="ملصق دائري براندنق" />
          <CheckItem id="sealTape" isChecked={checklist.sealTape} label="ختم الكرتون بلاصق" />
          <CheckItem id="labelPrinted" isChecked={checklist.labelPrinted} label="طباعة البوليصة" />
          <CheckItem id="labelStuck" isChecked={checklist.labelStuck} label="لصق البوليصة على الشحنة" />
        </section>

      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:pl-64">
        <div className="max-w-3xl mx-auto flex gap-4">
           {stockStatus === 'warning' && (
             <div className="flex-1 bg-orange-100 text-orange-800 p-3 rounded-lg flex items-center gap-2">
               <AlertTriangle size={20} />
               <span>تنبيه: سيتم انخفاض المخزون لبعض العناصر</span>
             </div>
           )}
           <button 
             onClick={handleFinishPacking}
             disabled={!isComplete}
             className={`flex-1 py-4 rounded-xl text-lg font-bold shadow-lg transition transform active:scale-95 ${
               isComplete 
                ? 'bg-primary-600 text-white hover:bg-primary-700' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
             }`}
           >
             {isComplete ? 'إنهاء التعبئة وتحديث المخزون' : `أكمل القائمة (${progress}/${totalSteps})`}
           </button>
        </div>
      </div>
    </div>
  );
};