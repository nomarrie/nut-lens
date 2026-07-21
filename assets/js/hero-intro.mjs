export const HERO_INTRO_CLEANUP_DELAY = 1350;

const PENDING = 'hero-intro-pending';
const PLAYING = 'hero-intro-playing';
const COMPLETE = 'hero-intro-complete';

export function initHeroIntro(documentRef, environment = globalThis) {
  const root = documentRef?.documentElement;
  const artwork = documentRef?.querySelector?.('.hero__artwork');

  if (!root || !artwork) return () => {};

  const finish = () => {
    root.classList.remove(PENDING, PLAYING);
    root.classList.add(COMPLETE);
  };
  const mediaMatches = (query) =>
    environment.matchMedia?.(query)?.matches ?? false;
  const mobile = mediaMatches('(max-width: 48rem)');
  const reducedMotion = mediaMatches('(prefers-reduced-motion: reduce)');

  if (
    mobile
    || reducedMotion
    || !root.classList.contains(PENDING)
  ) {
    finish();
    return () => {};
  }

  const requestFrame = environment.requestAnimationFrame?.bind(environment)
    ?? ((callback) => environment.setTimeout(callback, 0));
  const cancelFrame = environment.cancelAnimationFrame?.bind(environment)
    ?? environment.clearTimeout?.bind(environment);
  const schedule = environment.setTimeout.bind(environment);
  const cancelSchedule = environment.clearTimeout.bind(environment);
  let firstFrame = null;
  let secondFrame = null;
  let cleanupTimer = null;
  let listening = false;

  const play = () => {
    listening = false;
    firstFrame = requestFrame(() => {
      firstFrame = null;
      secondFrame = requestFrame(() => {
        secondFrame = null;
        root.classList.remove(PENDING, COMPLETE);
        root.classList.add(PLAYING);

        cleanupTimer = schedule(() => {
          cleanupTimer = null;
          finish();
        }, HERO_INTRO_CLEANUP_DELAY);
      });
    });
  };

  if (documentRef.readyState === 'loading') {
    listening = true;
    documentRef.addEventListener('DOMContentLoaded', play, { once: true });
  } else {
    play();
  }

  return () => {
    if (listening) {
      documentRef.removeEventListener('DOMContentLoaded', play);
    }
    if (firstFrame !== null) cancelFrame?.(firstFrame);
    if (secondFrame !== null) cancelFrame?.(secondFrame);
    if (cleanupTimer !== null) cancelSchedule(cleanupTimer);
    finish();
  };
}

if (typeof document !== 'undefined') {
  initHeroIntro(document, window);
}
