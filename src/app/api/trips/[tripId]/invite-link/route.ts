import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import {
  authenticateUser,
  forbiddenResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@/middleware/auth";
import { checkTripOwnership } from "@/middleware/role";

export async function POST(
  request: NextRequest,
  context: { params: { tripId: string } }
) {
  try {
    const { tripId } = context.params;
    const auth = await authenticateUser(request);

    if (!auth.authenticated || !auth.user) {
      return unauthorizedResponse("Unauthorized");
    }

    const { hasAccess } = await checkTripOwnership(auth.user.userId, tripId);
    if (!hasAccess) {
      return forbiddenResponse("Only the trip owner can create invite links");
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const { data: existing } = await supabaseAdmin
      .from("trip_invites")
      .select("id, expires_at")
      .eq("trip_id", tripId)
      .eq("status", "pending")
      .is("email", null)
      .gte("expires_at", now.toISOString())
      .maybeSingle();

    let inviteId = existing?.id as string | undefined;
    let resolvedExpiry = existing?.expires_at as string | undefined;

    if (!inviteId) {
      const { data: created, error } = await supabaseAdmin
        .from("trip_invites")
        .insert({
          trip_id: tripId,
          email: null,
          status: "pending",
          created_by: auth.user.userId,
          expires_at: expiresAt.toISOString(),
        })
        .select("id, expires_at")
        .single();

      if (error || !created) {
        return serverErrorResponse("Failed to create invite link");
      }

      inviteId = created.id;
      resolvedExpiry = created.expires_at;
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || request.nextUrl.origin;
    const inviteLink = `${origin}/join/${tripId}?invite=${inviteId}`;

    return NextResponse.json({
      inviteLink,
      inviteId,
      expiresAt: resolvedExpiry || expiresAt.toISOString(),
    });
  } catch {
    return serverErrorResponse("Failed to create invite link");
  }
}
