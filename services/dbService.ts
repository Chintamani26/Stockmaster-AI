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

const addLog = (action: string, details: string) => {
  const logs = getLogs();
  const newLog: Log = {
    id: generateId(),
    action,
    details,
    timestamp: new Date().toLocaleString(),
  };
  // Prepend to show newest first
  localStorage.setItem(LOGS_KEY, JSON.stringify([newLog, ...logs]));
};

// Core Logic Functions as described in requirements

export const addProduct = (name: string, qty: number, location: string, category: string = "General") => {
  const products = getProducts();
  const existingIndex = products.findIndex(p => p.name.toLowerCase() === name.toLowerCase());

  if (existingIndex >= 0) {
    products[existingIndex].qty += qty;
    // Optionally update location or category if provided? Requirements say "Updates qty if product exists"
    // We will stick to just updating qty for existing, but maybe update location if it moved?
    // Let's assume just qty update per requirement.
    saveProducts(products);
    addLog("ADD_STOCK", `Updated ${name}: +${qty} (Total: ${products[existingIndex].qty}) at ${products[existingIndex].location}`);
  } else {
    const newProduct: Product = {
      id: generateId(),
      name,
      sku: `SKU-${Math.floor(Math.random() * 10000)}`, // Auto-generate SKU
      category,
      qty,
      location
    };
    products.push(newProduct);
    saveProducts(products);
    addLog("ADD_STOCK", `Created ${name}: ${qty} units at ${location} (${category})`);
  }
};

export const moveProduct = (name: string, qty: number, to_location: string) => {
  const products = getProducts();
  const product = products.find(p => p.name.toLowerCase() === name.toLowerCase());

  if (product) {
    const oldLocation = product.location;
    product.location = to_location;
    // Note: The schema enforces UNIQUE name, so we move the entire product record conceptually in this simple model.
    // Ideally we'd split stock, but that requires a (name + location) unique constraint.
    // We adhere to the provided schema constraints where Name is Unique.
    saveProducts(products);
    addLog("MOVE_STOCK", `Moved ${qty ? qty : 'all'} ${name} from ${oldLocation} to ${to_location}`);
  } else {
    throw new Error(`Product "${name}" not found.`);
  }
};

export const adjustStock = (name: string, true_qty: number) => {
  const products = getProducts();
  const product = products.find(p => p.name.toLowerCase() === name.toLowerCase());

  if (product) {
    const oldQty = product.qty;
    product.qty = true_qty;
    saveProducts(products);
    addLog("ADJUST_STOCK", `Audit ${name}: Corrected qty from ${oldQty} to ${true_qty}`);
  } else {
    throw new Error(`Product "${name}" not found.`);
  }
};

// Helper to seed data if empty
export const seedData = () => {
  if (getProducts().length === 0) {
    addProduct("IPhones", 50, "Warehouse A", "Electronics");
    addProduct("Office Chairs", 120, "Showroom", "Furniture");
    addProduct("Steel Rods", 500, "Zone B", "Raw Material");
  }
};