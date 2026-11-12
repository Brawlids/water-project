/**
 * scroll-effects.js
 * Advanced Scroll Velocity Motion Blur & Dynamic Frosted Glass Transformation
 */

export function initScrollEffects() {
  const root = document.documentElement;
  const header = document.getElementById('main-header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  let lastScrollY = window.scrollY;
  let lastTime = performance.now();
  let smoothedVelocity = 0;
  let isScrollingTimer = null;

  // Track scroll velocity and dynamic frosted values
  function onScroll() {
    const now = performance.now();
    const currentScrollY = window.scrollY;
    const deltaY = currentScrollY - lastScrollY;
    const dt = Math.max(1, now - lastTime);

    // Compute raw pixels/ms velocity
    const rawVelocity = deltaY / dt;
    lastScrollY = currentScrollY;
    lastTime = now;

    // Header compact style
    if (currentScrollY > 40) {
      header?.classList.add('header-scrolled');
    } else {
      header?.classList.remove('header-scrolled');
    }

    // Dynamic Frosted Glass state active
    document.body.classList.add('is-scrolling');
    clearTimeout(isScrollingTimer);
    isScrollingTimer = setTimeout(() => {
      document.body.classList.remove('is-scrolling');
    }, 180);

    // Update active nav link based on scroll position
    let currentSectionId = '';
    sections.forEach((sec) => {
      const top = sec.offsetTop - 180;
      const height = sec.offsetHeight;
      if (currentScrollY >= top && currentScrollY < top + height) {
        currentSectionId = sec.getAttribute('id');
      }
    });

    if (currentSectionId) {
      navLinks.forEach((link) => {
        if (link.getAttribute('href') === `#${currentSectionId}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Smooth lerp loop for velocity blur & frosted glass properties
  function updateVelocityPhysics() {
    const now = performance.now();
    const currentScrollY = window.scrollY;
    const deltaY = currentScrollY - lastScrollY;
    const dt = Math.max(16, now - lastTime);

    const instantVelocity = Math.abs(deltaY / dt);
    // Smooth lerp
    smoothedVelocity += (instantVelocity - smoothedVelocity) * 0.12;

    // 1. Advanced Scroll Motion Blur for decorative elements (.motion-blur-target)
    // Never blurs text or cards; purely decorative background elements
    const maxBlur = 7.5; // px
    const calculatedBlur = Math.min(maxBlur, smoothedVelocity * 4.5);
    const scaleY = 1 + Math.min(0.06, smoothedVelocity * 0.02);

    root.style.setProperty('--velocity-blur', `${calculatedBlur.toFixed(2)}px`);
    root.style.setProperty('--velocity-scale-y', `${scaleY.toFixed(3)}`);

    // 2. Dynamic Frosted Glass Transformation
    // When velocity is high or scrolled down, increase blur & opacity subtly
    const frostedIntensity = Math.min(1, smoothedVelocity * 0.8 + (currentScrollY > 100 ? 0.3 : 0));
    const glassBlurVal = 24 + frostedIntensity * 14; // 24px -> 38px
    const glassOpacityVal = 0.72 + frostedIntensity * 0.16; // 0.72 -> 0.88
    const glassSatVal = 180 - frostedIntensity * 40; // 180% -> 140% matte

    root.style.setProperty('--glass-blur', `${glassBlurVal.toFixed(1)}px`);
    root.style.setProperty('--glass-bg', `rgba(255, 255, 255, ${glassOpacityVal.toFixed(2)})`);
    root.style.setProperty('--glass-saturate', `${glassSatVal.toFixed(0)}%`);

    requestAnimationFrame(updateVelocityPhysics);
  }

  requestAnimationFrame(updateVelocityPhysics);
}
