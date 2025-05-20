// Update imports in OptionsCalculator.tsx
import React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { calculateBlackScholes, calculateGreeks } from "@/utils/optionsCalculations";
import { addOptionData } from "@/utils/dataManagement";
import { LineChart } from "@/components/ui/charts";
import { toast } from "@/components/ui/use-toast";

const OptionsCalculator = () => {
  const [stockPrice, setStockPrice] = useState("");
  const [strikePrice, setStrikePrice] = useState("");
  const [timeToExpiration, setTimeToExpiration] = useState("");
  const [riskFreeRate, setRiskFreeRate] = useState("");
  const [impliedVolatility, setImpliedVolatility] = useState("");
  const [optionType, setOptionType] = useState("call");
  const [calculationResult, setCalculationResult] = useState(null);
  const [greeks, setGreeks] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [stockSymbol, setStockSymbol] = useState("");
  const [expirationDate, setExpirationDate] = useState("");

  useEffect(() => {
    if (calculationResult) {
      const iv = parseFloat(impliedVolatility);
      const price = calculationResult.optionPrice;
      const range = iv * 0.2; // Range of volatility to plot (± 10%)
      const points = 20; // Number of points to plot

      const newChartData = Array.from({ length: points }, (_, i) => {
        const vol = iv - range / 2 + (range * i) / (points - 1);
        const calculatedPrice = calculateBlackScholes(
          parseFloat(stockPrice),
          parseFloat(strikePrice),
          parseFloat(timeToExpiration),
          parseFloat(riskFreeRate),
          vol,
          optionType
        ).optionPrice;
        return {
          impliedVolatility: vol * 100,
          optionPrice: calculatedPrice,
        };
      });
      setChartData(newChartData);
    }
  }, [calculationResult, impliedVolatility, riskFreeRate, stockPrice, strikePrice, timeToExpiration, optionType]);

  const calculateOptions = () => {
    try {
      const calculated = calculateBlackScholes(
        parseFloat(stockPrice),
        parseFloat(strikePrice),
        parseFloat(timeToExpiration),
        parseFloat(riskFreeRate),
        parseFloat(impliedVolatility),
        optionType
      );
      setCalculationResult(calculated);

      const calculatedGreeks = calculateGreeks(
        parseFloat(stockPrice),
        parseFloat(strikePrice),
        parseFloat(timeToExpiration),
        parseFloat(riskFreeRate),
        parseFloat(impliedVolatility),
        optionType
      );
      setGreeks(calculatedGreeks);
    } catch (error) {
      console.error("Calculation error:", error);
      toast({
        variant: "destructive",
        title: "Calculation error",
        description: "Please check your inputs."
      });
    }
  };

  const handleSave = () => {
    if (calculationResult) {
      const optionData = {
        stockSymbol,
        strikePrice: parseFloat(strikePrice),
        expirationDate,
        optionType,
        marketPrice: calculationResult.optionPrice,
        impliedVolatility: parseFloat(impliedVolatility),
        delta: greeks?.delta,
      };

      addOptionData(optionData);
      toast({
        title: "Option data saved",
        description: `Option for ${stockSymbol} saved successfully.`
      });
    } else {
      toast({
        variant: "destructive",
        title: "No data to save",
        description: "Please calculate option price first."
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Options Calculator</CardTitle>
          <CardDescription>Calculate option prices and Greeks using the Black-Scholes model.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stockSymbol">Stock Symbol</Label>
              <Input
                type="text"
                id="stockSymbol"
                value={stockSymbol}
                onChange={(e) => setStockSymbol(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="expirationDate">Expiration Date</Label>
              <Input
                type="date"
                id="expirationDate"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="stockPrice">Stock Price</Label>
              <Input
                type="number"
                id="stockPrice"
                value={stockPrice}
                onChange={(e) => setStockPrice(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="strikePrice">Strike Price</Label>
              <Input
                type="number"
                id="strikePrice"
                value={strikePrice}
                onChange={(e) => setStrikePrice(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="timeToExpiration">Time to Expiration (years)</Label>
              <Input
                type="number"
                id="timeToExpiration"
                value={timeToExpiration}
                onChange={(e) => setTimeToExpiration(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="riskFreeRate">Risk-Free Rate</Label>
              <Input
                type="number"
                id="riskFreeRate"
                value={riskFreeRate}
                onChange={(e) => setRiskFreeRate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="impliedVolatility">Implied Volatility</Label>
              <Input
                type="number"
                id="impliedVolatility"
                value={impliedVolatility}
                onChange={(e) => setImpliedVolatility(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="optionType">Option Type</Label>
              <Select onValueChange={setOptionType} defaultValue={optionType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select option type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="put">Put</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={calculateOptions}>Calculate</Button>
          {calculationResult && (
            <Button className="ml-2" onClick={handleSave}>Save</Button>
          )}
        </CardFooter>
      </Card>

      {calculationResult && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Calculation Result</CardTitle>
              <CardDescription>
                Black-Scholes option price
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {calculationResult.optionPrice.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Greeks</CardTitle>
              <CardDescription>
                Option sensitivities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {greeks ? (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm font-medium">Delta</p>
                    <p>{greeks.delta.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Gamma</p>
                    <p>{greeks.gamma.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Vega</p>
                    <p>{greeks.vega.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Theta</p>
                    <p>{greeks.theta.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Rho</p>
                    <p>{greeks.rho.toFixed(2)}</p>
                  </div>
                </div>
              ) : (
                <p>Calculating...</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {chartData.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Option Price vs Implied Volatility</CardTitle>
            <CardDescription>
              Impact of volatility on option price
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LineChart
              data={chartData}
              index="impliedVolatility"
              categories={["optionPrice"]}
              valueFormatter={(value) => `$${value.toFixed(2)}`}
              className="h-[350px]"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OptionsCalculator;
