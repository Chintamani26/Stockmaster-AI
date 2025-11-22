import React from 'react';
import { Product, Log } from '../types';

interface MetricsCardsProps {
  products: Product[];
  logs: Log[];
}

const Card: React.FC<{ title: string; value: string | number; subtext?: string; color: string }> = ({ title, value, subtext, color }) => (
  <div className={`p-4 rounded-xl bg-slate-800 border border-slate-700 shadow-lg flex flex-col justify-between relative overflow-hidden`}>
    <div className={`absolute top-0 right-0 w-16 h-16 bg-${color}-500 opacity-10 rounded-bl-full -mr-2 -mt-2`}></div>
    <div>
      <h3 className="text-slate-400 text-sm uppercase font-semibold tracking-wider">{title}</h3>
      <p className="text-3xl font-bold text-slate-100 mt-2">{value}</p>
    </div>
    {subtext && <p className="text-slate-500 text-xs mt-2">{subtext}</p>}
  </div>
);

const MetricsCards: React.FC<MetricsCardsProps> = ({ products, logs }) => {
  const totalItems = products.reduce((sum, p) => sum + p.qty, 0);
  const uniqueProducts = new Set(products.map(p => p.name.toLowerCase())).size;
  const lastAction = logs.length > 0 ? logs[0].action : "N/A";
  const lastActionTime = logs.length > 0 ? logs[0].timestamp.split(',')[1] : "";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card 
        title="Total Items" 
        value={totalItems.toLocaleString()} 
        color="blue"
        subtext="Units across all locations"
      />
      <Card 
        title="Unique Products" 
        value={uniqueProducts} 
        color="purple"
        subtext="Distinct SKUs"
      />
      <Card 
        title="Last Activity" 
        value={lastAction} 
        color="emerald"
        subtext={lastActionTime ? `at ${lastActionTime}` : "No recent activity"}
      />
    </div>
  );
};

export default MetricsCards;