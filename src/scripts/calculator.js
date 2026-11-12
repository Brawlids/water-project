/**
 * calculator.js
 * Interactive Impact Calculator & Weekly Accumulation Bar Chart
 */

export function initCalculator() {
  const habitSelect = document.getElementById('habit-select');
  const btnTimeMinus = document.getElementById('btn-time-minus');
  const btnTimePlus = document.getElementById('btn-time-plus');
  const valTimeDisplay = document.getElementById('val-time-display');
  const timeInputLabel = document.getElementById('time-input-label');
  const calcFlowRate = document.getElementById('calc-flow-rate');

  const btnPeopleMinus = document.getElementById('btn-people-minus');
  const btnPeoplePlus = document.getElementById('btn-people-plus');
  const valPeopleDisplay = document.getElementById('val-people-display');

  const tabButtons = document.querySelectorAll('.calc-tab-btn');
  const blockDay = document.getElementById('block-day');
  const blockWeek = document.getElementById('block-week');
  const blockMonth = document.getElementById('block-month');

  const resLitersDay = document.getElementById('res-liters-day');
  const resLitersWeek = document.getElementById('res-liters-week');
  const resLitersMonth = document.getElementById('res-liters-month');

  const chartBars = document.querySelectorAll('.chart-bar-item');
  const chartPeakBadge = document.getElementById('chart-peak-badge');

  if (!habitSelect || !resLitersDay) return;

  // Preset Configurations
  const presets = {
    tap: {
      name: "Закриваю кран під час чищення зубів",
      flowRate: 6, // liters/minute
      flowText: "6 л / хв",
      defaultUnits: 4,
      unitLabel: "Скільки хвилин на день?",
      unitSuffix: "хв",
      minUnits: 1,
      maxUnits: 20
    },
    shower: {
      name: "Коротший душ (5 хв замість 10 хв)",
      flowRate: 10,
      flowText: "10 л / хв",
      defaultUnits: 5,
      unitLabel: "Скільки хвилин заощаджено?",
      unitSuffix: "хв",
      minUnits: 2,
      maxUnits: 30
    },
    leak: {
      name: "Усунення крапельного протікання крана",
      flowRate: 18,
      flowText: "18 л / день на кран",
      defaultUnits: 1,
      unitLabel: "Скільки кранів усунено?",
      unitSuffix: "шт",
      minUnits: 1,
      maxUnits: 5
    },
    aerator: {
      name: "Використання аератора на крані",
      flowRate: 4,
      flowText: "4 л / хв економії",
      defaultUnits: 8,
      unitLabel: "Скільки хвилин використання?",
      unitSuffix: "хв",
      minUnits: 2,
      maxUnits: 40
    }
  };

  let currentPresetKey = 'tap';
  let currentUnits = 4;
  let currentPeople = 1;
  let activePeriod = 'week';

  function recalculate() {
    const config = presets[currentPresetKey];
    let dailyLiters = 0;

    if (currentPresetKey === 'leak') {
      dailyLiters = config.flowRate * currentUnits * currentPeople;
    } else {
      dailyLiters = config.flowRate * currentUnits * currentPeople;
    }

    const weeklyLiters = dailyLiters * 7;
    const monthlyLiters = dailyLiters * 30;

    // Smooth number display
    resLitersDay.textContent = `${dailyLiters.toLocaleString('uk-UA')} л`;
    resLitersWeek.textContent = `${weeklyLiters.toLocaleString('uk-UA')} л`;
    resLitersMonth.textContent = `${monthlyLiters.toLocaleString('uk-UA')} л`;

    // Update Peak Badge
    if (chartPeakBadge) {
      chartPeakBadge.textContent = `${weeklyLiters.toLocaleString('uk-UA')} л`;
    }

    // Update 7-Day Chart Bars
    chartBars.forEach((bar, index) => {
      const dayFactor = (index + 1) / 7;
      const fillEl = bar.querySelector('.chart-bar-fill');
      if (fillEl) {
        const heightPercent = Math.max(12, Math.round(dayFactor * 96));
        fillEl.style.height = `${heightPercent}%`;
      }
    });
  }

  function updatePreset(key) {
    currentPresetKey = key;
    const cfg = presets[key];
    currentUnits = cfg.defaultUnits;

    timeInputLabel.textContent = cfg.unitLabel;
    calcFlowRate.textContent = cfg.flowText;
    valTimeDisplay.textContent = `${currentUnits} ${cfg.unitSuffix}`;

    recalculate();
  }

  // Stepper Time / Units
  btnTimeMinus?.addEventListener('click', () => {
    const cfg = presets[currentPresetKey];
    if (currentUnits > cfg.minUnits) {
      currentUnits--;
      valTimeDisplay.textContent = `${currentUnits} ${cfg.unitSuffix}`;
      recalculate();
    }
  });

  btnTimePlus?.addEventListener('click', () => {
    const cfg = presets[currentPresetKey];
    if (currentUnits < cfg.maxUnits) {
      currentUnits++;
      valTimeDisplay.textContent = `${currentUnits} ${cfg.unitSuffix}`;
      recalculate();
    }
  });

  // Stepper People
  btnPeopleMinus?.addEventListener('click', () => {
    if (currentPeople > 1) {
      currentPeople--;
      valPeopleDisplay.textContent = currentPeople;
      recalculate();
    }
  });

  btnPeoplePlus?.addEventListener('click', () => {
    if (currentPeople < 10) {
      currentPeople++;
      valPeopleDisplay.textContent = currentPeople;
      recalculate();
    }
  });

  // Dropdown Select Change
  habitSelect.addEventListener('change', (e) => {
    updatePreset(e.target.value);
  });

  // Period Tabs Toggle
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      activePeriod = btn.dataset.tab;

      // Update block highlights
      blockDay?.classList.toggle('active-tab-highlight', activePeriod === 'day');
      blockWeek?.classList.toggle('active-tab-highlight', activePeriod === 'week');
      blockMonth?.classList.toggle('active-tab-highlight', activePeriod === 'month');
    });
  });

  // Habit Cards in Section 4 Linkage to Calculator
  const habitCards = document.querySelectorAll('.habit-card[data-preset]');
  habitCards.forEach((card) => {
    card.addEventListener('click', () => {
      const presetKey = card.dataset.preset;
      if (presets[presetKey]) {
        habitSelect.value = presetKey;
        updatePreset(presetKey);

        const calcSection = document.getElementById('calc');
        calcSection?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Initial Calculation
  recalculate();
}
