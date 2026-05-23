import React from "react";

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

interface OrderReceiptProps {
  order: Order;
}

const formatDateOnly = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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

export default function OrderReceipt({ order }: OrderReceiptProps) {
  console.log(order);
  return (
    <div className="bg-white">
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
          <span suppressHydrationWarning>{formatDateOnly(order.createdAt)}</span>
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
  );
}
