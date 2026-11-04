/* main.js – Gästehaus Teufele (Demo): Saison-Schalter, Schlüsselbrett, Preisrechner */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement, ROOMS = window.TEUFELE_ROOMS || {};
  const ART = { DZ: 'Doppelzimmer', EZ: 'Einzelzimmer' };
  const eur = v => v.toLocaleString('de-DE') + ' €';

  /* Saison */
  const snow = () => $$('canvas[data-particles="snow"]');
  const setSeason = (s, save) => {
    root.dataset.season = s;
    $$('[data-season-set]').forEach(b => b.setAttribute('aria-pressed', b.dataset.seasonSet === s));
    snow().forEach(cv => {
      if (s === 'winter') { cv.removeAttribute('data-off'); const r = cv.getBoundingClientRect(); if (cv.fxStart && r.bottom > 0 && r.top < innerHeight) cv.fxStart(); }
      else { cv.setAttribute('data-off', ''); cv.fxStop && cv.fxStop(); }
    });
    if (save) try { localStorage.setItem('teufele-saison', s); } catch (e) {}
    calc();
  };
  $$('[data-season-set]').forEach(b => b.addEventListener('click', () => setSeason(b.dataset.seasonSet, true)));

  /* Schlüsselbrett */
  const card = $('#room-card');
  const showRoom = (n, swing) => {
    const r = ROOMS[n]; if (!r || !card) return;
    $$('.fob').forEach(f => { const on = f.dataset.room === n; f.setAttribute('aria-pressed', on); f.closest('.hook').classList.toggle('taken', on); });
    if (swing) { const f = $(`.fob[data-room="${n}"]`); f.classList.remove('swing'); void f.offsetWidth; f.classList.add('swing'); }
    $$('[data-rc="no"],[data-rc="no2"],[data-rc="no3"]', card).forEach(x => x.textContent = n);
    $('[data-rc="art"]', card).textContent = ART[r.art];
    $('[data-rc="aus"]', card).innerHTML = r.aus.map(a => `<li>${a}</li>`).join('');
    const note = $('[data-rc="note"]', card); note.hidden = !r.note; note.textContent = r.note || '';
    $$('.pt tbody tr', card).forEach((tr, i) => { const p = i ? r.w : r.s; $$('td', tr).forEach((td, k) => td.textContent = p[k] + '\u00a0€'); });
    card.classList.remove('flip'); void card.offsetWidth; card.classList.add('flip');
    const sel = $('[data-rechner] select[name="room"]'); if (sel) { sel.value = n; calc(); }
  };
  $$('.fob').forEach(f => f.addEventListener('click', () => showRoom(f.dataset.room, true)));
  const ask = $('[data-room-ask]');
  if (ask) ask.addEventListener('click', () => { const n = $('[data-rc="no"]', card).textContent, s = $('.an-form select[name="zimmer"]'); if (s) s.value = n; });

  /* Preisrechner */
  const f = $('[data-rechner]');
  function calc() {
    if (!f) return;
    const r = ROOMS[f.room.value]; if (!r) return;
    const s = root.dataset.season === 'winter' ? r.w : r.s;
    let n = Math.round(+f.n.value || 0); const ok = n >= 2 && n <= 28;
    const ez = r.art === 'EZ';
    f.ad.querySelector('option[value="2"]').disabled = ez; if (ez) f.ad.value = '1';
    const ad = +f.ad.value, k = [+f.k1.value || 0, +f.k2.value || 0, +f.k3.value || 0];
    const out = $('.re-out', f);
    if (!ok) { $('.re-sum', out).textContent = '–'; $('.re-det', out).textContent = 'Der Rechner kennt die Preise ab 2 Nächten (bis 28). Für 1 Nacht bitte direkt anfragen.'; return; }
    const rate = n >= 7 ? s[2] : n >= 3 ? s[1] : s[0];
    const kids = k[0] * 35 + k[1] * 25 + k[2] * 18;
    const ezz = (!ez && ad === 1) ? 20 : 0, dog = f.dog.checked ? 6 : 0;
    const vegan = f.vegan.checked ? 5 * (ad + k[0] + k[1] + k[2]) : 0;
    const night = ad * rate + kids + ezz + dog + vegan, tot = night * n;
    $('.re-sum', out).textContent = 'ca. ' + eur(tot);
    const parts = [`${ad} × ${rate} € (Erw.)`];
    if (kids) parts.push(`Kinder ${kids} €`); if (ezz) parts.push('EZ-Zuschlag 20 €'); if (dog) parts.push('Hund 6 €'); if (vegan) parts.push(`vegan ${vegan} €`);
    $('.re-det', out).textContent = `${n} Nächte × ${eur(night)} pro Nacht (${parts.join(' + ')}) · ${root.dataset.season === 'winter' ? 'Winter' : 'Sommer'}preise, zzgl. Kurtaxe`;
  }
  if (f) { f.addEventListener('input', calc); f.addEventListener('change', calc); f.addEventListener('submit', e => e.preventDefault()); }

  // Start
  setSeason(root.dataset.season === 'winter' ? 'winter' : 'sommer', false);
  if (card) showRoom('10', false);
})();
