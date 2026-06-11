import { connectDB } from "@/lib/connectDB";
import { NextRequest, NextResponse } from "next/server";

export const GET = async(req:NextRequest) => {
  try {
    await connectDB();
    return NextResponse.json({msg: "ok"}, {status: 200});
  } catch (error) {
    console.log(error);
    return NextResponse.json({error: error}, {status: 500});
  }
}