import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/connectDB";
import { Media } from "@/lib/models";

/* =========================================================
   PATCH /api/media/order
========================================================= */
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const { slot, ids } = body;

    if (!slot || !ids || !Array.isArray(ids)) {
      return NextResponse.json(
        {
          error: "Invalid payload",
        },
        {
          status: 400,
        }
      );
    }

    /**
     * ─────────────────────────────
     * UPDATE ORDERS
     * ─────────────────────────────
     */
    await Promise.all(
      ids.map((id: string, index: number) =>
        Media.findByIdAndUpdate(id, {
          order: index + 1,
        })
      )
    );

    return NextResponse.json({
      message: "Banner order updated",
    });
  } catch (error) {
    console.error("Error updating order:", error);

    return NextResponse.json(
      {
        error: "Failed to update order",
      },
      {
        status: 500,
      }
    );
  }
}