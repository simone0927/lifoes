// ═══════════════════════════════════════
// FOOD — Random Meal Picker
// ═══════════════════════════════════════

const DEFAULT_FOODS = [
  { id: 1, name: 'Pasta al pomodoro', emoji: '🍝' },
  { id: 2, name: 'Pizza margherita', emoji: '🍕' },
  { id: 3, name: 'Risotto ai funghi', emoji: '🍚' },
  { id: 4, name: 'Insalata mista', emoji: '🥗' },
  { id: 5, name: 'Pollo alla griglia', emoji: '🍗' },
  { id: 6, name: 'Sushi', emoji: '🍱' },
  { id: 7, name: 'Burger', emoji: '🍔' },
  { id: 8, name: 'Minestrone', emoji: '🥣' },
];

const Food = {
  render() {
    if (!App.state.foods.length) {
      App.state.foods = [...DEFAULT_FOODS];
      App.save();
    }
    this.renderList();
  },

  renderList() {
    const list = document.getElementById('food-list');
    if (!list) return;
    list.innerHTML = App.state.foods.map((f, i) => `
      <div class="food-item">
        <span class="emoji">${f.emoji}</span>
        <span class="fname">${f.name}</span>
        <button class="btn btn-danger btn-sm" onclick="Food.remove(${i})">×</button>
      </div>
    `).join('');
  },

  spin() {
    if (!App.state.foods.length) { toast('Aggiungi almeno un piatto!', 'error'); return; }
    const display = document.getElementById('food-display');
    display.classList.add('spinning');
    setTimeout(() => display.classList.remove('spinning'), 500);

    const choice = App.state.foods[Math.floor(Math.random() * App.state.foods.length)];
    document.getElementById('food-emoji').textContent = choice.emoji;
    document.getElementById('food-name').textContent = choice.name;
  },

  add() {
    const name = document.getElementById('food-input')?.value.trim();
    const emoji = document.getElementById('food-emoji-input')?.value.trim() || '🍽️';
    if (!name) { toast('Inserisci il nome del piatto!', 'error'); return; }

    App.state.foods.push({ id: Date.now(), name, emoji });
    document.getElementById('food-input').value = '';
    document.getElementById('food-emoji-input').value = '';
    App.save();
    this.renderList();
    toast(`"${name}" aggiunto!`);
  },

  remove(i) {
    App.state.foods.splice(i, 1);
    App.save();
    this.renderList();
    toast('Piatto rimosso');
  }
};


// ═══════════════════════════════════════
// ESAMI — University Grade Tracker
// ═══════════════════════════════════════

