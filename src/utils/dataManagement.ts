export interface StockData {
  id: string;
  symbol: string;
  date: string;
  price: number;
  volume: number;
  [key: string]: any;
}

export interface OptionData {
  id: string;
  stockSymbol: string;
  strikePrice: number;
  expirationDate: string;
  optionType: "call" | "put";
  marketPrice: number;
  impliedVolatility?: number;
  delta?: number;
  gamma?: number;
  theta?: number;
  vega?: number;
  rho?: number;
}

// In a real application, this would be an API call
// For now, we'll use localStorage to simulate data persistence
export function saveStockData(data: StockData): StockData {
  const existingData = getStockData();
  const updatedData = [...existingData.filter(item => item.id !== data.id), data];
  localStorage.setItem('stockData', JSON.stringify(updatedData));
  return data;
}

export function getStockData(): StockData[] {
  const storedData = localStorage.getItem('stockData');
  return storedData ? JSON.parse(storedData) : [];
}

export function deleteStockData(id: string): boolean {
  const existingData = getStockData();
  const updatedData = existingData.filter(item => item.id !== id);
  localStorage.setItem('stockData', JSON.stringify(updatedData));
  return true;
}

export function saveOptionData(data: OptionData): OptionData {
  const existingData = getOptionData();
  const updatedData = [...existingData.filter(item => item.id !== data.id), data];
  localStorage.setItem('optionData', JSON.stringify(updatedData));
  return data;
}

export function getOptionData(): OptionData[] {
  const storedData = localStorage.getItem('optionData');
  return storedData ? JSON.parse(storedData) : [];
}

export function deleteOptionData(id: string): boolean {
  const existingData = getOptionData();
  const updatedData = existingData.filter(item => item.id !== id);
  localStorage.setItem('optionData', JSON.stringify(updatedData));
  return true;
}

// Updated function to properly handle optionType as "call" | "put"
export function addOptionData(data: Partial<OptionData>): OptionData {
  // Ensure optionType is either "call" or "put"
  let optionType: "call" | "put" = "call";
  if (data.optionType === "put") {
    optionType = "put";
  }
  
  const newOption: OptionData = {
    id: crypto.randomUUID(),
    stockSymbol: data.stockSymbol || '',
    strikePrice: data.strikePrice || 0,
    expirationDate: data.expirationDate || '',
    optionType: optionType,
    marketPrice: data.marketPrice || 0,
    impliedVolatility: data.impliedVolatility,
    delta: data.delta,
    gamma: data.gamma,
    theta: data.theta,
    vega: data.vega,
    rho: data.rho
  };
  
  return saveOptionData(newOption);
}

export function addStockData(data: Partial<StockData>): StockData {
  const newStock: StockData = {
    id: crypto.randomUUID(),
    symbol: data.symbol || '',
    date: data.date || new Date().toISOString().split('T')[0],
    price: data.price || 0,
    volume: data.volume || 0,
    ...data
  };
  
  return saveStockData(newStock);
}

export function importData(data: any[], dataType: 'stock' | 'option'): any[] {
  if (dataType === 'stock') {
    const stockData = data.map(item => addStockData(item));
    return stockData;
  } else {
    const optionData = data.map(item => addOptionData(item));
    return optionData;
  }
}

export function exportData(data: any[], filename: string): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const importFromCSV = importData;
export const exportToCSV = (dataType: 'stock' | 'option'): string => {
  const data = dataType === 'stock' ? getStockData() : getOptionData();
  const headers = data.length > 0 ? Object.keys(data[0]).join(',') : '';
  const rows = data.map(item => Object.values(item).join(','));
  return [headers, ...rows].join('\n');
};
