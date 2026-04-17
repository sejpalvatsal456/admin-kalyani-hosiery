import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/connectDB";
import { Admin } from "@/lib/models";

export const POST = async (req: NextRequest) => {
  try {
    await connectDB();

    const body = await req.json();
    const { username, password, permissions } = body;

    // 1. Basic validation
    if (!username || !password) {
      return NextResponse.json(
        { message: "Username and password are required" },
        { status: 400 }
      );
    }

    // 2. Check if admin already exists
    const existingAdmin = await Admin.findOne({ username });

    if (existingAdmin) {
      return NextResponse.json(
        { message: "Username already taken" },
        { status: 400 }
      );
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create admin
    const newAdmin = await Admin.create({
      username,
      hashedPassword,
      permissions: permissions || [],
    });

    // 5. Response (never send password)
    return NextResponse.json(
      {
        message: "Admin created successfully",
        admin: {
          id: newAdmin._id,
          username: newAdmin.username,
          permissions: newAdmin.permissions,
          createdAt: newAdmin.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup Error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
};