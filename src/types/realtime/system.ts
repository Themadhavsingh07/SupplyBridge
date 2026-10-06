import { RealtimeConnectionStatus } from './common';

export interface SystemMaintenanceStartedPayload {
  maintenanceId: string;
  message: string;
  startsAt: string;
  estimatedEndAt?: string;
}

export interface SystemMaintenanceEndedPayload {
  maintenanceId: string;
  endedAt: string;
}

export interface SystemAnnouncementPayload {
  announcementId: string;
  title: string;
  message: string;
  priority: 'INFO' | 'WARNING' | 'IMPORTANT';
  createdAt: string;
}

export interface RealtimeConnectionStatusPayload {
  status: RealtimeConnectionStatus;
  changedAt: string;
}
