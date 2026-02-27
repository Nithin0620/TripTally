import { connectDB } from "@/lib/database";

export const runtime = 'nodejs';
export const dynamic = 'auto';

export async function GET(request: Request) {
  await connectDB();

  return Response.json({
    message: "TripTally API is running",
    version: "1.0.0",
    db: "connected",
  });
}
