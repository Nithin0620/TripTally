import { NextResponse } from "next/server";
import { getFamousPlacesForMap } from "@/lib/explore";

export async function GET() {
  try {
    const places = await getFamousPlacesForMap();
    return NextResponse.json({ places }, { status: 200 });
  } catch {
    return NextResponse.json({ places: [] }, { status: 200 });
  }
}
