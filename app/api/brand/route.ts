import { connectDB } from "@/lib/connectDB";
import { Brand } from "@/lib/models";
import { NextRequest, NextResponse } from "next/server";

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
    await connectDB();
    const { id, name, logo } = await req.json() as {
      id: string;
      name: string;
      logo: string;
    };

    if (!id || name === '' || logo === '')
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
    if (brand.name !== name) {
      const conflict = await Brand.findOne({ name });
      if (conflict)
        return NextResponse.json(
          { msg: 'Another brand with this name exists' },
          { status: 409 }
        );
    }

    brand.name = name;
    brand.logo = logo;
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

export const POST = async(req:NextRequest) => {
  try {
    await connectDB();
    const { name, logo } = await req.json() as { name: string, logo: string };

    if (name === '' || logo === '') return NextResponse.json(
      { msg : "name and logo should be non empty string" }, 
      { status: 500 }
    );

    const oldBrand = await Brand.findOne({ name: name });
    if(oldBrand) return NextResponse.json(
      { msg: "Brand with this name exist." },
      { status: 409 }
    );

    const brand = await Brand.create({ name, logo });
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