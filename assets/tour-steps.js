const tour = document.querySelector('#tour-steps');

if (tour) {
  const list = tour.querySelector('.tour-list');
  const steps = [...list.querySelectorAll('.tour-step')];
  const photo = tour.querySelector('.tour-photo');
  const controls = tour.querySelector('.tour-controls');
  const previous = controls.querySelector('.tour-prev');
  const next = controls.querySelector('.tour-next');
  const position = controls.querySelector('.tour-position');
  const announcement = controls.querySelector('.tour-announcement');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const preloaded = new Set([photo.getAttribute('src')]);
  const format = (number) => String(number).padStart(2, '0');
  let active = -1;
  let frame = 0;

  function preload(index) {
    for (const step of [steps[index - 1], steps[index + 1]]) {
      if (!step || preloaded.has(step.dataset.image)) continue;
      preloaded.add(step.dataset.image);
      new Image().src = step.dataset.image;
    }
  }

  function showStep(index, announce = true) {
    if (active === index) return;
    active = index;
    const step = steps[index];
    for (const card of steps) {
      card.removeAttribute('aria-current');
      card.setAttribute('aria-hidden', String(card !== step));
    }
    step.setAttribute('aria-current', 'step');

    if (photo.getAttribute('src') !== step.dataset.image) {
      photo.loading = 'eager';
      photo.src = step.dataset.image;
      photo.alt = step.dataset.alt;
      preload(index);
    }

    previous.setAttribute('aria-disabled', String(index === 0));
    position.textContent = `${format(index + 1)} / ${format(steps.length)}`;
    if (announce) announcement.textContent = `Шаг ${index + 1} из ${steps.length}. ${step.querySelector('h3').textContent}`;
  }

  function stepWidth() {
    return steps[1].offsetLeft - steps[0].offsetLeft;
  }

  function goTo(index, wrap = false) {
    if (index < 0 || index >= steps.length) return;
    const left = steps[index].offsetLeft - steps[0].offsetLeft;
    list.scrollTo({ left, behavior: wrap || reducedMotion.matches ? 'auto' : 'smooth' });
  }

  function advance() {
    const lastStep = active === steps.length - 1;
    goTo(lastStep ? 0 : active + 1, lastStep);
  }

  list.addEventListener('scroll', () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const index = Math.round(list.scrollLeft / stepWidth());
      if (steps[index]) showStep(index);
    });
  }, { passive: true });

  list.addEventListener('click', (event) => {
    const index = steps.indexOf(event.target.closest('.tour-step'));
    if (index !== active) goTo(index);
  });

  tour.querySelector('.tour-carousel').addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    if (event.key === 'ArrowRight') advance();
    else goTo(active - 1);
  });

  previous.addEventListener('click', () => goTo(active - 1));
  next.addEventListener('click', advance);
  photo.addEventListener('load', () => preload(active));

  showStep(0, false);
  list.dataset.ready = '';
  controls.hidden = false;
  if (photo.complete) preload(active);
}
