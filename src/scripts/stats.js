/**
 * stats.js
 * Radial SVG Gauge Indicators & Smooth Number Counters
 */

export function initStats() {
  const statCards = document.querySelectorAll('.stat-card');
  const circumference = 2 * Math.PI * 16; // r=16 -> ~100.53

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateStatCard(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });

  statCards.forEach((card) => {
    observer.observe(card);
  });

  function animateStatCard(card) {
    const gaugeFill = card.querySelector('.stat-gauge-fill');
    if (gaugeFill) {
      const progress = parseFloat(gaugeFill.getAttribute('data-progress') || '0.5');
      const offset = circumference * (1 - progress);
      gaugeFill.style.strokeDashoffset = offset.toFixed(1);
    }

    const numberEl = card.querySelector('.stat-card-number');
    if (numberEl && !numberEl.classList.contains('counted')) {
      numberEl.classList.add('counted');
      const targetStr = numberEl.getAttribute('data-target') || '0';
      const isPercent = targetStr.includes('%') || numberEl.textContent.includes('%');
      const isNegative = targetStr.startsWith('-');
      const targetVal = Math.abs(parseFloat(targetStr.replace(',', '.')));

      const duration = 1600;
      const startTime = performance.now();

      function updateCounter(now) {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        // Ease out cubic
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = targetVal * ease;

        let formatted = '';
        if (targetVal === 2.5) {
          formatted = (current).toFixed(1).replace('.', ',') + '%';
        } else if (isNegative) {
          formatted = '-' + Math.round(current) + '%';
        } else {
          formatted = 'до ' + Math.round(current) + ' л';
        }

        numberEl.textContent = formatted;

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        }
      }

      requestAnimationFrame(updateCounter);
    }
  }
}
