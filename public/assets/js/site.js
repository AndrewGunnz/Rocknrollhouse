(function () {
  'use strict';

  /* ---------- Cookie consent ----------
     Categories: "mindbody" (schedule widget) and "maps" (Google Maps embed).
     Nothing third-party loads until the visitor allows it. The choice is kept in localStorage. */
  var KEY = 'rnrh-consent';
  var VERSION = 1;
  var memoryStore = null; // used when localStorage is unavailable (private mode, blocked storage)
  var categories = ['mindbody', 'maps'];

  function readConsent() {
    var raw = null;
    try { raw = window.localStorage.getItem(KEY); } catch (e) { raw = memoryStore; }
    if (!raw) return null;
    try {
      var c = JSON.parse(raw);
      return c && c.v === VERSION ? c : null;
    } catch (e) { return null; }
  }
  function saveConsent(choice) {
    var c = { v: VERSION, mindbody: !!choice.mindbody, maps: !!choice.maps, ts: new Date().toISOString() };
    var raw = JSON.stringify(c);
    try { window.localStorage.setItem(KEY, raw); } catch (e) { memoryStore = raw; }
    return c;
  }

  var banner = document.getElementById('consent-banner');
  var dialog = document.getElementById('consent-dialog');
  var consent = readConsent();

  function apply(c) {
    categories.forEach(function (cat) {
      var allowed = !!(c && c[cat]);
      // Placeholders show while a category is off.
      document.querySelectorAll('[data-consent-placeholder="' + cat + '"]').forEach(function (el) { el.hidden = allowed; });
      if (!allowed) return;
      // <script type="text/plain" data-consent="cat" data-src="…"> -> real script
      document.querySelectorAll('script[type="text/plain"][data-consent="' + cat + '"]').forEach(function (s) {
        var real = document.createElement('script');
        real.src = s.getAttribute('data-src');
        real.async = true;
        s.parentNode.replaceChild(real, s);
      });
      // <template data-consent="cat"> -> its content
      document.querySelectorAll('template[data-consent="' + cat + '"]').forEach(function (t) {
        t.parentNode.replaceChild(t.content.cloneNode(true), t);
      });
    });
    document.dispatchEvent(new CustomEvent('rnrh:consent', { detail: c }));
  }

  function decide(choice) {
    var before = consent;
    consent = saveConsent(choice);
    if (banner) banner.hidden = true;
    // A service that already loaded can't be unloaded in place: reload so it's gone.
    var revoked = categories.some(function (cat) { return before && before[cat] && !consent[cat]; });
    if (revoked) { location.reload(); return; }
    apply(consent);
  }

  function openSettings() {
    if (!dialog) return;
    dialog.querySelectorAll('[data-consent-category]').forEach(function (box) {
      box.checked = !!(consent && consent[box.getAttribute('data-consent-category')]);
    });
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-consent-accept], [data-consent-reject], [data-consent-open], [data-consent-save], [data-consent-allow]');
    if (!t) return;
    if (t.hasAttribute('data-consent-open')) { e.preventDefault(); openSettings(); return; }
    if (t.hasAttribute('data-consent-accept')) decide({ mindbody: true, maps: true });
    else if (t.hasAttribute('data-consent-reject')) decide({ mindbody: false, maps: false });
    else if (t.hasAttribute('data-consent-save')) {
      var choice = {};
      dialog.querySelectorAll('[data-consent-category]').forEach(function (box) {
        choice[box.getAttribute('data-consent-category')] = box.checked;
      });
      decide(choice);
    } else if (t.hasAttribute('data-consent-allow')) {
      // "Show schedule" / "Show map" on a placeholder: allow just that service.
      var next = { mindbody: !!(consent && consent.mindbody), maps: !!(consent && consent.maps) };
      next[t.getAttribute('data-consent-allow')] = true;
      decide(next);
    }
    if (dialog && dialog.open && t.closest('dialog') === null) dialog.close();
  });

  apply(consent);
  if (!consent && banner) banner.hidden = false;

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('primary-nav');
  if (toggle && nav) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
    window.matchMedia('(min-width: 1241px)').addEventListener('change', function (mq) {
      if (mq.matches) setOpen(false);
    });
  }

  /* ---------- Membership tabs (WAI-ARIA tabs pattern, vertical) ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tier-tab'));
  var select = function (tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
  };
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () {
      select(tab, false);
      if (history.replaceState) history.replaceState(null, '', '#' + tab.id.replace('tab-', ''));
      // On one-column layouts the details sit below the list; bring them into view.
      if (window.matchMedia('(max-width: 900px)').matches) {
        var panel = document.getElementById(tab.getAttribute('aria-controls'));
        var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        panel.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      }
    });
    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') next = tabs[0];
      if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); select(next, true); }
    });
  });
  // Deep links from the home page: /memberships/#gold
  if (tabs.length && location.hash) {
    var fromHash = document.getElementById('tab-' + location.hash.slice(1));
    if (fromHash && fromHash.classList.contains('tier-tab')) select(fromHash, false);
  }

  /* ---------- Mindbody: direct link if the embed doesn't render ---------- */
  var box = document.getElementById('schedule-box');
  var err = document.getElementById('schedule-error');
  if (box && err) {
    var loaded = function () { return !!box.querySelector('iframe'); };
    var timer = null;
    var start = function () {
      if (timer || !(consent && consent.mindbody)) return;
      timer = setTimeout(function () { if (!loaded()) err.classList.add('is-visible'); }, 12000);
    };
    start();
    document.addEventListener('rnrh:consent', start);
    new MutationObserver(function () {
      if (loaded()) err.classList.remove('is-visible');
    }).observe(box, { childList: true, subtree: true });
  }

  /* ---------- Google reviews: only verified, word-for-word entries in #google-reviews ---------- */
  var data = document.getElementById('google-reviews');
  var grid = document.getElementById('review-grid');
  if (data && grid) {
    var reviews = [];
    try { reviews = JSON.parse(data.textContent || '[]'); } catch (e) { reviews = []; }
    reviews = reviews.filter(function (r) { return r && r.text && r.author; });
    if (reviews.length) {
      var el = function (tag, cls, text) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text != null) n.textContent = text;
        return n;
      };
      reviews.forEach(function (r) {
        var card = el('article', 'review');
        if (r.photo && r.photo.src && r.photo.author) {
          var img = el('img', 'review-photo');
          img.src = r.photo.src; img.alt = r.photo.alt || ''; img.loading = 'lazy'; img.decoding = 'async';
          card.appendChild(img);
          card.appendChild(el('p', 'review-photo-credit', 'Photo: ' + r.photo.author + ' on Google'));
        }
        var body = el('div', 'review-body');
        var rating = Math.max(0, Math.min(5, Math.round(r.rating || 5)));
        var stars = el('span', 'review-stars', '★★★★★'.slice(0, rating));
        stars.setAttribute('role', 'img');
        stars.setAttribute('aria-label', rating + ' out of 5 stars');
        body.appendChild(stars);
        body.appendChild(el('blockquote', null, r.text));
        var meta = el('p', 'review-meta');
        var who = r.authorUrl ? el('a', null, r.author) : el('strong', null, r.author);
        if (r.authorUrl) { who.href = r.authorUrl; who.target = '_blank'; who.rel = 'noopener'; }
        meta.appendChild(who);
        meta.appendChild(el('span', null, (r.when ? r.when + ', ' : '') + 'on Google'));
        body.appendChild(meta);
        card.appendChild(body);
        grid.appendChild(card);
      });
      grid.hidden = false;
      document.getElementById('reviews-map').style.marginTop = '32px';
    }
  }
})();
