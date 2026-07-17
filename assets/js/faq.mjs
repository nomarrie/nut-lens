export function setFaqState(items, activeId) {
  const hasMatch =
    activeId === null ||
    items.some((item) => item.dataset.faqItem === activeId);

  if (!hasMatch) return false;

  items.forEach((item) => {
    const trigger = item.querySelector('[data-faq-trigger]');
    const panel = item.querySelector('[data-faq-panel]');
    const icon = item.querySelector('[data-faq-icon]');
    const isOpen = item.dataset.faqItem === activeId;

    item.classList.toggle('is-open', isOpen);
    trigger?.setAttribute('aria-expanded', String(isOpen));
    panel?.setAttribute('aria-hidden', String(!isOpen));

    if (icon) icon.textContent = isOpen ? 'close' : 'add';
  });

  return true;
}

export function initFaq(root) {
  const items = [...root.querySelectorAll('[data-faq-item]')];
  if (items.length === 0) return () => { };

  const defaultItem = items.find((item) =>
    item.hasAttribute('data-faq-default-open')) ?? items[0];
  const listeners = [];

  root.classList.add('is-enhanced');
  setFaqState(items, defaultItem.dataset.faqItem);

  items.forEach((item) => {
    const trigger = item.querySelector('[data-faq-trigger]');
    const itemId = item.dataset.faqItem;

    if (!trigger || !itemId) return;

    const handleClick = () => {
      const nextActiveId = item.classList.contains('is-open')
        ? null
        : itemId;

      setFaqState(items, nextActiveId);
    };

    trigger.addEventListener('click', handleClick);
    listeners.push(() =>
      trigger.removeEventListener('click', handleClick)
    );
  });

  return () => listeners.forEach((cleanup) => cleanup());
}

if (typeof document !== 'undefined') {
  document.querySelectorAll('[data-faq]').forEach((root) => {
    initFaq(root);
  });
}
