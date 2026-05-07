import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/connectDB";
import { Media } from "@/lib/models";

/* =========================================================
   PATCH /api/media/toggle?id=...
========================================================= */
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          error: "Media ID required",
        },
        {
          status: 400,
        }
      );
    }

    const media = await Media.findById(id);

    if (!media) {
      return NextResponse.json(
        {
          error: "Media not found",
        },
        {
          status: 404,
        }
      );
    }

    /**
     * ─────────────────────────────
     * TOGGLE ACTIVE
     * ─────────────────────────────
     */
    media.isActive = !media.isActive;

    await media.save();

    return NextResponse.json({
      message: "Banner updated",
      isActive: media.isActive,
    });
  } catch (error) {
    console.error("Error toggling banner:", error);

    return NextResponse.json(
      {
        error: "Failed to toggle banner",
      },
      {
        status: 500,
      }
    );
  }
}