
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

// Function to import data from CSV
export function importFromCSV(csvContent: string, dataType: 'stock' | 'option'): any[] {
  const rows = csvContent.split('\n');
  const headers = rows[0].split(',');
  
  const data = rows.slice(1).map(row => {
    const values = row.split(',');
    const item: {[key: string]: any} = { id: crypto.randomUUID() };
    
    headers.forEach((header, index) => {
      // Try to parse numbers
      const value = values[index];
      const trimmedHeader = header.trim();
      
      if (!isNaN(Number(value))) {
        item[trimmedHeader] = Number(value);
      } else {
        item[trimmedHeader] = value;
      }
    });
    
    return item;
  });
  
  // Store the imported data
  if (dataType === 'stock') {
    localStorage.setItem('stockData', JSON.stringify([...getStockData(), ...data]));
  } else {
    localStorage.setItem('optionData', JSON.stringify([...getOptionData(), ...data]));
  }
  
  return data;
}

// Function to export data to CSV
export function exportToCSV(dataType: 'stock' | 'option'): string {
  const data = dataType === 'stock' ? getStockData() : getOptionData();
  
  if (data.length === 0) {
    return '';
  }
  
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(item => {
    return Object.values(item).join(',');
  });
  
  return [headers, ...rows].join('\n');
}
