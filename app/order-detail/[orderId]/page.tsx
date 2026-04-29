"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Size {
  sizeID: string;
  sku: string;
  sizeName: string;
  mrp: number;
  sellingPrice: number;
  discountPercent: number;
  stock: number;
}

interface Variety {
  colorID: string;
  colorName: string;
  colorCode: string;
  imgLinks: string[];
  sizes: Size[];
}

interface Product {
  _id: string;
  productName: string;
  thumbnail: string;
  varients: Variety[];
}

interface OrderItem {
  productId: Product;
  colorId: string;
  sizeId: string;
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
  orderStatus: "pending" | "placed" | "processing" | "delivered" | "cancelled";
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
  const [updatedOrderStatus, setUpdatedOrderStatus] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
      console.log(data.order)
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
    item: OrderItem
  ): { colorName: string; colorCode: string; sizeName: string; sellingPrice: number } | null => {
    const variety = item.productId.varients.find(
      (v) => v.colorID === item.colorId
    );
    if (!variety) return null;

    const size = variety.sizes.find((s) => s.sizeID === item.sizeId);
    if (!size) return null;

    return {
      colorName: variety.colorName,
      colorCode: variety.colorCode,
      sizeName: size.sizeName,
      sellingPrice: size.sellingPrice,
    };
  };

  const calculateTotal = (item: OrderItem): number => {
    const colorSize = getColorAndSize(item);
    if (!colorSize) return 0;
    return colorSize.sellingPrice * item.quantity;
  };

  const calculateGrandTotal = (): number => {
    return order?.items.reduce((sum, item) => sum + calculateTotal(item), 0) || 0;
  };

  const handleStatusUpdate = async () => {
    if (!updatedOrderStatus || !order) return;

    try {
      setUpdating(true);
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: updatedOrderStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update order status");
      }

      const data = await res.json();
      setOrder(data.order);
      setUpdatedOrderStatus(null);
      setUpdateMessage({ type: 'success', text: 'Order status updated successfully!' });
      setTimeout(() => setUpdateMessage(null), 3000);
    } catch (err) {
      setUpdateMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update order status',
      });
      setTimeout(() => setUpdateMessage(null), 3000);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
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
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
          </div>
          <p className="text-center text-gray-600 mt-4">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
          >
            ← Back to Orders
          </button>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded shadow p-6">
          <p className="text-rose-700 font-medium">Error loading order</p>
          <p className="text-rose-600 text-sm mt-2">{error || "Order not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Notification Messages */}
      {updateMessage && (
        <div className={`mb-6 p-4 rounded-lg ${updateMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
          <p className="font-medium">{updateMessage.text}</p>
        </div>
      )}

      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-2 font-medium"
        >
          ← Back to Orders
        </button>
      </div>

      {/* Header */}
      <div className="bg-white rounded shadow p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Details</h1>
            <code className="text-gray-600 font-mono bg-gray-100 px-3 py-1 rounded">
              Order ID: {order._id}
            </code>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-2">Order Date</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Customer Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Full Name</p>
                <p className="text-lg text-gray-900">{order.userId.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Phone Number</p>
                <p className="text-lg text-gray-900">{order.userId.phone}</p>
              </div>
              {order.userId.email && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Email</p>
                  <p className="text-lg text-gray-900">{order.userId.email}</p>
                </div>
              )}
              {order.shippingAddress && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Shipping Address</p>
                  <p className="text-lg text-gray-900">{order.shippingAddress}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Status */}
        <div className="space-y-4">
          <div className="bg-white rounded shadow p-6">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">
              Payment Status
            </h3>
            <span
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold ${getPaymentStatusColor(
                order.paymentStatus
              )}`}
            >
              <span className="w-2 h-2 rounded-full mr-2 bg-current opacity-70"></span>
              {order.paymentStatus.charAt(0).toUpperCase() +
                order.paymentStatus.slice(1)}
            </span>
          </div>

          <div className="bg-white rounded shadow p-6">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">
              Order Status
            </h3>
            <div className="space-y-2">
              <select
                value={updatedOrderStatus || order.orderStatus}
                onChange={(e) => setUpdatedOrderStatus(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="placed">Placed</option>
                <option value="processing">Processing</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              {updatedOrderStatus && updatedOrderStatus !== order.orderStatus && (
                <button
                  onClick={handleStatusUpdate}
                  disabled={updating}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 rounded transition-colors"
                >
                  {updating ? 'Updating...' : 'Update Status'}
                </button>
              )}
            </div>
            {updatedOrderStatus === order.orderStatus && (
              <span
                className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold ${getOrderStatusColor(
                  order.orderStatus
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

      {/* Order Items */}
      <div className="bg-white rounded shadow overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {order.items.map((item, idx) => {
            const colorSize = getColorAndSize(item);
            const itemTotal = calculateTotal(item);

            return (
              <div key={idx} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex gap-6">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.productId.thumbnail}
                      alt={item.productId.productName}
                      className="w-24 h-24 object-cover rounded-lg bg-gray-100"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.productId.productName}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {colorSize && (
                        <>
                          <div>
                            <p className="text-gray-600 font-medium">Color</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div
                                className="w-5 h-5 rounded border border-gray-300"
                                style={{ backgroundColor: colorSize.colorCode }}
                                title={colorSize.colorName}
                              ></div>
                              <span className="text-gray-900">{colorSize.colorName}</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-600 font-medium">Size</p>
                            <p className="text-gray-900 mt-1">{colorSize.sizeName}</p>
                          </div>
                        </>
                      )}
                      <div>
                        <p className="text-gray-600 font-medium">SKU</p>
                        <code className="text-gray-900 mt-1 bg-gray-100 px-2 py-1 rounded text-xs">
                          {item.sku}
                        </code>
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">Quantity</p>
                        <p className="text-gray-900 mt-1">{item.quantity}</p>
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex-shrink-0 text-right">
                    {colorSize && (
                      <>
                        <p className="text-sm text-gray-600 mb-1">Unit Price</p>
                        <p className="text-xl font-semibold text-gray-900 mb-3">
                          ₹{colorSize.sellingPrice}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">Total</p>
                        <p className="text-2xl font-bold text-blue-600">₹{itemTotal}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Grand Total */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-end items-center gap-4">
            <span className="text-lg font-semibold text-gray-900">Grand Total:</span>
            <span className="text-3xl font-bold text-blue-600">₹{order.totalAmount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
