"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

// types matching schema
interface Size {
  id: string;
  size: string;
  mrp: number;
  sellingPrice: number;
  stock: number;
}

interface Variety {
  id: string;
  colorName: string;
  color: string;
  imgLinks: string[];
  sizes: Size[];
}

interface Desc {
  key: string;
  value: string;
}

interface ProductInput {
  brandId: string;
  productName: string;
  categoryId: string;
  subcategoryId: string;
  thumbnail: string;
  variety: Variety[];
  desc: Desc[];
}

// static options for now
const brands = ["BrandA", "BrandB", "BrandC"];
const categories = ["Cat1", "Cat2", "Cat3"];
const subcategories = ["Sub1", "Sub2", "Sub3"];

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export default function AddProductPage() {
  const router = useRouter();
  const [form, setForm] = useState<ProductInput>({
    brandId: brands[0],
    productName: "",
    categoryId: categories[0],
    subcategoryId: subcategories[0],
    thumbnail: "",
    variety: [],
    desc: [],
  });

  const handleChange = (field: keyof ProductInput, value: any) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const addVariety = () => {
    setForm((f) => ({
      ...f,
      variety: [
        ...f.variety,
        { id: generateId(), colorName: "", color: "", imgLinks: [""], sizes: [] },
      ],
    }));
  };

  const updateVariety = (idx: number, changes: Partial<Variety>) => {
    setForm((f) => {
      const v = [...f.variety];
      v[idx] = { ...v[idx], ...changes };
      return { ...f, variety: v };
    });
  };

  const addVarietyImage = (vIdx: number) => {
    updateVariety(vIdx, {
      imgLinks: [...form.variety[vIdx].imgLinks, ""],
    });
  };

  const updateVarietyImage = (vIdx: number, iIdx: number, url: string) => {
    setForm((f) => {
      const v = [...f.variety];
      const imgs = [...v[vIdx].imgLinks];
      imgs[iIdx] = url;
      v[vIdx].imgLinks = imgs;
      return { ...f, variety: v };
    });
  };

  const addSize = (vIdx: number) => {
    const newSize: Size = {
      id: generateId(),
      size: "",
      mrp: 0,
      sellingPrice: 0,
      stock: 0,
    };
    setForm((prevForm) => {
      const newVariety = [...prevForm.variety];
      newVariety[vIdx] = {
        ...newVariety[vIdx],
        sizes: [...newVariety[vIdx].sizes, newSize],
      };
      return { ...prevForm, variety: newVariety };
    });
  };

  const updateSize = (
    vIdx: number,
    sIdx: number,
    changes: Partial<Size>
  ) => {
    setForm((f) => {
      const v = [...f.variety];
      const s = [...v[vIdx].sizes];
      s[sIdx] = { ...s[sIdx], ...changes };
      v[vIdx].sizes = s;
      return { ...f, variety: v };
    });
  };

  const addDesc = () => {
    setForm((f) => ({
      ...f,
      desc: [...f.desc, { key: "", value: "" }],
    }));
  };

  const updateDesc = (
    idx: number,
    changes: Partial<Desc>
  ) => {
    setForm((f) => {
      const d = [...f.desc];
      d[idx] = { ...d[idx], ...changes };
      return { ...f, desc: d };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    router.push("/product");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-6">Add Product</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Product Name
            </label>
            <input
              value={form.productName}
              onChange={(e) => handleChange("productName", e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Brand</label>
            <select
              value={form.brandId}
              onChange={(e) => handleChange("brandId", e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded p-2"
            >
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              value={form.categoryId}
              onChange={(e) => handleChange("categoryId", e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded p-2"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subcategory
            </label>
            <select
              value={form.subcategoryId}
              onChange={(e) => handleChange("subcategoryId", e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded p-2"
            >
              {subcategories.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Thumbnail URL
            </label>
            <input
              value={form.thumbnail}
              onChange={(e) => handleChange("thumbnail", e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded p-2"
            />
          </div>
        </div>

        {/* varieties */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Varieties</h2>
          {form.variety.map((v, vi) => (
            <div key={v.id} className="border p-4 rounded mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Color Name
                  </label>
                  <input
                    value={v.colorName}
                    onChange={(e) =>
                      updateVariety(vi, { colorName: e.target.value })
                    }
                    className="mt-1 block w-full border-gray-300 rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Color
                  </label>
                  <input
                    value={v.color}
                    onChange={(e) => updateVariety(vi, { color: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded p-2"
                    type="color"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => addVarietyImage(vi)}
                    className="mt-6 bg-gray-200 px-2 py-1 rounded"
                  >
                    + image
                  </button>
                </div>
              </div>
              {/* img links */}
              {v.imgLinks.map((img, ii) => (
                <div key={ii} className="mt-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Image URL {ii + 1}
                  </label>
                  <input
                    value={img}
                    onChange={(e) =>
                      updateVarietyImage(vi, ii, e.target.value)
                    }
                    className="mt-1 block w-full border-gray-300 rounded p-2"
                  />
                </div>
              ))}

              {/* sizes */}
              <div className="mt-4">
                <h3 className="font-medium">Sizes</h3>
                {v.sizes.map((s, si) => (
                  <div
                    key={s.id}
                    className="grid grid-cols-1 md:grid-cols-5 gap-2 mt-2"
                  >
                    <div>
                      <label className="text-xs font-medium text-gray-700">Size</label>
                      <input
                        placeholder="e.g. L"
                        value={s.size}
                        onChange={(e) =>
                          updateSize(vi, si, { size: e.target.value })
                        }
                        className="border border-gray-300 rounded p-1 w-full"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700">MRP</label>
                      <input
                        placeholder="Max Retail"
                        type="number"
                        value={s.mrp}
                        onChange={(e) =>
                          updateSize(vi, si, { mrp: Number(e.target.value) })
                        }
                        className="border border-gray-300 rounded p-1 w-full"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700">Selling Price</label>
                      <input
                        placeholder="Sale Price"
                        type="number"
                        value={s.sellingPrice}
                        onChange={(e) =>
                          updateSize(vi, si, { sellingPrice: Number(e.target.value) })
                        }
                        className="border border-gray-300 rounded p-1 w-full"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700">Stock</label>
                      <input
                        placeholder="Quantity"
                        type="number"
                        value={s.stock}
                        onChange={(e) =>
                          updateSize(vi, si, { stock: Number(e.target.value) })
                        }
                        className="border border-gray-300 rounded p-1 w-full"
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addSize(vi)}
                  className="mt-2 bg-gray-200 px-2 py-1 rounded"
                >
                  + size
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addVariety}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add Variety
          </button>
        </div>

        {/* description */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Description</h2>
          {form.desc.map((d, di) => (
            <div key={di} className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
              <input
                placeholder="Key"
                value={d.key}
                onChange={(e) => updateDesc(di, { key: e.target.value })}
                className="border-gray-300 rounded p-1"
              />
              <input
                placeholder="Value"
                value={d.value}
                onChange={(e) => updateDesc(di, { value: e.target.value })}
                className="border-gray-300 rounded p-1"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addDesc}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add Description
          </button>
        </div>

        <div>
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
