import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get role and login status from cookies
  const userRole = request.cookies.get('user_role')?.value;
  const isLoggedIn = request.cookies.get('is_logged_in')?.value === 'true';

  // Role-to-Dashboard mapping to avoid 404s
  const DASHBOARD_MAP: Record<string, string> = {
    'ADMIN': '/dashboard/admin',
    'TEACHER': '/dashboard/teacher',
    'STUDENT': '/dashboard/student',
  };

  const userDashboard = (isLoggedIn && userRole) ? DASHBOARD_MAP[userRole] : '/signin';

  // 1. Specific Admin Restriction: Cannot access /courses list page
  if (pathname === '/courses' && userRole === 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard/admin?tab=courses', request.url));
  }

  // 2. Strict Dashboard Protection
  // If user is on ANY dashboard path, ensure it matches THEIR role
  if (pathname.startsWith('/dashboard/')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }

    const segments = pathname.split('/');
    const dashboardType = segments[2]; // /dashboard/[type]

    if (userRole && dashboardType && dashboardType !== userRole.toLowerCase()) {
      return NextResponse.redirect(new URL(userDashboard, request.url));
    }
  }

  // 3. Student-Only Pages Protection
  const studentOnlyPages = ['/assignments', '/leaderboard', '/achievements'];
  if (studentOnlyPages.includes(pathname)) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }
    if (userRole !== 'STUDENT') {
      // Redirect Teachers and Admins to their respective dashboards
      return NextResponse.redirect(new URL(userDashboard, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/courses',
    '/dashboard/:path*',
    '/assignments',
    '/leaderboard',
    '/achievements',
  ],
};
