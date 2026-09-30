export function setDropdownState(button, menu, isOpen) {
  const expanded = Boolean(isOpen);
  button.setAttribute('aria-expanded', String(expanded));
  menu.hidden = !expanded;
}

export const SERVICES_DROPDOWN_CLOSE_DELAY = 200;

export function initServicesDropdown(root, environment = globalThis) {
  const button = root.querySelector('.navbar-services-toggle');
  const menu = root.querySelector('.navbar-submenu');
  const documentRef = environment.document;
  const supportsHover = environment.matchMedia?.('(hover: hover) and (pointer: fine)');

  if (!button || !menu || !documentRef) return () => {};

  const reducedMotion = environment
    .matchMedia?.('(prefers-reduced-motion: reduce)')
    ?.matches;
  const closeDelay = reducedMotion ? 0 : SERVICES_DROPDOWN_CLOSE_DELAY;
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
  let pointerIsActivatingButton = false;
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

  const isOpen = () => button.getAttribute('aria-expanded') === 'true';
  const open = () => {
    clearPendingWork();
    button.setAttribute('aria-expanded', 'true');
    menu.hidden = false;
    menu.inert = false;
    openFrame = requestFrame(() => {
      menu.classList?.add('is-open');
      openFrame = null;
    });
  };
  const close = ({ restoreFocus = false, immediate = false } = {}) => {
    clearPendingWork();
    if (restoreFocus) button.focus();
    button.setAttribute('aria-expanded', 'false');
    menu.classList?.remove('is-open');
    menu.inert = true;

    if (immediate || closeDelay === 0) {
      menu.hidden = true;
    } else {
      closeTimer = schedule(() => {
        menu.hidden = true;
        closeTimer = null;
      }, closeDelay);
    }

  };
  const toggle = () => {
    if (isOpen()) close();
    else open();
  };

  const handlePointerEnter = () => {
    if (supportsHover?.matches) open();
  };

  const handlePointerLeave = () => {
    const focusIsInside = root.contains(documentRef.activeElement);
    if (supportsHover?.matches && !focusIsInside) close();
  };

  const handleButtonPointerDown = () => {
    pointerIsActivatingButton = true;
  };

  const handleButtonPointerCancel = () => {
    pointerIsActivatingButton = false;
  };

  const handleButtonClick = () => {
    toggle();
    pointerIsActivatingButton = false;
  };

  const handleFocusIn = () => {
    if (!pointerIsActivatingButton) open();
  };

  const handleFocusOut = (event) => {
    if (!root.contains(event.relatedTarget)) close();
  };

  const handleKeyDown = (event) => {
    if (event.key !== 'Escape' || !isOpen()) return;
    event.preventDefault();
    close({ restoreFocus: true, immediate: true });
  };

  const handleOutsidePointerDown = (event) => {
    if (!root.contains(event.target)) close();
  };

  root.addEventListener('pointerenter', handlePointerEnter);
  root.addEventListener('pointerleave', handlePointerLeave);
  root.addEventListener('focusin', handleFocusIn);
  root.addEventListener('focusout', handleFocusOut);
  root.addEventListener('keydown', handleKeyDown);
  button.addEventListener('pointerdown', handleButtonPointerDown);
  button.addEventListener('pointercancel', handleButtonPointerCancel);
  button.addEventListener('click', handleButtonClick);
  documentRef.addEventListener('pointerdown', handleOutsidePointerDown);

  button.setAttribute('aria-expanded', 'false');
  menu.classList?.remove('is-open');
  menu.hidden = true;
  menu.inert = true;

  return () => {
    clearPendingWork();
    button.setAttribute('aria-expanded', 'false');
    menu.classList?.remove('is-open');
    menu.hidden = true;
    menu.inert = true;
    root.removeEventListener('pointerenter', handlePointerEnter);
    root.removeEventListener('pointerleave', handlePointerLeave);
    root.removeEventListener('focusin', handleFocusIn);
    root.removeEventListener('focusout', handleFocusOut);
    root.removeEventListener('keydown', handleKeyDown);
    button.removeEventListener('pointerdown', handleButtonPointerDown);
    button.removeEventListener('pointercancel', handleButtonPointerCancel);
    button.removeEventListener('click', handleButtonClick);
    documentRef.removeEventListener('pointerdown', handleOutsidePointerDown);
  };
}

if (typeof document !== 'undefined') {
  document.querySelectorAll('[data-services-dropdown]').forEach((root) => {
    initServicesDropdown(root, window);
  });
}
