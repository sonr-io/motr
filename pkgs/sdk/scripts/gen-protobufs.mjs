// @ts-check

/**
 * This script generates the src/protobufs directory from the proto files in the
 * repos specified in `REPOS`. It uses `buf` to generate TS files from the proto
 * files, and then generates an `index.ts` file to re-export the generated code.
 */

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { globSync } from 'glob';
import { capitalize } from 'lodash-es';

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
    repo: 'cosmos/cosmos-proto#v1.0.0-beta.5',
    paths: ['proto'],
  },
  {
    repo: 'cosmos/gogoproto#v1.7.0',
    paths: ['gogoproto'],
  },
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
const CACHE_DIR = join(homedir(), '.cache', 'motr-protos');
const MANIFEST_FILE = join(PROTOBUFS_DIR, '.manifest.json');

/** Generates a unique dirname from `repo` to use in `TMP_DIR`. */
const id = (/** @type {string} */ repo) => repo.replace(/[#/]/g, '-');

/**
 * Load the manifest file that tracks repository refs
 * @returns {Record<string, string>} Map of repo ID to ref
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
 * Save the manifest file with updated repository refs
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
 * Downloads proto files from a GitHub repository using gh download extension
 * @param {string} repo - Repository string (format: owner/repo#ref)
 * @param {string} path - Path to download (e.g., 'proto', 'gogoproto')
 * @param {string} dest - Destination directory
 * @returns {{ success: boolean, path: string | null }} - Result with path
 */
function downloadProtoFiles(repo, path, dest) {
  const [repoPath, ref] = repo.split('#');

  console.log(`  📥 ${repo} (${path})...`);

  // Create destination directory if it doesn't exist
  mkdirSync(dest, { recursive: true });

  // Use gh download to get the specified directory
  // Format: gh download owner/repo path --branch ref --outdir destination
  const args = ['download', repoPath, path, '--branch', ref, '--outdir', dest];

  const result = spawnSync('gh', args, {
    stdio: 'pipe',
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    const errorMsg = result.stderr.trim() || result.stdout.trim();
    console.error(`  ✗ Failed to download ${repo} (${path}): ${errorMsg}`);
    return { success: false, path: null };
  }

  // gh-download strips the directory prefix, so if we downloaded 'gogoproto',
  // the files end up directly in dest instead of dest/gogoproto
  // We need to restructure for non-'proto' paths
  if (path !== 'proto') {
    const subdir = join(dest, path);
    mkdirSync(subdir, { recursive: true });

    // Move .proto files into the subdirectory
    const { readdirSync, renameSync } = require('node:fs');
    const files = readdirSync(dest);
    for (const file of files) {
      if (file.endsWith('.proto')) {
        const src = join(dest, file);
        const dst = join(subdir, file);
        try {
          renameSync(src, dst);
        } catch (e) {
          // File might already be moved
        }
      }
    }
  }

  console.log(`  ✓ ${repo} (${path})`);
  return { success: true, path: dest };
}

// Load manifest early to check for changes before any cleanup
const manifest = loadManifest();

console.log('🔧 Initialising...');
{
  // Create cache and protobufs directories
  mkdirSync(CACHE_DIR, { recursive: true });
  mkdirSync(PROTOBUFS_DIR, { recursive: true });
}

console.log('📥 Using gh download extension');

console.log('📥 Fetching repos...');
/** @type {Map<string, string>} */
const repoPaths = new Map();
/** @type {Set<string>} */
const skippedRepos = new Set();
{
  let successCount = 0;
  let failCount = 0;
  let skippedCount = 0;

  for (const { repo, paths } of REPOS) {
    const repoId = id(repo);
    const [_repoPath, ref] = repo.split('#');
    const protoPath = paths[0]; // Use first path from paths array

    // Create a unique cache directory for this repo+ref combination
    const cacheDir = join(CACHE_DIR, repoId);

    // Check if we need to download by comparing refs in manifest
    const lastRef = manifest[repoId];

    if (lastRef === ref && existsSync(cacheDir)) {
      console.log(`  ⏭️  ${repo} (cached)`);
      repoPaths.set(repo, cacheDir);
      skippedRepos.add(repo);
      skippedCount++;
      continue;
    }

    // Clean the cache directory before downloading
    rmSync(cacheDir, { recursive: true, force: true });

    const result = downloadProtoFiles(repo, protoPath, cacheDir);
    if (result.success && result.path) {
      repoPaths.set(repo, result.path);
      // Update manifest with the ref
      manifest[repoId] = ref;
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log(
    `\n📊 Repo summary: ${successCount} to process, ${skippedCount} skipped, ${failCount} failed\n`
  );

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
      'amino',
      'cosmos',
      'cosmos_proto',
      'cosmwasm',
      'ethermint',
      'gogoproto',
      'google',
      'ibc',
      'osmosis',
      'sonr',
      'tendermint',
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

    for (const { repo } of REPOS) {
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

      // gh download puts the proto directory contents directly in repoDir
      // so we use repoDir as the protoPath
      const protoPath = repoDir;

      if (!existsSync(protoPath)) {
        console.log(`⚠️ ${repo} proto not found`);
        continue;
      }

      // Don't use subdirectories - all protobufs go to same level
      // This ensures relative imports work correctly
      const outputSubdir = '';

      const result = spawnSync(
        'bunx',
        ['buf', 'generate', protoPath, '--output', join(PROTOBUFS_DIR, outputSubdir)],
        {
          stdio: 'pipe',
          encoding: 'utf8',
        }
      );

      if (result.status !== 0 || result.error) {
        const errorMsg = (result.stderr || result.stdout || result.error?.message || '').trim();
        console.error(`⚠️ ${repo} generation failed: ${errorMsg}`);
        continue;
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
    const EXPORTED_TYPE_REGEX = /^export type (\w+) /gm;
    const EXPORTED_CONST_REGEX = /^export const (\w+)/gm;
    const EXPORTED_CLASS_REGEX = /^export class (\w+)/gm;
    const EXPORTED_ENUM_REGEX = /^export enum (\w+)/gm;
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

      const relativePath = dir.replace(PROTOBUFS_DIR, '').replace(/^\//, '');
      const prefixName = relativePath
        ? relativePath
            .split('/')
            .map((name) =>
              // convert all names to PascalCase
              name
                .split(/[-_.]/)
                .filter((part) => part.length > 0)
                .map(capitalize)
                .join('')
            )
            .join('')
        : '';

      for (const file of files) {
        const fileName = file.match(LAST_SEGMENT_REGEX)?.[0];
        if (!fileName) {
          console.error('Could not find name for', file);
          continue;
        }
        if (!fileName.endsWith('.ts')) {
          continue;
        }

        // Skip files at the proto root (no prefix)
        if (!relativePath) {
          continue;
        }

        const code = readFileSync(file, 'utf8');
        const exportedFile = file.replace(PROTOBUFS_DIR + '/', '').replace('.ts', '.js');

        // Export types
        const types = [];
        for (const match of code.matchAll(EXPORTED_TYPE_REGEX)) {
          types.push(match[1]);
        }
        if (types.length > 0) {
          contents += `export type {\n`;
          for (const exportedName of types) {
            contents += `  ${exportedName} as ${prefixName + exportedName},\n`;
          }
          contents += `} from "@/protobufs/${exportedFile}";\n`;
        }

        // Export consts
        const consts = [];
        for (const match of code.matchAll(EXPORTED_CONST_REGEX)) {
          consts.push(match[1]);
        }

        // Export classes (v1 message classes)
        const classes = [];
        for (const match of code.matchAll(EXPORTED_CLASS_REGEX)) {
          classes.push(match[1]);
        }

        // Export enums
        const enums = [];
        for (const match of code.matchAll(EXPORTED_ENUM_REGEX)) {
          enums.push(match[1]);
        }

        // Combine consts, classes, and enums for export
        const allExports = [...consts, ...classes, ...enums];
        if (allExports.length > 0) {
          contents += `export {\n`;
          for (const exportedName of allExports) {
            contents += `  ${exportedName} as ${prefixName + exportedName},\n`;
          }
          contents += `} from "@/protobufs/${exportedFile}";\n`;
        }
      }

      for (const file of files) {
        generateIndexExports(file);
      }
    }

    generateIndexExports(PROTOBUFS_DIR);
    writeFileSync(join(PROTOBUFS_DIR, 'index.ts'), contents);
  }

  console.log('💾 Saving manifest...');
  saveManifest(manifest);
} else {
  console.log('ℹ️ No changes, skipping index and manifest update');
}

console.log('✅ Done!');
