"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ImagePickerModal from "@/app/_components/ImagePickerModal";
import toast, { Toaster } from "react-hot-toast";

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

interface SaleProduct {
  _id: string;
  productName: string;
  varients: Variety[];
}

const calculateDiscount = (mrp: number, sellingPrice: number) =>
  mrp > 0 ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;

export default function EditSaleVarientPage() {
  const { id } = useParams();
  const router = useRouter();
  const productId = id as string;

  const [product, setProduct] = useState<SaleProduct | null>(null);
  const [varients, setVarients] = useState<Variety[]>([]);
  const [loading, setLoading] = useState(true);

  const [lockPrice, setLockPrice] = useState(false);
  const [fixedPrice, setFixedPrice] = useState({
    mrp: 0,
    sellingPrice: 0,
  });
  const [fixedPriceInitialized, setFixedPriceInitialized] = useState(false);

  const [showImagePicker, setShowImagePicker] = useState(false);
  const [editingImage, setEditingImage] = useState<{
    vIdx: number;
    iIdx: number;
  } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/sale-products?id=${productId}`);
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

  const addVarient = () => {
    setVarients((v) => [
      ...v,
      {
        sku: "",
        colorName: "",
        colorCode: "#000000",
        sizeName: "",
        mrp: lockPrice ? fixedPrice.mrp : 0,
        sellingPrice: lockPrice ? fixedPrice.sellingPrice : 0,
        discountPercent: calculateDiscount(
          lockPrice ? fixedPrice.mrp : 0,
          lockPrice ? fixedPrice.sellingPrice : 0,
        ),
        imgLinks: [""],
        stock: 0,
      },
    ]);
  };

  const updateVarient = (idx: number, changes: Partial<Variety>) => {
    setVarients((current) => {
      const copy = [...current];
      const updated = { ...copy[idx], ...changes };
      updated.discountPercent = calculateDiscount(
        updated.mrp,
        updated.sellingPrice,
      );
      copy[idx] = updated;
      return copy;
    });
  };

  const applyFixedPriceToVariants = (price: {
    mrp: number;
    sellingPrice: number;
  }) => {
    setVarients((current) =>
      current.map((variant) => ({
        ...variant,
        mrp: price.mrp,
        sellingPrice: price.sellingPrice,
        discountPercent: calculateDiscount(price.mrp, price.sellingPrice),
      })),
    );
  };

  const handleLockPriceToggle = () => {
    if (!lockPrice) {
      const nextFixedPrice =
        !fixedPriceInitialized && varients.length > 0
          ? {
              mrp: varients[0].mrp,
              sellingPrice: varients[0].sellingPrice,
            }
          : fixedPrice;

      if (!fixedPriceInitialized && varients.length > 0) {
        setFixedPrice(nextFixedPrice);
        setFixedPriceInitialized(true);
      }

      applyFixedPriceToVariants(nextFixedPrice);
      setFixedPrice(nextFixedPrice);
      setLockPrice(true);
      return;
    }

    setLockPrice(false);
  };

  const handleFixedPriceChange = (
    field: "mrp" | "sellingPrice",
    value: number,
  ) => {
    const nextFixedPrice = { ...fixedPrice, [field]: value };
    setFixedPrice(nextFixedPrice);

    if (lockPrice) {
      applyFixedPriceToVariants(nextFixedPrice);
    }
  };

  const removeVarient = (idx: number) => {
    setVarients((v) => v.filter((_, i) => i !== idx));
  };

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

  const removeImage = (vIdx: number, iIdx: number) => {
    const newVarient = [...varients];
    newVarient[vIdx].imgLinks = varients[vIdx].imgLinks.filter(
      (_, key) => key !== iIdx,
    );
    setVarients(newVarient);
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

  const handleSave = async () => {
    try {
      const res = await fetch("/api/sale-products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: productId,
          varients,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.msg || "Failed to save");
        return;
      }

      toast.success("Saved!");
      router.push("/sale-products");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!product) return <p className="p-6">Sale product not found</p>;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <Toaster />
      <div className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
        <div className="border-b border-slate-200 px-6 py-8">
          <h1 className="text-3xl font-semibold text-slate-900">
            Edit Variants — {product.productName}
          </h1>
        </div>

        <div className="space-y-6 px-6 py-8">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Fixed Price
            </h3>
          </div>

          <div className="grid gap-4 md:grid-cols-[auto_1fr_1fr] items-end">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={lockPrice}
                onChange={handleLockPriceToggle}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-semibold text-slate-700">
                Lock Price
              </span>
            </label>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">
                Fixed MRP
              </label>
              <input
                type="number"
                value={fixedPrice.mrp}
                onChange={(e) => handleFixedPriceChange("mrp", Number(e.target.value))}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">
                Fixed Selling Price
              </label>
              <input
                type="number"
                value={fixedPrice.sellingPrice}
                onChange={(e) => handleFixedPriceChange("sellingPrice", Number(e.target.value))}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {varients.map((variant, vIdx) => (
              <div key={vIdx} className="rounded-3xl border border-slate-200 p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h4 className="text-lg font-semibold text-slate-900">
                    Variant {vIdx + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeVarient(vIdx)}
                    className="rounded-full border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 mt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">SKU</label>
                    <input
                      type="text"
                      value={variant.sku}
                      onChange={(e) => updateVarient(vIdx, { sku: e.target.value })}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Color Name</label>
                    <input
                      type="text"
                      value={variant.colorName}
                      onChange={(e) => updateVarient(vIdx, { colorName: e.target.value })}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Color Code</label>
                    <input
                      type="color"
                      value={variant.colorCode}
                      onChange={(e) => updateVarient(vIdx, { colorCode: e.target.value })}
                      className="h-11 w-full rounded-2xl border border-slate-300 px-3 py-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Size</label>
                    <input
                      type="text"
                      value={variant.sizeName}
                      onChange={(e) => updateVarient(vIdx, { sizeName: e.target.value })}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">MRP</label>
                    <input
                      type="number"
                      value={variant.mrp}
                      onChange={(e) => updateVarient(vIdx, { mrp: Number(e.target.value) })}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Selling Price</label>
                    <input
                      type="number"
                      value={variant.sellingPrice}
                      onChange={(e) => updateVarient(vIdx, { sellingPrice: Number(e.target.value) })}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Stock</label>
                    <input
                      type="number"
                      value={variant.stock}
                      onChange={(e) => updateVarient(vIdx, { stock: Number(e.target.value) })}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Discount %</label>
                    <input
                      type="number"
                      value={variant.discountPercent}
                      readOnly
                      className="w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3"
                    />
                  </div>
                </div>

                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {variant.imgLinks.map((image, iIdx) => (
                      <div key={iIdx} className="space-y-2">
                        {image ? (
                          <div className="w-full rounded-2xl border border-slate-200 overflow-hidden bg-slate-50">
                            <img
                              src={image}
                              className="w-full object-cover"
                              alt={`Variant ${vIdx + 1} Image ${iIdx + 1}`}
                            />
                          </div>
                        ) : (
                          <div className="w-full h-32 rounded-2xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center">
                            <span className="text-xs text-slate-500">No image</span>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => openPicker(vIdx, iIdx)}
                          className="w-full inline-flex items-center justify-center rounded-2xl border border-blue-300 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                        >
                          {image ? "Change" : "Select"} Image
                        </button>

                        <button
                          type="button"
                          onClick={() => removeImage(vIdx, iIdx)}
                          className="w-full inline-flex items-center justify-center rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-100"
                        >
                          Remove Image
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => addImage(vIdx)}
                    className="rounded-full border border-green-300 bg-green-50 px-6 py-3 text-sm font-semibold text-green-700 hover:bg-green-100"
                  >
                    + Add Image
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.push("/sale-products")}
              className="rounded-full border border-slate-300 px-6 py-3 text-slate-700 hover:bg-slate-100"
            >
              ← Back to Sale Products
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={addVarient}
                className="rounded-full border border-blue-300 bg-blue-50 px-6 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-100"
              >
                + Add Variant
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="rounded-full bg-emerald-600 px-7 py-3 text-white hover:bg-emerald-700 shadow-lg"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      <ImagePickerModal
        isOpen={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onSelect={handleImageSelect}
        selectedImageUrl={
          editingImage ? varients[editingImage.vIdx]?.imgLinks[editingImage.iIdx] : ""
        }
      />
    </div>
  );
}
