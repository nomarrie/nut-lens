const REVEAL_SELECTOR = '[data-reveal]';
const VISIBLE_CLASS = 'is-revealed';
const READY_CLASS = 'reveal-ready';
const RUNTIME_CLASS = 'reveal-runtime-ready';
const REVEAL_THRESHOLD = 0.3;

function revealImmediately(elements, documentElement) {
  elements.forEach((element) => element.classList.add(VISIBLE_CLASS));
  documentElement?.classList.remove(READY_CLASS);
  documentElement?.classList.add(RUNTIME_CLASS);
}

export function initScrollReveal(elements, environment = globalThis) {
  const revealElements = [...elements];
  const documentElement =
    environment.documentElement ?? environment.document?.documentElement;
  const reducedMotion =
    environment.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ??
    false;
  const Observer = environment.IntersectionObserver;

  if (
    reducedMotion ||
    typeof Observer !== 'function' ||
    revealElements.length === 0
  ) {
    revealImmediately(revealElements, documentElement);
    return () => {};
  }

  documentElement?.classList.add(RUNTIME_CLASS);

  const observer = new Observer(
    (entries) => {
      entries.forEach((entry) => {
        if (
          !entry.isIntersecting ||
          entry.intersectionRatio < REVEAL_THRESHOLD
        ) {
          return;
        }

        entry.target.classList.add(VISIBLE_CLASS);
        observer.unobserve(entry.target);
      });
    },
    { threshold: REVEAL_THRESHOLD },
  );

  revealElements.forEach((element) => observer.observe(element));

  return () => observer.disconnect();
}

if (typeof document !== 'undefined') {
  initScrollReveal(document.querySelectorAll(REVEAL_SELECTOR), {
    IntersectionObserver: window.IntersectionObserver,
    matchMedia: window.matchMedia.bind(window),
    documentElement: document.documentElement,
  });
}
