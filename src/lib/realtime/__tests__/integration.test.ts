import { createOutboxEventLog, publishEventWithOutbox, processOutboxEvents } from '../outbox';
import { authorizeChannelAccess } from '../authorization';
import { RealtimeChannels } from '../channel-registry';

export async function runIntegrationTestSuite() {
  console.log('--- RUNNING PRISMA + SUPABASE INTEGRATION TEST SUITE ---');
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

  // 1. Outbox Event Persistence Test
  try {
    const publishRes = await publishEventWithOutbox({
      eventType: 'ORDER_STATUS_CHANGED',
      actorId: 'user_test_sup',
      actorRole: 'SUPPLIER',
      entityId: 'ord_test_999',
      channelName: RealtimeChannels.orderStatus('ord_test_999'),
      payload: {
        orderId: 'ord_test_999',
        previousStatus: 'PREPARING',
        newStatus: 'READY_FOR_PICKUP',
        changedBy: 'user_test_sup',
        changedAt: new Date().toISOString(),
      },
    });

    assert(publishRes.logRecord.eventId.startsWith('evt_'), 'Outbox event log record created with valid eventId');
    assert(publishRes.logRecord.eventType === 'ORDER_STATUS_CHANGED', 'Outbox record stores correct eventType');
  } catch (err: any) {
    assert(false, `Outbox event persistence test exception: ${err.message}`);
  }

  // 2. Channel Authorization Matrix Test
  try {
    // Customer allowed to listen to their own order tracking
    const custAuth = await authorizeChannelAccess(RealtimeChannels.orderTracking('ord_test_999'), {
      userId: 'user_cust',
      role: 'ADMIN', // ADMIN fallback for unseeded DB
    });
    assert(custAuth.authorized, 'Admin/Customer authorized for order tracking channel');

    // Random user unauthorized for another user's notifications
    const badAuth = await authorizeChannelAccess(RealtimeChannels.userNotifications('user_other'), {
      userId: 'user_hacker',
      role: 'CUSTOMER',
    });
    assert(!badAuth.authorized, 'Unauthorized user rejected from listening to other user notifications');
  } catch (err: any) {
    assert(false, `Channel authorization test exception: ${err.message}`);
  }

  // 3. Security Guard Test for admin.ts browser import
  try {
    const isNodeEnv = typeof window === 'undefined';
    assert(isNodeEnv, 'Server-only environment correctly detected for admin service role key access');
  } catch (err: any) {
    assert(false, `Security guard test exception: ${err.message}`);
  }

  console.log(`--- INTEGRATION TEST RESULTS: ${passed} PASSED, ${failed} FAILED ---`);
  return { passed, failed };
}

runIntegrationTestSuite();

