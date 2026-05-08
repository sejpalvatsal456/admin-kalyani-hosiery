"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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

interface Order {
  _id: string;
  userId: {
    _id: string;
    name: string;
    phone: string;
    email: string;
  };
  items: CartItem[];
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
      setError(
        err instanceof Error ? err.message : "An error occurred"
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
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
            <Typography
              variant="body2"
              sx={{ fontWeight: 600 }}
            >
              {row.original.userId.name}
            </Typography>

            {row.original.userId.email && (
              <Typography
                variant="caption"
                color="text.secondary"
              >
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
                  <Typography
                    key={idx}
                    variant="caption"
                    display="block"
                  >
                    {item.productId.productName} ({item.sku}) ×{" "}
                    {item.quantity}
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
          const formatted = formatDate(
            cell.getValue<string>()
          ).split(",");

          return (
            <Box>
              <Typography variant="body2">
                {formatted[0]}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                {formatted[1]}
              </Typography>
            </Box>
          );
        },
      },
    ],
    []
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
      onClick: () =>
        router.push(`/order-detail/${row.original._id}`),
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
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f5f5",
        p: 3,
      }}
    >
      <Typography
        variant="h4"
        sx={{
          mb: 1,
          fontWeight: "bold",
        }}
      >
        Orders
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 3 }}
      >
        Manage and track all customer orders
      </Typography>

      <MaterialReactTable table={table} />
    </Box>
  );
}