const Esami = {
  render() {
    this.renderStats();
    this.renderTable();
    this.renderTarget();
  },

  renderStats() {
    const exams = App.state.exams;
    const done = exams.filter(e => e.grade);
    const totalCFU = exams.reduce((a,e) => a + (e.cfu||0), 0);
    const doneCFU = done.reduce((a,e) => a + (e.cfu||0), 0);
    const weightedSum = done.reduce((a,e) => a + (e.grade * e.cfu), 0);
    const media = doneCFU ? (weightedSum / doneCFU).toFixed(2) : '—';
    const mediaLode = doneCFU ? ((weightedSum / doneCFU) * 11/10).toFixed(2) : '—';

    const set = (id, v) => { const el = document.getElementById(id); if(el) el.textContent = v; };
    set('exam-media', media);
    set('exam-cfu-done', doneCFU);
    set('exam-cfu-total', totalCFU);
    set('exam-count', `${done.length}/${exams.length}`);
    set('exam-media-lode', mediaLode !== '—' ? `${mediaLode}/110` : '—');
  },

  renderTable() {
    const tbody = document.getElementById('exam-tbody');
    if (!tbody) return;

    tbody.innerHTML = App.state.exams.map((e, i) => {
      const g = e.grade;
      const cls = g >= 28 ? 'grade-high' : g >= 24 ? 'grade-mid' : 'grade-low';
      return `
        <tr>
          <td>${e.name}</td>
          <td><span class="tag tag-violet">${e.cfu} CFU</span></td>
          <td>
            ${g ? `<span class="grade-badge ${cls}">${g}${e.lode ? 'L' : ''}</span>` : '<span class="text-muted text-sm">—</span>'}
          </td>
          <td>${e.date || '<span class="text-muted">—</span>'}</td>
          <td>
            <button class="btn btn-secondary btn-sm" onclick="Esami.edit(${i})">✏️</button>
            <button class="btn btn-danger btn-sm" onclick="Esami.remove(${i})">×</button>
          </td>
        </tr>`;
    }).join('') || `<tr><td colspan="5" class="text-muted text-sm" style="text-align:center;padding:20px">Nessun esame inserito</td></tr>`;
  },

  renderTarget() {
    const target = App.state.examTarget || 110;
    const done = App.state.exams.filter(e => e.grade);
    if (!done.length) return;

    const doneCFU = done.reduce((a,e) => a + e.cfu, 0);
    const weightedSum = done.reduce((a,e) => a + (e.grade * e.cfu), 0);
    const currentMedia = weightedSum / doneCFU;

    // Remaining exams
    const missing = App.state.exams.filter(e => !e.grade);
    const missingCFU = missing.reduce((a,e) => a + e.cfu, 0);

    if (missingCFU > 0) {
      const neededTotal = target * (doneCFU + missingCFU);
      const needed = (neededTotal - weightedSum) / missingCFU;
      const neededEl = document.getElementById('needed-grade');
      if (neededEl) neededEl.textContent = needed > 30 ? `>30 (impossibile)` : needed < 18 ? '18 (facilissimo)' : needed.toFixed(1);
    }
  },

  add() {
    const name = document.getElementById('exam-name')?.value.trim();
    const cfu = parseInt(document.getElementById('exam-cfu')?.value) || 0;
    const grade = parseInt(document.getElementById('exam-grade')?.value) || null;
    const lode = document.getElementById('exam-lode')?.checked;
    const date = document.getElementById('exam-date')?.value;

    if (!name || !cfu) { toast('Inserisci nome e CFU!', 'error'); return; }

    App.state.exams.push({ id: Date.now(), name, cfu, grade, lode, date });
    ['exam-name','exam-cfu','exam-grade','exam-date'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    App.save();
    this.render();
    closeModal('modal-exam');
    toast(`Esame "${name}" aggiunto!`);
  },

  remove(i) {
    App.state.exams.splice(i, 1);
    App.save();
    this.render();
  },

  edit(i) {
    const e = App.state.exams[i];
    document.getElementById('exam-name').value = e.name;
    document.getElementById('exam-cfu').value = e.cfu;
    document.getElementById('exam-grade').value = e.grade || '';
    document.getElementById('exam-date').value = e.date || '';
    App.state.exams.splice(i, 1);
    App.save();
    this.render();
    openModal('modal-exam');
  },

  setTarget() {
    const t = parseInt(document.getElementById('target-input')?.value) || 110;
    App.state.examTarget = t;
    App.save();
    this.renderTarget();
    toast(`Obiettivo impostato: ${t}/110`);
  },

  importCalendar() {
    const url = document.getElementById('calendar-url')?.value.trim();
    if (!url) { toast('Inserisci un URL Google Calendar', 'error'); return; }
    App.state.calendarUrl = url;
    App.save();
    toast('URL calendario salvato! (Integrazione via Google Calendar API)');
  }
};


// ═══════════════════════════════════════
// JOBS — CV & Job Search
// ═══════════════════════════════════════

const Jobs = {
  render() {
    const cv = App.state.cv;
    const cvSection = document.getElementById('cv-section');
    const jobSection = document.getElementById('job-section');

    if (cv) {
      if (cvSection) cvSection.style.display = 'block';
      document.getElementById('cv-filename').textContent = cv.name;
    }
    if (jobSection) {
      this.renderJobs();
    }
  },

  handleDrop(e) {
    e.preventDefault();
    document.getElementById('cv-dropzone').classList.remove('dragover');
    const file = e.dataTransfer?.files[0] || e.target.files?.[0];
    if (file) this.processCV(file);
  },

  processCV(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      App.state.cv = { name: file.name, text: e.target.result.substring(0, 4000) };
      App.save();
      toast(`CV "${file.name}" caricato!`);
      this.render();
      document.getElementById('cv-uploaded').style.display = 'block';
      document.getElementById('cv-dropzone').style.display = 'none';
    };
    reader.readAsText(file);
  },

  async searchJobs() {
    const keywords = document.getElementById('job-keywords')?.value.trim();
    const location = document.getElementById('job-location')?.value.trim() || 'Italia';
    if (!keywords) { toast('Inserisci parole chiave', 'error'); return; }

    const btn = document.getElementById('search-jobs-btn');
    if (btn) { btn.textContent = '⏳ Ricerca...'; btn.disabled = true; }

    // Build search URL for LinkedIn and Indeed
    const linkedinUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keywords)}&location=${encodeURIComponent(location)}`;
    const indeedUrl = `https://it.indeed.com/jobs?q=${encodeURIComponent(keywords)}&l=${encodeURIComponent(location)}`;
    const infojobsUrl = `https://www.infojobs.it/offerte-lavoro/offerte-lavoro.xhtml?keyword=${encodeURIComponent(keywords)}&provincia=${encodeURIComponent(location)}`;

    // Show platforms
    const jobList = document.getElementById('job-list');
    if (jobList) {
      jobList.innerHTML = `
        <div class="card" style="margin-bottom:12px">
          <div class="card-title">🔗 Cerca su queste piattaforme</div>
          <div style="display:flex;flex-direction:column;gap:8px">
            <a href="${linkedinUrl}" target="_blank" class="btn btn-primary">
              💼 LinkedIn — ${keywords} in ${location}
            </a>
            <a href="${indeedUrl}" target="_blank" class="btn btn-secondary">
              🔍 Indeed — ${keywords} in ${location}
            </a>
            <a href="${infojobsUrl}" target="_blank" class="btn btn-secondary">
              📋 InfoJobs — ${keywords} in ${location}
            </a>
          </div>
        </div>
      `;

      // AI-powered analysis if CV is loaded
      if (App.state.cv) {
        jobList.innerHTML += `
          <div class="card">
            <div class="card-title">🤖 Analisi AI del tuo CV</div>
            <div id="ai-analysis"><p class="text-muted text-sm">Analisi in corso...</p></div>
          </div>`;

        try {
          const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'claude-sonnet-4-6',
              max_tokens: 1000,
              messages: [{
                role: 'user',
                content: `Analizza questo CV e per la ricerca di lavoro "${keywords}" in "${location}", fornisci:
1. 3-5 punti di forza del CV per questa posizione
2. 3 suggerimenti per migliorare il CV
3. 3 titoli di posizione alternativi da cercare
4. Livello di compatibilità (Alta/Media/Bassa) con motivazione

CV (estratto):
${App.state.cv.text}

Rispondi in italiano, in modo conciso e pratico.`
              }]
            })
          });
          const data = await response.json();
          const text = data.content?.[0]?.text || 'Analisi non disponibile';
          document.getElementById('ai-analysis').innerHTML = `<div style="font-size:0.875rem;line-height:1.7;white-space:pre-wrap">${text}</div>`;
        } catch(e) {
          document.getElementById('ai-analysis').innerHTML = '<p class="text-muted text-sm">Analisi AI non disponibile. Controlla la connessione.</p>';
        }
      }
    }

    if (btn) { btn.textContent = '🔍 Cerca Posizioni'; btn.disabled = false; }
  },

  renderJobs() {
    // Jobs are displayed dynamically via searchJobs()
  },

  removeCV() {
    App.state.cv = null;
    App.save();
    document.getElementById('cv-dropzone').style.display = 'block';
    document.getElementById('cv-uploaded').style.display = 'none';
    toast('CV rimosso');
  }
};


