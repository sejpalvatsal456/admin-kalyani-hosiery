import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";
import { Media } from "@/lib/models";

import {
  S3Client,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

import { Upload } from "@aws-sdk/lib-storage";

import { v4 as uuidv4 } from "uuid";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
});

/* =========================================================
   GET /api/media
========================================================= */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const type = searchParams.get("type");

    /**
     * ─────────────────────────────
     * REELS
     * ─────────────────────────────
     */
    if (type === "reel") {
      const reels = await Media.find({
        category: "reel",
      }).sort({ createdAt: -1 });

      return NextResponse.json(reels);
    }

    /**
     * ─────────────────────────────
     * BANNERS
     * ─────────────────────────────
     */
    if (type === "banner") {
      const banners = await Media.find({
        category: "banner",
      }).sort({
        order: 1,
        createdAt: -1,
      });

      const grouped: Record<
        string,
        {
          variant: string;
          items: any[];
        }
      > = {};

      banners.forEach((item) => {
        if (!grouped[item.slot]) {
          grouped[item.slot] = {
            variant: item.variant,
            items: [],
          };
        }

        grouped[item.slot].items.push(item);
      });

      return NextResponse.json(grouped);
    }

    /**
     * ─────────────────────────────
     * DEFAULT MEDIA
     * ─────────────────────────────
     */
    const media = await Media.find({
      category: "media",
    }).sort({ createdAt: -1 });

    return NextResponse.json(media);
  } catch (error) {
    console.error("Error fetching media:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch media",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   POST /api/media
========================================================= */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const type = searchParams.get("type") || "media";

    const slot = searchParams.get("slot");

    const formData = await request.formData();

    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        {
          error: "No file provided",
        },
        {
          status: 400,
        }
      );
    }

    /**
     * ─────────────────────────────
     * VALIDATIONS
     * ─────────────────────────────
     */
    if (type === "banner" && !slot) {
      return NextResponse.json(
        {
          error: "Banner slot is required",
        },
        {
          status: 400,
        }
      );
    }

    const fileName = file.name;
    const fileSize = file.size;
    const fileType = file.type;

    /**
     * ─────────────────────────────
     * CATEGORY
     * ─────────────────────────────
     */
    const category =
      type === "reel"
        ? "reel"
        : type === "banner"
        ? "banner"
        : "media";

    /**
     * ─────────────────────────────
     * VARIANT
     * ─────────────────────────────
     */
    let variant: "carousel" | "single" | null =
      null;

    if (type === "banner") {
      variant =
        slot === "hero"
          ? "carousel"
          : "single";
    }

    /**
     * ─────────────────────────────
     * ORDER
     * ─────────────────────────────
     */
    let order = 0;

    if (variant === "carousel") {
      const lastBanner = await Media.findOne({
        slot,
      }).sort({
        order: -1,
      });

      order = lastBanner
        ? lastBanner.order + 1
        : 1;
    }

    if (variant === "single") {
      order = 1;

      /**
       * Disable previous active banner
       */
      await Media.updateMany(
        {
          slot,
        },
        {
          isActive: false,
        }
      );
    }

    /**
     * ─────────────────────────────
     * S3 FOLDER
     * ─────────────────────────────
     */
    const folder =
      type === "reel"
        ? "reels"
        : type === "banner"
        ? "banner"
        : "media";

    const key = `${folder}/${
      slot || "general"
    }/${uuidv4()}-${fileName}`;

    /**
     * ─────────────────────────────
     * S3 UPLOAD
     * ─────────────────────────────
     */
    const upload = new Upload({
      client: s3Client,

      params: {
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: key,
        Body: Buffer.from(await file.arrayBuffer()),
        ContentType: fileType,
      },
    });

    await upload.done();

    const url = `https://d1ho0zjs4a519l.cloudfront.net/${key}`;

    /**
     * ─────────────────────────────
     * SAVE DB
     * ─────────────────────────────
     */
    const media = new Media({
      name: fileName,
      url,
      key,
      size: fileSize,
      type: fileType,

      category,

      slot:
        type === "banner"
          ? slot
          : null,

      variant,

      order,

      isActive: true,
    });

    await media.save();

    return NextResponse.json(media, {
      status: 201,
    });
  } catch (error) {
    console.error("Error uploading media:", error);

    return NextResponse.json(
      {
        error: "Failed to upload media",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   DELETE /api/media?id=...
========================================================= */
export async function DELETE(request: NextRequest) {
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
     * DELETE FROM S3
     * ─────────────────────────────
     */
    const deleteCommand =
      new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: media.key,
      });

    await s3Client.send(deleteCommand);

    /**
     * ─────────────────────────────
     * DELETE FROM DB
     * ─────────────────────────────
     */
    await Media.findByIdAndDelete(id);

    return NextResponse.json({
      message: "Deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting media:", error);

    return NextResponse.json(
      {
        error: "Failed to delete media",
      },
      {
        status: 500,
      }
    );
  }
}