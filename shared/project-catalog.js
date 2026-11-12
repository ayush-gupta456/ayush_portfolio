// Repository-verified content refresh. Later admin edits remain authoritative.
export const PROJECT_CATALOG_VERSION = 1;

export const featuredProjects = [
  {
    number: '01', title: 'Raaga', type: 'AI music studio',
    description: 'Your words. Your sound. A lyrics-first music studio with personal ACE Music keys, vocal or instrumental generation, and a focused listening room. Preview and download each song before the session ends.',
    stack: ['React', 'TypeScript', 'Express', 'MongoDB', 'Better Auth', 'ACE Music'],
    live: 'https://raaga-studio.vercel.app/',
    source: 'https://github.com/ayush-gupta456/Raaga-ai-powered-music', visual: 'raaga',
  },
  {
    number: '02', title: 'InsightCode', type: 'Code review workspace',
    description: 'Review with evidence. Explore source-linked findings, import GitHub repositories and pull requests, and add optional Gemini assistance. Preview and approve fixes in an isolated snapshot before publishing changes.',
    stack: ['React', 'TypeScript', 'Express', 'MongoDB', 'Gemini', 'GitHub API'],
    live: 'https://insightcode.vercel.app/',
    source: 'https://github.com/ayush-gupta456/InsightCode', visual: 'insight',
  },
];

const sourceKey = project => project.source?.replace(/\/+$/, '').toLowerCase();

export function refreshProjects(projects = [], catalogVersion = 0) {
  if (catalogVersion >= PROJECT_CATALOG_VERSION) return projects;
  const featured = featuredProjects.map(project => ({
    ...projects.find(existing => sourceKey(existing) === sourceKey(project)),
    ...project,
  }));
  const others = projects.filter(project => !featured.some(item => sourceKey(item) === sourceKey(project)));
  return [...featured, ...others].map((project, index) => ({ ...project, number: String(index + 1).padStart(2, '0') }));
}