// ═══════════════════════════════════════
// GITHUB — Save & Sync Data
// ═══════════════════════════════════════

const GitHub = {
  render() {
    const gh = App.state.github;
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
    set('gh-token', gh.token || '');
    set('gh-user', gh.user || '');
    set('gh-repo', gh.repo || '');
    this.updateStatus();
  },

  updateStatus() {
    const dot = document.getElementById('gh-status-dot');
    const txt = document.getElementById('gh-status-txt');
    const connected = App.state.github.connected;
    if (dot) dot.className = `status-dot ${connected ? 'ok' : 'idle'}`;
    if (txt) txt.textContent = connected ? 'Connesso' : 'Non configurato';
  },

  saveConfig() {
    App.state.github.token = document.getElementById('gh-token')?.value.trim();
    App.state.github.user = document.getElementById('gh-user')?.value.trim();
    App.state.github.repo = document.getElementById('gh-repo')?.value.trim();
    App.save();
    toast('Configurazione GitHub salvata!');
  },

  log(msg, type = 'info') {
    const panel = document.getElementById('gh-log');
    if (!panel) return;
    const line = document.createElement('div');
    line.className = `log-${type}`;
    line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    panel.appendChild(line);
    panel.scrollTop = panel.scrollHeight;
  },

  async testConnection() {
    const { token, user } = App.state.github;
    if (!token || !user) { toast('Inserisci token e username', 'error'); return; }

    this.log('Test connessione GitHub...', 'info');
    try {
      const r = await fetch(`https://api.github.com/users/${user}`, {
        headers: { 'Authorization': `token ${token}` }
      });
      if (r.ok) {
        const data = await r.json();
        App.state.github.connected = true;
        App.save();
        this.updateStatus();
        this.log(`✅ Connesso come ${data.name || user}`, 'ok');
        toast('Connessione riuscita!');
      } else {
        this.log(`❌ Errore: ${r.status} - controlla token e username`, 'err');
        toast('Connessione fallita', 'error');
      }
    } catch(e) {
      this.log(`❌ Errore di rete: ${e.message}`, 'err');
      toast('Errore di rete', 'error');
    }
  },

  async pushData() {
    const { token, user, repo } = App.state.github;
    if (!token || !user || !repo) {
      toast('Configura prima GitHub (token, username, repo)', 'error');
      return;
    }

    this.log('Preparazione dati...', 'info');
    const content = JSON.stringify(App.state, null, 2);
    const encoded = btoa(unescape(encodeURIComponent(content)));
    const path = 'lifeos-data.json';

    this.log(`Invio a ${user}/${repo}/${path}...`, 'info');

    // Check if file exists (to get SHA)
    let sha = null;
    try {
      const check = await fetch(`https://api.github.com/repos/${user}/${repo}/contents/${path}`, {
        headers: { 'Authorization': `token ${token}` }
      });
      if (check.ok) {
        const existing = await check.json();
        sha = existing.sha;
        this.log('File esistente trovato, aggiornamento...', 'info');
      }
    } catch(e) { /* file doesn't exist yet */ }

    // Push
    try {
      const body = {
        message: `LifeOS data sync — ${new Date().toLocaleString()}`,
        content: encoded,
        ...(sha ? { sha } : {})
      };

      const r = await fetch(`https://api.github.com/repos/${user}/${repo}/contents/${path}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (r.ok) {
        this.log(`✅ Dati salvati su GitHub (${new Date().toLocaleTimeString()})`, 'ok');
        toast('Dati sincronizzati su GitHub!');
      } else {
        const err = await r.json();
        this.log(`❌ Errore: ${err.message}`, 'err');
        toast('Errore salvataggio', 'error');
      }
    } catch(e) {
      this.log(`❌ Errore: ${e.message}`, 'err');
      toast('Errore di rete', 'error');
    }
  },

  async pullData() {
    const { token, user, repo } = App.state.github;
    if (!token || !user || !repo) { toast('Configura prima GitHub', 'error'); return; }

    this.log('Download dati da GitHub...', 'info');
    try {
      const r = await fetch(`https://api.github.com/repos/${user}/${repo}/contents/lifeos-data.json`, {
        headers: { 'Authorization': `token ${token}` }
      });
      if (r.ok) {
        const data = await r.json();
        const decoded = decodeURIComponent(escape(atob(data.content)));
        const parsed = JSON.parse(decoded);
        App.state = { ...App.state, ...parsed };
        App.save();
        this.log('✅ Dati scaricati e applicati', 'ok');
        toast('Dati ripristinati da GitHub!');
        App.navigate(App.state.currentPage || 'planner');
      } else {
        this.log('❌ File non trovato su GitHub', 'err');
        toast('File non trovato su GitHub', 'error');
      }
    } catch(e) {
      this.log(`❌ Errore: ${e.message}`, 'err');
      toast('Errore download', 'error');
    }
  },

  exportLocal() {
    const blob = new Blob([JSON.stringify(App.state, null, 2)], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `lifeos-backup-${Date.now()}.json`;
    a.click();
    toast('Backup esportato!');
  },

  importLocal() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          App.state = { ...App.state, ...data };
          App.save();
          toast('Backup importato!');
          App.navigate('planner');
        } catch { toast('File non valido', 'error'); }
      };
      reader.readAsText(file);
    };
    input.click();
  }
};


