import { connectDB } from "@/lib/connectDB";
import { Brand, Order, Product } from "@/lib/models";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    if (payload.role !== "admin") return NextResponse.json({ msg: "Forbidden" }, { status: 403 });
    return null;
  } catch (err) {
    return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const authErr = await requireAdmin(req);
    if (authErr) return authErr;

    await connectDB();

    // Total Sales: sum of totalAmount from Orders with status "paid"
    const salesResult = await Order.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalSales = salesResult[0]?.total || 0;

    // Total Products: count of Product documents
    const totalProducts = await Product.countDocuments();

    // Total Brands: count of Brand documents
    const totalBrands = await Brand.countDocuments();

    // Total Orders: count of Order documents with status "paid"
    const totalOrders = await Order.countDocuments({ status: "paid" });

    return NextResponse.json(
      {
        totalSales,
        totalProducts,
        totalBrands,
        totalOrders,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { msg: "Internal Server Error", error },
      { status: 500 }
    );
  }
}
