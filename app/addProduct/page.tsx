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

  const handleChange = (field: keyof ProductInput, value: any) => {
    setForm((f) => ({ ...f, [field]: value }));
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
      <div className="mx-auto overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
        <div className="border-b border-slate-200 px-6 py-8">
          <h1 className="text-3xl font-semibold text-slate-900">Add Product</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-8">
          {/* 🔹 Basic Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <input
              placeholder="Product Name"
              value={form.productName}
              onChange={(e) => handleChange("productName", e.target.value)}
              className="input"
              required
            />

            <select
              value={form.brandId}
              onChange={(e) => handleChange("brandId", e.target.value)}
              className="input"
              required
            >
              <option value="">Select Brand</option>
              {brandsList.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            <select
              value={form.categoryId}
              onChange={(e) => handleChange("categoryId", e.target.value)}
              className="input"
              required
            >
              <option value="">Select Category</option>
              {categoriesList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={form.subcategoryId}
              onChange={(e) => handleChange("subcategoryId", e.target.value)}
              className="input"
              required
            >
              <option value="">Select Subcategory</option>
              {subcategoriesList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* 🔥 Thumbnail */}
            <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Thumbnail</label>
                
                <div className="flex gap-4 items-center md:items-start flex-col md:flex-row">
                  {/* Thumbnail Preview */}
                  {form.thumbnail && (
                    <div className="w-40 overflow-hidden rounded-2xl border border-slate-300 bg-white flex-shrink-0">
                      <img
                        src={form.thumbnail}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col mt-5 gap-2">
                    <button
                      type="button"
                      onClick={() => setShowImagePickerModal(true)}
                      className="w-40 inline-flex items-center justify-center rounded-2xl border border-blue-300 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-100"
                    >
                      {form.thumbnail ? "Change Image" : "Select Image"}
                    </button>
                    {form.thumbnail && (
                      <button
                        type="button"
                        onClick={() => handleChange("thumbnail", "")}
                        className="w-40 inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            {/* <div className="md:col-span-2">
              <label className="text-sm font-medium">Thumbnail</label>

              {form.thumbnail && (
                <img src={form.thumbnail} className="w-40 mt-2 rounded" />
              )}

              <button
                type="button"
                onClick={() => setShowImagePickerModal(true)}
                className="btn ml-6 mt-2"
              >
                {form.thumbnail ? "Change" : "Select"} Image
              </button>
            </div> */}

            {/* 🔥 Location */}
            <input
              placeholder="Location"
              value={form.loc}
              onChange={(e) => handleChange("loc", e.target.value)}
              className="input md:col-span-2"
            />
          </div>

          {/* 🔥 Submit */}
          <div className="flex">
            <button
              type="submit"
              className="w-full items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg active:scale-95"
            >
              Create & Add Variants
              <span className="text-lg">→</span>
            </button>
          </div>
        </form>
      </div>

      {/* 🔥 Image Picker */}
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
