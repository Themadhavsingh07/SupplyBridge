/**
 * Utility for generating unique event IDs and tracking processed events for idempotency.
 */

export function generateEventId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `evt_${timestamp}_${random}`;
}

export class IdempotencyManager {
  private processedIds: Set<string> = new Set();
  private maxCapacity: number;

  constructor(maxCapacity = 1000) {
    this.maxCapacity = maxCapacity;
  }

  public hasBeenProcessed(eventId: string): boolean {
    return this.processedIds.has(eventId);
  }

  public markProcessed(eventId: string): void {
    this.processedIds.add(eventId);
    if (this.processedIds.size > this.maxCapacity) {
      const first = this.processedIds.values().next().value;
      if (first) this.processedIds.delete(first);
    }
  }

  public clear(): void {
    this.processedIds.clear();
  }
}

export const globalIdempotencyManager = new IdempotencyManager(1000);
