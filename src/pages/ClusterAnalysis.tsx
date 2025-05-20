
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getStockData, getOptionData } from "@/utils/dataManagement";
import { kMeansClustering, DataPoint } from "@/utils/clustering";
import { ScatterChart } from "@/components/ui/charts";

const ClusterAnalysis = () => {
  const [stockData, setStockData] = useState<any[]>([]);
  const [optionData, setOptionData] = useState<any[]>([]);
  const [clusters, setClusters] = useState<any[]>([]);
  const [numClusters, setNumClusters] = useState<number>(3);
  const [xAxis, setXAxis] = useState<string>("marketPrice");
  const [yAxis, setYAxis] = useState<string>("impliedVolatility");

  useEffect(() => {
    const stocks = getStockData();
    const options = getOptionData();
    setStockData(stocks);
    setOptionData(options);
  }, []);

  const handleClusterAnalysis = () => {
    if (optionData.length === 0) {
      alert("No option data available for clustering.");
      return;
    }

    // Map option data to the DataPoint format expected by kMeansClustering
    const dataPoints: DataPoint[] = optionData.map(option => ({
      x: parseFloat(option[xAxis]) || 0,
      y: parseFloat(option[yAxis]) || 0,
      id: option.id,
      originalData: option
    }));

    const filteredData = dataPoints.filter(
      (item) => !isNaN(item.x) && !isNaN(item.y)
    );

    if (filteredData.length !== optionData.length) {
      console.warn("Filtered out some options due to non-numerical values in selected axes.");
    }

    if (filteredData.length < numClusters) {
      alert("Not enough valid data points to form the specified number of clusters.");
      return;
    }

    try {
      // Use kMeansClustering directly
      const clusterResults = kMeansClustering(filteredData, numClusters);
      
      // Transform the cluster results into a format suitable for the ScatterChart
      const transformedClusters = [];
      
      clusterResults.forEach((cluster, clusterIndex) => {
        cluster.points.forEach(point => {
          transformedClusters.push({
            id: point.id,
            [xAxis]: point.x,
            [yAxis]: point.y,
            cluster: clusterIndex.toString()
          });
        });
      });
      
      setClusters(transformedClusters);
    } catch (error) {
      console.error("Clustering error:", error);
      alert("Error occurred during clustering. Check console for details.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Options Cluster Analysis</CardTitle>
          <CardDescription>
            Analyze options data using K-Means clustering to identify patterns and group similar options.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="numClusters">Number of Clusters</Label>
                <Input
                  id="numClusters"
                  type="number"
                  value={numClusters}
                  onChange={(e) => setNumClusters(parseInt(e.target.value))}
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="xAxis">X-Axis</Label>
                <Select value={xAxis} onValueChange={setXAxis}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select X-Axis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="marketPrice">Market Price</SelectItem>
                    <SelectItem value="strikePrice">Strike Price</SelectItem>
                    <SelectItem value="impliedVolatility">Implied Volatility</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="yAxis">Y-Axis</Label>
                <Select value={yAxis} onValueChange={setYAxis}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Y-Axis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="marketPrice">Market Price</SelectItem>
                    <SelectItem value="strikePrice">Strike Price</SelectItem>
                    <SelectItem value="impliedVolatility">Implied Volatility</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleClusterAnalysis}>Perform Clustering</Button>
          </div>
        </CardContent>
      </Card>

      {clusters.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Cluster Visualization</CardTitle>
            <CardDescription>
              Visual representation of the clustered options data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full">
              <ScatterChart
                data={clusters}
                index="cluster"
                categories={[...new Set(clusters.map(item => item.cluster))]}
                xAxisKey={xAxis}
                yAxisKey={yAxis}
                colors={["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]}
                className="h-[600px]"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClusterAnalysis;
