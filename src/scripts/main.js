/**
 * main.js
 * Main Entry Point for «Крапля до краплі — збережемо воду разом!»
 */

import { initDosIntro } from './dos-intro.js';
import { runCinematicDropletTransition } from './droplet-2d.js';
import { initHeroWater3D } from './hero-water-3d.js';
import { initScrollEffects } from './scroll-effects.js';
import { initCalculator } from './calculator.js';
import { initStats } from './stats.js';
import { initLiquidGlass } from './liquid-glass.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize permanent site components in background
  initHeroWater3D();
  initScrollEffects();
  initCalculator();
  initStats();
  initLiquidGlass();

  // 2. Cinematic Intro Orchestration
  initDosIntro(({ skipped }) => {
    if (!skipped) {
      // Run cinematic 3D water droplet fall & slow-mo splash transition
      runCinematicDropletTransition(() => {
        console.log('[System] Cinematic transition finished. Welcome to «Крапля до краплі»!');
      });
    }
  });
});
