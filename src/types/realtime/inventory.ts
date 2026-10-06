export interface ProductCreatedPayload {
  productId: string;
  supplierId: string;
  categoryId: string;
  name: string;
  createdAt: string;
}

export interface ProductUpdatedPayload {
  productId: string;
  supplierId: string;
  updatedFields: string[];
  updatedAt: string;
}

export interface ProductDeletedPayload {
  productId: string;
  supplierId: string;
  deletedAt: string;
}

export interface ProductActivatedPayload {
  productId: string;
  supplierId: string;
  activatedAt: string;
}

export interface ProductDeactivatedPayload {
  productId: string;
  supplierId: string;
  deactivatedAt: string;
}

export interface InventoryUpdatedPayload {
  productId: string;
  supplierId: string;
  previousQuantity: number;
  newQuantity: number;
  changedAt: string;
}

export interface InventoryLowStockPayload {
  productId: string;
  supplierId: string;
  currentQuantity: number;
  threshold: number;
  detectedAt: string;
}

export interface InventoryOutOfStockPayload {
  productId: string;
  supplierId: string;
  detectedAt: string;
}

export interface InventoryRestockedPayload {
  productId: string;
  supplierId: string;
  previousQuantity: number;
  newQuantity: number;
  restockedAt: string;
}
