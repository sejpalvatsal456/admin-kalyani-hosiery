"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";

interface CartItem {
  productId: {
    _id: string;
    productName: string;
  };
  sku: string;
  quantity: number;
}

interface Order {
  _id: string;
  userId: {
    name: string;
  };
  items: CartItem[];
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
}

export default function LatestOrders() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders((data.orders || []).slice(0, 5));
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "delivered":
        return "bg-emerald-100 text-emerald-700";

      case "processing":
        return "bg-blue-100 text-blue-700";

      case "placed":
        return "bg-indigo-100 text-indigo-700";

      case "pending":
        return "bg-amber-100 text-amber-700";

      case "cancelled":
        return "bg-rose-100 text-rose-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  return (
    // <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
    //   <div className="flex items-center justify-between mb-5">
    //     <h2 className="text-lg font-semibold text-gray-900">
    //       Latest Orders
    //     </h2>

    //     <button
    //       onClick={() => router.push("/orders")}
    //       className="text-sm text-blue-600 hover:text-blue-700 font-medium"
    //     >
    //       View All
    //     </button>
    //   </div>

    // </div>
    <Card className="col-span-2">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Order Overview</CardTitle>
        <button
          onClick={() => router.push("/orders")}
          className="text-sm mr-8 text-blue-600 hover:text-blue-700 font-medium"
        >
          View All
        </button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-14 rounded-lg bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-gray-500 text-sm">
            No orders found
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">
                      Customer
                    </th>

                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">
                      Items
                    </th>

                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">
                      Status
                    </th>

                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order._id}
                      onClick={() => router.push(`/order-detail/${order._id}`)}
                      className="border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer"
                    >
                      <td className="px-4 py-4">
                        <div className="font-medium text-sm text-gray-900">
                          {order.userId.name}
                        </div>

                        <div className="text-xs text-gray-500 font-mono">
                          #{order._id}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-700">
                          {order.items.length}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                            order.orderStatus,
                          )}`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-600">
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
