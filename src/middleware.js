import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // Agar token nahi hai aur user protected route par hai
  if (!token) {
    if (pathname.startsWith('/admin') || pathname.startsWith('/doctor') || pathname.startsWith('/reception') || pathname.startsWith('/api/admin')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables.");
    }
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // 🛡️ ROLE BASED ACCESS CONTROL (RBAC)
    
    // Admin logic: Only Admin can access /admin and /api/admin
    if ((pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) && payload.role !== 'Admin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Doctor logic: Doctor and Admin can access /doctor
    if (pathname.startsWith('/doctor') && !['Doctor', 'Admin'].includes(payload.role)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Reception logic: Receptionist and Admin can access /reception
    if (pathname.startsWith('/reception') && !['Receptionist', 'Admin'].includes(payload.role)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
  } catch (err) {
    // Invalid token
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth_token');
    return response;
  }
}

// Konse paths par middleware chalana hai
export const config = {
  matcher: [
    '/admin/:path*',
    '/doctor/:path*',
    '/reception/:path*',
    '/api/admin/:path*',
    '/api/doctor/:path*',
  ],
};