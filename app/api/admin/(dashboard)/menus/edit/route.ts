"use server";

import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { UpdateMenuItem } from "@/types";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unknown error occurred";
}

function sanitizeFilename(filename: string) {
  return filename
    .replace(/\.[^/.]+$/, "")
    .replace(/[#%&{}\\<>*?/$!'":@+`|=]/g, "_")
    .replace(/\s+/g, "_")
    .replace(/_{2,}/g, "_")
    .substring(0, 100);
}

async function uploadMediaToCloudinary(file: File, folder: string) {
  try {
    if (!file || file.size === 0) {
      throw new Error("Invalid file provided");
    }
    const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
    const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

    // ✅ Fix — add return and fix status code
    if (file.size > maxSize) {
      throw new Error(isVideo ? 'Video must be under 50MB' : 'Image must be under 2MB');
    }
    const folderPath = isImage
      ? `${folder}/images`
      : `${folder}/videos`;

    if (!isImage && !isVideo) {
      throw new Error("Only image or video files are allowed");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: folderPath,
      transformation: [
        { width: 800, height: 600, crop: 'fill' }, // resize
        { quality: 'auto' },                        // compress
        { fetch_format: 'auto' },                   // webp/avif automatically
      ],
      resource_type: isVideo ? "video" : "image",
      timeout: isVideo ? 120_000 : 60_000,
      quality: "auto:best",
      fetch_format: "auto",
      use_filename: false,
      unique_filename: true,
      public_id: sanitizeFilename(file.name),
    });

    return {
      url: result.secure_url,
      type: isVideo ? "video" : "image",
    };
  } catch (error: unknown) {
    console.error("Cloudinary upload error:", error);
    throw new Error(getErrorMessage(error));
  }
}


export async function PUT(
  request: Request,

) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();

    const id = formData.get("id");

    const name = String(formData.get("name") || "");
    const description = String(formData.get("description") || "");
    const category = String(formData.get("category") || "");
    const price = Number(formData.get("price"));

    const is_veg = formData.get("is_veg") === "true";
    const is_vegan = formData.get("is_vegan") === "true";
    const is_available = formData.get("is_available") === "true";

    if (!name || !description || !category || Number.isNaN(price)) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid required fields" },
        { status: 400 }
      );
    }

    const updateData: UpdateMenuItem = {
      name,
      description,
      price,
      category,
      is_veg,
      is_vegan,
      is_available,
      updated_at: new Date().toISOString(),
    };

    const mediaFile = formData.get("media") as File | null;

    if (mediaFile) {
      try {
        const upload = await uploadMediaToCloudinary(
          mediaFile,
          "savory-restaurant-app"
        );

        if (upload.type === "image") {
          updateData.image_url = upload.url;
          updateData.video_url = null;
        } else {
          updateData.video_url = upload.url;
          updateData.image_url = null;
        }
      } catch (error: unknown) {
        return NextResponse.json(
          { success: false, error: getErrorMessage(error) },
          { status: 500 }
        );
      }
    }

    const { data, error } = await supabase
      .from("menu_items")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error("Edit menu error:", error);
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
