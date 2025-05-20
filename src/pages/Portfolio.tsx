
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BarChart } from "@/components/ui/charts";
import { PlusCircle, Trash, PieChart as PieChartIcon, BarChartIcon, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { PortfolioItem, addPortfolioItem, getPortfolioItems, deletePortfolioItem } from "@/utils/dataManagement";

const Portfolio = () => {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(getPortfolioItems());
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [portfolioName, setPortfolioName] = useState("Main Portfolio");

  const handleAddPosition = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newPosition = addPortfolioItem({
        symbol: symbol.toUpperCase(),
        quantity: parseFloat(quantity),
        purchasePrice: parseFloat(purchasePrice),
        purchaseDate: purchaseDate,
        portfolioName: portfolioName
      });
      
      setPortfolioItems([...portfolioItems, newPosition]);
      
      // Reset form
      setSymbol("");
      setQuantity("");
      setPurchasePrice("");
      
      toast({
        title: "Position Added",
        description: `Added ${quantity} shares of ${symbol.toUpperCase()} to your portfolio.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add position. Please check your inputs.",
        variant: "destructive"
      });
    }
  };

  const handleDeletePosition = (id: string) => {
    deletePortfolioItem(id);
    setPortfolioItems(portfolioItems.filter(item => item.id !== id));
    
    toast({
      title: "Position Removed",
      description: "The position has been removed from your portfolio."
    });
  };

  // Calculate total portfolio value
  const totalValue = portfolioItems.reduce((acc, item) => {
    const currentPrice = item.currentPrice || item.purchasePrice;
    return acc + (item.quantity * currentPrice);
  }, 0);

  // Calculate portfolio performance
  const portfolioPerformance = portfolioItems.reduce((acc, item) => {
    const currentPrice = item.currentPrice || item.purchasePrice;
    const positionValue = item.quantity * currentPrice;
    const costBasis = item.quantity * item.purchasePrice;
    return acc + (positionValue - costBasis);
  }, 0);

  const performancePercent = portfolioItems.length > 0 
    ? (portfolioPerformance / (totalValue - portfolioPerformance)) * 100 
    : 0;

  // Prepare data for charts
  const allocationData = portfolioItems.map(item => {
    const currentPrice = item.currentPrice || item.purchasePrice;
    const value = item.quantity * currentPrice;
    return {
      name: item.symbol,
      value: value
    };
  });

  const performanceData = portfolioItems.map(item => {
    const currentPrice = item.currentPrice || item.purchasePrice;
    const percentChange = ((currentPrice - item.purchasePrice) / item.purchasePrice) * 100;
    return {
      name: item.symbol,
      value: percentChange
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Portfolio Manager</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Position
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Position</DialogTitle>
              <DialogDescription>
                Add a stock or option position to your portfolio
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddPosition}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="symbol" className="text-right">Symbol</Label>
                  <Input
                    id="symbol"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    placeholder="AAPL"
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quantity" className="text-right">Quantity</Label>
                  <Input
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="100"
                    type="number"
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">Purchase Price</Label>
                  <Input
                    id="price"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    placeholder="185.92"
                    type="number"
                    step="0.01"
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">Purchase Date</Label>
                  <Input
                    id="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    type="date"
                    className="col-span-3"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Add to Portfolio</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">${totalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                <p className="text-xs text-muted-foreground">Across {portfolioItems.length} positions</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-full">
                <PieChartIcon className="h-5 w-5 text-finance-blue" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  ${portfolioPerformance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </p>
                <p className="text-xs text-muted-foreground">{performancePercent.toFixed(2)}% overall return</p>
              </div>
              <div className={`p-2 rounded-full ${performancePercent >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                {performancePercent >= 0 ? 
                  <TrendingUp className="h-5 w-5 text-finance-green" /> :
                  <TrendingDown className="h-5 w-5 text-finance-red" />
                }
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
          </CardHeader>
          <CardContent>
            {portfolioItems.length > 0 ? (
              (() => {
                const topPerformer = [...portfolioItems].sort((a, b) => {
                  const aReturn = ((a.currentPrice || a.purchasePrice) - a.purchasePrice) / a.purchasePrice;
                  const bReturn = ((b.currentPrice || b.purchasePrice) - b.purchasePrice) / b.purchasePrice;
                  return bReturn - aReturn;
                })[0];
                
                const topReturn = ((topPerformer.currentPrice || topPerformer.purchasePrice) - topPerformer.purchasePrice) / topPerformer.purchasePrice * 100;
                
                return (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{topPerformer.symbol}</p>
                      <p className="text-xs text-muted-foreground">{topReturn.toFixed(2)}% return</p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-full">
                      <BarChartIcon className="h-5 w-5 text-finance-green" />
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="text-center py-2 text-muted-foreground">
                <p>No positions yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="positions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="positions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Positions</CardTitle>
              <CardDescription>Manage your current stock and option positions</CardDescription>
            </CardHeader>
            <CardContent>
              {portfolioItems.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Purchase Price</TableHead>
                      <TableHead>Current Price</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>P/L</TableHead>
                      <TableHead>P/L %</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {portfolioItems.map((item) => {
                      const currentPrice = item.currentPrice || item.purchasePrice;
                      const value = item.quantity * currentPrice;
                      const profitLoss = item.quantity * (currentPrice - item.purchasePrice);
                      const profitLossPercent = ((currentPrice - item.purchasePrice) / item.purchasePrice) * 100;
                      
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.symbol}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>${item.purchasePrice.toFixed(2)}</TableCell>
                          <TableCell>${currentPrice.toFixed(2)}</TableCell>
                          <TableCell>${value.toFixed(2)}</TableCell>
                          <TableCell className={profitLoss >= 0 ? "text-green-600" : "text-red-600"}>
                            {profitLoss >= 0 ? "+" : ""}{profitLoss.toFixed(2)}
                          </TableCell>
                          <TableCell className={profitLossPercent >= 0 ? "text-green-600" : "text-red-600"}>
                            {profitLossPercent >= 0 ? "+" : ""}{profitLossPercent.toFixed(2)}%
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleDeletePosition(item.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No positions in your portfolio yet.</p>
                  <p className="text-muted-foreground mt-1">Click "Add Position" to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="allocation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Allocation</CardTitle>
              <CardDescription>Asset allocation by position</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {portfolioItems.length > 0 ? (
                <BarChart
                  data={allocationData}
                  index="name"
                  categories={["value"]}
                  colors={["blue"]}
                  valueFormatter={(value) => `$${value.toFixed(2)}`}
                  className="h-full"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Add positions to see allocation chart</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Position Performance</CardTitle>
              <CardDescription>Returns by position</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {portfolioItems.length > 0 ? (
                <BarChart
                  data={performanceData}
                  index="name"
                  categories={["value"]}
                  colors={[portfolioPerformance >= 0 ? "green" : "red"]}
                  valueFormatter={(value) => `${value.toFixed(2)}%`}
                  className="h-full"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Add positions to see performance chart</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Portfolio;
