/* ============================================================
   PUREVA — main.js
   Scroll progress · Reveal animations · Mobile nav
   Reviews carousel (touch/mouse swipe, autoplay, dots, arrows)
   FAQ accordion · Review submission form toggle
   Announcement dismiss · Button ripple
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ----------------------------------------------------------
     Scroll progress bar
  ---------------------------------------------------------- */
  const prog = document.querySelector('.scroll-progress');
  if (prog) {
    const updateProgress = () => {
      const scrolled = document.documentElement.scrollTop;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.transform = `scaleX(${total > 0 ? scrolled / total : 0})`;
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  /* ----------------------------------------------------------
     Scroll reveal
  ---------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = el.dataset.delay || 0;
          setTimeout(() => el.classList.add('is-visible'), +delay);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.10 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ----------------------------------------------------------
     Mobile nav toggle
  ---------------------------------------------------------- */
  const navToggle = document.querySelector('.nav-toggle');
  const mobilePanel = document.querySelector('.mobile-panel');
  if (navToggle && mobilePanel) {
    navToggle.addEventListener('click', () => {
      const isOpen = mobilePanel.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    mobilePanel.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobilePanel.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ----------------------------------------------------------
     Announcement bar dismiss
  ---------------------------------------------------------- */
  const announceClose = document.querySelector('.announce__close');
  const announce = document.querySelector('.announce');
  if (announceClose && announce) {
    announceClose.addEventListener('click', () => announce.classList.add('is-hidden'));
  }

  /* ----------------------------------------------------------
     FAQ accordion
  ---------------------------------------------------------- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const trigger = item.querySelector('.faq-q');
    const answer = item.querySelector('.faq-a');
    if (!trigger || !answer) return;
    trigger.addEventListener('click', () => {
      const isOpen = item.getAttribute('data-open') === 'true';
      document.querySelectorAll('.faq-item').forEach(other => {
        if (other !== item) {
          other.setAttribute('data-open', 'false');
          other.querySelector('.faq-q')?.setAttribute('aria-expanded', 'false');
          const a = other.querySelector('.faq-a');
          if (a) a.style.maxHeight = null;
        }
      });
      item.setAttribute('data-open', isOpen ? 'false' : 'true');
      trigger.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      answer.style.maxHeight = isOpen ? null : answer.scrollHeight + 'px';
    });
  });

  /* ----------------------------------------------------------
     Reviews carousel
  ---------------------------------------------------------- */
  const track = document.querySelector('.reviews-track');
  const dots = document.querySelectorAll('.carousel-dot');
  const prevBtn = document.querySelector('.carousel-arrow[data-dir="prev"]');
  const nextBtn = document.querySelector('.carousel-arrow[data-dir="next"]');
  const pauseBtn = document.querySelector('.carousel-playpause');

  if (track) {
    const AUTOPLAY_MS = 4800;
    let autoTimer = null;
    let isPlaying = true;
    let currentIndex = 0;

    const cards = Array.from(track.querySelectorAll('.review-card'));

    function getCardWidth() {
      if (!cards[0]) return 0;
      const rect = cards[0].getBoundingClientRect();
      const gap = parseInt(getComputedStyle(track).gap) || 22;
      return rect.width + gap;
    }

    function scrollTo(index) {
      const total = cards.length;
      currentIndex = ((index % total) + total) % total;
      track.scrollTo({ left: currentIndex * getCardWidth(), behavior: 'smooth' });
      dots.forEach((d, i) => d.classList.toggle('is-active', i === currentIndex));
    }

    function startAutoplay() {
      stopAutoplay();
      if (!isPlaying) return;
      autoTimer = setInterval(() => scrollTo(currentIndex + 1), AUTOPLAY_MS);
    }

    function stopAutoplay() {
      clearInterval(autoTimer);
    }

    function pauseResume() {
      isPlaying = !isPlaying;
      if (pauseBtn) {
        const iconUse = pauseBtn.querySelector('use');
        if (iconUse) iconUse.setAttribute('href', isPlaying ? '#icon-pause' : '#icon-play');
        pauseBtn.setAttribute('aria-label', isPlaying ? 'Pause autoplay' : 'Resume autoplay');
      }
      isPlaying ? startAutoplay() : stopAutoplay();
    }

    if (prevBtn) prevBtn.addEventListener('click', () => { scrollTo(currentIndex - 1); startAutoplay(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { scrollTo(currentIndex + 1); startAutoplay(); });
    if (pauseBtn) pauseBtn.addEventListener('click', pauseResume);
    dots.forEach((dot, i) => dot.addEventListener('click', () => { scrollTo(i); startAutoplay(); }));

    // Pause on manual scroll, resume after
    let scrollDebounce;
    track.addEventListener('scroll', () => {
      stopAutoplay();
      clearTimeout(scrollDebounce);
      scrollDebounce = setTimeout(() => {
        // Snap to nearest
        const w = getCardWidth();
        if (w > 0) currentIndex = Math.round(track.scrollLeft / w);
        dots.forEach((d, i) => d.classList.toggle('is-active', i === currentIndex));
        startAutoplay();
      }, 160);
    }, { passive: true });

    // Touch swipe
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) { scrollTo(currentIndex + (dx < 0 ? 1 : -1)); startAutoplay(); }
    }, { passive: true });

    // Pause on hover
    track.addEventListener('mouseenter', stopAutoplay);
    track.addEventListener('mouseleave', startAutoplay);

    scrollTo(0);
    startAutoplay();
  }

  /* ----------------------------------------------------------
     Review form toggle
  ---------------------------------------------------------- */
  const writeBtn = document.querySelector('.write-review-btn');
  const formWrap = document.querySelector('.review-form-wrap');
  const closeFormBtn = document.querySelector('.review-form-close');

  if (writeBtn && formWrap) {
    writeBtn.addEventListener('click', () => {
      const open = formWrap.classList.toggle('is-open');
      writeBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) formWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    if (closeFormBtn) {
      closeFormBtn.addEventListener('click', () => {
        formWrap.classList.remove('is-open');
        writeBtn.setAttribute('aria-expanded', 'false');
      });
    }
  }

  /* ----------------------------------------------------------
     Star rating input (interactive)
  ---------------------------------------------------------- */
  const starInput = document.querySelector('.star-input');
  if (starInput) {
    const labels = Array.from(starInput.querySelectorAll('label'));
    labels.forEach((label, i) => {
      label.addEventListener('mouseenter', () => {
        labels.forEach((l, j) => {
          const use = l.querySelector('use');
          if (use) use.setAttribute('href', j <= i ? '#icon-star-fill' : '#icon-star');
        });
      });
    });
    starInput.addEventListener('mouseleave', () => {
      const checked = starInput.querySelector('input:checked');
      const checkedIdx = checked ? parseInt(checked.value, 10) - 1 : -1;
      labels.forEach((l, j) => {
        const use = l.querySelector('use');
        if (use) use.setAttribute('href', j <= checkedIdx ? '#icon-star-fill' : '#icon-star');
      });
    });
  }

  /* ----------------------------------------------------------
     Button ripple effect
  ---------------------------------------------------------- */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'btn-ripple';
      const size = Math.max(rect.width, rect.height);
      ripple.style.cssText = `
        position:absolute;width:${size}px;height:${size}px;
        border-radius:50%;background:rgba(255,255,255,0.35);
        pointer-events:none;transform:scale(0);
        left:${e.clientX - rect.left - size/2}px;
        top:${e.clientY - rect.top - size/2}px;
        animation:ripple 0.55s ease forwards;
      `;
      if (getComputedStyle(this).position === 'static') this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  /* ----------------------------------------------------------
     Ingredient card tilt on hover (desktop only)
  ---------------------------------------------------------- */
  if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    document.querySelectorAll('.ing-card, .badge-card, .pcard').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `translateY(-6px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

});

/* ----------------------------------------------------------
   Ripple keyframe (injected once via JS — avoids an extra
   CSS dependency for this one animation)
---------------------------------------------------------- */
const rippleStyle = document.createElement('style');
rippleStyle.textContent = '@keyframes ripple{to{transform:scale(4);opacity:0}}';
document.head.appendChild(rippleStyle);
