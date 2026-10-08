/* ════════════════════════════════════════════════════════════
   SETTINGS. Everything Kenya might want changed lives here.
   ════════════════════════════════════════════════════════════ */
var CONFIG = {
  phone: '+14143881130',
  instagram: 'doitfortae_',

  // Stripe Payment Link for the $15 deposit (Apple Pay + card).
  // Paste the link from the Stripe dashboard, e.g. 'https://buy.stripe.com/abc123'
  // In Stripe, set the link's "After payment" redirect to:
  //   https://YOUR-SITE.vercel.app/?deposit=paid#book
  depositLink: 'https://buy.stripe.com/fZucN4bB49VfdFEcTd8Vi00',
  deposit: 15,

  // Booking calendar. Days: 0 = Sunday ... 6 = Saturday.
  // PLACEHOLDER: openDays and slots are guesses until Kenya confirms her real
  // hours. The site never states them as business hours; they only drive the
  // calendar. Update these two lines when she sends her schedule.
  openDays: [2, 3, 4, 5, 6],
  slots: ['8:00 AM', '11:00 AM', '2:00 PM', '5:00 PM'],
  blockedDates: [],          // e.g. ['2026-10-31', '2026-11-26']
  monthsAhead: 3
};

var SERVICES = [
  { id: 'knotless', img: 'img/knotless-1.jpg', pos: 'center 78%', name: 'Knotless', desc: 'Lightweight, no-tension knotless braids.', long: true, options: [
    { n: 'Extra small', p: 260, d: '12+ hrs' }, { n: 'Small', p: 220, d: '8 hrs' }, { n: 'Medium', p: 180, d: '5 hrs' }, { n: 'Large', p: 130, d: '3 hrs 30 min' } ] },
  { id: 'fulani', img: 'img/fulani-1.jpg', pos: 'center 64%', name: 'Fulani', desc: 'Fulani braids with your choice of size.', long: true, options: [
    { n: 'Small', p: 210, d: '6 hrs 30 min' }, { n: 'Medium', p: 180, d: '5 hrs' }, { n: 'Large', p: 150, d: '4 hrs' } ] },
  { id: 'feedins', img: 'img/braids-7.jpg', pos: 'center 40%', name: 'Feed-ins', desc: 'Sleek feed-in braids, priced by count.', long: true, options: [
    { n: '4 braids', p: 40, d: '1 hr 15 min' }, { n: '6 braids', p: 60, d: '1 hr 30 min' }, { n: '8 braids', p: 80, d: '2 hrs' }, { n: '10+ braids', p: 90, plus: true, d: '3+ hrs' } ] },
  { id: 'quickweave', img: 'img/quickweave-2.jpg', pos: 'center 72%', name: 'Quick weaves', desc: 'Quick weave installs and ponytails.', options: [
    { n: 'Quick weave', p: 85, d: '3 hrs' }, { n: 'Quick weave ponytail', p: 70, d: '4 hrs' }, { n: 'Quick weave with braids', p: 100, d: '4 hrs' } ] },
  { id: 'male', img: 'img/braids-1.jpg', pos: 'center 66%', name: "Men's styles", desc: 'Cornrows, twists, retwists, and locs.', options: [
    { n: 'Cornrows', p: 55, design: true, d: '1 hr 30 min', dd: '2 hrs' }, { n: 'Twists', p: 60, d: '2 hrs 30 min' }, { n: 'Retwists', p: 65, d: '2 hrs 30 min' },
    { n: 'Retwists + style', p: 75, d: '3 hrs 30 min' }, { n: 'Starter locs', p: 90, d: '2 hrs' }, { n: 'Freeform transformation', p: 85, d: '3 hrs' } ] },
  { id: 'kids', img: 'img/kids-1.jpg', pos: 'center 42%', name: 'Kids styles', desc: 'Styles for the little ones, priced by age.', options: [
    { n: 'Ages 3 and under', p: 40, d: '3 hrs' }, { n: 'Ages 4 to 10', p: 55, d: '2 hrs' }, { n: 'Ages 11 to 14', p: 70, plus: true, d: '3+ hrs' } ] }
];


