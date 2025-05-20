
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { getStockData, getOptionData } from "@/utils/dataManagement";
import { DataPoint, kMeansClustering } from "@/utils/clustering";
import { ScatterChart } from "@/components/ui/chart";
import { AlertTriangle } from "lucide-react";

const clusterColors = [
  "#1d4ed8", // blue
  "#e11d48", // red
  "#16a34a", // green
  "#9333ea", // purple
  "#f59e0b", // amber
  "#0891b2", // cyan
  "#be123c", // rose
  "#4d7c0f", // lime
];

const ClusterAnalysis = () => {
  const { toast } = useToast();
  const [stockData] = useState(getStockData());
  const [optionData] = useState(getOptionData());
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [clusters, setClusters] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  
  // Analysis parameters
  const [numClusters, setNumClusters] = useState<number>(3);
  const [xAxis, setXAxis] = useState<string>("price");
  const [yAxis, setYAxis] = useState<string>("volume");
  const [dataSource, setDataSource] = useState<"stock" | "option">("stock");

  // Available fields for analysis
  const stockFields = ["price", "volume"];
  
  const optionFields = [
    "strikePrice", 
    "marketPrice", 
    "impliedVolatility",
    "delta",
    "gamma",
    "theta",
    "vega",
    "rho"
  ];

  // Get available fields based on data source
  const availableFields = dataSource === "stock" ? stockFields : optionFields;

  // Prepare data points from stock or option data
  const prepareDataPoints = () => {
    let points: DataPoint[] = [];

    if (dataSource === "stock") {
      if (!stockData.length) {
        toast({
          variant: "destructive",
          title: "No Data Available",
          description: "Please add stock data in the Data Management section first.",
        });
        return [];
      }

      points = stockData.map((item) => ({
        x: item[xAxis] || 0,
        y: item[yAxis] || 0,
        symbol: item.symbol,
        date: item.date,
      }));
    } else {
      if (!optionData.length) {
        toast({
          variant: "destructive",
          title: "No Data Available",
          description: "Please add option data in the Data Management section first.",
        });
        return [];
      }

      points = optionData.map((item) => ({
        x: item[xAxis] || 0,
        y: item[yAxis] || 0,
        symbol: item.stockSymbol,
        type: item.optionType,
        strike: item.strikePrice,
        expiration: item.expirationDate,
      }));
    }

    // Filter out invalid data points (NaN, undefined)
    points = points.filter(
      (point) => !isNaN(point.x) && !isNaN(point.y) && point.x !== undefined && point.y !== undefined
    );

    setDataPoints(points);
    return points;
  };

  // Run clustering analysis
  const runClusterAnalysis = () => {
    const points = prepareDataPoints();
    
    if (points.length < numClusters) {
      toast({
        variant: "destructive",
        title: "Insufficient Data",
        description: `You need at least ${numClusters} valid data points for ${numClusters} clusters.`,
      });
      return;
    }

    try {
      const clusterResults = kMeansClustering(points, numClusters);
      setClusters(clusterResults);
      
      // Prepare data for the chart
      const formattedData: any[] = [];
      
      clusterResults.forEach((cluster, index) => {
        cluster.points.forEach((point) => {
          formattedData.push({
            x: point.x,
            y: point.y,
            cluster: `Cluster ${index + 1}`,
            symbol: point.symbol,
            meta: { ...point },
          });
        });
      });
      
      setChartData(formattedData);
      
      toast({
        title: "Analysis Complete",
        description: `Created ${numClusters} clusters from ${points.length} data points.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "There was an error performing the cluster analysis.",
      });
    }
  };

  // Generate empty synthetic data for initial visualization
  const generateSyntheticData = () => {
    const syntheticPoints: DataPoint[] = [];
    
    for (let i = 0; i < 25; i++) {
      // Create 3 clusters of points
      let x, y;
      
      if (i < 8) {
        // Cluster 1
        x = 100 + Math.random() * 50;
        y = 1000000 + Math.random() * 500000;
      } else if (i < 16) {
        // Cluster 2
        x = 200 + Math.random() * 50;
        y = 2000000 + Math.random() * 500000;
      } else {
        // Cluster 3
        x = 150 + Math.random() * 50;
        y = 1500000 + Math.random() * 200000;
      }
      
      syntheticPoints.push({
        x,
        y,
        symbol: `SAMPLE${i}`,
        date: new Date().toISOString().split("T")[0],
      });
    }
    
    const syntheticClusters = kMeansClustering(syntheticPoints, 3);
    
    const formattedData: any[] = [];
    syntheticClusters.forEach((cluster, index) => {
      cluster.points.forEach((point) => {
        formattedData.push({
          x: point.x,
          y: point.y,
          cluster: `Cluster ${index + 1}`,
          symbol: point.symbol,
          meta: { ...point },
        });
      });
    });
    
    setChartData(formattedData);
  };

  // Initialize with synthetic data
  useEffect(() => {
    if (!stockData.length && !optionData.length) {
      generateSyntheticData();
    }
  }, []);

  // Format axis labels
  const formatAxisLabel = (field: string) => {
    switch (field) {
      case "price":
        return "Price ($)";
      case "volume":
        return "Volume";
      case "strikePrice":
        return "Strike Price ($)";
      case "marketPrice":
        return "Market Price ($)";
      case "impliedVolatility":
        return "Implied Volatility (%)";
      case "delta":
        return "Delta";
      case "gamma":
        return "Gamma";
      case "theta":
        return "Theta";
      case "vega":
        return "Vega";
      case "rho":
        return "Rho";
      default:
        return field.charAt(0).toUpperCase() + field.slice(1);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          K-Means Cluster Analysis
        </h1>
        <p className="text-muted-foreground">
          Identify patterns in your trading data using cluster analysis
        </p>
      </div>

      {(!stockData.length && !optionData.length) && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <p className="text-amber-800">
                You're viewing sample data. Visit the{" "}
                <a href="/data-management" className="text-blue-600 underline">
                  Data Management
                </a>{" "}
                page to add your own data for analysis.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Analysis Parameters</CardTitle>
            <CardDescription>
              Configure your cluster analysis settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Data Source</Label>
              <Select
                value={dataSource}
                onValueChange={(value) => {
                  setDataSource(value as "stock" | "option");
                  // Reset axes to appropriate values for the data source
                  if (value === "stock") {
                    setXAxis("price");
                    setYAxis("volume");
                  } else {
                    setXAxis("strikePrice");
                    setYAxis("marketPrice");
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select data source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stock">Stock Data</SelectItem>
                  <SelectItem value="option">Option Data</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>X-Axis Variable</Label>
              <Select value={xAxis} onValueChange={setXAxis}>
                <SelectTrigger>
                  <SelectValue placeholder="Select X-Axis" />
                </SelectTrigger>
                <SelectContent>
                  {availableFields.map((field) => (
                    <SelectItem key={field} value={field}>
                      {formatAxisLabel(field)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Y-Axis Variable</Label>
              <Select value={yAxis} onValueChange={setYAxis}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Y-Axis" />
                </SelectTrigger>
                <SelectContent>
                  {availableFields.map((field) => (
                    <SelectItem key={field} value={field}>
                      {formatAxisLabel(field)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Number of Clusters</Label>
                <span className="text-sm">{numClusters}</span>
              </div>
              <Slider
                value={[numClusters]}
                min={2}
                max={8}
                step={1}
                onValueChange={([value]) => setNumClusters(value)}
              />
            </div>

            <Button onClick={runClusterAnalysis} className="w-full mt-4">
              Run Analysis
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Cluster Visualization</CardTitle>
            <CardDescription>
              Data points grouped by cluster
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[500px]">
              <ScatterChart
                data={chartData}
                category="cluster"
                x="x"
                y="y"
                colors={clusterColors}
                valueFormatter={{
                  x: (value) => `${formatAxisLabel(xAxis)}: ${value}`,
                  y: (value) => `${formatAxisLabel(yAxis)}: ${value}`,
                }}
                showLegend={true}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {clusters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cluster Analysis Results</CardTitle>
            <CardDescription>
              Summary of the clusters formed by the K-means algorithm
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {clusters.map((cluster, index) => (
                <div key={index} className="border rounded-md p-4">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: clusterColors[index % clusterColors.length] }}
                    />
                    <h3 className="font-medium">Cluster {index + 1}</h3>
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Points: </span>
                      {cluster.points.length}
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Centroid {formatAxisLabel(xAxis)}: </span>
                      {cluster.centroid.x.toFixed(2)}
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Centroid {formatAxisLabel(yAxis)}: </span>
                      {cluster.centroid.y.toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="mt-3">
                    <h4 className="text-sm font-medium mb-1">Top Symbols:</h4>
                    <ul className="text-sm">
                      {Array.from(
                        new Set(
                          cluster.points
                            .map((p: DataPoint) => p.symbol)
                            .slice(0, 3)
                        )
                      ).map((symbol: string, i: number) => (
                        <li key={i}>{symbol}</li>
                      ))}
                      {cluster.points.length > 3 && (
                        <li className="text-muted-foreground">
                          + {cluster.points.length - 3} more
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClusterAnalysis;
