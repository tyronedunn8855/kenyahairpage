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

  // LIVE SCHEDULE: Kenya sets her hours in the owner panel (/admin/), saved in
  // Supabase. The URL and public key live in supabase-config.js.
  // Until those are filled in, the calendar reads her old Google Sheet
  // "ken.didit booking schedule" (tab "Schedule") instead.
  scheduleSheetId: '1mRGWAifZ88s07uuNx30Xlp8xKt3ZH203RYcCWtnC6gU',

  // BACKUP SCHEDULE: used only if the live schedule can't be reached.
  // Only the dates listed here can be booked. Every other day shows as closed.
  // To open a day, add a line: 'YYYY-MM-DD': ['time', 'time'],
  // To close a day, delete its line.
  schedule: {
    '2026-10-10': ['4:30 PM'],                                 // works at 8 AM
    '2026-10-13': ['4:30 PM'],                                 // works at 8 AM
    '2026-10-14': ['8:00 AM', '11:00 AM'],                     // mornings only
    '2026-10-15': ['8:00 AM', '11:00 AM'],                     // mornings only
    '2026-10-16': ['4:30 PM'],                                 // works at 8 AM
    '2026-10-17': ['4:30 PM'],                                 // works at 8 AM
    '2026-10-18': ['4:30 PM'],                                 // works at 8 AM
    '2026-10-19': ['4:30 PM'],                                 // works at 8 AM
    '2026-10-21': ['8:00 AM', '11:00 AM', '2:00 PM', '5:00 PM'], // open day
    '2026-10-22': ['8:00 AM', '11:00 AM', '2:00 PM', '5:00 PM'], // open day
    '2026-10-27': ['8:00 AM', '11:00 AM', '2:00 PM', '5:00 PM']  // open day
  },
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
  var reduced = !!window.__rm;
  var narrow = matchMedia('(max-width: 900px)');
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var money = function (n) { return '$' + n; };
  var CLOCK = '<svg class="clk" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
  var CR = '<span class="cr" aria-hidden="true"></span>';
  var lenis = null;

  /* Responsive photos: small WebP copies in img/w (400/800/1200 wide, same uncropped
     framing as the originals) with the full JPG as the fallback. */
  function srcset(f) { var ws = f === 'owner' ? [400, 800, 1174] : [400, 800, 1200]; return ws.map(function (w) { return 'img/w/' + f + '-' + w + '.webp ' + w + 'w'; }).join(', '); }
  function base(src) { return src.replace(/^img\//, '').replace(/\.jpg$/, ''); }
  function pic(f, sizes, attrs) {
    return '<picture><source type="image/webp" srcset="' + srcset(f) + '" sizes="' + sizes + '"><img src="img/' + f + '.jpg" width="1809" height="2412" ' + attrs + '></picture>';
  }

  var state = { cat: null, opt: null, longHair: false, design: false, date: null, time: null, paid: false, sentKey: null, collapsed: { s1: false, s2: false } };

  /* ── storage (safe). Keeps a half-finished booking through a refresh or the Stripe round-trip. ── */
  var KEY = 'kenya-booking';
  function save() {
    try {
      sessionStorage.setItem(KEY, JSON.stringify({
        cat: state.cat, opt: state.opt, longHair: state.longHair, design: state.design,
        date: state.date ? iso(state.date) : null, time: state.time, paid: state.paid, sentKey: state.sentKey, collapsed: state.collapsed,
        name: $('#f-name').value, phone: $('#f-phone').value, notes: $('#f-notes').value
      }));
    } catch (e) {}
  }
  function load() {
    try {
      var s = JSON.parse(sessionStorage.getItem(KEY) || 'null'); if (!s) return false;
      state.cat = s.cat || null; state.opt = s.opt != null ? s.opt : null; state.longHair = !!s.longHair; state.design = !!s.design;
      state.time = s.time || null; state.paid = !!s.paid; state.sentKey = s.sentKey || null;
      state.collapsed = s.collapsed || { s1: false, s2: false };
      state.date = null;
      if (s.date) {
        var m = String(s.date).match(/^(\d{4})-(\d{2})-(\d{2})$/);
        state.date = m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(s.date); // older saves used a full ISO string
        if (isNaN(state.date)) state.date = null; else state.date.setHours(0, 0, 0, 0);
      }
      if (!svc()) { state.cat = null; state.opt = null; }
      else if (state.opt != null && !svc().options[state.opt]) state.opt = null;
      $('#f-name').value = s.name || ''; $('#f-phone').value = s.phone || ''; $('#f-notes').value = s.notes || '';
      return !!(state.cat || state.date || s.name || s.phone);
    } catch (e) { return false; }
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
    card.innerHTML = '<div class="pcat-img">' + pic(base(s.img), '280px', 'alt="' + s.name + ' by ken.didit" loading="lazy" decoding="async"') + '</div>' +
      '<div class="pcat-top"><span class="mono pcat-n">' + String(si + 1).padStart(2, '0') + '</span><h3>' + s.name + '</h3><span class="from">from ' + money(low(s)) + '</span></div>' +
      '<p class="desc">' + s.desc + '</p>' + rows +
      '<div class="pbook"><button class="tlink" data-cat="' + s.id + '">Book ' + s.name.toLowerCase() + '</button></div>';
    grid.appendChild(card);
  });
  grid.addEventListener('click', function (e) {
    var b = e.target.closest('[data-cat]'); if (!b) return;
    if (state.cat !== b.dataset.cat) state.longHair = false;
    state.cat = b.dataset.cat;
    state.opt = b.dataset.opt != null ? +b.dataset.opt : null;
    state.design = false;
    var s = svc(), hasAdd = s && (s.long || (state.opt != null && s.options[state.opt].design));
    /* a full pick with nothing extra to decide skips straight to the calendar */
    if (state.opt != null && !hasAdd) { state.collapsed.s1 = true; renderService(); update(); goTo('#s2', '#s2-h'); }
    else { state.collapsed.s1 = false; renderService(); update(); goTo('#s1', '#s1-h'); }
  });

  /* sticky photo beside the rate card follows the category in view (desktop only) */
  var frame = $('#rp-frame'), rpCap = $('#rp-cap');
  frame.innerHTML = SERVICES.map(function (s, i) { return pic(base(s.img), '(max-width:900px) 10px, 34vw', 'alt="" loading="lazy" decoding="async"' + (i ? '' : ' class="on"')); }).join('');
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
      pic(g.f, '(max-width:600px) 50vw, (max-width:900px) 33vw, 310px', 'alt="' + g.c + ' by ken.didit" loading="lazy" decoding="async"') + '<span class="g-tag">' + CR + g.c + '</span></button>';
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

  var lb = $('#lb'), lbImg = $('#lb-img');
  lbImg.sizes = '(max-width:600px) 92vw, 560px';
  function openLb(i) {
    if (!lb.classList.contains('open')) lastFocus = document.activeElement;
    lbIdx = i; var g = GALLERY[i];
    lbImg.srcset = srcset(g.f); lbImg.src = 'img/' + g.f + '.jpg'; lbImg.alt = g.c + ' by ken.didit';
    $('#lb-cap').textContent = g.c;
    $('#lb-book').dataset.cat = g.b;
    lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false');
    if (lenis) lenis.stop();
    setTimeout(function () { $('#lb-x').focus(); }, 30);
    mbar();
  }
  function closeLb() {
    lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); if (lenis) lenis.start();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    mbar();
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
    if (state.cat !== this.dataset.cat) { state.opt = null; state.longHair = false; state.design = false; }
    state.cat = this.dataset.cat; state.collapsed.s1 = false;
    lastFocus = null; closeLb(); renderService(); update(); goTo('#s1', '#s1-h');
  });

  /* ── keyboard: radio groups use arrow keys and a single tab stop ── */
  function rove(box, sel) {
    var items = $$(sel, box); if (!items.length) return;
    var on = items.filter(function (b) { return b.getAttribute('aria-checked') === 'true'; })[0] || items[0];
    items.forEach(function (b) { b.tabIndex = b === on ? 0 : -1; });
  }
  function roveKeys(box, sel) {
    box.addEventListener('keydown', function (e) {
      var k = e.key, items = $$(sel, box), i = items.indexOf(document.activeElement); if (i < 0) return;
      var n = k === 'ArrowRight' || k === 'ArrowDown' ? i + 1 : k === 'ArrowLeft' || k === 'ArrowUp' ? i - 1 : k === 'Home' ? 0 : k === 'End' ? items.length - 1 : null;
      if (n == null) return;
      e.preventDefault(); items[(n + items.length) % items.length].click();
    });
  }

  /* ── step 1: service ── */
  function svc() { return SERVICES.filter(function (s) { return s.id === state.cat; })[0]; }
  function hasAddons() { var s = svc(); return !!(s && (s.long || (state.opt != null && s.options[state.opt].design))); }
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
    rove($('#cat-chips'), '.chip'); rove($('#opt-chips'), '.chip');
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
    /* on phones, a tap that finishes the step moves on to the calendar */
    if (e.detail > 0 && narrow.matches && !hasAddons()) advance('s1');
  });
  $('#addons').addEventListener('change', function (e) {
    if (e.target.id === 'ad-long') state.longHair = e.target.checked;
    if (e.target.id === 'ad-design') state.design = e.target.checked;
    update();
  });
  roveKeys($('#cat-chips'), '.chip'); roveKeys($('#opt-chips'), '.chip');

  /* ── steps: collapse a finished step to one line, reopen with "Change" ── */
  var NEXT = { s1: 's2', s2: 's3' };
  function stepDone(id) {
    if (id === 's1') return !!(svc() && state.opt != null);
    if (id === 's2') return !!(state.date && state.time);
    return !!($('#f-name').value.trim() && digits().length >= 10);
  }
  function advance(id) {
    state.collapsed[id] = true; update();
    var n = NEXT[id]; goTo('#' + n, '#' + n + '-h');
  }
  function expand(id, focusSel) {
    state.collapsed[id] = false; update();
    goTo('#' + id, focusSel || ('#' + id + '-h'));
  }
  $$('.step-edit').forEach(function (b) {
    b.addEventListener('click', function () {
      var id = b.dataset.edit;
      expand(id, id === 's1' ? '#cat-chips [tabindex="0"]' : '#cal-grid [tabindex="0"]');
    });
  });
  $$('.step-next').forEach(function (b) {
    b.addEventListener('click', function () { advance(b.closest('.step').id); });
  });

  /* ── step 2: calendar ── */
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var view = new Date(today.getFullYear(), today.getMonth(), 1);
  var maxView = new Date(today.getFullYear(), today.getMonth() + CONFIG.monthsAhead, 1);
  /* where live hours come from: Supabase (owner panel) when connected, else the Google Sheet */
  var SB = window.KD_SUPABASE || {};
  var liveSource = SB.url && SB.anonKey ? 'supabase' : CONFIG.scheduleSheetId ? 'sheet' : '';
  /* schedule status for the UI: 'loading' until the live source answers, then 'live' or 'backup' */
  var schedMode = liveSource ? 'loading' : 'backup';
  function openKeys() { return Object.keys(CONFIG.schedule).filter(function (k) { return (CONFIG.schedule[k] || []).length && k >= iso(today); }).sort(); }
  function keyDate(k) { var p = k.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  /* jump to the first month with an open date, and allow paging out to the last one */
  function fitView() {
    var keys = openKeys();
    var cur = new Date(today.getFullYear(), today.getMonth(), 1);
    if (!keys.length) { maxView = cur; return; }
    var f = keys[0].split('-'), l = keys[keys.length - 1].split('-');
    maxView = new Date(+l[0], +l[1] - 1, 1);
    if (maxView < cur) maxView = cur;
    if (!state.date) view = new Date(+f[0], +f[1] - 1, 1);
  }
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function sameDay(a, b) { return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
  function isOpen(d) { return d >= today && !!(CONFIG.schedule[iso(d)] || []).length; }

  function renderCal() {
    var loading = schedMode === 'loading';
    $('#cal').setAttribute('aria-busy', loading);
    $('#cal').classList.toggle('loading', loading);
    $('#cal-title').textContent = MONTHS[view.getMonth()] + ' ' + view.getFullYear();
    $('#cal-prev').disabled = loading || view <= new Date(today.getFullYear(), today.getMonth(), 1);
    $('#cal-next').disabled = loading || view >= maxView;
    var first = view.getDay(), days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate(), html = '', openCount = 0;
    for (var i = 0; i < first; i++) html += '<span class="day blank" aria-hidden="true"></span>';
    for (var d = 1; d <= days; d++) {
      var dt = new Date(view.getFullYear(), view.getMonth(), d), open = !loading && isOpen(dt), sel = sameDay(dt, state.date);
      if (open) openCount++;
      var cls = 'day' + (sameDay(dt, today) ? ' today' : '') + (sel ? ' sel' : '');
      html += '<button class="' + cls + '" data-d="' + d + '"' + (open ? '' : ' disabled') + (sel ? ' aria-pressed="true"' : '') +
        ' aria-label="' + DOW[dt.getDay()] + ' ' + MONTHS[dt.getMonth()] + ' ' + d + (open ? (sel ? ', selected' : ', open') : ', unavailable') + '">' + d + '</button>';
    }
    $('#cal-grid').innerHTML = html;
    /* one tab stop for the whole month; arrow keys move between open days */
    var opens = $$('#cal-grid button.day:not([disabled])');
    var on = $('#cal-grid button.day.sel:not([disabled])') || opens[0];
    opens.forEach(function (b) { b.tabIndex = b === on ? 0 : -1; });
    calNote(openCount);
  }
  function calNote(openCount) {
    var note = $('#cal-note'), html = '';
    if (schedMode === 'loading') { note.innerHTML = ''; return; }
    if (!openCount) {
      var keys = openKeys();
      if (keys.length) {
        /* the next opening after this month, or the earliest one if they paged past them all */
        var nk = keys.filter(function (k) { return k >= iso(view); })[0] || keys[0], nd = keyDate(nk);
        html = 'No open dates in ' + MONTHS[view.getMonth()] + '. ' + (nk >= iso(view) ? 'Next opening' : 'Earliest opening') + ': <b>' + fmtDate(nd) + '</b>. <button class="tlink" id="cal-jump" data-k="' + nk + '">Show ' + MONTHS[nd.getMonth()] + '</button>';
      } else {
        html = 'No open dates right now. <a class="tlink" href="sms:' + CONFIG.phone + '">Text Kenya</a> to ask about the next opening.';
      }
    }
    if (schedMode === 'backup' && liveSource) html += (html ? '<br>' : '') + '<span class="cal-warn">Couldn\'t reach the live schedule, so these are the last saved openings. Kenya will confirm your time.</span>';
    note.innerHTML = html;
  }
  $('#cal-note').addEventListener('click', function (e) {
    var b = e.target.closest('#cal-jump'); if (!b) return;
    var d = keyDate(b.dataset.k); view = new Date(d.getFullYear(), d.getMonth(), 1); renderCal();
    var t = $('#cal-grid [tabindex="0"]'); if (t) t.focus();
  });
  function renderSlots() {
    if (!state.date) { $('#slots-label').textContent = schedMode === 'loading' ? 'Open times show up once the schedule loads.' : 'Pick a date to see open times.'; $('#slots').innerHTML = ''; return; }
    $('#slots-label').textContent = 'Open times on ' + fmtDate(state.date) + ':';
    $('#slots').innerHTML = (CONFIG.schedule[iso(state.date)] || []).map(function (t) {
      return '<button class="chip slot" role="radio" aria-checked="' + (state.time === t) + '" data-t="' + t + '">' + t + '</button>';
    }).join('');
    rove($('#slots'), '.slot');
  }
  function schedDone(mode) {
    if (schedMode !== 'loading') return;
    schedMode = mode;
    if (mode === 'backup') { fitView(); if (state.date && !isOpen(state.date)) { state.date = null; state.time = null; } }
    renderCal(); renderSlots(); update();
  }
  /* live schedule from Kenya's Google Sheet (JSONP, so no CORS needed) */
  function normTime(x) {
    var m = String(x || '').trim().toUpperCase().match(/^(\d{1,2})(?::(\d{2}))?(?::\d{2})?\s*([AP])\.?M?\.?$/);
    if (!m) return null;
    return (+m[1]) + ':' + (m[2] || '00') + ' ' + m[3] + 'M';
  }
  function cellTime(c) {
    if (!c) return null;
    if (c.f) return normTime(c.f);
    if (Array.isArray(c.v)) { var h = c.v[0], mi = c.v[1] || 0; return normTime(((h + 11) % 12 + 1) + ':' + String(mi).padStart(2, '0') + (h < 12 ? ' AM' : ' PM')); }
    return normTime(c.v);
  }
  function cellDate(c) {
    if (!c || c.v == null) return null;
    var m = String(c.v).match(/Date\((\d+),(\d+),(\d+)/);
    if (m) return new Date(+m[1], +m[2], +m[3]);
    var d = new Date(c.f || c.v); return isNaN(d) ? null : d;
  }
  /* put a fresh live schedule ({ 'YYYY-MM-DD': ['4:30 PM', ...] }) on the calendar */
  function useSchedule(sched) {
    Object.keys(sched).forEach(function (k) {
      sched[k] = sched[k].filter(function (t, i, a) { return a.indexOf(t) === i; }).sort(function (a, b) { return toMin(a) - toMin(b); });
    });
    CONFIG.schedule = sched; fitView();
    if (state.date && !isOpen(state.date)) { state.date = null; state.time = null; state.collapsed.s2 = false; }
    if (state.time && (sched[iso(state.date)] || []).indexOf(state.time) < 0) { state.time = null; state.collapsed.s2 = false; }
    schedDone('live');
  }
  /* live schedule from the owner panel: open times from today on, read with the public key.
     Row Level Security lets visitors read dates, times and status only, never change them. */
  function loadSupabase() {
    var ctl = 'AbortController' in window ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); schedDone('backup'); }, 8000);
    var url = SB.url.replace(/\/+$/, '') + '/rest/v1/availability?select=date,start_time,status' +
      '&status=eq.open&date=gte.' + iso(today) + '&order=date.asc,start_time.asc&limit=1000';
    fetch(url, { headers: { apikey: SB.anonKey }, signal: ctl ? ctl.signal : undefined, cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (list) {
        clearTimeout(timer);
        if (schedMode !== 'loading' || !Array.isArray(list)) return schedDone('backup');
        var sched = {};
        list.forEach(function (r) {
          if (!r || !/^\d{4}-\d{2}-\d{2}$/.test(r.date)) return;
          var t = normTime(fmt12(r.start_time)); if (!t) return;
          (sched[r.date] = sched[r.date] || []).push(t);
        });
        useSchedule(sched);
      })
      .catch(function () { clearTimeout(timer); schedDone('backup'); });
  }
  function fmt12(t) { var m = String(t || '').match(/^(\d{1,2}):(\d{2})/); if (!m) return ''; var h = +m[1]; return ((h + 11) % 12 + 1) + ':' + m[2] + (h < 12 ? ' AM' : ' PM'); }
  function loadSheet() {
    if (!CONFIG.scheduleSheetId) return;
    var cb = '__kenSched' + Date.now(), done = false, tag = document.createElement('script');
    function finish() { done = true; try { delete window[cb]; } catch (e) { window[cb] = undefined; } tag.remove(); }
    window[cb] = function (res) {
      if (done) return; finish();
      try {
        if (!res || res.status === 'error' || !res.table) return schedDone('backup');
        var sched = {};
        res.table.rows.forEach(function (r) {
          var c = r.c || [], d = cellDate(c[0]); if (!d) return;
          var ts = [c[2], c[3], c[4], c[5]].map(cellTime).filter(Boolean);
          if (!ts.length) return;
          var k = iso(d); sched[k] = (sched[k] || []).concat(ts);
        });
        useSchedule(sched);
      } catch (e) { /* keep backup schedule */ schedDone('backup'); }
    };
    tag.onerror = function () { if (!done) { finish(); schedDone('backup'); } };
    setTimeout(function () { if (!done) { finish(); schedDone('backup'); } }, 8000);
    tag.src = 'https://docs.google.com/spreadsheets/d/' + CONFIG.scheduleSheetId +
      '/gviz/tq?sheet=Schedule&range=A5:F400&headers=0&tqx=out:json;responseHandler:' + cb;
    document.head.appendChild(tag);
  }
  function toMin(t) { var m = t.match(/(\d+):(\d+) ([AP])M/); return (+m[1] % 12) * 60 + (+m[2]) + (m[3] === 'P' ? 720 : 0); }
  if (liveSource === 'supabase') loadSupabase(); else loadSheet();

  $('#cal-prev').addEventListener('click', function () { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); renderCal(); calAnim(-1); });
  $('#cal-next').addEventListener('click', function () { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); renderCal(); calAnim(1); });
  function calAnim(dir) { if (hasGsap && !reduced) gsap.from('#cal-grid .day:not(.blank)', { opacity: 0, x: 10 * dir, duration: .35, stagger: .006, ease: 'power2.out' }); }
  $('#cal-grid').addEventListener('click', function (e) {
    var b = e.target.closest('[data-d]'); if (!b || b.disabled) return;
    var d = +b.dataset.d;
    state.date = new Date(view.getFullYear(), view.getMonth(), d); state.time = null;
    var ts = CONFIG.schedule[iso(state.date)] || [];
    if (ts.length === 1) state.time = ts[0]; /* only one opening that day: pick it, one less tap */
    renderCal(); renderSlots(); update();
    var nb = $('#cal-grid [data-d="' + d + '"]'); if (nb) nb.focus();
    if (hasGsap && !reduced) gsap.from('#slots .slot', { opacity: 0, y: 8, duration: .35, stagger: .04, ease: 'power2.out' });
    if (state.time && e.detail > 0 && narrow.matches) advance('s2');
  });
  $('#cal-grid').addEventListener('keydown', function (e) {
    var k = e.key, cur = document.activeElement; if (!cur || !cur.dataset || !cur.dataset.d) return;
    var dirs = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    var opens = $$('#cal-grid button.day:not([disabled])'), d = +cur.dataset.d, last = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate(), t = null;
    if (k === 'Home') t = opens[0]; else if (k === 'End') t = opens[opens.length - 1];
    else if (dirs[k]) {
      for (var n = d + dirs[k]; n >= 1 && n <= last; n += dirs[k]) { t = $('#cal-grid .day[data-d="' + n + '"]:not([disabled])'); if (t) break; }
      if (!t && Math.abs(dirs[k]) === 7) { /* no open day straight up/down: take the nearest one that way */
        var way = opens.filter(function (b) { return dirs[k] > 0 ? +b.dataset.d > d : +b.dataset.d < d; });
        t = dirs[k] > 0 ? way[0] : way[way.length - 1];
      }
    } else return;
    e.preventDefault();
    if (t) { opens.forEach(function (b) { b.tabIndex = b === t ? 0 : -1; }); t.focus(); }
  });
  $('#slots').addEventListener('click', function (e) {
    var b = e.target.closest('[data-t]'); if (!b) return;
    state.time = b.dataset.t; renderSlots(); update();
    var nb = $('#slots [data-t="' + state.time + '"]'); if (nb) nb.focus();
    if (e.detail > 0 && narrow.matches) advance('s2');
  });
  roveKeys($('#slots'), '.slot');
  function fmtDate(d) { return DOW[d.getDay()] + ', ' + MONTHS[d.getMonth()].slice(0, 3) + ' ' + d.getDate(); }

  /* ── summary ── */
  function total() {
    var s = svc(); if (!s || state.opt == null) return null;
    var o = s.options[state.opt];
    return { base: o.p, plus: !!o.plus, sum: o.p + (state.longHair ? 15 : 0) + (state.design ? 10 : 0) };
  }
  function digits() { return $('#f-phone').value.replace(/\D/g, ''); }
  function setDD(id, text) { var el = $(id); el.textContent = text || el.dataset.empty; el.classList.toggle('empty', !text); }
  ['#sum-style', '#sum-date', '#sum-time', '#sum-len'].forEach(function (id) { $(id).dataset.empty = 'Not chosen yet'; });
  $('#sum-add').dataset.empty = 'None';
  function bookingKey() { return [state.cat, state.opt, state.date ? iso(state.date) : '', state.time].join('|'); }
  function styleText() { var s = svc(); return s && state.opt != null ? s.name + ', ' + s.options[state.opt].n : ''; }

  function update() {
    var s = svc(), t = total();
    setDD('#sum-style', styleText() || (s ? s.name + ' (pick a size)' : ''));
    var adds = []; if (state.longHair) adds.push('Past butt length'); if (state.design) adds.push('Design');
    setDD('#sum-add', adds.join(', '));
    setDD('#sum-date', state.date ? fmtDate(state.date) : '');
    setDD('#sum-time', state.time || '');
    setDD('#sum-len', s && state.opt != null ? 'About ' + (state.design ? s.options[state.opt].dd : s.options[state.opt].d) : '');
    var tot = t ? t.sum : 0;
    animNum('#sum-total', tot, t && t.plus ? '+' : '');
    animNum('#sum-due', Math.max(0, tot - CONFIG.deposit), t && t.plus ? '+' : '');

    /* steps: done marks, one-line picks, collapse, next buttons */
    ['s1', 's2', 's3'].forEach(function (id) {
      var done = stepDone(id), el = $('#' + id);
      el.classList.toggle('done', done);
      if (!done && state.collapsed[id]) state.collapsed[id] = false;
      var col = !!state.collapsed[id];
      el.classList.toggle('collapsed', col);
      var body = $('#' + id + '-body'); if (body) body.hidden = col;
      var ed = $('[data-edit="' + id + '"]', el); if (ed) { ed.hidden = !col; ed.setAttribute('aria-expanded', !col); }
      var nx = $('.step-next', el); if (nx) nx.hidden = !done;
    });
    var pick1 = '';
    if (styleText()) pick1 = styleText() + ' · ' + money(t.sum) + (t.plus ? '+' : '') + (adds.length ? ' · ' + adds.join(', ') : '');
    $('#s1-pick').textContent = pick1;
    $('#s2-pick').textContent = state.date && state.time ? fmtDate(state.date) + ' at ' + state.time : '';

    var ds = $('#dep-status'); ds.classList.toggle('paid', state.paid);
    $('#dep-text').textContent = state.paid ? 'Deposit paid. Thank you!' : 'Deposit not paid yet';
    var pb = $('#pay-dep'); pb.classList.toggle('paid', state.paid); pb.disabled = false; pb.removeAttribute('aria-busy');
    pb.querySelector('.payb-l').textContent = state.paid ? 'Deposit paid ✓' : 'Pay $' + CONFIG.deposit + ' deposit';
    $('#sum-err').textContent = '';

    var sent = !!state.sentKey && state.sentKey === bookingKey() && !missing(false);
    $('#after').hidden = !sent;
    if (sent) $('#gcal').href = gcalUrl();
    mbar();
    save();
  }
  var numState = {};
  function animNum(sel, to, suffix) {
    var el = $(sel);
    if (!hasGsap || reduced) { el.textContent = money(to) + suffix; return; }
    var o = numState[sel] || (numState[sel] = { v: 0 });
    gsap.to(o, { v: to, duration: .5, ease: 'power2.out', overwrite: true, onUpdate: function () { el.textContent = money(Math.round(o.v)) + suffix; } });
  }

  /* ── form fields: inline messages ── */
  function fieldErr(id, msg) {
    var inp = $('#f-' + id), out = $('#e-' + id);
    out.textContent = msg || '';
    if (msg) inp.setAttribute('aria-invalid', 'true'); else inp.removeAttribute('aria-invalid');
  }
  $('#f-name').addEventListener('input', function () { if (this.value.trim()) fieldErr('name', ''); update(); });
  $('#f-phone').addEventListener('input', function () { if (digits().length >= 10) fieldErr('phone', ''); update(); });
  $('#f-notes').addEventListener('input', update);
  $('#f-phone').addEventListener('blur', function () {
    var d = digits();
    if (d.length === 11 && d[0] === '1') d = d.slice(1);
    if (d.length === 10) { this.value = '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6); fieldErr('phone', ''); update(); }
    else if (d.length) fieldErr('phone', 'That number looks short. Use all 10 digits, like (414) 555-0123.');
  });
  $('#f-name').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); $('#f-phone').focus(); } });
  $('#f-phone').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); $('#f-notes').focus(); } });

  /* ── validation + message ── */
  function missing(forPay) {
    var s = svc();
    if (!s) return { m: 'Pick a style first.', step: 's1', focus: '#cat-chips [tabindex="0"]' };
    if (state.opt == null) return { m: 'Pick a size or option for ' + s.name + '.', step: 's1', focus: '#opt-chips [tabindex="0"]' };
    if (!state.date) return { m: 'Pick a date for your appointment.', step: 's2', focus: '#cal-grid [tabindex="0"]' };
    if (!state.time) return { m: 'Pick a time for your appointment.', step: 's2', focus: '#slots [tabindex="0"]' };
    if (!$('#f-name').value.trim()) return { m: 'Add your name so Kenya knows who is booking.', step: 's3', field: 'name' };
    if (!forPay && digits().length < 10) return { m: digits().length ? 'Your phone number needs all 10 digits so Kenya can text you back.' : 'Add a phone number Kenya can text you back at.', step: 's3', field: 'phone' };
    return null;
  }
  function showErr(x) {
    $('#sum-err').textContent = x.m;
    if (hasGsap && !reduced) gsap.fromTo('#sum-err', { x: -6 }, { x: 0, duration: .5, ease: 'elastic.out(1,.3)' });
    if (x.field) fieldErr(x.field, x.m);
    if (state.collapsed[x.step]) { state.collapsed[x.step] = false; update(); $('#sum-err').textContent = x.m; }
    /* take them to the spot that needs fixing */
    goTo('#' + x.step, x.field ? '#f-' + x.field : x.focus);
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
    this.disabled = true; this.setAttribute('aria-busy', 'true'); this.querySelector('.payb-l').textContent = 'Opening Stripe…';
    window.location.href = url;
  });
  /* coming back with the browser's back button: un-stick the pay button */
  addEventListener('pageshow', function (e) { if (e.persisted) update(); });

  /* ── send request ── */
  function markSent() { state.sentKey = bookingKey(); update(); }
  $('#send-text').addEventListener('click', function () {
    var m = missing(false); if (m) return showErr(m);
    markSent();
    var sep = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent) ? '&' : '?';
    window.location.href = 'sms:' + CONFIG.phone + sep + 'body=' + encodeURIComponent(message());
  });
  $('#send-ig').addEventListener('click', function () {
    var m = missing(false); if (m) return showErr(m);
    markSent();
    var msg = message();
    var go = function () { window.open('https://ig.me/m/' + CONFIG.instagram, '_blank', 'noopener'); };
    if (navigator.clipboard) {
      navigator.clipboard.writeText(msg).then(function () { toast('Booking copied. Paste it into the DM.'); go(); }, go);
    } else go();
  });
  $('#copy-req').addEventListener('click', function () {
    var msg = message(), ok = function () { toast('Request copied. Paste it in a text to Kenya.'); };
    if (navigator.clipboard) navigator.clipboard.writeText(msg).then(ok, fallback); else fallback();
    function fallback() {
      var ta = document.createElement('textarea'); ta.value = msg; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); ok(); } catch (e) {} ta.remove();
    }
  });

  /* ── add to calendar: an .ics file built in the browser, marked tentative ── */
  function durMin() {
    var s = svc(), o = s.options[state.opt], d = state.design ? o.dd : o.d;
    var h = d.match(/(\d+)\+?\s*hrs?/), m = d.match(/(\d+)\s*min/);
    return ((h ? +h[1] : 0) * 60 + (m ? +m[1] : 0)) || 120;
  }
  function startEnd() {
    var p = state.time.match(/(\d+):(\d+) ([AP])M/), st = new Date(state.date);
    st.setHours((+p[1] % 12) + (p[3] === 'P' ? 12 : 0), +p[2], 0, 0);
    return [st, new Date(st.getTime() + durMin() * 60000)];
  }
  function stamp(d) { var z = function (n) { return String(n).padStart(2, '0'); }; return d.getFullYear() + z(d.getMonth() + 1) + z(d.getDate()) + 'T' + z(d.getHours()) + z(d.getMinutes()) + '00'; }
  function calTitle() { return 'ken.didit: ' + styleText() + ' (pending)'; }
  function calDetails() { return 'Booking request sent to Kenya (ken.didit). Not confirmed until Kenya texts you back. The address is sent the day before. Text (414) 388-1130 with questions.'; }
  function gcalUrl() {
    var se = startEnd();
    return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(calTitle()) +
      '&dates=' + stamp(se[0]) + '/' + stamp(se[1]) + '&ctz=America/Chicago&details=' + encodeURIComponent(calDetails());
  }
  function icsEsc(s) { return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n'); }
  function fold(line) { var out = []; while (line.length > 73) { out.push(line.slice(0, 73)); line = ' ' + line.slice(73); } out.push(line); return out.join('\r\n'); }
  $('#ics').addEventListener('click', function () {
    var se = startEnd(), now = new Date();
    var utc = now.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ken.didit//booking//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
      'UID:' + utc + '-' + Math.random().toString(36).slice(2) + '@ken.didit', 'DTSTAMP:' + utc,
      'DTSTART:' + stamp(se[0]), 'DTEND:' + stamp(se[1]), 'STATUS:TENTATIVE',
      'SUMMARY:' + icsEsc(calTitle()), 'DESCRIPTION:' + icsEsc(calDetails()), 'LOCATION:' + icsEsc('Address sent the day before'),
      'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsEsc('Hair appointment with Kenya tomorrow'), 'TRIGGER:-PT24H', 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR'].map(fold).join('\r\n') + '\r\n';
    var url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    var a = document.createElement('a'); a.href = url; a.download = 'ken-didit-appointment.ics';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  });

  /* ── start over ── */
  $('#reset').addEventListener('click', function () {
    state.cat = null; state.opt = null; state.longHair = false; state.design = false; state.date = null; state.time = null;
    state.sentKey = null; state.collapsed = { s1: false, s2: false };
    ['#f-name', '#f-phone', '#f-notes'].forEach(function (id) { $(id).value = ''; });
    fieldErr('name', ''); fieldErr('phone', '');
    fitView(); renderService(); renderCal(); renderSlots(); update();
    toast('Booking cleared.');
    goTo('#s1', '#s1-h');
  });

  /* ── phones: a slim bar keeps the picks and total in view while you work through the steps ── */
  var bar = $('#mbar'), barRaf = 0;
  function mbar() {
    if (barRaf) return;
    barRaf = requestAnimationFrame(function () {
      barRaf = 0;
      var st = $('.steps').getBoundingClientRect(), sm = $('#summary').getBoundingClientRect(), ae = document.activeElement;
      var typing = ae && /^(INPUT|TEXTAREA)$/.test(ae.tagName);
      var show = narrow.matches && !typing && !lb.classList.contains('open') && st.top < innerHeight * .55 && st.bottom > 120 && sm.top > innerHeight - 24;
      bar.classList.toggle('on', show); document.body.classList.toggle('mbar-on', show);
      var d = ['s1', 's2', 's3'].map(stepDone), n = d.indexOf(false), t = total();
      $$('li', bar).forEach(function (li, i) { li.classList.toggle('done', d[i]); li.classList.toggle('cur', i === n); });
      $('#mbar-k').textContent = n < 0 ? 'Ready to send' : 'Step ' + (n + 1) + ' of 3';
      var picks = [styleText(), state.date ? fmtDate(state.date) + (state.time ? ', ' + state.time : '') : ''].filter(Boolean).join(' · ');
      $('#mbar-v').textContent = picks || 'Choose your style';
      $('#mbar-t').textContent = t ? money(t.sum) + (t.plus ? '+' : '') : '';
      $('#mbar-go').textContent = n < 0 ? 'Review & send' : 'Review';
    });
  }
  addEventListener('scroll', mbar, { passive: true });
  addEventListener('resize', mbar);
  document.addEventListener('focusin', mbar); document.addEventListener('focusout', function () { setTimeout(mbar, 50); });
  $('#mbar-go').addEventListener('click', function () { goTo('#summary'); });

  /* ── init booking ── */
  var restored = load();
  var returned = /[?&]deposit=paid/.test(location.search);
  if (returned) {
    state.paid = true;
    try { history.replaceState(null, '', location.pathname + '#book'); } catch (e) {}
  }
  if (state.date && state.date >= today) view = new Date(state.date.getFullYear(), state.date.getMonth(), 1); else { state.date = null; state.time = null; }
  fitView(); renderService(); renderCal(); renderSlots(); update();
  if (returned) {
    setTimeout(function () {
      if (svc()) { state.collapsed.s1 = stepDone('s1'); state.collapsed.s2 = stepDone('s2'); update(); toast('Deposit received! Now send your booking request.'); goTo(missing(false) ? '#book' : '#summary'); }
      else { toast('Deposit received. Fill in your booking below, then send your request.'); goTo('#book'); }
    }, 600);
  } else if (restored && svc()) {
    setTimeout(function () { toast('Picked up your booking where you left off.'); }, 900);
  }

  /* ════════════ motion ════════════
     Nothing below hides content before it runs. Reveals only start once
     ScrollTrigger is ready, and reduced-motion visitors skip all of it. */
  function goTo(sel, focusSel) {
    var t = $(sel); if (!t) return;
    var off = -(parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 68) - 12;
    if (lenis) lenis.scrollTo(t, { offset: off, duration: 1.1 }); else t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    if (focusSel) { var f = $(focusSel); if (f) f.focus({ preventScroll: true }); }
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

  var below = function (el) { return el.getBoundingClientRect().top > innerHeight; };
  /* headings: words rise out of a mask, line by line (the text a screen reader gets is unchanged) */
  function splitWords(el) {
    if (el.dataset.split) return $$('.wi', el);
    var words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.textContent = '';
    words.forEach(function (w, i) {
      var o = document.createElement('span'); o.className = 'wo'; o.setAttribute('aria-hidden', 'true');
      var n = document.createElement('span'); n.className = 'wi'; n.textContent = w;
      o.appendChild(n); el.appendChild(o);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
    el.dataset.split = '1';
    return $$('.wi', el);
  }
  var h1w = splitWords($('.hero h1'));
  gsap.timeline({ delay: .1 })
    .from('.hero .eyebrow', { opacity: 0, y: 14, duration: .7, ease: 'power3.out' })
    .from(h1w, { yPercent: 115, duration: 1.1, ease: 'expo.out', stagger: .045 }, .05)
    .from('.hero-sub, .hero-cta', { opacity: 0, y: 22, duration: .9, ease: 'power3.out', stagger: .09 }, .35)
    .from('.hero-rates li', { opacity: 0, y: 12, duration: .6, ease: 'power3.out', stagger: .04 }, .55);
  $$('.sec-head h2').forEach(function (h) {
    var w = splitWords(h);
    if (!below(h)) return;
    gsap.set(w, { yPercent: 115 });
    ScrollTrigger.create({ trigger: h, start: 'top 90%', once: true, onEnter: function () { gsap.to(w, { yPercent: 0, duration: 1.05, ease: 'expo.out', stagger: .06 }); } });
  });
  /* photos open upward as they arrive (gallery and the price-list photo) */
  $$('.g-item img, .rp-frame').filter(function (el) { return el.getBoundingClientRect().top > innerHeight; }).forEach(function (el) {
    gsap.set(el, { clipPath: 'inset(100% 0% 0% 0%)' });
    ScrollTrigger.create({ trigger: el, start: 'top 94%', once: true, onEnter: function () { gsap.to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'expo.inOut', clearProps: 'clipPath' }); } });
  });

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
  ['.sec-note', '.pcat', '.g-item', '.pol', '.link-row', '.cc-left > p'].forEach(function (sel) {
    var els = $$(sel).filter(below);
    if (els.length) { gsap.set(els, { opacity: 0, y: 22 }); reveal(els); }
  });

  addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
