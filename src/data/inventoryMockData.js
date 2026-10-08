export const MOCK_INVENTORY = [];
export const STOCK_ADJUST_REASONS = ['Restock', 'Damage', 'Loss', 'Correction', 'Return'];
export const INVENTORY_KPIS = {};
export function calculateInventoryKPIs(list = []) {
  const data = Array.isArray(list) ? list : [];
  let totalStockUnits = 0;
  let inStock = 0;
  let lowStock = 0;
  let outOfStock = 0;
  data.forEach(item => {
    const qty = Number(item.currentStock) || 0;
    const threshold = Number(item.lowStockThreshold) || LOW_STOCK_THRESHOLD;
    totalStockUnits += qty;
    if (qty <= 0) outOfStock++;
    else if (qty <= threshold) lowStock++;
    else inStock++;
  });
  return { totalStockUnits, inStock, lowStock, outOfStock };
}
export const LOW_STOCK_THRESHOLD = 5;
