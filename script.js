/**
 * Mystery Salon — A demo landing page for a fictional salon business
 * script.js — All interactive functionality
 *
 * Sections:
 *  1. Loader
 *  2. Navbar (sticky + scroll state + mobile menu)
 *  3. Smooth scroll
 *  4. Scroll reveal animations
 *  5. Testimonials slider
 *  6. Booking form validation & submission
 *  7. Footer year
 *  8. Back to top button
 *  9. Active nav link highlighting
 */

'use strict';

/* ──────────────────────────────────────────────────────────
   1. LOADER
   Fades out the loading screen once the page is ready.
   ────────────────────────────────────────────────────────── */
const loader = document.getElementById('loader');

window.addEventListener('load', () => {
  // Give the loader bar animation time to complete (1.8s)
  setTimeout(() => {
    loader.classList.add('hidden');
    // Remove from DOM after transition
    loader.addEventListener('transitionend', () => loader.remove(), { once: true });
  }, 2000);
});


/* ──────────────────────────────────────────────────────────
   2. NAVBAR — Sticky scroll state + mobile hamburger menu
   ────────────────────────────────────────────────────────── */
const navbar      = document.getElementById('navbar');
const hamburger   = document.getElementById('hamburger');
const mobileMenu  = document.getElementById('mobile-menu');
let lastScrollY   = 0;

/** Toggle .scrolled class based on scroll position */
function handleNavScroll() {
  const scrolled = window.scrollY > 60;
  navbar.classList.toggle('scrolled', scrolled);
}

window.addEventListener('scroll', handleNavScroll, { passive: true });
handleNavScroll(); // run on init

/** Open / close mobile menu */
hamburger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
  // Prevent body scroll when menu open
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

/** Close mobile menu when a link is clicked */
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

/** Close mobile menu on outside click */
document.addEventListener('click', (e) => {
  if (mobileMenu.classList.contains('open') &&
      !navbar.contains(e.target)) {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
});


/* ──────────────────────────────────────────────────────────
   3. SMOOTH SCROLL — Handles all anchor links
   ────────────────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();

    const navHeight = navbar.offsetHeight;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;

    window.scrollTo({ top: targetTop, behavior: 'smooth' });
  });
});


/* ──────────────────────────────────────────────────────────
   4. SCROLL REVEAL ANIMATIONS
   Uses IntersectionObserver for performance.
   ────────────────────────────────────────────────────────── */
const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Unobserve after reveal to save resources
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  }
);

revealEls.forEach(el => revealObserver.observe(el));


/* ──────────────────────────────────────────────────────────
   5. TESTIMONIALS SLIDER
   Simple manual slider with dots, prev/next, and auto-play.
   ────────────────────────────────────────────────────────── */
const track     = document.getElementById('testimonials-track');
const prevBtn   = document.getElementById('prev-btn');
const nextBtn   = document.getElementById('next-btn');
const dotsWrap  = document.getElementById('slider-dots');

const cards     = track ? track.querySelectorAll('.testimonial-card') : [];
let currentSlide = 0;
let autoPlayTimer;

if (cards.length > 0) {

  /** Create dot buttons */
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
    dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    dot.dataset.index = i;
    dot.addEventListener('click', () => goToSlide(i));
    dotsWrap.appendChild(dot);
  });

  /** Navigate to a specific slide */
  function goToSlide(index) {
    currentSlide = (index + cards.length) % cards.length;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;

    // Update dots
    dotsWrap.querySelectorAll('.dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
      dot.setAttribute('aria-selected', i === currentSlide ? 'true' : 'false');
    });

    resetAutoPlay();
  }

  prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
  nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));

  /** Auto-play every 5 seconds */
  function startAutoPlay() {
    autoPlayTimer = setInterval(() => goToSlide(currentSlide + 1), 5000);
  }
  function resetAutoPlay() {
    clearInterval(autoPlayTimer);
    startAutoPlay();
  }

  startAutoPlay();

  /** Pause on hover */
  const sliderEl = document.querySelector('.testimonials-slider');
  if (sliderEl) {
    sliderEl.addEventListener('mouseenter', () => clearInterval(autoPlayTimer));
    sliderEl.addEventListener('mouseleave', startAutoPlay);
  }

  /** Touch swipe support */
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      goToSlide(diff > 0 ? currentSlide + 1 : currentSlide - 1);
    }
  });

  /** Keyboard support */
  document.addEventListener('keydown', e => {
    if (document.activeElement.closest('#testimonials')) {
      if (e.key === 'ArrowLeft')  goToSlide(currentSlide - 1);
      if (e.key === 'ArrowRight') goToSlide(currentSlide + 1);
    }
  });
}


/* ──────────────────────────────────────────────────────────
   6. BOOKING FORM — Validation & Submission
   ────────────────────────────────────────────────────────── */