/* Gallery photos: file, filter tag, caption, which style "Book this" opens, layout */
var GALLERY = [
  { f: 'knotless-2', t: 'Knotless', c: 'Knotless braids', b: 'knotless', s: 'tall arch-top' },
  { f: 'braids-4', t: 'Braids', c: 'Heart design cornrows', b: 'male' },
  { f: 'fulani-1', t: 'Fulani', c: 'Fulani braids with curls', b: 'fulani' },
  { f: 'locs-1', t: 'Locs', c: 'Loc retwist', b: 'male', s: 'tall' },
  { f: 'kids-2', t: 'Kids', c: 'Kids braids with bows', b: 'kids', s: 'arch-top' },
  { f: 'braids-7', t: 'Braids', c: 'Zigzag stitch braids', b: 'feedins' },
  { f: 'quickweave-2', t: 'Quick weaves', c: 'Quick weave', b: 'quickweave', s: 'arch-top' },
  { f: 'braids-2', t: 'Braids', c: 'Zigzag cornrows', b: 'male' },
  { f: 'knotless-1', t: 'Knotless', c: 'Small knotless braids', b: 'knotless' },
  { f: 'locs-2', t: 'Locs', c: 'Starter locs', b: 'male' },
  { f: 'kids-1', t: 'Kids', c: 'Kids braids with beads', b: 'kids', s: 'tall arch-top' },
  { f: 'braids-5', t: 'Braids', c: 'Stitch braids', b: 'male' },
  { f: 'quickweave-1', t: 'Quick weaves', c: 'Quick weave with braids', b: 'quickweave' },
  { f: 'braids-locs-1', t: 'Locs', c: 'Twists and cornrows', b: 'male' },
  { f: 'locs-3', t: 'Locs', c: 'Loc style', b: 'male', s: 'arch-top' },
  { f: 'braids-1', t: 'Braids', c: 'Stitch cornrows', b: 'male' },
  { f: 'kids-3', t: 'Kids', c: 'Kids cornrows', b: 'kids' },
  { f: 'braids-6', t: 'Braids', c: 'Wavy cornrows', b: 'kids' }
];

