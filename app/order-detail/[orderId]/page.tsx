"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

interface Variety {
  sku: string;
  colorName: string;
  colorCode: string;
  sizeName: string;
  mrp: number;
  sellingPrice: number;
  discountPercent: number;
  imgLinks: string[];
  stock: number;
}

interface Product {
  _id: string;
  productName: string;
  thumbnail: string;
  varients: Variety[];
}

interface OrderItem {
  productId: Product;
  sku: string;
  quantity: number;
}

interface Order {
  _id: string;
  userId: {
    _id: string;
    name: string;
    phone: string;
    email: string;
    address?: string;
  };
  items: OrderItem[];
  shippingAddress?: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  orderStatus:
    | "pending"
    | "placed"
    | "processing"
    | "delivered"
    | "cancelled";
  createdAt: string;
  updatedAt: string;
  totalAmount: number;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedOrderStatus, setUpdatedOrderStatus] = useState<string | null>(
    null,
  );
  const [updating, setUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/orders/${orderId}`);

      if (!res.ok) {
        throw new Error("Failed to fetch order details");
      }

      const data = await res.json();
      setOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "pending":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "failed":
        return "bg-rose-50 text-rose-700 border border-rose-200";
      case "refunded":
        return "bg-slate-50 text-slate-700 border border-slate-200";
      default:
        return "bg-slate-50 text-slate-700 border border-slate-200";
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "processing":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "placed":
        return "bg-indigo-50 text-indigo-700 border border-indigo-200";
      case "pending":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "cancelled":
        return "bg-rose-50 text-rose-700 border border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border border-slate-200";
    }
  };

  const getColorAndSize = (
    item: OrderItem,
  ): {
    colorName: string;
    colorCode: string;
    sizeName: string;
    sellingPrice: number;
  } | null => {
    const variety = item.productId.varients.find((v) => v.sku === item.sku);

    if (!variety) return null;

    return {
      colorName: variety.colorName,
      colorCode: variety.colorCode,
      sizeName: variety.sizeName,
      sellingPrice: variety.sellingPrice,
    };
  };

  const calculateTotal = (item: OrderItem): number => {
    const colorSize = getColorAndSize(item);

    if (!colorSize) return 0;

    return colorSize.sellingPrice * item.quantity;
  };

  const handleStatusUpdate = async () => {
    if (!updatedOrderStatus || !order) return;

    try {
      setUpdating(true);

      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderStatus: updatedOrderStatus,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update order status");
      }

      const data = await res.json();

      setOrder(data.order);
      setUpdatedOrderStatus(null);

      setUpdateMessage({
        type: "success",
        text: "Order status updated successfully!",
      });

      setTimeout(() => setUpdateMessage(null), 3000);
    } catch (err) {
      setUpdateMessage({
        type: "error",
        text:
          err instanceof Error ? err.message : "Failed to update order status",
      });

      setTimeout(() => setUpdateMessage(null), 3000);
    } finally {
      setUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 md:p-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
          >
            ← Back to Orders
          </button>
        </div>

        <div className="bg-white rounded shadow p-8">
          <div className="flex items-center justify-center space-x-2">
            <div
              className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
              style={{ animationDelay: "0s" }}
            />
            <div
              className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
            <div
              className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
              style={{ animationDelay: "0.4s" }}
            />
          </div>

          <p className="text-center text-gray-600 mt-4">
            Loading order details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 md:p-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
          >
            ← Back to Orders
          </button>
        </div>

        <div className="bg-white rounded shadow p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Order
          </h2>

          <p className="text-rose-600 text-sm mt-2">
            {error || "Order not found"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }

          #receipt-print,
          #receipt-print * {
            visibility: visible;
          }

          #receipt-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 148mm;
            min-height: 210mm;
            background: white;
            padding: 16mm;
            margin: 0;
          }

          @page {
            size: A5 portrait;
            margin: 0;
          }
        }
      `}</style>

      {/* PRINT RECEIPT */}
      <div id="receipt-print" className="hidden print:block bg-white">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Order Receipt
          </h1>

          <p className="text-xs text-gray-600">
            Thank you for your purchase!
          </p>
        </div>

        <div className="border-t border-b border-gray-300 py-3 mb-4">
          <div className="flex justify-between text-xs mb-2">
            <span className="font-semibold">Receipt #</span>
            <span className="font-mono">{order._id}</span>
          </div>

          <div className="flex justify-between text-xs mb-2">
            <span className="font-semibold">Date</span>
            <span>{formatDateOnly(order.createdAt)}</span>
          </div>

          <div className="flex justify-between text-xs mb-2">
            <span className="font-semibold">Payment</span>
            <span className="capitalize">{order.paymentStatus}</span>
          </div>

          <div className="flex justify-between text-xs">
            <span className="font-semibold">Status</span>
            <span className="capitalize">{order.orderStatus}</span>
          </div>
        </div>

        <div className="mb-4 pb-3 border-b border-gray-300">
          <p className="text-xs font-semibold mb-1">CUSTOMER</p>

          <p className="text-xs font-semibold mb-1">
            {order.userId.name}
          </p>

          <p className="text-xs text-gray-600 mb-1">
            {order.userId.phone}
          </p>

          {order.userId.email && (
            <p className="text-xs text-gray-600 mb-1">
              {order.userId.email}
            </p>
          )}

          {order.shippingAddress && (
            <p className="text-xs text-gray-600">
              {order.shippingAddress}
            </p>
          )}
        </div>

        <table className="w-full text-xs mb-4">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="text-left py-2">Product</th>
              <th className="text-left py-2">Color</th>
              <th className="text-left py-2">Size</th>
              <th className="text-center py-2">Qty</th>
              <th className="text-right py-2">Price</th>
              <th className="text-right py-2">Total</th>
            </tr>
          </thead>

          <tbody>
            {order.items.map((item, idx) => {
              const colorSize = getColorAndSize(item);
              const itemTotal = calculateTotal(item);

              return (
                <tr key={idx} className="border-b border-gray-200">
                  <td className="py-2">
                    {item.productId.productName}
                  </td>

                  <td className="py-2">
                    {colorSize?.colorName || "—"}
                  </td>

                  <td className="py-2">
                    {colorSize?.sizeName || "—"}
                  </td>

                  <td className="text-center py-2">
                    {item.quantity}
                  </td>

                  <td className="text-right py-2">
                    ₹{colorSize?.sellingPrice || 0}
                  </td>

                  <td className="text-right py-2 font-semibold">
                    ₹{itemTotal}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="border-t-2 border-gray-900 pt-3 mb-4">
          <div className="flex justify-between">
            <span className="text-sm font-bold">TOTAL</span>

            <span className="text-lg font-bold">
              ₹{order.totalAmount}
            </span>
          </div>
        </div>

        <div className="text-center pt-3 border-t border-gray-300">
          <p className="text-xs text-gray-600 italic">
            Thank you for your purchase!
          </p>
        </div>
      </div>

      {/* MAIN PAGE */}
      <div className="min-h-screen bg-gray-100 p-4 md:p-6 lg:p-8 print:hidden">
        {/* Notification */}
        {updateMessage && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              updateMessage.type === "success"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}
          >
            <p className="font-medium">{updateMessage.text}</p>
          </div>
        )}

        {/* Back */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-2 font-medium"
          >
            ← Back to Orders
          </button>
        </div>

        {/* HEADER */}
        <div className="bg-white rounded shadow p-4 md:p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Order Details
              </h1>

              <code className="block w-full overflow-x-auto text-sm text-gray-600 font-mono bg-gray-100 px-3 py-2 rounded">
                Order ID: {order._id}
              </code>
            </div>

            <div className="flex flex-col gap-3 lg:text-right">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Order Date
                </p>

                <p className="text-base md:text-lg font-semibold text-gray-900">
                  {formatDate(order.createdAt)}
                </p>
              </div>

              <button
                onClick={handlePrint}
                className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Print Receipt
              </button>
            </div>
          </div>
        </div>

        {/* CUSTOMER + STATUS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* CUSTOMER */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded shadow p-4 md:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Customer Information
              </h2>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Full Name
                  </p>

                  <p className="text-base md:text-lg text-gray-900 break-words">
                    {order.userId.name}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Phone Number
                  </p>

                  <p className="text-base md:text-lg text-gray-900">
                    {order.userId.phone}
                  </p>
                </div>

                {order.userId.email && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Email
                    </p>

                    <p className="text-base md:text-lg text-gray-900 break-all">
                      {order.userId.email}
                    </p>
                  </div>
                )}

                {order.shippingAddress && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Shipping Address
                    </p>

                    <p className="text-base md:text-lg text-gray-900 break-words">
                      {order.shippingAddress}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* STATUS */}
          <div className="space-y-4">
            <div className="bg-white rounded shadow p-4 md:p-6">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">
                Payment Status
              </h3>

              <span
                className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold ${getPaymentStatusColor(
                  order.paymentStatus,
                )}`}
              >
                <span className="w-2 h-2 rounded-full mr-2 bg-current opacity-70"></span>

                {order.paymentStatus.charAt(0).toUpperCase() +
                  order.paymentStatus.slice(1)}
              </span>
            </div>

            <div className="bg-white rounded shadow p-4 md:p-6">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">
                Order Status
              </h3>

              <div className="space-y-2">
                <select
                  value={updatedOrderStatus || order.orderStatus}
                  onChange={(e) =>
                    setUpdatedOrderStatus(e.target.value)
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="placed">Placed</option>
                  <option value="processing">Processing</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                {updatedOrderStatus &&
                  updatedOrderStatus !== order.orderStatus && (
                    <button
                      onClick={handleStatusUpdate}
                      disabled={updating}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 rounded transition-colors"
                    >
                      {updating
                        ? "Updating..."
                        : "Update Status"}
                    </button>
                  )}
              </div>

              {updatedOrderStatus === order.orderStatus && (
                <span
                  className={`inline-flex items-center mt-4 px-4 py-2 rounded-lg text-sm font-semibold ${getOrderStatusColor(
                    order.orderStatus,
                  )}`}
                >
                  <span className="w-2 h-2 rounded-full mr-2 bg-current opacity-70"></span>

                  {order.orderStatus.charAt(0).toUpperCase() +
                    order.orderStatus.slice(1)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ORDER ITEMS */}
        <div className="bg-white rounded shadow overflow-hidden">
          <div className="px-4 md:px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Order Items
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {order.items.map((item, idx) => {
              const colorSize = getColorAndSize(item);
              const itemTotal = calculateTotal(item);

              return (
                <div
                  key={idx}
                  className="p-4 md:p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                    {/* IMAGE */}
                    <div className="flex justify-center md:block">
                      <img
                        src={item.productId.thumbnail}
                        alt={item.productId.productName}
                        className="w-24 object-cover rounded-lg bg-gray-100"
                      />
                    </div>

                    {/* DETAILS */}
                    <div className="flex-grow min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 break-words">
                        {item.productId.productName}
                      </h3>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {colorSize && (
                          <>
                            <div>
                              <p className="text-gray-600 font-medium">
                                Color
                              </p>

                              <div className="flex items-center gap-2 mt-1">
                                <div
                                  className="w-5 h-5 rounded border border-gray-300 flex-shrink-0"
                                  style={{
                                    backgroundColor:
                                      colorSize.colorCode,
                                  }}
                                />

                                <span className="text-gray-900 break-words">
                                  {colorSize.colorName}
                                </span>
                              </div>
                            </div>

                            <div>
                              <p className="text-gray-600 font-medium">
                                Size
                              </p>

                              <p className="text-gray-900 mt-1">
                                {colorSize.sizeName}
                              </p>
                            </div>
                          </>
                        )}

                        <div className="col-span-2 md:col-span-1">
                          <p className="text-gray-600 font-medium">
                            SKU
                          </p>

                          <code className="inline-block mt-1 text-gray-900 bg-gray-100 px-2 py-1 rounded text-xs break-all">
                            {item.sku}
                          </code>
                        </div>

                        <div>
                          <p className="text-gray-600 font-medium">
                            Quantity
                          </p>

                          <p className="text-gray-900 mt-1">
                            {item.quantity}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* PRICE */}
                    <div className="md:text-right border-t md:border-0 pt-4 md:pt-0">
                      {colorSize && (
                        <>
                          <p className="text-sm text-gray-600 mb-1">
                            Unit Price
                          </p>

                          <p className="text-xl font-semibold text-gray-900 mb-3">
                            ₹{colorSize.sellingPrice}
                          </p>

                          <p className="text-sm text-gray-600 mb-1">
                            Total
                          </p>

                          <p className="text-2xl font-bold text-blue-600">
                            ₹{itemTotal}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* GRAND TOTAL */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 md:px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between sm:justify-end items-start sm:items-center gap-2 sm:gap-4">
              <span className="text-lg font-semibold text-gray-900">
                Grand Total:
              </span>

              <span className="text-2xl md:text-3xl font-bold text-blue-600">
                ₹{order.totalAmount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}