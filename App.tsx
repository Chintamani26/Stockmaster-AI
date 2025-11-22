import React, { useState, useEffect } from 'react';
import { initDb, getProducts, getLogs, addProduct, moveProduct, deliverStock, adjustStock, seedData } from './services/dbService';
import { parseNaturalLanguageCommand } from './services/geminiService';
import { Product, Log, ToolAction } from './types';
import MetricsCards from './components/MetricsCards';
import InventoryChart from './components/InventoryChart';
import { InventoryTable, LogTable } from './components/Tables';

// --- ICONS ---
const SendIcon = () => <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>;
const DashboardIcon = () => <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>;
const BoxIcon = () => <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>;
const HistoryIcon = () => <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
const ChatIcon = () => <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>;
const LogoutIcon = () => <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>;

type View = 'dashboard' | 'inventory' | 'history' | 'ai_console';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  
  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  
  // AI State
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  useEffect(() => {
    initDb();
    seedData();
    refreshData();
  }, []);

  const refreshData = () => {
    setProducts(getProducts());
    setLogs(getLogs());
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
  };

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setStatus(null);

    try {
      const result = await parseNaturalLanguageCommand(input);
      let successMsg = "";

      if (result.error) throw new Error(result.error);

      switch (result.tool) {
        case ToolAction.ADD_STOCK:
          if (!result.name || !result.qty || !result.location) throw new Error("Missing receipt details.");
          addProduct(result.name, result.qty, result.location, result.category);
          successMsg = `Receipt Validated: ${result.qty} ${result.name} added to ${result.location}.`;
          break;

        case ToolAction.DELIVER_STOCK:
          if (!result.name || !result.qty) throw new Error("Missing delivery details.");
          deliverStock(result.name, result.qty);
          successMsg = `Delivery Order Validated: Shipped ${result.qty} ${result.name}.`;
          break;

        case ToolAction.MOVE_STOCK:
          if (!result.name || !result.to_location) throw new Error("Missing transfer details.");
          moveProduct(result.name, result.qty || 0, result.to_location);
          successMsg = `Transfer Complete: Moved ${result.name} to ${result.to_location}.`;
          break;

        case ToolAction.ADJUST_STOCK:
          if (!result.name || result.true_qty === undefined) throw new Error("Missing adjustment details.");
          adjustStock(result.name, result.true_qty);
          successMsg = `Stock Corrected: ${result.name} set to ${result.true_qty}.`;
          break;

        case ToolAction.REPORT:
          successMsg = "Dashboard updated with latest metrics.";
          setCurrentView('dashboard');
          break;

        default:
          throw new Error("I didn't understand that command.");
      }

      setStatus({ type: 'success', msg: successMsg });
      setInput('');
      refreshData();
      if (currentView !== 'ai_console') {
          // Show a small notification or stay on current view, but if it's critical maybe switch?
          // Let's just refresh data.
      }

    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message || "Processing failed." });
    } finally {
      setLoading(false);
    }
  };

  // LOGIN SCREEN
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-blue-900/50">
               <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">StockMaster AI</h1>
            <p className="text-slate-400 mb-8">Next-Gen Inventory Management System</p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input type="email" placeholder="Inventory Manager Email" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" required />
              </div>
              <div>
                <input type="password" placeholder="Password" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" required />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-blue-900/30">
                Login to Dashboard
              </button>
            </form>
            <p className="mt-6 text-xs text-slate-600">Protected by OTP Authentication (Demo)</p>
          </div>
        </div>
      </div>
    );
  }

  // MAIN APP
  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-200 font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
             <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">StockMaster</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button onClick={() => setCurrentView('dashboard')} className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${currentView === 'dashboard' ? 'bg-blue-900/30 text-blue-400 font-medium' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
            <DashboardIcon /> Dashboard
          </button>
          <button onClick={() => setCurrentView('inventory')} className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${currentView === 'inventory' ? 'bg-blue-900/30 text-blue-400 font-medium' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
            <BoxIcon /> Products
          </button>
          <button onClick={() => setCurrentView('history')} className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${currentView === 'history' ? 'bg-blue-900/30 text-blue-400 font-medium' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
            <HistoryIcon /> Operations Log
          </button>
          
          <div className="pt-4 mt-4 border-t border-slate-800">
            <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">AI Tools</p>
            <button onClick={() => setCurrentView('ai_console')} className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${currentView === 'ai_console' ? 'bg-purple-900/20 text-purple-300 font-medium border border-purple-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
              <ChatIcon /> AI Command Center
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
           <button onClick={() => setIsLoggedIn(false)} className="w-full flex items-center px-4 py-2 text-sm text-slate-500 hover:text-red-400 transition-colors">
             <LogoutIcon /> Logout
           </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="ml-64 flex-1 flex flex-col min-h-screen relative">
        
        {/* TOP HEADER (Mobile/Tablet friendly if needed, currently simplified) */}
        <header className="h-16 bg-slate-950/80 backdrop-blur border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10">
           <h2 className="text-lg font-semibold text-slate-100 capitalize">
             {currentView.replace('_', ' ')}
           </h2>
           <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1 bg-slate-900 rounded-full border border-slate-800">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-slate-400">System Online</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400">
                IM
              </div>
           </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          
          {/* DASHBOARD VIEW */}
          {currentView === 'dashboard' && (
            <div className="space-y-8 animate-fadeIn">
              <MetricsCards products={products} logs={logs} />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <InventoryChart products={products} />
                </div>
                <div className="lg:col-span-1 bg-slate-900 rounded-xl border border-slate-800 p-6">
                  <h3 className="text-slate-200 font-bold mb-4">Quick AI Actions</h3>
                  <div className="space-y-3">
                    <button onClick={() => { setInput("Received 50 Steel Rods at Warehouse A"); setCurrentView('ai_console'); }} className="w-full text-left p-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-slate-300 transition-colors border border-slate-700">
                      Incoming: "Received 50 Steel Rods..."
                    </button>
                    <button onClick={() => { setInput("Deliver 10 Office Chairs to Customer X"); setCurrentView('ai_console'); }} className="w-full text-left p-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-slate-300 transition-colors border border-slate-700">
                      Outgoing: "Deliver 10 Chairs..."
                    </button>
                    <button onClick={() => { setInput("Move 20 iPhones to Showroom"); setCurrentView('ai_console'); }} className="w-full text-left p-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-slate-300 transition-colors border border-slate-700">
                      Transfer: "Move 20 iPhones..."
                    </button>
                  </div>
                </div>
              </div>
              
              <div>
                 <h3 className="text-lg font-bold text-slate-200 mb-4">Recent Activity</h3>
                 <LogTable logs={logs.slice(0, 5)} />
              </div>
            </div>
          )}

          {/* INVENTORY VIEW */}
          {currentView === 'inventory' && (
            <div className="animate-fadeIn">
              <div className="flex justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Current Stock</h3>
              </div>
              <InventoryTable products={products} />
            </div>
          )}

          {/* HISTORY VIEW */}
          {currentView === 'history' && (
            <div className="animate-fadeIn">
              <h3 className="text-xl font-bold text-white mb-6">Operations Log</h3>
              <LogTable logs={logs} />
            </div>
          )}

          {/* AI CONSOLE VIEW */}
          {currentView === 'ai_console' && (
            <div className="animate-fadeIn max-w-3xl mx-auto">
               <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
                  <div className="p-8 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800">
                    <h2 className="text-2xl font-bold text-white mb-2">AI Command Center</h2>
                    <p className="text-slate-400">Execute complex inventory operations with natural language.</p>
                  </div>
                  
                  <div className="p-8 space-y-6">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-sm text-slate-400">
                      <p className="font-semibold text-slate-300 mb-2">Supported Commands:</p>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                         <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>Receipts: "Received 100 items..."</li>
                         <li className="flex items-center"><span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>Deliveries: "Deliver 20 units..."</li>
                         <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>Transfers: "Move 5 boxes to Zone B"</li>
                         <li className="flex items-center"><span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>Adjustments: "Correct stock to 50"</li>
                      </ul>
                    </div>

                    <form onSubmit={handleCommand} className="relative">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={loading}
                        placeholder="Describe the operation..."
                        className="w-full bg-slate-800 text-white border-2 border-slate-700 rounded-xl py-5 px-6 pr-14 focus:outline-none focus:border-blue-500 focus:ring-0 shadow-inner text-lg placeholder-slate-600 transition-colors"
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="absolute right-3 top-3 bottom-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center transition-all disabled:opacity-50"
                      >
                        {loading ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div> : <SendIcon />}
                      </button>
                    </form>

                    {status && (
                      <div className={`p-4 rounded-xl border flex items-center space-x-3 ${status.type === 'success' ? 'bg-green-900/20 border-green-900 text-green-300' : 'bg-red-900/20 border-red-900 text-red-300'}`}>
                         <div className={`w-2 h-2 rounded-full ${status.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                         <span>{status.msg}</span>
                      </div>
                    )}
                  </div>
               </div>
            </div>
          )}
          
        </div>
      </main>
    </div>
  );
}