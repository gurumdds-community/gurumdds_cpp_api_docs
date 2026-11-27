document.querySelectorAll('.doc-language select').forEach((control) => {
  control.addEventListener('change', () => {
    const next = new URL(control.value, window.location.href);
    next.search = window.location.search;
    next.hash = window.location.hash;
    window.location.assign(next);
  });
  window.addEventListener('pageshow', () => {
    control.selectedIndex = Number(control.dataset.current);
  });
});