const bookingForm    = document.getElementById('booking-form');
const bookingSuccess = document.getElementById('booking-success');
const submitBtn      = document.getElementById('submit-btn');

/** Set minimum date on the date picker (today) */
const dateInput = document.getElementById('date');
if (dateInput) {
  const today = new Date();
  const yyyy  = today.getFullYear();
  const mm    = String(today.getMonth() + 1).padStart(2, '0');
  const dd    = String(today.getDate()).padStart(2, '0');
  dateInput.setAttribute('min', `${yyyy}-${mm}-${dd}`);
}

/**
 * Validator map: field id → validation function → error message
 */
const validators = {
  name: {
    validate: (val) => val.trim().length >= 2,
    message: 'Please enter your full name (at least 2 characters).'
  },
  phone: {
    validate: (val) => /^[\+\d\s\-\(\)]{7,20}$/.test(val.trim()),
    message: 'Please enter a valid phone number.'
  },
  email: {
    validate: (val) => val.trim() === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()),
    message: 'Please enter a valid email address.'
  },
  service: {
    validate: (val) => val !== '',
    message: 'Please select a service.'
  },
  date: {
    validate: (val) => {
      if (!val) return false;
      const selected = new Date(val);
      const today    = new Date();
      today.setHours(0, 0, 0, 0);
      return selected >= today;
    },
    message: 'Please select a valid future date.'
  },
  time: {
    validate: (val) => val !== '',
    message: 'Please select a time slot.'
  }
};

/** Show error for a field */
function showError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(`${fieldId}-error`);
  if (field)  field.classList.add('error');
  if (error)  error.textContent = message;
}

/** Clear error for a field */
function clearError(fieldId) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(`${fieldId}-error`);
  if (field)  field.classList.remove('error');
  if (error)  error.textContent = '';
}

/** Validate a single field and return true if valid */
function validateField(fieldId) {
  const field = document.getElementById(fieldId);
  if (!field || !validators[fieldId]) return true;

  const value = field.value;
  const { validate, message } = validators[fieldId];

  if (!validate(value)) {
    showError(fieldId, message);
    return false;
  } else {
    clearError(fieldId);
    return true;
  }
}

/** Live validation on blur */
Object.keys(validators).forEach(fieldId => {
  const field = document.getElementById(fieldId);
  if (field) {
    field.addEventListener('blur', () => validateField(fieldId));
    field.addEventListener('input', () => {
      if (field.classList.contains('error')) validateField(fieldId);
    });
  }
});

/** Form submit */
if (bookingForm) {
  bookingForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // Validate all fields
    const fieldsToValidate = ['name', 'phone', 'email', 'service', 'date', 'time'];
    let isValid = true;

    fieldsToValidate.forEach(fieldId => {
      if (!validateField(fieldId)) isValid = false;
    });

    if (!isValid) {
      // Scroll to first error
      const firstError = bookingForm.querySelector('.error');
      if (firstError) {
        const navH = navbar.offsetHeight;
        const top  = firstError.getBoundingClientRect().top + window.scrollY - navH - 20;
        window.scrollTo({ top, behavior: 'smooth' });
      }
      return;
    }

    // Simulate loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    // Simulate async submission (1.5s fake network delay)
    setTimeout(() => {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;

      // Hide form, show success
      bookingForm.style.display = 'none';
      bookingSuccess.classList.add('visible');
      bookingSuccess.removeAttribute('aria-hidden');

      // Scroll to success message
      const navH = navbar.offsetHeight;
      const top  = bookingSuccess.getBoundingClientRect().top + window.scrollY - navH - 20;
      window.scrollTo({ top, behavior: 'smooth' });

    }, 1500);
  });
}


/* ──────────────────────────────────────────────────────────
   7. FOOTER YEAR — Dynamic copyright year
   ────────────────────────────────────────────────────────── */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();


/* ──────────────────────────────────────────────────────────
   8. BACK TO TOP BUTTON
   ────────────────────────────────────────────────────────── */
const backToTop = document.getElementById('back-to-top');

if (backToTop) {
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


/* ──────────────────────────────────────────────────────────
   9. ACTIVE NAV LINK HIGHLIGHTING
   Highlights the current section's nav link while scrolling.
   ────────────────────────────────────────────────────────── */
const sections  = document.querySelectorAll('section[id]');
const navLinksA = document.querySelectorAll('.nav-links a, .mobile-menu a');

function highlightNav() {
  const scrollMid = window.scrollY + window.innerHeight / 2;

  let activeSectionId = null;

  sections.forEach(section => {
    const top    = section.offsetTop;
    const bottom = top + section.offsetHeight;
    if (scrollMid >= top && scrollMid < bottom) {
      activeSectionId = section.id;
    }
  });

  navLinksA.forEach(link => {
    const href = link.getAttribute('href');
    link.classList.toggle('active', href === `#${activeSectionId}`);
  });
}

window.addEventListener('scroll', highlightNav, { passive: true });
highlightNav();