import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, setSessionCookie } from '@/lib/auth';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  phone: z.string().optional(),
  role: z.enum(['CUSTOMER', 'SUPPLIER', 'DELIVERY_PARTNER']).default('CUSTOMER'),
  businessName: z.string().optional(),
  address: z.string().optional(),
  gstNumber: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    const { email, password, name, phone, role, businessName, address, gstNumber } = result.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        name,
        phone: phone || null,
        role: role as any,
        isEmailVerified: true,
      },
    });

    let supplierId: string | undefined = undefined;

    if (role === 'SUPPLIER' && businessName) {
      const supplier = await prisma.supplierProfile.create({
        data: {
          userId: user.id,
          businessName,
          ownerName: name,
          phone: phone || '',
          email,
          addressLine: address || 'Main Hub',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560001',
          gstNumber: gstNumber || null,
          verificationStatus: 'PENDING',
        },
      });
      supplierId = supplier.id;
    }

    const payload = {
      userId: user.id,
      email: user.email!,
      name: user.name,
      role: user.role,
      supplierId,
    };

    await setSessionCookie(payload);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        supplierId,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
