/**
 * Simple test script to verify cache functionality
 * Run with: npx ts-node test-cache.ts
 */

import { generateQuestionHash } from './src/utils/hashUtils';
import { CacheService } from './src/services/CacheService';

async function testCache() {
  console.log('🧪 Testing Cache Functionality\n');

  const cacheService = new CacheService();

  // Test 1: Hash generation
  console.log('Test 1: Hash Generation');
  const question1 = 'Apa itu AI?';
  const question2 = 'apa itu ai?'; // Same question, different case
  const question3 = 'Apa  itu  AI?'; // Same question, extra spaces
  
  const hash1 = generateQuestionHash(question1);
  const hash2 = generateQuestionHash(question2);
  const hash3 = generateQuestionHash(question3);
  
  console.log(`  "${question1}" -> ${hash1.substring(0, 16)}...`);
  console.log(`  "${question2}" -> ${hash2.substring(0, 16)}...`);
  console.log(`  "${question3}" -> ${hash3.substring(0, 16)}...`);
  console.log(`  ✅ All hashes match: ${hash1 === hash2 && hash2 === hash3}\n`);

  // Test 2: Cache miss
  console.log('Test 2: Cache Miss');
  const testQuestion = 'Test question for cache ' + Date.now();
  const cachedResult1 = await cacheService.getCachedResponse(testQuestion);
  console.log(`  Cache result: ${cachedResult1 === null ? '❌ MISS (expected)' : '✅ HIT'}\n`);

  // Test 3: Save to cache
  console.log('Test 3: Save to Cache');
  const testAnswer = 'This is a test answer';
  await cacheService.saveCachedResponse(testQuestion, testAnswer, 1); // 1 hour TTL
  console.log(`  ✅ Saved to cache\n`);

  // Test 4: Cache hit
  console.log('Test 4: Cache Hit');
  const cachedResult2 = await cacheService.getCachedResponse(testQuestion);
  console.log(`  Cache result: ${cachedResult2 === testAnswer ? '✅ HIT (expected)' : '❌ MISS'}`);
  console.log(`  Answer matches: ${cachedResult2 === testAnswer ? '✅ YES' : '❌ NO'}\n`);

  // Test 5: Cleanup
  console.log('Test 5: Cleanup Expired Cache');
  const deletedCount = await cacheService.cleanupExpiredCache();
  console.log(`  Deleted ${deletedCount} expired entries\n`);

  console.log('✅ All tests completed!');
  process.exit(0);
}

testCache().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
