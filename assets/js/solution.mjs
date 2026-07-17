export function setSolutionPresentation(
  tabs,
  panels,
  id,
  { commit = false } = {},
) {
  tabs.forEach((tab) => {
    const matches = tab.dataset.solutionStep === id;
    tab.classList.toggle('is-active', matches);

    if (commit) {
      tab.setAttribute('aria-selected', String(matches));
      tab.tabIndex = matches ? 0 : -1;
    }
  });

  panels.forEach((panel) => {
    const matches = panel.dataset.solutionPanel === id;
    panel.classList.toggle('is-active', matches);
    panel.setAttribute('aria-hidden', String(!matches));
  });
}

export function initSolution(root) {
  const tabs = [...root.querySelectorAll('[data-solution-step]')];
  const panels = [...root.querySelectorAll('[data-solution-panel]')];

  if (tabs.length !== 4 || panels.length !== 4) return () => {};

  let selectedId =
    tabs.find((tab) => tab.getAttribute('aria-selected') === 'true')?.dataset
      .solutionStep ?? tabs[0].dataset.solutionStep;
  const cleanups = [];

  const listen = (target, type, handler) => {
    target.addEventListener(type, handler);
    cleanups.push(() => target.removeEventListener(type, handler));
  };

  const commit = (id, focus = false) => {
    selectedId = id;
    setSolutionPresentation(tabs, panels, id, { commit: true });

    if (focus) {
      tabs.find((tab) => tab.dataset.solutionStep === id)?.focus();
    }
  };

  tabs.forEach((tab, index) => {
    const id = tab.dataset.solutionStep;

    listen(tab, 'pointerenter', () => {
      commit(id);
    });
    listen(tab, 'pointerleave', () => {
      setSolutionPresentation(tabs, panels, selectedId);
    });
    listen(tab, 'focus', () => {
      commit(id);
    });
    listen(tab, 'click', () => {
      commit(id);
    });
    listen(tab, 'keydown', (event) => {
      const keyIndex = {
        'ArrowLeft': index - 1,
        'ArrowUp': index - 1,
        'ArrowRight': index + 1,
        'ArrowDown': index + 1,
        'Home': 0,
        'End': tabs.length - 1,
      }[event.key];

      if (keyIndex === undefined) return;

      event.preventDefault();
      const nextIndex = (keyIndex + tabs.length) % tabs.length;
      commit(tabs[nextIndex].dataset.solutionStep, true);
    });
  });

  commit(selectedId);

  return () => {
    cleanups.forEach((cleanup) => cleanup());
  };
}

if (typeof document !== 'undefined') {
  document.querySelectorAll('[data-solution]').forEach((root) => {
    initSolution(root);
  });
}
