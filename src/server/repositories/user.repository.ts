import { prisma } from '@/lib/prisma';
import { UserRole, UserStatus } from '@prisma/client';

export class UserRepository {
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        customerProfile: true,
        supplierProfile: true,
        deliveryProfile: true,
        addresses: true,
      },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findByPhone(phone: string) {
    return prisma.user.findUnique({
      where: { phone },
    });
  }

  async createUser(data: {
    name: string;
    email?: string;
    phone?: string;
    passwordHash?: string;
    role: UserRole;
    status?: UserStatus;
  }) {
    return prisma.user.create({
      data,
    });
  }

  async updateUser(id: string, data: Partial<{ name: string; avatarUrl: string; status: UserStatus }>) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }
}

export const userRepository = new UserRepository();
