import React from 'react';
import { Product, Log } from '../types';

export const InventoryTable: React.FC<{ products: Product[] }> = ({ products }) => {
  if (products.length === 0) return <div className="text-slate-500 italic p-8 text-center border border-slate-800 rounded-xl bg-slate-900">No products found. Use the AI to add stock.</div>;

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700 shadow-xl">
      <table className="w-full text-sm text-left text-slate-300">
        <thead className="text-xs uppercase bg-slate-800 text-slate-400 font-semibold tracking-wider">
          <tr>
            <th className="px-6 py-4">Product / SKU</th>
            <th className="px-6 py-4">Category</th>
            <th className="px-6 py-4 text-right">Quantity</th>
            <th className="px-6 py-4">Location</th>
            <th className="px-6 py-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700 bg-slate-900">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-slate-800/50 transition-colors">
              <td className="px-6 py-4">
                <div className="font-bold text-white">{product.name}</div>
                <div className="font-mono text-xs text-slate-500 mt-1">{product.sku}</div>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  {product.category}
                </span>
              </td>
              <td className="px-6 py-4 text-right font-mono text-base font-semibold text-slate-200">
                {product.qty}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center text-slate-400">
                  <svg className="w-4 h-4 mr-1.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {product.location}
                </div>
              </td>
              <td className="px-6 py-4">
                {product.qty < (product.minStock || 10) ? (
                   <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-red-900/30 text-red-400 border border-red-800">
                     Low Stock
                   </span>
                ) : (
                   <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-emerald-900/30 text-emerald-400 border border-emerald-800">
                     In Stock
                   </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const LogTable: React.FC<{ logs: Log[] }> = ({ logs }) => {
  if (logs.length === 0) return <div className="text-slate-500 italic p-8 text-center border border-slate-800 rounded-xl bg-slate-900">No transaction history available.</div>;

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700 shadow-xl max-h-[500px]">
      <table className="w-full text-sm text-left text-slate-300">
        <thead className="text-xs uppercase bg-slate-800 text-slate-400 font-semibold tracking-wider sticky top-0 z-10 shadow-sm">
          <tr>
            <th className="px-6 py-4">Time</th>
            <th className="px-6 py-4">Operation</th>
            <th className="px-6 py-4">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700 bg-slate-900">
          {logs.map((log) => {
            let badgeColor = 'bg-slate-700 text-slate-300';
            if (log.type === 'IN') badgeColor = 'bg-emerald-900/50 text-emerald-400 border border-emerald-800';
            if (log.type === 'OUT') badgeColor = 'bg-orange-900/50 text-orange-400 border border-orange-800';
            if (log.type === 'MOVE') badgeColor = 'bg-blue-900/50 text-blue-400 border border-blue-800';
            if (log.type === 'ADJUST') badgeColor = 'bg-purple-900/50 text-purple-400 border border-purple-800';

            return (
              <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-mono">{log.timestamp}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${badgeColor} inline-block min-w-[80px] text-center`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-300">{log.details}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};