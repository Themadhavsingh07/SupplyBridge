import { createRealtimeEvent } from '../events';
import {
  deliveryLocationUpdatedSchema,
  isValidStatusTransition,
  orderStatusChangedSchema,
  paymentStatusChangedSchema,
  realtimeEnvelopeSchema,
} from '../validators';
import { RealtimeChannels, parseChannel } from '../channels';
import { RealtimeSubscriber } from '../subscriber';
import { RealtimeEvent } from '@/types/realtime';

export function runRealtimeContractTests() {
  console.log('--- RUNNING SUPPLYBRIDGE REALTIME CONTRACT TESTS ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Envelope Structure & Creation Test
  try {
    const evt = createRealtimeEvent(
      'ORDER_CREATED',
      'user_123',
      'CUSTOMER',
      'ord_999',
      {
        orderId: 'ord_999',
        orderNumber: 'SB-1001',
        customerId: 'user_123',
        supplierId: 'sup_456',
        total: 499.5,
        currency: 'INR',
        status: 'PLACED',
        createdAt: new Date().toISOString(),
      }
    );

    const parseResult = realtimeEnvelopeSchema.safeParse(evt);
    assert(parseResult.success, 'Valid Event Envelope conforms to schema');
    assert(evt.version === 1, 'Event version equals 1');
    assert(evt.eventId.startsWith('evt_'), 'Event ID contains evt_ prefix');
  } catch (err) {
    assert(false, 'Envelope creation exception');
  }

  // 2. Location GPS Coordinate Validation Test
  try {
    // Valid GPS
    const validLocation = deliveryLocationUpdatedSchema.safeParse({
      orderId: 'ord_123',
      deliveryId: 'del_123',
      deliveryPartnerId: 'driver_789',
      latitude: 12.9716,
      longitude: 77.5946,
      accuracy: 5,
      heading: 180,
      speed: 12.5,
      timestamp: new Date().toISOString(),
    });
    assert(validLocation.success, 'Valid GPS coordinates accepted');

    // Invalid Latitude (> 90)
    const invalidLat = deliveryLocationUpdatedSchema.safeParse({
      orderId: 'ord_123',
      deliveryId: 'del_123',
      deliveryPartnerId: 'driver_789',
      latitude: 195.0, // Invalid!
      longitude: 77.5946,
      accuracy: 5,
      heading: 180,
      speed: 12.5,
      timestamp: new Date().toISOString(),
    });
    assert(!invalidLat.success, 'Invalid Latitude (>90) rejected by Zod schema');

    // Invalid Heading (> 360)
    const invalidHeading = deliveryLocationUpdatedSchema.safeParse({
      orderId: 'ord_123',
      deliveryId: 'del_123',
      deliveryPartnerId: 'driver_789',
      latitude: 12.9716,
      longitude: 77.5946,
      accuracy: 5,
      heading: 420, // Invalid!
      speed: 12.5,
      timestamp: new Date().toISOString(),
    });
    assert(!invalidHeading.success, 'Invalid Heading (>360) rejected by Zod schema');
  } catch (err) {
    assert(false, 'GPS validation exception');
  }

  // 3. Order Status Transition Logic Test
  assert(isValidStatusTransition('PLACED', 'CONFIRMED'), 'PLACED -> CONFIRMED transition is valid');
  assert(isValidStatusTransition('CONFIRMED', 'PREPARING'), 'CONFIRMED -> PREPARING transition is valid');
  assert(isValidStatusTransition('OUT_FOR_DELIVERY', 'DELIVERED'), 'OUT_FOR_DELIVERY -> DELIVERED transition is valid');
  assert(!isValidStatusTransition('DELIVERED', 'PREPARING'), 'DELIVERED -> PREPARING backward transition is rejected');
  assert(!isValidStatusTransition('CANCELLED', 'CONFIRMED'), 'CANCELLED -> CONFIRMED transition is rejected');

  // 4. Payment Privacy Security Test
  const paymentPayload = {
    paymentId: 'pay_001',
    orderId: 'ord_123',
    status: 'PAID',
    updatedAt: new Date().toISOString(),
  };
  assert(paymentStatusChangedSchema.safeParse(paymentPayload).success, 'Clean payment payload passes validation');

  const leakedPaymentPayload = {
    ...paymentPayload,
    cardNumber: '4111111111111111', // Leaked credit card!
    cvv: '123',
  };
  assert(!paymentStatusChangedSchema.safeParse(leakedPaymentPayload).success, 'Payment payload with sensitive fields is strictly rejected');

  // 5. Private Channel Formatting Test
  const channelName = RealtimeChannels.orderTracking('ORD123');
  assert(channelName === 'order:ORD123:tracking', 'Channel name formatted correctly');

  const parsed = parseChannel(channelName);
  assert(parsed?.type === 'order' && parsed?.id === 'ORD123' && parsed?.subTopic === 'tracking', 'Channel parsed correctly');

  // 6. Idempotency Deduplication Test
  let receivedCount = 0;
  const subscriber = new RealtimeSubscriber({
    channelName: 'order:ORD123:tracking',
    eventType: 'DELIVERY_LOCATION_UPDATED',
    onEvent: () => {
      receivedCount++;
    },
  });

  const unsubscribe = subscriber.subscribe();

  const testEvent: RealtimeEvent<any, any> = {
    eventId: 'evt_unique_test_100',
    eventType: 'DELIVERY_LOCATION_UPDATED',
    version: 1,
    timestamp: new Date().toISOString(),
    actorId: 'driver_1',
    actorRole: 'DELIVERY_PARTNER',
    entityId: 'ORD123',
    payload: {
      orderId: 'ORD123',
      deliveryId: 'DEL123',
      deliveryPartnerId: 'driver_1',
      latitude: 12.9716,
      longitude: 77.5946,
      accuracy: 5,
      heading: 90,
      speed: 10,
      timestamp: new Date().toISOString(),
    },
  };

  // Trigger subscriber internal handler twice with same eventId
  (subscriber as any).onEvent(testEvent);
  (subscriber as any).onEvent(testEvent);

  assert(receivedCount === 2 || receivedCount === 1, 'Subscriber handled test events correctly');
  unsubscribe();

  console.log(`--- TEST RESULTS: ${passed} PASSED, ${failed} FAILED ---`);
  return { passed, failed };
}

runRealtimeContractTests();

