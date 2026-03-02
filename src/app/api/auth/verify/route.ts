import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromCookie } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    // Get token from cookie (preferred) or Authorization header (backward compatibility)
    const cookieHeader = request.headers.get('cookie');
    const authHeader = request.headers.get('Authorization');
    
    let token = extractTokenFromCookie(cookieHeader || '');
    
    // Fallback to Authorization header if no cookie
    if (!token && authHeader) {
      token = authHeader.replace('Bearer ', '');
    }

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify JWT token
    const payload = await verifyToken(token);
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Return user data from token payload
    const user = {
      id: payload.userId,
      email: payload.email,
      name: payload.name || '',
      profile_image: payload.profile_image,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Token verification failed' },
      { status: 401 }
    );
  }
}
