"use client";

import { useEffect, useState } from "react";
import { Cell, Label, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/app/_components/ui/chart";

const chartConfig = {
  count: {
    label: "Orders",
  },
  pending: {
    label: "Pending",
    color: "#fbbf24",
  },
  placed: {
    label: "Placed",
    color: "#3b82f6",
  },
  processing: {
    label: "Processing",
    color: "#f59e0b",
  },
  delivered: {
    label: "Delivered",
    color: "#10b981",
  },
  cancelled: {
    label: "Cancelled",
    color: "#ef4444",
  },
} satisfies ChartConfig;

interface OrderStatusData {
  status: string;
  count: number;
  fill: string;
}

export default function OrderStatus() {
  const [data, setData] = useState<OrderStatusData[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/order-summary")
      .then((res) => res.json())
      .then((data) => {
        setData(data.chartData);
        setTotalOrders(data.totalOrders);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Card className="bg-white text-black border border-gray-200">
        <CardHeader>
          <CardTitle>Order Status</CardTitle>
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
    <Card className="bg-white text-black border border-gray-200">
      <CardHeader>
        <CardTitle>Order Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              fill="#111827"
                              fontSize={24}
                              fontWeight="bold"
                            >
                              {totalOrders}
                            </tspan>

                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 20}
                              fill="#6b7280"
                              fontSize={12}
                            >
                              Orders
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
                <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    className="bg-white text-slate-900 border border-gray-200 shadow-md [&_*]:text-slate-900"
                  />
                }
              />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Status list */}
          <div className="w-full space-y-2">
            {data.map((item) => (
              <div
                key={item.status}
                className="flex justify-between items-center"
              >
                <span className="text-sm">{item.status}</span>
                <span style={{ backgroundColor: item.fill }} className="px-2 text-white text-center rounded-full text-sm font-medium">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
