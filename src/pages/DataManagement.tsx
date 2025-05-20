
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  getStockData, 
  getOptionData, 
  saveStockData, 
  saveOptionData,
  deleteStockData,
  deleteOptionData,
  importFromCSV,
  exportToCSV
} from "@/utils/dataManagement";
import { 
  Download, 
  Upload, 
  Trash2, 
  Plus,
  Search,
  FileText
} from "lucide-react";

interface StockFormData {
  id: string;
  symbol: string;
  date: string;
  price: number;
  volume: number;
  [key: string]: any;
}

interface OptionFormData {
  id: string;
  stockSymbol: string;
  strikePrice: number;
  expirationDate: string;
  optionType: "call" | "put";
  marketPrice: number;
}

const DataManagement = () => {
  const { toast } = useToast();
  const [stockData, setStockData] = useState<StockFormData[]>([]);
  const [optionData, setOptionData] = useState<OptionFormData[]>([]);
  const [stockFormData, setStockFormData] = useState<StockFormData>({
    id: crypto.randomUUID(),
    symbol: "",
    date: new Date().toISOString().split("T")[0],
    price: 0,
    volume: 0,
  });
  const [optionFormData, setOptionFormData] = useState<OptionFormData>({
    id: crypto.randomUUID(),
    stockSymbol: "",
    strikePrice: 0,
    expirationDate: new Date().toISOString().split("T")[0],
    optionType: "call",
    marketPrice: 0,
  });
  const [fileContent, setFileContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Load data on component mount
  useEffect(() => {
    refreshData();
  }, []);

  // Refresh data from storage
  const refreshData = () => {
    setStockData(getStockData());
    setOptionData(getOptionData());
  };

  // Filter data based on search term
  const filteredStockData = stockData.filter(
    (stock) => stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOptionData = optionData.filter(
    (option) => option.stockSymbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle stock form input changes
  const handleStockFormChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof StockFormData
  ) => {
    const value = field === "symbol" ? e.target.value : parseFloat(e.target.value);
    setStockFormData({ ...stockFormData, [field]: value });
  };

  // Handle option form input changes
  const handleOptionFormChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof OptionFormData
  ) => {
    const value =
      field === "stockSymbol" || field === "expirationDate"
        ? e.target.value
        : parseFloat(e.target.value);
    setOptionFormData({ ...optionFormData, [field]: value });
  };

  // Handle option type select change
  const handleOptionTypeChange = (value: "call" | "put") => {
    setOptionFormData({ ...optionFormData, optionType: value });
  };

  // Add stock data
  const addStockData = () => {
    if (stockFormData.symbol === "" || stockFormData.price <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please enter a valid symbol and price.",
      });
      return;
    }

    saveStockData(stockFormData);
    refreshData();
    setStockFormData({
      id: crypto.randomUUID(),
      symbol: "",
      date: new Date().toISOString().split("T")[0],
      price: 0,
      volume: 0,
    });

    toast({
      title: "Stock Data Added",
      description: `Added ${stockFormData.symbol} data successfully.`,
    });
  };

  // Add option data
  const addOptionData = () => {
    if (
      optionFormData.stockSymbol === "" ||
      optionFormData.strikePrice <= 0 ||
      optionFormData.marketPrice <= 0
    ) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please enter valid option data.",
      });
      return;
    }

    saveOptionData(optionFormData);
    refreshData();
    setOptionFormData({
      id: crypto.randomUUID(),
      stockSymbol: "",
      strikePrice: 0,
      expirationDate: new Date().toISOString().split("T")[0],
      optionType: "call",
      marketPrice: 0,
    });

    toast({
      title: "Option Data Added",
      description: `Added ${optionFormData.stockSymbol} option data successfully.`,
    });
  };

  // Delete stock data
  const removeStockData = (id: string) => {
    deleteStockData(id);
    refreshData();
    toast({
      title: "Stock Data Deleted",
      description: "The stock data has been removed.",
    });
  };

  // Delete option data
  const removeOptionData = (id: string) => {
    deleteOptionData(id);
    refreshData();
    toast({
      title: "Option Data Deleted",
      description: "The option data has been removed.",
    });
  };

  // Handle file upload for import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFileContent(content);
    };
    reader.readAsText(file);
  };

  // Import data from CSV
  const handleImport = (dataType: "stock" | "option") => {
    if (!fileContent) {
      toast({
        variant: "destructive",
        title: "No File Selected",
        description: "Please select a CSV file to import.",
      });
      return;
    }

    try {
      importFromCSV(fileContent, dataType);
      refreshData();
      setFileContent("");

      toast({
        title: "Data Imported",
        description: `Successfully imported ${dataType} data.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: "There was an error importing the data. Check your file format.",
      });
    }
  };

  // Export data to CSV
  const handleExport = (dataType: "stock" | "option") => {
    const csvContent = exportToCSV(dataType);
    if (!csvContent) {
      toast({
        variant: "destructive",
        title: "No Data to Export",
        description: `There is no ${dataType} data to export.`,
      });
      return;
    }

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${dataType}_data.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Data Exported",
      description: `${dataType} data has been exported as a CSV file.`,
    });
  };

  // Clear sample data
  const clearSampleData = () => {
    const data = dataType === "stock" ? getStockData() : getOptionData();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Management</h1>
        <p className="text-muted-foreground">
          Manage your stock and options data for analysis
        </p>
      </div>

      <div className="flex justify-between items-center">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by symbol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-[250px]"
          />
        </div>
        <div className="flex gap-2">
          <label className="cursor-pointer">
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button variant="outline" asChild>
              <span>
                <Upload className="mr-2 h-4 w-4" />
                Select CSV
              </span>
            </Button>
          </label>
        </div>
      </div>

      <Tabs defaultValue="stock">
        <TabsList className="w-full">
          <TabsTrigger value="stock" className="flex-1">
            Stock Data
          </TabsTrigger>
          <TabsTrigger value="option" className="flex-1">
            Option Data
          </TabsTrigger>
        </TabsList>
        <TabsContent value="stock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Stock Data</CardTitle>
              <CardDescription>
                Enter stock price and volume information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="symbol">Symbol</Label>
                  <Input
                    id="symbol"
                    value={stockFormData.symbol}
                    onChange={(e) => handleStockFormChange(e, "symbol")}
                    placeholder="AAPL"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={stockFormData.date}
                    onChange={(e) => 
                      setStockFormData({
                        ...stockFormData,
                        date: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={stockFormData.price || ""}
                    onChange={(e) => handleStockFormChange(e, "price")}
                    min={0.01}
                    step={0.01}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="volume">Volume</Label>
                  <Input
                    id="volume"
                    type="number"
                    value={stockFormData.volume || ""}
                    onChange={(e) => handleStockFormChange(e, "volume")}
                    min={0}
                    step={1}
                    placeholder="0"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addStockData} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add
                  </Button>
                </div>
              </div>
              <div className="flex justify-between mt-4">
                <Button
                  variant="outline"
                  onClick={() => handleImport("stock")}
                  disabled={!fileContent}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Import Data
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExport("stock")}
                  disabled={stockData.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stock Data</CardTitle>
              <CardDescription>
                Your saved stock price information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredStockData.length > 0 ? (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Volume</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStockData.map((stock) => (
                        <TableRow key={stock.id}>
                          <TableCell className="font-medium">
                            {stock.symbol}
                          </TableCell>
                          <TableCell>{stock.date}</TableCell>
                          <TableCell>${stock.price.toFixed(2)}</TableCell>
                          <TableCell>
                            {stock.volume.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeStockData(stock.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  {searchTerm ? 
                    "No matching stock data found" : 
                    "No stock data available. Add some data above."
                  }
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="option" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Option Data</CardTitle>
              <CardDescription>
                Enter options contract information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stockSymbol">Stock Symbol</Label>
                  <Input
                    id="stockSymbol"
                    value={optionFormData.stockSymbol}
                    onChange={(e) => handleOptionFormChange(e, "stockSymbol")}
                    placeholder="AAPL"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="strikePrice">Strike Price ($)</Label>
                  <Input
                    id="strikePrice"
                    type="number"
                    value={optionFormData.strikePrice || ""}
                    onChange={(e) => handleOptionFormChange(e, "strikePrice")}
                    min={0.01}
                    step={0.01}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiration">Expiration Date</Label>
                  <Input
                    id="expiration"
                    type="date"
                    value={optionFormData.expirationDate}
                    onChange={(e) =>
                      setOptionFormData({
                        ...optionFormData,
                        expirationDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="optionType">Option Type</Label>
                  <Select
                    value={optionFormData.optionType}
                    onValueChange={handleOptionTypeChange}
                  >
                    <SelectTrigger id="optionType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="put">Put</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marketPrice">Market Price ($)</Label>
                  <Input
                    id="marketPrice"
                    type="number"
                    value={optionFormData.marketPrice || ""}
                    onChange={(e) => handleOptionFormChange(e, "marketPrice")}
                    min={0.01}
                    step={0.01}
                    placeholder="0.00"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addOptionData} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add
                  </Button>
                </div>
              </div>
              <div className="flex justify-between mt-4">
                <Button
                  variant="outline"
                  onClick={() => handleImport("option")}
                  disabled={!fileContent}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Import Data
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExport("option")}
                  disabled={optionData.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Option Data</CardTitle>
              <CardDescription>
                Your saved options contract information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredOptionData.length > 0 ? (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Strike</TableHead>
                        <TableHead>Expiration</TableHead>
                        <TableHead>Market Price</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOptionData.map((option) => (
                        <TableRow key={option.id}>
                          <TableCell className="font-medium">
                            {option.stockSymbol}
                          </TableCell>
                          <TableCell>
                            {option.optionType === "call" ? "Call" : "Put"}
                          </TableCell>
                          <TableCell>
                            ${option.strikePrice.toFixed(2)}
                          </TableCell>
                          <TableCell>{option.expirationDate}</TableCell>
                          <TableCell>
                            ${option.marketPrice.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOptionData(option.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  {searchTerm ?
                    "No matching option data found" :
                    "No option data available. Add some data above."
                  }
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataManagement;
