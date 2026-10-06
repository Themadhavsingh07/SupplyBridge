export interface UserProfileUpdatedPayload {
  userId: string;
  updatedFields: string[];
  updatedAt: string;
}

export interface UserStatusChangedPayload {
  userId: string;
  previousStatus: 'ACTIVE' | 'INACTIVE';
  newStatus: 'ACTIVE' | 'INACTIVE';
  changedAt: string;
}

export interface UserSuspendedPayload {
  userId: string;
  suspendedBy: string;
  reason: string;
  suspendedAt: string;
}

export interface UserReactivatedPayload {
  userId: string;
  reactivatedBy: string;
  reactivatedAt: string;
}

export interface UserLocationUpdatedPayload {
  userId: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: string;
}
