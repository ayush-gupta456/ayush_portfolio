import { PROJECT_CATALOG_VERSION, refreshProjects } from '../../shared/project-catalog.js';

export async function migrateProjectCatalog(collection) {
  // Optimistic locking protects admin edits made while a new API instance starts.
  for (let attempt = 0; attempt < 3; attempt++) {
    const doc = await collection.findOne({ _id: 'profile' });
    if (!doc || doc.projectCatalogVersion >= PROJECT_CATALOG_VERSION) return;
    const result = await collection.updateOne(
      { _id: 'profile', version: doc.version, projectCatalogVersion: { $ne: PROJECT_CATALOG_VERSION } },
      { $set: {
        'document.projects': refreshProjects(doc.document.projects),
        projectCatalogVersion: PROJECT_CATALOG_VERSION,
        updatedAt: new Date(),
      }, $inc: { version: 1 } },
    );
    if (result.matchedCount) return;
  }
  throw new Error('Project refresh conflicted with another edit. Restart the API to retry safely.');
}
