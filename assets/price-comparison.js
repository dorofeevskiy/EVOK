(() => {
  const section = document.querySelector('#price-comparison');
  const gallery = section.querySelector('.price-gallery');
  const [first, second] = gallery.children;
  const controls = section.querySelector('.price-controls');
  const [previous, next] = controls.querySelectorAll('button');
  const progress = section.querySelector('.price-progress');
  const thumb = progress.firstElementChild;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function updateNavigation() {
    const maxScroll = gallery.scrollWidth - gallery.clientWidth;
    const position = Math.max(0, Math.min(gallery.scrollLeft, maxScroll));
    previous.disabled = position < 1;
    next.disabled = maxScroll - position < 1;
    controls.hidden = maxScroll < 1;
    progress.hidden = maxScroll < 1;
    const thumbWidth = Math.min(38, gallery.clientWidth / gallery.scrollWidth * 100);
    thumb.style.width = `${thumbWidth}%`;
    thumb.style.marginInlineStart = `${maxScroll ? position / maxScroll * (100 - thumbWidth) : 0}%`;
  }

  controls.addEventListener('click', (event) => {
    const arrow = event.target.closest('button');
    if (!arrow) return;
    const step = second.getBoundingClientRect().left - first.getBoundingClientRect().left;
    gallery.scrollBy({ left: step * Number(arrow.dataset.direction), behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  });

  gallery.dataset.ready = '';
  gallery.addEventListener('scroll', updateNavigation, { passive: true });
  new ResizeObserver(updateNavigation).observe(gallery);
  updateNavigation();

  const viewer = section.querySelector('.price-viewer');
  if (typeof viewer.showModal !== 'function') return;
  const enlargedPhoto = viewer.querySelector('img');
  let openedFrom;

  gallery.addEventListener('click', (event) => {
    const link = event.target.closest('.price-expand');
    if (!link || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    event.preventDefault();
    const photo = link.closest('.price-card').querySelector('.price-photo');
    enlargedPhoto.src = link.href;
    enlargedPhoto.alt = photo.alt;
    enlargedPhoto.width = photo.width;
    enlargedPhoto.height = photo.height;
    openedFrom = link;
    viewer.showModal();
  });

  viewer.addEventListener('click', (event) => {
    if (event.target === viewer || event.target.closest('button')) viewer.close();
  });
  viewer.addEventListener('close', () => openedFrom?.focus({ preventScroll: true }));
})();
