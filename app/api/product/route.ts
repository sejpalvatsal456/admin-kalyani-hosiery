import { connectDB } from "@/lib/connectDB";
import { Product } from "@/lib/models";
import { NextRequest, NextResponse } from "next/server";

// GET: list or single product (populated)
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
      .populate("brandId", "name")
      .populate("categoryId", "name")
      .populate("subcategoryId", "name");
    return NextResponse.json(prods, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ msg: "Internal Server Error", error }, { status: 500 });
  }
};

// POST: create product
export const POST = async (req: NextRequest) => {
  try {
    await connectDB();
    const data = await req.json();
    // basic validation
    const { productName, brandId, categoryId, subcategoryId } = data;
    if (!productName || !brandId || !categoryId || !subcategoryId) {
      return NextResponse.json({ msg: "Missing required fields" }, { status: 400 });
    }

    const created = await Product.create(data);
    return NextResponse.json(created, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ msg: "Internal Server Error", error }, { status: 500 });
  }
};

// PATCH: update product
export const PATCH = async (req: NextRequest) => {
  try {
    await connectDB();
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ msg: "id is required" }, { status: 400 });
    const prod = await Product.findById(id);
    if (!prod) return NextResponse.json({ msg: "Product not found" }, { status: 404 });
    Object.assign(prod, updates);
    await prod.save();
    return NextResponse.json(prod, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ msg: "Internal Server Error", error }, { status: 500 });
  }
};

// DELETE: remove product (accept id query or body)
export const DELETE = async (req: NextRequest) => {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");
    if (!id) {
      // try body
      const body = await req.json().catch(() => null);
      id = body?.id;
    }
    if (!id) return NextResponse.json({ msg: "id is required" }, { status: 400 });
    await Product.deleteOne({ _id: id });
    return NextResponse.json({ msg: "Deleted" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ msg: "Internal Server Error", error }, { status: 500 });
  }
};
