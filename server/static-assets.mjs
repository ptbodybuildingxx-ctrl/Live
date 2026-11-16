// Explicit allowlist: never serve arbitrary paths or expose draft media publicly.
const rootAssets = {
  '/': 'index.html',
  '/index.html': 'index.html',
  '/app.css': 'app.css',
  '/app.js': 'app.js',
  '/i18n.js': 'i18n.js',
  '/logo.svg': 'logo.svg',
  '/privacy': 'privacy.html',
  '/terms': 'terms.html',
  '/policy.js': 'policy.js',
  '/robots.txt': 'robots.txt',
};

const languages = ['ar', 'en', 'sv'];
const styles = ['tokens', 'base', 'responsive', 'modules', 'training', 'components'];
const coreModules = [
  'api-client', 'modules', 'workspace', 'identity-ui', 'dashboard',
  'wellness-schema', 'wellness-ui', 'coaching-ui', 'club-ops-ui', 'club-chat-ui',
  'programs-ui', 'training-ui', 'exercise-catalog', 'xdraw-ui', 'training-templates',
  'nutrition-catalog', 'nutrition-ui', 'disclosures', 'health-ui', 'health-config',
  'health-insights', 'rehab-schema', 'rehab-ui', 'library-schema', 'library-ui',
  'campaign-ui', 'directory-ui', 'events-ui', 'master-admin-ui',
];

const drafts = new Set([
  'xdraw-engine', 'exercise-drawing-new', 'exercise-drawings', 'exercise-kinematics',
  'exercise-drawing-corrections', 'exercise-drawing-legacy-tracks',
  'exercise-drawing-anatomy', 'exercise-apparatus',
].map(name => `/core/${name}.js`));

const routes = new Map(Object.entries(rootAssets));
for (const language of languages) routes.set(`/languages/${language}.js`, `languages/${language}.js`);
for (const style of styles) routes.set(`/styles/${style}.css`, `styles/${style}.css`);
for (const module of coreModules) routes.set(`/core/${module}.js`, `core/${module}.js`);

export function staticAsset(pathname, production = false) {
  if (drafts.has(pathname)) return production ? null : { file: pathname.slice(1), draft: true };
  const file = routes.get(pathname);
  return file ? { file, draft: false } : null;
}

export const contentTypes = Object.freeze({
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
});
