"use client";

import React, { useState, useEffect } from "react";

type Brand = {
  id: string;
  name: string;
  logoUrl: string;
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
        body: JSON.stringify({ id: editingId, name: name.trim(), logo: logoUrl.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setBrands((prev) =>
          prev.map((b) =>
            b.id === editingId ? { ...b, name: name.trim(), logoUrl: logoUrl.trim() } : b
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
        body: JSON.stringify({ name: name, logo: logoUrl })
      });
      const data = await res.json();
      if (!res.ok) {
        alert("Error in creating brand");
        console.log(data.msg);
        return;
      }
      setBrands((prev) => [
        { id: data.brand._id, name: data.brand.name.trim(), logoUrl: data.brand.logo.trim() },
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
        if (res.ok) {
          setBrands(
            data.brands.map((b: any) => ({
              id: b._id,
              name: b.name,
              logoUrl: b.logo,
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
                {editingId !== null ? 'Update Brand' : 'Add Brand'}
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
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Logo
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {brands.map((b) => (
                    <tr key={b.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {b.logoUrl ? (
                          <img
                            src={b.logoUrl}
                            alt={b.name}
                            onError={(e) => {
                              const targ = e.currentTarget as HTMLImageElement;
                              targ.src = placeholder;
                            }}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-600">
                            {b.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {b.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <button
                          onClick={() => {
                            setEditingId(b.id);
                            setName(b.name);
                            setLogoUrl(b.logoUrl);
                          }}
                          className="text-blue-600 hover:underline mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setBrands((prev) => prev.filter((x) => x.id !== b.id));
                            if (editingId === b.id) {
                              setEditingId(null);
                              setName("");
                              setLogoUrl("");
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
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
