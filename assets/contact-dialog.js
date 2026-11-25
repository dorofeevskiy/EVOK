(() => {
  const dialog = document.querySelector('#contact-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const lookup = dialog.querySelector('#messenger-lookup');
  const hint = lookup.querySelector('.lookup-hint');
  const copy = lookup.querySelector('.lookup-copy');
  const findButtons = dialog.querySelectorAll('[data-find]');
  const form = dialog.querySelector('form');
  const number = dialog.querySelector('.dialog-phone').getAttribute('href').slice(4);
  let opener;
  let subject;

  function selectChannel(channel) {
    lookup.hidden = !channel;
    for (const button of findButtons) {
      button.setAttribute('aria-expanded', String(button.dataset.find === channel));
    }
    hint.textContent = channel ? `Найдите нас в ${channel} по номеру ${number}.` : '';
  }

  for (const trigger of document.querySelectorAll('[data-request-subject]')) {
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      opener = trigger;
      subject = trigger.dataset.requestSubject;
      selectChannel(trigger.dataset.channel);
      dialog.showModal();
      document.documentElement.classList.add('evok-dialog-open');
    });
  }
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('evok-dialog-open');
    opener?.focus({preventScroll: true});
  });
  for (const button of findButtons) {
    button.addEventListener('click', () => {
      selectChannel(button.getAttribute('aria-expanded') === 'true' ? '' : button.dataset.find);
    });
  }
  if (navigator.clipboard) {
    copy.hidden = false;
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(number);
        hint.textContent = `Номер ${number} скопирован.`;
      } catch {
        hint.textContent = `Скопируйте номер вручную: ${number}.`;
      }
    });
  }

  form.addEventListener('input', (event) => event.target.setCustomValidity(''));
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = form.elements.namedItem('name');
    const phone = form.elements.namedItem('phone');
    name.setCustomValidity(name.value.trim() ? '' : 'Укажите ваше имя.');
    const validPhone = /^\+?\d{7,15}$/.test(phone.value.replace(/[\s().-]/g, ''));
    phone.setCustomValidity(validPhone ? '' : 'Укажите номер с кодом страны.');
    if (!form.reportValidity()) return;
    const message = `Здравствуйте! Прошу перезвонить.\nИмя: ${name.value.trim()}\nТелефон: ${phone.value.trim()}\nТема: ${subject}`;
    const url = new URL(form.action);
    url.searchParams.set('text', message);
    window.location.assign(url.href);
  });
})();
