document.documentElement.classList.add('js');

function toggleDD(id) {
  var el = document.getElementById(id);
  var isOpen = el.classList.contains('open');
  document.querySelectorAll('.nav-dd.open').forEach(function(n) {
    n.classList.remove('open');
    n.querySelector('.nav-dd-btn').setAttribute('aria-expanded', 'false');
  });
  if (!isOpen) {
    el.classList.add('open');
    el.querySelector('.nav-dd-btn').setAttribute('aria-expanded', 'true');
  }
}
document.addEventListener('click', function(e) {
  if (!e.target.closest('.nav-dd')) {
    document.querySelectorAll('.nav-dd.open').forEach(function(n) {
      n.classList.remove('open');
      n.querySelector('.nav-dd-btn').setAttribute('aria-expanded', 'false');
    });
  }
});

var header = document.getElementById('siteHeader');
window.addEventListener('scroll', function() {
  header.classList.toggle('scrolled', window.scrollY > 32);
});

function toggleMobileNav() {
  var panel = document.getElementById('mobileNav');
  var backdrop = document.getElementById('mobileNavBackdrop');
  var btn = document.getElementById('burgerBtn');
  var isOpen = panel.classList.contains('open');
  panel.classList.toggle('open', !isOpen);
  backdrop.classList.toggle('open', !isOpen);
  panel.setAttribute('aria-hidden', String(isOpen));
  btn.setAttribute('aria-expanded', String(!isOpen));
  document.body.style.overflow = !isOpen ? 'hidden' : '';
}

function toggleMobileDD(btn) {
  var item = btn.closest('.mobile-nav-dd');
  var isOpen = item.classList.contains('open');
  document.querySelectorAll('.mobile-nav-dd.open').forEach(function (n) {
    n.classList.remove('open');
    n.querySelector('.mobile-nav-dd-btn').setAttribute('aria-expanded', 'false');
  });
  if (!isOpen) {
    item.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }
}

window.addEventListener('resize', function () {
  if (window.innerWidth > 1100) {
    var panel = document.getElementById('mobileNav');
    if (panel.classList.contains('open')) toggleMobileNav();
  }
});

/* ===== Модалки специалистов ===== */
function openSpecModal(id) {
  var modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSpecModal(el) {
  var modal = el.closest('.spec-modal-backdrop');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    var open = document.querySelector('.spec-modal-backdrop.open');
    if (open) closeSpecModal(open);
  }
});

/* ===== Анимации: появление при скролле + счётчики ===== */
(function () {
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function formatNum(n) {
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-target'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduceMotion) { el.textContent = formatNum(target) + suffix; return; }
    var duration = 1200, start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      el.textContent = formatNum(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = formatNum(target) + suffix;
    }
    requestAnimationFrame(step);
  }

  // стаггер: задержка = индекс среди соседей-.reveal * 60мс (макс 6)
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  reveals.forEach(function (el) {
    var siblings = Array.prototype.filter.call(el.parentNode.children, function (c) {
      return c.classList && c.classList.contains('reveal');
    });
    var i = siblings.indexOf(el);
    if (i > 0) el.style.transitionDelay = (Math.min(i, 6) * 0.06) + 's';
  });

  if (!('IntersectionObserver' in window)) {
    // фолбэк: показать всё сразу
    reveals.forEach(function (el) { el.classList.add('in'); });
    document.querySelectorAll('[data-target]').forEach(function (el) {
      el.textContent = formatNum(parseInt(el.getAttribute('data-target'), 10) || 0) + (el.getAttribute('data-suffix') || '');
    });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add('in');
        if (el.hasAttribute('data-target')) animateCount(el);
        el.querySelectorAll && el.querySelectorAll('[data-target]').forEach(function (c) {
          if (!c._counted) { c._counted = true; animateCount(c); }
        });
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    reveals.forEach(function (el) { io.observe(el); });
    // числа, которые не внутри .reveal — наблюдаем отдельно
    document.querySelectorAll('[data-target]').forEach(function (el) {
      if (!el.closest('.reveal')) io.observe(el);
    });
  }
})();
