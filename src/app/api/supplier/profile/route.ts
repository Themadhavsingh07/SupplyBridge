import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { SupplierProfileSchema } from '@/lib/validations/supplier';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supplier = await prisma.supplierProfile.findUnique({
      where: { userId: session.userId },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        categories: { include: { category: true } },
      },
    });

    if (!supplier) {
      return NextResponse.json({ error: 'Supplier profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      supplier: {
        ...supplier,
        storeName: supplier.businessName,
        description: supplier.businessDescription,
        address: supplier.addressLine,
      },
    });
  } catch (error) {
    console.error('Fetch supplier profile error:', error);
    return NextResponse.json({ error: 'Failed to fetch supplier profile' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supplier = await prisma.supplierProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!supplier) {
      return NextResponse.json({ error: 'Supplier profile not found' }, { status: 404 });
    }

    const body = await req.json();

    // Prevent direct client modification of protected fields
    delete (body as any).verificationStatus;
    delete (body as any).verifiedAt;
    delete (body as any).rejectionReason;

    const parse = SupplierProfileSchema.partial().safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ error: 'Invalid profile data', details: parse.error.format() }, { status: 400 });
    }

    const data = parse.data;
    const updateData: any = {};
    if (data.storeName) updateData.businessName = data.storeName;
    if (data.description !== undefined) updateData.businessDescription = data.description;
    if (data.address) updateData.addressLine = data.address;
    if (data.phone) updateData.phone = data.phone;
    if (data.email) updateData.email = data.email;
    if (data.landmark !== undefined) updateData.landmark = data.landmark;
    if (data.city) updateData.city = data.city;
    if (data.state) updateData.state = data.state;
    if (data.postalCode) updateData.postalCode = data.postalCode;
    if (data.serviceRadiusKm) updateData.serviceRadiusKm = data.serviceRadiusKm;
    if (data.openingTime) updateData.openingTime = data.openingTime;
    if (data.closingTime) updateData.closingTime = data.closingTime;
    if (data.isOpen !== undefined) updateData.isOpen = data.isOpen;

    const updated = await prisma.supplierProfile.update({
      where: { id: supplier.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, supplier: updated });
  } catch (error) {
    console.error('Update supplier profile error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
