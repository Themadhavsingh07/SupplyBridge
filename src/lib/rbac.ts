import { getSession, TokenPayload } from './auth';
import { NextResponse } from 'next/server';

export type AllowedRole = 'CUSTOMER' | 'SUPPLIER' | 'DELIVERY_PARTNER' | 'ADMIN' | 'SUPPORT_AGENT';

export async function authorizeUser(allowedRoles?: AllowedRole[]): Promise<{
  session: TokenPayload | null;
  authorized: boolean;
  errorResponse?: NextResponse;
}> {
  const session = await getSession();

  if (!session) {
    return {
      session: null,
      authorized: false,
      errorResponse: NextResponse.json(
        { error: 'Unauthorized. Please log in to proceed.' },
        { status: 401 }
      ),
    };
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = allowedRoles.includes(session.role as AllowedRole);
    if (!hasRole) {
      return {
        session,
        authorized: false,
        errorResponse: NextResponse.json(
          { error: `Forbidden. Role '${session.role}' is not authorized to access this resource.` },
          { status: 403 }
        ),
      };
    }
  }

  return { session, authorized: true };
}

export function checkSupplierAccess(session: TokenPayload, targetSupplierId: string): boolean {
  if (session.role === 'ADMIN') return true;
  if (session.role === 'SUPPLIER' && session.supplierId === targetSupplierId) return true;
  return false;
}

export function checkCustomerOrderAccess(session: TokenPayload, orderCustomerId: string): boolean {
  if (session.role === 'ADMIN' || session.role === 'SUPPORT_AGENT') return true;
  if (session.role === 'CUSTOMER' && session.userId === orderCustomerId) return true;
  return false;
}
