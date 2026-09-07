(() => {
  const tablist = document.querySelector('[data-tablist]');
  if (!tablist) return;

  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  if (!tabs.length) return;

  const panelOf = (tab) => document.getElementById(tab.getAttribute('aria-controls'));

  const activate = (tab, { moveFocus = false } = {}) => {
    tabs.forEach((item) => {
      const isActive = item === tab;
      const panel = panelOf(item);

      item.classList.toggle('active', isActive);
      item.setAttribute('aria-selected', String(isActive));
      item.tabIndex = isActive ? 0 : -1;

      if (panel) panel.classList.toggle('active', isActive);
    });

    if (moveFocus) tab.focus();
  };

  const step = (from, delta) => {
    const next = (tabs.indexOf(from) + delta + tabs.length) % tabs.length;
    activate(tabs[next], { moveFocus: true });
  };

  tablist.addEventListener('click', (event) => {
    const tab = event.target.closest('[role="tab"]');
    if (tab) activate(tab);
  });

  tablist.addEventListener('keydown', (event) => {
    const tab = event.target.closest('[role="tab"]');
    if (!tab) return;

    const actions = {
      ArrowDown: () => step(tab, 1),
      ArrowRight: () => step(tab, 1),
      ArrowUp: () => step(tab, -1),
      ArrowLeft: () => step(tab, -1),
      Home: () => activate(tabs[0], { moveFocus: true }),
      End: () => activate(tabs[tabs.length - 1], { moveFocus: true })
    };

    const action = actions[event.key];
    if (!action) return;

    event.preventDefault();
    action();
  });

  activate(tabs.find((tab) => tab.classList.contains('active')) || tabs[0]);
})();
