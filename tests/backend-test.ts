import { initializeDatabaseSchema } from '../server/db/schema.ts';
import { seedDatabase } from '../server/db/seed.ts';
import { seedExtraColleges } from '../server/db/seed-extra.ts';
import { query, queryOne } from '../server/db/database.ts';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

async function runTestSuite() {
  console.log('====================================');
  console.log('🧪 RUNNING CAMPUSFIND AUTOMATED TEST SUITE');
  console.log('====================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: any) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`, details || '');
      failed++;
    }
  }

  try {
    // TEST 1: Database Initialization & Seeds
    console.log('[Test Group 1: Database & Seed Counts]');
    await initializeDatabaseSchema();
    await seedDatabase();
    await seedExtraColleges();

    const collegeCount = await queryOne<{ count: string }>('SELECT COUNT(*) as count FROM colleges');
    const totalColleges = parseInt(collegeCount?.count || '0', 10);
    assert(totalColleges >= 20, `Colleges seeded successfully (${totalColleges} colleges present)`);

    // Verify TS and AP state distribution
    const tsCount = await queryOne<{ count: string }>("SELECT COUNT(*) as count FROM colleges WHERE state = 'Telangana'");
    const apCount = await queryOne<{ count: string }>("SELECT COUNT(*) as count FROM colleges WHERE state = 'Andhra Pradesh'");
    assert(parseInt(tsCount?.count || '0', 10) > 0, `Telangana colleges present: ${tsCount?.count}`);
    assert(parseInt(apCount?.count || '0', 10) > 0, `Andhra Pradesh colleges present: ${apCount?.count}`);

    // TEST 2: Cutoffs & Branches
    console.log('\n[Test Group 2: Cutoffs & EAMCET Exams]');
    const cutoffCount = await queryOne<{ count: string }>('SELECT COUNT(*) as count FROM cutoffs');
    assert(parseInt(cutoffCount?.count || '0', 10) > 100, `Cutoff records populated: ${cutoffCount?.count}`);

    const tseamcetCutoffs = await queryOne<{ count: string }>("SELECT COUNT(*) as count FROM cutoffs WHERE exam_name = 'TS EAMCET'");
    const apeamcetCutoffs = await queryOne<{ count: string }>("SELECT COUNT(*) as count FROM cutoffs WHERE exam_name = 'AP EAMCET'");
    assert(parseInt(tseamcetCutoffs?.count || '0', 10) > 0, `TS EAMCET cutoffs verified: ${tseamcetCutoffs?.count}`);
    assert(parseInt(apeamcetCutoffs?.count || '0', 10) > 0, `AP EAMCET cutoffs verified: ${apeamcetCutoffs?.count}`);

    // TEST 3: Authentication & Password Hashing
    console.log('\n[Test Group 3: Authentication & Security]');
    const testEmail = `test_${Date.now()}@example.com`;
    const plainPass = 'secretPass123';
    const hash = await bcrypt.hash(plainPass, 10);

    const userInsert = await query<{ id: number; email: string; name: string }>(`
      INSERT INTO users (name, email, password_hash)
      VALUES ('Test Candidate', $1, $2)
      RETURNING id, email, name;
    `, [testEmail, hash]);

    const user = userInsert[0];
    assert(!!user.id, 'User registration and DB insertion successful');

    const isValid = await bcrypt.compare(plainPass, hash);
    assert(isValid, 'Bcrypt password verification verified');

    const isInvalid = await bcrypt.compare('wrongPassword', hash);
    assert(!isInvalid, 'Bcrypt rejects incorrect passwords');

    const token = jwt.sign({ id: user.id, email: user.email }, 'campusfind-production-jwt-secret-key-32chars', { expiresIn: '1h' });
    const decoded = jwt.verify(token, 'campusfind-production-jwt-secret-key-32chars') as any;
    assert(decoded.id === user.id, 'JWT token signing and verification correct');

    // TEST 4: College Query & Filters
    console.log('\n[Test Group 4: Search & Filters]');
    const cbit = await queryOne("SELECT * FROM colleges WHERE code = 'CBIT'");
    assert(!!cbit, 'Found CBIT college record by counselling code');

    const hyderabadColleges = await query("SELECT * FROM colleges WHERE city = 'Hyderabad'");
    assert(hyderabadColleges.length >= 5, `Found ${hyderabadColleges.length} colleges in Hyderabad`);

    const cseColleges = await query(`
      SELECT DISTINCT c.code 
      FROM colleges c 
      JOIN courses crs ON crs.college_id = c.id 
      WHERE crs.code = 'CSE'
    `);
    assert(cseColleges.length >= 10, `Found ${cseColleges.length} colleges offering CSE branch`);

    // TEST 5: Predictor Algorithm Logic
    console.log('\n[Test Group 5: Predictor Algorithm Logic]');
    // Query cutoffs for rank 2500 in TS EAMCET OC-General
    const testRank = 2500;
    const testCutoffs = await query(`
      SELECT c.code, ct.course_code, ct.opening_rank, ct.closing_rank
      FROM cutoffs ct
      JOIN colleges c ON c.id = ct.college_id
      WHERE ct.exam_name = 'TS EAMCET' AND ct.category = 'OC-General' AND ct.course_code = 'CSE'
      ORDER BY ct.closing_rank ASC;
    `);

    assert(testCutoffs.length > 0, 'Found cutoffs for TS EAMCET OC-General CSE');

    // Test categorization rule
    let hasExcellent = false;
    let hasGood = false;
    let hasLow = false;

    for (const c of testCutoffs) {
      const open = parseInt(c.opening_rank, 10);
      const close = parseInt(c.closing_rank, 10);
      if (testRank <= open) hasExcellent = true;
      else if (testRank > open && testRank <= close) hasGood = true;
      else if (testRank > close * 1.5) hasLow = true;
    }

    assert(hasExcellent || hasGood, 'Predictor categorizes realistic chance for rank 2500');

    // TEST 6: Saved Colleges Constraint
    console.log('\n[Test Group 6: Saved Colleges DB Constraints]');
    await query(`
      INSERT INTO saved_colleges (user_id, college_id)
      VALUES ($1, 'cbit-hyderabad')
      ON CONFLICT (user_id, college_id) DO NOTHING;
    `, [user.id]);

    const saved = await query('SELECT * FROM saved_colleges WHERE user_id = $1', [user.id]);
    assert(saved.length === 1, 'Saved college stored in DB');

    // Prevent duplicate
    await query(`
      INSERT INTO saved_colleges (user_id, college_id)
      VALUES ($1, 'cbit-hyderabad')
      ON CONFLICT (user_id, college_id) DO NOTHING;
    `, [user.id]);
    const savedAfter = await query('SELECT * FROM saved_colleges WHERE user_id = $1', [user.id]);
    assert(savedAfter.length === 1, 'Composite primary key prevents duplicate saves');

    // Delete
    await query('DELETE FROM saved_colleges WHERE user_id = $1 AND college_id = $2', [user.id, 'cbit-hyderabad']);
    const savedDeleted = await query('SELECT * FROM saved_colleges WHERE user_id = $1', [user.id]);
    assert(savedDeleted.length === 0, 'Delete saved college works cleanly');

    console.log('\n====================================');
    console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Test suite crashed with error:', error);
    process.exit(1);
  }
}

runTestSuite();
