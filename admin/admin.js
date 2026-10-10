/* ken.didit owner panel.
   Kenya signs in with her phone number and a password she picked. The password lives only in Supabase Auth
   (stored hashed), never in this code. Supabase's own phone sign-in needs a paid SMS provider, so her account
   uses a login built from her number (p4145550123@<loginDomain>); no email is ever sent to it.
   Then she opens or closes days,
   adds or removes times, marks times booked, and copies a week forward.
   Row Level Security in supabase/setup.sql is the real lock: this page only asks, the database decides.
   "Saved" shows only after Supabase returns the changed rows. Anything else shows an error. */
(function () {
  'use strict';

  var $ = function (s) { return document.querySelector(s); };
  var cfg = window.KD_SUPABASE || {};
  var VIEWS = ['v-off', 'v-wait', 'v-signin', 'v-denied', 'v-load-err', 'v-panel'];
  function show(id) {
    VIEWS.forEach(function (v) { var el = document.getElementById(v); if (el) el.hidden = v !== id; });
    $('#signout').hidden = id !== 'v-panel' && id !== 'v-load-err';
  }

  if (!cfg.url || !cfg.anonKey || !window.supabase) { show('v-off'); return; }

  var LOGIN_DOMAIN = cfg.loginDomain || 'kenyastyles.vercel.app';

  var sb = window.supabase.createClient(cfg.url, cfg.anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
  });

  /* ─── Dates and times ─── */
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var MON3 = MONTHS.map(function (m) { return m.slice(0, 3); });
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function pad(n) { return String(n).padStart(2, '0'); }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parse(k) { var p = k.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function weekStart(d) { return addDays(d, -d.getDay()); }
  function fmtTime(t) { // '16:30:00' -> '4:30 PM'
    var p = String(t).split(':'), h = +p[0], m = p[1] || '00';
    return ((h + 11) % 12 + 1) + ':' + m + ' ' + (h < 12 ? 'AM' : 'PM');
  }
  function hm(t) { return String(t).slice(0, 5); } // '16:30:00' -> '16:30'
  function plusMinutes(t, mins) {
    var p = t.split(':'), total = Math.min(23 * 60 + 45, +p[0] * 60 + +p[1] + mins);
    return pad(Math.floor(total / 60)) + ':' + pad(total % 60);
  }
  function fmtDay(d) { return DAYS[d.getDay()] + ', ' + MONTHS[d.getMonth()] + ' ' + d.getDate(); }
  function fmtRange(a, b) {
    return MON3[a.getMonth()] + ' ' + a.getDate() + ' to ' + (a.getMonth() === b.getMonth() ? '' : MON3[b.getMonth()] + ' ') + b.getDate();
  }
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var TODAY = iso(today);

  /* ─── Status bar: Saving, Saved, or a clear error ─── */
  var stEl = $('#status'), stText = $('#status-text'), stX = $('#status-x'), stTimer = 0;
  function status(kind, text) {
    clearTimeout(stTimer);
    stEl.hidden = false;
    stEl.className = 'status ' + kind;
    stEl.setAttribute('role', kind === 'error' ? 'alert' : 'status');
    stText.textContent = text;
    stX.hidden = kind !== 'error';
    if (kind === 'saved') stTimer = setTimeout(function () { stEl.hidden = true; }, 2600);
  }
  stX.addEventListener('click', function () { stEl.hidden = true; });

  function friendly(e) {
    if (!navigator.onLine) return 'You are offline. Nothing was saved.';
    var code = e && (e.code || ''), msg = String((e && e.message) || e || '');
    if (e && e.status >= 500) return 'The booking database had a problem. Nothing was saved. Try again in a minute.';
    if (code === '23505') return 'You already have a time that starts then on this day.';
    if (code === '23514') return 'The end time has to be after the start time.';
    if (code === '42501' || /row-level security|permission denied/i.test(msg)) return 'This account is not allowed to make changes. Nothing was saved.';
    if (code === 'PGRST301' || /jwt|expired|not authenticated/i.test(msg)) return 'Your sign-in ended. Sign in again. Nothing was saved.';
    if (/fetch|network|load failed/i.test(msg)) return 'Could not reach the server. Check your connection. Nothing was saved.';
    return 'Not saved: ' + msg;
  }

  // Runs one change. Resolves with the rows Supabase confirms, or rejects after showing the error.
  var busy = false;
  function save(text, run, okText) {
    if (busy) return Promise.reject(new Error('busy'));
    busy = true; lock(true);
    status('saving', text);
    return Promise.resolve().then(run).then(function (res) {
      if (res.error) { res.error.status = res.status; throw res.error; }
      var rows = res.data || [];
      // An update or delete that RLS blocks returns no rows instead of an error. Never call that saved.
      if (!rows.length && !res.allowEmpty) throw { message: 'not authenticated', code: 'PGRST301', silent: true };
      status('saved', typeof okText === 'function' ? okText(rows) : (okText || 'Saved'));
      return rows;
    }).catch(function (e) {
      status('error', e && e.silent ? 'Not saved. Your sign-in may have ended. Sign out, then sign in again.' : friendly(e));
      throw e;
    }).finally(function () { busy = false; lock(false); });
  }
  function lock(on) {
    document.querySelectorAll('#v-panel button, #v-panel input').forEach(function (b) {
      if (on) { b.dataset.wasDisabled = b.disabled ? '1' : ''; b.disabled = true; }
      else if (b.dataset.wasDisabled !== undefined) { b.disabled = b.dataset.wasDisabled === '1'; delete b.dataset.wasDisabled; }
    });
  }

  /* ─── Sign in: phone number + password ─── */
  // '(414) 555-0123', '414.555.0123' or '+1 414 555 0123' -> '4145550123'
  function phoneDigits(v) {
    var d = String(v || '').replace(/\D/g, '');
    if (d.length === 11 && d.charAt(0) === '1') d = d.slice(1);
    return d.length === 10 ? d : '';
  }
  function loginFor(digits) { return 'p' + digits + '@' + LOGIN_DOMAIN; }
  function prettyLogin(login) {
    var m = String(login || '').match(/^p(\d{3})(\d{3})(\d{4})@/);
    return m ? '(' + m[1] + ') ' + m[2] + '-' + m[3] : (login || 'this account');
  }
  function fieldErr(input, el, text) {
    el.textContent = text; el.hidden = !text;
    if (text) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
  }
  $('#pw-show').addEventListener('click', function () {
    var pw = $('#password'), on = pw.type === 'password';
    pw.type = on ? 'text' : 'password';
    this.textContent = on ? 'Hide' : 'Show';
    this.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
  $('#signin-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var ph = $('#phone'), pw = $('#password'), digits = phoneDigits(ph.value), err = $('#signin-err'), btn = $('#signin-btn');
    err.hidden = true;
    fieldErr(ph, $('#phone-err'), !ph.value.trim() ? 'Type your phone number first.' : !digits ? 'Use your 10-digit number, like (414) 555-0123.' : '');
    fieldErr(pw, $('#password-err'), pw.value ? '' : 'Type your password.');
    if (!digits) { ph.focus(); return; }
    if (!pw.value) { pw.focus(); return; }
    btn.disabled = true; btn.textContent = 'Signing in';
    sb.auth.signInWithPassword({ email: loginFor(digits), password: pw.value }).then(function (res) {
      if (res.error) throw res.error;
      pw.value = '';
    }).catch(function (e) {
      var m = String((e && e.message) || ''), st = e && e.status;
      err.textContent = st === 429 || /rate|too many/i.test(m)
        ? 'Too many tries. Wait a few minutes, then try again.'
        : st === 400 || /invalid login|credentials/i.test(m)
          ? 'That phone number and password don\'t match. Check both and try again.'
          : !navigator.onLine || /fetch|network/i.test(m)
            ? 'Could not reach the server. Check your connection and try again.'
            : 'Could not sign in: ' + m;
      err.hidden = false;
    }).finally(function () { btn.disabled = false; btn.textContent = 'Sign in'; });
  });

  function signOut() {
    status('saving', 'Signing out');
    sb.auth.signOut().finally(function () { stEl.hidden = true; rows = {}; show('v-signin'); });
  }
  $('#signout').addEventListener('click', signOut);
  $('#denied-out').addEventListener('click', signOut);

  /* ─── Who is signed in ─── */
  var routed = '';
  function route(session) {
    if (!session) { routed = ''; show('v-signin'); return; }
    var who = session.user && session.user.email;
    if (routed === who) return;
    routed = who;
    show('v-wait');
    sb.rpc('is_owner').then(function (res) {
      if (res.error) throw res.error;
      if (res.data !== true) { $('#denied-as').textContent = prettyLogin(who); show('v-denied'); return; }
      show('v-panel');
      tabLoaded = {};
      startTabs();
      loadMonth();
    }).catch(function (e) {
      routed = '';
      $('#load-err-text').textContent = friendly(e).replace(' Nothing was saved.', '');
      show('v-load-err');
    });
  }
  $('#load-retry').addEventListener('click', function () { sb.auth.getSession().then(function (r) { route(r.data.session); }); });
  sb.auth.onAuthStateChange(function (event, session) {
    if (event === 'SIGNED_OUT') { routed = ''; show('v-signin'); return; }
    // Let the auth callback finish before calling the database
    setTimeout(function () { route(session); }, 0);
  });

  /* ─── Month data ─── */
  var view = new Date(today.getFullYear(), today.getMonth(), 1);
  var sel = null;          // 'YYYY-MM-DD'
  var rows = {};           // date -> rows sorted by start time
  var loadSeq = 0;
  function gridRange() {
    var a = new Date(view.getFullYear(), view.getMonth(), 1);
    var b = new Date(view.getFullYear(), view.getMonth() + 1, 0);
    return [iso(weekStart(a)), iso(addDays(weekStart(b), 6))];
  }
  function putRows(list, from, to) {
    Object.keys(rows).forEach(function (k) { if (k >= from && k <= to) delete rows[k]; });
    list.forEach(function (r) { (rows[r.date] = rows[r.date] || []).push(r); });
    Object.keys(rows).forEach(function (k) { rows[k].sort(function (x, y) { return x.start_time < y.start_time ? -1 : 1; }); });
  }
  function loadMonth() {
    var seq = ++loadSeq, r = gridRange();
    $('#grid').classList.add('busy'); $('#grid').setAttribute('aria-busy', 'true');
    $('#cal-err').hidden = true;
    renderCal();
    return sb.from('availability').select('id,date,start_time,end_time,status,note')
      .gte('date', r[0]).lte('date', r[1]).order('date').order('start_time')
      .then(function (res) {
        if (seq !== loadSeq) return;
        if (res.error) throw res.error;
        putRows(res.data || [], r[0], r[1]);
        $('#grid').classList.remove('busy'); $('#grid').removeAttribute('aria-busy');
        renderCal(); renderDay();
      }).catch(function (e) {
        if (seq !== loadSeq) return;
        $('#grid').classList.remove('busy'); $('#grid').removeAttribute('aria-busy');
        $('#cal-err-text').textContent = 'Couldn\'t load your hours. ' + friendly(e).replace(' Nothing was saved.', '');
        $('#cal-err').hidden = false;
      });
  }
  $('#cal-retry').addEventListener('click', loadMonth);
  $('#prev').addEventListener('click', function () { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); loadMonth(); });
  $('#next').addEventListener('click', function () { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); loadMonth(); });

  function dayInfo(k) {
    var list = rows[k] || [];
    var open = list.filter(function (r) { return r.status === 'open'; }).length;
    var booked = list.filter(function (r) { return r.status === 'booked'; }).length;
    return { list: list, open: open, booked: booked, closed: list.length - open - booked };
  }

  /* ─── Calendar ─── */
  function renderCal() {
    $('#month').textContent = MONTHS[view.getMonth()] + ' ' + view.getFullYear();
    $('#prev').disabled = view <= new Date(today.getFullYear(), today.getMonth(), 1);
    var grid = $('#grid'), frag = document.createDocumentFragment();
    var first = view.getDay(), n = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    for (var i = 0; i < first; i++) { var bl = document.createElement('span'); bl.className = 'd blank'; frag.appendChild(bl); }
    for (var d = 1; d <= n; d++) {
      var dt = new Date(view.getFullYear(), view.getMonth(), d), k = iso(dt), info = dayInfo(k);
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'd'; b.dataset.k = k;
      if (k < TODAY) { b.classList.add('past'); b.disabled = true; }
      else if (info.open) b.classList.add('open');
      else if (info.list.length) b.classList.add('closed');
      if (k === TODAY) b.classList.add('today');
      if (k === sel) { b.classList.add('sel'); b.setAttribute('aria-pressed', 'true'); }
      var num = document.createElement('span'); num.textContent = d; b.appendChild(num);
      var dots = document.createElement('i'); dots.setAttribute('aria-hidden', 'true');
      for (var j = 0; j < Math.min(info.open, 3); j++) dots.appendChild(document.createElement('b'));
      if (info.booked) { var bk = document.createElement('b'); bk.className = 'bk'; dots.appendChild(bk); }
      b.appendChild(dots);
      b.setAttribute('aria-label', fmtDay(dt) + ', ' + (k < TODAY ? 'past' :
        info.open ? info.open + ' open time' + (info.open > 1 ? 's' : '') + (info.booked ? ', ' + info.booked + ' booked' : '') :
        info.booked ? info.booked + ' booked, no open times' : info.list.length ? 'closed' : 'no times yet'));
      frag.appendChild(b);
    }
    grid.replaceChildren(frag);
  }
  $('#grid').addEventListener('click', function (e) {
    var b = e.target.closest('.d[data-k]'); if (!b || b.disabled) return;
    sel = b.dataset.k;
    renderCal(); closeAdd(); renderDay(true);
  });

  /* ─── One day ─── */
  var USUAL = ['08:00', '11:00', '14:00', '16:30', '17:00']; // start times from Kenya's current schedule
  function renderDay(scroll) {
    var box = $('#day');
    if (!sel) { box.hidden = true; return; }
    var d = parse(sel), info = dayInfo(sel);
    box.hidden = false;
    $('#day-title').textContent = fmtDay(d);
    var st = $('#day-state');
    st.textContent = info.open ? 'Open · ' + info.open + ' time' + (info.open > 1 ? 's' : '') + ' clients can book' + (info.booked ? ' · ' + info.booked + ' booked' : '')
      : info.booked ? 'Fully booked' : info.list.length ? 'Closed. Clients can\'t book this day.' : 'No times yet. Clients can\'t book this day.';
    st.classList.toggle('is-closed', !info.open);

    var tg = $('#toggle-day');
    if (info.open) { tg.textContent = 'Close this day'; tg.className = 'btn danger'; tg.dataset.act = 'close'; }
    else if (info.closed) { tg.textContent = 'Open this day'; tg.className = 'btn'; tg.dataset.act = 'open'; }
    else { tg.textContent = 'Open this day'; tg.className = 'btn'; tg.dataset.act = 'first'; }
    var adding = !$('#add-form').hidden;
    // Fully booked: nothing to open or close. Empty day: the big button opens the add form.
    tg.hidden = (!info.open && !info.closed && info.booked > 0) || (!info.list.length && adding);
    $('#add-open').hidden = adding || !info.list.length;

    var ul = $('#slots'), frag = document.createDocumentFragment();
    if (!info.list.length) {
      var li = document.createElement('li'); li.className = 'empty';
      li.textContent = 'No times on this day yet.';
      frag.appendChild(li);
    }
    info.list.forEach(function (r) {
      var li = document.createElement('li'); li.className = 'slot is-' + r.status;
      var top = document.createElement('div'); top.className = 'slot-top';
      var t = document.createElement('div');
      var tt = document.createElement('p'); tt.className = 'slot-time'; tt.textContent = fmtTime(r.start_time) + ' to ' + fmtTime(r.end_time);
      t.appendChild(tt);
      if (r.note) { var nt = document.createElement('p'); nt.className = 'slot-note'; nt.textContent = r.note; t.appendChild(nt); }
      var del = document.createElement('button'); del.type = 'button'; del.className = 'del'; del.dataset.id = r.id;
      del.setAttribute('aria-label', 'Remove ' + fmtTime(r.start_time) + ' to ' + fmtTime(r.end_time));
      del.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg>';
      top.appendChild(t); top.appendChild(del);
      var seg = document.createElement('div'); seg.className = 'seg'; seg.setAttribute('role', 'group');
      seg.setAttribute('aria-label', 'Status for ' + fmtTime(r.start_time));
      [['open', 'Open', ''], ['booked', 'Booked', 'bk'], ['closed', 'Closed', 'cl']].forEach(function (o) {
        var b = document.createElement('button'); b.type = 'button'; b.textContent = o[1]; b.className = o[2];
        b.dataset.id = r.id; b.dataset.set = o[0]; b.setAttribute('aria-pressed', r.status === o[0] ? 'true' : 'false');
        seg.appendChild(b);
      });
      li.appendChild(top); li.appendChild(seg);
      frag.appendChild(li);
    });
    ul.replaceChildren(frag);

    var ws = weekStart(d), we = addDays(ws, 6);
    $('#copy-hint').textContent = 'Copies this week (' + fmtRange(ws, we) + ') onto next week (' + fmtRange(addDays(ws, 7), addDays(we, 7)) + '). Times already there stay as they are.';
    if (scroll) {
      box.scrollIntoView({ behavior: document.documentElement.classList.contains('rm') ? 'auto' : 'smooth', block: 'start' });
      box.focus({ preventScroll: true });
    }
  }
  function findRow(id) {
    var list = rows[sel] || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function replaceRows(changed) {
    changed.forEach(function (c) {
      var list = rows[c.date] || [];
      for (var i = 0; i < list.length; i++) if (list[i].id === c.id) { list[i] = c; return; }
      list.push(c); rows[c.date] = list;
    });
    Object.keys(rows).forEach(function (k) { rows[k].sort(function (x, y) { return x.start_time < y.start_time ? -1 : 1; }); });
    renderCal(); renderDay();
  }

  // Open or close the whole day
  $('#toggle-day').addEventListener('click', function () {
    var act = this.dataset.act, k = sel;
    if (act === 'first') { openAdd(); return; }
    var from = act === 'close' ? 'open' : 'closed', to = act === 'close' ? 'closed' : 'open';
    var label = fmtDay(parse(k));
    save(act === 'close' ? 'Closing ' + label : 'Opening ' + label, function () {
      return sb.from('availability').update({ status: to }).eq('date', k).eq('status', from).select();
    }, act === 'close' ? 'Saved. ' + label + ' is closed.' : 'Saved. ' + label + ' is open.').then(replaceRows, function () {});
  });

  // Status buttons and remove buttons on each time
  $('#slots').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var r = findRow(b.dataset.id); if (!r) return;
    if (b.dataset.set) {
      if (b.dataset.set === r.status) return;
      var to = b.dataset.set;
      save('Saving ' + fmtTime(r.start_time), function () {
        return sb.from('availability').update({ status: to }).eq('id', r.id).select();
      }, 'Saved. ' + fmtTime(r.start_time) + ' is ' + to + '.').then(replaceRows, function () {});
    } else if (b.classList.contains('del')) {
      if (!window.confirm('Remove ' + fmtTime(r.start_time) + ' to ' + fmtTime(r.end_time) + ' on ' + fmtDay(parse(r.date)) + '?')) return;
      save('Removing ' + fmtTime(r.start_time), function () {
        return sb.from('availability').delete().eq('id', r.id).select();
      }, 'Saved. ' + fmtTime(r.start_time) + ' removed.').then(function () {
        rows[r.date] = (rows[r.date] || []).filter(function (x) { return x.id !== r.id; });
        if (!rows[r.date].length) delete rows[r.date];
        renderCal(); renderDay();
      }, function () {});
    }
  });

  /* ─── Add a time ─── */
  var quick = $('#quick');
  USUAL.forEach(function (t) {
    var b = document.createElement('button'); b.type = 'button'; b.dataset.t = t; b.textContent = fmtTime(t + ':00');
    b.setAttribute('aria-pressed', 'false'); quick.appendChild(b);
  });
  quick.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    $('#start').value = b.dataset.t; $('#end').value = plusMinutes(b.dataset.t, 180);
    quick.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
  });
  $('#start').addEventListener('change', function () {
    if (this.value && (!$('#end').value || $('#end').value <= this.value)) $('#end').value = plusMinutes(this.value, 180);
    quick.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
  });
  function openAdd() {
    $('#add-form').hidden = false; $('#add-err').hidden = true;
    renderDay();
    $('#start').focus();
  }
  function closeAdd() {
    $('#add-form').hidden = true;
    $('#add-form').reset();
    quick.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
    ['#start', '#end'].forEach(function (s) { $(s).removeAttribute('aria-invalid'); });
  }
  $('#add-open').addEventListener('click', openAdd);
  $('#add-cancel').addEventListener('click', function () { closeAdd(); renderDay(); });
  $('#add-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var s = $('#start').value, en = $('#end').value, note = $('#note').value.trim(), err = $('#add-err');
    var bad = !s ? ['#start', 'Pick a start time.'] : !en ? ['#end', 'Pick an end time.'] : en <= s ? ['#end', 'The end time has to be after the start time.'] : null;
    if (!bad && (rows[sel] || []).some(function (r) { return hm(r.start_time) === s; })) bad = ['#start', 'You already have a time at ' + fmtTime(s + ':00') + ' on this day.'];
    if (bad) { err.textContent = bad[1]; err.hidden = false; $(bad[0]).setAttribute('aria-invalid', 'true'); $(bad[0]).focus(); return; }
    err.hidden = true; $('#start').removeAttribute('aria-invalid'); $('#end').removeAttribute('aria-invalid');
    var k = sel;
    save('Saving ' + fmtTime(s + ':00'), function () {
      return sb.from('availability').insert({ date: k, start_time: s, end_time: en, status: 'open', note: note || null }).select();
    }, 'Saved. ' + fmtTime(s + ':00') + ' is open.').then(function (data) {
      closeAdd(); replaceRows(data);
    }, function () {});
  });

  /* ─── Copy a week forward ─── */
  $('#copy-week').addEventListener('click', function () {
    var ws = weekStart(parse(sel)), we = addDays(ws, 6), to0 = addDays(ws, 7), to1 = addDays(we, 7);
    var src;
    status('saving', 'Reading ' + fmtRange(ws, we));
    sb.from('availability').select('date,start_time,end_time,status').gte('date', iso(ws)).lte('date', iso(we)).then(function (res) {
      if (res.error) throw res.error;
      src = res.data || [];
      stEl.hidden = true;
      if (!src.length) { status('error', 'The week of ' + fmtRange(ws, we) + ' has no times to copy.'); return; }
      if (!window.confirm('Copy ' + src.length + ' time' + (src.length > 1 ? 's' : '') + ' from the week of ' + MON3[ws.getMonth()] + ' ' + ws.getDate() + ' onto the week of ' + MON3[to0.getMonth()] + ' ' + to0.getDate() + '?\nBooked times copy as open. Times already there stay.')) return;
      var out = src.map(function (r) {
        return { date: iso(addDays(parse(r.date), 7)), start_time: r.start_time, end_time: r.end_time, status: r.status === 'closed' ? 'closed' : 'open' };
      });
      var wk = 'the week of ' + MON3[to0.getMonth()] + ' ' + to0.getDate();
      return save('Copying to ' + wk, function () {
        return sb.from('availability').upsert(out, { onConflict: 'date,start_time', ignoreDuplicates: true }).select()
          .then(function (r) { r.allowEmpty = !r.error; return r; });
      }, function (added) {
        var skipped = out.length - added.length;
        return added.length
          ? 'Saved. Copied ' + added.length + ' time' + (added.length > 1 ? 's' : '') + ' to ' + wk + (skipped ? '. ' + skipped + ' were already there.' : '.')
          : 'Nothing new to copy. ' + wk.charAt(0).toUpperCase() + wk.slice(1) + ' already has these times.';
      }).then(function (added) { replaceRows(added); });
    }).catch(function (e) { if (e && e.message !== 'busy' && stEl.className.indexOf('error') < 0) status('error', friendly(e)); });
  });

  /* ═══ Tabs: Requests, Hours, Prices, Photos, Info ═══ */
  var TABS = ['requests', 'hours', 'prices', 'photos', 'info'], tabLoaded = {};
  function showTab(name, focus) {
    TABS.forEach(function (t) {
      var b = $('#tab-' + t), on = t === name;
      b.setAttribute('aria-selected', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1;
      $('#t-' + t).hidden = !on;
    });
    if (focus) $('#tab-' + name).focus();
    document.querySelector('.top h1').textContent = 'Your ' + name;
    document.title = 'Your ' + name + ' | ken.didit';
    try { sessionStorage.setItem('kd-admin-tab', name); } catch (e) {}
    if (name === 'prices' && !tabLoaded.prices) loadPrices();
    if (name === 'photos' && !tabLoaded.photos) loadPhotos();
    if (name === 'requests') loadRequests();
    if (name === 'info' && !tabLoaded.info) loadInfo();
  }
  TABS.forEach(function (t, i) {
    var b = $('#tab-' + t);
    b.addEventListener('click', function () { showTab(t); });
    b.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return;
      e.preventDefault(); showTab(TABS[(i + d + TABS.length) % TABS.length], true);
    });
  });
  function startTabs() {
    var t = 'requests'; try { t = sessionStorage.getItem('kd-admin-tab') || 'requests'; } catch (e) {}
    showTab(TABS.indexOf(t) > -1 ? t : 'requests');
    if (t !== 'requests') loadRequests(); // keeps the New count on the tab current
  }

  // Text that goes on her public site: no markup characters, same rule as the database
  function cleanText(v, max) { return String(v || '').replace(/<[^>]*>/g, '').replace(/[<>"`\\]/g, '').replace(/\s+/g, ' ').trim().slice(0, max); }
  var SERVICES = [['knotless', 'Knotless'], ['fulani', 'Fulani'], ['feedins', 'Feed-ins'], ['quickweave', 'Quick weaves'], ['male', "Men's styles"], ['kids', 'Kids styles']];
  var SVC_NAME = {}; SERVICES.forEach(function (s) { SVC_NAME[s[0]] = s[1]; });
  var STYLES = ['Knotless', 'Braids', 'Fulani', 'Locs', 'Quick weaves', 'Kids'];
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  /* ═══ Prices ═══ */
  var prices = [], openOpt = null; // openOpt: option id, or 'new:<service>'
  function loadPrices() {
    $('#prices-err').hidden = true;
    $('#prices').setAttribute('aria-busy', 'true');
    return sb.from('price_options').select('*').order('service_id').order('sort').then(function (res) {
      if (res.error) throw res.error;
      prices = res.data || []; tabLoaded.prices = true;
      $('#prices').removeAttribute('aria-busy');
      renderPrices();
    }).catch(function (e) {
      $('#prices-err-text').textContent = 'Couldn\'t load your prices. ' + friendly(e).replace(' Nothing was saved.', '');
      $('#prices-err').hidden = false; $('#prices').replaceChildren();
    });
  }
  $('#prices-retry').addEventListener('click', loadPrices);
  function optsOf(sid) { return prices.filter(function (o) { return o.service_id === sid; }).sort(function (a, b) { return a.sort - b.sort; }); }
  function priceText(o) { return '$' + o.price + (o.plus ? '+' : ''); }
  function renderPrices() {
    var box = $('#prices'), frag = document.createDocumentFragment();
    SERVICES.forEach(function (s) {
      var list = optsOf(s[0]), card = el('section', 'card svc');
      var head = el('div', 'svc-head'); head.appendChild(el('h2', null, s[1]));
      head.appendChild(el('span', 'svc-from', list.length ? 'from $' + Math.min.apply(null, list.map(function (o) { return o.price; })) : 'Not on your site'));
      card.appendChild(head);
      var ul = el('ul', 'opts');
      list.forEach(function (o, i) {
        var li = el('li'), b = el('button', 'opt-row');
        b.type = 'button'; b.dataset.id = o.id; b.setAttribute('aria-expanded', openOpt === o.id ? 'true' : 'false');
        b.appendChild(el('span', 'on', o.name)); b.appendChild(el('span', 'op', priceText(o)));
        b.appendChild(el('span', 'ot', o.duration + (o.design ? ' · design add-on' : '')));
        li.appendChild(b);
        if (openOpt === o.id) li.appendChild(optForm(s[0], o, i, list.length));
        ul.appendChild(li);
      });
      card.appendChild(ul);
      if (openOpt === 'new:' + s[0]) card.appendChild(optForm(s[0], null, list.length, list.length));
      else { var add = el('button', 'btn-ghost add-opt', 'Add an option'); add.type = 'button'; add.dataset.add = s[0]; card.appendChild(add); }
      frag.appendChild(card);
    });
    box.replaceChildren(frag);
  }
  function field(label, input) { var w = el('div'); var l = el('label', null, label); l.htmlFor = input.id; w.appendChild(l); w.appendChild(input); return w; }
  function optForm(sid, o, idx, count) {
    var f = el('form', 'opt-form'); f.noValidate = true; f.dataset.sid = sid; if (o) f.dataset.id = o.id;
    f.appendChild(el('h3', null, o ? 'Change ' + o.name : 'New ' + SVC_NAME[sid] + ' option'));
    var n = el('input'); n.type = 'text'; n.id = 'of-name'; n.maxLength = 40; n.value = o ? o.name : ''; n.autocomplete = 'off';
    f.appendChild(field('Name', n));
    var pw = el('div', 'money'), p = el('input'); p.type = 'text'; p.inputMode = 'numeric'; p.id = 'of-price'; p.value = o ? o.price : ''; p.autocomplete = 'off';
    pw.appendChild(p); var pl = el('label', null, 'Price'); pl.htmlFor = 'of-price'; var pwrap = el('div'); pwrap.appendChild(pl); pwrap.appendChild(pw); f.appendChild(pwrap);
    var d = el('input'); d.type = 'text'; d.id = 'of-dur'; d.maxLength = 30; d.value = o ? o.duration : ''; d.placeholder = 'Like 2 hrs 30 min'; d.autocomplete = 'off';
    f.appendChild(field('How long it takes', d));
    var c1 = el('label', 'check'), plus = el('input'); plus.type = 'checkbox'; plus.id = 'of-plus'; plus.checked = !!(o && o.plus);
    c1.appendChild(plus); c1.appendChild(document.createTextNode('Starting price (shows a + after it)')); f.appendChild(c1);
    var c2 = el('label', 'check'), des = el('input'); des.type = 'checkbox'; des.id = 'of-design'; des.checked = !!(o && o.design);
    c2.appendChild(des); c2.appendChild(document.createTextNode('Offer a design add-on (+$10)')); f.appendChild(c2);
    var dd = el('input'); dd.type = 'text'; dd.id = 'of-dd'; dd.maxLength = 30; dd.value = o && o.design_duration ? o.design_duration : ''; dd.placeholder = 'Time with a design'; dd.autocomplete = 'off';
    var ddw = field('Time with a design', dd); ddw.hidden = !des.checked; f.appendChild(ddw);
    des.addEventListener('change', function () { ddw.hidden = !des.checked; });
    var err = el('p', 'field-err'); err.setAttribute('role', 'alert'); err.hidden = true; f.appendChild(err);
    var row = el('div', 'row'), sv = el('button', 'btn', 'Save'), cn = el('button', 'btn-ghost', 'Cancel');
    sv.type = 'submit'; cn.type = 'button'; cn.dataset.cancel = '1'; row.appendChild(sv); row.appendChild(cn); f.appendChild(row);
    if (o) {
      var r3 = el('div', 'row3'), up = el('button', null, '\u2191 Up'), dn = el('button', null, '\u2193 Down'), rm = el('button', 'rm-btn', 'Remove');
      up.setAttribute('aria-label', 'Move ' + o.name + ' up'); dn.setAttribute('aria-label', 'Move ' + o.name + ' down');
      [up, dn, rm].forEach(function (b) { b.type = 'button'; });
      up.dataset.move = '-1'; dn.dataset.move = '1'; rm.dataset.remove = '1';
      up.disabled = idx === 0; dn.disabled = idx >= count - 1;
      r3.appendChild(up); r3.appendChild(dn); r3.appendChild(rm); f.appendChild(r3);
    }
    setTimeout(function () { n.focus(); f.scrollIntoView({ behavior: document.documentElement.classList.contains('rm') ? 'auto' : 'smooth', block: 'center' }); }, 30);
    return f;
  }
  $('#prices').addEventListener('click', function (e) {
    var row = e.target.closest('.opt-row'), add = e.target.closest('[data-add]'), f = e.target.closest('.opt-form');
    if (row) { openOpt = openOpt === row.dataset.id ? null : row.dataset.id; renderPrices(); return; }
    if (add) { openOpt = 'new:' + add.dataset.add; renderPrices(); return; }
    if (!f) return;
    var b = e.target.closest('button'); if (!b) return;
    var o = prices.filter(function (x) { return x.id === f.dataset.id; })[0];
    if (b.dataset.cancel) { openOpt = null; renderPrices(); return; }
    if (b.dataset.move && o) {
      var list = optsOf(o.service_id), i = list.indexOf(o), j = i + Number(b.dataset.move), other = list[j]; if (!other) return;
      // Give every option in this service a clean order, with the two swapped
      list[i] = other; list[j] = o;
      var rows = list.map(function (x, k) { return { id: x.id, service_id: x.service_id, name: x.name, price: x.price, duration: x.duration, plus: x.plus, design: x.design, design_duration: x.design_duration, sort: (k + 1) * 10 }; });
      save('Moving ' + o.name, function () { return sb.from('price_options').upsert(rows).select(); }, 'Saved. ' + o.name + ' moved.').then(mergePrices, function () {});
      return;
    }
    if (b.dataset.remove && o) {
      var last = optsOf(o.service_id).length === 1;
      if (!window.confirm('Remove ' + o.name + ' (' + priceText(o) + ') from ' + SVC_NAME[o.service_id] + '?' + (last ? '\nIt is the last option, so ' + SVC_NAME[o.service_id] + ' leaves your site.' : ''))) return;
      save('Removing ' + o.name, function () { return sb.from('price_options').delete().eq('id', o.id).select(); }, 'Saved. ' + o.name + ' removed.').then(function () {
        prices = prices.filter(function (x) { return x.id !== o.id; }); openOpt = null; renderPrices();
      }, function () {});
    }
  });
  $('#prices').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, sid = f.dataset.sid, id = f.dataset.id, err = f.querySelector('.field-err');
    var name = cleanText(f.querySelector('#of-name').value, 40), dur = cleanText(f.querySelector('#of-dur').value, 30);
    var raw = f.querySelector('#of-price').value.replace(/[$,\s]/g, ''), price = /^\d{1,4}$/.test(raw) ? +raw : NaN;
    var design = f.querySelector('#of-design').checked, dd = cleanText(f.querySelector('#of-dd').value, 30);
    var bad = !name ? ['#of-name', 'Give this option a name.'] : !(price >= 0 && price <= 2000) ? ['#of-price', 'Type the price in whole dollars, like 180.'] : !dur ? ['#of-dur', 'Say how long it takes, like 2 hrs 30 min.'] : null;
    if (bad) { err.textContent = bad[1]; err.hidden = false; f.querySelector(bad[0]).setAttribute('aria-invalid', 'true'); f.querySelector(bad[0]).focus(); return; }
    var row = { service_id: sid, name: name, price: price, duration: dur, plus: f.querySelector('#of-plus').checked, design: design, design_duration: design ? (dd || null) : null };
    if (id) {
      save('Saving ' + name, function () { return sb.from('price_options').update(row).eq('id', id).select(); }, 'Saved. ' + name + ' is ' + priceText(row) + ' on your site.')
        .then(function (d) { openOpt = null; mergePrices(d); }, function () {});
    } else {
      var list = optsOf(sid); row.sort = list.length ? list[list.length - 1].sort + 10 : 10;
      save('Adding ' + name, function () { return sb.from('price_options').insert(row).select(); }, 'Saved. ' + name + ' is on your site.')
        .then(function (d) { openOpt = null; mergePrices(d); }, function () {});
    }
  });
  // A field marked wrong clears as soon as she edits it
  ['#prices', '#photo-edit'].forEach(function (sel) {
    $(sel).addEventListener('input', function (e) {
      if (e.target.getAttribute('aria-invalid')) e.target.removeAttribute('aria-invalid');
      var f = e.target.closest('form'), er = f && f.querySelector('.field-err'); if (er) er.hidden = true;
    });
  });
  function mergePrices(rows) {
    rows.forEach(function (r) { var k = prices.map(function (x) { return x.id; }).indexOf(r.id); if (k > -1) prices[k] = r; else prices.push(r); });
    renderPrices();
  }

  /* ═══ Requests ═══
     Clients send a request from the booking page (submit_booking_request in requests-faq.sql).
     Confirm marks the request confirmed and the matching open time booked, so nobody else can pick it. */
  var reqs = [], reqFilter = 'new', reqSeq = 0, openReq = null;
  var IOS = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);
  function loadRequests() {
    var seq = ++reqSeq;
    $('#req-err').hidden = true;
    return sb.from('booking_requests').select('*').order('appt_date').order('appt_time').limit(500).then(function (res) {
      if (seq !== reqSeq) return;
      if (res.error) throw res.error;
      reqs = res.data || []; tabLoaded.requests = true;
      $('#reqs').removeAttribute('aria-busy');
      renderRequests();
    }).catch(function (e) {
      if (seq !== reqSeq) return;
      $('#req-err-text').textContent = 'Couldn\'t load your requests. ' + friendly(e).replace(' Nothing was saved.', '');
      $('#req-err').hidden = false;
      if (!reqs.length) $('#reqs').replaceChildren();
    });
  }
  $('#req-retry').addEventListener('click', loadRequests);
  $('#req-refresh').addEventListener('click', function () {
    var b = this; b.disabled = true; b.textContent = 'Checking';
    loadRequests().finally(function () { b.disabled = false; b.textContent = 'Check for new requests'; });
  });
  // Coming back to the panel from Messages or Calendar: check for new ones
  document.addEventListener('visibilitychange', function () { if (!document.hidden && tabLoaded.requests && !$('#v-panel').hidden) loadRequests(); });

  function isPast(r) { return r.appt_date < TODAY; }
  function bucket(r) { return r.status === 'new' && !isPast(r) ? 'new' : r.status === 'confirmed' && !isPast(r) ? 'confirmed' : 'past'; }
  function phonePretty(d) { return '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6); }
  function durText(m) { var h = Math.floor(m / 60), mm = m % 60; return (h ? h + ' hr' + (h > 1 ? 's' : '') : '') + (h && mm ? ' ' : '') + (mm ? mm + ' min' : ''); }
  function ago(ts) {
    var m = Math.max(0, Math.round((Date.now() - new Date(ts).getTime()) / 60000));
    return m < 2 ? 'just now' : m < 60 ? m + ' min ago' : m < 1440 ? Math.round(m / 60) + ' hr ago' : Math.round(m / 1440) + ' day' + (Math.round(m / 1440) > 1 ? 's' : '') + ' ago';
  }
  function when(r) { return fmtDay(parse(r.appt_date)) + ' at ' + fmtTime(r.appt_time); }
  function firstName(r) { return r.name.split(' ')[0]; }
  function smsHref(r, body) { return 'sms:+1' + r.phone + (body ? (IOS ? '&' : '?') + 'body=' + encodeURIComponent(body) : ''); }
  function confirmText(r) {
    var d = parse(r.appt_date);
    return 'Hi ' + firstName(r) + ', this is Kenya with ken.didit. You are confirmed for ' + r.style + ' on ' + DAYS[d.getDay()] + ', ' + MONTHS[d.getMonth()] + ' ' + d.getDate() + ' at ' + fmtTime(r.appt_time) + '. I will send the address the day before.';
  }
  function icsHref(r) {
    var q = new URLSearchParams({ id: r.id, date: r.appt_date, time: hm(r.appt_time), dur: r.duration_min, name: r.name, style: r.style, addons: r.addons || '',
      total: r.total, plus: r.total_plus ? '1' : '0', phone: r.phone, paid: r.paid_said ? '1' : '0', notes: r.notes || '' });
    return '/api/ics?' + q.toString();
  }
  var PILL = { new: 'New', confirmed: 'Confirmed', done: 'Done', declined: 'Declined' };
  function renderRequests() {
    var n = { new: 0, confirmed: 0, past: 0 };
    reqs.forEach(function (r) { n[bucket(r)]++; });
    $('#n-new').textContent = n.new; $('#n-confirmed').textContent = n.confirmed;
    var tn = $('#tab-n'); tn.textContent = n.new; tn.hidden = !n.new;
    $('#tab-requests').setAttribute('aria-label', 'Requests' + (n.new ? ', ' + n.new + ' new' : ''));
    document.querySelectorAll('.seg button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.f === reqFilter ? 'true' : 'false'); });
    var list = reqs.filter(function (r) { return bucket(r) === reqFilter; });
    if (reqFilter === 'past') list = list.reverse().slice(0, 60);
    var box = $('#reqs'), frag = document.createDocumentFragment();
    if (!list.length) {
      var em = el('div', 'card rq-empty');
      em.appendChild(el('h2', null, reqFilter === 'new' ? 'No new requests' : reqFilter === 'confirmed' ? 'Nothing confirmed yet' : 'Nothing here yet'));
      em.appendChild(el('p', null, reqFilter === 'new' ? 'When a client sends a request from your booking page, it shows up here.' : reqFilter === 'confirmed' ? 'Confirm a new request and it moves here, with its calendar button.' : 'Finished, declined and past requests show here.'));
      frag.appendChild(em);
    }
    list.forEach(function (r) { frag.appendChild(reqCard(r)); });
    box.replaceChildren(frag);
  }
  function reqCard(r) {
    var c = el('article', 'card rq rq-' + r.status); c.dataset.id = r.id;
    var top = el('div', 'rq-top');
    top.appendChild(el('span', 'pill pill-' + r.status, isPast(r) && r.status === 'new' ? 'Missed' : PILL[r.status]));
    top.appendChild(el('span', 'rq-ago', 'Sent ' + ago(r.created_at) + ' by ' + (r.sent_by === 'instagram' ? 'Instagram' : 'text')));
    c.appendChild(top);
    c.appendChild(el('h3', 'rq-name', r.name));
    c.appendChild(el('p', 'rq-when', when(r)));
    var dl = el('dl', 'rq-dl');
    function row(k, v) { if (!v) return; var d = el('div'); d.appendChild(el('dt', null, k)); d.appendChild(el('dd', null, v)); dl.appendChild(d); }
    row('Style', r.style); row('Add-ons', r.addons); row('Takes about', durText(r.duration_min));
    row('Total', '$' + r.total + (r.total_plus ? '+' : '')); row('Deposit', r.paid_said ? 'Client says paid. Check Stripe.' : 'Not paid yet');
    row('Phone', phonePretty(r.phone)); row('Notes', r.notes);
    c.appendChild(dl);
    var acts = el('div', 'rq-acts');
    function btn(label, cls, act) { var b = el('button', cls, label); b.type = 'button'; b.dataset.act = act; acts.appendChild(b); return b; }
    function link(label, cls, href) { var a = el('a', cls, label); a.href = href; acts.appendChild(a); return a; }
    if (r.status === 'new' && !isPast(r)) {
      btn('Confirm', 'btn', 'confirm');
      link('Text ' + firstName(r), 'btn-ghost', smsHref(r));
      btn('Decline', 'btn-ghost quiet', 'decline');
    } else if (r.status === 'confirmed' && !isPast(r)) {
      var cal = link('Add to Apple Calendar', 'btn cal', icsHref(r));
      cal.insertAdjacentHTML('afterbegin', '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>');
      link('Text ' + firstName(r) + ' the confirmation', 'btn-ghost', smsHref(r, confirmText(r)));
      var r2 = el('div', 'row2'); acts.appendChild(r2);
      [['Mark done', 'done'], ['Cancel booking', 'cancel']].forEach(function (x) { var b = el('button', x[1] === 'cancel' ? 'rm-btn' : null, x[0]); b.type = 'button'; b.dataset.act = x[1]; r2.appendChild(b); });
    } else {
      var r3 = el('div', 'row2'); acts.appendChild(r3);
      if (r.status !== 'done' && !isPast(r)) { var b1 = el('button', null, 'Move back to new'); b1.type = 'button'; b1.dataset.act = 'reopen'; r3.appendChild(b1); }
      var b2 = el('button', 'rm-btn', 'Delete'); b2.type = 'button'; b2.dataset.act = 'delete'; r3.appendChild(b2);
    }
    c.appendChild(acts);
    return c;
  }
  document.querySelector('.seg').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-f]'); if (!b) return;
    reqFilter = b.dataset.f; renderRequests();
  });
  function setStatus(r, st) { return sb.from('booking_requests').update({ status: st, updated_at: new Date().toISOString() }).eq('id', r.id).select(); }
  function slot(r, from, to) { // the matching time on her calendar
    return sb.from('availability').update({ status: to }).eq('date', r.appt_date).eq('start_time', r.appt_time).eq('status', from).select();
  }
  function mergeReq(rows) { rows.forEach(function (x) { for (var i = 0; i < reqs.length; i++) if (reqs[i].id === x.id) reqs[i] = x; }); }
  $('#reqs').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-act]'); if (!b) return;
    var card = b.closest('.rq'), r = reqs.filter(function (x) { return x.id === card.dataset.id; })[0]; if (!r) return;
    var act = b.dataset.act, slotNote = '';
    if (act === 'confirm') {
      save('Confirming ' + r.name, function () {
        return setStatus(r, 'confirmed').then(function (res) {
          if (res.error || !(res.data || []).length) return res;
          // Book the time on her site. If she already booked or removed it, the request still confirms.
          return slot(r, 'open', 'booked').then(function (s2) {
            slotNote = s2.error ? ' Check that time on your Hours tab.' : (s2.data || []).length ? ' The time shows as booked on your site.' : ' That time was not open on your calendar, so check your Hours tab.';
            return res;
          });
        });
      }, function () { return 'Confirmed.' + slotNote; }).then(function (rows) {
        mergeReq(rows); reqFilter = 'confirmed'; renderRequests(); markHoursStale();
        var c2 = document.querySelector('.rq[data-id="' + r.id + '"] .cal'); if (c2) c2.focus();
      }, function () {});
    } else if (act === 'decline') {
      if (!window.confirm('Decline ' + r.name + '\'s request for ' + when(r) + '? The time stays open on your site. Text ' + firstName(r) + ' to let them know.')) return;
      save('Declining', function () { return setStatus(r, 'declined'); }, 'Declined. The time is still open.').then(function (rows) { mergeReq(rows); renderRequests(); }, function () {});
    } else if (act === 'done') {
      save('Marking done', function () { return setStatus(r, 'done'); }, 'Marked done.').then(function (rows) { mergeReq(rows); renderRequests(); }, function () {});
    } else if (act === 'cancel') {
      if (!window.confirm('Cancel ' + r.name + '\'s booking on ' + when(r) + '? The time opens again on your site. Delete the event from your calendar too.')) return;
      save('Canceling', function () {
        return setStatus(r, 'declined').then(function (res) {
          if (res.error || !(res.data || []).length) return res;
          return slot(r, 'booked', 'open').then(function () { return res; });
        });
      }, 'Canceled. The time is open again.').then(function (rows) { mergeReq(rows); renderRequests(); markHoursStale(); }, function () {});
    } else if (act === 'reopen') {
      save('Moving back', function () { return setStatus(r, 'new'); }, 'Moved back to new.').then(function (rows) { mergeReq(rows); reqFilter = 'new'; renderRequests(); }, function () {});
    } else if (act === 'delete') {
      if (!window.confirm('Delete ' + r.name + '\'s request for good?')) return;
      save('Deleting', function () { return sb.from('booking_requests').delete().eq('id', r.id).select(); }, 'Deleted.').then(function () {
        reqs = reqs.filter(function (x) { return x.id !== r.id; }); renderRequests();
      }, function () {});
    }
  });
  function markHoursStale() { rows = {}; loadMonth(); }

  /* ═══ Info: policies and FAQ ═══ */
  var INFO = {
    pol: { table: 'site_policies', box: '#pol-list', noun: 'policy', items: [], open: null,
      fields: [{ k: 'big', label: 'Big text', max: 14, ph: 'Like $15 or 10 min' }, { k: 'title', label: 'Title', max: 30, ph: 'Like Deposit' }, { k: 'body', label: 'What it says', max: 240, area: true }],
      head: function (x) { return x.big + ' · ' + x.title; }, sub: function (x) { return x.body; } },
    faq: { table: 'faq_items', box: '#faq-list', noun: 'question', items: [], open: null,
      fields: [{ k: 'q', label: 'Question', max: 120 }, { k: 'a', label: 'Answer', max: 500, area: true }],
      head: function (x) { return x.q; }, sub: function (x) { return x.a; } }
  };
  function loadInfo() {
    $('#info-err').hidden = true;
    return Promise.all([INFO.pol, INFO.faq].map(function (L) {
      return sb.from(L.table).select('*').order('sort').then(function (res) { if (res.error) throw res.error; L.items = res.data || []; });
    })).then(function () {
      tabLoaded.info = true;
      ['pol', 'faq'].forEach(function (k) { $(INFO[k].box).removeAttribute('aria-busy'); renderInfo(k); });
    }).catch(function (e) {
      $('#info-err-text').textContent = 'Couldn\'t load your policies and FAQ. ' + friendly(e).replace(' Nothing was saved.', '');
      $('#info-err').hidden = false;
    });
  }
  $('#info-retry').addEventListener('click', loadInfo);
  function renderInfo(k) {
    var L = INFO[k], frag = document.createDocumentFragment(), ul = el('ul', 'opts');
    L.items.forEach(function (x, i) {
      var li = el('li'), b = el('button', 'opt-row info-row' + (x.hidden ? ' is-hidden' : ''));
      b.type = 'button'; b.dataset.id = x.id; b.setAttribute('aria-expanded', L.open === x.id ? 'true' : 'false');
      b.appendChild(el('span', 'on', L.head(x))); b.appendChild(el('span', 'op', x.hidden ? 'Hidden' : ''));
      b.appendChild(el('span', 'ot', L.sub(x)));
      li.appendChild(b);
      if (L.open === x.id) li.appendChild(infoForm(k, x, i));
      ul.appendChild(li);
    });
    frag.appendChild(ul);
    if (L.open === 'new') frag.appendChild(infoForm(k, null, L.items.length));
    else { var add = el('button', 'btn-ghost add-opt', 'Add a ' + L.noun); add.type = 'button'; add.dataset.add = '1'; frag.appendChild(add); }
    $(L.box).replaceChildren(frag);
  }
  function infoForm(k, x, idx) {
    var L = INFO[k], f = el('form', 'opt-form'); f.noValidate = true; if (x) f.dataset.id = x.id;
    f.appendChild(el('h3', null, x ? 'Change this ' + L.noun : 'New ' + L.noun));
    var first = null;
    L.fields.forEach(function (fd) {
      var inp = el(fd.area ? 'textarea' : 'input'); if (!fd.area) inp.type = 'text'; else inp.rows = 4;
      inp.id = 'if-' + k + '-' + fd.k; inp.maxLength = fd.max; inp.value = x ? x[fd.k] : ''; inp.autocomplete = 'off'; if (fd.ph) inp.placeholder = fd.ph;
      inp.dataset.k = fd.k; f.appendChild(field(fd.label, inp)); if (!first) first = inp;
    });
    var c = el('label', 'check'), hid = el('input'); hid.type = 'checkbox'; hid.id = 'if-' + k + '-hidden'; hid.checked = !!(x && x.hidden);
    c.appendChild(hid); c.appendChild(document.createTextNode('Hide from my site for now')); f.appendChild(c);
    var err = el('p', 'field-err'); err.setAttribute('role', 'alert'); err.hidden = true; f.appendChild(err);
    var row = el('div', 'row'), sv = el('button', 'btn', 'Save'), cn = el('button', 'btn-ghost', 'Cancel');
    sv.type = 'submit'; cn.type = 'button'; cn.dataset.cancel = '1'; row.appendChild(sv); row.appendChild(cn); f.appendChild(row);
    if (x) {
      var r3 = el('div', 'row3'), up = el('button', null, '↑ Up'), dn = el('button', null, '↓ Down'), rm = el('button', 'rm-btn', 'Remove');
      [up, dn, rm].forEach(function (b) { b.type = 'button'; });
      up.dataset.move = '-1'; dn.dataset.move = '1'; rm.dataset.remove = '1';
      up.disabled = idx === 0; dn.disabled = idx >= L.items.length - 1;
      r3.appendChild(up); r3.appendChild(dn); r3.appendChild(rm); f.appendChild(r3);
    }
    setTimeout(function () { first.focus(); f.scrollIntoView({ behavior: document.documentElement.classList.contains('rm') ? 'auto' : 'smooth', block: 'center' }); }, 30);
    return f;
  }
  function mergeInfo(k, list) {
    var L = INFO[k];
    list.forEach(function (r) { var i = L.items.map(function (x) { return x.id; }).indexOf(r.id); if (i > -1) L.items[i] = r; else L.items.push(r); });
    L.items.sort(function (a, b) { return a.sort - b.sort; });
    L.open = null; renderInfo(k);
  }
  ['pol', 'faq'].forEach(function (k) {
    var L = INFO[k], box = $(L.box);
    box.addEventListener('click', function (e) {
      var row = e.target.closest('.opt-row'), add = e.target.closest('[data-add]'), f = e.target.closest('.opt-form');
      if (row) { L.open = L.open === row.dataset.id ? null : row.dataset.id; renderInfo(k); return; }
      if (add) { L.open = 'new'; renderInfo(k); return; }
      if (!f) return;
      var b = e.target.closest('button'); if (!b) return;
      var x = L.items.filter(function (y) { return y.id === f.dataset.id; })[0];
      if (b.dataset.cancel) { L.open = null; renderInfo(k); return; }
      if (b.dataset.move && x) {
        var list = L.items.slice(), i = list.indexOf(x), j = i + Number(b.dataset.move); if (!list[j]) return;
        list[i] = list[j]; list[j] = x;
        var ups = list.map(function (y, n) { var o = {}; Object.keys(y).forEach(function (key) { o[key] = y[key]; }); o.sort = (n + 1) * 10; return o; });
        save('Moving', function () { return sb.from(L.table).upsert(ups).select(); }, 'Saved. Order changed on your site.').then(function (d) { mergeInfo(k, d); L.open = x.id; renderInfo(k); }, function () {});
        return;
      }
      if (b.dataset.remove && x) {
        if (k === 'pol' && L.items.length === 1) { window.alert('Keep at least one policy. Tick "Hide from my site" to take it off instead.'); return; }
        if (!window.confirm('Remove "' + L.head(x) + '" from your site?')) return;
        save('Removing', function () { return sb.from(L.table).delete().eq('id', x.id).select(); }, 'Saved. Removed from your site.').then(function () {
          L.items = L.items.filter(function (y) { return y.id !== x.id; }); L.open = null; renderInfo(k);
        }, function () {});
      }
    });
    box.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.target, id = f.dataset.id, err = f.querySelector('.field-err'), row = {}, bad = null;
      L.fields.forEach(function (fd) {
        var inp = f.querySelector('[data-k="' + fd.k + '"]'), v = cleanText(inp.value, fd.max); row[fd.k] = v;
        if (!v && !bad) bad = [inp, fd.label + ' can\'t be empty.'];
      });
      if (bad) { err.textContent = bad[1]; err.hidden = false; bad[0].setAttribute('aria-invalid', 'true'); bad[0].focus(); return; }
      row.hidden = f.querySelector('#if-' + k + '-hidden').checked; row.updated_at = new Date().toISOString();
      if (id) {
        save('Saving', function () { return sb.from(L.table).update(row).eq('id', id).select(); }, row.hidden ? 'Saved. Hidden from your site.' : 'Saved. It shows on your site.').then(function (d) { mergeInfo(k, d); }, function () {});
      } else {
        row.sort = L.items.length ? L.items[L.items.length - 1].sort + 10 : 10;
        save('Adding', function () { return sb.from(L.table).insert(row).select(); }, row.hidden ? 'Saved. Hidden for now.' : 'Saved. It shows on your site.').then(function (d) { mergeInfo(k, d); }, function () {});
      }
    });
    box.addEventListener('input', function (e) {
      if (e.target.getAttribute('aria-invalid')) e.target.removeAttribute('aria-invalid');
      var f = e.target.closest('form'), er = f && f.querySelector('.field-err'); if (er) er.hidden = true;
    });
  });

  /* ═══ Photos ═══ */
  var photos = [], openPhoto = null;
  var STORE = (cfg.url || '').replace(/\/+$/, '') + '/storage/v1/object/public/gallery/';
  function thumb(p) { var m = p.src.match(/^builtin:(.+)$/); return m ? '/img/w/' + m[1] + '-400.webp' : STORE + p.src + '/800'; }
  function large(p) { var m = p.src.match(/^builtin:(.+)$/); return m ? '/img/w/' + m[1] + '-800.webp' : STORE + p.src + '/1600'; }
  function loadPhotos() {
    $('#photos-err').hidden = true;
    return sb.from('gallery_photos').select('*').order('sort').then(function (res) {
      if (res.error) throw res.error;
      photos = res.data || []; tabLoaded.photos = true;
      $('#photo-grid').removeAttribute('aria-busy');
      renderPhotos();
    }).catch(function (e) {
      $('#photos-err-text').textContent = 'Couldn\'t load your photos. ' + friendly(e).replace(' Nothing was saved.', '');
      $('#photos-err').hidden = false; $('#photo-grid').replaceChildren();
    });
  }
  $('#photos-retry').addEventListener('click', loadPhotos);
  function sorted() { return photos.slice().sort(function (a, b) { return a.sort - b.sort; }); }
  function renderPhotos() {
    var grid = $('#photo-grid'), frag = document.createDocumentFragment(), list = sorted();
    if (!list.length) frag.appendChild(el('p', 'card empty', 'No photos yet. Tap Add photos to put your work on your site.'));
    list.forEach(function (p) {
      var b = el('button', 'ph' + (p.hidden ? ' is-hidden' : '')); b.type = 'button'; b.dataset.id = p.id;
      b.setAttribute('aria-pressed', openPhoto === p.id ? 'true' : 'false');
      b.setAttribute('aria-label', (p.caption || p.tag) + (p.hidden ? ', hidden from your site' : '') + '. Tap to change.');
      var w = el('span', 'ph-img'), im = el('img'); im.src = thumb(p); im.alt = ''; im.loading = 'lazy'; im.decoding = 'async'; w.appendChild(im); b.appendChild(w);
      if (p.hidden) b.appendChild(el('span', 'ph-badge', 'Hidden'));
      b.appendChild(el('span', 'ph-c', p.caption || p.tag)); b.appendChild(el('span', 'ph-t', p.tag));
      frag.appendChild(b);
    });
    grid.replaceChildren(frag);
    renderPhotoEdit();
  }
  $('#photo-grid').addEventListener('click', function (e) {
    var b = e.target.closest('.ph'); if (!b) return;
    openPhoto = openPhoto === b.dataset.id ? null : b.dataset.id; renderPhotos();
    if (openPhoto) { var pe = $('#photo-edit'); pe.scrollIntoView({ behavior: document.documentElement.classList.contains('rm') ? 'auto' : 'smooth', block: 'start' }); pe.focus({ preventScroll: true }); }
  });
  function opt(sel, value, label, cur) { var o = el('option', null, label); o.value = value; if (value === cur) o.selected = true; sel.appendChild(o); }
  function renderPhotoEdit() {
    var box = $('#photo-edit'), p = photos.filter(function (x) { return x.id === openPhoto; })[0];
    if (!p) { box.hidden = true; box.replaceChildren(); return; }
    var list = sorted(), i = list.indexOf(p), up = p.src.indexOf('uploads/') === 0;
    var f = el('form'); f.noValidate = true; f.dataset.id = p.id;
    var h = el('h2', null, p.caption || 'New photo'); h.id = 'pe-title'; f.appendChild(h);
    var iw = el('div', 'pe-img'), im = el('img'); im.src = large(p); im.alt = 'The photo you are changing'; iw.appendChild(im); f.appendChild(iw);
    var c = el('input'); c.type = 'text'; c.id = 'pe-cap'; c.maxLength = 80; c.value = p.caption; c.placeholder = 'Like Small knotless braids'; c.autocomplete = 'off';
    f.appendChild(field('Caption', c));
    var st = el('select'); st.id = 'pe-tag'; STYLES.forEach(function (s) { opt(st, s, s, p.tag); }); f.appendChild(field('Style filter', st));
    var bk = el('select'); bk.id = 'pe-book'; SERVICES.forEach(function (s) { opt(bk, s[0], s[1], p.book); }); f.appendChild(field('"Book this look" opens', bk));
    var tg = el('label', 'toggle'), sh = el('input'); sh.type = 'checkbox'; sh.id = 'pe-show'; sh.checked = !p.hidden;
    tg.appendChild(sh); tg.appendChild(document.createTextNode('Show on my site')); f.appendChild(tg);
    var err = el('p', 'field-err'); err.setAttribute('role', 'alert'); err.hidden = true; f.appendChild(err);
    var row = el('div', 'row'), sv = el('button', 'btn', 'Save'), cn = el('button', 'btn-ghost', 'Close');
    sv.type = 'submit'; cn.type = 'button'; cn.dataset.close = '1'; row.appendChild(sv); row.appendChild(cn); f.appendChild(row);
    var r3 = el('div', 'row3'), ea = el('button', null, 'Earlier'), la = el('button', null, 'Later'), rm = el('button', 'rm-btn', up ? 'Delete' : 'Hide');
    [ea, la, rm].forEach(function (b) { b.type = 'button'; });
    ea.dataset.move = '-1'; la.dataset.move = '1'; rm.dataset.remove = '1';
    ea.disabled = i === 0; la.disabled = i === list.length - 1; rm.disabled = !up && p.hidden;
    r3.appendChild(ea); r3.appendChild(la); r3.appendChild(rm); f.appendChild(r3);
    if (!up) f.appendChild(el('p', 'hint', 'This photo came with your site, so you hide it instead of deleting it.'));
    box.replaceChildren(f); box.hidden = false;
  }
  $('#photo-edit').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var p = photos.filter(function (x) { return x.id === openPhoto; })[0]; if (!p) return;
    if (b.dataset.close) { openPhoto = null; renderPhotos(); return; }
    if (b.dataset.move) {
      var list = sorted(), i = list.indexOf(p), j = i + Number(b.dataset.move); if (!list[j]) return;
      var a = list[i]; list[i] = list[j]; list[j] = a;
      var rows = list.map(function (x, k) { return { id: x.id, src: x.src, tag: x.tag, caption: x.caption, book: x.book, tall: x.tall, width: x.width, height: x.height, hidden: x.hidden, sort: (k + 1) * 10 }; });
      save('Moving photo', function () { return sb.from('gallery_photos').upsert(rows).select(); }, 'Saved. Photo moved ' + (b.dataset.move === '-1' ? 'earlier.' : 'later.')).then(mergePhotos, function () {});
      return;
    }
    if (b.dataset.remove) {
      if (p.src.indexOf('uploads/') !== 0) {
        save('Hiding photo', function () { return sb.from('gallery_photos').update({ hidden: true }).eq('id', p.id).select(); }, 'Saved. The photo is hidden from your site.').then(mergePhotos, function () {});
        return;
      }
      if (!window.confirm('Delete this photo from your site for good?')) return;
      save('Deleting photo', function () { return sb.from('gallery_photos').delete().eq('id', p.id).select(); }, 'Saved. Photo deleted.').then(function () {
        photos = photos.filter(function (x) { return x.id !== p.id; }); openPhoto = null; renderPhotos();
        // The site no longer lists it. Clear the files too; a leftover file is harmless if this fails.
        sb.storage.from('gallery').remove([p.src + '/1600', p.src + '/800']).catch(function () {});
      }, function () {});
    }
  });
  $('#photo-edit').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, p = photos.filter(function (x) { return x.id === f.dataset.id; })[0]; if (!p) return;
    var row = { caption: cleanText(f.querySelector('#pe-cap').value, 80), tag: f.querySelector('#pe-tag').value, book: f.querySelector('#pe-book').value, hidden: !f.querySelector('#pe-show').checked };
    save('Saving photo', function () { return sb.from('gallery_photos').update(row).eq('id', p.id).select(); },
      row.hidden ? 'Saved. The photo is hidden from your site.' : 'Saved. The photo is on your site.').then(function (d) { openPhoto = null; mergePhotos(d); }, function () {});
  });
  function mergePhotos(rows) {
    rows.forEach(function (r) { var k = photos.map(function (x) { return x.id; }).indexOf(r.id); if (k > -1) photos[k] = r; else photos.push(r); });
    renderPhotos();
  }

  // Shrink a photo on the phone before upload: longest side max px, the whole picture kept (never cropped)
  function openImage(file) {
    if (window.createImageBitmap) return createImageBitmap(file, { imageOrientation: 'from-image' }).catch(function () { return viaImg(file); });
    return viaImg(file);
  }
  function viaImg(file) {
    return new Promise(function (res, rej) {
      var u = URL.createObjectURL(file), im = new Image();
      im.onload = function () { res(im); setTimeout(function () { URL.revokeObjectURL(u); }, 1000); };
      im.onerror = function () { URL.revokeObjectURL(u); rej(new Error('This photo type can\'t be opened here. Try a JPG or a screenshot of it.')); };
      im.src = u;
    });
  }
  function shrink(img, max) {
    var w = img.naturalWidth || img.width, h = img.naturalHeight || img.height, k = Math.min(1, max / Math.max(w, h));
    var c = document.createElement('canvas'); c.width = Math.round(w * k); c.height = Math.round(h * k);
    var x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(img, 0, 0, c.width, c.height);
    return new Promise(function (res, rej) {
      c.toBlob(function (b) {
        // Raw bytes plus their type: the upload then carries the image's own content type
        var done = function (x) { x.arrayBuffer().then(function (buf) { res({ buf: buf, type: x.type, w: c.width, h: c.height }); }, rej); };
        if (b && b.type === 'image/webp') return done(b);
        c.toBlob(function (j) { j ? done(j) : rej(new Error('Couldn\'t prepare this photo.')); }, 'image/jpeg', 0.86);
      }, 'image/webp', 0.84);
    });
  }
  function newId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx'.replace(/x/g, function () { return (Math.random() * 16 | 0).toString(16); });
  }
  $('#add-photos').addEventListener('change', function () {
    var files = Array.prototype.slice.call(this.files || []); this.value = '';
    if (!files.length || busy) return;
    var added = [], n = files.length;
    busy = true; lock(true); $('#add-photos').disabled = true;
    var first = sorted()[0], top = first ? first.sort : 0;
    files.reduce(function (chain, file, k) {
      return chain.then(function () {
        var label = n > 1 ? ' ' + (k + 1) + ' of ' + n : '', id = newId(), base = 'uploads/' + id, big, small;
        status('saving', 'Getting photo' + label + ' ready');
        return openImage(file).then(function (img) {
          return shrink(img, 1600).then(function (r) { big = r; return shrink(img, 800); }).then(function (r) { small = r; if (img.close) img.close(); });
        }).then(function () {
          status('saving', 'Uploading photo' + label);
          var o = { cacheControl: '31536000', upsert: false };
          return sb.storage.from('gallery').upload(base + '/1600', big.buf, Object.assign({ contentType: big.type }, o)).then(function (r) {
            if (r.error) throw r.error;
            return sb.storage.from('gallery').upload(base + '/800', small.buf, Object.assign({ contentType: small.type }, o));
          }).then(function (r) { if (r.error) throw r.error; });
        }).then(function () {
          top -= 10;
          return sb.from('gallery_photos').insert({ src: base, tag: 'Braids', caption: '', book: 'male', tall: big.h / big.w > 1.45, width: big.w, height: big.h, hidden: false, sort: top }).select()
            .then(function (r) {
              if (r.error) { sb.storage.from('gallery').remove([base + '/1600', base + '/800']).catch(function () {}); throw r.error; }
              if (!r.data || !r.data.length) throw { message: 'not authenticated', code: 'PGRST301' };
              added.push(r.data[0]);
            });
        });
      });
    }, Promise.resolve()).then(function () {
      status('saved', 'Saved. ' + (n > 1 ? n + ' photos are' : 'Your photo is') + ' on your site. Add a caption next.');
    }).catch(function (e) {
      var m = String((e && e.message) || '');
      status('error', (added.length ? added.length + ' of ' + n + ' saved. ' : '') + (/opened here|prepare/.test(m) ? m : /mime|type/i.test(m) ? 'That file type isn\'t allowed. Use a photo.' : /size|large/i.test(m) ? 'That photo is too big. Try a smaller one.' : friendly(e)));
    }).finally(function () {
      busy = false; lock(false); $('#add-photos').disabled = false;
      added.forEach(function (r) { photos.push(r); });
      if (added.length) openPhoto = added[added.length - 1].id;
      renderPhotos();
      if (openPhoto) $('#photo-edit').scrollIntoView({ block: 'start' });
    });
  });

  // Kick off: show the saved sign-in, or the sign-in form
  sb.auth.getSession().then(function (r) { route(r.data && r.data.session); });
})();
