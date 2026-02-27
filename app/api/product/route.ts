import { NextRequest, NextResponse } from "next/server";

// In-memory store
let products: any[] = [];

export async function GET(req: NextRequest) {
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    // assign id
    const id = Date.now().toString();
    const item = { id, ...data };
    products = [item, ...products];
    return NextResponse.json(item);
  } catch (err) {
    return NextResponse.error();
  }
}
