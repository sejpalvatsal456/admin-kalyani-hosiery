import { connectDB } from "@/lib/connectDB";
import { Brand, Product } from "@/lib/models";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    if (payload.role !== "admin") return NextResponse.json({ msg: "Forbidden" }, { status: 403 });
    return null;
  } catch (err) {
    return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
  }
}

export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    const brands = await Brand.find({});
    return NextResponse.json({ brands }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { msg: "Internal Server Error", error },
      { status: 500 }
    );
  }
};

export const PATCH = async (req: NextRequest) => {
  try {
    const authErr = await requireAdmin(req);
    if (authErr) return authErr;
    await connectDB();
    const { id, brandName, brandLogo } = await req.json() as {
      id: string;
      brandName: string;
      brandLogo: string;
    };

    console.log(brandName);
    console.log(brandLogo);

    if (!id || brandName === '' || brandLogo === '')
      return NextResponse.json(
        { msg: 'id, name and logo should be non empty' },
        { status: 500 }
      );

    const brand = await Brand.findById(id);
    if (!brand)
      return NextResponse.json(
        { msg: 'Brand not found' },
        { status: 404 }
      );

    // check for duplicate name if changing name
    if (brand.brandName !== brandName) {
      const conflict = await Brand.findOne({ brandName });
      if (conflict)
      {
        console.log(conflict)  
        return NextResponse.json(
          { msg: 'Another brand with this name exists' },
          { status: 409 }
        );
      }
    }

    brand.brandName = brandName;
    brand.logo = brandLogo;
    await brand.save();

    return NextResponse.json({ brand }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { msg: 'Internal Server Error', error },
      { status: 500 }
    );
  }
};

export const DELETE = async (req: NextRequest) => {
  try {
    const authErr = await requireAdmin(req);
    if (authErr) return authErr;
    await connectDB();
    const { id } = await req.json() as { id: string };
    if (!id) {
      return NextResponse.json({ msg: "id is required" }, { status: 500 });
    }

    const brand = await Brand.findById(id);
    if (!brand) {
      return NextResponse.json({ msg: "Brand not found" }, { status: 404 });
    }

    // delete related products first (cascade)
    await Product.deleteMany({ brandId: id });

    // delete the brand
    await Brand.deleteOne({ _id: id });
    return NextResponse.json({ msg: "Deleted" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { msg: "Internal Server Error", error },
      { status: 500 }
    );
  }
};

export const POST = async(req:NextRequest) => {
  try {
    const authErr = await requireAdmin(req);
    if (authErr) return authErr;
    await connectDB();
    const { brandName, brandLogo } = await req.json() as { brandName: string, brandLogo: string };

    console.log(brandName);
    console.log(brandLogo);


    if (brandName === '' || brandLogo === '') return NextResponse.json(
      { msg : "name and logo should be non empty string" }, 
      { status: 500 }
    );

    const oldBrand = await Brand.findOne({ brandName: brandName });
    if(oldBrand) return NextResponse.json(
      { msg: "Brand with this name exist." },
      { status: 409 }
    );

    const brand = await Brand.create({ brandName, brandLogo });
    if(!brand) return NextResponse.json(
      { msg: "Error in creation of brand" },
      { status: 500 }
    );

    return NextResponse.json(
      { brand: brand },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { msg: "Internal Server Error", error: error },
      { status: 500 }
    );
  }
}