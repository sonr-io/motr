/**
 * Registry Routes
 * Chain and asset registry management
 */

import { Hono } from 'hono';
import type { Bindings, ChainInfo, AssetInfo } from '../types';

const registry = new Hono<{ Bindings: Bindings }>();

// ==========================================
// Chain Registry
// ==========================================

/**
 * GET /registry/chains - List all chains
 */
registry.get('/chains', async (c) => {
  try {
    const chains = await c.env.CHAIN_REGISTRY.list();
    const chainData: ChainInfo[] = [];

    for (const key of chains.keys) {
      const data = await c.env.CHAIN_REGISTRY.get<ChainInfo>(key.name, 'json');
      if (data) {
        chainData.push(data);
      }
    }

    return c.json({
      chains: chainData,
      total: chainData.length,
    });
  } catch (error) {
    console.error('[Chain Registry Error]', error);
    return c.json({ error: 'Failed to fetch chains' }, 500);
  }
});

/**
 * GET /registry/chains/:chainId - Get chain details
 */
registry.get('/chains/:chainId', async (c) => {
  const chainId = c.req.param('chainId');

  try {
    const chain = await c.env.CHAIN_REGISTRY.get<ChainInfo>(chainId, 'json');

    if (!chain) {
      return c.json({ error: 'Chain not found' }, 404);
    }

    return c.json(chain);
  } catch (error) {
    console.error('[Chain Registry Error]', error);
    return c.json({ error: 'Failed to fetch chain details' }, 500);
  }
});

/**
 * POST /registry/chains - Add or update chain
 */
registry.post('/chains', async (c) => {
  try {
    const chain = await c.req.json<ChainInfo>();

    if (!chain.chainId || !chain.chainName) {
      return c.json({ error: 'chainId and chainName are required' }, 400);
    }

    await c.env.CHAIN_REGISTRY.put(chain.chainId, JSON.stringify(chain));

    return c.json({ success: true, chainId: chain.chainId }, 201);
  } catch (error) {
    console.error('[Chain Registry Error]', error);
    return c.json({ error: 'Failed to save chain' }, 500);
  }
});

/**
 * DELETE /registry/chains/:chainId - Remove chain
 */
registry.delete('/chains/:chainId', async (c) => {
  const chainId = c.req.param('chainId');

  try {
    await c.env.CHAIN_REGISTRY.delete(chainId);
    return c.json({ success: true });
  } catch (error) {
    console.error('[Chain Registry Error]', error);
    return c.json({ error: 'Failed to delete chain' }, 500);
  }
});

// ==========================================
// Asset Registry
// ==========================================

/**
 * GET /registry/assets - List all assets (with optional chain filter)
 */
registry.get('/assets', async (c) => {
  const chainId = c.req.query('chainId');

  try {
    const assets = await c.env.ASSET_REGISTRY.list();
    const assetData: AssetInfo[] = [];

    for (const key of assets.keys) {
      const data = await c.env.ASSET_REGISTRY.get<AssetInfo>(key.name, 'json');
      if (data) {
        // Filter by chainId if provided
        if (!chainId || data.chainId === chainId) {
          assetData.push(data);
        }
      }
    }

    return c.json({
      assets: assetData,
      total: assetData.length,
      chainId: chainId || 'all',
    });
  } catch (error) {
    console.error('[Asset Registry Error]', error);
    return c.json({ error: 'Failed to fetch assets' }, 500);
  }
});

/**
 * GET /registry/assets/:assetId - Get asset details
 */
registry.get('/assets/:assetId', async (c) => {
  const assetId = c.req.param('assetId');

  try {
    const asset = await c.env.ASSET_REGISTRY.get<AssetInfo>(assetId, 'json');

    if (!asset) {
      return c.json({ error: 'Asset not found' }, 404);
    }

    return c.json(asset);
  } catch (error) {
    console.error('[Asset Registry Error]', error);
    return c.json({ error: 'Failed to fetch asset details' }, 500);
  }
});

/**
 * POST /registry/assets - Add or update asset
 */
registry.post('/assets', async (c) => {
  try {
    const asset = await c.req.json<AssetInfo>();

    if (!asset.assetId || !asset.chainId || !asset.symbol) {
      return c.json({ error: 'assetId, chainId, and symbol are required' }, 400);
    }

    await c.env.ASSET_REGISTRY.put(asset.assetId, JSON.stringify(asset));

    return c.json({ success: true, assetId: asset.assetId }, 201);
  } catch (error) {
    console.error('[Asset Registry Error]', error);
    return c.json({ error: 'Failed to save asset' }, 500);
  }
});

/**
 * DELETE /registry/assets/:assetId - Remove asset
 */
registry.delete('/assets/:assetId', async (c) => {
  const assetId = c.req.param('assetId');

  try {
    await c.env.ASSET_REGISTRY.delete(assetId);
    return c.json({ success: true });
  } catch (error) {
    console.error('[Asset Registry Error]', error);
    return c.json({ error: 'Failed to delete asset' }, 500);
  }
});

export default registry;
