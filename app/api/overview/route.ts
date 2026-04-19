import { connectDB } from "@/lib/connectDB";
import { NextRequest, NextResponse } from "next/server";
import { Brand, Order, Product } from "@/lib/models";


export const GET = async(req: NextRequest) => {
  try {
    
    await connectDB();

    // Total Sales: sum of totalAmount from Orders with status "paid"
    const salesResult = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    console.log(salesResult);
    const totalSales = salesResult.length > 0 ? salesResult[0].total : 0;

    // Total Products: count of Product documents
    const totalProducts = await Product.countDocuments();

    // Total Brands: count of Brand documents
    const totalBrands = await Brand.countDocuments();

    // Total Orders: count of Order documents
    const totalOrders = await Order.countDocuments();

    return NextResponse.json(
      { totalSales, totalProducts, totalBrands, totalOrders },
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json(
      { msg: "Internal Server Error" },
      { status: 500 }
    );
  }
}