export function getTestimonialIndices(activeIndex, count) {
  if (!Number.isInteger(count) || count < 4) {
    throw new RangeError('Testimonial carousel requires at least four items.');
  }

  const active = ((activeIndex % count) + count) % count;
  const previous = (active - 1 + count) % count;
  const next = (active + 1) % count;
  const hidden = [...Array(count).keys()].find(
    (index) => ![previous, active, next].includes(index),
  );

  return { previous, active, next, hidden };
}

export function setTestimonialPresentation(
  items,
  activeIndex,
  direction = 'next',
) {
  const indices = getTestimonialIndices(activeIndex, items.length);

  items.forEach((item, index) => {
    const slot = index === indices.previous
      ? 'previous'
      : index === indices.active
        ? 'active'
        : index === indices.next
          ? 'next'
          : direction === 'previous'
            ? 'hidden-after'
            : 'hidden-before';
    const isActive = slot === 'active';
    const isHidden = slot.startsWith('hidden');

    item.dataset.testimonialSlot = slot;
    item.setAttribute('aria-pressed', String(isActive));
    item.setAttribute('aria-hidden', String(isHidden));
    item.tabIndex = isHidden ? -1 : 0;
  });

  return indices;
}

export function syncTestimonialQuote(root, item) {
  const quote = root.querySelector('[data-testimonial-quote]');
  const name = root.querySelector('[data-testimonial-name]');
  const role = root.querySelector('[data-testimonial-role]');

  if (!quote || !name || !role || !item) return false;

  quote.textContent = item.dataset.quote;
  name.textContent = item.dataset.name;
  role.textContent = item.dataset.role;
  return true;
}

export function initTestimonial(root, environment = globalThis) {
  const items = [...root.querySelectorAll('[data-testimonial-item]')];
  const gallery = root.querySelector('[data-testimonial-gallery]');
  const previousButton = root.querySelector('[data-testimonial-previous]');
  const nextButton = root.querySelector('[data-testimonial-next]');
  const quoteContent = root.querySelector('[data-testimonial-quote-content]');
  const hasQuoteOutputs = [
    '[data-testimonial-quote]',
    '[data-testimonial-name]',
    '[data-testimonial-role]',
  ].every((selector) => root.querySelector(selector));

  if (
    items.length !== 4
    || !gallery
    || !previousButton
    || !nextButton
    || !quoteContent
    || !hasQuoteOutputs
  ) {
    return () => {};
  }

  const schedule = environment.setTimeout
    ? environment.setTimeout.bind(environment)
    : setTimeout;
  const cancelSchedule = environment.clearTimeout
    ? environment.clearTimeout.bind(environment)
    : clearTimeout;
  const reduceMotion = environment.matchMedia?.(
    '(prefers-reduced-motion: reduce)',
  )?.matches === true;
  const listeners = [];
  let activeIndex = items.findIndex(
    (item) => item.getAttribute('aria-pressed') === 'true',
  );
  let quoteTimer = null;

  if (activeIndex < 0) activeIndex = 0;

  const listen = (target, type, handler) => {
    target.addEventListener(type, handler);
    listeners.push(() => target.removeEventListener(type, handler));
  };

  const updateQuote = (item) => {
    if (quoteTimer !== null) cancelSchedule(quoteTimer);

    if (reduceMotion) {
      syncTestimonialQuote(root, item);
      quoteContent.classList.remove('is-changing');
      quoteTimer = null;
      return;
    }

    quoteContent.classList.add('is-changing');
    quoteTimer = schedule(() => {
      syncTestimonialQuote(root, item);
      quoteContent.classList.remove('is-changing');
      quoteTimer = null;
    }, 120);
  };

  const render = (direction) => {
    setTestimonialPresentation(items, activeIndex, direction);
    root.dataset.testimonialActiveIndex = String(activeIndex);
    updateQuote(items[activeIndex]);
  };

  const move = (direction) => {
    const delta = direction === 'previous' ? -1 : 1;
    activeIndex = (activeIndex + delta + items.length) % items.length;
    const indices = getTestimonialIndices(activeIndex, items.length);
    const incomingIndex = direction === 'previous'
      ? indices.previous
      : indices.next;

    gallery.classList.add('is-staging');
    items[incomingIndex].dataset.testimonialSlot = direction === 'previous'
      ? 'hidden-before'
      : 'hidden-after';
    gallery.getBoundingClientRect();
    gallery.classList.remove('is-staging');
    render(direction);
  };

  listen(previousButton, 'click', () => move('previous'));
  listen(nextButton, 'click', () => move('next'));

  items.forEach((item) => {
    listen(item, 'click', () => {
      const slot = item.dataset.testimonialSlot;
      if (slot === 'previous') move('previous');
      if (slot === 'next') move('next');
    });
  });

  listen(root, 'keydown', (event) => {
    const target = event.target;
    const tagName = target?.tagName?.toLowerCase();
    const isEditable = target?.isContentEditable
      || ['input', 'textarea', 'select'].includes(tagName);

    if (isEditable || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;

    event.preventDefault();
    move(event.key === 'ArrowLeft' ? 'previous' : 'next');
  });

  setTestimonialPresentation(items, activeIndex, 'next');
  root.dataset.testimonialActiveIndex = String(activeIndex);
  syncTestimonialQuote(root, items[activeIndex]);

  return () => {
    if (quoteTimer !== null) cancelSchedule(quoteTimer);
    listeners.forEach((cleanup) => cleanup());
  };
}

if (typeof document !== 'undefined') {
  document.querySelectorAll('[data-testimonial]').forEach((root) => {
    initTestimonial(root, window);
  });
}
