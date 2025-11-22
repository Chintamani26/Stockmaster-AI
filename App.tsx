import React, { useState, useEffect } from 'react';
import { initDb, getProducts, getLogs, addProduct, moveProduct, adjustStock, seedData } from './services/dbService';
import { parseNaturalLanguageCommand } from './services/geminiService';
import { Product, Log, ToolAction } from './types';
import MetricsCards from './components/MetricsCards';
import InventoryChart from './components/InventoryChart';
import { InventoryTable, LogTable } from './components/Tables';

// Icons
const SendIcon = () => (
  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
);
const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
);

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info', msg: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'inventory' | 'logs'>('inventory');

  // Initialization
  useEffect(() => {
    initDb();
    seedData();
    refreshData();
  }, []);

  const refreshData = () => {
    setProducts(getProducts());
    setLogs(getLogs());
  };

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setStatus(null);

    try {
      const result = await parseNaturalLanguageCommand(input);
      console.log("AI Result:", result);

      if (result.error) {
        throw new Error(result.error);
      }

      let successMsg = "";

      switch (result.tool) {
        case ToolAction.ADD_STOCK:
          if (!result.name || !result.qty || !result.location) throw new Error("Missing parameters for Adding Stock.");
          addProduct(result.name, result.qty, result.location, result.category);
          successMsg = `Added ${result.qty} ${result.name} to ${result.location}.`;
          break;

        case ToolAction.MOVE_STOCK:
          if (!result.name || !result.to_location) throw new Error("Missing parameters for Moving Stock.");
          moveProduct(result.name, result.qty || 0, result.to_location);
          successMsg = `Moved ${result.name} to ${result.to_location}.`;
          break;

        case ToolAction.ADJUST_STOCK:
          if (!result.name || result.true_qty === undefined) throw new Error("Missing parameters for Adjustment.");
          adjustStock(result.name, result.true_qty);
          successMsg = `Adjusted ${result.name} to ${result.true_qty}.`;
          break;

        case ToolAction.REPORT:
          successMsg = "Report requested. See the Live Warehouse State.";
          break;

        default:
          throw new Error("Unknown command. Please try again.");
      }

      setStatus({ type: 'success', msg: successMsg });
      setInput('');
      refreshData();

    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message || "An error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Column: AI Command Center (40%) */}
      <div className="w-full lg:w-2/5 bg-slate-900 p-6 flex flex-col border-r border-slate-800">
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-2">
            <div className="h-3 w-3 bg-blue-500 rounded-full animate-pulse"></div>
            <h1 className="text-2xl font-bold text-white tracking-tight">StockMaster AI</h1>
          </div>
          <p className="text-slate-400 text-sm">Intelligent Inventory Management System</p>
        </div>

        <div className="flex-grow flex flex-col justify-center max-w-lg mx-auto w-full">
          <div className="mb-6">
             <h2 className="text-lg font-semibold text-slate-200 mb-3">Command Center</h2>
             <p className="text-slate-400 text-sm mb-4">
               Enter natural language commands to manage your inventory without complex forms.
             </p>
             <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 text-xs text-slate-400 space-y-2">
               <p className="font-semibold text-slate-300">Try typing:</p>
               <ul className="list-disc pl-4 space-y-1">
                 <li>"Received 50 iPhones at Warehouse A"</li>
                 <li>"Move Steel Rods to the Showroom"</li>
                 <li>"Correct stock of Office Chairs to 115"</li>
               </ul>
             </div>
          </div>

          <form onSubmit={handleCommand} className="relative">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                placeholder="Type a command..."
                className="w-full bg-slate-950 text-white border border-slate-700 rounded-xl py-4 px-5 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-xl placeholder-slate-600 disabled:opacity-50 transition-all"
              />
              {loading && (
                 <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                 </div>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="mt-4 w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-medium py-3 px-6 rounded-xl flex items-center justify-center transition-all disabled:opacity-50 shadow-lg shadow-blue-900/20"
            >
              Execute Command
              <SendIcon />
            </button>
          </form>

          {status && (
            <div className={`mt-6 p-4 rounded-xl border flex items-start space-x-3 animate-fadeIn ${
              status.type === 'success' ? 'bg-green-900/20 border-green-800 text-green-200' :
              status.type === 'error' ? 'bg-red-900/20 border-red-800 text-red-200' :
              'bg-blue-900/20 border-blue-800 text-blue-200'
            }`}>
              <div className={`mt-0.5 flex-shrink-0 w-2 h-2 rounded-full ${
                 status.type === 'success' ? 'bg-green-500' :
                 status.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
              }`}></div>
              <span className="text-sm">{status.msg}</span>
            </div>
          )}
        </div>
        
        <div className="mt-auto pt-6 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-600">Powered by Google Gemini 2.5 Flash</p>
        </div>
      </div>

      {/* Right Column: Live Warehouse State (60%) */}
      <div className="w-full lg:w-3/5 bg-slate-950 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-100">Live Warehouse State</h2>
          <button 
            onClick={refreshData}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
            title="Refresh Data"
          >
            <RefreshIcon />
          </button>
        </div>

        <MetricsCards products={products} logs={logs} />

        <div className="space-y-6">
          {/* Chart Section */}
          <InventoryChart products={products} />

          {/* Tabs Section */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
            <div className="flex border-b border-slate-800">
              <button
                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'inventory' ? 'bg-slate-800 text-white border-b-2 border-blue-500' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
                onClick={() => setActiveTab('inventory')}
              >
                Inventory List
              </button>
              <button
                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'logs' ? 'bg-slate-800 text-white border-b-2 border-blue-500' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
                onClick={() => setActiveTab('logs')}
              >
                Audit Log
              </button>
            </div>
            <div className="p-0">
              {activeTab === 'inventory' ? (
                <InventoryTable products={products} />
              ) : (
                <LogTable logs={logs} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}