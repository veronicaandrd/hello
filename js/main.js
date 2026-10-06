(() => {
  const $ = id => document.getElementById(id);
  const root = document.documentElement;

  /* Home link: scroll up if already on the homepage */
  $('home').addEventListener('click', e => {
    if (location.pathname === '/' || location.pathname.endsWith('index.html')) {
      e.preventDefault(); window.scrollTo({top:0,behavior:'smooth'});
    }
  });

  /* Banner -> scroll to Contact, then highlight it once it's in view */
  const contact = $('contact');
  document.querySelector('.banner')?.addEventListener('click', e => {
    e.preventDefault();
    history.replaceState(null, '', '#contact');
    contact.scrollIntoView({behavior:'smooth', block:'center'});
    contact.classList.remove('flash'); void contact.offsetWidth; // restart animation
    contact.classList.add('flash');
  });
  contact?.addEventListener('animationend', e => { if (e.target === contact || e.target.tagName === 'H2') contact.classList.remove('flash'); });

  /* Local time (UTC-3) */
  const fmt = new Intl.DateTimeFormat('en-US',{hour:'numeric',minute:'2-digit',timeZone:'Etc/GMT+3'});
  const tick = () => { $('time').textContent = fmt.format(new Date()); };
  tick(); setInterval(tick, 15000);

  /* Theme */
  const setTheme = t => {
    root.dataset.theme = t;
    $('theme-label').textContent = t === 'dark' ? 'Light' : 'Dark';
    try { localStorage.setItem('theme', t); } catch(e){}
  };
  let saved = null; try { saved = localStorage.getItem('theme'); } catch(e){}
  setTheme(saved || 'light');
  $('theme').addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));

  /* Top button appears after scrolling a while */
  const top = $('top');
  const onScroll = () => top.classList.toggle('show', window.scrollY > 500);
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();
  $('top-btn').addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));

  /* Copy email */
  let t;
  $('copy')?.addEventListener('click', async e => {
    const btn = e.currentTarget;
    try { await navigator.clipboard.writeText(btn.dataset.email); }
    catch(_) { const i = document.createElement('input'); i.value = btn.dataset.email; document.body.append(i); i.select(); document.execCommand('copy'); i.remove(); }
    $('copy-label').textContent = 'Copied!';
    $('copy-icon').innerHTML = '<path d="M5 12l5 5L20 7"/>';
    clearTimeout(t);
    t = setTimeout(() => {
      $('copy-label').textContent = 'Copy';
      $('copy-icon').innerHTML = '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>';
    }, 1800);
  });

  /* Carousel: caption follows the slide closest to the viewport's middle */
  const track = $('track'), cap = $('caption');
  const slides = track ? [...track.querySelectorAll('.slide')] : [];
  let current = -1, raf;
  const show = i => {
    if (i === current) return;
    const first = current === -1; current = i;
    const s = slides[i];
    const apply = () => {
      cap.innerHTML = '';
      const b = document.createElement('b'); b.textContent = s.dataset.title;
      cap.append(b, ' ' + s.dataset.caption);
      cap.classList.remove('swap');
    };
    if (first) return apply();
    cap.classList.add('swap'); setTimeout(apply, 200);
  };
  const update = () => {
    if (!slides.length) return;
    const mid = window.innerWidth / 2; let best = 0, bd = Infinity;
    slides.forEach((s, i) => {
      const r = s.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - mid);
      if (d < bd) { bd = d; best = i; }
    });
    show(best);
  };
  track?.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, {passive:true});
  window.addEventListener('resize', update);
  if (track) { track.scrollLeft = 0; update(); }
})();
