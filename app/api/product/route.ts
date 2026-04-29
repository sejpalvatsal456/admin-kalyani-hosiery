import { connectDB } from "@/lib/connectDB";
import { Product } from "@/lib/models";
import { NextRequest, NextResponse } from "next/server";

// Generate slug
const getSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
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

    // Material React Table server-side parameters
    const start = parseInt(searchParams.get("start") || "0");
    const size = parseInt(searchParams.get("size") || "10");
    const globalFilter = searchParams.get("globalFilter") || "";
    const sorting = searchParams.get("sorting") ? JSON.parse(searchParams.get("sorting")!) : [];
    const filters = searchParams.get("filters") ? JSON.parse(searchParams.get("filters")!) : [];

    // Build MongoDB query
    let query: any = {};

    // Global filter - search across multiple fields
    if (globalFilter) {
      query.$or = [
        { productName: { $regex: globalFilter, $options: "i" } },
        { slug: { $regex: globalFilter, $options: "i" } },
      ];
    }

    // Column filters
    filters.forEach((filter: any) => {
      const { id, value } = filter;
      switch (id) {
        case "productName":
          query.productName = { $regex: value, $options: "i" };
          break;
        case "brandId.brandName":
          // We'll handle this after population
          break;
        case "categoryId.name":
          // We'll handle this after population
          break;
        case "subcategoryId.name":
          // We'll handle this after population
          break;
        case "slug":
          query.slug = { $regex: value, $options: "i" };
          break;
      }
    });

    // Get total count for pagination
    const totalCount = await Product.countDocuments(query);

    // Build aggregation pipeline for population and filtering
    let pipeline: any[] = [
      { $match: query },
      {
        $lookup: {
          from: "brands",
          localField: "brandId",
          foreignField: "_id",
          as: "brandId"
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "categoryId"
        }
      },
      {
        $lookup: {
          from: "subcategories",
          localField: "subcategoryId",
          foreignField: "_id",
          as: "subcategoryId"
        }
      },
      {
        $unwind: { path: "$brandId", preserveNullAndEmptyArrays: true }
      },
      {
        $unwind: { path: "$categoryId", preserveNullAndEmptyArrays: true }
      },
      {
        $unwind: { path: "$subcategoryId", preserveNullAndEmptyArrays: true }
      }
    ];

    // Apply column filters that require populated data
    const postFilters: any[] = [];
    filters.forEach((filter: any) => {
      const { id, value } = filter;
      switch (id) {
        case "brandId.brandName":
          postFilters.push({
            $match: {
              "brandId.brandName": { $regex: value, $options: "i" }
            }
          });
          break;
        case "categoryId.name":
          postFilters.push({
            $match: {
              "categoryId.name": { $regex: value, $options: "i" }
            }
          });
          break;
        case "subcategoryId.name":
          postFilters.push({
            $match: {
              "subcategoryId.name": { $regex: value, $options: "i" }
            }
          });
          break;
      }
    });

    pipeline = pipeline.concat(postFilters);

    // Apply sorting
    if (sorting.length > 0) {
      const sortStage: any = { $sort: {} };
      sorting.forEach((sort: any) => {
        const { id, desc } = sort;
        switch (id) {
          case "productName":
            sortStage.$sort.productName = desc ? -1 : 1;
            break;
          case "brandId.brandName":
            sortStage.$sort["brandId.brandName"] = desc ? -1 : 1;
            break;
          case "categoryId.name":
            sortStage.$sort["categoryId.name"] = desc ? -1 : 1;
            break;
          case "subcategoryId.name":
            sortStage.$sort["subcategoryId.name"] = desc ? -1 : 1;
            break;
          case "slug":
            sortStage.$sort.slug = desc ? -1 : 1;
            break;
        }
      });
      pipeline.push(sortStage);
    }

    // Apply pagination
    pipeline.push({ $skip: start });
    pipeline.push({ $limit: size });

    // Execute aggregation
    const products = await Product.aggregate(pipeline);

    return NextResponse.json({
      data: products,
      meta: {
        totalRowCount: totalCount,
      }
    }, { status: 200 });

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
