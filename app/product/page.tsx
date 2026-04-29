"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  MaterialReactTable,
  MaterialReactTableProps,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_ColumnFiltersState,
  type MRT_PaginationState,
  type MRT_SortingState,
} from "material-react-table";
import { Button, Box, Typography, Chip } from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import dynamic from "next/dynamic";


const MRTNoSSR = dynamic<MaterialReactTableProps<any>> (
  () =>
    import("material-react-table").then((mod) => mod.MaterialReactTable),
  { ssr: false }
);

// API Response type for MRT
type ProductApiResponse = {
  data: Array<Product>;
  meta: {
    totalRowCount: number;
  };
};

// New flattened Variant (SKU-level)
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

interface Desc {
  key: string;
  value: string;
}

interface Product {
  _id: string;
  productName: string;
  slug: string;
  categoryId: { _id: string; name: string };
  subcategoryId: { _id: string; name: string };
  brandId: { _id: string; brandName: string };
  thumbnail: string;
  tags: string[];
  varients: Variety[]; 
  desc: Desc[];
  loc: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProductPage() {
  // Data and fetching state
  const [data, setData] = useState<Product[]>([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [rowCount, setRowCount] = useState(0);

  // Table state
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Fetch data with MRT parameters
  useEffect(() => {
    const fetchData = async () => {
      if (!data.length) {
        setIsLoading(true);
      } else {
        setIsRefetching(true);
      }

      const url = new URL('/api/product', window.location.origin);
      url.searchParams.set(
        'start',
        `${pagination.pageIndex * pagination.pageSize}`,
      );
      url.searchParams.set('size', `${pagination.pageSize}`);
      url.searchParams.set('filters', JSON.stringify(columnFilters ?? []));
      url.searchParams.set('globalFilter', globalFilter ?? '');
      url.searchParams.set('sorting', JSON.stringify(sorting ?? []));

      try {
        const response = await fetch(url.href);
        const json = (await response.json()) as ProductApiResponse;
        setData(json.data);
        setRowCount(json.meta.totalRowCount);
      } catch (error) {
        setIsError(true);
        console.error(error);
        return;
      }
      setIsError(false);
      setIsLoading(false);
      setIsRefetching(false);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    columnFilters, // re-fetch when column filters change
    globalFilter, // re-fetch when global filter changes
    pagination.pageIndex, // re-fetch when page index changes
    pagination.pageSize, // re-fetch when page size changes
    sorting, // re-fetch when sorting changes
  ]);

  
  function startingPrice(varients: Variety[]): number {
    if (!varients?.length) return 0;
    return Math.min(...varients.map((v) => v.sellingPrice));
  }

  function startingMRP(varients: Variety[]): number {
    if (!varients?.length) return 0;
    return Math.min(...varients.map((v) => v.mrp));
  }

  async function handleDelete(id: string) {
    if (confirm("Are you sure?")) {
      try {
        await fetch(`/api/product?id=${id}`, { method: "DELETE" });
        // Refetch data after deletion
        setData(prev => prev.filter(p => p._id !== id));
        setRowCount(prev => prev - 1);
      } catch (err) {
        console.error(err);
      }
    }
  }

  const columns = useMemo<MRT_ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: 'productName',
        header: 'Product Name',
        size: 200,
        Cell: ({ cell, row }) => (
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {cell.getValue<string>()}
            </Typography>
        ),
      },
      {
        accessorKey: 'brandId.brandName',
        header: 'Brand',
        size: 120,
        Cell: ({ cell }) => (
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {cell.getValue<string>()}
            </Typography>
        ),
      },
      {
        accessorKey: 'categoryId.name',
        header: 'Category',
        size: 120,
      },
      {
        accessorKey: 'subcategoryId.name',
        header: 'Subcategory',
        size: 120,
      },
      {
        accessorKey: 'slug',
        header: 'Slug',
        size: 150,
        Cell: ({ cell }) => (
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
            {cell.getValue<string>()}
          </Typography>
        ),
      },
      {
        accessorFn: (row) => startingMRP(row.varients),
        header: 'Original Price',
        size: 120,
        Cell: ({ cell }) => (
          <Typography sx={{ fontWeight: 500, textAlign: 'right' }}>
            ₹{cell.getValue<number>()}
          </Typography>
        ),
      },
      {
        accessorFn: (row) => startingPrice(row.varients),
        header: 'Discounted Price',
        size: 120,
        Cell: ({ cell }) => (
          <Typography sx={{ fontWeight: 500, textAlign: 'right', color: 'green' }}>
            ₹{cell.getValue<number>()}
          </Typography>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        size: 150,
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, justifyContent: 'center' }}>
            <Button
              component={Link}
              href={`/editProduct/${row.original._id}`}
              variant="contained"
              size="small"
              startIcon={<Edit />}
              sx={{
                bgcolor: '#1976d2',
                '&:hover': { bgcolor: '#1565c0' },
                fontSize: '0.75rem',
                px: 2
              }}
            >
              Edit
            </Button>
            <Button
              onClick={() => handleDelete(row.original._id)}
              variant="contained"
              size="small"
              startIcon={<Delete />}
              sx={{
                bgcolor: '#d32f2f',
                '&:hover': { bgcolor: '#b71c1c' },
                fontSize: '0.75rem',
                px: 2
              }}
            >
              Delete
            </Button>
          </Box>
        ),
      },
    ],
    [],
  );

  const table = useMaterialReactTable({
    columns,
    data,
    enableRowSelection: false,
    enableColumnFilters: false,
    enableGlobalFilter: false,
    enablePagination: true,
    enableSorting: true,
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    muiToolbarAlertBannerProps: isError
      ? {
          color: 'error',
          children: 'Error loading data',
        }
      : undefined,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    rowCount,
    state: {
      columnFilters,
      globalFilter,
      isLoading,
      pagination,
      showAlertBanner: isError,
      showProgressBars: isRefetching,
      sorting,
    },
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true,
    },
  });

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5", p: 3, position: "relative" }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, fontWeight: "bold" }}>
        Products
      </Typography>

      {isLoading ? (
        <Typography>Loading...</Typography>
      ) : (
        <MRTNoSSR table={table} />
      )}

      {/* Floating Add Button */}
      <Button
        component={Link}
        href="/addProduct"
        variant="contained"
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 56,
          height: 64,
          borderRadius: "50%",
          bgcolor: "#1976d2",
          "&:hover": { bgcolor: "#1565c0" },
          boxShadow: 3,
        }}
      >
        <Add sx={{ fontSize: 28 }} />
      </Button>
    </Box>
  );
}