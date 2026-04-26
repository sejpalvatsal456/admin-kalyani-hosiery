import { connectDB } from "@/lib/connectDB";
import { Order } from "@/lib/models";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Get current month start and end
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Get orders for current month
    const orders = await Order.find({
      createdAt: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    }).select('orderStatus');

    // Count orders by status
    const statusCounts: { [key: string]: number } = {
      pending: 0,
      placed: 0,
      processing: 0,
      delivered: 0,
      cancelled: 0
    };

    orders.forEach(order => {
      const status = order.orderStatus;
      if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status]++;
      }
    });

    // Convert to array format for chart
    const chartData = Object.entries(statusCounts).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1), // Capitalize first letter
      count,
      fill: getStatusColor(status)
    }));

    const totalOrders = orders.length;

    return NextResponse.json({ chartData, totalOrders }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching order summary:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch order summary" },
      { status: 500 }
    );
  }
}

function getStatusColor(status: string): string {
  const colors: { [key: string]: string } = {
    pending: "#fbbf24", // yellow
    placed: "#3b82f6", // blue
    processing: "#f59e0b", // amber
    delivered: "#10b981", // green
    cancelled: "#ef4444" // red
  };
  return colors[status] || "#6b7280"; // default gray
}