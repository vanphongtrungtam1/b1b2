(() => {
  'use strict';
  const slides = Array.from(document.querySelectorAll('.slide'));
  const tabs = Array.from(document.querySelectorAll('.tab'));
  const main = document.getElementById('main');
  const counter = document.getElementById('counter');
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');
  const dots = document.getElementById('dots');
  const details = document.getElementById('details');
  const modal = document.getElementById('detail-dialog');
  const modalBody = document.getElementById('detail-body');
  const modalTitle = document.getElementById('detail-title');
  const fullscreen = document.getElementById('fullscreen');
  const TOTAL = slides.length;
  let current = 0;
  let selectedLevel = 'B1';

  const titles = {
    'bat-dau': 'Bắt đầu',
    'b1-b2': 'B1 & B2',
    'listening': 'Listening · Nghe',
    'reading': 'Reading · Đọc',
    'writing': 'Writing · Viết',
    'speaking': 'Speaking · Nói',
    'bi-quyet': '5 bí quyết vàng'
  };

  function updateLevel(nextLevel) {
    if (!['B1', 'B2'].includes(nextLevel)) return;
    selectedLevel = nextLevel;
    document.querySelectorAll('[data-level]').forEach((button) => {
      const active = button.dataset.level === selectedLevel;
      button.setAttribute('aria-pressed', String(active));
      const caption = button.querySelector('.level-pick');
      if (caption) caption.textContent = active ? `✓ Đã chọn mục tiêu ${selectedLevel}` : `Chọn mục tiêu ${button.dataset.level}`;
    });
    document.querySelectorAll('.level-label').forEach((node) => { node.textContent = selectedLevel; });
    document.querySelectorAll('.focus-text').forEach((node) => {
      node.textContent = selectedLevel === 'B1' ? node.dataset.b1 : node.dataset.b2;
    });
  }

  function render() {
    const hash = decodeURIComponent(location.hash.slice(1));
    const index = slides.findIndex((slide) => slide.id === hash);
    current = index < 0 ? 0 : index;

    slides.forEach((slide, i) => { slide.hidden = i !== current; });
    tabs.forEach((tab, i) => {
      if (i === current) tab.setAttribute('aria-current', 'page');
      else tab.removeAttribute('aria-current');
    });
    document.body.dataset.theme = String(current);
    counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(TOTAL).padStart(2, '0')}`;
    prev.disabled = current === 0;
    next.innerHTML = current === TOTAL - 1 ? '<span>Về đầu</span> ↺' : '<span>Tiếp</span> →';
    main.scrollTop = 0;
    slides[current].scrollTop = 0;
    document.title = `${titles[slides[current].id] || 'VSTEP'} | CFL InfoSession B1 & B2`;
    if (modal.open) modal.close();
    dots.replaceChildren();
    slides.forEach((slide, i) => {
      const dot = document.createElement('span');
      if (i === current) dot.classList.add('active');
      dots.appendChild(dot);
    });
    details.textContent = current === 0 ? 'ⓘ Xem thông tin' : 'ⓘ Xem mẹo chi tiết';
  }

  function navigateTo(index) {
    const target = slides[Math.max(0, Math.min(TOTAL - 1, index))];
    if (target) {
      if (location.hash === `#${target.id}`) render();
      else location.hash = target.id;
    }
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', (e) => {
      if (location.hash === `#${slides[i].id}`) { e.preventDefault(); render(); }
    });
  });
  prev.addEventListener('click', () => navigateTo(current - 1));
  next.addEventListener('click', () => navigateTo(current === TOTAL - 1 ? 0 : current + 1));
  window.addEventListener('hashchange', render);
  document.querySelectorAll('[data-go]').forEach((button) => {
    button.addEventListener('click', () => {
      const idx = slides.findIndex((slide) => slide.id === button.dataset.go);
      if (idx >= 0) navigateTo(idx);
    });
  });
  document.querySelectorAll('[data-level]').forEach((button) => {
    button.addEventListener('click', () => updateLevel(button.dataset.level));
  });

  details.addEventListener('click', () => {
    const selectedId = slides[current].id;
    const template = document.getElementById(`detail-${selectedId}`);
    if (!template) return;
    modalBody.replaceChildren(template.content.cloneNode(true));
    modalTitle.textContent = `Thông tin chi tiết · ${titles[selectedId] || ''}`;
    modal.showModal();
    modal.scrollTop = 0;
  });
  document.getElementById('close-dialog').addEventListener('click', () => modal.close());
  modal.addEventListener('click', (e) => {
    if (e.target !== modal) return;
    const rect = modal.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) modal.close();
  });
  document.addEventListener('keydown', (e) => {
    if (modal.open || e.altKey || e.ctrlKey || e.metaKey) return;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); navigateTo(Math.min(current + 1, TOTAL - 1)); }
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); navigateTo(Math.max(current - 1, 0)); }
    if (e.key === 'Home') { e.preventDefault(); navigateTo(0); }
    if (e.key === 'End') { e.preventDefault(); navigateTo(TOTAL - 1); }
  });

  if (!document.fullscreenEnabled) fullscreen.hidden = true;
  fullscreen.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch (_err) {
      fullscreen.title = 'Bạn có thể dùng F11 để bật toàn màn hình';
    }
  });

  updateLevel('B1');
  render();
})();
