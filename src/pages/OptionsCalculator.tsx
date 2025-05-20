
// Update imports in OptionsCalculator.tsx
import React from "react";
import { useState, useEffect } from "react";
import { calculateOptionPrice, calculateGreeks } from "@/utils/optionsCalculations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { LineChart } from "@/components/ui/charts";
import { addOptionData } from "@/utils/dataManagement";

const OptionsCalculator = () => {
  const [stockPrice, setStockPrice] = useState("");
  const [strikePrice, setStrikePrice] = useState("");
  const [timeToExpiration, setTimeToExpiration] = useState("");
  const [riskFreeRate, setRiskFreeRate] = useState("");
  const [impliedVolatility, setImpliedVolatility] = useState("");
  const [optionType, setOptionType] = useState<"call" | "put">("call");
  const [calculationResult, setCalculationResult] = useState<number | null>(null);
  const [greeks, setGreeks] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [stockSymbol, setStockSymbol] = useState("");
  const [expirationDate, setExpirationDate] = useState("");

  const handleCalculate = () => {
    if (
      !stockPrice ||
      !strikePrice ||
      !timeToExpiration ||
      !riskFreeRate ||
      !impliedVolatility
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      // Calculate option price using Black-Scholes
      const price = calculateOptionPrice(
        parseFloat(stockPrice),
        parseFloat(strikePrice),
        parseFloat(timeToExpiration),
        parseFloat(riskFreeRate) / 100, // Convert percentage to decimal
        parseFloat(impliedVolatility) / 100, // Convert percentage to decimal
        optionType
      );

      setCalculationResult(price);

      // Calculate greeks
      const greeksResult = calculateGreeks(
        parseFloat(stockPrice),
        parseFloat(strikePrice),
        parseFloat(timeToExpiration),
        parseFloat(riskFreeRate) / 100,
        parseFloat(impliedVolatility) / 100,
        optionType
      );

      setGreeks(greeksResult);

      // Generate chart data for stock price variations
      const chartData = [];
      const minPrice = parseFloat(stockPrice) * 0.7;
      const maxPrice = parseFloat(stockPrice) * 1.3;
      const step = (maxPrice - minPrice) / 20;

      for (let price = minPrice; price <= maxPrice; price += step) {
        const optionPrice = calculateOptionPrice(
          price,
          parseFloat(strikePrice),
          parseFloat(timeToExpiration),
          parseFloat(riskFreeRate) / 100,
          parseFloat(impliedVolatility) / 100,
          optionType
        );

        chartData.push({
          stockPrice: price.toFixed(2),
          optionPrice: optionPrice.toFixed(2),
        });
      }

      setChartData(chartData);
    } catch (error) {
      console.error("Calculation error:", error);
      alert("Error calculating option price. Check console for details.");
    }
  };

  const handleSaveOption = () => {
    if (!calculationResult) {
      alert("Please calculate option price first");
      return;
    }

    if (!stockSymbol || !expirationDate) {
      alert("Please enter stock symbol and expiration date");
      return;
    }

    try {
      const newOption = addOptionData({
        stockSymbol,
        strikePrice: parseFloat(strikePrice),
        expirationDate,
        optionType,
        marketPrice: calculationResult,
        impliedVolatility: parseFloat(impliedVolatility) / 100,
        delta: greeks?.delta,
        gamma: greeks?.gamma,
        theta: greeks?.theta,
        vega: greeks?.vega,
        rho: greeks?.rho,
      });

      alert(`Option saved successfully with ID: ${newOption.id}`);
    } catch (error) {
      console.error("Error saving option:", error);
      alert("Error saving option. Check console for details.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Options Calculator</CardTitle>
            <CardDescription>
              Calculate option prices using the Black-Scholes model
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stockPrice">Stock Price ($)</Label>
                  <Input
                    id="stockPrice"
                    type="number"
                    step="0.01"
                    value={stockPrice}
                    onChange={(e) => setStockPrice(e.target.value)}
                    placeholder="e.g. 150.00"
                  />
                </div>
                <div>
                  <Label htmlFor="strikePrice">Strike Price ($)</Label>
                  <Input
                    id="strikePrice"
                    type="number"
                    step="0.01"
                    value={strikePrice}
                    onChange={(e) => setStrikePrice(e.target.value)}
                    placeholder="e.g. 155.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timeToExpiration">
                    Time to Expiration (years)
                  </Label>
                  <Input
                    id="timeToExpiration"
                    type="number"
                    step="0.01"
                    value={timeToExpiration}
                    onChange={(e) => setTimeToExpiration(e.target.value)}
                    placeholder="e.g. 0.25 (3 months)"
                  />
                </div>
                <div>
                  <Label htmlFor="riskFreeRate">Risk-Free Rate (%)</Label>
                  <Input
                    id="riskFreeRate"
                    type="number"
                    step="0.01"
                    value={riskFreeRate}
                    onChange={(e) => setRiskFreeRate(e.target.value)}
                    placeholder="e.g. 3.5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="impliedVolatility">Implied Volatility (%)</Label>
                <Input
                  id="impliedVolatility"
                  type="number"
                  step="0.1"
                  value={impliedVolatility}
                  onChange={(e) => setImpliedVolatility(e.target.value)}
                  placeholder="e.g. 25"
                />
              </div>

              <div>
                <Label>Option Type</Label>
                <RadioGroup
                  value={optionType}
                  onValueChange={(value: "call" | "put") => setOptionType(value)}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="call" id="call" />
                    <Label htmlFor="call">Call</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="put" id="put" />
                    <Label htmlFor="put">Put</Label>
                  </div>
                </RadioGroup>
              </div>

              <Button onClick={handleCalculate} className="w-full">
                Calculate
              </Button>

              {calculationResult !== null && (
                <div className="mt-4 p-4 bg-secondary rounded-md">
                  <h3 className="font-semibold text-lg">Results:</h3>
                  <p>Option Price: ${calculationResult.toFixed(2)}</p>
                  {greeks && (
                    <div className="mt-2">
                      <h4 className="font-medium">Greeks:</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p>Delta: {greeks.delta.toFixed(4)}</p>
                        <p>Gamma: {greeks.gamma.toFixed(4)}</p>
                        <p>Theta: {greeks.theta.toFixed(4)}</p>
                        <p>Vega: {greeks.vega.toFixed(4)}</p>
                        <p>Rho: {greeks.rho.toFixed(4)}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {chartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Option Price by Stock Price</CardTitle>
                <CardDescription>
                  How option price changes with stock price
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={chartData}
                  index="stockPrice"
                  categories={["optionPrice"]}
                  colors={["#0088FE"]}
                  valueFormatter={(value) => `$${value}`}
                  className="h-[300px]"
                />
              </CardContent>
            </Card>
          )}

          {calculationResult !== null && (
            <Card>
              <CardHeader>
                <CardTitle>Save Option</CardTitle>
                <CardDescription>
                  Save this option calculation to your data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="stockSymbol">Stock Symbol</Label>
                    <Input
                      id="stockSymbol"
                      value={stockSymbol}
                      onChange={(e) => setStockSymbol(e.target.value)}
                      placeholder="e.g. AAPL"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expirationDate">Expiration Date</Label>
                    <Input
                      id="expirationDate"
                      type="date"
                      value={expirationDate}
                      onChange={(e) => setExpirationDate(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleSaveOption} className="w-full">
                    Save Option
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default OptionsCalculator;
