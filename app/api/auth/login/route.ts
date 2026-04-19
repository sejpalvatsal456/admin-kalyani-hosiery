import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../lib/connectDB";
import { Admin, User } from "../../../../lib/models";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body as { username: string; password: string };

    if (!username || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    await connectDB();
    const admin = await Admin.findOne({ username });
    if (!admin) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const match = await bcrypt.compare(password, admin.hashedPassword);
    if (!match) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const token = jwt.sign(
      { id: admin._id.toString(), name: admin.username, role: "admin" },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    const res = NextResponse.json({ message: "ok" });
    res.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60,
      sameSite: "lax",
    });

    return res;
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
