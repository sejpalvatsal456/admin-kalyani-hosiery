import { connectDB } from "@/lib/connectDB";
import { Product } from "@/lib/models";
import { NextRequest, NextResponse } from "next/server";

// 🔹 Generate slug
const getSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "_")
    .replace(/^-+|-+$/g, "");
};

// Validate flattened variants (SKU-level)
const validateVariants = (variants: any[]) => {
  if (!Array.isArray(variants)) return "Variants must be an array";

  const skuSet = new Set();

  for (const v of variants) {
    if (!v.sku) return "SKU is required";

    if (skuSet.has(v.sku)) {
      return `Duplicate SKU found: ${v.sku}`;
    }
    skuSet.add(v.sku);

    if (!v.colorName || !v.colorCode || !v.sizeName) {
      return `Missing color/size info for SKU: ${v.sku}`;
    }

    if (v.sellingPrice > v.mrp) {
      return `Selling price cannot exceed MRP for SKU: ${v.sku}`;
    }

    // Normalize discount automatically
    const expectedDiscount = Math.round(
      ((v.mrp - v.sellingPrice) / v.mrp) * 100
    );

    v.discountPercent = expectedDiscount;

    if (v.stock < 0) {
      return `Stock cannot be negative for SKU: ${v.sku}`;
    }
  }

  return null;
};

// GET: list or single product
export const GET = async (req: NextRequest) => {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const prod = await Product.findById(id)
        .populate("brandId")
        .populate("categoryId")
        .populate("subcategoryId");

      return NextResponse.json(prod, { status: 200 });
    }

    const prods = await Product.find({})
      .populate("brandId", "brandName")
      .populate("categoryId", "name")
      .populate("subcategoryId", "name");

    return NextResponse.json(prods, { status: 200 });

  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { msg: "Internal Server Error", error },
      { status: 500 }
    );
  }
};

// POST: create product
export const POST = async (req: NextRequest) => {
  try {
    await connectDB();
    const data = await req.json();

    const { productName, brandId, categoryId, subcategoryId, varients } = data;

    if (!productName || !brandId || !categoryId || !subcategoryId) {
      return NextResponse.json(
        { msg: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate variants
    if (varients?.length) {
      const error = validateVariants(varients);
      if (error) {
        return NextResponse.json({ msg: error }, { status: 400 });
      }
    }

    const created = await Product.create({
      ...data,
      slug: getSlug(productName),
    });

    return NextResponse.json(created, { status: 200 });

  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { msg: "Internal Server Error", error },
      { status: 500 }
    );
  }
};

// PATCH: update product
export const PATCH = async (req: NextRequest) => {
  try {
    await connectDB();
    const body = await req.json();

    const { _id, varients, ...rest } = body;

    if (!_id) {
      return NextResponse.json({ msg: "id is required" }, { status: 400 });
    }

    const prod = await Product.findById(_id);

    if (!prod) {
      return NextResponse.json(
        { msg: "Product not found" },
        { status: 404 }
      );
    }

    // Update normal fields
    Object.assign(prod, rest);

    // Handle variants separately
    if (varients) {
      const error = validateVariants(varients);
      if (error) {
        return NextResponse.json({ msg: error }, { status: 400 });
      }

      prod.varients = varients;
    }

    await prod.save();

    return NextResponse.json(prod, { status: 200 });

  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { msg: "Internal Server Error", error },
      { status: 500 }
    );
  }
};

// DELETE: remove product
export const DELETE = async (req: NextRequest) => {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      const body = await req.json().catch(() => null);
      id = body?.id;
    }

    if (!id) {
      return NextResponse.json({ msg: "id is required" }, { status: 400 });
    }

    await Product.deleteOne({ _id: id });

    return NextResponse.json({ msg: "Deleted" }, { status: 200 });

  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { msg: "Internal Server Error", error },
      { status: 500 }
    );
  }
};
