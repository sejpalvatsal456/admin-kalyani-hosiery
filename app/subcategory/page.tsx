"use client";

import React, { useState } from "react";

type Subcategory = {
  id: number;
  name: string;
  category: string;
};

const categories = ["Men", "Women", "Kids", "Sales"];

export default function SubcategoryPage() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [items, setItems] = useState<Subcategory[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    if (editingId !== null) {
      setItems((prev) =>
        prev.map((it) =>
          it.id === editingId ? { ...it, name: name.trim(), category } : it
        )
      );
      setEditingId(null);
    } else {
      setItems((prev) => [
        { id: prev.length ? prev[0].id + 1 : 1, name: name.trim(), category },
        ...prev,
      ]);
    }
    setName("");
    setCategory(categories[0]);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-6">Subcategory Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="bg-white p-6 rounded shadow md:col-span-1">
          <h2 className="text-lg font-semibold mb-4">Add Subcategory</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded p-2"
                placeholder="Subcategory name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded p-2"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="pt-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                {editingId !== null ? 'Update Subcategory' : 'Add Subcategory'}
              </button>
            </div>
          </form>
        </section>

        <section className="md:col-span-2">
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Existing Subcategories</h2>
            {items.length === 0 ? (
              <p className="text-gray-500">No subcategories added yet.</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      ID
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
                      Category
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
                  {items.map((it) => (
                    <tr key={it.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {it.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {it.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {it.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <button
                          onClick={() => {
                            setEditingId(it.id);
                            setName(it.name);
                            setCategory(it.category);
                          }}
                          className="text-blue-600 hover:underline mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setItems((prev) => prev.filter((x) => x.id !== it.id));
                            if (editingId === it.id) {
                              setEditingId(null);
                              setName("");
                              setCategory(categories[0]);
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
