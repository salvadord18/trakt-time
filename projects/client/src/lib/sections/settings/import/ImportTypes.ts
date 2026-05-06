export type ImportAction = 'history' | 'watchlist';

export type ImportType = 'movie' | 'show' | 'episode';

export interface ImportIds {
  trakt?: number;
  imdb?: string;
  tmdb?: number;
  tvdb?: number;
}

export interface UniversalImportItem {
  action: ImportAction;
  type: ImportType;
  ids: ImportIds;
  title?: string;
  year?: number;
  watched_at?: string;
  season?: number;
  episode?: number;
}

export interface ImportCounts {
  history: number;
  watchlist: number;
}

export type ImportStatus =
  | 'idle'
  | 'parsing'
  | 'review'
  | 'syncing'
  | 'complete'
  | 'error';
