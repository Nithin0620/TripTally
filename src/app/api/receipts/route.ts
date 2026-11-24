import { NextRequest, NextResponse } from 'next/server';
import {
  authenticateUser,
  badRequestResponse,
  forbiddenResponse,
  serverErrorResponse,
} from '@/middleware/auth';
import { checkTripEditAccess, checkTripViewAccess } from '@/middleware/role';
import { supabaseAdmin } from '@/lib/supabase';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';
import { extractReceiptData } from '@/lib/receipt-ocr';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function getCloudinaryPublicId(imageUrl: string): string | null {
  const uploadMarker = '/upload/';
  const markerIndex = imageUrl.indexOf(uploadMarker);
  if (markerIndex === -1) return null;

  const segments = imageUrl
    .slice(markerIndex + uploadMarker.length)
    .split('?')[0]
    .split('/');

  if (/^v\d+$/.test(segments[0])) segments.shift();

  return segments.join('/').replace(/\.[^/.]+$/, '');
}

async function getExpenseTripId(expenseId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('expenses')
    .select('trip_id')
    .eq('id', expenseId)
    .maybeSingle();

  return data?.trip_id || null;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateUser(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const expenseId = searchParams.get('expenseId');
    if (!expenseId) {
      return badRequestResponse('Missing required query parameter: expenseId');
    }

    const tripId = await getExpenseTripId(expenseId);
    if (!tripId) {
      return badRequestResponse('Expense not found');
    }

    const { hasAccess, error: roleError } = await checkTripViewAccess(
      auth.user!.userId,
      tripId
    );
    if (!hasAccess) {
      return forbiddenResponse(roleError ?? undefined);
    }

    const { data: receipts, error } = await supabaseAdmin
      .from('receipts')
      .select('*')
      .eq('expense_id', expenseId)
      .order('created_at', { ascending: false });

    if (error) {
      return serverErrorResponse(error.message);
    }

    return NextResponse.json({ receipts: receipts || [] }, { status: 200 });
  } catch (error) {
    console.error('Error fetching receipts:', error);
    return serverErrorResponse('Failed to fetch receipts');
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateUser(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const expenseId = formData.get('expenseId') as string;
    const tripId = formData.get('tripId') as string;

    if (!file || !expenseId || !tripId) {
      return badRequestResponse('Missing required fields: file, expenseId, tripId');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return badRequestResponse('Receipt must be a JPEG, PNG, WebP, or HEIC image');
    }

    if (file.size > MAX_FILE_SIZE) {
      return badRequestResponse('Receipt image must be 5 MB or smaller');
    }

    const expenseTripId = await getExpenseTripId(expenseId);
    if (!expenseTripId || expenseTripId !== tripId) {
      return badRequestResponse('Expense does not belong to this trip');
    }

    const { hasAccess, error: roleError } = await checkTripEditAccess(
      auth.user!.userId,
      tripId
    );
    if (!hasAccess) {
      return forbiddenResponse(roleError ?? undefined);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `receipt_${expenseId}_${Date.now()}`;

    let uploadResult: any;
    try {
      uploadResult = await uploadToCloudinary(buffer, fileName, 'triptally/receipts');
    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError);
      return serverErrorResponse('Failed to upload image');
    }

    const ocr = await extractReceiptData(buffer, file.type);

    const { data: receipt, error: dbError } = await supabaseAdmin
      .from('receipts')
      .insert({
        expense_id: expenseId,
        image_url: uploadResult.secure_url,
        extracted_text: ocr.text || '',
      })
      .select()
      .single();

    if (dbError) {
      await deleteFromCloudinary(uploadResult.public_id);
      return serverErrorResponse('Failed to save receipt');
    }

    return NextResponse.json({ receipt }, { status: 201 });
  } catch (error) {
    console.error('Error uploading receipt:', error);
    return serverErrorResponse('Failed to upload receipt');
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await authenticateUser(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const { receiptId, tripId } = body;

    if (!receiptId || !tripId) {
      return badRequestResponse('Missing required fields: receiptId, tripId');
    }

    const { hasAccess, error: roleError } = await checkTripEditAccess(
      auth.user!.userId,
      tripId
    );
    if (!hasAccess) {
      return forbiddenResponse(roleError ?? undefined);
    }

    const { data: receipt, error: getError } = await supabaseAdmin
      .from('receipts')
      .select('*')
      .eq('id', receiptId)
      .maybeSingle();

    if (getError || !receipt) {
      return badRequestResponse('Receipt not found');
    }

    const expenseTripId = await getExpenseTripId(receipt.expense_id);
    if (!expenseTripId || expenseTripId !== tripId) {
      return forbiddenResponse('Receipt does not belong to this trip');
    }

    const publicId = getCloudinaryPublicId(receipt.image_url);
    if (publicId) {
      try {
        await deleteFromCloudinary(publicId);
      } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
      }
    }

    const { error: dbError } = await supabaseAdmin
      .from('receipts')
      .delete()
      .eq('id', receiptId)
      .eq('expense_id', receipt.expense_id);

    if (dbError) {
      return serverErrorResponse('Failed to delete receipt');
    }

    return NextResponse.json({ message: 'Receipt deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting receipt:', error);
    return serverErrorResponse('Failed to delete receipt');
  }
}
