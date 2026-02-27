"use client";

import React, { useState } from "react";

type Brand = {
  name: string;
  logoUrl: string;
};

const placeholder = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect fill='%23e5e7eb' width='100%25' height='100%25'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%236b7280' font-size='20'>No Image</text></svg>";

export default function BrandPage() {
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [brands, setBrands] = useState<Brand[]>([]);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBrands((prev) => [{ name: name.trim(), logoUrl: logoUrl.trim() }, ...prev]);
    setName("");
    setLogoUrl("");
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-6">Brand Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form */}
        <section className="bg-white p-6 rounded shadow md:col-span-1">
          <h2 className="text-lg font-semibold mb-4">Add Brand</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded p-2"
                placeholder="Brand name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Logo URL</label>
              <input
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded p-2"
                placeholder="https://.../logo.png"
              />
            </div>

            <div className="pt-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Add Brand
              </button>
            </div>
          </form>
        </section>

        {/* List of brands */}
        <section className="md:col-span-2">
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Existing Brands</h2>

            {brands.length === 0 ? (
              <p className="text-gray-500">No brands added yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {brands.map((b, idx) => (
                  <div key={idx} className="flex items-center space-x-4 p-3 border rounded">
                    {b.logoUrl ? (
                      <img
                        src={b.logoUrl}
                        alt={b.name}
                        onError={(e) => {
                          const targ = e.currentTarget as HTMLImageElement;
                          targ.src = placeholder;
                        }}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-600">
                        {b.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div>
                      <div className="font-medium">{b.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
