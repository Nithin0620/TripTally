// ============================================
// POST /api/receipts - Upload receipt image
// DELETE /api/receipts - Delete receipt
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, badRequestResponse, serverErrorResponse } from '@/middleware/auth';
import { checkTripEditAccess } from '@/middleware/role';
import { forbiddenResponse } from '@/middleware/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';

/**
 * POST /api/receipts - Upload receipt image
 */
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

    // Validation
    if (!file || !expenseId || !tripId) {
      return badRequestResponse('Missing required fields: file, expenseId, tripId');
    }

    // Check edit access
    const { hasAccess, error: roleError } = await checkTripEditAccess(
      auth.user!.userId,
      tripId
    );

    if (!hasAccess) {
      return forbiddenResponse(roleError ?? undefined);
    }

    // Upload to Cloudinary
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `receipt_${expenseId}_${Date.now()}`;

    let uploadResult: any;
    try {
      uploadResult = await uploadToCloudinary(buffer, fileName, 'triptally/receipts');
    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError);
      return serverErrorResponse('Failed to upload image');
    }

    // Store receipt in database
    const { data: receipt, error: dbError } = await supabaseAdmin
      .from('receipts')
      .insert({
        expense_id: expenseId,
        image_url: uploadResult.secure_url,
        extracted_text: null,
      })
      .select()
      .single();

    if (dbError) {
      // Clean up uploaded image
      await deleteFromCloudinary(uploadResult.public_id);
      return serverErrorResponse('Failed to save receipt');
    }

    return NextResponse.json({ receipt }, { status: 201 });
  } catch (error) {
    console.error('Error uploading receipt:', error);
    return serverErrorResponse('Failed to upload receipt');
  }
}

/**
 * DELETE /api/receipts - Delete receipt
 */
export async function DELETE(request: NextRequest) {
  try {
    const auth = await authenticateUser(request);

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const { receiptId, tripId } = body;

    // Validation
    if (!receiptId || !tripId) {
      return badRequestResponse('Missing required fields: receiptId, tripId');
    }

    // Check edit access
    const { hasAccess, error: roleError } = await checkTripEditAccess(
      auth.user!.userId,
      tripId
    );

    if (!hasAccess) {
      return forbiddenResponse(roleError ?? undefined);
    }

    // Get receipt
    const { data: receipt, error: getError } = await supabaseAdmin
      .from('receipts')
      .select('*')
      .eq('id', receiptId)
      .single();

    if (getError || !receipt) {
      return serverErrorResponse('Receipt not found');
    }

    // Delete from Cloudinary
    const publicId = receipt.image_url.split('/').pop()?.split('.')[0];
    if (publicId) {
      try {
        await deleteFromCloudinary(publicId);
      } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
      }
    }

    // Delete from database
    const { error: dbError } = await supabaseAdmin
      .from('receipts')
      .delete()
      .eq('id', receiptId);

    if (dbError) {
      return serverErrorResponse('Failed to delete receipt');
    }

    return NextResponse.json({ message: 'Receipt deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting receipt:', error);
    return serverErrorResponse('Failed to delete receipt');
  }
}
