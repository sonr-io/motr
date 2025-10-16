// @ts-check

/**
 * This script generates the src/protobufs directory from the proto files in the
 * repos specified in `REPOS`. It uses `buf` to generate TS files from the proto
 * files, and then generates an `index.ts` file to re-export the generated code.
 */

import { spawnSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { globSync } from 'glob';
import { capitalize } from 'lodash-es';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

/**
 * @typedef Repo
 * @type {object}
 * @property {string} repo - Git repo and branch to clone (format: owner/repo#ref)
 * @property {string[]} paths - Paths to proto files relative to the repo root
 */

/**
 * @type {Repo[]}
 */
const REPOS = [
  {
    repo: 'cosmos/cosmos-sdk#v0.50.10',
    paths: ['proto'],
  },
  {
    repo: 'cometbft/cometbft#v0.38.12',
    paths: ['proto'],
  },
  {
    repo: 'cosmos/ibc-go#v8.5.1',
    paths: ['proto'],
  },
  {
    repo: 'confio/ics23#master',
    paths: ['proto'],
  },
  {
    repo: 'sonr-io/sonr#master',
    paths: ['proto'],
  },
  {
    repo: 'CosmWasm/wasmd#v0.53.0',
    paths: ['proto'],
  },
  {
    repo: 'osmosis-labs/osmosis#v27.0.0',
    paths: ['proto'],
  },
  {
    repo: 'evmos/ethermint#v0.22.0',
    paths: ['proto'],
  },
];

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROTOBUFS_DIR = join(__dirname, '..', 'src', 'protobufs');
const TMP_DIR = join(PROTOBUFS_DIR, '.tmp');
const MANIFEST_FILE = join(PROTOBUFS_DIR, '.manifest.json');

/** Generates a unique dirname from `repo` to use in `TMP_DIR`. */
const id = (/** @type {string} */ repo) => repo.replace(/[#/]/g, '-');

/**
 * Load the manifest file that tracks repository commit hashes
 * @returns {Record<string, string>} Map of repo ID to commit hash
 */
function loadManifest() {
  if (!existsSync(MANIFEST_FILE)) {
    return {};
  }
  try {
    const content = readFileSync(MANIFEST_FILE, 'utf8');
    return JSON.parse(content);
  } catch {
    console.warn('⚠️ Manifest load failed, starting fresh');
    return {};
  }
}

/**
 * Save the manifest file with updated repository commit hashes
 * @param {Record<string, string>} manifest
 */
function saveManifest(manifest) {
  try {
    writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
  } catch {
    console.warn('⚠️ Manifest save failed');
  }
}

/**
 * Get the current commit hash for a repository
 * @param {string} repoPath
 * @returns {string | null}
 */
function getCurrentCommitHash(repoPath) {
  try {
    const result = spawnSync('git', ['rev-parse', 'HEAD'], {
      cwd: repoPath,
      stdio: 'pipe',
      encoding: 'utf8',
    });
    if (result.status === 0) {
      return result.stdout.trim();
    }
  } catch {
    // Ignore errors for repositories without git
  }
  return null;
}

/**
 * Check if a repository has uncommitted changes
 * @param {string} repoPath
 * @returns {boolean}
 */
function isRepoDirty(repoPath) {
  try {
    const result = spawnSync('git', ['status', '--porcelain'], {
      cwd: repoPath,
      stdio: 'pipe',
      encoding: 'utf8',
    });
    if (result.status === 0) {
      return result.stdout.trim().length > 0;
    }
  } catch {
    // Ignore errors for repositories without git
  }
  return false;
}

/**
 * Check if ghq is available
 * @returns {boolean}
 */
function isGhqAvailable() {
  const result = spawnSync('ghq', ['--version'], { stdio: 'pipe', encoding: 'utf8' });
  return result.status === 0;
}

/**
 * Get ghq root directory
 * @returns {string | null}
 */
function getGhqRoot() {
  const result = spawnSync('ghq', ['root'], { stdio: 'pipe', encoding: 'utf8' });
  if (result.status === 0) {
    return result.stdout.trim();
  }
  return null;
}

/**
 * Gets repository using ghq or falls back to git clone
 * @param {string} repo - Repository string (format: owner/repo#ref)
 * @param {string} dest - Destination directory (used only for git clone fallback)
 * @param {boolean} useGhq - Whether to use ghq
 * @param {string | null} ghqRoot - ghq root directory
 * @returns {{ success: boolean, path: string | null }} - Result with path
 */
function getRepo(repo, dest, useGhq, ghqRoot) {
  const [repoPath, ref] = repo.split('#');

  if (useGhq && ghqRoot) {
    // Use ghq to get the repo
    const args = ['get', '-u', '--shallow'];

    if (ref && ref !== 'master' && ref !== 'main') {
      args.push('--branch', ref);
    }

    args.push(`github.com/${repoPath}`);

    console.log(`  📦 ${repo}...`);
    const result = spawnSync('ghq', args, {
      stdio: 'pipe',
      encoding: 'utf8',
      env: {
        ...process.env,
        GIT_LFS_SKIP_SMUDGE: '1',
      },
    });

    if (result.status !== 0) {
      console.error(`  ✗ Failed to get ${repo}: ${result.stderr.trim()}`);
      return { success: false, path: null };
    }

    // Build the path to the repo in ghq
    const repoPathInGhq = join(ghqRoot, 'github.com', repoPath);

    // Checkout the specific ref if needed
    if (ref && ref !== 'master' && ref !== 'main') {
      const checkoutResult = spawnSync('git', ['checkout', ref], {
        cwd: repoPathInGhq,
        stdio: 'pipe',
        encoding: 'utf8',
      });

      if (checkoutResult.status !== 0) {
        console.warn(`  ⚠ Could not checkout ${ref}, using default branch`);
      }
    }

    console.log(`  ✓ ${repo}`);
    return { success: true, path: repoPathInGhq };
  }

  // Fallback to git clone
  const gitUrl = `https://github.com/${repoPath}.git`;
  const args = [
    'clone',
    '--depth', '1',
    '--single-branch',
    // Disable LFS filter to avoid git-lfs dependency - use cat as no-op
    '-c', 'filter.lfs.smudge=cat',
    '-c', 'filter.lfs.process=',
    '-c', 'filter.lfs.required=false',
  ];

  if (ref) {
    args.push('--branch', ref);
  }

  args.push(gitUrl, dest);

   console.log(`  📥 ${repo}...`);
   const result = spawnSync('git', args, {
     stdio: 'pipe',
     encoding: 'utf8',
     env: {
       ...process.env,
       GIT_LFS_SKIP_SMUDGE: '1',
     },
   });

   if (result.status !== 0) {
     console.error(`  ✗ Failed to clone ${repo}: ${result.stderr.trim()}`);
     return { success: false, path: null };
   }

   console.log(`  ✓ ${repo}`);
   return { success: true, path: dest };
}

// Check if ghq is available
const useGhq = isGhqAvailable();
const ghqRoot = useGhq ? getGhqRoot() : null;

// Load manifest early to check for changes before any cleanup
const manifest = loadManifest();

console.log('🔧 Initialising...');
{
  // Only need TMP_DIR if not using ghq
  if (!useGhq) {
    rmSync(TMP_DIR, { recursive: true, force: true });
    mkdirSync(TMP_DIR, { recursive: true });
  }
  mkdirSync(PROTOBUFS_DIR, { recursive: true });
}

console.log(useGhq && ghqRoot ? `📦 Using ghq (${ghqRoot})` : '📥 Using git clone');

console.log('📥 Fetching repos...');
/** @type {Map<string, string>} */
const repoPaths = new Map();
/** @type {Set<string>} */
const skippedRepos = new Set();
{
  let successCount = 0;
  let failCount = 0;
  let skippedCount = 0;
  let dirtyCount = 0;

  for (const { repo } of REPOS) {
    const repoId = id(repo);
    const result = getRepo(repo, join(TMP_DIR, repoId), useGhq, ghqRoot);
    if (result.success && result.path) {
      // Check if repo has uncommitted changes
      if (isRepoDirty(result.path)) {
        console.log(`  ⚠️ ${repo} (dirty)`);
        skippedRepos.add(repo);
        dirtyCount++;
        continue;
      }

      const currentCommit = getCurrentCommitHash(result.path);
      const lastCommit = manifest[repoId];

      if (currentCommit && lastCommit === currentCommit) {
        console.log(`  ⏭️  ${repo} (no changes)`);
        skippedRepos.add(repo);
        skippedCount++;
      } else {
        repoPaths.set(repo, result.path);
        successCount++;
      }
    } else {
      failCount++;
    }
  }

  console.log(`\n📊 Repo summary: ${successCount} to process, ${skippedCount} skipped, ${dirtyCount} dirty, ${failCount} failed\n`);

  if (successCount === 0 && failCount > 0) {
    console.error('❌ All repos failed');
    process.exit(1);
  }
}

// Only clean if ALL repos need processing (fresh build)
// Otherwise, buf will overwrite only the changed files
if (repoPaths.size === REPOS.length) {
  console.log('🧹 Cleaning directories...');
  {
    // Clean directories for regenerated repos
    const dirsToClean = [
      'cosmos',
      'tendermint',
      'ibc',
      'cosmwasm',
      'osmosis',
      'ethermint',
      'sonr',
    ];

    for (const dir of dirsToClean) {
      const dirPath = join(PROTOBUFS_DIR, dir);
      rmSync(dirPath, { recursive: true, force: true });
    }
  }
} else if (repoPaths.size > 0) {
  console.log('ℹ️ Incremental update, keeping existing files');
} else {
  console.log('ℹ️ No repos need processing');
}

// Only generate types if there are repos that need processing
if (repoPaths.size > 0) {
  console.log('⚙️ Generating types...');
  {
    let processedCount = 0;

    for (const { repo, paths } of REPOS) {
      const repoDir = repoPaths.get(repo);

      // Skip if repo wasn't retrieved successfully
      if (!repoDir || !existsSync(repoDir)) {
        if (skippedRepos.has(repo)) {
          console.log(`  ⏭️ ${repo} (unchanged)`);
        } else {
          console.log(`⚠️ ${repo} (failed)`);
        }
        continue;
      }

      const repoId = id(repo);
      const currentCommit = getCurrentCommitHash(repoDir);

      for (const path of paths) {
        const protoPath = join(repoDir, path);

        if (!existsSync(protoPath)) {
          console.log(`⚠️ ${repo} proto not found`);
          continue;
        }

        // Don't use subdirectories - all protobufs go to same level
        // This ensures relative imports work correctly
        let outputSubdir = '';

        const result = spawnSync(
          'pnpm',
          [
            'buf',
            'generate',
            protoPath,
            '--output',
            join(PROTOBUFS_DIR, outputSubdir),
          ],
          {
            stdio: 'inherit',
            encoding: 'utf8',
          }
        );

        if (result.status !== 0) {
          console.error(`⚠️ ${repo} generation failed`);
          continue;
        }
      }

      // Update manifest with current commit hash after successful generation
      if (currentCommit) {
        manifest[repoId] = currentCommit;
      }

      console.log(`  ✓ ${repo}`);
      processedCount++;
    }

    if (processedCount === 0) {
      console.log('ℹ️ No repos processed');
    }
  }
} else {
  console.log('ℹ️ No repos need processing, skipping generation');
}

// Only generate index and save manifest if there were changes
if (repoPaths.size > 0) {
  console.log('📝 Generating index...');
  {
    const LAST_SEGMENT_REGEX = /[^/]+$/;
    const EXPORTED_NAME_REGEX = /^export \w+ (\w+) /gm;
    let contents = '/** This file is generated by gen-protobufs.mjs. Do not edit. */\n\n';

    /**
     * Builds the `src/protobufs/index.ts` file to re-export generated code.
     * A prefix is added to the exported names to avoid name collisions.
     * The prefix is the names of the directories in `proto` leading up
     * to the directory of the exported code, concatenated in PascalCase.
     * For example, if the exported code is in `proto/foo/bar/goo.ts`, the
     * prefix will be `FooBar`.
     * @param {string} dir
     */
    function generateIndexExports(dir) {
      const files = globSync(join(dir, '*'));
      if (files.length === 0) {
        return;
      }

      const prefixName = dir
        .replace(PROTOBUFS_DIR + '/', '')
        .split('/')
        .map((name) =>
          // convert all names to PascalCase
          name
            .split(/[-_]/)
            .map(capitalize)
            .join('')
        )
        .join('');

      for (const file of files) {
        const fileName = file.match(LAST_SEGMENT_REGEX)?.[0];
        if (!fileName) {
          console.error('Could not find name for', file);
          continue;
        }
        if (!fileName.endsWith('.ts')) {
          continue;
        }

        const code = readFileSync(file, 'utf8');
        contents += `export {\n`;
        for (const match of code.matchAll(EXPORTED_NAME_REGEX)) {
          const exportedName = match[1];
          contents += `  ${exportedName} as ${prefixName + exportedName},\n`;
        }
        const exportedFile = file.replace(PROTOBUFS_DIR + '/', '').replace('.ts', '.js');
        contents += `} from "@/protobufs/${exportedFile}";\n`;
      }

      for (const file of files) {
        generateIndexExports(file);
      }
    }

    generateIndexExports(PROTOBUFS_DIR);
    writeFileSync(join(PROTOBUFS_DIR, 'index.ts'), contents);
  }

  console.log('💾 Saving manifest...');
  {
    saveManifest(manifest);
  }
} else {
  console.log('ℹ️ No changes, skipping index and manifest update');
}

console.log('🧹 Cleanup...');
{
  // Only clean TMP_DIR if we used git clone (not ghq)
  if (!useGhq) {
    rmSync(TMP_DIR, { recursive: true, force: true });
  }
}

console.log('✅ Done!');
