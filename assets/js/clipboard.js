(() => {
  const buttons = document.querySelectorAll('[data-copy]');
  if (!buttons.length) return;

  const status = document.getElementById('copyStatus');
  const RESET_DELAY = 1600;

  const copyWithFallback = (text) => {
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';

    document.body.appendChild(field);
    field.focus();
    field.select();

    try {
      document.execCommand('copy');
    } catch (error) {
      field.blur();
    }

    document.body.removeChild(field);
  };

  const copy = (text) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => copyWithFallback(text));
      return;
    }

    copyWithFallback(text);
  };

  buttons.forEach((button) => {
    const label = button.querySelector('.contact-label');
    if (!label) return;

    const text = button.dataset.copy;
    const original = label.textContent;
    let timer = null;

    button.addEventListener('click', () => {
      copy(text);

      const message = `Copied "${text}" to clipboard!`;
      label.textContent = message;
      button.disabled = true;
      if (status) status.textContent = message;

      clearTimeout(timer);
      timer = setTimeout(() => {
        label.textContent = original;
        button.disabled = false;
        if (status) status.textContent = '';
      }, RESET_DELAY);
    });
  });
})();
