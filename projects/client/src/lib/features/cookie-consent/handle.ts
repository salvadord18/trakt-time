import { safeJsonParse } from '$lib/utils/json/safeJsonParse.ts';
import { time } from '$lib/utils/timing/time.ts';
import type { Handle } from '@sveltejs/kit';
import { IS_PROD } from '../../utils/env/index.ts';
import { CookieConsentEndpoint } from './CookieConsentEndpoint.ts';
import { getConsentCookieValue } from './_internal/getConsentCookieValue.ts';
import { mapToConsent } from './_internal/mapToConsent.ts';
import { COOKIE_CONSENT_COOKIE_NAME } from './constants.ts';
import type { CookieConsent } from './models/CookieConsent.ts';

const LEGACY_COOKIE_CONSENT_COOKIE_NAME = 'trakt-consent';

function coerceLegacyCookieConsent(
  cookieConsent: string | undefined,
): CookieConsent | undefined {
  if (!cookieConsent) {
    return;
  }

  const hasConsent = safeJsonParse<boolean>(cookieConsent, false);
  return hasConsent ? 'all' : 'none';
}

function coerceCookieConsent(cookieConsent: string | undefined): CookieConsent {
  const cookie = safeJsonParse<{ categories?: unknown }>(cookieConsent, {});
  if (!Array.isArray(cookie.categories)) return 'none';

  const categories = cookie.categories;
  return mapToConsent(categories);
}

export const handle: Handle = async ({ event, resolve }) => {
  const setCookieConsent = (consent: CookieConsent) => {
    event.locals.cookieConsent = consent;
  };

  const legacyConsent = coerceLegacyCookieConsent(
    event.cookies.get(LEGACY_COOKIE_CONSENT_COOKIE_NAME),
  );
  const consent = coerceCookieConsent(
    event.cookies.get(COOKIE_CONSENT_COOKIE_NAME),
  );
  setCookieConsent(legacyConsent ?? consent);

  if (event.url.pathname.startsWith(CookieConsentEndpoint.Consent)) {
    const payload = await event.request
      .json()
      .catch(() => null) as { consent?: CookieConsent } | null;

    if (!payload?.consent) {
      return new Response(null, { status: 400 });
    }

    const { consent } = payload;
    setCookieConsent(consent);

    return new Response(
      null,
      {
        status: 204,
        headers: {
          /*
           * No explicit `domain` — the cookie sticks to whatever origin
           * served the response. The upstream code pinned it to `.trakt.tv`,
           * which silently broke any deploy outside that zone (the browser
           * refuses the cookie, so the consent banner re-appears on every
           * reload of the trakt-time worker URL).
           */
          'Set-Cookie': event.cookies.serialize(
            COOKIE_CONSENT_COOKIE_NAME,
            JSON.stringify(getConsentCookieValue(new Date(), consent)),
            {
              httpOnly: false,
              secure: IS_PROD,
              maxAge: time.months(6) / time.seconds(1),
              path: '/',
            },
          ),
        },
      },
    );
  }

  return await resolve(event);
};
