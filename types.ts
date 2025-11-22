export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  qty: number;
  location: string;
  minStock?: number; // For low stock alerts
}

export interface Log {
  id: number;
  action: string; // RECEIPT, DELIVERY, TRANSFER, ADJUSTMENT
  details: string;
  timestamp: string;
  type: 'IN' | 'OUT' | 'MOVE' | 'ADJUST' | 'INFO';
}

export enum ToolAction {
  ADD_STOCK = 'ADD_STOCK', // Receipt
  DELIVER_STOCK = 'DELIVER_STOCK', // Delivery Order
  MOVE_STOCK = 'MOVE_STOCK', // Internal Transfer
  ADJUST_STOCK = 'ADJUST_STOCK', // Inventory Adjustment
  REPORT = 'REPORT',
  UNKNOWN = 'UNKNOWN'
}

export interface AICommandResponse {
  tool: ToolAction;
  name?: string;
  qty?: number;
  location?: string; // For ADD_STOCK
  to_location?: string; // For MOVE_STOCK
  true_qty?: number; // For ADJUST_STOCK
  category?: string;
  error?: string;
}