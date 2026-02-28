import { connectDB } from "@/lib/connectDB";
import { Subcategory, Product } from "@/lib/models";
import { NextRequest, NextResponse } from "next/server";

// get all subcategories (populated with category name)
export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    const subs = await Subcategory.find({}).populate("categoryId");
    return NextResponse.json({ subcategories: subs }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { msg: "Internal Server Error", error },
      { status: 500 }
    );
  }
};

// create
export const POST = async (req: NextRequest) => {
  try {
    await connectDB();
    const { name, categoryId } = (await req.json()) as {
      name: string;
      categoryId: string;
    };
    if (!name || !categoryId || name.trim() === "" || categoryId === "") {
      return NextResponse.json(
        { msg: "name and categoryId must be provided" },
        { status: 500 }
      );
    }

    // check duplicate under same category
    const existing = await Subcategory.findOne({
      name: name.trim(),
      categoryId,
    });
    if (existing) {
      return NextResponse.json(
        { msg: "Subcategory with this name already exists in selected category" },
        { status: 409 }
      );
    }

    const sub = await Subcategory.create({ name: name.trim(), categoryId });
    return NextResponse.json({ subcategory: sub }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { msg: "Internal Server Error", error },
      { status: 500 }
    );
  }
};

// update
export const PATCH = async (req: NextRequest) => {
  try {
    await connectDB();
    const { id, name, categoryId } = (await req.json()) as {
      id: string;
      name: string;
      categoryId: string;
    };
    if (!id || !name || !categoryId || name.trim() === "" || categoryId === "") {
      return NextResponse.json(
        { msg: "id, name and categoryId must be provided" },
        { status: 500 }
      );
    }

    const sub = await Subcategory.findById(id);
    if (!sub) {
      return NextResponse.json({ msg: "Subcategory not found" }, { status: 404 });
    }

    // if name or category changed, check duplicate
    if (
      sub.name !== name.trim() ||
      sub.categoryId.toString() !== categoryId
    ) {
      const conflict = await Subcategory.findOne({
        name: name.trim(),
        categoryId,
      });
      if (conflict) {
        return NextResponse.json(
          { msg: "Another subcategory with this name exists in selected category" },
          { status: 409 }
        );
      }
    }

    sub.name = name.trim();
    sub.categoryId = categoryId;
    await sub.save();
    return NextResponse.json({ subcategory: sub }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { msg: "Internal Server Error", error },
      { status: 500 }
    );
  }
};

// delete
export const DELETE = async (req: NextRequest) => {
  try {
    await connectDB();
    const { id } = (await req.json()) as { id: string };
    if (!id) {
      return NextResponse.json({ msg: "id is required" }, { status: 500 });
    }
    const sub = await Subcategory.findById(id);
    if (!sub) {
      return NextResponse.json({ msg: "Subcategory not found" }, { status: 404 });
    }
    // delete products that reference this subcategory
    await Product.deleteMany({ subcategoryId: id });
    await Subcategory.deleteOne({ _id: id });
    return NextResponse.json({ msg: "Deleted" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { msg: "Internal Server Error", error },
      { status: 500 }
    );
  }
};
