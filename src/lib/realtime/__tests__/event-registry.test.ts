import {
  createRealtimeEvent,
  validateRealtimeEvent,
  getChannelForEvent,
  globalIdempotencyManager,
  authorizeChannelAccess,
  eventSchemasMap,
} from '../event-registry';

export async function runEventRegistryTestSuite() {
  console.log('--- RUNNING COMPLETE REALTIME EVENT REGISTRY TEST SUITE ---');
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

  // 1. Envelope Creation & Schema Validation Test Across Categories
  try {
    const chatEvent = createRealtimeEvent(
      'CHAT_MESSAGE_CREATED',
      'usr_1',
      'CUSTOMER',
      'conv_100',
      {
        messageId: 'msg_1',
        conversationId: 'conv_100',
        senderId: 'usr_1',
        senderRole: 'CUSTOMER',
        messageType: 'TEXT',
        content: 'Hello supplier!',
        createdAt: new Date().toISOString(),
      }
    );

    const valRes = validateRealtimeEvent(chatEvent);
    assert(valRes.valid, 'Chat message created event envelope passes Zod validation');
    assert(chatEvent.version === 1, 'Event envelope version is 1');
  } catch (err) {
    assert(false, 'Chat event creation exception');
  }

  // 2. Reject Unknown / Unregistered Event Types
  const fakeEvent = {
    eventId: 'evt_999',
    eventType: 'UNKNOWN_CUSTOM_EVENT',
    version: 1,
    timestamp: new Date().toISOString(),
    actorId: 'usr_1',
    actorRole: 'CUSTOMER',
    entityId: 'ent_1',
    payload: {},
  };
  assert(!validateRealtimeEvent(fakeEvent).valid, 'Unknown event type rejected by validateRealtimeEvent');

  // 3. Inventory & Low Stock Payload Test
  try {
    const invEvent = createRealtimeEvent(
      'INVENTORY_LOW_STOCK',
      'sup_1',
      'SUPPLIER',
      'prod_55',
      {
        productId: 'prod_55',
        supplierId: 'sup_1',
        currentQuantity: 3,
        threshold: 10,
        detectedAt: new Date().toISOString(),
      }
    );
    assert(validateRealtimeEvent(invEvent).valid, 'INVENTORY_LOW_STOCK event passes validation');
  } catch (err) {
    assert(false, 'Inventory event exception');
  }

  // 4. GPS Bounds Validation Test
  const badGpsEvent = createRealtimeEvent(
    'DELIVERY_LOCATION_UPDATED',
    'driver_1',
    'DELIVERY_PARTNER',
    'ord_100',
    {
      orderId: 'ord_100',
      deliveryId: 'del_100',
      deliveryPartnerId: 'driver_1',
      latitude: 195.0, // Out of bounds!
      longitude: 77.5946,
      accuracy: 5,
      heading: 180,
      speed: 10,
      timestamp: new Date().toISOString(),
    }
  );
  assert(!validateRealtimeEvent(badGpsEvent).valid, 'Out-of-bounds latitude (195.0) rejected by validator');

  // 5. Payment Security Leak Rejection Test
  const leakedPaymentEvent = createRealtimeEvent(
    'PAYMENT_STATUS_CHANGED',
    'sys_1',
    'ADMIN',
    'pay_100',
    {
      paymentId: 'pay_100',
      orderId: 'ord_100',
      previousStatus: 'PENDING',
      newStatus: 'PAID',
      updatedAt: new Date().toISOString(),
      cardNumber: '4111111111111111', // Leaked card number!
    } as any
  );
  assert(!validateRealtimeEvent(leakedPaymentEvent).valid, 'Payment status event with leaked card number strictly rejected');

  // 6. Automatic Channel Routing Test
  const chatChannel = getChannelForEvent('CHAT_MESSAGE_CREATED', { conversationId: 'conv_88' });
  assert(chatChannel === 'conversation:conv_88', 'CHAT_MESSAGE_CREATED maps to conversation:conv_88');

  const locChannel = getChannelForEvent('DELIVERY_LOCATION_UPDATED', { orderId: 'ord_55' });
  assert(locChannel === 'order:ord_55:tracking', 'DELIVERY_LOCATION_UPDATED maps to order:ord_55:tracking');

  const notifChannel = getChannelForEvent('NOTIFICATION_CREATED', { recipientId: 'usr_77' });
  assert(notifChannel === 'user:usr_77:notifications', 'NOTIFICATION_CREATED maps to user:usr_77:notifications');

  // 7. Idempotency Manager Test
  const uniqueId = `evt_idempotency_test_${Date.now()}`;
  assert(!globalIdempotencyManager.hasBeenProcessed(uniqueId), 'Idempotency manager acknowledges unseen ID');
  globalIdempotencyManager.markProcessed(uniqueId);
  assert(globalIdempotencyManager.hasBeenProcessed(uniqueId), 'Idempotency manager correctly flags duplicate ID');

  console.log(`--- TEST RESULTS: ${passed} PASSED, ${failed} FAILED ---`);
  return { passed, failed };
}

runEventRegistryTestSuite();

