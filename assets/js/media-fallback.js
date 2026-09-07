(() => {
  const slots = document.querySelectorAll('[data-media]');

  slots.forEach((slot) => {
    const image = slot.querySelector('img');
    if (!image) return;

    const showFallback = () => slot.classList.add('is-fallback');

    image.addEventListener('error', showFallback, { once: true });

    if (image.complete && image.naturalWidth === 0) showFallback();
  });
})();
