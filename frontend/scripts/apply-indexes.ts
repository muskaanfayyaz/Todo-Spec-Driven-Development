/**
 * Apply Database Index Migration
 *
 * This script adds missing foreign key indexes to Better Auth tables.
 * Safe to run multiple times (uses IF NOT EXISTS).
 *
 * Usage:
 *   npx tsx scripts/apply-indexes.ts
 */

import { getPool, closePool } from '../lib/db-pool';
import * as fs from 'fs';
import * as path from 'path';

async function applyMigration() {
  console.log('🔍 Applying database index migration...\n');

  const pool = getPool();

  try {
    // Read migration SQL
    const migrationPath = path.join(__dirname, '../migrations/001_add_fk_indexes.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('📄 Migration file:', migrationPath);
    console.log('📊 Database:', process.env.DATABASE_URL?.split('@')[1]?.split('/')[0]);
    console.log();

    // Execute migration
    console.log('⚙️  Executing migration...');
    await pool.query(migrationSQL);
    console.log('✅ Migration applied successfully!\n');

    // Verify indexes were created
    console.log('🔍 Verifying indexes...');
    const result = await pool.query(`
      SELECT schemaname, tablename, indexname, indexdef
      FROM pg_indexes
      WHERE tablename IN ('session', 'account')
        AND indexname LIKE 'idx_%'
      ORDER BY tablename, indexname
    `);

    if (result.rows.length === 0) {
      console.warn('⚠️  Warning: No indexes found. Migration may have failed.');
    } else {
      console.log('\n📋 Indexes created:');
      result.rows.forEach((row: any) => {
        console.log(`  ✓ ${row.tablename}.${row.indexname}`);
      });
    }

    console.log('\n✨ Done!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

applyMigration();
