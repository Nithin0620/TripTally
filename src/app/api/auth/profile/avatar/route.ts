// ============================================
// POST /api/auth/profile/avatar
// Uploads a profile photo to Cloudinary and saves its URL.
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { authenticateUser, badRequestResponse, serverErrorResponse, unauthorizedResponse } from '@/middleware/auth';
import { deleteFromCloudinary, uploadToCloudinary } from '@/lib/cloudinary';

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

function cloudinaryPublicId(url?: string | null): string | null {
  if (!url) return null;
  const match = url.match(/triptally\/avatars\/([^/?#]+)$/);
  if (!match) return null;
  return `triptally/avatars/${match[1].replace(/\.[^.]+$/, '')}`;
}

export async function POST(request: NextRequest) {
  const auth = await authenticateUser(request);
  if (!auth.authenticated || !auth.user) return unauthorizedResponse();

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return badRequestResponse('Missing avatar file');
    }

    if (!file.type.startsWith('image/')) {
      return badRequestResponse('Avatar must be an image');
    }

    if (file.size > MAX_AVATAR_BYTES) {
      return badRequestResponse('Avatar must be smaller than 5 MB');
    }

    const dbClient = supabaseAdmin ?? supabase;
    const { data: currentUser } = await dbClient
      .from('users')
      .select('profile_image')
      .eq('id', auth.user.userId)
      .single();

    const publicId = `avatar_${auth.user.userId}_${Date.now()}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadResult = (await uploadToCloudinary(
      buffer,
      publicId,
      'triptally/avatars'
    )) as { secure_url?: string; public_id?: string } | null;

    if (!uploadResult?.secure_url) {
      return serverErrorResponse('Avatar upload failed');
    }

    const profileImage = uploadResult.secure_url;
    const { error } = await dbClient
      .from('users')
      .update({ profile_image: profileImage })
      .eq('id', auth.user.userId);

    if (error) {
      if (uploadResult.public_id) {
        await deleteFromCloudinary(uploadResult.public_id).catch(() => undefined);
      }
      console.error('Avatar profile update error:', error);
      return serverErrorResponse('Failed to save avatar');
    }

    const oldPublicId = cloudinaryPublicId(currentUser?.profile_image);
    if (oldPublicId && oldPublicId !== uploadResult.public_id) {
      await deleteFromCloudinary(oldPublicId).catch(() => undefined);
    }

    return NextResponse.json({ profile_image: profileImage });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return serverErrorResponse('Avatar upload failed');
  }
}
