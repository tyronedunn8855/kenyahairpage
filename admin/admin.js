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
    if (code === '42501' || /row-level security|permission denied/i.test(msg)) return 'This account is not allowed to change hours. Nothing was saved.';
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

  // Kick off: show the saved sign-in, or the sign-in form
  sb.auth.getSession().then(function (r) { route(r.data && r.data.session); });
})();
