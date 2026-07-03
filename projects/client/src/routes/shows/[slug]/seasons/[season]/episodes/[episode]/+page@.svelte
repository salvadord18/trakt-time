<script lang="ts">
  import { page } from '$app/state';
  import BackBar from '$lib/components/back-bar/BackBar.svelte';
  import { useQuery } from '$lib/features/query/useQuery.ts';
  import { episodeSummaryQuery } from '$lib/requests/queries/episode/episodeSummaryQuery.ts';
  import { episodeIntlQuery } from '$lib/requests/queries/episode/episodeIntlQuery.ts';
  import { episodePeopleQuery } from '$lib/requests/queries/episode/episodePeopleQuery.ts';
  import { showSummaryQuery } from '$lib/requests/queries/shows/showSummaryQuery.ts';
  import {
    EpisodeFinaleType,
    EpisodePremiereType,
  } from '$lib/requests/models/EpisodeType.ts';
  import { findRegionalIntl } from '$lib/utils/media/findRegionalIntl.ts';
  import { getLanguageAndRegion, languageTag } from '$lib/features/i18n/index.ts';
  import CastSection from '$lib/sections/summary/_internal/CastSection.svelte';
  import CommentsSection from '$lib/sections/summary/_internal/CommentsSection.svelte';
  import MediaActionsRow from '$lib/sections/summary/_internal/MediaActionsRow.svelte';
  import MediaCoverHero from '$lib/sections/summary/_internal/MediaCoverHero.svelte';
  import MediaPoster from '$lib/sections/summary/_internal/MediaPoster.svelte';
  import MediaRating from '$lib/sections/summary/_internal/MediaRating.svelte';
  import SummarySkeleton from '$lib/sections/summary/_internal/SummarySkeleton.svelte';
  import { hasAired } from '$lib/utils/media/hasAired.ts';
  import * as m from '$lib/paraglide/messages.js';

  const slug = page.params.slug ?? '';
  const season = Number(page.params.season ?? 0);
  const episodeNum = Number(page.params.episode ?? 0);

  const episodeQuery = $derived(
    useQuery(episodeSummaryQuery({ slug, season, episode: episodeNum })),
  );

  const showQuery = $derived(useQuery(showSummaryQuery({ slug })));

  const peopleQuery = $derived(
    useQuery(episodePeopleQuery({ slug, season, episode: episodeNum })),
  );
  const cast = $derived($peopleQuery.data?.cast ?? []);
  const castLoading = $derived($peopleQuery.isLoading);

  const episode = $derived($episodeQuery.data ?? null);
  const show = $derived($showQuery.data ?? null);
  const isLoading = $derived($episodeQuery.isLoading && !episode);

  const locale = $derived(languageTag());
  const region = $derived(getLanguageAndRegion());
  const intlQuery = $derived(
    useQuery(
      episodeIntlQuery({
        slug,
        season,
        episode: episodeNum,
        language: region.language,
        enabled: locale !== 'en',
      }),
    ),
  );
  const intl = $derived(
    episode
      ? findRegionalIntl({
          type: 'episode',
          translations: $intlQuery.data,
          fallback: {
            title: episode.title,
            overview: episode.overview ?? '',
          },
        })
      : null,
  );

  const showUrl = $derived(`/shows/${slug}`);

  const seasonLabel = $derived(`S${season.toString().padStart(2, '0')}`);
  const episodeLabel = $derived(`E${episodeNum.toString().padStart(2, '0')}`);

  const episodeHasAired = $derived(
    episode
      ? hasAired({
          type: episode.type ?? 'episode',
          effectiveReleaseDate: episode.effectiveReleaseDate,
        })
      : false,
  );

  const ratingLabel = $derived(
    episode?.rating && episodeHasAired
      ? `${(episode.rating * 10).toFixed(1)} / 10`
      : null,
  );

  const duration = $derived(
    episode && episode.runtime > 0 ? `${episode.runtime}m` : null,
  );

  const airDateLabel = $derived(
    episode?.airDate
      ? new Intl.DateTimeFormat(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }).format(episode.airDate)
      : null,
  );

  const coverUrl = $derived(
    episode?.cover.url ?? show?.cover.url.medium ?? null,
  );

  const isPremiere = $derived(
    episode?.type != null &&
      Object.values(EpisodePremiereType).includes(episode.type as never),
  );

  const isFinale = $derived(
    episode?.type != null &&
      Object.values(EpisodeFinaleType).includes(episode.type as never),
  );

  const badgeLabel = $derived(
    isPremiere ? m.tag_text_premiere() : isFinale ? m.tag_text_finale() : null,
  );
</script>

<svelte:head>
  <title>
    {episode
      ? `${intl?.title ?? episode.title} - ${seasonLabel}${episodeLabel} - Trakt Time`
      : 'Trakt Time'}
  </title>
</svelte:head>

<div class="summary-page">
  <BackBar href={showUrl} label={show?.title ?? ''} />

  {#if isLoading}
    <SummarySkeleton />
  {:else if episode}
    <MediaCoverHero {coverUrl} />

    <div class="summary-content">
      <div class="summary-header">
        {#if show}
          <MediaPoster src={show.poster.url.medium} alt={show.title} />
        {/if}

        <div class="summary-info">
          <div class="episode-code-row">
            <span class="episode-code">{seasonLabel} | {episodeLabel}</span>
            {#if badgeLabel}
              <span class="episode-badge">{badgeLabel}</span>
            {/if}
          </div>

          <h1 class="summary-title">{intl?.title ?? episode.title}</h1>

          <div class="summary-meta">
            {#if airDateLabel}<span>{airDateLabel}</span>{/if}
            {#if duration}<span>{duration}</span>{/if}
          </div>

          {#if ratingLabel}
            <MediaRating label={ratingLabel} />
          {/if}

          {#if show}
            <MediaActionsRow
              watchedProps={{
                type: 'episode',
                media: {
                  id: episode.id,
                  effectiveReleaseDate: episode.effectiveReleaseDate,
                  season: episode.season,
                  number: episode.number,
                },
                show: { id: show.id, title: show.title },
              }}
              title={intl?.title ?? episode.title}
            />
          {/if}
        </div>
      </div>

      {#if intl?.overview ?? episode.overview}
        <p class="summary-overview">{intl?.overview ?? episode.overview}</p>
      {/if}

      <CastSection
        {cast}
        isLoading={castLoading}
        emptyMessage={m.text_no_cast()}
      />

      <CommentsSection
        type="episode"
        {slug}
        {season}
        episode={episodeNum}
        mediaId={episode.id}
        mediaTitle={intl?.title ?? episode.title}
      />
    </div>
  {/if}
</div>

<style lang="scss">
  .episode-code-row {
    display: flex;
    align-items: center;
    gap: var(--gap-xs);
  }

  .episode-code {
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--trakttime-accent);
    text-transform: uppercase;
  }

  .episode-badge {
    font-size: 0.5rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--trakttime-accent);
    border: var(--ni-1) solid var(--trakttime-accent);
    padding: var(--ni-1) 5px;
    border-radius: var(--border-radius-xs);
  }
</style>
