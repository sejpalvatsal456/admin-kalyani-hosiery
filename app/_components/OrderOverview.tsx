"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/app/_components/ui/chart";

const chartConfig = {
  orders: {
    label: "Orders",
    color: "#3b82f6",
    // color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

interface OrderOverviewData {
  month: string;
  orders: number;
}

export default function OrderOverview() {
  const [data, setData] = useState<OrderOverviewData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/order-overview")
      .then((res) => res.json())
      .then((data) => {
        console.log(data.chartData);
        setData(data.chartData);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Order Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Order Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              accessibilityLayer
            >
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    className="bg-white text-slate-900 border border-gray-200 shadow-md [&_*]:text-slate-900"
                  />
                }
              />
              <Bar
                dataKey="orders"
                fill="var(--color-orders)"
                radius={[4,4,0,0]}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill="var(--color-orders)" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
