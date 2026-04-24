(function () {
  'use strict';

  // ── Nav: frosted glass on scroll + hamburger mobile overlay ──────────────────
  function initNav() {
    var navbar = document.getElementById('navbar');
    var hamburger = document.getElementById('hamburger');
    var mobileMenu = document.getElementById('mobileMenu');
    if (!navbar) return;

    // Scroll → .scrolled
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          navbar.classList.toggle('scrolled', window.scrollY > 60);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Mark active nav link on menu page
    if (window.location.pathname.includes('menu')) {
      var menuLink = navbar.querySelector('a[href="menu.html"]');
      if (menuLink) menuLink.classList.add('nav-active');
    }

    if (!hamburger || !mobileMenu) return;

    function openMenu() {
      hamburger.classList.add('open');
      mobileMenu.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', function () {
      if (hamburger.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    document.querySelectorAll('.mobile-link').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        closeMenu();
        hamburger.focus();
      }
    });
  }

  // ── Scroll Reveals via IntersectionObserver ───────────────────────────────────
  function initScrollReveals() {
    var els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    if (!els.length) return;

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      els.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    els.forEach(function (el) { observer.observe(el); });
  }

  // ── Hero Parallax (homepage only) ─────────────────────────────────────────────
  function initHeroParallax() {
    var hero = document.querySelector('.hero');
    if (!hero) return;

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    var layers = [
      { el: document.getElementById('hlBg'),      mult: 18 },
      { el: document.getElementById('hlMid'),     mult: 8 },
      { el: document.getElementById('hlContent'), mult: -12 },
    ].filter(function (l) { return l.el; });

    var baseTransforms = [
      'translateZ(-60px) scale(1.15)',
      'translateZ(-20px) scale(1.05)',
      'translateZ(40px)',
    ];

    hero.addEventListener('mousemove', function (e) {
      var cx = hero.offsetWidth / 2;
      var cy = hero.offsetHeight / 2;
      var dx = (e.clientX - cx) / cx;
      var dy = (e.clientY - cy) / cy;
      layers.forEach(function (layer, i) {
        var tx = dx * layer.mult;
        var ty = dy * layer.mult;
        layer.el.style.transform = baseTransforms[i] + ' translate(' + tx + 'px, ' + ty + 'px)';
      });
    });

    hero.addEventListener('mouseleave', function () {
      layers.forEach(function (layer, i) {
        layer.el.style.transition = 'transform 0.6s cubic-bezier(0.22,1,0.36,1)';
        layer.el.style.transform = baseTransforms[i];
        setTimeout(function () {
          layer.el.style.transition = 'transform 0.14s cubic-bezier(0.22,1,0.36,1)';
        }, 600);
      });
    });
  }

  // ── Menu Tabs (menu.html only) ────────────────────────────────────────────────
  function initMenuTabs() {
    var tabs = document.querySelectorAll('.tab-btn');
    if (!tabs.length) return;

    function showPanel(tabId) {
      // Hide all panels
      document.querySelectorAll('.menu-panel').forEach(function (panel) {
        panel.hidden = true;
      });
      // Deactivate all tabs
      tabs.forEach(function (t) {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      // Activate the clicked tab
      var activeTab = document.querySelector('.tab-btn[data-tab="' + tabId + '"]');
      var activePanel = document.getElementById('panel-' + tabId);
      if (activeTab) {
        activeTab.classList.add('active');
        activeTab.setAttribute('aria-selected', 'true');
      }
      if (activePanel) {
        activePanel.hidden = false;
        // Immediately make cards visible in newly revealed panel
        activePanel.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(function (el) {
          el.classList.add('visible');
        });
      }
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        showPanel(tab.dataset.tab);
      });
    });

    // Arrow key navigation between tabs
    tabs.forEach(function (tab, i) {
      tab.addEventListener('keydown', function (e) {
        var next;
        if (e.key === 'ArrowRight') next = tabs[i + 1] || tabs[0];
        if (e.key === 'ArrowLeft')  next = tabs[i - 1] || tabs[tabs.length - 1];
        if (next) { next.focus(); next.click(); }
      });
    });
  }

  // ── Rewards Form fake-submit ───────────────────────────────────────────────────
  function initRewardsForm() {
    var form = document.querySelector('.rewards-form');
    if (!form) return;

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var input = form.querySelector('.rewards-input');
      var val = input ? input.value.trim() : '';
      if (!val || !val.includes('@')) {
        if (input) {
          input.style.borderColor = '#e05252';
          input.focus();
          setTimeout(function () { input.style.borderColor = ''; }, 2000);
        }
        return;
      }
      var inner = form.querySelector('.rewards-form-inner');
      var success = form.querySelector('.rewards-success');
      var fine = form.querySelector('.rewards-fine');
      if (inner) inner.hidden = true;
      if (fine) fine.hidden = true;
      if (success) success.hidden = false;
    });
  }

  // ── Marquee: pause if reduced-motion ─────────────────────────────────────────
  function initMarquee() {
    var track = document.querySelector('.tagline-track');
    if (!track) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      track.style.animationPlayState = 'paused';
    }
  }

  // ── Boot ──────────────────────────────────────────────────────────────────────
  initNav();
  initScrollReveals();
  initHeroParallax();
  initMenuTabs();
  initRewardsForm();
  initMarquee();
})();
