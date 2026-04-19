"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// types matching schema
interface Size {
  sizeID: string;
  sku: string;
  sizeName: string;
  mrp: number;
  sellingPrice: number;
  discountPercent: number;
  stock: number;
}

interface Variety {
  colorID: string;
  colorName: string;
  colorCode: string; // Starts with #, max 7 chars
  imgLinks: string[];
  sizes: Size[]; // Minimum 1 element
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
  varients: Variety[];
  desc: Desc[];
  tags: string[];
  loc: string;
}

// dynamic options
// will be fetched from APIs

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export default function AddProductPage() {
  const router = useRouter();
  const [form, setForm] = useState<ProductInput>({
    brandId: "",
    productName: "",
    categoryId: "",
    subcategoryId: "",
    thumbnail: "",
    varients: [],
    desc: [],
    tags: [],
    loc: "",
  });

  const [brandsList, setBrandsList] = useState<{ id: string; name: string }[]>([]);
  const [categoriesList, setCategoriesList] = useState<{ id: string; name: string }[]>([]);
  const [subcategoriesList, setSubcategoriesList] = useState<{ id: string; name: string }[]>([]);

  const handleChange = (field: keyof ProductInput, value: any) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const addVariety = () => {
    setForm((f) => ({
      ...f,
      varients: [
        ...f.varients,
        { colorID: generateId(), colorName: "", colorCode: "", imgLinks: [""], sizes: [] },
      ],
    }));
  };

  const updateVariety = (idx: number, changes: Partial<Variety>) => {
    setForm((f) => {
      const v = [...f.varients];
      v[idx] = { ...v[idx], ...changes };
      return { ...f, varients: v };
    });
  };

  const addVarietyImage = (vIdx: number) => {
    updateVariety(vIdx, {
      imgLinks: [...form.varients[vIdx].imgLinks, ""],
    });
  };

  const updateVarietyImage = (vIdx: number, iIdx: number, url: string) => {
    setForm((f) => {
      const v = [...f.varients];
      const imgs = [...v[vIdx].imgLinks];
      imgs[iIdx] = url;
      v[vIdx].imgLinks = imgs;
      return { ...f, varients: v };
    });
  };

  const addSize = (vIdx: number) => {
    const newSize: Size = {
      sizeID: generateId(),
      sizeName: "",
      mrp: 0,
      sellingPrice: 0,
      discountPercent: 0,
      sku: '',
      stock: 0,
    };
    setForm((prevForm) => {
      const newVariety = [...prevForm.varients];
      newVariety[vIdx] = {
        ...newVariety[vIdx],
        sizes: [...newVariety[vIdx].sizes, newSize],
      };
      return { ...prevForm, varients: newVariety };
    });
  };

  const updateSize = (
    vIdx: number,
    sIdx: number,
    changes: Partial<Size>
  ) => {
    setForm((f) => {
      const v = [...f.varients];
      const s = [...v[vIdx].sizes];
      s[sIdx] = { ...s[sIdx], ...changes };
      // Calculate discountPercent if mrp and sellingPrice are updated and non-zero
      const updatedSize = s[sIdx];
      if (updatedSize.mrp > 0 && updatedSize.sellingPrice > 0) {
        updatedSize.discountPercent = ((updatedSize.mrp - updatedSize.sellingPrice) * 100) / updatedSize.mrp;
      } else {
        updatedSize.discountPercent = 0;
      }
      v[vIdx].sizes = s;
      return { ...f, varients: v };
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

  const addTag = () => {
    setForm((f) => ({
      ...f,
      tags: [...f.tags, ""],
    }));
  };

  const updateTag = (idx: number, value: string) => {
    setForm((f) => {
      const t = [...f.tags];
      t[idx] = value;
      return { ...f, tags: t };
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

  useEffect(() => {
    async function loadOptions() {
      try {
        const [bRes, cRes] = await Promise.all([fetch("/api/brand"), fetch("/api/category")]);
        const bData = await bRes.json();
        console.log("Brand data from API: ");
        console.log(bData);
        if (bRes.ok) setBrandsList(bData.brands.map((b: any) => ({ id: b._id, name: b.brandName })));
        const cData = await cRes.json();
        if (cRes.ok) {
          setCategoriesList(cData.categories.map((c: any) => ({ id: c._id, name: c.name })));
          setForm((f) => ({ ...f, categoryId: cData.categories[0]?._id || "" }));
        }
      } catch (err) {
        console.error('Failed to load options', err);
      }
    }
    loadOptions();
  }, []);

  // refetch subcategories when category changes
  useEffect(() => {
    console.log(form.categoryId);
    async function loadSubs() {
      if (!form.categoryId) return setSubcategoriesList([]);
      try {
        const res = await fetch(`/api/subcategory?categoryId=${form.categoryId}`);
        const data = await res.json();
        console.log(data);
        if (res.ok) setSubcategoriesList(data.subcategories.map((s: any) => ({ id: s._id, name: s.name })));
      } catch (err) {
        console.error('Failed to load subcategories', err);
      }
    }
    loadSubs();
  }, [form.categoryId]);

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
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              value={form.categoryId}
              onChange={(e) => handleChange("categoryId", e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded p-2"
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
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subcategory
            </label>
            <select
              value={form.subcategoryId}
              onChange={(e) => handleChange("subcategoryId", e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded p-2"
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
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              value={form.loc}
              onChange={(e) => handleChange("loc", e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded p-2"
              placeholder="Enter location"
            />
          </div>
        </div>

        {/* varieties */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Varieties</h2>
          {form.varients.map((v, vi) => (
            <div key={v.colorID} className="border p-4 rounded mb-4">
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
                    value={v.colorCode}
                    onChange={(e) => updateVariety(vi, { colorCode: e.target.value })}
                    className="mt-1 block w-full h-10 border-gray-300 rounded p-2"
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
                    key={s.sizeID}
                    className="grid grid-cols-1 md:grid-cols-6 gap-2 mt-2"
                  >
                    <div>
                      <label className="text-xs font-medium text-gray-700">Size</label>
                      <input
                        placeholder="e.g. L"
                        value={s.sizeName}
                        onChange={(e) =>
                          updateSize(vi, si, { sizeName: e.target.value })
                        }
                        className="border border-gray-300 rounded p-1 w-full"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700">SKU</label>
                      <input
                        placeholder="SKU"
                        value={s.sku}
                        onChange={(e) =>
                          updateSize(vi, si, { sku: e.target.value })
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

        {/* tags */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Tags</h2>
          {form.tags.map((tag, ti) => (
            <div key={ti} className="mb-2">
              <input
                placeholder="Tag"
                value={tag}
                onChange={(e) => updateTag(ti, e.target.value)}
                className="border-gray-300 rounded p-1 w-full"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addTag}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add Tag
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
