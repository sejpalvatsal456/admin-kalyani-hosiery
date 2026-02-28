import { connectDB } from "@/lib/connectDB";
import { Brand, Order, Product } from "@/lib/models";

export default async function Home() {
  let totalSales = 0;
  let totalProducts = 0;
  let totalBrands = 0;
  let totalOrders = 0;

  try {
    await connectDB();

    // Total Sales: sum of totalAmount from Orders with status "paid"
    const salesResult = await Order.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    totalSales = salesResult[0]?.total || 0;

    // Total Products: count of Product documents
    totalProducts = await Product.countDocuments();

    // Total Brands: count of Brand documents
    totalBrands = await Brand.countDocuments();

    // Total Orders: count of Order documents with status "paid"
    totalOrders = await Order.countDocuments({ status: "paid" });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
  }

  const stats = [
    { label: 'Total Sales', value: `₹${totalSales.toLocaleString()}` },
    { label: 'Total Products', value: totalProducts.toString() },
    { label: 'Total Brands', value: totalBrands.toString() },
    { label: 'Total Orders', value: totalOrders.toString() },
  ];

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white shadow rounded-lg p-6 flex flex-col justify-between"
          >
            <dt className="text-sm font-medium text-gray-500">
              {stat.label}
            </dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">
              {stat.value}
            </dd>
          </div>
        ))}
      </div>
    </main>
  );
}
