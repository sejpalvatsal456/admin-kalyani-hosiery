"use client";

import React, { useState, useEffect } from "react";
import ImagePickerModal from "../_components/ImagePickerModal";



type Subcategory = {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  logoLink: string;
};

type Category = { id: string; name: string };

const placeholder = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect fill='%23e5e7eb' width='100%25' height='100%25'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%236b7280' font-size='20'>No Image</text></svg>";

/*

In the Subcategory page, there is a field of logo URL, there should be select image that shoulb have same mechanism as the thumbnail field in the addProduct page. It should bbe clear by defaullt,the select Image is clicke, it opens a modal that shows all the ploaded images on the aws s3 bugket /media folder. If any one of the is clicked it gets selected and then we should clicked on the select image button on the modal to finalise the selection and close the modal.  and save the distributive CDn link to logoURL firld of items, in both mode add and edit subcategory.

*/

export default function SubcategoryPage() {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [logoLink, setlogoLink] = useState<string>("");
  const [items, setItems] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);

  const getCategory = (subId: string, ) => {

    return categories.find((sub) => sub.id === subId);

  } 

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !categoryId || !logoLink) return;
    if (editingId !== null) {
      const res = await fetch('/api/subcategory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, name: name.trim(), categoryId, logoLink: logoLink }),
      });
      const data = await res.json();
      if (res.ok) {
        console.log("SUBcategory Update data from APi: ")
        console.log(data);
        setItems((prev) =>
          prev.map((it) =>
            it.id === editingId
              ? { ...it, name: name.trim(), categoryId, categoryName: getCategory(categoryId)?.name || "", logoLink: logoLink }
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
        body: JSON.stringify({ name: name.trim(), categoryId, logoLink }),
      });
      const data = await res.json();
      if (res.ok) {
        
        setItems((prev) => [
          {
            id: data.subcategory._id,
            name: data.subcategory.name,
            categoryId,
            categoryName: getCategory(categoryId)?.name || "",
            logoLink: data.subcategory.logoLink
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
    setlogoLink("");
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
          console.log("Subcategory From API: ");
          console.log(subData);
          setItems(
            subData.subcategories.map((s: any) => ({
              id: s._id,
              name: s.name,
              categoryId: s.categoryId._id,
              categoryName: s.categoryId.name,
              logoLink: s.logoLink
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
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-6">Subcategory Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <section className="bg-white p-4 sm:p-6 rounded shadow md:col-span-1">
          <h2 className="text-base sm:text-lg font-semibold mb-4">Add Subcategory</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
                placeholder="Subcategory name"
                required
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700">Logo URL</label>
              <div className="mt-1 flex flex-col justify-between gap-3">
                
                <div className="flex flex-col sm:items-center gap-3">
                  <input
                    type="hidden"
                    value={logoLink}
                    // onChange={(e) => setlogoLink(e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowImagePickerModal(true)}
                    className="w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
                  >
                    {logoLink ? "Change Image" : "Select Image"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setlogoLink("")}
                    className="w-full inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition"
                  >
                    Clear Image
                  </button>
                </div>

                {logoLink ? (
                  <div className="w-30 overflow-hidden self-center rounded-lg border border-gray-300 bg-white">
                    <img
                      src={logoLink}
                      alt="Selected logo"
                      className="h-full object-cover"
                      onError={(e) => {
                        const targ = e.currentTarget as HTMLImageElement;
                        targ.src = placeholder;
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-24 overflow-hidden rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center px-5 justify-center text-gray-500 text-xs">
                    No image selected
                  </div>
                )}
                
              </div>
            </div>
            <div className="pt-2 flex justify-center">
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium">
                {editingId !== null ? 'Update Subcategory' : 'Add Subcategory'}
              </button>
            </div>
          </form>
        </section>

        <section className="md:col-span-2">
          <div className="bg-white p-4 sm:p-6 rounded shadow">
            <h2 className="text-base sm:text-lg font-semibold mb-4">Existing Subcategories</h2>
            {items.length === 0 ? (
              <p className="text-gray-500 text-sm">No subcategories added yet.</p>
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
                        Category
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
                    {items.map((it) => (
                      <tr key={it.id}>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          {it.logoLink ? (
                            <img
                              src={it.logoLink}
                              alt={it.name}
                              onError={(e) => {
                                const targ = e.currentTarget as HTMLImageElement;
                                targ.src = placeholder;
                              }}
                              className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded flex items-center justify-center text-gray-600 text-xs sm:text-sm font-medium">
                              {it.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 font-medium">
                          {it.name}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                          {it.categoryName}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                          <button
                            onClick={() => {
                              setEditingId(it.id);
                              setName(it.name);
                              setCategoryId(it.categoryId);
                              setlogoLink(it.logoLink || "");
                            }}
                            className="text-blue-600 hover:underline mr-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm(`Delete subcategory "${it.name}"? This will also remove related products.`)) return;
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
                                  setlogoLink("");
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
              </div>
            )}
          </div>
        </section>
      </div>

      <ImagePickerModal
        isOpen={showImagePickerModal}
        onClose={() => setShowImagePickerModal(false)}
        onSelect={(url) => {
          setlogoLink(url);
          setShowImagePickerModal(false);
        }}
        selectedImageUrl={logoLink}
      />
    </div>
  );
}
