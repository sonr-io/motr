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

/** Generates a unique dirname from `repo` to use in `TMP_DIR`. */
const id = (/** @type {string} */ repo) => repo.replace(/[#/]/g, '-');

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

    console.log(`  Getting ${repo} via ghq...`);
    const result = spawnSync('ghq', args, {
      stdio: 'pipe',
      encoding: 'utf8',
      env: {
        ...process.env,
        GIT_LFS_SKIP_SMUDGE: '1',
      },
    });

    if (result.status !== 0) {
      console.error(`  ✗ Failed to get ${repo} via ghq:`, result.stderr);
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

    console.log(`  ✓ ${repo} (ghq cache)`);
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

  console.log(`  Cloning ${repo}...`);
  const result = spawnSync('git', args, {
    stdio: 'pipe',
    encoding: 'utf8',
    env: {
      ...process.env,
      GIT_LFS_SKIP_SMUDGE: '1',
    },
  });

  if (result.status !== 0) {
    console.error(`  ✗ Failed to clone ${repo}:`, result.stderr);
    return { success: false, path: null };
  }

  console.log(`  ✓ ${repo}`);
  return { success: true, path: dest };
}

// Check if ghq is available
const useGhq = isGhqAvailable();
const ghqRoot = useGhq ? getGhqRoot() : null;

console.log('🔧 Initialising directories...');
{
  // Only need TMP_DIR if not using ghq
  if (!useGhq) {
    rmSync(TMP_DIR, { recursive: true, force: true });
    mkdirSync(TMP_DIR, { recursive: true });
  }
  mkdirSync(PROTOBUFS_DIR, { recursive: true });

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

if (useGhq && ghqRoot) {
  console.log(`📦 Using ghq for repo management (root: ${ghqRoot})`);
} else {
  console.log('📥 Using git clone for repo management');
}

console.log('📥 Getting required repos...');
/** @type {Map<string, string>} */
const repoPaths = new Map();
{
  let successCount = 0;
  let failCount = 0;

  for (const { repo } of REPOS) {
    const result = getRepo(repo, join(TMP_DIR, id(repo)), useGhq, ghqRoot);
    if (result.success && result.path) {
      repoPaths.set(repo, result.path);
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log(`\n📊 Repo summary: ${successCount} succeeded, ${failCount} failed\n`);

  if (successCount === 0) {
    console.error('❌ All repository operations failed. Cannot continue.');
    process.exit(1);
  }
}

console.log('⚙️  Generating TS files from proto files...');
{
  for (const { repo, paths } of REPOS) {
    const repoDir = repoPaths.get(repo);

    // Skip if repo wasn't retrieved successfully
    if (!repoDir || !existsSync(repoDir)) {
      console.log(`⚠️  Skipping ${repo} (not available)`);
      continue;
    }

    for (const path of paths) {
      const protoPath = join(repoDir, path);

      if (!existsSync(protoPath)) {
        console.log(`⚠️  Proto path ${protoPath} not found, skipping`);
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
        console.error(`⚠️  buf generate failed for ${repo}`);
        continue;
      }
    }
    console.log(`✔️  [${repo}]`);
  }
}

console.log('📝 Generating src/protobufs/index.ts file...');
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

console.log('🧹 Cleaning up...');
{
  // Only clean TMP_DIR if we used git clone (not ghq)
  if (!useGhq) {
    rmSync(TMP_DIR, { recursive: true, force: true });
  }
}

console.log('✅ Proto generation completed successfully!');
