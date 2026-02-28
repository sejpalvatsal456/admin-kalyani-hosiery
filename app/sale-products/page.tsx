"use client";

import React, { useState } from "react";

interface Sale {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
}

export default function SaleProductsPage() {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sales, setSales] = useState<Sale[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !startDate || !endDate) return;

    if (editingId !== null) {
      setSales((prev) =>
        prev.map((s) =>
          s.id === editingId
            ? { ...s, title: title.trim(), startDate, endDate }
            : s
        )
      );
      setEditingId(null);
    } else {
      setSales((prev) => [
        { id: prev.length ? prev[0].id + 1 : 1, title: title.trim(), startDate, endDate },
        ...prev,
      ]);
    }

    setTitle("");
    setStartDate("");
    setEndDate("");
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-6">Sales Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="bg-white p-6 rounded shadow md:col-span-1">
          <h2 className="text-lg font-semibold mb-4">
            {editingId !== null ? "Edit Sale" : "Add Sale"}
          </h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded p-2"
                placeholder="Sale title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded p-2"
                required
              />
            </div>
            <div className="pt-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                {editingId !== null ? "Update Sale" : "Add Sale"}
              </button>
            </div>
          </form>
        </section>

        <section className="md:col-span-2">
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Existing Sales</h2>
            {sales.length === 0 ? (
              <p className="text-gray-500">No sales added yet.</p>
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
                      Title
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Start Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      End Date
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
                  {sales.map((s) => (
                    <tr key={s.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {s.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {s.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {s.startDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {s.endDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <button
                          onClick={() => {
                            setEditingId(s.id);
                            setTitle(s.title);
                            setStartDate(s.startDate);
                            setEndDate(s.endDate);
                          }}
                          className="text-blue-600 hover:underline mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setSales((prev) => prev.filter((x) => x.id !== s.id));
                            if (editingId === s.id) {
                              setEditingId(null);
                              setTitle("");
                              setStartDate("");
                              setEndDate("");
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
