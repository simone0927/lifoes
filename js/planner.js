// ═══════════════════════════════════════
// PLANNER — Weekly Time Scheduler
// ═══════════════════════════════════════

const DAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
const HOURS = Array.from({length: 17}, (_, i) => i + 7); // 7:00 – 23:00

const ACTIVITY_COLORS = {
  studio: { bg: 'rgba(124,58,237,0.35)', border: '#7C3AED', label: '📚 Studio' },
  lavoro: { bg: 'rgba(6,182,212,0.3)', border: '#06B6D4', label: '💼 Lavoro' },
  sport: { bg: 'rgba(16,185,129,0.3)', border: '#10B981', label: '🏃 Sport' },
  hobby: { bg: 'rgba(245,158,11,0.25)', border: '#F59E0B', label: '🎨 Hobby' },
  riposo: { bg: 'rgba(244,63,94,0.2)', border: '#F43F5E', label: '😴 Riposo' },
  personale: { bg: 'rgba(167,139,250,0.25)', border: '#A78BFA', label: '🧘 Personale' },
};

let plannerMode = {
  selectedActivity: 'studio',
  isDragging: false,
  customLabel: ''
};

const Planner = {
  render() {
    const grid = document.getElementById('week-grid');
    if (!grid) return;

    grid.innerHTML = '';

    // Corner
    const corner = document.createElement('div');
    corner.className = 'week-header';
    corner.textContent = 'Ora';
    grid.appendChild(corner);

    // Day headers
    const today = new Date().getDay();
    const todayMap = [6,0,1,2,3,4,5]; // Mon=0...Sun=6
    DAYS.forEach((d, i) => {
      const h = document.createElement('div');
      h.className = 'week-header' + (todayMap[today] === i ? ' today' : '');
      h.textContent = d;
      grid.appendChild(h);
    });

    // Time rows
    HOURS.forEach(hour => {
      const lbl = document.createElement('div');
      lbl.className = 'time-label';
      lbl.textContent = `${hour}:00`;
      grid.appendChild(lbl);

      DAYS.forEach((_, dayIdx) => {
        const key = `${dayIdx}_${hour}`;
        const cell = document.createElement('div');
        cell.className = 'time-cell';
        cell.dataset.key = key;

        const entry = App.state.schedule[key];
        if (entry) {
          cell.classList.add('filled');
          cell.dataset.label = entry.label;
          const col = ACTIVITY_COLORS[entry.activity] || ACTIVITY_COLORS.studio;
          cell.style.background = col.bg;
          cell.style.borderColor = col.border;
        }

        cell.addEventListener('mousedown', () => {
          plannerMode.isDragging = true;
          this.toggleCell(key, cell);
        });
        cell.addEventListener('mouseenter', () => {
          if (plannerMode.isDragging) this.toggleCell(key, cell);
        });
        cell.addEventListener('mouseup', () => { plannerMode.isDragging = false; });

        grid.appendChild(cell);
      });
    });

    document.addEventListener('mouseup', () => { plannerMode.isDragging = false; });

    this.updateStats();
  },

  toggleCell(key, cell) {
    if (App.state.schedule[key]) {
      delete App.state.schedule[key];
      cell.classList.remove('filled');
      cell.style.background = '';
      cell.style.borderColor = '';
      cell.dataset.label = '';
    } else {
      const act = plannerMode.selectedActivity;
      const customLabel = document.getElementById('custom-label')?.value || '';
      const col = ACTIVITY_COLORS[act];
      App.state.schedule[key] = {
        activity: act,
        label: customLabel || col.label
      };
      cell.classList.add('filled');
      cell.dataset.label = App.state.schedule[key].label;
      cell.style.background = col.bg;
      cell.style.borderColor = col.border;
    }
    this.updateStats();
    App.save();
  },

  updateStats() {
    const counts = {};
    Object.values(App.state.schedule).forEach(e => {
      counts[e.activity] = (counts[e.activity] || 0) + 1;
    });

    const statsEl = document.getElementById('planner-stats');
    if (!statsEl) return;

    const total = Object.values(counts).reduce((a,b) => a+b, 0);
    statsEl.innerHTML = Object.entries(ACTIVITY_COLORS).map(([key, col]) => {
      const hrs = counts[key] || 0;
      if (!hrs) return '';
      return `
        <div class="category-item">
          <div class="cat-color" style="background:${col.border}"></div>
          <span class="cat-name">${col.label}</span>
          <span class="cat-amount font-mono">${hrs}h</span>
          <span class="cat-pct text-muted">${Math.round(hrs/total*100)}%</span>
        </div>`;
    }).join('') || '<p class="text-muted text-sm">Nessuna attività pianificata.</p>';

    // Weekly total
    const totalEl = document.getElementById('planner-total');
    if (totalEl) totalEl.textContent = `${total}h pianificate`;
  },

  clearAll() {
    if (confirm('Cancellare tutto il planning settimanale?')) {
      App.state.schedule = {};
      this.render();
      App.save();
      toast('Planning cancellato');
    }
  },

  exportText() {
    const lines = ['=== PLANNING SETTIMANALE ===\n'];
    DAYS.forEach((day, dayIdx) => {
      const dayEntries = HOURS
        .filter(h => App.state.schedule[`${dayIdx}_${h}`])
        .map(h => `  ${h}:00 - ${App.state.schedule[`${dayIdx}_${h}`].label}`);
      if (dayEntries.length) {
        lines.push(`${day}:`);
        lines.push(...dayEntries);
      }
    });
    const blob = new Blob([lines.join('\n')], {type: 'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'planning.txt';
    a.click();
    toast('Planning esportato!');
  }
};

// Activity selector
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.activity-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.activity-btn').forEach(b => b.classList.remove('active-act'));
      btn.classList.add('active-act');
      plannerMode.selectedActivity = btn.dataset.act;
    });
  });
});
