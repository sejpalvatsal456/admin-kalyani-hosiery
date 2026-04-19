import { connectDB } from "@/lib/connectDB";
import { Order } from "@/lib/models";
import { NextRequest, NextResponse } from "next/server";

// GET a single order by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    await connectDB();
    const { orderId } = await params;

    // Get order with populated user and product details
    const order = await Order.findById(orderId)
      .populate("userId", "name phone email address")
      .populate("items.productId", "productName thumbnail varients");

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ order }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch order" },
      { status: 500 }
    );
  }
}

// PATCH to update order status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    await connectDB();
    const { orderId } = await params;
    const { orderStatus, paymentStatus } = await req.json();

    // Validate status values
    const validOrderStatuses = ["pending", "placed", "processing", "delivered", "cancelled"];
    const validPaymentStatuses = ["pending", "paid", "failed", "refunded"];

    if (orderStatus && !validOrderStatuses.includes(orderStatus)) {
      return NextResponse.json(
        { error: "Invalid order status" },
        { status: 400 }
      );
    }

    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return NextResponse.json(
        { error: "Invalid payment status" },
        { status: 400 }
      );
    }

    // Update the order
    const updateData: any = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    )
      .populate("userId", "name phone email address")
      .populate("items.productId", "productName thumbnail varients");

    if (!updatedOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ order: updatedOrder, message: "Order updated successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update order" },
      { status: 500 }
    );
  }
}