// ═══════════════════════════════════════
// EXTENSIONS — Plugin system
// ═══════════════════════════════════════

const AVAILABLE_EXTENSIONS = [
  { id: 'pomodoro', name: 'Pomodoro Timer', icon: '🍅', desc: 'Timer Pomodoro con statistiche sessioni', tag: 'Produttività' },
  { id: 'habits', name: 'Habit Tracker', icon: '✅', desc: 'Traccia le tue abitudini quotidiane', tag: 'Benessere' },
  { id: 'notes', name: 'Note Veloci', icon: '📝', desc: 'Appunti rapidi con markdown', tag: 'Organizzazione' },
  { id: 'expenses', name: 'Spese Giornaliere', icon: '💳', desc: 'Log spese in tempo reale', tag: 'Finanza' },
  { id: 'goals', name: 'Obiettivi', icon: '🎯', desc: 'Imposta e traccia obiettivi a lungo termine', tag: 'Crescita' },
  { id: 'contacts', name: 'Rubrica', icon: '👥', desc: 'Gestisci contatti importanti', tag: 'Relazioni' },
  { id: 'books', name: 'Lista Libri', icon: '📚', desc: 'Tieni traccia dei libri letti e da leggere', tag: 'Cultura' },
  { id: 'workout', name: 'Workout Log', icon: '💪', desc: 'Registra allenamenti e progressi', tag: 'Sport' },
  { id: 'travel', name: 'Viaggi', icon: '✈️', desc: 'Pianifica e organizza i tuoi viaggi', tag: 'Avventura' },
  { id: 'movies', name: 'Watchlist', icon: '🎬', desc: 'Film e serie da vedere', tag: 'Entertainment' },
  { id: 'recipes', name: 'Ricettario', icon: '👨‍🍳', desc: 'Salva e organizza le tue ricette', tag: 'Cucina' },
  { id: 'ai-coach', name: 'AI Life Coach', icon: '🤖', desc: 'Consigli personalizzati basati sui tuoi dati', tag: 'AI' },
];

const Extensions = {
  render() {
    const grid = document.getElementById('ext-grid');
    if (!grid) return;

    grid.innerHTML = AVAILABLE_EXTENSIONS.map(ext => {
      const installed = App.state.extensions.includes(ext.id);
      return `
        <div class="ext-card" onclick="Extensions.toggle('${ext.id}')">
          <div class="ext-icon">${ext.icon}</div>
          <h3>${ext.name}</h3>
          <p>${ext.desc}</p>
          <div style="margin-top:12px;display:flex;align-items:center;justify-content:space-between">
            <span class="tag tag-violet">${ext.tag}</span>
            <span class="${installed ? 'tag tag-green' : 'tag tag-cyan'}">${installed ? '✓ Installata' : '+ Aggiungi'}</span>
          </div>
        </div>`;
    }).join('');
  },

  toggle(id) {
    const idx = App.state.extensions.indexOf(id);
    if (idx > -1) {
      App.state.extensions.splice(idx, 1);
      toast('Estensione rimossa');
    } else {
      App.state.extensions.push(id);
      toast(`Estensione attivata! (Coming soon)`);
    }
    App.save();
    this.render();
  }
};
