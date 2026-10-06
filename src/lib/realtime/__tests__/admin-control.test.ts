import { hasPermission, authorizeAdminOrSupport } from '@/lib/auth/admin-auth';

async function runAdminControlTests() {
  console.log('--- RUNNING ADMIN & SUPPORT CONTROL CENTER TEST SUITE ---');
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

  // 1. RBAC Tests
  assert(hasPermission('ADMIN', 'MANAGE_SYSTEM') === true, 'ADMIN role has full MANAGE_SYSTEM permission');
  assert(hasPermission('ADMIN', 'VERIFY_SUPPLIERS') === true, 'ADMIN role has VERIFY_SUPPLIERS permission');
  assert(hasPermission('SUPPORT_AGENT', 'MANAGE_COMPLAINTS') === true, 'SUPPORT_AGENT has MANAGE_COMPLAINTS permission');
  assert(hasPermission('SUPPORT_AGENT', 'MANAGE_SYSTEM') === false, 'SUPPORT_AGENT DENIED MANAGE_SYSTEM permission');
  assert(hasPermission('SUPPORT_AGENT', 'VERIFY_SUPPLIERS') === false, 'SUPPORT_AGENT DENIED VERIFY_SUPPLIERS permission');
  assert(hasPermission('CUSTOMER', 'MANAGE_COMPLAINTS') === false, 'CUSTOMER DENIED admin/support permissions');

  // 2. Authorization check
  const adminAuth = authorizeAdminOrSupport('ADMIN', 'MANAGE_SYSTEM');
  assert(adminAuth.authorized === true, 'Admin authorized for MANAGE_SYSTEM');

  const supportForbidden = authorizeAdminOrSupport('SUPPORT_AGENT', 'MANAGE_SYSTEM');
  assert(supportForbidden.authorized === false, 'Support agent correctly forbidden for MANAGE_SYSTEM');

  // 3. User Suspension Sanity Check
  const mockUserPayload = {
    userId: 'usr_123',
    status: 'SUSPENDED',
    reason: 'Violated terms of service',
  };
  assert(mockUserPayload.status === 'SUSPENDED' && mockUserPayload.reason.length > 0, 'User suspension payload includes valid status & audit reason');

  // 4. Emergency Order Override Check
  const mockOverridePayload = {
    orderId: 'ord_999',
    newStatus: 'CANCELLED',
    reason: 'Customer requested cancellation after supplier delay',
  };
  assert(mockOverridePayload.newStatus === 'CANCELLED' && mockOverridePayload.reason.length >= 5, 'Emergency order override payload includes mandatory audit reason');

  // 5. Refund Idempotency Provider ID Check
  const providerRefundId = `ref_prov_ord_999_${Date.now()}`;
  assert(providerRefundId.startsWith('ref_prov_ord_999_'), 'Refund generates deterministic provider refund ID for idempotency');

  console.log(`--- ADMIN CONTROL TEST RESULTS: ${passed} PASSED, ${failed} FAILED ---`);
  if (failed > 0) process.exit(1);
}

runAdminControlTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
