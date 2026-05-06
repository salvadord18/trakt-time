import { useUser } from '$lib/features/auth/stores/useUser.ts';
import { map } from 'rxjs';

export type HasWatchedProps = {
  type: 'movie' | 'show';
  id: number;
};

/**
 * "Has the user watched this title at all?" — true the moment any history
 * exists for the movie (binary) or any episode of the show. Used to gate
 * post-watch actions like rating and favoriting.
 */
export function useHasWatched({ type, id }: HasWatchedProps) {
  const { history } = useUser();

  const hasWatched = history.pipe(
    map(($history) => {
      if (!$history) return false;

      switch (type) {
        case 'movie':
          return $history.movies.has(id);
        case 'show':
          return $history.shows.has(id);
      }
    }),
  );

  return { hasWatched };
}
