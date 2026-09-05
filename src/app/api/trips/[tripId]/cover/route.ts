import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, unauthorizedResponse, serverErrorResponse } from "@/middleware/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(
  request: NextRequest,
  { params }: { params: { tripId: string } }
) {
  const auth = await authenticateUser(request);
  if (!auth.authenticated || !auth.user) {
    return unauthorizedResponse();
  }

  try {
    const { tripId } = params;

    // Verify user is a member of this trip
    const { data: membership } = await supabaseAdmin
      .from("trip_members")
      .select("id")
      .eq("trip_id", tripId)
      .eq("user_id", auth.user.userId)
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: "Not a member of this trip" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" },
        { status: 400 }
      );
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size: 5MB" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const fileName = `cover_${tripId}_${Date.now()}`;
    const result = (await uploadToCloudinary(buffer, fileName, "triptally/covers")) as any;
    const coverUrl = result?.secure_url;

    if (!coverUrl) {
      return serverErrorResponse("Failed to upload image");
    }

    // Update trip cover_image in DB
    const { error: updateError } = await supabaseAdmin
      .from("trips")
      .update({ cover_image: coverUrl })
      .eq("id", tripId);

    if (updateError) {
      return serverErrorResponse("Failed to update trip cover image");
    }

    return NextResponse.json({
      success: true,
      cover_image: coverUrl,
    });
  } catch (error) {
    console.error("POST /api/trips/[tripId]/cover error:", error);
    return serverErrorResponse();
  }
}
