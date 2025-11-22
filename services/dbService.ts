import { Product, Log } from '../types';

const PRODUCTS_KEY = 'stockmaster_products';
const LOGS_KEY = 'stockmaster_logs';

// Helper to generate IDs
const generateId = () => Date.now() + Math.floor(Math.random() * 1000);

export const initDb = (): void => {
  if (!localStorage.getItem(PRODUCTS_KEY)) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(LOGS_KEY)) {
    localStorage.setItem(LOGS_KEY, JSON.stringify([]));
  }
};

export const getProducts = (): Product[] => {
  const stored = localStorage.getItem(PRODUCTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getLogs = (): Log[] => {
  const stored = localStorage.getItem(LOGS_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveProducts = (products: Product[]) => {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
};

const addLog = (action: string, details: string, type: 'IN' | 'OUT' | 'MOVE' | 'ADJUST' | 'INFO' = 'INFO') => {
  const logs = getLogs();
  const newLog: Log = {
    id: generateId(),
    action,
    details,
    timestamp: new Date().toLocaleString(),
    type
  };
  // Prepend to show newest first
  localStorage.setItem(LOGS_KEY, JSON.stringify([newLog, ...logs]));
};

// Core Logic Functions

export const addProduct = (name: string, qty: number, location: string, category: string = "General") => {
  const products = getProducts();
  const existingIndex = products.findIndex(p => p.name.toLowerCase() === name.toLowerCase());

  if (existingIndex >= 0) {
    products[existingIndex].qty += qty;
    // Update location if provided, assuming it's the same product moving in
    products[existingIndex].location = location;
    saveProducts(products);
    addLog("RECEIPT", `Received ${qty} ${name} at ${location}. Total: ${products[existingIndex].qty}`, 'IN');
  } else {
    const newProduct: Product = {
      id: generateId(),
      name,
      sku: `SKU-${Math.floor(Math.random() * 10000)}`, // Auto-generate SKU
      category,
      qty,
      location,
      minStock: 10 // Default low stock threshold
    };
    products.push(newProduct);
    saveProducts(products);
    addLog("RECEIPT", `Created Product ${name}: +${qty} units at ${location} (${category})`, 'IN');
  }
};

export const deliverStock = (name: string, qty: number) => {
  const products = getProducts();
  const product = products.find(p => p.name.toLowerCase() === name.toLowerCase());

  if (product) {
    if (product.qty < qty) {
      throw new Error(`Insufficient stock for ${name}. Available: ${product.qty}`);
    }
    product.qty -= qty;
    saveProducts(products);
    addLog("DELIVERY", `Shipped ${qty} ${name}. Remaining: ${product.qty}`, 'OUT');
  } else {
    throw new Error(`Product "${name}" not found.`);
  }
};

export const moveProduct = (name: string, qty: number, to_location: string) => {
  const products = getProducts();
  const product = products.find(p => p.name.toLowerCase() === name.toLowerCase());

  if (product) {
    const oldLocation = product.location;
    // For simplicity in this model, we assume we move the whole "batch" or just update location record
    // If we wanted to support split stock, we'd need a different schema (ProductInstance vs ProductDefinition).
    // We will follow the requirement "Move 10 chairs" by updating the record conceptually.
    // Since schema has unique name, we'll assume the command implies the product's primary location changes
    // OR we are just logging a transfer of 'qty'.
    
    // If qty is specified and less than total, ideally we'd split. 
    // For this hackathon demo, we'll just update the location string to represent the new primary location
    // or just log the movement if it's partial, but let's update the record for visual feedback.
    
    product.location = to_location;
    saveProducts(products);
    addLog("INTERNAL TRANSFER", `Moved ${qty ? qty : 'stock'} of ${name} from ${oldLocation} to ${to_location}`, 'MOVE');
  } else {
    throw new Error(`Product "${name}" not found.`);
  }
};

export const adjustStock = (name: string, true_qty: number) => {
  const products = getProducts();
  const product = products.find(p => p.name.toLowerCase() === name.toLowerCase());

  if (product) {
    const oldQty = product.qty;
    const diff = true_qty - oldQty;
    product.qty = true_qty;
    saveProducts(products);
    addLog("ADJUSTMENT", `Audit ${name}: Corrected qty from ${oldQty} to ${true_qty} (${diff > 0 ? '+' : ''}${diff})`, 'ADJUST');
  } else {
    throw new Error(`Product "${name}" not found.`);
  }
};

// Helper to seed data if empty
export const seedData = () => {
  if (getProducts().length === 0) {
    addProduct("IPhones", 50, "Warehouse A", "Electronics");
    addProduct("Office Chairs", 5, "Showroom", "Furniture"); // Low stock
    addProduct("Steel Rods", 500, "Zone B", "Raw Material");
    addProduct("Laptop Stands", 8, "Zone A", "Accessories"); // Low stock
    
    // Simulate some logs
    addLog("RECEIPT", "Initial stock setup complete", "INFO");
  }
};