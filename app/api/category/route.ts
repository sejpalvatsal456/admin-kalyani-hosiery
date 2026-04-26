import { connectDB } from "@/lib/connectDB";
import { Category, Subcategory, Product } from "@/lib/models";
import { NextRequest, NextResponse } from "next/server";

// fetch all categories
export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    const cats = await Category.find({}).sort({ order: 1 });
    return NextResponse.json({ categories: cats }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { msg: "Internal Server Error", error },
      { status: 500 }
    );
  }
};

// create a new category
export const POST = async (req: NextRequest) => {
  try {
    await connectDB();
    const { name, order } = (await req.json()) as { name: string; order: number };

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { msg: "name should be non empty string" },
        { status: 500 }
      );
    }

    if (typeof order !== 'number' || order < 1) {
      return NextResponse.json(
        { msg: "order must be a positive number" },
        { status: 500 }
      );
    }

    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return NextResponse.json(
        { msg: "Category with this name exists." },
        { status: 409 }
      );
    }

    const cat = await Category.create({ name: name.trim(), order });
    return NextResponse.json({ category: cat }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { msg: "Internal Server Error", error },
      { status: 500 }
    );
  }
};

// update existing category
export const PATCH = async (req: NextRequest) => {
  try {
    await connectDB();
    const { id, name, order } = (await req.json()) as { id: string; name: string; order?: number };
    if (!id || !name || name.trim() === "") {
      return NextResponse.json(
        { msg: "id and name must be provided" },
        { status: 500 }
      );
    }

    if (order !== undefined && (typeof order !== 'number' || order < 1)) {
      return NextResponse.json(
        { msg: "order must be a positive number" },
        { status: 500 }
      );
    }

    const cat = await Category.findById(id);
    if (!cat) {
      return NextResponse.json({ msg: "Category not found" }, { status: 404 });
    }

    if (cat.name !== name.trim()) {
      const conflict = await Category.findOne({ name: name.trim() });
      if (conflict) {
        return NextResponse.json(
          { msg: "Another category with this name exists" },
          { status: 409 }
        );
      }
    }

    cat.name = name.trim();
    if (order !== undefined) {
      cat.order = order;
    }
    await cat.save();
    return NextResponse.json({ category: cat }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { msg: "Internal Server Error", error },
      { status: 500 }
    );
  }
};

// delete category
export const DELETE = async (req: NextRequest) => {
  try {
    await connectDB();
    const { id } = (await req.json()) as { id: string };
    if (!id) {
      return NextResponse.json({ msg: "id is required" }, { status: 500 });
    }

    const cat = await Category.findById(id);
    if (!cat) {
      return NextResponse.json({ msg: "Category not found" }, { status: 404 });
    }

    // cascade delete: remove subcategories and products under this category
    await Subcategory.deleteMany({ categoryId: id });
    await Product.deleteMany({ categoryId: id });
    await Category.deleteOne({ _id: id });
    return NextResponse.json({ msg: "Deleted" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { msg: "Internal Server Error", error },
      { status: 500 }
    );
  }
};
