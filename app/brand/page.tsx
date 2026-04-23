"use client";

import React, { useState, useEffect } from "react";

type Brand = {
  id: string;
  brandName: string;
  brandLogo: string;
};

const placeholder = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect fill='%23e5e7eb' width='100%25' height='100%25'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%236b7280' font-size='20'>No Image</text></svg>";

export default function BrandPage() {
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    if (editingId !== null) {
      // send update request
      const res = await fetch('/api/brand/', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, brandName: name.trim(), brandLogo: logoUrl.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setBrands((prev) =>
          prev.map((b) =>
            b.id === editingId ? { ...b, brandName: name.trim(), brandLogo: logoUrl.trim() } : b
          )
        );
      } else {
        alert('Failed to update brand');
        console.error(data.msg);
      }
      setEditingId(null);
    } else {
      const res = await fetch('/api/brand/', {
        method : "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandName: name, brandLogo: logoUrl })
      });
      const data = await res.json();
      if (!res.ok) {
        alert("Error in creating brand");
        console.log(data.msg);
        return;
      }
      setBrands((prev) => [
        { id: data.brand._id, brandName: data.brand.brandName.trim(), brandLogo: data.brand.brandLogo.trim() },
        ...prev,
      ]);
    }
    setName("");
    setLogoUrl("");
  }


  // fetch existing brands when component mounts
  useEffect(() => {
    async function fetchBrands() {
      try {
        const res = await fetch('/api/brand');
        const data = await res.json();
        console.log(data);
        if (res.ok) {
          setBrands(
            data.brands.map((b: any) => ({
              id: b._id,
              brandName: b.brandName,
              brandLogo: b.brandLogo,
            }))
          );
        } else {
          console.error('Failed to load brands', data.msg);
        }
      } catch (err) {
        console.error('Error fetching brands', err);
      }
    }
    fetchBrands();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-6">Brand Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Form */}
        <section className="bg-white p-4 sm:p-6 rounded shadow md:col-span-1">
          <h2 className="text-base sm:text-lg font-semibold mb-4">Add Brand</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
                placeholder="Brand name"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700">Logo URL</label>
              <input
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
                placeholder="https://.../logo.png"
              />
            </div>

            <div className="pt-2">
              <button className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium">
                {editingId !== null ? 'Update Brand' : 'Add Brand'}
              </button>
            </div>
          </form>
        </section>

        {/* List of brands */}
        <section className="md:col-span-2">
          <div className="bg-white p-4 sm:p-6 rounded shadow">
            <h2 className="text-base sm:text-lg font-semibold mb-4">Existing Brands</h2>

            {brands.length === 0 ? (
              <p className="text-gray-500 text-sm">No brands added yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Logo
                      </th>
                      <th
                        scope="col"
                        className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {brands.map((b) => (
                      <tr key={b.id}>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          {b.brandLogo ? (
                            <img
                              src={b.brandLogo}
                              alt={b.brandName}
                              onError={(e) => {
                                const targ = e.currentTarget as HTMLImageElement;
                                targ.src = placeholder;
                              }}
                              className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded flex items-center justify-center text-gray-600 text-xs sm:text-sm font-medium">
                              {b.brandName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 font-medium">
                          {b.brandName}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                          <button
                            onClick={() => {
                              setEditingId(b.id);
                              setName(b.brandName);
                              setLogoUrl(b.brandLogo);
                            }}
                            className="text-blue-600 hover:underline mr-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm(`Delete brand "${b.brandName}"? This will also remove all related products.`)) return;
                              const res = await fetch('/api/brand/', {
                                method: 'DELETE',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id: b.id }),
                              });
                              if (res.ok) {
                                setBrands((prev) => prev.filter((x) => x.id !== b.id));
                                if (editingId === b.id) {
                                  setEditingId(null);
                                  setName("");
                                  setLogoUrl("");
                                }
                              } else {
                                const d = await res.json();
                                alert('Failed to delete brand');
                                console.error(d.msg);
                              }
                            }}
                            className="text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
