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

if (typeof document !== 'undefined') {
  document.querySelectorAll('[data-how-it-works]').forEach((root) => {
    initHowItWorks(root, window);
  });
}
