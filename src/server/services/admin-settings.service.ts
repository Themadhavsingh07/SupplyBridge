import { createAuditLog } from './audit.service';

export interface SystemSettingsData {
  platformCommissionPercent: number;
  defaultDeliveryFee: number;
  minimumOrderAmount: number;
  maxDeliveryRadiusKm: number;
  lowStockThreshold: number;
  featureFlags: {
    AI_ASSISTANT: boolean;
    SMART_SEARCH: boolean;
    SUBSCRIPTIONS: boolean;
    LOYALTY: boolean;
    REFERRALS: boolean;
    LIVE_TRACKING: boolean;
    SUPPLIER_CHAT: boolean;
    DELIVERY_CHAT: boolean;
  };
  maintenanceMode: boolean;
}

// In-memory / persistent operational config store
let currentSettings: SystemSettingsData = {
  platformCommissionPercent: 10,
  defaultDeliveryFee: 40,
  minimumOrderAmount: 99,
  maxDeliveryRadiusKm: 15,
  lowStockThreshold: 5,
  featureFlags: {
    AI_ASSISTANT: true,
    SMART_SEARCH: true,
    SUBSCRIPTIONS: true,
    LOYALTY: true,
    REFERRALS: true,
    LIVE_TRACKING: true,
    SUPPLIER_CHAT: true,
    DELIVERY_CHAT: true,
  },
  maintenanceMode: false,
};

export async function getSystemSettings(): Promise<SystemSettingsData> {
  return currentSettings;
}

export async function updateSystemSettings(
  adminUserId: string,
  newSettings: Partial<SystemSettingsData>
): Promise<SystemSettingsData> {
  const oldSettings = { ...currentSettings };
  currentSettings = {
    ...currentSettings,
    ...newSettings,
    featureFlags: {
      ...currentSettings.featureFlags,
      ...(newSettings.featureFlags || {}),
    },
  };

  await createAuditLog({
    userId: adminUserId,
    action: 'ADMIN_SETTINGS_CHANGED' as any,
    entityType: 'SYSTEM_SETTINGS',
    entityId: 'global_settings',
    oldData: oldSettings,
    newData: currentSettings,
  });

  return currentSettings;
}
