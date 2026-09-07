(() => {
  const list = document.querySelector('[data-skills]');
  if (!list) return;

  const clamp = (value) => Math.max(0, Math.min(100, Number.parseFloat(value) || 0));
  const rows = [...list.querySelectorAll('.skill-row')];

  rows.forEach((row) => {
    const percent = clamp(row.dataset.pct);
    const fill = row.querySelector('.skill-fill');
    const label = row.querySelector('.skill-pct');
    const track = row.querySelector('.skill-track');

    if (fill) fill.style.width = `${percent}%`;
    if (label) label.textContent = `${percent}%`;
    if (track) track.setAttribute('aria-valuenow', String(percent));
  });

  const ordered = rows
    .slice()
    .sort((a, b) => clamp(b.dataset.pct) - clamp(a.dataset.pct));

  const fragment = document.createDocumentFragment();
  ordered.forEach((row) => fragment.appendChild(row));
  list.appendChild(fragment);
})();
