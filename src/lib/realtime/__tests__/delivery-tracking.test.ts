import { validateGPSInput } from '@/server/services/delivery-location.service';
import { hashOtp, verifyDeliveryOtp } from '@/server/services/delivery-otp.service';
import { isValidStatusTransition } from '../validators';
import { validateRealtimeEvent } from '../event-schemas';

async function runDeliveryTrackingTests() {
  console.log('--- RUNNING DELIVERY PARTNER & LIVE TRACKING TEST SUITE ---');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, title: string) {
    if (condition) {
      console.log(`✅ PASS: ${title}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${title}`);
      failed++;
    }
  }

  // 1. GPS Validation Tests (Section 21)
  const validGps = validateGPSInput({
    latitude: 28.6139,
    longitude: 77.209,
    accuracy: 5.0,
    heading: 180,
    speed: 12.5,
  });
  assert(validGps.valid === true, 'Valid GPS coordinates (-90..90, -180..180) accepted');

  const invalidLatGps = validateGPSInput({
    latitude: 105.0,
    longitude: 77.209,
  });
  assert(Boolean(!invalidLatGps.valid && invalidLatGps.error?.includes('Latitude')), 'Out-of-bounds latitude (105.0) rejected');

  const invalidLonGps = validateGPSInput({
    latitude: 28.6139,
    longitude: -200.0,
  });
  assert(Boolean(!invalidLonGps.valid && invalidLonGps.error?.includes('Longitude')), 'Out-of-bounds longitude (-200.0) rejected');

  const invalidHeadingGps = validateGPSInput({
    latitude: 28.6139,
    longitude: 77.209,
    heading: 400,
  });
  assert(Boolean(!invalidHeadingGps.valid && invalidHeadingGps.error?.includes('Heading')), 'Out-of-bounds heading (400deg) rejected');

  // 2. State Machine Transitions (Section 14)
  assert(isValidStatusTransition('READY_FOR_PICKUP' as any, 'PICKED_UP' as any) === true, 'READY_FOR_PICKUP -> PICKED_UP transition valid');
  assert(isValidStatusTransition('PICKED_UP' as any, 'OUT_FOR_DELIVERY' as any) === true, 'PICKED_UP -> OUT_FOR_DELIVERY transition valid');
  assert(isValidStatusTransition('OUT_FOR_DELIVERY' as any, 'DELIVERED' as any) === true, 'OUT_FOR_DELIVERY -> DELIVERED transition valid');
  assert(isValidStatusTransition('DELIVERED' as any, 'PREPARING' as any) === false, 'Backward DELIVERED -> PREPARING transition rejected');

  // 3. OTP Security Hashing (Section 33)
  const rawOtp = '749201';
  const hashed = hashOtp(rawOtp);
  assert(hashed !== rawOtp, 'OTP is hashed (not plaintext)');
  assert(hashed.length === 64, 'SHA-256 hash length is 64 hex characters');

  // 4. Realtime Location Update Event Envelope
  const locationEvent = {
    eventId: 'evt_loc_123',
    eventType: 'DELIVERY_LOCATION_UPDATED',
    version: 1,
    timestamp: new Date().toISOString(),
    actorId: 'usr_rider_99',
    actorRole: 'DELIVERY_PARTNER',
    entityId: 'del_123',
    payload: {
      deliveryId: 'del_123',
      orderId: 'ord_123',
      deliveryPartnerId: 'part_123',
      latitude: 28.6139,
      longitude: 77.209,
      accuracy: 5,
      heading: 90,
      speed: 15,
      timestamp: new Date().toISOString(),
    },
  };
  const eventVal = validateRealtimeEvent(locationEvent);
  assert(eventVal.valid === true, 'DELIVERY_LOCATION_UPDATED event envelope conforms to Zod schema');

  console.log(`--- DELIVERY TRACKING TEST RESULTS: ${passed} PASSED, ${failed} FAILED ---`);
  if (failed > 0) process.exit(1);
}

runDeliveryTrackingTests().catch((err) => {
  console.error('Test suite error:', err);
  process.exit(1);
});
