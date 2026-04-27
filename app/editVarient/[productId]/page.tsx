"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ImagePickerModal from "@/app/_components/ImagePickerModal";

interface Variety {
  sku: string;
  colorName: string;
  colorCode: string;
  sizeName: string;
  mrp: number;
  sellingPrice: number;
  discountPercent: number;
  imgLinks: string[];
  stock: number;
}

interface Product {
  _id: string;
  productName: string;
  varients: Variety[];
}

export default function EditVarientPage() {
  const { productId } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [varients, setVarients] = useState<Variety[]>([]);
  const [loading, setLoading] = useState(true);

  const [showImagePicker, setShowImagePicker] = useState(false);
  const [editingImage, setEditingImage] = useState<{
    vIdx: number;
    iIdx: number;
  } | null>(null);

  // 🔥 Fetch product
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/product?id=${productId}`);
        const data = await res.json();

        setProduct(data);
        setVarients(data.varients || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (productId) load();
  }, [productId]);

  // 🔥 Add SKU
  const addVarient = () => {
    setVarients((v) => [
      ...v,
      {
        sku: "",
        colorName: "",
        colorCode: "#000000",
        sizeName: "",
        mrp: 0,
        sellingPrice: 0,
        discountPercent: 0,
        imgLinks: [""],
        stock: 0,
      },
    ]);
  };

  const updateVarient = (idx: number, changes: Partial<Variety>) => {
    setVarients((v) => {
      const copy = [...v];
      const updated = { ...copy[idx], ...changes };

      // 🔥 Auto discount
      if (updated.mrp > 0 && updated.sellingPrice > 0) {
        updated.discountPercent = Math.round(
          ((updated.mrp - updated.sellingPrice) / updated.mrp) * 100,
        );
      }

      copy[idx] = updated;
      return copy;
    });
  };

  const removeVarient = (idx: number) => {
    setVarients((v) => v.filter((_, i) => i !== idx));
  };

  // 🔥 Images
  const addImage = (vIdx: number) => {
    updateVarient(vIdx, {
      imgLinks: [...varients[vIdx].imgLinks, ""],
    });
  };

  const updateImage = (vIdx: number, iIdx: number, url: string) => {
    setVarients((v) => {
      const copy = [...v];
      const imgs = [...copy[vIdx].imgLinks];
      imgs[iIdx] = url;
      copy[vIdx].imgLinks = imgs;
      return copy;
    });
  };

  const openPicker = (vIdx: number, iIdx: number) => {
    setEditingImage({ vIdx, iIdx });
    setShowImagePicker(true);
  };

  const handleImageSelect = (url: string) => {
    if (editingImage) {
      updateImage(editingImage.vIdx, editingImage.iIdx, url);
    }
    setShowImagePicker(false);
    setEditingImage(null);
  };

  // 🔥 Save
  const handleSave = async () => {
    try {
      const res = await fetch("/api/product", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: productId,
          varients,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.msg || "Failed to save");
        return;
      }

      alert("Saved!");
      router.push("/product");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!product) return <p className="p-6">Product not found</p>;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
        {/* Header */}
        <div className="border-b border-slate-200 px-6 py-8">
          <h1 className="text-3xl font-semibold text-slate-900">
            Edit Variants — {product.productName}
          </h1>
        </div>

        {/* Form Content */}
        <div className="space-y-6 px-6 py-8">
          <button
            onClick={addVarient}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg active:scale-95"
          >
            + Add SKU
          </button>

          <div className="space-y-4">
            {varients.map((v, i) => (
              <div
                key={i}
                className="border border-slate-200 rounded-lg p-6 space-y-4 bg-slate-50 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Variant Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Variant {i + 1}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-700">
                        SKU
                      </label>
                      <input
                        placeholder="Enter SKU"
                        value={v.sku}
                        onChange={(e) =>
                          updateVarient(i, { sku: e.target.value })
                        }
                        className="input"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Color Name
                      </label>
                      <input
                        placeholder="Enter color name"
                        value={v.colorName}
                        onChange={(e) =>
                          updateVarient(i, { colorName: e.target.value })
                        }
                        className="input"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Color Code
                      </label>
                      <input
                        type="color"
                        value={v.colorCode}
                        onChange={(e) =>
                          updateVarient(i, { colorCode: e.target.value })
                        }
                        className="input h-10"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Size
                      </label>
                      <input
                        placeholder="Enter size"
                        value={v.sizeName}
                        onChange={(e) =>
                          updateVarient(i, { sizeName: e.target.value })
                        }
                        className="input"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-700">
                        MRP
                      </label>
                      <input
                        type="number"
                        placeholder="Enter MRP"
                        value={v.mrp}
                        onChange={(e) =>
                          updateVarient(i, { mrp: Number(e.target.value) })
                        }
                        className="input"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Selling Price
                      </label>
                      <input
                        type="number"
                        placeholder="Enter selling price"
                        value={v.sellingPrice}
                        onChange={(e) =>
                          updateVarient(i, {
                            sellingPrice: Number(e.target.value),
                          })
                        }
                        className="input"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Discount %
                      </label>
                      <input
                        value={v.discountPercent}
                        readOnly
                        className="input bg-slate-100 text-slate-600 cursor-not-allowed"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Stock
                      </label>
                      <input
                        type="number"
                        placeholder="Enter stock"
                        value={v.stock}
                        onChange={(e) =>
                          updateVarient(i, { stock: Number(e.target.value) })
                        }
                        className="input"
                      />
                    </div>
                  </div>
                </div>

                {/* Product Images */}
                <div className="space-y-3 border-t border-slate-200 pt-4">
                  <label className="text-sm font-semibold text-slate-700">
                    Product Images
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {v.imgLinks.map((img, ii) => (
                      <div key={ii} className="space-y-2">
                        {img && (
                          <div className="w-full rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
                            <img
                              src={img}
                              className="w-full h-full object-cover"
                              alt={`Variant ${i + 1} Image ${ii + 1}`}
                            />
                          </div>
                        )}
                        {!img && (
                          <div className="w-full h-32 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center">
                            <span className="text-xs text-slate-500">
                              No image
                            </span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => openPicker(i, ii)}
                          className="w-full inline-flex items-center justify-center rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 shadow-sm transition hover:bg-blue-100"
                        >
                          {img ? "Change" : "Select"} Image
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-4">
                  <button
                    type="button"
                    onClick={() => addImage(i)}
                    className="inline-flex items-center gap-1 rounded-lg border border-green-300 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 shadow-sm transition hover:bg-green-100"
                  >
                    + Add Image
                  </button>

                  <button
                    type="button"
                    onClick={() => removeVarient(i)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-100"
                  >
                    Remove SKU
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Save Button */}
          <div className="flex gap-3 border-t border-slate-200 pt-6">
            <button
              onClick={handleSave}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:from-green-700 hover:to-emerald-700 hover:shadow-lg active:scale-95"
            >
              Save Variants
              <span className="text-lg">✓</span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/product")}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <ImagePickerModal
        isOpen={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onSelect={handleImageSelect}
        selectedImageUrl=""
      />
    </div>
  );
}
