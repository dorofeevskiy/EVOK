(() => {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  const name = form.elements.namedItem('name');
  const phone = form.elements.namedItem('phone');
  const email = form.elements.namedItem('email');
  const question = form.elements.namedItem('question');
  const draft = form.querySelector('.contact-draft');
  const status = form.querySelector('.contact-draft-status');
  const openEmail = form.querySelector('.contact-draft-open');
  const copy = form.querySelector('.contact-draft-copy');
  const recipient = form.getAttribute('action');
  const subject = 'Заявка на консультацию';
  let body = '';

  form.addEventListener('input', (event) => {
    event.target.setCustomValidity('');
    draft.hidden = true;
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const normalizedPhone = phone.value.replace(/[\s().-]/g, '');
    name.setCustomValidity(name.value.trim() ? '' : 'Пожалуйста, укажите ваше имя.');
    phone.setCustomValidity(/^\+?\d{7,15}$/.test(normalizedPhone) ? '' : 'Введите номер телефона, включая код страны.');
    if (!form.reportValidity()) return;

    const fields = [
      ['Имя', name.value.trim()],
      ['Телефон', phone.value.trim()],
      ['Email', email.value.trim()],
      ['Вопрос', question.value.trim()],
    ];
    const details = fields.filter(([, value]) => value).map(([label, value]) => `${label}: ${value}`);
    body = [subject, '', ...details].join('\r\n');
    const emailSubject = encodeURIComponent(`${subject} — Evok Group`);
    openEmail.href = `${recipient}?subject=${emailSubject}&body=${encodeURIComponent(body)}`;
    draft.hidden = false;
    status.textContent = 'Заявка подготовлена. Отправьте письмо в почтовом приложении.';
    window.location.href = openEmail.href;
  });

  if (navigator.clipboard) {
    copy.hidden = false;
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(body);
        status.textContent = 'Текст заявки скопирован.';
      } catch {
        status.textContent = 'Не удалось скопировать текст. Попробуйте открыть письмо ещё раз.';
      }
    });
  }
})();
