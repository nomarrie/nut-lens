export function setDropdownState(button, menu, isOpen) {
  const expanded = Boolean(isOpen);
  button.setAttribute('aria-expanded', String(expanded));
  menu.hidden = !expanded;
}

export function initServicesDropdown(root, environment = globalThis) {
  const button = root.querySelector('.navbar__services-toggle');
  const menu = root.querySelector('.navbar__submenu');
  const documentRef = environment.document;
  const supportsHover = environment.matchMedia?.('(hover: hover) and (pointer: fine)');

  if (!button || !menu || !documentRef) return () => {};

  let pointerIsActivatingButton = false;

  const isOpen = () => button.getAttribute('aria-expanded') === 'true';
  const open = () => setDropdownState(button, menu, true);
  const close = () => setDropdownState(button, menu, false);
  const toggle = () => setDropdownState(button, menu, !isOpen());

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
    button.focus();
    close();
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

  setDropdownState(button, menu, false);

  return () => {
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
