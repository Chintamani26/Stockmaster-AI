import React from 'react';
import { Product, Log } from '../types';

export const InventoryTable: React.FC<{ products: Product[] }> = ({ products }) => {
  if (products.length === 0) return <div className="text-slate-500 italic p-4 text-center">No products found. Add stock to begin.</div>;

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-700">
      <table className="w-full text-sm text-left text-slate-300">
        <thead className="text-xs uppercase bg-slate-800 text-slate-400">
          <tr>
            <th className="px-6 py-3">Product</th>
            <th className="px-6 py-3">SKU</th>
            <th className="px-6 py-3">Category</th>
            <th className="px-6 py-3 text-right">Qty</th>
            <th className="px-6 py-3">Location</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="bg-slate-800/50 border-b border-slate-700 hover:bg-slate-800 transition-colors">
              <td className="px-6 py-4 font-medium text-white">{product.name}</td>
              <td className="px-6 py-4 font-mono text-xs text-slate-400">{product.sku}</td>
              <td className="px-6 py-4">
                <span className="bg-slate-700 text-blue-300 px-2 py-0.5 rounded text-xs font-medium">
                  {product.category}
                </span>
              </td>
              <td className="px-6 py-4 text-right font-bold text-emerald-400">{product.qty}</td>
              <td className="px-6 py-4 text-slate-400">{product.location}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const LogTable: React.FC<{ logs: Log[] }> = ({ logs }) => {
  if (logs.length === 0) return <div className="text-slate-500 italic p-4 text-center">No activity logs yet.</div>;

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-700 max-h-[400px]">
      <table className="w-full text-sm text-left text-slate-300">
        <thead className="text-xs uppercase bg-slate-800 text-slate-400 sticky top-0 z-10">
          <tr>
            <th className="px-6 py-3">Timestamp</th>
            <th className="px-6 py-3">Action</th>
            <th className="px-6 py-3">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {logs.map((log) => (
            <tr key={log.id} className="bg-slate-900/50 hover:bg-slate-800 transition-colors">
              <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">{log.timestamp}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded text-xs font-bold 
                  ${log.action === 'ADD_STOCK' ? 'bg-green-900 text-green-300' : 
                    log.action === 'MOVE_STOCK' ? 'bg-blue-900 text-blue-300' : 
                    log.action === 'ADJUST_STOCK' ? 'bg-orange-900 text-orange-300' : 'bg-slate-700 text-slate-300'}`}>
                  {log.action}
                </span>
              </td>
              <td className="px-6 py-4 text-slate-300">{log.details}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};