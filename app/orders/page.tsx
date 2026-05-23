"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import OrderReceipt from "@/app/components/OrderReceipt";

import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";

import {
  Box,
  Typography,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";

interface CartItem {
  productId: {
    _id: string;
    productName: string;
  };
  colorId: string;
  sizeId: string;
  sku: string;
  quantity: number;
}

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
  orderStatus: "pending" | "placed" | "processing" | "delivered" | "cancelled";
  createdAt: string;
  updatedAt: string;
  totalAmount: number;
}

export default function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setLoading(true);

      const res = await fetch("/api/orders");

      if (!res.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await res.json();

      setOrders(data.orders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handlePrintAll() {
    window.print();
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getPaymentColor(status: string) {
    switch (status) {
      case "paid":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "error";
      case "refunded":
        return "default";
      default:
        return "default";
    }
  }

  function getOrderColor(status: string) {
    switch (status) {
      case "delivered":
        return "success";
      case "processing":
        return "info";
      case "placed":
        return "primary";
      case "pending":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  }

  const columns = useMemo<MRT_ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: "_id",
        header: "Order ID",
        size: 120,
        Cell: ({ cell }) => (
          <Typography
            sx={{
              fontFamily: "monospace",
              fontSize: "0.75rem",
              bgcolor: "#f5f5f5",
              px: 1,
              py: 0.5,
              borderRadius: 1,
              display: "inline-block",
            }}
          >
            {cell.getValue<string>().slice(0, 8)}...
          </Typography>
        ),
      },

      {
        accessorFn: (row) => row.userId.name,
        header: "Customer",
        size: 180,
        Cell: ({ row }) => (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {row.original.userId.name}
            </Typography>

            {row.original.userId.email && (
              <Typography variant="caption" color="text.secondary">
                {row.original.userId.email}
              </Typography>
            )}
          </Box>
        ),
      },

      {
        accessorFn: (row) => row.userId.phone,
        header: "Phone",
        size: 140,
      },

      {
        accessorFn: (row) => row.items.length,
        header: "Items",
        size: 80,
        Cell: ({ row }) => (
          <Tooltip
            title={
              <Box>
                {row.original.items.map((item, idx) => (
                  <Typography key={idx} variant="caption" display="block">
                    {item.productId.productName} ({item.sku}) × {item.quantity}
                  </Typography>
                ))}
              </Box>
            }
          >
            <Chip
              label={row.original.items.length}
              color="primary"
              size="small"
            />
          </Tooltip>
        ),
      },

      {
        accessorKey: "paymentStatus",
        header: "Payment",
        size: 120,
        Cell: ({ cell }) => (
          <Chip
            label={cell.getValue<string>()}
            color={getPaymentColor(cell.getValue<string>()) as any}
            size="small"
            sx={{
              textTransform: "capitalize",
              fontWeight: 600,
            }}
          />
        ),
      },

      {
        accessorKey: "orderStatus",
        header: "Order Status",
        size: 140,
        Cell: ({ cell }) => (
          <Chip
            label={cell.getValue<string>()}
            color={getOrderColor(cell.getValue<string>()) as any}
            size="small"
            sx={{
              textTransform: "capitalize",
              fontWeight: 600,
            }}
          />
        ),
      },

      {
        accessorKey: "createdAt",
        header: "Created",
        size: 180,
        Cell: ({ cell }) => {
          const formatted = formatDate(cell.getValue<string>()).split(",");

          return (
            <Box suppressHydrationWarning>
              <Typography variant="body2" suppressHydrationWarning>{formatted[0]}</Typography>

              <Typography variant="caption" color="text.secondary" suppressHydrationWarning>
                {formatted[1]}
              </Typography>
            </Box>
          );
        },
      },
    ],
    [],
  );

  const table = useMaterialReactTable({
    columns,
    data: orders,

    enableRowSelection: false,
    enableColumnFilters: true,
    enableGlobalFilter: true,
    enablePagination: true,
    enableSorting: true,

    muiTableBodyRowProps: ({ row }) => ({
      onClick: () => router.push(`/order-detail/${row.original._id}`),
      sx: {
        cursor: "pointer",
      },
    }),

    initialState: {
      pagination: {
        pageSize: 10,
        pageIndex: 0,
      },
      showGlobalFilter: true,
    },

    state: {
      isLoading: loading,
      showAlertBanner: !!error,
    },

    muiToolbarAlertBannerProps: error
      ? {
          color: "error",
          children: error,
        }
      : undefined,
  });

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }

          #all-orders-print,
          #all-orders-print * {
            visibility: visible;
          }

          #all-orders-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }

          .print-page-break {
            page-break-after: always;
            break-after: page;
          }

          @page {
            size: A5 portrait;
            margin: 0;
          }
        }
      `}</style>

      {/* PRINT ALL ORDERS */}
      <div id="all-orders-print" className="hidden print:block bg-white">
        {orders.map((order) => (
          <div key={order._id} className="print-page-break p-4">
            <OrderReceipt order={order} />
          </div>
        ))}
      </div>

      {/* MAIN PAGE */}
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#f5f5f5",
          p: 3,
        }}
      >
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-col">
            <Typography
              variant="h4"
              sx={{
                mb: 1,
                fontWeight: "bold",
              }}
            >
              Orders
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Manage and track all customer orders
            </Typography>
          </div>

          <div className="flex flex-col">
            <Button 
              className="self-end" 
              variant="contained"
              onClick={handlePrintAll}
            >
              Print All
            </Button>
          </div>
        </div>

        <MaterialReactTable table={table} />
      </Box>
    </>
  );
}
