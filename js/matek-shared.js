/* Common session counter and statistics for all exercises. */
(function () {
  'use strict';
  const fmt = sec => {
    const n = Math.max(0, Math.floor(sec));
    return String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0');
  };
  function create({anchor, modal, title}) {
    const target = document.querySelector(anchor);
    if (!target) throw new Error('MatekShared: missing anchor ' + anchor);
    const hud = document.createElement('div');
    hud.className = 'matek-session-info';
    hud.innerHTML = '<div class="matek-session-item"><span>Gyakorlási idő</span><strong data-matek-time>00:00</strong></div><div class="matek-session-item"><span>Megoldott feladatok</span><strong data-matek-count>0</strong></div>';
    target.insertAdjacentElement('afterend', hud);
    let started = performance.now(), pauseAt = null, pausedMs = 0, entries = [];
    const seconds = () => ((pauseAt ?? performance.now()) - started - pausedMs) / 1000;
    const refresh = () => {
      hud.querySelector('[data-matek-time]').textContent = fmt(seconds());
      hud.querySelector('[data-matek-count]').textContent = entries.length;
    };
    setInterval(refresh, 1000);
    const dialog = modal ? document.querySelector(modal) : null;
    let summary;
    if (dialog) {
      const oldSummary = dialog.querySelector('.summary-grid');
      if (oldSummary) oldSummary.style.display = 'none';
      summary = document.createElement('div');
      summary.className = 'matek-stats-summary';
      const heading = dialog.querySelector('.modal-header');
      if (heading) heading.insertAdjacentElement('afterend', summary);
    }
    const renderSummary = () => {
      if (!summary) return;
      const correct = entries.filter(x => x.correct).length;
      const times = entries.map(x => x.seconds).filter(Number.isFinite).sort((a,b)=>a-b);
      const mid = Math.floor(times.length / 2);
      const median = times.length ? (times.length % 2 ? times[mid] : (times[mid-1]+times[mid])/2) : null;
      summary.innerHTML = '<div><strong>' + entries.length + '</strong><span>Feladat</span></div>' +
        '<div><strong>' + correct + '</strong><span>Helyes</span></div>' +
        '<div><strong>' + (entries.length ? Math.round(correct/entries.length*100) : 0) + '%</strong><span>Helyesség</span></div>' +
        '<div><strong>' + (median === null ? '–' : median.toFixed(1) + ' mp') + '</strong><span>Medián idő</span></div>' +
        '<p>Gyakorlási idő: ' + fmt(seconds()) + '</p>';
    };
    if (dialog) {
      const observer = new MutationObserver(() => {
        if (dialog.classList.contains('show')) {
          if (pauseAt === null) pauseAt = performance.now();
          renderSummary();
        } else if (pauseAt !== null) {
          pausedMs += performance.now() - pauseAt;
          pauseAt = null;
        }
      });
      observer.observe(dialog, {attributes:true, attributeFilter:['class']});
    }
    refresh();
    return {
      record(entry) {
        entries.push({correct: !!entry.correct, seconds: Number(entry.seconds) || 0});
        refresh();
        renderSummary();
      },
      reset() {
        entries = [];
        started = performance.now();
        pauseAt = null;
        pausedMs = 0;
        refresh();
        renderSummary();
      },
      showOwnStats() {
        if (dialog) return;
        let own = document.getElementById('matekOwnStats');
        if (!own) {
          own = document.createElement('div');
          own.id = 'matekOwnStats';
          own.className = 'modal-backdrop';
          own.innerHTML = '<div class="modal"><div class="modal-header"><h2>Gyakorlás eredménye</h2><button type="button" class="secondary" data-matek-close>Bezárás</button></div><div class="matek-stats-summary"></div></div>';
          document.body.appendChild(own);
          own.querySelector('[data-matek-close]').addEventListener('click',()=>own.classList.remove('show'));
          own.addEventListener('click',e=>{if(e.target===own)own.classList.remove('show')});
        }
        const c=entries.filter(x=>x.correct).length;
        own.querySelector('.matek-stats-summary').innerHTML = '<div><strong>'+entries.length+'</strong><span>Feladat</span></div><div><strong>'+c+'</strong><span>Helyes</span></div><div><strong>'+(entries.length?Math.round(c/entries.length*100):0)+'%</strong><span>Helyesség</span></div><div><strong>'+fmt(seconds())+'</strong><span>Gyakorlási idő</span></div>';
        own.classList.add('show');
      }
    };
  }
  window.MatekShared = {create};
})();
