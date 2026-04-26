"use client";

import { connectDB } from "@/lib/connectDB";
import { useEffect, useState } from "react";
import StatsCard from "./_components/ui/StatsCard";
import OrderOverview from "./_components/OrderOverview";
import OrderStatus from "./_components/OrderStatus";
export default function Home() {
  // let totalSales = 0;
  // let totalProducts = 0;
  // let totalBrands = 0;
  // let totalOrders = 0;

  const [totalSales, setTotalSales] = useState<number>(0);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [totalBrands, setTotalBrands] = useState<number>(0);
  const [totalOrders, setTotalOrders] = useState<number>(0);

  useEffect(() => {
    
    fetch('/api/overview')
    .then(res => res.json())
    .then(data => {
      setTotalSales(data.totalSales);
      setTotalProducts(data.totalProducts);
      setTotalBrands(data.totalBrands);
      setTotalOrders(data.totalOrders);
    })
    .catch(err => console.log(err));

  }, [])

  const stats = [
    { label: 'Total Sales', value: `₹${totalSales.toLocaleString()}`, themeColor: "#01d765" },
    { label: 'Total Products', value: totalProducts.toString(), themeColor: "#0189d7" },
    { label: 'Total Brands', value: totalBrands.toString(), themeColor: "#d8e700" },
    { label: 'Total Orders', value: totalOrders.toString(), themeColor: "#00ffc8" },
  ];

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <StatsCard key={stat.label} label={stat.label} value={stat.value} themeColor={stat.themeColor} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <OrderOverview />
        <OrderStatus />
      </div>
      
    </main>
  );
}
