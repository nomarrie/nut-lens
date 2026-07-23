export function initHowItWorks(root, environment = globalThis) {
  const Observer = environment.IntersectionObserver;

  if (typeof Observer !== 'function') {
    root.classList.add('is-visible');
    return () => {};
  }

  const observer = new Observer(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;

      root.classList.add('is-visible');
      observer.disconnect();
    },
    { threshold: 0.35 },
  );

  observer.observe(root);
  return () => observer.disconnect();
}

export function formatStatValue(value, suffix = '') {
  return `${new Intl.NumberFormat('id-ID').format(value)}${suffix}`;
}

export function animateStatCounters(
  counters,
  environment = globalThis,
  duration = 1200,
) {
  const items = counters
    .map((element) => ({
      element,
      target: Number.parseInt(element.dataset.countTarget, 10),
      suffix: element.dataset.countSuffix ?? '',
    }))
    .filter(({ target }) => Number.isFinite(target) && target >= 0);

  if (items.length === 0 || typeof environment.requestAnimationFrame !== 'function') {
    return () => {};
  }

  let frameId;
  let startTime;
  let cancelled = false;

  const render = (progress) => {
    const easedProgress = 1 - ((1 - progress) ** 3);

    items.forEach(({ element, target, suffix }) => {
      const currentValue = progress === 1
        ? target
        : Math.floor(target * easedProgress);
      element.textContent = formatStatValue(currentValue, suffix);
    });
  };

  render(0);

  const tick = (timestamp) => {
    if (cancelled) return;

    startTime ??= timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    render(progress);

    if (progress < 1) {
      frameId = environment.requestAnimationFrame(tick);
    }
  };

  frameId = environment.requestAnimationFrame(tick);

  return () => {
    cancelled = true;

    if (
      frameId !== undefined
      && typeof environment.cancelAnimationFrame === 'function'
    ) {
      environment.cancelAnimationFrame(frameId);
    }
  };
}

export function initStatCounters(root, environment = globalThis) {
  const counters = [...(root.querySelectorAll?.('[data-count-target]') ?? [])];
  const stats = root.querySelector?.('.how-it-works__stats');

  if (!stats || counters.length === 0) return () => {};

  const prefersReducedMotion =
    environment.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const Observer = environment.IntersectionObserver;

  if (
    prefersReducedMotion
    || typeof Observer !== 'function'
    || typeof environment.requestAnimationFrame !== 'function'
  ) {
    return () => {};
  }

  let stopAnimation = () => {};
  const observer = new Observer(
    (entries) => {
      const isReady = entries.some(
        (entry) =>
          entry.isIntersecting
          && entry.intersectionRatio >= 0.3,
      );

      if (!isReady) return;

      observer.disconnect();
      stopAnimation = animateStatCounters(counters, environment);
    },
    { threshold: 0.3 },
  );

  observer.observe(stats);

  return () => {
    observer.disconnect();
    stopAnimation();
  };
}

if (typeof document !== 'undefined') {
  document.querySelectorAll('[data-how-it-works]').forEach((root) => {
    initHowItWorks(root, window);
    initStatCounters(root, window);
  });
}
