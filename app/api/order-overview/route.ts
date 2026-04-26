import { connectDB } from "@/lib/connectDB";
import { Order } from "@/lib/models";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Get current date
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-based

    // Calculate the start date: 12 months ago from the current month
    const startDate = new Date(currentYear, currentMonth - 11, 1); // 11 months ago + current month = 12 months

    // Get orders from startDate to now
    const orders = await Order.find({
      createdAt: {
        $gte: startDate,
        $lte: now
      }
    }).select('createdAt');

    // Group orders by month
    const monthlyData: { [key: string]: number } = {};

    // Initialize all months with 0
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentYear, currentMonth - 11 + i, 1);
      const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyData[monthKey] = 0;
    }

    // Count orders per month
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const monthKey = orderDate.toLocaleString('default', { month: 'short', year: 'numeric' });
      if (monthlyData.hasOwnProperty(monthKey)) {
        monthlyData[monthKey]++;
      }
    });

    // Convert to array format for chart
    const chartData = Object.entries(monthlyData).map(([month, count]) => ({
      month,
      orders: count
    }));

    return NextResponse.json({ chartData }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching order overview:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch order overview" },
      { status: 500 }
    );
  }
}