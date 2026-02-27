"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface Size {
  id: string;
  size: string;
  mrp: number;
  sellingPrice: number;
  stock: number;
}

interface Variety {
  id: string;
  colorName: string;
  color: string;
  imgLinks: string[];
  sizes: Size[];
}

interface Desc {
  key: string;
  value: string;
}

interface Product {
  id: string;
  brandId: string;
  productName: string;
  categoryId: string;
  subcategoryId: string;
  thumbnail: string;
  variety: Variety[];
  desc: Desc[];
}

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/product");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function startingPrice(varieties: Variety[]): number {
    let min = Infinity;
    varieties.forEach((v) => {
      v.sizes.forEach((s) => {
        if (s.sellingPrice < min) min = s.sellingPrice;
      });
    });
    return min === Infinity ? 0 : min;
  }

  async function handleDelete(id: string) {
    if (confirm("Are you sure?")) {
      try {
        await fetch(`/api/product?id=${id}`, { method: "DELETE" });
        setProducts(products.filter((p) => p.id !== id));
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
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded shadow p-4">
              <img
                src={p.thumbnail}
                alt={p.productName}
                className="w-full h-40 object-cover rounded mb-4"
              />
              <h2 className="text-lg font-semibold mb-2">{p.productName}</h2>
              <div className="text-sm text-gray-600 mb-1">Brand: {p.brandId}</div>
              <div className="text-sm text-gray-600 mb-1">
                Category: {p.categoryId}
              </div>
              <div className="text-sm text-gray-600 mb-1">
                First color: {p.variety[0]?.colorName || '-'}
              </div>
              <div className="text-sm text-gray-600 mb-3">
                Starting price: ₹{startingPrice(p.variety)}
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/editProduct/${p.id}`}
                  className="flex-1 text-center bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-sm"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="flex-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Link
        href="/addProduct"
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700"
      >
        +
      </Link>
    </div>
  );
}
