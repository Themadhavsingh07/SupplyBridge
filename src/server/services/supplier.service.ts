import { prisma } from '@/lib/prisma';

function calculateHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export async function getNearbySuppliers(latitude: number, longitude: number, maxRadiusKm: number = 10) {
  const allSuppliers = await prisma.supplierProfile.findMany({
    where: {
      onlineStatus: 'ONLINE',
      isOpen: true,
      verificationStatus: 'VERIFIED',
    },
    include: {
      user: { select: { name: true, phone: true } },
      categories: { include: { category: true } },
    },
  });

  const nearby = allSuppliers
    .map((s) => {
      const lat = s.latitude ? Number(s.latitude) : 0;
      const lon = s.longitude ? Number(s.longitude) : 0;
      const distanceKm = calculateHaversineDistanceKm(latitude, longitude, lat, lon);

      return {
        ...s,
        distanceKm: Math.round(distanceKm * 10) / 10,
        serviceRadiusKm: Number(s.serviceRadiusKm),
      };
    })
    .filter((s) => s.distanceKm <= Math.min(maxRadiusKm, s.serviceRadiusKm))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return nearby;
}
