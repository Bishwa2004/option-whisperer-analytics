
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { calculateBlackScholes, calculateGreeks, calculateImpliedVolatility } from "@/utils/optionsCalculations";
import { saveOptionData } from "@/utils/dataManagement";
import { LineChart } from "@/components/ui/chart";
import { useToast } from "@/hooks/use-toast";

const OptionsCalculator = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    stockSymbol: "AAPL",
    stockPrice: 180,
    strikePrice: 185,
    timeToExpiry: 30, // days
    volatility: 25, // percentage
    riskFreeRate: 3.5, // percentage
    dividendYield: 0.5, // percentage
    optionType: "call" as "call" | "put",
    marketPrice: 0,
  });

  const [results, setResults] = useState({
    optionPrice: 0,
    intrinsicValue: 0,
    timeValue: 0,
    breakEvenPrice: 0,
    impliedVolatility: 0,
    greeks: {
      delta: 0,
      gamma: 0,
      theta: 0,
      vega: 0,
      rho: 0,
    },
  });

  const [sensitivityData, setSensitivityData] = useState<any[]>([]);
  const [showMarketPrice, setShowMarketPrice] = useState(false);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof typeof formData
  ) => {
    const value = 
      field === "stockSymbol"
        ? e.target.value
        : parseFloat(e.target.value);
    
    setFormData({ ...formData, [field]: value });
  };

  // Handle select input changes
  const handleSelectChange = (value: "call" | "put") => {
    setFormData({ ...formData, optionType: value });
  };

  // Calculate option price and greeks
  const calculateOption = () => {
    try {
      // Convert inputs to appropriate units
      const timeInYears = formData.timeToExpiry / 365;
      const volatilityDecimal = formData.volatility / 100;
      const riskFreeRateDecimal = formData.riskFreeRate / 100;
      
      // Calculate option price
      const optionPrice = calculateBlackScholes(
        formData.stockPrice,
        formData.strikePrice,
        timeInYears,
        volatilityDecimal,
        riskFreeRateDecimal,
        formData.optionType
      );
      
      // Calculate greeks
      const greeks = calculateGreeks(
        formData.stockPrice,
        formData.strikePrice,
        timeInYears,
        volatilityDecimal,
        riskFreeRateDecimal,
        formData.optionType
      );
      
      // Calculate intrinsic value
      let intrinsicValue = 0;
      if (formData.optionType === "call") {
        intrinsicValue = Math.max(0, formData.stockPrice - formData.strikePrice);
      } else {
        intrinsicValue = Math.max(0, formData.strikePrice - formData.stockPrice);
      }
      
      // Calculate time value
      const timeValue = Math.max(0, optionPrice - intrinsicValue);
      
      // Calculate break-even price
      let breakEvenPrice = 0;
      if (formData.optionType === "call") {
        breakEvenPrice = formData.strikePrice + optionPrice;
      } else {
        breakEvenPrice = formData.strikePrice - optionPrice;
      }
      
      // If market price is provided, calculate implied volatility
      let impliedVolatility = 0;
      if (showMarketPrice && formData.marketPrice > 0) {
        impliedVolatility = calculateImpliedVolatility(
          formData.marketPrice,
          formData.stockPrice,
          formData.strikePrice,
          timeInYears,
          riskFreeRateDecimal,
          formData.optionType
        );
      }
      
      // Update results
      setResults({
        optionPrice,
        intrinsicValue,
        timeValue,
        breakEvenPrice,
        impliedVolatility: impliedVolatility * 100, // convert to percentage
        greeks,
      });
      
      // Generate sensitivity data for chart
      generateSensitivityData();
      
      toast({
        title: "Calculation Complete",
        description: `${formData.stockSymbol} ${formData.optionType} option price: $${optionPrice.toFixed(2)}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Calculation Error",
        description: "Please check your inputs and try again.",
      });
    }
  };

  // Generate sensitivity data for charts
  const generateSensitivityData = () => {
    const priceRange = formData.stockPrice * 0.2;
    const timeInYears = formData.timeToExpiry / 365;
    const volatilityDecimal = formData.volatility / 100;
    const riskFreeRateDecimal = formData.riskFreeRate / 100;
    
    const data = [];
    
    // Generate 15 data points with varying stock prices
    for (let i = 0; i < 15; i++) {
      const stockPrice = formData.stockPrice - priceRange + (i * (priceRange * 2) / 14);
      
      const optionPrice = calculateBlackScholes(
        stockPrice,
        formData.strikePrice,
        timeInYears,
        volatilityDecimal,
        riskFreeRateDecimal,
        formData.optionType
      );
      
      const greeks = calculateGreeks(
        stockPrice,
        formData.strikePrice,
        timeInYears,
        volatilityDecimal,
        riskFreeRateDecimal,
        formData.optionType
      );
      
      data.push({
        stockPrice,
        optionPrice,
        delta: greeks.delta,
        gamma: greeks.gamma * 100, // Scale gamma for visibility
        theta: greeks.theta,
      });
    }
    
    setSensitivityData(data);
  };

  // Save calculation to data storage
  const saveCalculation = () => {
    const id = crypto.randomUUID();
    const optionData = {
      id,
      stockSymbol: formData.stockSymbol,
      strikePrice: formData.strikePrice,
      expirationDate: new Date(
        Date.now() + formData.timeToExpiry * 24 * 60 * 60 * 1000
      ).toISOString().split('T')[0],
      optionType: formData.optionType,
      marketPrice: showMarketPrice ? formData.marketPrice : results.optionPrice,
      impliedVolatility: results.impliedVolatility || formData.volatility,
      delta: results.greeks.delta,
      gamma: results.greeks.gamma,
      theta: results.greeks.theta,
      vega: results.greeks.vega,
      rho: results.greeks.rho,
    };
    
    saveOptionData(optionData);
    
    toast({
      title: "Calculation Saved",
      description: "The option calculation has been saved to your data.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Options Calculator</h1>
        <p className="text-muted-foreground">
          Calculate option prices and Greeks using the Black-Scholes model
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Option Parameters</CardTitle>
            <CardDescription>Enter the parameters for your option</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stockSymbol">Stock Symbol</Label>
                <Input
                  id="stockSymbol"
                  value={formData.stockSymbol}
                  onChange={(e) => handleInputChange(e, "stockSymbol")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stockPrice">Stock Price ($)</Label>
                <Input
                  id="stockPrice"
                  type="number"
                  value={formData.stockPrice}
                  onChange={(e) => handleInputChange(e, "stockPrice")}
                  min={0.01}
                  step={0.01}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="strikePrice">Strike Price ($)</Label>
                <Input
                  id="strikePrice"
                  type="number"
                  value={formData.strikePrice}
                  onChange={(e) => handleInputChange(e, "strikePrice")}
                  min={0.01}
                  step={0.01}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeToExpiry">Days to Expiration</Label>
                <Input
                  id="timeToExpiry"
                  type="number"
                  value={formData.timeToExpiry}
                  onChange={(e) => handleInputChange(e, "timeToExpiry")}
                  min={1}
                  step={1}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="volatility">Volatility (%)</Label>
                <Input
                  id="volatility"
                  type="number"
                  value={formData.volatility}
                  onChange={(e) => handleInputChange(e, "volatility")}
                  min={0.1}
                  step={0.1}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="riskFreeRate">Risk-Free Rate (%)</Label>
                <Input
                  id="riskFreeRate"
                  type="number"
                  value={formData.riskFreeRate}
                  onChange={(e) => handleInputChange(e, "riskFreeRate")}
                  min={0}
                  step={0.1}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Option Type</Label>
              <Select 
                value={formData.optionType} 
                onValueChange={handleSelectChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Call Option</SelectItem>
                  <SelectItem value="put">Put Option</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="marketPrice"
                checked={showMarketPrice}
                onCheckedChange={setShowMarketPrice}
              />
              <Label htmlFor="marketPrice">Input Market Price</Label>
            </div>

            {showMarketPrice && (
              <div className="space-y-2">
                <Label htmlFor="marketPrice">Market Price ($)</Label>
                <Input
                  id="marketPriceInput"
                  type="number"
                  value={formData.marketPrice}
                  onChange={(e) => handleInputChange(e, "marketPrice")}
                  min={0.01}
                  step={0.01}
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                setFormData({
                  stockSymbol: "AAPL",
                  stockPrice: 180,
                  strikePrice: 185,
                  timeToExpiry: 30,
                  volatility: 25,
                  riskFreeRate: 3.5,
                  dividendYield: 0.5,
                  optionType: "call",
                  marketPrice: 0,
                });
                setResults({
                  optionPrice: 0,
                  intrinsicValue: 0,
                  timeValue: 0,
                  breakEvenPrice: 0,
                  impliedVolatility: 0,
                  greeks: {
                    delta: 0,
                    gamma: 0,
                    theta: 0,
                    vega: 0,
                    rho: 0,
                  },
                });
              }}
            >
              Reset
            </Button>
            <Button onClick={calculateOption}>Calculate</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>
              Black-Scholes option pricing results
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Option Price
                </div>
                <div className="text-2xl font-bold">
                  ${results.optionPrice.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Break-Even Price
                </div>
                <div className="text-2xl font-bold">
                  ${results.breakEvenPrice.toFixed(2)}
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Intrinsic Value
                </div>
                <div className="text-xl font-medium">
                  ${results.intrinsicValue.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Time Value
                </div>
                <div className="text-xl font-medium">
                  ${results.timeValue.toFixed(2)}
                </div>
              </div>
            </div>

            {showMarketPrice && formData.marketPrice > 0 && (
              <>
                <Separator />
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Implied Volatility
                  </div>
                  <div className="text-xl font-medium">
                    {results.impliedVolatility.toFixed(2)}%
                  </div>
                </div>
              </>
            )}

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium">Greeks</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Delta
                  </div>
                  <div>{results.greeks.delta.toFixed(4)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Gamma
                  </div>
                  <div>{results.greeks.gamma.toFixed(4)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Theta
                  </div>
                  <div>{results.greeks.theta.toFixed(4)}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Vega
                  </div>
                  <div>{results.greeks.vega.toFixed(4)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Rho
                  </div>
                  <div>{results.greeks.rho.toFixed(4)}</div>
                </div>
              </div>
            </div>

            <Button 
              onClick={saveCalculation} 
              className="w-full mt-4"
              disabled={results.optionPrice === 0}
            >
              Save Calculation
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Option Sensitivity Analysis</CardTitle>
          <CardDescription>
            Price and Greeks sensitivity to changes in underlying asset price
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="price">
            <TabsList className="w-full">
              <TabsTrigger value="price" className="flex-1">Option Price</TabsTrigger>
              <TabsTrigger value="delta" className="flex-1">Delta</TabsTrigger>
              <TabsTrigger value="gamma" className="flex-1">Gamma</TabsTrigger>
              <TabsTrigger value="theta" className="flex-1">Theta</TabsTrigger>
            </TabsList>
            <div className="h-80 mt-4">
              <TabsContent value="price">
                <LineChart
                  data={sensitivityData}
                  index="stockPrice"
                  categories={["optionPrice"]}
                  colors={["blue"]}
                  valueFormatter={(value) => `$${value.toFixed(2)}`}
                  className="h-80"
                />
              </TabsContent>
              <TabsContent value="delta">
                <LineChart
                  data={sensitivityData}
                  index="stockPrice"
                  categories={["delta"]}
                  colors={["green"]}
                  valueFormatter={(value) => value.toFixed(4)}
                  className="h-80"
                />
              </TabsContent>
              <TabsContent value="gamma">
                <LineChart
                  data={sensitivityData}
                  index="stockPrice"
                  categories={["gamma"]}
                  colors={["purple"]}
                  valueFormatter={(value) => value.toFixed(4)}
                  className="h-80"
                />
              </TabsContent>
              <TabsContent value="theta">
                <LineChart
                  data={sensitivityData}
                  index="stockPrice"
                  categories={["theta"]}
                  colors={["red"]}
                  valueFormatter={(value) => value.toFixed(4)}
                  className="h-80"
                />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default OptionsCalculator;
