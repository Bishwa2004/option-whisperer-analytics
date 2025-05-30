
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

export interface PortfolioItem {
  id: string;
  symbol: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  currentPrice?: number;
  portfolioName: string;
}

export interface ApiConfig {
  apiKey: string;
  endpoint: string;
  enabled: boolean;
}

// API configuration management
export function saveApiConfig(config: ApiConfig): ApiConfig {
  localStorage.setItem('apiConfig', JSON.stringify(config));
  return config;
}

export function getApiConfig(): ApiConfig {
  const storedConfig = localStorage.getItem('apiConfig');
  return storedConfig 
    ? JSON.parse(storedConfig) 
    : { apiKey: '', endpoint: 'https://api.example.com/v1', enabled: false };
}

// Function to fetch stock data from API
export async function fetchStockDataFromApi(symbol: string): Promise<Partial<StockData> | null> {
  const config = getApiConfig();
  
  if (!config.enabled || !config.apiKey) {
    console.log('API is not enabled or API key is missing');
    return null;
  }
  
  try {
    const response = await fetch(`${config.endpoint}/stock/${symbol}?apiKey=${config.apiKey}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      symbol: data.symbol,
      price: parseFloat(data.price),
      volume: parseInt(data.volume),
      date: data.lastTradeDate || new Date().toISOString().split('T')[0],
      name: data.companyName
    };
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return null;
  }
}

// Function to fetch option data from API
export async function fetchOptionDataFromApi(
  stockSymbol: string, 
  strikePrice: number,
  expirationDate: string,
  optionType: "call" | "put"
): Promise<Partial<OptionData> | null> {
  const config = getApiConfig();
  
  if (!config.enabled || !config.apiKey) {
    console.log('API is not enabled or API key is missing');
    return null;
  }
  
  try {
    const response = await fetch(
      `${config.endpoint}/options/${stockSymbol}?strike=${strikePrice}&expiration=${expirationDate}&type=${optionType}&apiKey=${config.apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      stockSymbol,
      strikePrice,
      expirationDate,
      optionType,
      marketPrice: parseFloat(data.lastPrice),
      impliedVolatility: parseFloat(data.impliedVolatility),
      delta: parseFloat(data.delta),
      gamma: parseFloat(data.gamma),
      theta: parseFloat(data.theta),
      vega: parseFloat(data.vega),
      rho: parseFloat(data.rho)
    };
  } catch (error) {
    console.error('Error fetching option data:', error);
    return null;
  }
}

// Function to update portfolio prices from API
export async function updatePortfolioPricesFromApi(): Promise<PortfolioItem[]> {
  const portfolioItems = getPortfolioItems();
  const config = getApiConfig();
  
  if (!config.enabled || !config.apiKey || portfolioItems.length === 0) {
    return portfolioItems;
  }
  
  try {
    // Get unique symbols to minimize API calls
    const symbols = [...new Set(portfolioItems.map(item => item.symbol))];
    const symbolData: Record<string, number> = {};
    
    // Fetch current prices for all symbols
    for (const symbol of symbols) {
      const stockData = await fetchStockDataFromApi(symbol);
      if (stockData && stockData.price) {
        symbolData[symbol] = stockData.price;
      }
    }
    
    // Update portfolio items with current prices
    const updatedItems = portfolioItems.map(item => ({
      ...item,
      currentPrice: symbolData[item.symbol] || item.currentPrice || item.purchasePrice
    }));
    
    // Save updated portfolio items
    localStorage.setItem('portfolioData', JSON.stringify(updatedItems));
    
    return updatedItems;
  } catch (error) {
    console.error('Error updating portfolio prices:', error);
    return portfolioItems;
  }
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

// Portfolio management functions
export function savePortfolioItem(data: PortfolioItem): PortfolioItem {
  const existingData = getPortfolioItems();
  const updatedData = [...existingData.filter(item => item.id !== data.id), data];
  localStorage.setItem('portfolioData', JSON.stringify(updatedData));
  return data;
}

export function getPortfolioItems(): PortfolioItem[] {
  const storedData = localStorage.getItem('portfolioData');
  return storedData ? JSON.parse(storedData) : [];
}

export function deletePortfolioItem(id: string): boolean {
  const existingData = getPortfolioItems();
  const updatedData = existingData.filter(item => item.id !== id);
  localStorage.setItem('portfolioData', JSON.stringify(updatedData));
  return true;
}

export function addPortfolioItem(data: Partial<PortfolioItem>): PortfolioItem {
  const newItem: PortfolioItem = {
    id: crypto.randomUUID(),
    symbol: data.symbol || '',
    quantity: data.quantity || 0,
    purchasePrice: data.purchasePrice || 0,
    purchaseDate: data.purchaseDate || new Date().toISOString().split('T')[0],
    currentPrice: data.currentPrice || data.purchasePrice,
    portfolioName: data.portfolioName || 'Default Portfolio'
  };
  
  return savePortfolioItem(newItem);
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

export function importData(data: any[], dataType: 'stock' | 'option' | 'portfolio'): any[] {
  if (dataType === 'stock') {
    const stockData = data.map(item => addStockData(item));
    return stockData;
  } else if (dataType === 'option') {
    const optionData = data.map(item => addOptionData(item));
    return optionData;
  } else {
    const portfolioData = data.map(item => addPortfolioItem(item));
    return portfolioData;
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
export const exportToCSV = (dataType: 'stock' | 'option' | 'portfolio'): string => {
  let data;
  if (dataType === 'stock') {
    data = getStockData();
  } else if (dataType === 'option') {
    data = getOptionData();
  } else {
    data = getPortfolioItems();
  }
  
  const headers = data.length > 0 ? Object.keys(data[0]).join(',') : '';
  const rows = data.map(item => Object.values(item).join(','));
  return [headers, ...rows].join('\n');
};

