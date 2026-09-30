(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (reducedMotion || !("IntersectionObserver" in window)) return;

  root.classList.add("reveal-ready");
  document.addEventListener(
    "DOMContentLoaded",
    () => {
      window.setTimeout(() => {
        if (!root.classList.contains("reveal-runtime-ready")) {
          root.classList.remove("reveal-ready");
        }
      }, 1600);
    },
    { once: true },
  );
})();
