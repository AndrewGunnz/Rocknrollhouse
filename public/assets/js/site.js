(function () {
  'use strict';

  /* Mobile menu */
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
    window.matchMedia('(min-width: 1081px)').addEventListener('change', function (mq) {
      if (mq.matches) setOpen(false);
    });
  }

  /* Membership tabs (WAI-ARIA tabs pattern, vertical) */
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

  /* Mindbody: show a direct link if the embed hasn't produced its iframe in time */
  var box = document.getElementById('schedule-box');
  var err = document.getElementById('schedule-error');
  if (box && err) {
    var loaded = function () { return !!box.querySelector('iframe'); };
    var check = function () { if (!loaded()) err.classList.add('is-visible'); };
    var timer = null;
    var start = function () { if (!timer) timer = setTimeout(check, 12000); };
    // Start the clock when the visitor gets near the schedule, so slow scrollers don't see a false alarm.
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries.some(function (en) { return en.isIntersecting; })) { start(); io.disconnect(); }
      }, { rootMargin: '400px' });
      io.observe(box);
    } else { start(); }
    new MutationObserver(function () {
      if (loaded()) err.classList.remove('is-visible');
    }).observe(box, { childList: true, subtree: true });
  }

  /* Google reviews: rendered only from verified, word-for-word entries in #google-reviews */
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
