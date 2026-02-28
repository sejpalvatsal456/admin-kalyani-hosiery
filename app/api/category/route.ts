import { connectDB } from "@/lib/connectDB";
import { Category } from "@/lib/models";
import { NextRequest, NextResponse } from "next/server";

// fetch all categories
export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    const cats = await Category.find({});
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
    const { name } = (await req.json()) as { name: string };

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { msg: "name should be non empty string" },
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

    const cat = await Category.create({ name: name.trim() });
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
    const { id, name } = (await req.json()) as { id: string; name: string };
    if (!id || !name || name.trim() === "") {
      return NextResponse.json(
        { msg: "id and name must be provided" },
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
