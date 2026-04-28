// FIXME: Add fields like desc, tags too

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ImagePickerModal from "../_components/ImagePickerModal";

interface ProductInput {
  brandId: string;
  productName: string;
  categoryId: string;
  subcategoryId: string;
  thumbnail: string;
  varients: any[]; // empty initially
  desc: any[];
  tags: string[];
  loc: string;
}

export default function AddProductPage() {
  const router = useRouter();

  const [form, setForm] = useState<ProductInput>({
    brandId: "",
    productName: "",
    categoryId: "",
    subcategoryId: "",
    thumbnail: "",
    varients: [], // 🔥 empty
    desc: [],
    tags: [],
    loc: "",
  });

  const [brandsList, setBrandsList] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [categoriesList, setCategoriesList] = useState<
    { id: string; name: string }[]
  >([]);
  const [subcategoriesList, setSubcategoriesList] = useState<
    { id: string; name: string }[]
  >([]);

  const [showImagePickerModal, setShowImagePickerModal] = useState(false);
  const [descriptionPairs, setDescriptionPairs] = useState<
    Array<{ key: string; value: string }>
  >([]);
  const [tagsList, setTagsList] = useState<string[]>([]);

  const handleChange = (field: keyof ProductInput, value: any) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleAddDescriptionPair = () => {
    const newPairs = [...descriptionPairs, { key: "", value: "" }];
    setDescriptionPairs(newPairs);
    handleChange("desc", newPairs);
  };

  const handleRemoveDescriptionPair = (index: number) => {
    const newPairs = descriptionPairs.filter((_, i) => i !== index);
    setDescriptionPairs(newPairs);
    handleChange("desc", newPairs);
  };

  const handleUpdateDescriptionPair = (
    index: number,
    field: "key" | "value",
    value: string,
  ) => {
    const newPairs = descriptionPairs.map((pair, i) =>
      i === index ? { ...pair, [field]: value } : pair,
    );
    setDescriptionPairs(newPairs);
    handleChange("desc", newPairs);
  };

  const handleAddTag = () => {
    const newTags = [...tagsList, ""];
    setTagsList(newTags);
    handleChange("tags", newTags);
  };

  const handleRemoveTag = (index: number) => {
    const newTags = tagsList.filter((_, i) => i !== index);
    setTagsList(newTags);
    handleChange("tags", newTags);
  };

  const handleUpdateTag = (index: number, value: string) => {
    const newTags = tagsList.map((tag, i) => (i === index ? value : tag));
    setTagsList(newTags);
    handleChange("tags", newTags);
  };

  // 🔥 Submit only base product
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.msg || "Failed to create product");
        return;
      }

      // 🔥 Redirect to variant editor
      router.push(`/editVarient/${data._id}`);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  // 🔹 Load brands & categories
  useEffect(() => {
    async function loadOptions() {
      try {
        const [bRes, cRes] = await Promise.all([
          fetch("/api/brand"),
          fetch("/api/category"),
        ]);

        const bData = await bRes.json();
        if (bRes.ok) {
          setBrandsList(
            bData.brands.map((b: any) => ({
              id: b._id,
              name: b.brandName,
            })),
          );
        }

        const cData = await cRes.json();
        if (cRes.ok) {
          setCategoriesList(
            cData.categories.map((c: any) => ({
              id: c._id,
              name: c.name,
            })),
          );

          setForm((f) => ({
            ...f,
            categoryId: cData.categories[0]?._id || "",
          }));
        }
      } catch (err) {
        console.error("Failed to load options", err);
      }
    }

    loadOptions();
  }, []);

  // 🔹 Load subcategories
  useEffect(() => {
    async function loadSubs() {
      if (!form.categoryId) {
        setSubcategoriesList([]);
        return;
      }

      try {
        const res = await fetch(
          `/api/subcategory?categoryId=${form.categoryId}`,
        );
        const data = await res.json();

        if (res.ok) {
          setSubcategoriesList(
            data.subcategories.map((s: any) => ({
              id: s._id,
              name: s.name,
            })),
          );
        }
      } catch (err) {
        console.error("Failed to load subcategories", err);
      }
    }

    loadSubs();
  }, [form.categoryId]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_35px_60px_-35px_rgba(15,23,42,0.35)]">

        {/* Header */}
        <div className="border-b border-slate-200 px-6 py-8 sm:px-10">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Add Product
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Create a new product with details and descriptions.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8 px-6 py-8 sm:px-10">
          {/* Core Fields */}
          <section className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Product Name</label>
              <input
                placeholder="Product Name"
                value={form.productName}
                onChange={(e) => handleChange("productName", e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Brand</label>
              <select
                value={form.brandId}
                onChange={(e) => handleChange("brandId", e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                required
              >
                <option value="">Select brand</option>
                {brandsList.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Category</label>
              <select
                value={form.categoryId}
                onChange={(e) => handleChange("categoryId", e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                required
              >
                <option value="">Select category</option>
                {categoriesList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Subcategory</label>
              <select
                value={form.subcategoryId}
                onChange={(e) => handleChange("subcategoryId", e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                required
              >
                <option value="">Select subcategory</option>
                {subcategoriesList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Thumbnail */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Thumbnail</label>
              <div className="flex gap-4 flex-col md:flex-row">
                {form.thumbnail && (
                  <div className="w-40 rounded-2xl border border-slate-300 overflow-hidden">
                    <img src={form.thumbnail} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setShowImagePickerModal(true)}
                    className="w-40 rounded-2xl border border-blue-300 bg-blue-50 px-4 py-3 text-blue-700 font-semibold text-sm transition hover:bg-blue-100"
                  >
                    {form.thumbnail ? "Change Image" : "Select Image"}
                  </button>
                  {form.thumbnail && (
                    <button
                      type="button"
                      onClick={() => handleChange("thumbnail", "")}
                      className="w-40 rounded-2xl border border-slate-300 px-4 py-3 font-semibold text-sm transition hover:bg-slate-100"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Location</label>
              <input
                placeholder="Location"
                value={form.loc}
                onChange={(e) => handleChange("loc", e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3"
              />
            </div>
            </div>
          </section>

          {/* Description Pairs Section */}
          <section className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Product Description</h2>
                <p className="mt-1 text-sm text-slate-500">Add key-value pairs to describe your product.</p>
              </div>

              {/* Description Pairs List */}
              <div className="space-y-3">
              {descriptionPairs.map((pair, index) => (
                <div
                  key={index}
                  className="flex gap-3 items-end"
                >
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      placeholder="Key (e.g., Size, Material)"
                      value={pair.key}
                      onChange={(e) =>
                        handleUpdateDescriptionPair(index, "key", e.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      placeholder="Value (e.g., L, Cotton)"
                      value={pair.value}
                      onChange={(e) =>
                        handleUpdateDescriptionPair(index, "value", e.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveDescriptionPair(index)}
                    className="rounded-full border border-red-300 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-100 flex-shrink-0"
                  >
                    Remove
                  </button>
                </div>
              ))}
              </div>

              {/* Add Description Button */}
              <button
                type="button"
                onClick={handleAddDescriptionPair}
                className="rounded-full border border-green-300 bg-green-50 px-6 py-3 text-sm font-semibold text-green-700 shadow-sm transition hover:bg-green-100"
              >
                + Add Description
              </button>
            </div>
          </section>

          {/* Tags Section */}
          <section className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Product Tags</h2>
                <p className="mt-1 text-sm text-slate-500">Add tags to categorize and identify your product.</p>
              </div>

              {/* Tags List */}
              <div className="space-y-3">
              {tagsList.map((tag, index) => (
                <div key={index} className="flex gap-3 items-end">
                  <input
                    type="text"
                    placeholder="e.g., premium, new-arrival"
                    value={tag}
                    onChange={(e) => handleUpdateTag(index, e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(index)}
                    className="rounded-full border border-red-300 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-100 flex-shrink-0"
                  >
                    Remove
                  </button>
                </div>
              ))}
              </div>

              {/* Add Tag Button */}
              <button
                type="button"
                onClick={handleAddTag}
                className="rounded-full border border-green-300 bg-green-50 px-6 py-3 text-sm font-semibold text-green-700 shadow-sm transition hover:bg-green-100"
              >
                + Add Tag
              </button>
            </div>
          </section>

          {/* Buttons */}
          <div className="flex flex-wrap justify-end gap-4">
            {/* Submit */}
            <button
              type="submit"
              className="rounded-full bg-emerald-600 px-7 py-3 text-white hover:bg-emerald-700 shadow-lg"
            >
              Create & Add Variants
            </button>
          </div>
        </form>
      </div>

      {/* Image Picker */}
      <ImagePickerModal
        isOpen={showImagePickerModal}
        onClose={() => setShowImagePickerModal(false)}
        onSelect={(url) => {
          handleChange("thumbnail", url);
          setShowImagePickerModal(false);
        }}
        selectedImageUrl={form.thumbnail}
      />
    </div>
  );
}

