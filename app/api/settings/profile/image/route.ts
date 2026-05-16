// app/api/user/profile/image/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { v2 as cloudinary } from "cloudinary";
import { applyRateLimit } from "@/lib/helpers/applyRateLimit";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.cloudinary_api_cloud_name,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function PUT(req: Request) {
  try {
    // rate limit check
      const { success } = await applyRateLimit(req);
    
      if (!success) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
      }
    
    // Get user from session
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { image } = await req.json();
    console.log("Received image data:", image ? "Yes" : "No");
    // Validate image
    if (!image || !image.startsWith("data:image")) {
      return NextResponse.json(
        { error: "Invalid image data" },
        { status: 400 },
      );
    }

    try {
      const { data: currentUser } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!currentUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Delete old image from Cloudinary if exists
      if (currentUser.image && currentUser.image.includes("cloudinary")) {
        try {
          const urlParts = currentUser.image.split("/");
          const publicIdWithExtension = urlParts[urlParts.length - 1];
          const publicId = publicIdWithExtension.split(".")[0];
          const folder = urlParts[urlParts.length - 2];

          await cloudinary.uploader.destroy(`${folder}/${publicId}`);
        } catch (deleteError) {
          console.error("Error deleting old image:", deleteError);
          // Continue even if deletion fails
        }
      }

      // Upload new image to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(image, {
        folder: "Trackfi/profiles",
        transformation: [
          { width: 200, height: 200, crop: "fill", gravity: "face" },
          { quality: "auto" },
        ],
      });

      // Update only the image field in database
      const { data: updatedUser } = await supabase
        .from("profiles")
        .update({
          image: uploadResult.secure_url,
          updated_at: new Date(),
        })
        .eq("id", user.id)
        .select()
        .single();

      if (!updatedUser) {
        return NextResponse.json(
          { error: "Failed to update user" },
          { status: 500 },
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: "Profile picture updated successfully",
          data: {
            image: uploadResult.secure_url,
          },
        },
        { status: 200 },
      );
    } catch (uploadError) {
      console.error("Error uploading to Cloudinary:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: 500 },
      );
    }
  } catch (err) {
    const error = err as Error;
    const isDbError =
      error.message?.includes("ENOTFOUND");
    console.error("Error updating image:", error);
    return NextResponse.json(
      { error: isDbError ? "Network unavailable" : "Internal server error" },
      { status: 500 },
    );
  }
}
