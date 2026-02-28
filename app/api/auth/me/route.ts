import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ user: null }, { status: 401 });

    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    return NextResponse.json({ user: { id: payload.id, email: payload.email, role: payload.role } });
  } catch (err) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
