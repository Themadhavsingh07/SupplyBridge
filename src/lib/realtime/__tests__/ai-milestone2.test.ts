import { searchIntentSchema, parseNaturalLanguageSearchIntent, extractSearchIntentWithAI } from '../../ai/ai-search';
import { calculateHaversineDistance, executeSearch } from '../../../server/services/search.service';

async function runMilestone2Tests() {
  console.log('====================================================');
  console.log('   SUPPLYBRIDGE — MILESTONE 2 SMART SEARCH TESTS   ');
  console.log('====================================================\n');

  // Test 1: Natural Language Intent Parsing & Extractor
  console.log('[1] Testing Natural Language Intent Parsing...');
  const intent1 = parseNaturalLanguageSearchIntent('cheap breakfast items under ₹500');
  console.log('Intent 1 output:', intent1);
  if (intent1.maxPrice !== 500) throw new Error('Failed to parse budget 500');
  if (intent1.sortBy !== 'PRICE_ASC') throw new Error('Failed to parse cheap keyword to PRICE_ASC sort');

  const intent2 = parseNaturalLanguageSearchIntent('products between 100 and 300 from verified suppliers');
  console.log('Intent 2 output:', intent2);
  if (intent2.minPrice !== 100 || intent2.maxPrice !== 300) throw new Error('Failed to parse price range 100-300');
  if (!intent2.supplierVerified) throw new Error('Failed to parse verified supplier flag');
  console.log('✅ Natural Language Intent Parsing PASSED\n');

  // Test 2: Zod Search Schema Validation
  console.log('[2] Testing Zod Search Schema Validation...');
  const validPayload = searchIntentSchema.parse({
    query: 'milk',
    maxPrice: 200,
    minRating: 4.5,
    inStock: true,
    sortBy: 'RATING_DESC',
    page: 1,
    limit: 20,
  });
  console.log('Validated Zod payload:', validPayload);

  let invalidCaught = false;
  try {
    searchIntentSchema.parse({
      minRating: 10, // Invalid: rating must be between 0 and 5
    });
  } catch (err) {
    invalidCaught = true;
  }
  if (!invalidCaught) throw new Error('Zod failed to reject invalid minRating > 5');
  console.log('✅ Zod Search Schema Validation PASSED\n');

  // Test 3: Haversine Distance Calculation
  console.log('[3] Testing Haversine Distance Calculation...');
  // Distance between Mumbai (19.0760, 72.8777) and Pune (18.5204, 73.8567) ~ 120km
  const dist = calculateHaversineDistance(19.076, 72.8777, 18.5204, 73.8567);
  console.log(`Straight-line distance Mumbai to Pune: ${dist} km`);
  if (dist < 100 || dist > 150) throw new Error('Haversine distance calculation error');
  console.log('✅ Haversine Distance Calculation PASSED\n');

  // Test 4: AI Intent Extraction with Fallback
  console.log('[4] Testing AI Intent Extraction with Fallback...');
  const aiExtracted = await extractSearchIntentWithAI('best snacks under 300');
  console.log('AI Extracted Intent:', aiExtracted);
  if (aiExtracted.maxPrice !== 300) throw new Error('AI intent extraction budget mismatch');
  console.log('✅ AI Intent Extraction PASSED\n');

  // Test 5: Deterministic Product Search Execution
  console.log('[5] Testing Deterministic Product Search Execution...');
  const searchResult = await executeSearch({
    query: 'milk',
    maxPrice: 500,
    inStock: true,
    page: 1,
    limit: 10,
    sortBy: 'RELEVANCE',
  });
  console.log('Search execution result summary:', {
    query: searchResult.query,
    resultsCount: searchResult.results.length,
    pagination: searchResult.pagination,
  });
  if (!searchResult.pagination) throw new Error('Pagination object missing from search result');
  console.log('✅ Deterministic Product Search Execution PASSED\n');

  console.log('====================================================');
  console.log('🎉 ALL MILESTONE 2 ACCEPTANCE TESTS PASSED!');
  console.log('====================================================');
}

runMilestone2Tests().catch((err) => {
  console.error('❌ MILESTONE 2 TEST FAILED:', err);
  process.exit(1);
});
