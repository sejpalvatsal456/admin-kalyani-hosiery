import { NextRequest, NextResponse } from "next/server";

interface Product {
  id: string;
  brandId: string;
  productName: string;
  categoryId: string;
  subcategoryId: string;
  thumbnail: string;
  variety: any[];
  desc: any[];
}

let products: Product[] = [];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (id) {
    const prod = products.find((p) => p.id === id);
    return NextResponse.json(prod || null);
  }
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const id = Date.now().toString();
    const item: Product = { id, ...data };
    products = [item, ...products];
    return NextResponse.json(item);
  } catch (err) {
    return NextResponse.error();
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, ...updates } = data;
    products = products.map((p) => (p.id === id ? { ...p, ...updates } : p));
    return NextResponse.json({ id, ...updates });
  } catch (err) {
    return NextResponse.error();
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.error();
    products = products.filter((p) => p.id !== id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.error();
  }
}
