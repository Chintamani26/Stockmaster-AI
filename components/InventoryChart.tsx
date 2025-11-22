import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Product } from '../types';

interface InventoryChartProps {
  products: Product[];
}

const InventoryChart: React.FC<InventoryChartProps> = ({ products }) => {
  // Aggregate data by location
  const locationData = products.reduce((acc, curr) => {
    const loc = curr.location || "Unknown";
    acc[loc] = (acc[loc] || 0) + curr.qty;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(locationData).map(([name, qty]) => ({
    name,
    qty
  }));

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

  if (data.length === 0) {
    return (
        <div className="h-64 flex items-center justify-center text-slate-500 bg-slate-800/50 rounded-xl border border-slate-700 border-dashed">
            No inventory data to display
        </div>
    )
  }

  return (
    <div className="h-80 w-full bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
      <h3 className="text-lg font-semibold text-slate-200 mb-4">Stock by Location</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
            axisLine={false} 
            tickLine={false}
          />
          <YAxis 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
            axisLine={false} 
            tickLine={false} 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }}
            cursor={{ fill: '#334155', opacity: 0.4 }}
          />
          <Bar dataKey="qty" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InventoryChart;