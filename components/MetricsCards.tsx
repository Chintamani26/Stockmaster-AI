import React from 'react';
import { Product, Log } from '../types';

interface MetricsCardsProps {
  products: Product[];
  logs: Log[];
}

const Card: React.FC<{ title: string; value: string | number; subtext?: string; color: string; icon?: React.ReactNode }> = ({ title, value, subtext, color, icon }) => (
  <div className={`p-5 rounded-xl bg-slate-800 border border-slate-700 shadow-lg flex flex-col justify-between relative overflow-hidden group hover:border-${color}-500/50 transition-all`}>
    <div className={`absolute top-0 right-0 w-20 h-20 bg-${color}-500 opacity-5 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:opacity-10`}></div>
    <div className="flex justify-between items-start z-10">
      <div>
        <h3 className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">{title}</h3>
        <p className="text-3xl font-bold text-slate-100">{value}</p>
      </div>
      {icon && <div className={`text-${color}-400 opacity-80`}>{icon}</div>}
    </div>
    {subtext && <div className="mt-3 flex items-center text-xs text-slate-500 font-medium">
      <span className={`w-1.5 h-1.5 rounded-full bg-${color}-500 mr-2`}></span>
      {subtext}
    </div>}
  </div>
);

const MetricsCards: React.FC<MetricsCardsProps> = ({ products, logs }) => {
  const totalProducts = products.reduce((sum, p) => sum + p.qty, 0);
  
  // "Low Stock" defined as qty < 10 for this demo
  const lowStockCount = products.filter(p => p.qty < 10).length;
  
  // Mock "Pending" logic for the demo requirement
  // In a real app, these would come from an 'Orders' table with status='PENDING'
  const pendingReceipts = Math.floor(Math.random() * 3) + 1; 
  const pendingDeliveries = Math.floor(Math.random() * 5) + 2;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card 
        title="Total Stock" 
        value={totalProducts.toLocaleString()} 
        color="blue"
        subtext="Items across all locations"
        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
      />
      <Card 
        title="Low Stock Alerts" 
        value={lowStockCount} 
        color="red"
        subtext="Items below reorder point"
        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
      />
      <Card 
        title="Pending Receipts" 
        value={pendingReceipts} 
        color="emerald"
        subtext="Incoming shipments"
        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>}
      />
      <Card 
        title="Pending Deliveries" 
        value={pendingDeliveries} 
        color="orange"
        subtext="Outgoing orders"
        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>}
      />
    </div>
  );
};

export default MetricsCards;