import { connectDB } from "@/lib/connectDB";
import { Order, User } from "@/lib/models";
import { NextRequest, NextResponse } from "next/server";

// GET all orders
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Get all orders with user details populated
    const orders = await Order.find()
      .populate("userId", "name phone email")
      .populate("items.productId", "productName")
      .sort({ createdAt: -1 });

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
