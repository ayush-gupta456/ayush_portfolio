import test from 'node:test';
import assert from 'node:assert/strict';
import { featuredProjects, refreshProjects, PROJECT_CATALOG_VERSION } from '../../shared/project-catalog.js';
import { migrateProjectCatalog } from '../src/project-catalog.js';

test('legacy projects gain current featured projects without losing images or extra work', () => {
  const old = [{ title: 'InsightCode', source: 'https://github.com/ayush-gupta456/InsightCode/', description: 'Old copy', imageUrl: 'https://example.com/preview.png' }, { title: 'PassOp', source: 'https://github.com/ayush-gupta456/pass_op' }];
  const result = refreshProjects(old);
  assert.deepEqual(result.map(p => p.title), ['Raaga', 'InsightCode', 'PassOp']);
  assert.equal(result[1].imageUrl, old[0].imageUrl);
  assert.equal(result[1].description, featuredProjects[1].description);
  assert.equal(old[0].description, 'Old copy');
  assert.deepEqual(refreshProjects(result), result);
  assert.deepEqual(result.map(p => p.number), ['01', '02', '03']);
});

test('current catalog respects admin edits and intentional project removal', () => {
  const edited = [{ title: 'My renamed project', source: featuredProjects[0].source, description: 'Updated by admin' }];
  assert.equal(refreshProjects(edited, PROJECT_CATALOG_VERSION), edited);
  assert.deepEqual(refreshProjects([], PROJECT_CATALOG_VERSION), []);
});

test('migration updates only projects and version, and is applied once', async () => {
  let doc = { _id: 'profile', document: { name: 'Ayush', projects: [] }, version: 7 };
  let writes = 0;
  const collection = {
    findOne: async () => structuredClone(doc),
    updateOne: async (filter, update) => {
      assert.equal(filter.version, doc.version);
      writes++;
      doc.document.projects = update.$set['document.projects'];
      doc.projectCatalogVersion = update.$set.projectCatalogVersion;
      doc.version += update.$inc.version;
      return { matchedCount: 1 };
    },
  };
  await migrateProjectCatalog(collection);
  assert.equal(doc.document.name, 'Ayush');
  assert.equal(doc.version, 8);
  assert.equal(doc.document.projects.length, 2);
  doc.document.projects = [];
  await migrateProjectCatalog(collection);
  assert.equal(writes, 1);
  assert.deepEqual(doc.document.projects, []);
});

test('migration retries a concurrent admin edit using the fresh profile version', async () => {
  let reads = 0;
  const collection = {
    findOne: async () => ({ version: ++reads, document: { projects: reads === 1 ? [] : [{ title: 'New work', source: 'https://example.com/project' }] } }),
    updateOne: async (filter, update) => {
      if (filter.version === 1) return { matchedCount: 0 };
      assert.equal(update.$set['document.projects'][2].title, 'New work');
      return { matchedCount: 1 };
    },
  };
  await migrateProjectCatalog(collection);
  assert.equal(reads, 2);
});
