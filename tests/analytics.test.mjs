import assert from 'node:assert/strict';
import test from 'node:test';
import { createAnalytics } from '../src/analytics/analytics.js';

function bridge(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    platform: 'android',
    async loadSetting(key) { return values.get(key) ?? null; },
    async saveSetting(key, value) { values.set(key, value); },
  };
}

const buildInfo = {
  appVersion: '0.4.0',
  iosBuildNumber: 2,
  androidVersionCode: 2,
  buildId: '0.4.0+2.test',
  contentVersion: 'test-content',
  integrity: {verified: true},
};

test('analytics records only approved properties and no coordinates', async () => {
  globalThis.location = {search: ''};
  const analytics = createAnalytics({bridge: bridge(), buildInfo, now: () => 1000});
  await analytics.initialize();
  await analytics.track('path_missed', {
    teddy_id: 'tt01',
    input_type: 'touch',
    response_ms: 95,
    x: 200,
    y: 300,
    email: 'not-allowed@example.com',
  });
  const event = analytics.getEvents().at(-1);
  assert.equal(event.event_name, 'path_missed');
  assert.equal(event.properties.teddy_id, 'tt01');
  assert.equal(event.properties.input_type, 'touch');
  assert.equal('x' in event.properties, false);
  assert.equal('y' in event.properties, false);
  assert.equal('email' in event.properties, false);
});

test('analytics rejects unapproved event names', async () => {
  globalThis.location = {search: ''};
  const analytics = createAnalytics({bridge: bridge(), buildInfo});
  await analytics.initialize();
  await assert.rejects(() => analytics.track('raw_touch_move', {}), /Unapproved analytics event/);
});

test('research export states privacy limits', async () => {
  globalThis.location = {search: '?research=1'};
  const analytics = createAnalytics({bridge: bridge(), buildInfo, now: () => 2000});
  await analytics.initialize();
  const data = await analytics.exportResearchData();
  assert.equal(data.research_build, true);
  assert.equal(data.privacy.contains_raw_touch_coordinates, false);
  assert.equal(data.privacy.contains_name_email_or_account_id, false);
  assert.equal(data.privacy.transmission, 'local_export_only');
});
