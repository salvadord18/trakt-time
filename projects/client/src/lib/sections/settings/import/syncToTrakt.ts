import { api } from '$lib/requests/api.ts';
import { SYNC_CHUNK_SIZE } from '$lib/sections/settings/sync/constants/index.ts';
import { createSyncRunner } from '$lib/sections/settings/sync/createSyncRunner.ts';
import { chunk } from '$lib/utils/array/chunk.ts';
import type { SyncEngineCallbacks } from '../sync/models/SyncEngineCallbacks.ts';
import { buildHistoryPayload } from './engine/buildHistoryPayload.ts';
import { buildWatchlistPayload } from './engine/buildWatchlistPayload.ts';
import type { UniversalImportItem } from './ImportTypes.ts';

export async function syncToTrakt(
  items: ReadonlyArray<UniversalImportItem>,
  { onProgress, onError, onStart, onComplete }: SyncEngineCallbacks,
): Promise<number> {
  onStart?.();

  try {
    const historyItems = items.filter((i) => i.action === 'history');
    const watchlistItems = items.filter((i) => i.action === 'watchlist');

    const client = api();
    const { run, getErrorCount } = createSyncRunner({ onProgress, onError });

    if (historyItems.length > 0) {
      await run(
        chunk(historyItems, SYNC_CHUNK_SIZE),
        (batch) => buildHistoryPayload([...batch]),
        (payload) => client.sync.history.add({ body: payload }),
      );
    }

    if (watchlistItems.length > 0) {
      await run(
        chunk(watchlistItems, SYNC_CHUNK_SIZE),
        (batch) => buildWatchlistPayload([...batch]),
        (payload) => client.sync.watchlist.add({ body: payload }),
      );
    }

    onComplete?.(true);
    return getErrorCount();
  } catch (err) {
    onComplete?.(false);
    throw err;
  }
}
