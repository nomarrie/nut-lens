export const PROFILE_CLOSE_DELAY = 200;

export function initProfileDropdown(root, environment = globalThis) {
  const trigger = root.querySelector('.navbar__profile-trigger');
  const panel = root.querySelector('.navbar__profile-panel');
  const profileLink = root.querySelector('[data-profile-link]');
  const logoutButton = root.querySelector('[data-profile-logout]');
  const documentRef = environment.document;

  if (!trigger || !panel || !documentRef) return () => {};

  const reducedMotion = environment
    .matchMedia?.('(prefers-reduced-motion: reduce)')
    ?.matches;
  const closeDelay = reducedMotion ? 0 : PROFILE_CLOSE_DELAY;
  const requestFrame = environment.requestAnimationFrame?.bind(environment)
    ?? ((callback) => {
      callback();
      return null;
    });
  const cancelFrame = environment.cancelAnimationFrame?.bind(environment)
    ?? (() => {});
  const schedule = environment.setTimeout?.bind(environment)
    ?? globalThis.setTimeout.bind(globalThis);
  const cancelSchedule = environment.clearTimeout?.bind(environment)
    ?? globalThis.clearTimeout.bind(globalThis);
  let closeTimer = null;
  let openFrame = null;

  const clearPendingWork = () => {
    if (closeTimer !== null) {
      cancelSchedule(closeTimer);
      closeTimer = null;
    }

    if (openFrame !== null) {
      cancelFrame(openFrame);
      openFrame = null;
    }
  };

  const isOpen = () => trigger.getAttribute('aria-expanded') === 'true';

  const open = () => {
    clearPendingWork();
    trigger.setAttribute('aria-expanded', 'true');
    panel.hidden = false;
    panel.inert = false;
    openFrame = requestFrame(() => {
      panel.classList.add('is-open');
      openFrame = null;
    });
  };

  const close = ({ restoreFocus = false, immediate = false } = {}) => {
    clearPendingWork();
    trigger.setAttribute('aria-expanded', 'false');
    panel.classList.remove('is-open');
    panel.inert = true;

    if (immediate) {
      panel.hidden = true;
    } else {
      closeTimer = schedule(() => {
        panel.hidden = true;
        closeTimer = null;
      }, closeDelay);
    }

    if (restoreFocus) trigger.focus();
  };

  const handleTriggerClick = () => {
    if (isOpen()) close();
    else open();
  };

  const handleOutsidePointerDown = (event) => {
    if (isOpen() && !root.contains(event.target)) close();
  };

  const handleKeyDown = (event) => {
    if (event.key !== 'Escape' || !isOpen()) return;
    event.preventDefault();
    close({ restoreFocus: true });
  };

  const handleFocusOut = (event) => {
    if (isOpen() && !root.contains(event.relatedTarget)) close();
  };

  const handleProfileSelection = () => {
    close({ immediate: true });
  };

  const handleLogout = () => {
    close();
  };

  trigger.addEventListener('click', handleTriggerClick);
  root.addEventListener('keydown', handleKeyDown);
  root.addEventListener('focusout', handleFocusOut);
  documentRef.addEventListener('pointerdown', handleOutsidePointerDown);
  profileLink?.addEventListener('click', handleProfileSelection);
  logoutButton?.addEventListener('click', handleLogout);

  trigger.setAttribute('aria-expanded', 'false');
  panel.classList.remove('is-open');
  panel.hidden = true;
  panel.inert = true;

  return () => {
    clearPendingWork();
    trigger.setAttribute('aria-expanded', 'false');
    panel.classList.remove('is-open');
    panel.hidden = true;
    panel.inert = true;
    trigger.removeEventListener('click', handleTriggerClick);
    root.removeEventListener('keydown', handleKeyDown);
    root.removeEventListener('focusout', handleFocusOut);
    documentRef.removeEventListener('pointerdown', handleOutsidePointerDown);
    profileLink?.removeEventListener('click', handleProfileSelection);
    logoutButton?.removeEventListener('click', handleLogout);
  };
}

if (typeof document !== 'undefined') {
  document.querySelectorAll('[data-profile-dropdown]').forEach((root) => {
    initProfileDropdown(root, window);
  });
}
