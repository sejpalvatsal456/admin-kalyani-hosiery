"use client";

import React, { useState, useEffect } from "react";

type Category = {
  id: string;
  name: string;
  order: number;
};

export default function CategoryPage() {
  const [name, setName] = useState("");
  const [order, setOrder] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !order.trim()) return;
    if (editingId !== null) {
      // send patch request
      const res = await fetch('/api/category', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, name: name.trim(), order: parseInt(order) }),
      });
      const data = await res.json();
      if (res.ok) {
        setCategories((prev) =>
          prev.map((c) => (c.id === editingId ? { ...c, name: name.trim(), order: parseInt(order) } : c)).sort((a, b) => a.order - b.order)
        );
      } else {
        alert('Failed to update category');
        console.error(data.msg);
      }
      setEditingId(null);
    } else {
      const res = await fetch('/api/category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), order: parseInt(order) }),
      });
      const data = await res.json();
      if (res.ok) {
        setCategories((prev) =>
          [
            { id: data.category._id, name: data.category.name, order: data.category.order },
            ...prev,
          ].sort((a, b) => a.order - b.order)
        );
      } else {
        alert('Failed to create category');
        console.error(data.msg);
      }
    }
    setName("");
    setOrder("");
  }

  // load categories from backend
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/category');
        const data = await res.json();
        if (res.ok) {
          setCategories(
            data.categories.map((c: any) => ({ id: c._id, name: c.name, order: c.order }))
          );
        } else {
          console.error('Failed to fetch categories', data.msg);
        }
      } catch (err) {
        console.error('Error fetching categories', err);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-6">Category Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="bg-white p-6 rounded shadow md:col-span-1">
          <h2 className="text-lg font-semibold mb-4">Add Category</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded p-2"
                placeholder="Category name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Order</label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded p-2"
                placeholder="Display order (e.g., 1, 2, 3)"
                required
                min="1"
              />
            </div>
            <div className="pt-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                {editingId !== null ? 'Update Category' : 'Add Category'}
              </button>
            </div>
          </form>
        </section>

        <section className="md:col-span-2">
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Existing Categories</h2>
            {categories.length === 0 ? (
              <p className="text-gray-500">No categories added yet.</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Order
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
                  {categories.map((c) => (
                    <tr key={c.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {c.order}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {c.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <button
                          onClick={() => {
                            setEditingId(c.id);
                            setName(c.name);
                            setOrder(c.order.toString());
                          }}
                          className="text-blue-600 hover:underline mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm(`Delete category "${c.name}"? This will also remove its subcategories and products.`)) return;
                            // send delete
                            const res = await fetch('/api/category', {
                              method: 'DELETE',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id: c.id }),
                            });
                            if (res.ok) {
                              setCategories((prev) => prev.filter((x) => x.id !== c.id));
                              if (editingId === c.id) {
                                setEditingId(null);
                                setName("");
                                setOrder("");
                              }
                            } else {
                              const d = await res.json();
                              alert('Failed to delete category');
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
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
