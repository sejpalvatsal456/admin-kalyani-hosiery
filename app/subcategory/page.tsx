"use client";

import React, { useState, useEffect } from "react";

type Subcategory = {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
};

type Category = { id: string; name: string };

export default function SubcategoryPage() {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [items, setItems] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !categoryId) return;
    if (editingId !== null) {
      const res = await fetch('/api/subcategory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, name: name.trim(), categoryId }),
      });
      const data = await res.json();
      if (res.ok) {
        setItems((prev) =>
          prev.map((it) =>
            it.id === editingId
              ? { ...it, name: name.trim(), categoryId, categoryName: data.subcategory.categoryId.name }
              : it
          )
        );
      } else {
        alert('Failed to update subcategory');
        console.error(data.msg);
      }
      setEditingId(null);
    } else {
      const res = await fetch('/api/subcategory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), categoryId }),
      });
      const data = await res.json();
      if (res.ok) {
        setItems((prev) => [
          {
            id: data.subcategory._id,
            name: data.subcategory.name,
            categoryId,
            categoryName: data.subcategory.categoryId.name,
          },
          ...prev,
        ]);
      } else {
        alert('Failed to create subcategory');
        console.error(data.msg);
      }
    }
    setName("");
    setCategoryId(categories[0]?.id || "");
  }

  // load categories and subcategories
  useEffect(() => {
    async function load() {
      try {
        const [catRes, subRes] = await Promise.all([
          fetch('/api/category'),
          fetch('/api/subcategory'),
        ]);
        const catData = await catRes.json();
        if (catRes.ok) {
          const catsArray: any[] = Array.isArray(catData.categories)
            ? catData.categories.filter((c: any) => c != null)
            : [];
          setCategories(
            catsArray.map((c: any) => ({ id: c._id, name: c.name }))
          );
          setCategoryId(catsArray[0]?._id || "");
        }
        const subData = await subRes.json();
        if (subRes.ok) {
          setItems(
            subData.subcategories.map((s: any) => ({
              id: s._id,
              name: s.name,
              categoryId: s.categoryId._id,
              categoryName: s.categoryId.name,
            }))
          );
        }
      } catch (err) {
        console.error('Error loading data', err);
      }
    }
    load();
  }, []);

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
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded p-2"
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
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
                        {it.categoryName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <button
                          onClick={() => {
                            setEditingId(it.id);
                            setName(it.name);
                            setCategoryId(it.categoryId);
                          }}
                          className="text-blue-600 hover:underline mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={async () => {
                            const res = await fetch('/api/subcategory', {
                              method: 'DELETE',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id: it.id }),
                            });
                            if (res.ok) {
                              setItems((prev) => prev.filter((x) => x.id !== it.id));
                              if (editingId === it.id) {
                                setEditingId(null);
                                setName("");
                                setCategoryId(categories[0]?.id || "");
                              }
                            } else {
                              const d = await res.json();
                              alert('Failed to delete subcategory');
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
