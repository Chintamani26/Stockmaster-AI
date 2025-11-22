export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  qty: number;
  location: string;
}

export interface Log {
  id: number;
  action: string;
  details: string;
  timestamp: string;
}

export enum ToolAction {
  ADD_STOCK = 'ADD_STOCK',
  MOVE_STOCK = 'MOVE_STOCK',
  ADJUST_STOCK = 'ADJUST_STOCK',
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