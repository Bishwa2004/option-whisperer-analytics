import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getStockData, addStockData, getOptionData, addOptionData, importData, exportData } from "@/utils/dataManagement";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowUpDown, Plus, Download, Upload, Trash } from "lucide-react";

const DataManagement = () => {
  const [activeTab, setActiveTab] = useState("stocks");
  const [stockData, setStockData] = useState<any[]>([]);
  const [optionData, setOptionData] = useState<any[]>([]);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  // Stock form state
  const [stockSymbol, setStockSymbol] = useState("");
  const [stockName, setStockName] = useState("");
  const [stockPrice, setStockPrice] = useState("");
  const [stockVolume, setStockVolume] = useState("");
  const [stockDate, setStockDate] = useState("");
  
  // Option form state
  const [optionSymbol, setOptionSymbol] = useState("");
  const [optionStockSymbol, setOptionStockSymbol] = useState("");
  const [optionType, setOptionType] = useState("call");
  const [strikePrice, setStrikePrice] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [marketPrice, setMarketPrice] = useState("");
  const [impliedVolatility, setImpliedVolatility] = useState("");

  const refreshData = () => {
    setStockData(getStockData());
    setOptionData(getOptionData());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedStockData = [...stockData].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    
    if (typeof aValue === "string") {
      return sortDirection === "asc" 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    }
    
    return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
  });

  const sortedOptionData = [...optionData].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    
    if (typeof aValue === "string") {
      return sortDirection === "asc" 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    }
    
    return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
  });

  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stockSymbol || !stockName || !stockPrice) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields."
      });
      return;
    }
    
    const newStock = {
      symbol: stockSymbol,
      name: stockName,
      price: parseFloat(stockPrice),
      volume: stockVolume ? parseInt(stockVolume) : 0,
      date: stockDate || new Date().toISOString().split('T')[0]
    };
    
    addStockData(newStock);
    refreshData();
    
    // Reset form
    setStockSymbol("");
    setStockName("");
    setStockPrice("");
    setStockVolume("");
    setStockDate("");
    
    toast({
      title: "Stock Added",
      description: `${newStock.symbol} has been added to your data.`
    });
  };

  const handleAddOption = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!optionStockSymbol || !strikePrice || !expirationDate || !marketPrice) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields."
      });
      return;
    }
    
    const newOption = {
      symbol: optionSymbol || `${optionStockSymbol}${optionType.charAt(0).toUpperCase()}${strikePrice}`,
      stockSymbol: optionStockSymbol,
      optionType: optionType,
      strikePrice: parseFloat(strikePrice),
      expirationDate: expirationDate,
      marketPrice: parseFloat(marketPrice),
      impliedVolatility: impliedVolatility ? parseFloat(impliedVolatility) / 100 : undefined
    };
    
    addOptionData(newOption);
    refreshData();
    
    // Reset form
    setOptionSymbol("");
    setOptionStockSymbol("");
    setOptionType("call");
    setStrikePrice("");
    setExpirationDate("");
    setMarketPrice("");
    setImpliedVolatility("");
    
    toast({
      title: "Option Added",
      description: `${newOption.symbol} has been added to your data.`
    });
  };

  const handleExport = () => {
    const data = activeTab === "stocks" ? stockData : optionData;
    const filename = `${activeTab}_data_${new Date().toISOString().split('T')[0]}.json`;
    exportData(data, filename);
    
    toast({
      title: "Export successful",
      description: `${activeTab} data has been exported to ${filename}.`
    });
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        try {
          const data = JSON.parse(e.target.result as string);
          const importedData = importData(data, activeTab === "stocks" ? "stock" : "option");
          if (importedData) {
            refreshData();
            toast({
              title: "Import successful",
              description: `${importedData.length} ${activeTab} imported successfully.`
            });
          }
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Import failed",
            description: "The file format is not valid."
          });
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Management</h1>
        <p className="text-muted-foreground">
          Manage your stock and options data for analysis.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="stocks">Stocks</TabsTrigger>
          <TabsTrigger value="options">Options</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stocks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Stock Data</CardTitle>
              <CardDescription>
                Enter stock information to add to your database.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddStock} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="grid gap-2">
                  <Label htmlFor="stockSymbol">Symbol *</Label>
                  <Input 
                    id="stockSymbol" 
                    value={stockSymbol}
                    onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
                    placeholder="AAPL"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="stockName">Name *</Label>
                  <Input 
                    id="stockName" 
                    value={stockName}
                    onChange={(e) => setStockName(e.target.value)}
                    placeholder="Apple Inc."
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="stockPrice">Price *</Label>
                  <Input 
                    id="stockPrice" 
                    type="number"
                    step="0.01"
                    value={stockPrice}
                    onChange={(e) => setStockPrice(e.target.value)}
                    placeholder="150.00"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="stockVolume">Volume</Label>
                  <Input 
                    id="stockVolume" 
                    type="number"
                    value={stockVolume}
                    onChange={(e) => setStockVolume(e.target.value)}
                    placeholder="1000000"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="stockDate">Date</Label>
                  <Input 
                    id="stockDate" 
                    type="date"
                    value={stockDate}
                    onChange={(e) => setStockDate(e.target.value)}
                  />
                </div>
                
                <div className="flex items-end">
                  <Button type="submit" className="w-full">
                    <Plus className="mr-2 h-4 w-4" /> Add Stock
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Stock Data</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" /> Import
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Import Stock Data</DialogTitle>
                    <DialogDescription>
                      Upload a JSON file containing stock data.
                    </DialogDescription>
                  </DialogHeader>
                  <Input 
                    type="file" 
                    accept=".json" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleImport(e.target.files[0]);
                      }
                    }}
                  />
                  <DialogFooter>
                    <DialogTrigger asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogTrigger>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("symbol")}
                    >
                      Symbol {sortColumn === "symbol" && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                      )}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("name")}
                    >
                      Name {sortColumn === "name" && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                      )}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("price")}
                    >
                      Price {sortColumn === "price" && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                      )}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("volume")}
                    >
                      Volume {sortColumn === "volume" && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                      )}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("date")}
                    >
                      Date {sortColumn === "date" && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                      )}
                    </TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedStockData.length > 0 ? (
                    sortedStockData.map((stock) => (
                      <TableRow key={stock.id}>
                        <TableCell className="font-medium">{stock.symbol}</TableCell>
                        <TableCell>{stock.name}</TableCell>
                        <TableCell>${stock.price.toFixed(2)}</TableCell>
                        <TableCell>{stock.volume?.toLocaleString()}</TableCell>
                        <TableCell>{stock.date}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-destructive"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                        No stock data available. Add some stocks above.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="options" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Option Data</CardTitle>
              <CardDescription>
                Enter option contract information to add to your database.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddOption} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="grid gap-2">
                  <Label htmlFor="optionSymbol">Option Symbol (Optional)</Label>
                  <Input 
                    id="optionSymbol" 
                    value={optionSymbol}
                    onChange={(e) => setOptionSymbol(e.target.value.toUpperCase())}
                    placeholder="AAPL220121C00150000"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="optionStockSymbol">Stock Symbol *</Label>
                  <Input 
                    id="optionStockSymbol" 
                    value={optionStockSymbol}
                    onChange={(e) => setOptionStockSymbol(e.target.value.toUpperCase())}
                    placeholder="AAPL"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="optionType">Option Type *</Label>
                  <select
                    id="optionType"
                    value={optionType}
                    onChange={(e) => setOptionType(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="call">Call</option>
                    <option value="put">Put</option>
                  </select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="strikePrice">Strike Price *</Label>
                  <Input 
                    id="strikePrice" 
                    type="number"
                    step="0.01"
                    value={strikePrice}
                    onChange={(e) => setStrikePrice(e.target.value)}
                    placeholder="150.00"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="expirationDate">Expiration Date *</Label>
                  <Input 
                    id="expirationDate" 
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="marketPrice">Market Price *</Label>
                  <Input 
                    id="marketPrice" 
                    type="number"
                    step="0.01"
                    value={marketPrice}
                    onChange={(e) => setMarketPrice(e.target.value)}
                    placeholder="5.25"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="impliedVolatility">Implied Volatility (%)</Label>
                  <Input 
                    id="impliedVolatility" 
                    type="number"
                    step="0.01"
                    value={impliedVolatility}
                    onChange={(e) => setImpliedVolatility(e.target.value)}
                    placeholder="25.5"
                  />
                </div>
                
                <div className="flex items-end">
                  <Button type="submit" className="w-full">
                    <Plus className="mr-2 h-4 w-4" /> Add Option
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Option Data</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" /> Import
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Import Option Data</DialogTitle>
                    <DialogDescription>
                      Upload a JSON file containing option data.
                    </DialogDescription>
                  </DialogHeader>
                  <Input 
                    type="file" 
                    accept=".json" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleImport(e.target.files[0]);
                      }
                    }}
                  />
                  <DialogFooter>
                    <DialogTrigger asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogTrigger>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("symbol")}
                    >
                      Symbol {sortColumn === "symbol" && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                      )}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("stockSymbol")}
                    >
                      Stock {sortColumn === "stockSymbol" && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                      )}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("optionType")}
                    >
                      Type {sortColumn === "optionType" && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                      )}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("strikePrice")}
                    >
                      Strike {sortColumn === "strikePrice" && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                      )}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("expirationDate")}
                    >
                      Expiration {sortColumn === "expirationDate" && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                      )}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("marketPrice")}
                    >
                      Price {sortColumn === "marketPrice" && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                      )}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("impliedVolatility")}
                    >
                      IV {sortColumn === "impliedVolatility" && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                      )}
                    </TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedOptionData.length > 0 ? (
                    sortedOptionData.map((option) => (
                      <TableRow key={option.id}>
                        <TableCell className="font-medium">{option.symbol}</TableCell>
                        <TableCell>{option.stockSymbol}</TableCell>
                        <TableCell className={option.optionType === "call" ? "text-finance-green" : "text-finance-red"}>
                          {option.optionType.toUpperCase()}
                        </TableCell>
                        <TableCell>${option.strikePrice.toFixed(2)}</TableCell>
                        <TableCell>{option.expirationDate}</TableCell>
                        <TableCell>${option.marketPrice.toFixed(2)}</TableCell>
                        <TableCell>
                          {option.impliedVolatility ? `${(option.impliedVolatility * 100).toFixed(1)}%` : "N/A"}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-destructive"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                        No option data available. Add some options above.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataManagement;
