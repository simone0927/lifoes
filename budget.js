// ═══════════════════════════════════════
// BUDGET — Monthly & Daily Allocator
// ═══════════════════════════════════════

const PALETTE = ['#7C3AED','#06B6D4','#10B981','#F59E0B','#F43F5E','#8B5CF6','#EC4899','#14B8A6'];

const Budget = {
  render() {
    this.renderSummary();
    this.renderCategories();
    this.renderChart();
  },

  renderSummary() {
    const monthly = App.state.budget.monthly || 0;
    const spent = App.state.budget.categories.reduce((a, c) => a + (c.amount || 0), 0);
    const remaining = monthly - spent;
    const daily = monthly / 30;

    const set = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
    set('budget-monthly', `€${monthly.toFixed(2)}`);
    set('budget-spent', `€${spent.toFixed(2)}`);
    set('budget-remaining', `€${Math.max(0, remaining).toFixed(2)}`);
    set('budget-daily', `€${daily.toFixed(2)}`);
    set('budget-daily-left', `€${(remaining/30).toFixed(2)}`);

    const bar = document.getElementById('budget-bar');
    if (bar && monthly > 0) {
      const pct = Math.min(100, (spent / monthly) * 100);
      bar.style.width = `${pct}%`;
      bar.style.background = pct > 90
        ? 'linear-gradient(90deg, #F43F5E, #FB7185)'
        : pct > 70
        ? 'linear-gradient(90deg, #F59E0B, #FCD34D)'
        : 'linear-gradient(90deg, #7C3AED, #06B6D4)';
    }

    // Update input
    const inp = document.getElementById('budget-input');
    if (inp && !inp.dataset.focused) inp.value = monthly || '';
  },

  renderCategories() {
    const list = document.getElementById('categories-list');
    if (!list) return;
    const cats = App.state.budget.categories;
    const total = cats.reduce((a,c) => a + (c.amount || 0), 0);

    list.innerHTML = cats.map((c, i) => `
      <div class="category-item">
        <div class="cat-color" style="background:${c.color}"></div>
        <span class="cat-name">${c.name}</span>
        <div style="flex:1;margin:0 10px;">
          <div class="progress-bar">
            <div class="progress-fill" style="width:${total > 0 ? Math.round(c.amount/total*100) : 0}%;background:${c.color}"></div>
          </div>
        </div>
        <span class="cat-amount font-mono">€${(c.amount||0).toFixed(2)}</span>
        <span class="cat-pct text-muted">${total > 0 ? Math.round(c.amount/total*100) : 0}%</span>
        <button class="btn btn-danger btn-sm" style="margin-left:8px" onclick="Budget.deleteCategory(${i})">×</button>
      </div>
    `).join('') || '<p class="text-muted text-sm" style="padding:8px 0">Nessuna categoria aggiunta.</p>';
  },

  renderChart() {
    const canvas = document.getElementById('budget-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cats = App.state.budget.categories;
    const total = cats.reduce((a,c) => a + (c.amount||0), 0);
    if (!total) { ctx.clearRect(0,0,canvas.width,canvas.height); return; }

    const W = canvas.width, H = canvas.height;
    const cx = W/2, cy = H/2, r = Math.min(W,H)/2 - 20;
    ctx.clearRect(0,0,W,H);

    let start = -Math.PI/2;
    cats.forEach(c => {
      const slice = (c.amount / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, start + slice);
      ctx.closePath();
      ctx.fillStyle = c.color;
      ctx.fill();
      start += slice;
    });

    // Donut hole
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.55, 0, Math.PI*2);
    ctx.fillStyle = '#16162A';
    ctx.fill();

    // Center text
    ctx.fillStyle = '#F8F8FF';
    ctx.font = 'bold 14px Space Grotesk';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`€${total.toFixed(0)}`, cx, cy);
  },

  addCategory() {
    const name = document.getElementById('cat-name')?.value.trim();
    const amount = parseFloat(document.getElementById('cat-amount')?.value) || 0;
    if (!name) { toast('Inserisci un nome', 'error'); return; }

    const idx = App.state.budget.categories.length;
    App.state.budget.categories.push({
      id: Date.now(),
      name,
      amount,
      color: PALETTE[idx % PALETTE.length]
    });

    document.getElementById('cat-name').value = '';
    document.getElementById('cat-amount').value = '';
    App.save();
    this.render();
    toast(`Categoria "${name}" aggiunta!`);
  },

  deleteCategory(i) {
    App.state.budget.categories.splice(i, 1);
    App.save();
    this.render();
    toast('Categoria rimossa');
  },

  setMonthly(val) {
    App.state.budget.monthly = parseFloat(val) || 0;
    App.save();
    this.renderSummary();
    this.renderChart();
  }
};
