"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/product");
        const data = await res.json();
        console.log(data)
        setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  
  function startingPrice(varients: Variety[]): number {
    if (!varients?.length) return 0;
    return Math.min(...varients.map((v) => v.sellingPrice));
  }


  function getUniqueColors(varients: Variety[]) {
    const map = new Map<string, string>();

    varients.forEach((v) => {
      if (!map.has(v.colorName)) {
        map.set(v.colorName, v.colorCode);
      }
    });

    return Array.from(map.entries()); // [ [colorName, colorCode] ]
  }

  async function handleDelete(id: string) {
    if (confirm("Are you sure?")) {
      try {
        await fetch(`/api/product?id=${id}`, { method: "DELETE" });
        setProducts((prev) => prev.filter((p) => p._id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 relative">
      <h1 className="text-2xl font-bold mb-6">Products</h1>

      {loading ? (
        <p>Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500">No products available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => {
            const colors = getUniqueColors(p.varients);

            return (
              <div key={p._id} className="bg-white rounded shadow p-4">
                <img
                  src={p.thumbnail}
                  alt={p.productName}
                  className="w-full object-cover rounded mb-4"
                />

                <h2 className="text-lg font-semibold mb-2">
                  {p.productName}
                </h2>

                <div className="text-sm text-gray-600 mb-1">
                  Brand: {p.brandId.brandName}
                </div>

                <div className="text-sm text-gray-600 mb-1">
                  Category: {p.categoryId.name}
                </div>

                {/* Color Swatches */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {colors.length > 0 ? (
                    colors.map(([name, code]) => (
                      <div
                        key={name}
                        title={name}
                        className="w-5 h-5 rounded-full border"
                        style={{ backgroundColor: code }}
                      />
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">No colors</span>
                  )}
                </div>

                {/* Price */}
                <div className="text-sm text-gray-600 mb-3">
                  Starting price: ₹{startingPrice(p.varients)}
                </div>

                {/* Stock summary */}
                <div className="text-xs text-gray-500 mb-3">
                  Total SKUs: {p.varients.length} | Total Stock:{" "}
                  {p.varients.reduce((sum, v) => sum + v.stock, 0)}
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/editProduct/${p._id}`}
                    className="flex-1 text-center bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-sm"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => handleDelete(p._id)}
                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Add Button */}
      <Link
        href="/addProduct"
        className="fixed flex justify-center items-center bottom-6 right-6 bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg hover:bg-blue-700"
      >
        <span className="text-3xl font-medium">+</span>
      </Link>
    </div>
  );
}