(() => {
  const section = document.querySelector('#projects');
  const name = section.querySelector('.project-name');
  const city = section.querySelector('.project-city');
  let avatar = section.querySelector('.project-avatar');
  const title = section.querySelector('#project-current-title');
  const description = section.querySelector('.project-description');
  const order = section.querySelector('.project-order');
  const spec = [...section.querySelectorAll('.project-spec dd')];
  const photos = [...section.querySelectorAll('.project-photo')];
  const controls = section.querySelector('.project-controls');
  const position = section.querySelector('.project-position');
  const status = section.querySelector('.project-status');
  const viewer = section.querySelector('.project-viewer');
  const enlarged = viewer.querySelector('img');
  const preloaded = new Map();
  let index = 0;
  let requestedIndex = index;
  let requestVersion = 0;
  let zoomVersion = 0;
  let openedFrom;

  const projects = [
    {
      slug: 'graphite',
      name: name.textContent,
      city: city.textContent,
      title: title.textContent,
      description: description.textContent,
      spec: spec.map((item) => item.textContent),
      photos: photos.map((link) => link.querySelector('img').alt),
    },
    {
      slug: 'soft',
      name: 'Елена',
      city: 'Санкт-Петербург',
      title: 'Мягкие формы и тёплый металл',
      description: 'Округлые диваны, кресло с рисунком и пара круглых столиков образуют зону отдыха. Тёмное дерево подчёркивает светлую обивку, а латунь связывает светильники и мебель.',
      spec: ['92 м²', '1 680 000 ₽', 'Диваны, кресло, журнальные столики', 'Рифлёное дерево, паркет, светлый камень', 'Кольцевой подвес и подсветка картин'],
      photos: ['Светлая гостиная с кольцевым светильником', 'Диваны и стена из деревянных реек', 'Журнальные столики, кресло и детали обивки'],
    },
    {
      slug: 'mono',
      name: 'Дмитрий',
      city: 'Екатеринбург',
      title: 'Графит и белый камень',
      description: 'Глянцевые фасады и стекло отражают свет из панорамных окон. Чёрная мебель, тёмный остров и белый камень объединяют кухню и гостиную.',
      spec: ['137 м²', '2 980 000 ₽', 'Кухня с островом, обеденный стол, диван и кресло', 'Глянцевые фасады, стекло, камень', 'Кольцевой подвес, торшер и потолочная подсветка'],
      photos: ['Общий вид монохромной квартиры', 'Кухонный остров и столовая', 'Гостиная с торшером и стеклянным столиком'],
    },
    {
      slug: 'green',
      name: 'Марина',
      city: 'Казань',
      title: 'Зелёный лак, мрамор и латунь',
      description: 'Мраморный остров отделяет кухню от столовой. Зелёные фасады перекликаются с бархатными стульями, а белые плафоны и ботанические панно смягчают насыщенный цвет.',
      spec: ['106 м²', '2 240 000 ₽', 'Кухонный остров, стол и барные стулья', 'Зелёный лак, мрамор, латунь', 'Подвесы из молочного стекла'],
      photos: ['Общий вид зелёной кухни и столовой', 'Мраморный остров и подвесные светильники', 'Круглый стол, зелёные стулья и ботаническое панно'],
    },
  ];

  function decodeImage(src, width, height) {
    const image = new Image(width, height);
    image.decoding = 'async';
    image.src = src;
    return image.decode().then(() => image);
  }

  function prepareProject(project) {
    if (!preloaded.has(project.slug)) {
      const base = `./assets/projects/${project.slug}`;
      const ready = Promise.all([
        decodeImage(`${base}-avatar.webp`, 192, 192),
        ...project.photos.map((_, i) => decodeImage(`${base}-${i + 1}-preview.webp`, 880, 495)),
      ]).catch((error) => {
        preloaded.delete(project.slug);
        throw error;
      });
      preloaded.set(project.slug, ready);
    }
    return preloaded.get(project.slug);
  }

  async function changeProject(direction) {
    requestedIndex = (requestedIndex + direction + projects.length) % projects.length;
    const target = requestedIndex;
    const version = ++requestVersion;
    const project = projects[target];
    status.classList.add('sr-only');
    status.textContent = 'Загружаем фотографии проекта';
    let portrait;
    let frames;
    try {
      [portrait, ...frames] = await prepareProject(project);
    } catch {
      if (version === requestVersion) {
        requestedIndex = index;
        status.textContent = 'Не удалось загрузить фотографии. Попробуйте ещё раз.';
        status.classList.remove('sr-only');
      }
      return;
    }
    if (version !== requestVersion) return;

    // Commit the text and already decoded images in the same update.
    index = target;
    name.textContent = project.name;
    city.textContent = project.city;
    title.textContent = project.title;
    description.textContent = project.description;
    order.dataset.requestSubject = `Комплектация по проекту «${project.title}»`;
    portrait.className = 'project-avatar';
    portrait.alt = '';
    avatar.replaceWith(portrait);
    avatar = portrait;
    for (const [i, item] of spec.entries()) item.textContent = project.spec[i];
    for (const [i, link] of photos.entries()) {
      const alt = project.photos[i];
      link.href = `./assets/projects/${project.slug}-${i + 1}.webp`;
      link.setAttribute('aria-label', `Увеличить фото: ${alt.toLowerCase()}`);
      frames[i].alt = alt;
      link.replaceChildren(frames[i]);
    }
    position.textContent = `${index + 1} / ${projects.length}`;
    status.textContent = `Проект ${index + 1} из ${projects.length}. ${project.name}`;
  }

  controls.querySelector('.project-prev').addEventListener('click', () => changeProject(-1));
  controls.querySelector('.project-next').addEventListener('click', () => changeProject(1));
  controls.hidden = false;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      for (const project of projects) prepareProject(project).catch(() => {});
    }, { rootMargin: '600px' });
    observer.observe(section);
  }

  if (typeof viewer.showModal === 'function') {
    for (const link of photos) {
      link.addEventListener('click', (event) => {
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        event.preventDefault();
        openedFrom = link;
        const thumbnail = link.querySelector('img');
        const version = ++zoomVersion;
        enlarged.alt = thumbnail.alt;
        enlarged.src = thumbnail.src;
        viewer.showModal();
        decodeImage(link.href, 1600, 900).then((original) => {
          if (viewer.open && version === zoomVersion) enlarged.src = original.src;
        }, () => {});
      });
    }
    viewer.addEventListener('click', (event) => {
      if (event.target === viewer || event.target.closest('button')) viewer.close();
    });
    viewer.addEventListener('close', () => openedFrom?.focus({ preventScroll: true }));
  }
})();
