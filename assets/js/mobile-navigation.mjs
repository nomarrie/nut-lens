const DESKTOP_QUERY = '(min-width: 48.0625rem)';
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function setMobileSubmenuState(trigger, shell, expanded) {
  const isExpanded = Boolean(expanded);
  trigger.setAttribute('aria-expanded', String(isExpanded));
  shell.setAttribute('aria-hidden', String(!isExpanded));
  shell.inert = !isExpanded;
}

export function initMobileNavigation(root, environment = globalThis) {
  const documentRef = environment.document;
  const openButton = root?.querySelector('.mobile-nav__open');
  const mobileRoot = root?.querySelector('.mobile-nav');
  const drawer = root?.querySelector('.mobile-nav__drawer');
  const closeButton = root?.querySelector('.mobile-nav__close');
  const overlay = root?.querySelector('.mobile-nav__overlay');
  const submenuTrigger = root?.querySelector('.mobile-nav__submenu-trigger');
  const submenuShell = root?.querySelector('.mobile-nav__submenu-shell');
  const logoutButton = root?.querySelector('.mobile-nav__logout');
  const body = documentRef?.body;
  const desktopMedia = environment.matchMedia?.(DESKTOP_QUERY);

  if (
    !documentRef || !body || !openButton || !mobileRoot || !drawer
    || !closeButton || !overlay || !submenuTrigger || !submenuShell
  ) return () => {};

  const links = [...drawer.querySelectorAll('a[href]')];
  let previousFocus = null;

  const isOpen = () => openButton.getAttribute('aria-expanded') === 'true';
  const isSubmenuOpen = () => (
    submenuTrigger.getAttribute('aria-expanded') === 'true'
  );

  const getFocusableElements = () => [
    ...drawer.querySelectorAll(FOCUSABLE_SELECTOR),
  ].filter((element) => !element.closest?.('[hidden], [inert]'));

  const closeSubmenu = () => {
    setMobileSubmenuState(submenuTrigger, submenuShell, false);
  };

  const close = ({ restoreFocus = true } = {}) => {
    const wasOpen = isOpen();
    const focusWasInDrawer = drawer.contains?.(documentRef.activeElement);

    if (wasOpen && restoreFocus) {
      const target = openButton.isConnected === false
        ? previousFocus
        : openButton;
      target?.focus?.();
    } else if (wasOpen && focusWasInDrawer) {
      documentRef.activeElement?.blur?.();
    }

    drawer.inert = true;
    openButton.setAttribute('aria-expanded', 'false');
    mobileRoot.setAttribute('aria-hidden', 'true');
    mobileRoot.classList.remove('is-open');
    body.classList.remove('is-mobile-nav-open');
    closeSubmenu();
  };

  const open = () => {
    if (desktopMedia?.matches || isOpen()) return;
    previousFocus = documentRef.activeElement;
    openButton.setAttribute('aria-expanded', 'true');
    mobileRoot.setAttribute('aria-hidden', 'false');
    drawer.inert = false;
    mobileRoot.classList.add('is-open');
    body.classList.add('is-mobile-nav-open');
    closeButton.focus();
  };

  const toggleSubmenu = () => {
    setMobileSubmenuState(submenuTrigger, submenuShell, !isSubmenuOpen());
  };

  const handleKeyDown = (event) => {
    if (!isOpen()) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }

    if (event.key !== 'Tab') return;

    const focusable = getFocusableElements();
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable.at(-1);

    if (event.shiftKey && documentRef.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && documentRef.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const handleDesktopChange = (event) => {
    if (event.matches) close({ restoreFocus: false });
  };

  const handleClose = () => close();
  const handleLinkSelection = () => close({ restoreFocus: false });

  openButton.addEventListener('click', open);
  closeButton.addEventListener('click', handleClose);
  overlay.addEventListener('click', handleClose);
  submenuTrigger.addEventListener('click', toggleSubmenu);
  logoutButton?.addEventListener('click', handleClose);
  mobileRoot.addEventListener('keydown', handleKeyDown);
  links.forEach((link) => link.addEventListener('click', handleLinkSelection));
  desktopMedia?.addEventListener('change', handleDesktopChange);

  close({ restoreFocus: false });

  return () => {
    close({ restoreFocus: false });
    openButton.removeEventListener('click', open);
    closeButton.removeEventListener('click', handleClose);
    overlay.removeEventListener('click', handleClose);
    submenuTrigger.removeEventListener('click', toggleSubmenu);
    logoutButton?.removeEventListener('click', handleClose);
    mobileRoot.removeEventListener('keydown', handleKeyDown);
    links.forEach((link) => {
      link.removeEventListener('click', handleLinkSelection);
    });
    desktopMedia?.removeEventListener('change', handleDesktopChange);
  };
}

if (typeof document !== 'undefined') {
  document.querySelectorAll('[data-mobile-navigation]').forEach((root) => {
    initMobileNavigation(root, window);
  });
}
