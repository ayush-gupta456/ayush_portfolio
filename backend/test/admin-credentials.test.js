import test from 'node:test';
import assert from 'node:assert/strict';
import { credentialVersion } from '../src/admin-credentials.js';

test('session credential version survives restarts but changes on credential rotation', () => {
  const credentials = ['owner@example.com', 'test-password-only', 'JBSWY3DPEHPK3PXPTESTONLY'];
  const version = credentialVersion(...credentials);
  assert.equal(credentialVersion(...credentials), version);
  for (let index = 0; index < credentials.length; index++) {
    const changed = [...credentials];
    changed[index] += 'changed';
    assert.notEqual(credentialVersion(...changed), version);
  }
  assert.match(version, /^[a-f0-9]{64}$/);
});
