import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import {
  authenticateUser,
  badRequestResponse,
  forbiddenResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@/middleware/auth";
import { checkTripViewAccess } from "@/middleware/role";
import { ChatMessage, UserContext } from "@/types";

const MESSAGE_SELECT = "id, trip_id, user_id, content, created_at, users(id, name, profile_image)";

function normalizeMessage(row: any): ChatMessage {
  const relatedUser = Array.isArray(row.users) ? row.users[0] : row.users;
  return {
    id: row.id,
    trip_id: row.trip_id,
    user_id: row.user_id,
    content: row.content,
    created_at: row.created_at,
    user: relatedUser
      ? {
          id: relatedUser.id,
          name: relatedUser.name,
          profile_image: relatedUser.profile_image,
        }
      : undefined,
  };
}

type AccessResult =
  | { error: NextResponse; user?: undefined }
  | { error?: undefined; user: UserContext };

async function requireTripMember(
  request: NextRequest,
  tripId: string
): Promise<AccessResult> {
  const auth = await authenticateUser(request);
  if (!auth.authenticated || !auth.user) {
    return { error: unauthorizedResponse("Unauthorized") };
  }

  const { hasAccess } = await checkTripViewAccess(auth.user.userId, tripId);
  if (!hasAccess) {
    return { error: forbiddenResponse("You are not a member of this trip") };
  }

  return { user: auth.user };
}

export async function GET(
  request: NextRequest,
  context: { params: { tripId: string } }
) {
  try {
    const { tripId } = context.params;
    const access = await requireTripMember(request, tripId);
    if (access.error) return access.error;

    const { data, error } = await supabaseAdmin
      .from("trip_messages")
      .select(MESSAGE_SELECT)
      .eq("trip_id", tripId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) return serverErrorResponse(error.message);

    const messages = (data || []).map(normalizeMessage).reverse();
    return NextResponse.json({ messages });
  } catch {
    return serverErrorResponse("Failed to load messages");
  }
}

export async function POST(
  request: NextRequest,
  context: { params: { tripId: string } }
) {
  try {
    const { tripId } = context.params;
    const access = await requireTripMember(request, tripId);
    if (access.error) return access.error;

    const body = await request.json();
    const content = typeof body?.content === "string" ? body.content.trim() : "";

    if (!content || content.length > 2000) {
      return badRequestResponse("Message must be between 1 and 2000 characters");
    }

    const { data, error } = await supabaseAdmin
      .from("trip_messages")
      .insert({
        trip_id: tripId,
        user_id: access.user.userId,
        content,
      })
      .select(MESSAGE_SELECT)
      .single();

    if (error) return serverErrorResponse(error.message);

    return NextResponse.json({ message: normalizeMessage(data) });
  } catch {
    return serverErrorResponse("Failed to send message");
  }
}
