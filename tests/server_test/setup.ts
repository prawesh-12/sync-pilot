// server/config.ts throws at import time when SYNC_SECRET is unset, so every
// test process gets a placeholder before any module under test is loaded.
process.env.SYNC_SECRET ??= "test-sync-secret";
