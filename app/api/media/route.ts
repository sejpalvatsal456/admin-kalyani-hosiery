import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";
import { Media } from "@/lib/models";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { v4 as uuidv4 } from "uuid";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
});

// ─── GET /api/media ───────────────────────────────────────────────────────────
// ?type=reel   → returns only videos
// ?type=banner → returns only images
// (no type)    → returns all media (existing behavior)

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const query: Record<string, unknown> = {};

    if (type === "reel") {
      query.type = { $regex: "^video/" };
    } else if (type === "banner") {
      query.type = { $regex: "^image/" };
    }

    const media = await Media.find(query).sort({ createdAt: -1 });
    return NextResponse.json(media);
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}

// ─── POST /api/media ──────────────────────────────────────────────────────────
// ?type=reel   → validates video, uploads to reels/
// ?type=banner → validates image, uploads to banner/
// (no type)    → uploads to media/ (existing behavior)

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    // Validate type param
    if (type && !["reel", "banner"].includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type against category
    if (type === "reel" && !file.type.startsWith("video/")) {
      return NextResponse.json(
        { error: "Only video files allowed for reels" },
        { status: 400 }
      );
    }
    if (type === "banner" && !file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files allowed for banners" },
        { status: 400 }
      );
    }

    const fileName = file.name;
    const fileSize = file.size;
    const fileType = file.type;

    // Resolve S3 folder based on type
    let folder = "media";
    if (type === "reel") folder = "reels";
    if (type === "banner") folder = "banner";

    const key = `${folder}/${uuidv4()}-${fileName}`;

    // Upload to S3
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: key,
        Body: file.stream(),
        ContentType: fileType,
      },
    });

    await upload.done();

    const url = `https://d1ho0zjs4a519l.cloudfront.net/${key}`;

    // Save to DB with category field
    const media = new Media({
      name: fileName,
      url,
      key,
      size: fileSize,
      type: fileType,
      category: type || "media",
    });

    await media.save();

    return NextResponse.json(media, { status: 201 });
  } catch (error) {
    console.error("Error uploading media:", error);
    return NextResponse.json({ error: "Failed to upload media" }, { status: 500 });
  }
}

// ─── DELETE /api/media?id=... ─────────────────────────────────────────────────
// ?type is accepted for consistency but not required —
// the correct S3 folder is already encoded in media.key

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Media ID required" }, { status: 400 });
    }

    const media = await Media.findById(id);
    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // Delete from S3 (key already contains the correct folder)
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: media.key,
    });

    await s3Client.send(deleteCommand);

    // Delete from DB
    await Media.findByIdAndDelete(id);

    return NextResponse.json({ message: "Media deleted successfully" });
  } catch (error) {
    console.error("Error deleting media:", error);
    return NextResponse.json({ error: "Failed to delete media" }, { status: 500 });
  }
}