/* ════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var money = function (n) { return '$' + n; };
  var CLOCK = '<svg class="clk" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
  var CR = '<span class="cr" aria-hidden="true"></span>';
  var lenis = null;

  var state = { cat: null, opt: null, longHair: false, design: false, date: null, time: null, paid: false };

  /* ── storage (safe) ── */
  function save() { try { sessionStorage.setItem('kenya-booking', JSON.stringify(Object.assign({}, state, { date: state.date ? state.date.toISOString() : null, name: $('#f-name').value, phone: $('#f-phone').value, notes: $('#f-notes').value }))); } catch (e) {} }
  function load() {
    try {
      var s = JSON.parse(sessionStorage.getItem('kenya-booking') || 'null'); if (!s) return;
      state.cat = s.cat; state.opt = s.opt; state.longHair = s.longHair; state.design = s.design; state.time = s.time; state.paid = s.paid;
      state.date = s.date ? new Date(s.date) : null;
      $('#f-name').value = s.name || ''; $('#f-phone').value = s.phone || ''; $('#f-notes').value = s.notes || '';
    } catch (e) {}
  }

  /* ── toast ── */
  var toastT;
  function toast(msg) {
    var t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('show'); }, 4200);
  }

  /* ── nav: mobile menu ── */
  var menuBtn = $('#nav-menu'), links = $('#nav-links');
  function setMenu(open) { links.classList.toggle('open', open); menuBtn.setAttribute('aria-expanded', open); menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); }
  menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
  $$('a', links).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && links.classList.contains('open')) { setMenu(false); menuBtn.focus(); } });

  /* ── hero: starting prices ── */
  function low(s) { return Math.min.apply(null, s.options.map(function (o) { return o.p; })); }
  $('#hero-rates').innerHTML = SERVICES.map(function (s) {
    return '<li><a href="#p-' + s.id + '"><span class="hr-n">' + s.name + '</span><span class="hr-p">from ' + money(low(s)) + '</span></a></li>';
  }).join('');

  /* ── price list (rate card) ── */
  var grid = $('#price-grid');
  SERVICES.forEach(function (s, si) {
    var rows = s.options.map(function (o, i) {
      return '<button class="prow" data-cat="' + s.id + '" data-opt="' + i + '" aria-label="Book ' + s.name + ', ' + o.n + ', ' + money(o.p) + (o.plus ? ' and up' : '') + ', takes ' + o.d + '">' +
        '<span><span class="pn">' + o.n + '</span><span class="dur">' + CLOCK + o.d + (o.design ? ' · design +$10 (' + o.dd + ')' : '') + '</span></span>' +
        '<span class="pd" aria-hidden="true"></span><span class="pp">' + money(o.p) + (o.plus ? '+' : '') + '</span></button>';
    }).join('');
    var card = document.createElement('article');
    card.className = 'pcat'; card.id = 'p-' + s.id; card.dataset.i = si;
    card.innerHTML = '<div class="pcat-img"><img src="' + s.img + '" alt="' + s.name + ' by ken.didit" loading="lazy"></div>' +
      '<div class="pcat-top"><span class="mono pcat-n">' + String(si + 1).padStart(2, '0') + '</span><h3>' + s.name + '</h3><span class="from">from ' + money(low(s)) + '</span></div>' +
      '<p class="desc">' + s.desc + '</p>' + rows +
      '<div class="pbook"><button class="tlink" data-cat="' + s.id + '">Book ' + s.name.toLowerCase() + '</button></div>';
    grid.appendChild(card);
  });
  grid.addEventListener('click', function (e) {
    var b = e.target.closest('[data-cat]'); if (!b) return;
    state.cat = b.dataset.cat;
    state.opt = b.dataset.opt != null ? +b.dataset.opt : null;
    state.longHair = false; state.design = false;
    renderService(); update();
    goTo('#book');
  });

  /* sticky photo beside the rate card follows the category in view */
  var frame = $('#rp-frame'), rpCap = $('#rp-cap');
  frame.innerHTML = SERVICES.map(function (s, i) { return '<img src="' + s.img + '" alt="" ' + (i ? 'loading="lazy"' : '') + (i ? '' : ' class="on"') + '>'; }).join('');
  function showCat(i) {
    $$('img', frame).forEach(function (im, k) { im.classList.toggle('on', k === i); });
    rpCap.innerHTML = CR + SERVICES[i].name;
  }
  showCat(0);
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) showCat(+en.target.dataset.i); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('.pcat', grid).forEach(function (c) { io.observe(c); });
  }

  /* ── gallery ── */
  var TAGS = ['All', 'Knotless', 'Braids', 'Fulani', 'Locs', 'Quick weaves', 'Kids'];
  var gal = $('#gallery'), gf = $('#g-filters'), curTag = 'All', lbIdx = 0, lastFocus = null;
  gf.innerHTML = TAGS.map(function (t) { return '<button class="gf" aria-pressed="' + (t === 'All') + '" data-tag="' + t + '">' + t + '</button>'; }).join('');
  gal.innerHTML = GALLERY.map(function (g, i) {
    var size = (g.s || '').indexOf('tall') > -1 ? ' tall' : '';
    return '<button class="g-item' + size + '" data-i="' + i + '" data-tag="' + g.t + '" aria-label="View larger: ' + g.c + '">' +
      '<img src="img/' + g.f + '.jpg" alt="' + g.c + ' by ken.didit" loading="lazy"><span class="g-tag">' + CR + g.c + '</span></button>';
  }).join('');
  function visible() { return GALLERY.map(function (g, i) { return i; }).filter(function (i) { return curTag === 'All' || GALLERY[i].t === curTag; }); }
  gf.addEventListener('click', function (e) {
    var b = e.target.closest('[data-tag]'); if (!b) return;
    curTag = b.dataset.tag;
    $$('.gf', gf).forEach(function (c) { c.setAttribute('aria-pressed', c === b); });
    var items = $$('.g-item', gal);
    items.forEach(function (it) {
      var show = curTag === 'All' || it.dataset.tag === curTag;
      it.classList.toggle('hide', !show);
      it.style.gridRow = curTag === 'All' ? '' : 'auto';
      it.style.aspectRatio = curTag === 'All' ? '' : '3/4';
    });
    if (hasGsap && !reduced) gsap.fromTo(items.filter(function (it) { return !it.classList.contains('hide'); }), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .45, stagger: .03, ease: 'power3.out', overwrite: true });
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  });

  var lb = $('#lb');
  function openLb(i) {
    if (!lb.classList.contains('open')) lastFocus = document.activeElement;
    lbIdx = i; var g = GALLERY[i];
    $('#lb-img').src = 'img/' + g.f + '.jpg'; $('#lb-img').alt = g.c + ' by ken.didit';
    $('#lb-cap').textContent = g.c;
    $('#lb-book').dataset.cat = g.b;
    lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false');
    if (lenis) lenis.stop();
    setTimeout(function () { $('#lb-x').focus(); }, 30);
  }
  function closeLb() {
    lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); if (lenis) lenis.start();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function step(d) { var v = visible(), p = v.indexOf(lbIdx); openLb(v[(p + d + v.length) % v.length]); }
  gal.addEventListener('click', function (e) { var b = e.target.closest('.g-item'); if (b) openLb(+b.dataset.i); });
  $('#lb-x').addEventListener('click', closeLb);
  $('#lb-p').addEventListener('click', function () { step(-1); });
  $('#lb-n').addEventListener('click', function () { step(1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'Tab') { // keep focus inside the viewer
      var f = [$('#lb-x'), $('#lb-p'), $('#lb-n'), $('#lb-book')], k = f.indexOf(document.activeElement);
      e.preventDefault(); f[(k + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });
  $('#lb-book').addEventListener('click', function (e) {
    e.preventDefault(); e.stopPropagation();
    state.cat = this.dataset.cat; state.opt = null; state.longHair = false; state.design = false;
    lastFocus = null; closeLb(); renderService(); update(); goTo('#book');
  });

  /* ── step 1: service ── */
  function svc() { return SERVICES.filter(function (s) { return s.id === state.cat; })[0]; }
  function renderService() {
    $('#cat-chips').innerHTML = SERVICES.map(function (s) {
      return '<button class="chip" role="radio" aria-checked="' + (state.cat === s.id) + '" data-c="' + s.id + '">' + s.name + '</button>';
    }).join('');
    var s = svc();
    $('#opt-chips').innerHTML = s ? s.options.map(function (o, i) {
      return '<button class="chip" role="radio" aria-checked="' + (state.opt === i) + '" data-o="' + i + '">' + o.n + '<span class="cp">' + money(o.p) + (o.plus ? '+' : '') + '</span><span class="cd">' + o.d + '</span></button>';
    }).join('') : '';
    var add = '';
    if (s && s.long) add += '<label class="check"><input type="checkbox" id="ad-long"' + (state.longHair ? ' checked' : '') + '>Length past butt length<b>+$15</b></label>';
    if (s && state.opt != null && s.options[state.opt].design) add += '<label class="check"><input type="checkbox" id="ad-design"' + (state.design ? ' checked' : '') + '>Add a design<b>+$10</b></label>';
    $('#addons').innerHTML = add;
  }
  $('#cat-chips').addEventListener('click', function (e) {
    var b = e.target.closest('[data-c]'); if (!b) return;
    if (state.cat !== b.dataset.c) { state.cat = b.dataset.c; state.opt = null; state.longHair = false; state.design = false; }
    renderService(); update();
    var nb = $('#cat-chips [data-c="' + b.dataset.c + '"]'); if (nb) nb.focus();
    if (hasGsap && !reduced) gsap.from('#opt-chips .chip', { opacity: 0, y: 8, duration: .35, stagger: .03, ease: 'power2.out' });
  });
  $('#opt-chips').addEventListener('click', function (e) {
    var b = e.target.closest('[data-o]'); if (!b) return;
    state.opt = +b.dataset.o; if (!svc().options[state.opt].design) state.design = false;
    renderService(); update();
    var nb = $('#opt-chips [data-o="' + state.opt + '"]'); if (nb) nb.focus();
  });
  $('#addons').addEventListener('change', function (e) {
    if (e.target.id === 'ad-long') state.longHair = e.target.checked;
    if (e.target.id === 'ad-design') state.design = e.target.checked;
    update();
  });

  /* ── step 2: calendar ── */
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var view = new Date(today.getFullYear(), today.getMonth(), 1);
  var maxView = new Date(today.getFullYear(), today.getMonth() + CONFIG.monthsAhead, 1);
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function sameDay(a, b) { return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
  function isOpen(d) { return d >= today && CONFIG.openDays.indexOf(d.getDay()) > -1 && CONFIG.blockedDates.indexOf(iso(d)) === -1; }

  function renderCal() {
    $('#cal-title').textContent = MONTHS[view.getMonth()] + ' ' + view.getFullYear();
    $('#cal-prev').disabled = view <= new Date(today.getFullYear(), today.getMonth(), 1);
    $('#cal-next').disabled = view >= maxView;
    var first = view.getDay(), days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate(), html = '';
    for (var i = 0; i < first; i++) html += '<span class="day blank" aria-hidden="true"></span>';
    for (var d = 1; d <= days; d++) {
      var dt = new Date(view.getFullYear(), view.getMonth(), d), open = isOpen(dt), sel = sameDay(dt, state.date);
      var cls = 'day' + (sameDay(dt, today) ? ' today' : '') + (sel ? ' sel' : '');
      html += '<button class="' + cls + '" data-d="' + d + '"' + (open ? '' : ' disabled') + (sel ? ' aria-pressed="true"' : '') +
        ' aria-label="' + DOW[dt.getDay()] + ' ' + MONTHS[dt.getMonth()] + ' ' + d + (open ? '' : ', unavailable') + '">' + d + '</button>';
    }
    $('#cal-grid').innerHTML = html;
  }
  function renderSlots() {
    if (!state.date) { $('#slots-label').textContent = 'Pick a date to see open times.'; $('#slots').innerHTML = ''; return; }
    $('#slots-label').textContent = 'Open times on ' + fmtDate(state.date) + ':';
    $('#slots').innerHTML = CONFIG.slots.map(function (t) {
      return '<button class="chip slot" role="radio" aria-checked="' + (state.time === t) + '" data-t="' + t + '">' + t + '</button>';
    }).join('');
  }
  $('#cal-prev').addEventListener('click', function () { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); renderCal(); calAnim(-1); });
  $('#cal-next').addEventListener('click', function () { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); renderCal(); calAnim(1); });
  function calAnim(dir) { if (hasGsap && !reduced) gsap.from('#cal-grid .day:not(.blank)', { opacity: 0, x: 10 * dir, duration: .35, stagger: .006, ease: 'power2.out' }); }
  $('#cal-grid').addEventListener('click', function (e) {
    var b = e.target.closest('[data-d]'); if (!b || b.disabled) return;
    var d = +b.dataset.d;
    state.date = new Date(view.getFullYear(), view.getMonth(), d); state.time = null;
    renderCal(); renderSlots(); update();
    var nb = $('#cal-grid [data-d="' + d + '"]'); if (nb) nb.focus();
    if (hasGsap && !reduced) gsap.from('#slots .slot', { opacity: 0, y: 8, duration: .35, stagger: .04, ease: 'power2.out' });
  });
  $('#slots').addEventListener('click', function (e) {
    var b = e.target.closest('[data-t]'); if (!b) return;
    state.time = b.dataset.t; renderSlots(); update();
    var nb = $('#slots [data-t="' + state.time + '"]'); if (nb) nb.focus();
  });
  function fmtDate(d) { return DOW[d.getDay()] + ', ' + MONTHS[d.getMonth()].slice(0, 3) + ' ' + d.getDate(); }

  /* ── summary ── */
  function total() {
    var s = svc(); if (!s || state.opt == null) return null;
    var o = s.options[state.opt];
    return { base: o.p, plus: !!o.plus, sum: o.p + (state.longHair ? 15 : 0) + (state.design ? 10 : 0) };
  }
  function setDD(id, text) { var el = $(id); el.textContent = text || el.dataset.empty; el.classList.toggle('empty', !text); }
  ['#sum-style', '#sum-date', '#sum-time', '#sum-len'].forEach(function (id) { $(id).dataset.empty = 'Not chosen yet'; });
  $('#sum-add').dataset.empty = 'None';

  function update() {
    var s = svc(), t = total();
    setDD('#sum-style', s && state.opt != null ? s.name + ', ' + s.options[state.opt].n : (s ? s.name + ' (pick a size)' : ''));
    var adds = []; if (state.longHair) adds.push('Past butt length'); if (state.design) adds.push('Design');
    setDD('#sum-add', adds.join(', '));
    setDD('#sum-date', state.date ? fmtDate(state.date) : '');
    setDD('#sum-time', state.time || '');
    setDD('#sum-len', s && state.opt != null ? 'About ' + (state.design ? s.options[state.opt].dd : s.options[state.opt].d) : '');
    var tot = t ? t.sum : 0;
    animNum('#sum-total', tot, t && t.plus ? '+' : '');
    animNum('#sum-due', Math.max(0, tot - CONFIG.deposit), t && t.plus ? '+' : '');
    $('#s1').classList.toggle('done', !!(s && state.opt != null));
    $('#s2').classList.toggle('done', !!(state.date && state.time));
    $('#s3').classList.toggle('done', !!($('#f-name').value.trim() && $('#f-phone').value.replace(/\D/g, '').length >= 10));
    var ds = $('#dep-status'); ds.classList.toggle('paid', state.paid);
    $('#dep-text').textContent = state.paid ? 'Deposit paid. Thank you!' : 'Deposit not paid yet';
    var pb = $('#pay-dep'); pb.classList.toggle('paid', state.paid);
    pb.querySelector('.payb-l').textContent = state.paid ? 'Deposit paid ✓' : 'Pay $' + CONFIG.deposit + ' deposit';
    $('#sum-err').textContent = '';
    save();
  }
  var numState = {};
  function animNum(sel, to, suffix) {
    var el = $(sel);
    if (!hasGsap || reduced) { el.textContent = money(to) + suffix; return; }
    var o = numState[sel] || (numState[sel] = { v: 0 });
    gsap.to(o, { v: to, duration: .5, ease: 'power2.out', overwrite: true, onUpdate: function () { el.textContent = money(Math.round(o.v)) + suffix; } });
  }
  ['#f-name', '#f-phone', '#f-notes'].forEach(function (id) { $(id).addEventListener('input', update); });

  /* ── validation + message ── */
  function missing(forPay) {
    var s = svc();
    if (!s) return 'Pick a style first.';
    if (state.opt == null) return 'Pick a size or option for ' + s.name + '.';
    if (!state.date) return 'Pick a date for your appointment.';
    if (!state.time) return 'Pick a time for your appointment.';
    if (!$('#f-name').value.trim()) return 'Add your name so Kenya knows who is booking.';
    if (!forPay && $('#f-phone').value.replace(/\D/g, '').length < 10) return 'Add a phone number Kenya can text you back at.';
    return '';
  }
  function showErr(m) {
    $('#sum-err').textContent = m;
    if (hasGsap && !reduced) gsap.fromTo('#sum-err', { x: -6 }, { x: 0, duration: .5, ease: 'elastic.out(1,.3)' });
  }
  function message() {
    var s = svc(), o = s.options[state.opt], t = total(), adds = [];
    if (state.longHair) adds.push('Past butt length (+$15)');
    if (state.design) adds.push('Design (+$10)');
    var lines = [
      'Hi Kenya! I would like to book an appointment.',
      '',
      'Style: ' + s.name + ', ' + o.n + ' (' + money(o.p) + (o.plus ? '+' : '') + ')',
      adds.length ? 'Add-ons: ' + adds.join(', ') : null,
      'Date: ' + fmtDate(state.date) + ' ' + state.date.getFullYear(),
      'Time: ' + state.time,
      'Takes about: ' + (state.design ? o.dd : o.d),
      'Estimated total: ' + money(t.sum) + (t.plus ? '+' : ''),
      '',
      'Name: ' + $('#f-name').value.trim(),
      'Phone: ' + $('#f-phone').value.trim(),
      $('#f-notes').value.trim() ? 'Notes: ' + $('#f-notes').value.trim() : null,
      '',
      state.paid ? 'I paid the $' + CONFIG.deposit + ' deposit online.' : 'I will send the $' + CONFIG.deposit + ' deposit to lock in my spot.'
    ];
    return lines.filter(function (l) { return l !== null; }).join('\n');
  }

  /* ── deposit (Stripe Payment Link: Apple Pay + card) ── */
  $('#pay-dep').addEventListener('click', function () {
    var m = missing(true); if (m) return showErr(m);
    if (!CONFIG.depositLink) { toast('Online deposits turn on once Kenya connects her Stripe account.'); return; }
    save();
    var ref = ($('#f-name').value.trim() + '_' + iso(state.date) + '_' + state.time).replace(/[^A-Za-z0-9_-]/g, '-').slice(0, 190);
    var url = CONFIG.depositLink + (CONFIG.depositLink.indexOf('?') > -1 ? '&' : '?') + 'client_reference_id=' + encodeURIComponent(ref);
    window.location.href = url;
  });

  /* ── send request ── */
  $('#send-text').addEventListener('click', function () {
    var m = missing(false); if (m) return showErr(m);
    var sep = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent) ? '&' : '?';
    window.location.href = 'sms:' + CONFIG.phone + sep + 'body=' + encodeURIComponent(message());
  });
  $('#send-ig').addEventListener('click', function () {
    var m = missing(false); if (m) return showErr(m);
    var msg = message();
    var go = function () { window.open('https://ig.me/m/' + CONFIG.instagram, '_blank', 'noopener'); };
    if (navigator.clipboard) {
      navigator.clipboard.writeText(msg).then(function () { toast('Booking copied. Paste it into the DM.'); go(); }, go);
    } else go();
  });

  /* ── init booking ── */
  load();
  if (/[?&]deposit=paid/.test(location.search)) {
    state.paid = true;
    setTimeout(function () { toast('Deposit received! Now send your booking request.'); goTo('#book'); }, 600);
    try { history.replaceState(null, '', location.pathname + '#book'); } catch (e) {}
  }
  if (state.date && state.date >= today) view = new Date(state.date.getFullYear(), state.date.getMonth(), 1); else { state.date = null; state.time = null; }
  renderService(); renderCal(); renderSlots(); update();

  /* ════════════ motion ════════════
     Nothing below hides content before it runs. Reveals only start once
     ScrollTrigger is ready, and reduced-motion visitors skip all of it. */
  function goTo(sel) {
    var t = $(sel); if (!t) return;
    var off = -(parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 68) - 12;
    if (lenis) lenis.scrollTo(t, { offset: off, duration: 1.2 }); else t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  }
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) { var h = a.getAttribute('href'); if (h.length < 2) return; var t = $(h); if (!t) return; e.preventDefault(); goTo(h); });
  });

  if (reduced || !hasGsap) return;

  gsap.registerPlugin(ScrollTrigger);
  lenis = new Lenis({ lerp: .1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
  gsap.ticker.lagSmoothing(0);

  /* hero: the cornrow thread stitches down beside Kenya's photo (decoration only) */
  gsap.fromTo('.hero-thread', { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1.6, ease: 'power2.inOut', delay: .15 });
  gsap.fromTo('.hero-photo img', { scale: 1.05 }, { scale: 1, duration: 1.6, ease: 'power3.out' });
  gsap.to('.hero-photo img', { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* section labels: the stitch grows in */
  $$('.sec-label .cr').forEach(function (el) {
    gsap.fromTo(el, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: .9, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
  });
  gsap.fromTo('.foot-cr', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', ease: 'none', scrollTrigger: { trigger: 'footer', start: 'top bottom', end: 'top 50%', scrub: true } });

  /* light reveals: only for blocks that start below the fold */
  function reveal(sel, opts) {
    ScrollTrigger.batch(sel, Object.assign({
      start: 'top 92%', once: true,
      onEnter: function (b) { gsap.to(b, { opacity: 1, y: 0, duration: .8, ease: 'power3.out', stagger: .06, overwrite: true }); }
    }, opts || {}));
  }
  var below = function (el) { return el.getBoundingClientRect().top > innerHeight; };
  ['.sec-head h2', '.sec-note', '.pcat', '.g-item', '.pol', '.link-row', '.cc-left > p'].forEach(function (sel) {
    var els = $$(sel).filter(below);
    if (els.length) { gsap.set(els, { opacity: 0, y: 22 }); reveal(els); }
  });

  addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
