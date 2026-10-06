export interface SupplierCreatedPayload {
  supplierId: string;
  businessName: string;
  createdAt: string;
}

export interface SupplierVerificationSubmittedPayload {
  supplierId: string;
  submittedAt: string;
}

export interface SupplierVerifiedPayload {
  supplierId: string;
  verifiedAt: string;
  verifiedBy: string;
}

export interface SupplierRejectedPayload {
  supplierId: string;
  rejectedAt: string;
  rejectedBy: string;
  reason: string;
}

export interface SupplierSuspendedPayload {
  supplierId: string;
  suspendedAt: string;
  suspendedBy: string;
  reason: string;
}

export interface SupplierOnlinePayload {
  supplierId: string;
  changedAt: string;
}

export interface SupplierOfflinePayload {
  supplierId: string;
  changedAt: string;
}

export interface SupplierBusyPayload {
  supplierId: string;
  changedAt: string;
}

export interface SupplierStatusChangedPayload {
  supplierId: string;
  previousStatus: 'ONLINE' | 'OFFLINE' | 'BUSY';
  newStatus: 'ONLINE' | 'OFFLINE' | 'BUSY';
  changedAt: string;
}
