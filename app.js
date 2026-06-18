// ═══════════════════════════════════════
// LIFEOS — Core State & Navigation
// ═══════════════════════════════════════

const App = {
  state: {
    currentPage: 'planner',
    schedule: {},       // {dayIndex_hour: {label, color}}
    budget: {
      monthly: 0,
      categories: [],   // {id, name, amount, color}
    },
    foods: [],          // {id, name, emoji}
    exams: [],          // {id, name, cfu, grade}
    examTarget: 110,
    calendarUrl: '',
    cv: null,           // {text, name, analyzed: bool}
    jobs: [],
    github: { token: '', repo: '', user: '', connected: false },
    extensions: []
  },

  // ─── PERSIST ───
  save() {
    try {
      const data = { ...this.state, cv: this.state.cv ? { name: this.state.cv.name } : null };
      localStorage.setItem('lifeos_data', JSON.stringify(data));
    } catch(e) { console.warn('Save failed', e); }
  },

  load() {
    try {
      const raw = localStorage.getItem('lifeos_data');
      if (raw) {
        const parsed = JSON.parse(raw);
        this.state = { ...this.state, ...parsed };
      }
    } catch(e) { console.warn('Load failed', e); }
  },

  // ─── NAVIGATE ───
  navigate(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const pg = document.getElementById(`page-${page}`);
    const nav = document.querySelector(`[data-page="${page}"]`);
    if (pg) pg.classList.add('active');
    if (nav) nav.classList.add('active');

    this.state.currentPage = page;

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');

    // Re-render page
    if (page === 'planner') Planner.render();
    if (page === 'budget') Budget.render();
    if (page === 'food') Food.render();
    if (page === 'esami') Esami.render();
    if (page === 'jobs') Jobs.render();
    if (page === 'github') GitHub.render();
    if (page === 'extensions') Extensions.render();
  }
};

// ─── TOAST ───
function toast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${type === 'success' ? '✅' : '❌'}</span> ${msg}`;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// ─── MODAL ───
function openModal(id) {
  document.getElementById(id).classList.add('open');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

// ─── INIT ───
document.addEventListener('DOMContentLoaded', () => {
  App.load();

  // Nav bindings
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', () => App.navigate(item.dataset.page));
  });

  // Mobile hamburger
  const hamburger = document.getElementById('hamburger');
  if (hamburger) hamburger.addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });

  // Overlay close
  document.querySelectorAll('.modal-overlay').forEach(m => {
    m.addEventListener('click', (e) => {
      if (e.target === m) m.classList.remove('open');
    });
  });

  // Start on planner
  App.navigate('planner');

  // Auto-save every 30s
  setInterval(() => App.save(), 30000);
});
