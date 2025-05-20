
import * as React from "react";
import {
  Area,
  AreaChart as RechartsAreaChart,
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart as RechartsScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

import { ChartContainer, ChartTooltipContent } from "./chart";

interface BaseChartProps {
  data: any[];
  index: string;
  categories: string[];
  colors?: string[];
  valueFormatter?: (value: number) => string;
  className?: string;
}

export function AreaChart({
  data,
  index,
  categories,
  colors = ["hsl(var(--chart-1))"],
  valueFormatter = (value) => value.toString(),
  className,
}: BaseChartProps) {
  return (
    <ChartContainer 
      className={className} 
      config={{
        primary: {
          theme: {
            light: colors[0] || "hsl(var(--chart-1))",
            dark: colors[0] || "hsl(var(--chart-1))",
          }
        }
      }}
    >
      <RechartsAreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={colors[0]} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={colors[0]} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis dataKey={index} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={valueFormatter} />
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <Tooltip 
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <ChartTooltipContent
                  active={active}
                  payload={payload}
                  formatter={(value: number) => valueFormatter(value)}
                />
              );
            }
            return null;
          }} 
        />
        {categories.map((category, i) => (
          <Area
            key={category}
            type="monotone"
            dataKey={category}
            stroke={colors[i % colors.length] || colors[0]}
            fillOpacity={1}
            fill="url(#colorGradient)"
          />
        ))}
      </RechartsAreaChart>
    </ChartContainer>
  );
}

export function LineChart({
  data,
  index,
  categories,
  colors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))"],
  valueFormatter = (value) => value.toString(),
  className,
}: BaseChartProps) {
  return (
    <ChartContainer 
      className={className} 
      config={{
        primary: {
          theme: {
            light: colors[0] || "hsl(var(--chart-1))",
            dark: colors[0] || "hsl(var(--chart-1))",
          }
        },
        secondary: {
          theme: {
            light: colors[1] || "hsl(var(--chart-2))",
            dark: colors[1] || "hsl(var(--chart-2))",
          }
        }
      }}
    >
      <RechartsLineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <XAxis dataKey={index} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={valueFormatter} />
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <Tooltip 
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <ChartTooltipContent
                  active={active}
                  payload={payload}
                  formatter={(value: number) => valueFormatter(value)}
                />
              );
            }
            return null;
          }} 
        />
        {categories.map((category, i) => (
          <Line
            key={category}
            type="monotone"
            dataKey={category}
            stroke={colors[i % colors.length] || colors[0]}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </RechartsLineChart>
    </ChartContainer>
  );
}

export function BarChart({
  data,
  index,
  categories,
  colors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))"],
  valueFormatter = (value) => value.toString(),
  className,
}: BaseChartProps) {
  return (
    <ChartContainer 
      className={className} 
      config={{
        primary: {
          theme: {
            light: colors[0] || "hsl(var(--chart-1))",
            dark: colors[0] || "hsl(var(--chart-1))",
          }
        },
        secondary: {
          theme: {
            light: colors[1] || "hsl(var(--chart-2))",
            dark: colors[1] || "hsl(var(--chart-2))",
          }
        }
      }}
    >
      <RechartsBarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <XAxis dataKey={index} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={valueFormatter} />
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <Tooltip 
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <ChartTooltipContent
                  active={active}
                  payload={payload}
                  formatter={(value: number) => valueFormatter(value)}
                />
              );
            }
            return null;
          }} 
        />
        {categories.map((category, i) => (
          <Bar
            key={category}
            dataKey={category}
            fill={colors[i % colors.length] || colors[0]}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ChartContainer>
  );
}

interface ScatterChartProps extends BaseChartProps {
  xAxisKey: string;
  yAxisKey: string;
  zAxisKey?: string;
}

export function ScatterChart({
  data,
  index,
  categories,
  xAxisKey,
  yAxisKey,
  zAxisKey,
  colors = ["hsl(var(--chart-1))"],
  valueFormatter = (value) => value.toString(),
  className,
}: ScatterChartProps) {
  return (
    <ChartContainer 
      className={className} 
      config={{
        primary: {
          theme: {
            light: colors[0] || "hsl(var(--chart-1))",
            dark: colors[0] || "hsl(var(--chart-1))",
          }
        }
      }}
    >
      <RechartsScatterChart margin={{ top: 20, right: 30, bottom: 10, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey={xAxisKey} 
          name={xAxisKey} 
          stroke="#888888" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
        />
        <YAxis 
          dataKey={yAxisKey} 
          name={yAxisKey} 
          stroke="#888888" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
          tickFormatter={valueFormatter} 
        />
        {zAxisKey && (
          <ZAxis 
            dataKey={zAxisKey} 
            range={[60, 400]} 
            name={zAxisKey} 
          />
        )}
        <Tooltip 
          cursor={{ strokeDasharray: '3 3' }}
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <ChartTooltipContent
                  active={active}
                  payload={payload}
                  formatter={(value: number) => valueFormatter(value)}
                />
              );
            }
            return null;
          }}
        />
        {categories.map((category, i) => (
          <Scatter 
            key={category}
            name={category} 
            data={data.filter(item => item[index] === category)} 
            fill={colors[i % colors.length] || colors[0]} 
          />
        ))}
      </RechartsScatterChart>
    </ChartContainer>
  );
}
