
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, LineChart, BarChart } from "@/components/ui/chart";
import { getStockData, getOptionData } from "@/utils/dataManagement";
import { calculateBlackScholes, calculateGreeks } from "@/utils/optionsCalculations";
import { Link } from "react-router-dom";
import { ArrowRight, AlertTriangle, TrendingUp, TrendingDown, Activity } from "lucide-react";

const Index = () => {
  const [stockData] = useState(getStockData());
  const [optionData] = useState(getOptionData());

  // Sample data for charts
  const marketData = [
    { name: "Jan", value: 2890 },
    { name: "Feb", value: 2756 },
    { name: "Mar", value: 3322 },
    { name: "Apr", value: 3470 },
    { name: "May", value: 3475 },
    { name: "Jun", value: 3129 },
    { name: "Jul", value: 3490 },
    { name: "Aug", value: 3590 },
    { name: "Sep", value: 3840 },
    { name: "Oct", value: 4020 },
    { name: "Nov", value: 3780 },
    { name: "Dec", value: 4090 },
  ];

  // Volatility data
  const volatilityData = [
    { name: "Jan", value: 0.15 },
    { name: "Feb", value: 0.18 },
    { name: "Mar", value: 0.25 },
    { name: "Apr", value: 0.22 },
    { name: "May", value: 0.19 },
    { name: "Jun", value: 0.17 },
    { name: "Jul", value: 0.16 },
    { name: "Aug", value: 0.18 },
    { name: "Sep", value: 0.21 },
    { name: "Oct", value: 0.23 },
    { name: "Nov", value: 0.20 },
    { name: "Dec", value: 0.17 },
  ];

  // Option volume data
  const optionVolumeData = [
    { name: "Jan", calls: 145, puts: 89 },
    { name: "Feb", calls: 132, puts: 107 },
    { name: "Mar", calls: 187, puts: 143 },
    { name: "Apr", calls: 201, puts: 156 },
    { name: "May", calls: 176, puts: 189 },
    { name: "Jun", calls: 155, puts: 201 },
    { name: "Jul", calls: 198, puts: 154 },
    { name: "Aug", calls: 213, puts: 132 },
    { name: "Sep", calls: 246, puts: 167 },
    { name: "Oct", calls: 257, puts: 198 },
    { name: "Nov", calls: 231, puts: 176 },
    { name: "Dec", calls: 289, puts: 167 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Options Analysis Dashboard</h1>
        <div className="flex gap-2">
          <Link 
            to="/options-calculator" 
            className="inline-flex items-center px-4 py-2 bg-finance-blue text-white rounded-md hover:bg-finance-lightBlue transition-colors"
          >
            Options Calculator <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>

      {(!stockData.length || !optionData.length) && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <p className="text-amber-800">
                You haven't added any data yet. Visit the{" "}
                <Link to="/data-management" className="text-blue-600 underline">
                  Data Management
                </Link>{" "}
                page to add stock and options data.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Market Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">$4,090.23</p>
                <p className="text-xs text-muted-foreground">+2.5% from last month</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <TrendingUp className="h-5 w-5 text-finance-green" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Volatility</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">17.2%</p>
                <p className="text-xs text-muted-foreground">-1.3% from last month</p>
              </div>
              <div className="p-2 bg-red-100 rounded-full">
                <TrendingDown className="h-5 w-5 text-finance-red" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Options Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">289K</p>
                <p className="text-xs text-muted-foreground">+25% from last month</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Activity className="h-5 w-5 text-finance-blue" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="market" className="space-y-4">
        <TabsList>
          <TabsTrigger value="market">Market Performance</TabsTrigger>
          <TabsTrigger value="volatility">Volatility Index</TabsTrigger>
          <TabsTrigger value="options">Options Volume</TabsTrigger>
        </TabsList>
        <TabsContent value="market" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Index Performance</CardTitle>
              <CardDescription>
                Year-to-date performance of major indices
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <AreaChart
                data={marketData}
                index="name"
                categories={["value"]}
                colors={["blue"]}
                valueFormatter={(value) => `$${value}`}
                className="h-80"
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="volatility" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Implied Volatility Index</CardTitle>
              <CardDescription>
                Year-to-date market volatility
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <LineChart
                data={volatilityData}
                index="name"
                categories={["value"]}
                colors={["blue"]}
                valueFormatter={(value) => `${(value * 100).toFixed(1)}%`}
                className="h-80"
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="options" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Options Trading Volume</CardTitle>
              <CardDescription>
                Call vs Put volume throughout the year
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <BarChart
                data={optionVolumeData}
                index="name"
                categories={["calls", "puts"]}
                colors={["#00873c", "#e63946"]}
                valueFormatter={(value) => `${value}K`}
                className="h-80"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Analysis</CardTitle>
            <CardDescription>
              Your most recent option calculations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {optionData.length > 0 ? (
              <div className="space-y-4">
                {optionData.slice(0, 3).map((option) => (
                  <div key={option.id} className="p-3 border rounded-md">
                    <div className="font-medium">{option.stockSymbol} {option.optionType.toUpperCase()}</div>
                    <div className="text-sm text-muted-foreground">
                      Strike: ${option.strikePrice} | Exp: {option.expirationDate}
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                      <div>Market: ${option.marketPrice.toFixed(2)}</div>
                      <div>IV: {(option.impliedVolatility || 0 * 100).toFixed(1)}%</div>
                      <div>Delta: {option.delta?.toFixed(2) || "N/A"}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No option data available</p>
                <Link to="/data-management" className="text-blue-600 underline mt-2 inline-block">
                  Add options data
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Assessment</CardTitle>
            <CardDescription>
              Portfolio risk metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Overall Exposure</p>
                  <p className="text-sm text-muted-foreground">Based on current positions</p>
                </div>
                <div className="font-medium text-finance-red">Moderate</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Delta Exposure</span>
                  <span>+0.45</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Gamma Risk</span>
                  <span>0.22</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Vega Exposure</span>
                  <span>0.78</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Theta Decay (daily)</span>
                  <span>-0.32</span>
                </div>
              </div>
              <Link 
                to="/options-calculator" 
                className="text-blue-600 underline block mt-4 text-sm"
              >
                Run detailed analysis →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
