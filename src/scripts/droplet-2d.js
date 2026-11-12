/**
 * droplet-2d.js
 * Premium 2D Motion Graphics Water Droplet Fall, Majestic Water Crown Splash (Coronet),
 * Worthington Jet & Atmospheric Ripple Reveal
 * 100% High-Performance 2D Vector Canvas (Zero 3D / Zero WebGL)
 */

export function runCinematicDropletTransition(onComplete) {
  const overlay = document.getElementById('droplet-transition-overlay');
  const canvas = document.getElementById('droplet-transition-canvas');

  if (!overlay || !canvas) {
    if (onComplete) onComplete();
    return;
  }

  // Accessibility check: prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    overlay.style.display = 'none';
    if (onComplete) onComplete();
    return;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    overlay.style.display = 'none';
    if (onComplete) onComplete();
    return;
  }

  // Setup Overlay
  overlay.style.display = 'block';
  overlay.classList.add('active');
  overlay.style.opacity = '1';
  overlay.style.clipPath = 'circle(150% at 50% 64%)';

  // High-DPI Canvas Setup
  let width = window.innerWidth;
  let height = window.innerHeight;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resizeCanvas();

  // Layout & Scale Coordinates
  const isMobile = width < 768;
  const centerX = width / 2;
  const surfaceY = height * 0.64;

  // Droplet dimensions (LARGE, commanding presence)
  const baseDropW = isMobile ? 58 : 82;
  const baseDropH = isMobile ? 92 : 130;
  const spawnY = height * 0.15;

  // 1. Ambient Atmospheric Particles (Dust / Moisture in the air)
  const ambientParticles = [];
  for (let i = 0; i < 48; i++) {
    ambientParticles.push({
      x: Math.random() * width,
      y: Math.random() * (surfaceY + 40),
      r: 1 + Math.random() * 2.2,
      vx: (Math.random() - 0.5) * 12,
      vy: -6 - Math.random() * 14,
      alpha: 0.15 + Math.random() * 0.45,
      pulse: Math.random() * Math.PI * 2
    });
  }

  // 2. Underwater Light Caustic God-Rays
  const caustics = [
    { x: centerX - 240, w: 90, alpha: 0.14, speed: 0.8 },
    { x: centerX - 70, w: 140, alpha: 0.22, speed: 1.1 },
    { x: centerX + 110, w: 100, alpha: 0.18, speed: 0.9 },
    { x: centerX + 260, w: 80, alpha: 0.12, speed: 0.7 }
  ];

  // 3. Falling Droplet State
  const droplet = {
    x: centerX,
    y: spawnY,
    w: baseDropW,
    h: baseDropH,
    vy: 0,
    gravity: 1420, // px/s^2
    squashX: 1.0,
    squashY: 1.0,
    alpha: 1.0,
    state: 'pause', // 'pause' -> 'falling' -> 'impact' -> 'done'
    pauseTimer: 0.32, // Brief dramatic pause at top to establish composition
    impactTime: 0
  };

  // 4. Majestic Water Crown (Coronet) Splash Model
  const crown = {
    active: false,
    progress: 0, // 0 to 1
    duration: 1.1, // seconds
    maxRadiusX: isMobile ? 180 : 280, // Total width = 360px - 560px!
    maxHeight: isMobile ? 130 : 195,
    spires: []
  };

  // Initialize 12 Crown Spires
  const spireCount = 12;
  for (let i = 0; i < spireCount; i++) {
    const angleRatio = (i / (spireCount - 1)) * 2 - 1; // -1 (left) to +1 (right)
    crown.spires.push({
      angleRatio: angleRatio,
      heightMultiplier: 0.82 + Math.sin(i * 0.85) * 0.28,
      beadRadius: 3.5 + Math.random() * 3.5,
      detachProgress: 0.45 + Math.random() * 0.2
    });
  }

  // 5. Central Vertical Worthington Jet
  const jet = {
    active: false,
    progress: 0,
    maxHeight: isMobile ? 110 : 165,
    width: isMobile ? 16 : 24,
    beadRadius: isMobile ? 6 : 9
  };

  // 6. Separate Liquid Water Arcs
  const liquidArcs = [
    { dir: -1, vx: 220, vy: -380, length: 140, progress: 0, active: false },
    { dir: -1, vx: 320, vy: -440, length: 180, progress: 0, active: false },
    { dir: 1, vx: 230, vy: -390, length: 150, progress: 0, active: false },
    { dir: 1, vx: 330, vy: -450, length: 190, progress: 0, active: false }
  ];

  // 7. Multi-Tier Splash Droplet Particles (65+ items)
  const splashParticles = [];

  function spawnSplashParticles() {
    const count = isMobile ? 45 : 70;
    for (let i = 0; i < count; i++) {
      const angle = Math.PI + (i / (count - 1)) * Math.PI + (Math.random() - 0.5) * 0.35;
      const speed = 190 + Math.random() * 480;
      const tier = i % 3; // 0: Large pearl, 1: Medium droplet, 2: Fine mist

      let radius = 2.2;
      let grav = 680;
      let decay = 0.5;

      if (tier === 0) {
        radius = 5.0 + Math.random() * 3.0; // Large droplet pearl
        grav = 780;
        decay = 0.4;
      } else if (tier === 1) {
        radius = 3.0 + Math.random() * 2.0;
        grav = 650;
        decay = 0.55;
      } else {
        radius = 1.2 + Math.random() * 1.5; // Fine luminous mist
        grav = 450;
        decay = 0.7;
      }

      splashParticles.push({
        x: centerX + (Math.random() - 0.5) * 20,
        y: surfaceY - 5,
        vx: Math.cos(angle) * speed * 1.25,
        vy: Math.sin(angle) * speed,
        r: radius,
        gravity: grav,
        alpha: 1.0,
        decay: decay,
        tier: tier
      });
    }
  }

  // 8. Monumental Expanding Concentric Ripples
  const ripples = [
    { delay: 0.0, r: 0, maxR: width * 0.9, speed: 360, alpha: 0.95 },
    { delay: 0.10, r: 0, maxR: width * 0.8, speed: 320, alpha: 0.85 },
    { delay: 0.22, r: 0, maxR: width * 0.7, speed: 280, alpha: 0.70 },
    { delay: 0.36, r: 0, maxR: width * 0.6, speed: 240, alpha: 0.55 },
    { delay: 0.52, r: 0, maxR: width * 0.5, speed: 200, alpha: 0.40 }
  ];

  // Animation Timeline & Physics
  let lastTime = performance.now();
  let animationId = null;
  let timeScale = 1.0;
  let maskRadiusPercent = 0;

  // =========================================================================
  // Rendering Routines
  // =========================================================================

  function drawAtmosphericEnvironment(t) {
    // 1. Deep Oceanic Abyss Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#040d1a');
    bgGrad.addColorStop(0.45, '#07182e');
    bgGrad.addColorStop(0.64, '#091f3b');
    bgGrad.addColorStop(1, '#020710');

    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Cinematic Overhead Spotlight Cone
    const coneGrad = ctx.createRadialGradient(
      centerX, 0, 20,
      centerX, surfaceY * 0.7, width * 0.6
    );
    coneGrad.addColorStop(0, 'rgba(56, 189, 248, 0.16)');
    coneGrad.addColorStop(0.5, 'rgba(2, 132, 199, 0.06)');
    coneGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = coneGrad;
    ctx.beginPath();
    ctx.moveTo(centerX - 120, 0);
    ctx.lineTo(centerX + 120, 0);
    ctx.lineTo(centerX + width * 0.4, surfaceY);
    ctx.lineTo(centerX - width * 0.4, surfaceY);
    ctx.closePath();
    ctx.fill();

    // 3. Underwater God-Rays / Caustic Ribbons
    caustics.forEach((c) => {
      const offsetX = Math.sin(t * c.speed) * 25;
      const cGrad = ctx.createLinearGradient(c.x + offsetX, surfaceY, c.x + offsetX, height);
      cGrad.addColorStop(0, `rgba(56, 189, 248, ${c.alpha * 1.3})`);
      cGrad.addColorStop(0.6, `rgba(2, 132, 199, ${c.alpha * 0.5})`);
      cGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');

      ctx.fillStyle = cGrad;
      ctx.beginPath();
      ctx.moveTo(c.x + offsetX, surfaceY);
      ctx.lineTo(c.x + offsetX + c.w, surfaceY);
      ctx.lineTo(c.x + offsetX + c.w * 1.5, height);
      ctx.lineTo(c.x + offsetX - c.w * 0.5, height);
      ctx.closePath();
      ctx.fill();
    });

    // 4. Underwater Deep Marine Base
    const underGrad = ctx.createLinearGradient(0, surfaceY, 0, height);
    underGrad.addColorStop(0, 'rgba(2, 132, 199, 0.22)');
    underGrad.addColorStop(0.25, 'rgba(3, 105, 161, 0.15)');
    underGrad.addColorStop(1, 'rgba(2, 6, 16, 0.6)');

    ctx.fillStyle = underGrad;
    ctx.fillRect(0, surfaceY, width, height - surfaceY);

    // 5. Visually Defined Water Surface Horizon Line
    const lineGrad = ctx.createLinearGradient(0, surfaceY, width, surfaceY);
    lineGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
    lineGrad.addColorStop(0.2, 'rgba(56, 189, 248, 0.25)');
    lineGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.65)');
    lineGrad.addColorStop(0.8, 'rgba(56, 189, 248, 0.25)');
    lineGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    // Gentle sine wave undulation
    for (let x = 0; x <= width; x += 20) {
      const y = surfaceY + Math.sin(x * 0.015 + t * 1.5) * 1.5;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // 6. Atmospheric Floating Particles
    ambientParticles.forEach((p) => {
      const pulseAlpha = p.alpha * (0.7 + Math.sin(t * 2 + p.pulse) * 0.3);
      ctx.fillStyle = `rgba(186, 230, 253, ${pulseAlpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawLargeDroplet(x, y, w, h, squashX, squashY, alpha) {
    if (alpha <= 0.01) return;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(squashX, squashY);
    ctx.globalAlpha = alpha;

    const hw = w / 2;
    const hh = h / 2;

    // A. Ambient Water Bloom / Outer Glow
    ctx.shadowColor = 'rgba(56, 189, 248, 0.65)';
    ctx.shadowBlur = 32;

    // B. Perfectly Sculpted Vector Droplet Path
    ctx.beginPath();
    ctx.moveTo(0, -hh); // Needle apex
    // Right shoulder flare
    ctx.bezierCurveTo(
      hw * 0.16, -hh * 0.42,
      hw * 1.06, hh * 0.05,
      hw, hh * 0.45
    );
    // Rounded bottom hemisphere
    ctx.bezierCurveTo(
      hw * 0.96, hh * 1.05,
      -hw * 0.96, hh * 1.05,
      -hw, hh * 0.45
    );
    // Left shoulder curve back to apex
    ctx.bezierCurveTo(
      -hw * 1.06, hh * 0.05,
      -hw * 0.16, -hh * 0.42,
      0, -hh
    );
    ctx.closePath();

    // C. Core Volumetric Gradient Fill (6 stops)
    const bodyGrad = ctx.createLinearGradient(0, -hh, 0, hh);
    bodyGrad.addColorStop(0, '#FFFFFF');     // Crystal white apex
    bodyGrad.addColorStop(0.18, '#BAE6FD');  // Ice blue
    bodyGrad.addColorStop(0.42, '#38BDF8');  // Celestial cyan
    bodyGrad.addColorStop(0.72, '#0284C7');  // Pure ocean azure
    bodyGrad.addColorStop(0.92, '#0369A1');  // Deep refractive blue
    bodyGrad.addColorStop(1, '#075985');

    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // Reset shadow for internal details
    ctx.shadowBlur = 0;

    // D. Internal Caustic Lens Refractions (Clipped)
    ctx.save();
    ctx.clip();

    // 1. Lower Right Caustic Lens
    const caustGrad = ctx.createRadialGradient(
      hw * 0.28, hh * 0.38, 4,
      hw * 0.24, hh * 0.32, hw * 0.85
    );
    caustGrad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
    caustGrad.addColorStop(0.45, 'rgba(56, 189, 248, 0.35)');
    caustGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');

    ctx.fillStyle = caustGrad;
    ctx.beginPath();
    ctx.arc(hw * 0.24, hh * 0.32, hw * 0.85, 0, Math.PI * 2);
    ctx.fill();

    // 2. Subtle Emerald Refraction Arc (Eco touch)
    const ecoGrad = ctx.createRadialGradient(
      -hw * 0.1, hh * 0.45, 2,
      -hw * 0.1, hh * 0.45, hw * 0.65
    );
    ecoGrad.addColorStop(0, 'rgba(16, 185, 129, 0.45)');
    ecoGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');

    ctx.fillStyle = ecoGrad;
    ctx.beginPath();
    ctx.arc(-hw * 0.1, hh * 0.45, hw * 0.65, 0, Math.PI * 2);
    ctx.fill();

    // E. Primary Curved Specular Crest (Crisp white glass highlight)
    ctx.beginPath();
    ctx.moveTo(-hw * 0.12, -hh * 0.52);
    ctx.bezierCurveTo(
      -hw * 0.68, -hh * 0.12,
      -hw * 0.78, hh * 0.32,
      -hw * 0.38, hh * 0.72
    );
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.lineWidth = 3.8;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Secondary soft inner highlight
    ctx.beginPath();
    ctx.moveTo(-hw * 0.22, -hh * 0.32);
    ctx.bezierCurveTo(
      -hw * 0.48, -0.05,
      -hw * 0.54, hh * 0.28,
      -hw * 0.26, hh * 0.55
    );
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 2.0;
    ctx.stroke();

    // F. Sparkling Specular Star Point
    ctx.beginPath();
    ctx.arc(-hw * 0.34, -hh * 0.16, 3.6, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    ctx.restore(); // end clip
    ctx.restore(); // end transform
  }

  function drawWaterCrown(progress) {
    if (progress <= 0 || progress >= 1) return;

    // Cubic ease out for crown bloom, then gentle settling
    const pIn = Math.min(1, progress * 2.2);
    const easeBloom = 1 - Math.pow(1 - pIn, 3);
    const settle = progress > 0.5 ? Math.sin((progress - 0.5) * Math.PI) * 0.15 : 0;
    const currentR = crown.maxRadiusX * (0.4 + easeBloom * 0.6);
    const currentH = crown.maxHeight * (easeBloom - settle);
    const crownAlpha = Math.max(0, 1 - Math.pow(progress, 2.5));

    ctx.save();
    ctx.translate(centerX, surfaceY);
    ctx.globalAlpha = crownAlpha;

    // Crown Outer Glow
    ctx.shadowColor = 'rgba(56, 189, 248, 0.6)';
    ctx.shadowBlur = 24;

    // 1. Draw Crown Base & Liquid Petals
    ctx.beginPath();
    // Start at bottom-left base
    ctx.moveTo(-currentR * 0.6, 4);

    // Sculpted scalloped crown wall with rising spires
    crown.spires.forEach((spire, idx) => {
      const spireX = spire.angleRatio * currentR;
      const spireY = -currentH * spire.heightMultiplier;

      const prevX = (idx === 0) ? -currentR * 0.6 : crown.spires[idx - 1].angleRatio * currentR;
      const midX = (prevX + spireX) / 2;
      const valleyY = -currentH * 0.35;

      // Curve from valley up to spire tip
      ctx.quadraticCurveTo(midX, valleyY, spireX, spireY);
    });

    // Right base connection
    ctx.lineTo(currentR * 0.6, 4);
    ctx.closePath();

    // Crown Body Gradient (Translucent crystal cyan-white to deep blue)
    const crownGrad = ctx.createLinearGradient(0, -currentH, 0, 10);
    crownGrad.addColorStop(0, 'rgba(240, 249, 255, 0.95)');
    crownGrad.addColorStop(0.3, 'rgba(56, 189, 248, 0.85)');
    crownGrad.addColorStop(0.75, 'rgba(2, 132, 199, 0.65)');
    crownGrad.addColorStop(1, 'rgba(2, 132, 199, 0.2)');

    ctx.fillStyle = crownGrad;
    ctx.fill();

    // Specular Rim Highlight along Crown Crest
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.lineWidth = 2.8;
    ctx.stroke();

    // 2. Detached Droplet Pearls at Spire Tips
    ctx.shadowBlur = 10;
    crown.spires.forEach((spire) => {
      const spireX = spire.angleRatio * currentR;
      // When progress exceeds detach threshold, bead separates and flies upward
      const isDetached = progress > spire.detachProgress;
      const flyDistance = isDetached ? (progress - spire.detachProgress) * 75 : 0;
      const beadY = -currentH * spire.heightMultiplier - flyDistance;

      ctx.beginPath();
      ctx.arc(spireX, beadY, spire.beadRadius, 0, Math.PI * 2);

      const beadGrad = ctx.createRadialGradient(
        spireX - spire.beadRadius * 0.3, beadY - spire.beadRadius * 0.3, 0.5,
        spireX, beadY, spire.beadRadius
      );
      beadGrad.addColorStop(0, '#FFFFFF');
      beadGrad.addColorStop(0.4, '#7DD3FC');
      beadGrad.addColorStop(1, '#0284C7');

      ctx.fillStyle = beadGrad;
      ctx.fill();
    });

    ctx.restore();
  }

  function drawWorthingtonJet(progress) {
    if (progress <= 0 || progress >= 1) return;

    // Rises from center, reaches peak, descends
    const jetCurve = Math.sin(progress * Math.PI);
    const jetH = jet.maxHeight * jetCurve;
    const jetW = jet.width * (1 - progress * 0.3);
    const alpha = Math.max(0, 1 - progress * 1.1);

    if (jetH <= 2 || alpha <= 0.01) return;

    ctx.save();
    ctx.translate(centerX, surfaceY);
    ctx.globalAlpha = alpha;

    ctx.shadowColor = 'rgba(56, 189, 248, 0.5)';
    ctx.shadowBlur = 18;

    // Upward Water Column
    ctx.beginPath();
    ctx.moveTo(-jetW * 1.2, 2);
    ctx.quadraticCurveTo(-jetW * 0.4, -jetH * 0.5, -jetW * 0.5, -jetH);
    ctx.lineTo(jetW * 0.5, -jetH);
    ctx.quadraticCurveTo(jetW * 0.4, -jetH * 0.5, jetW * 1.2, 2);
    ctx.closePath();

    const jetGrad = ctx.createLinearGradient(0, -jetH, 0, 0);
    jetGrad.addColorStop(0, '#FFFFFF');
    jetGrad.addColorStop(0.3, '#7DD3FC');
    jetGrad.addColorStop(0.8, '#0284C7');
    jetGrad.addColorStop(1, 'rgba(2, 132, 199, 0.3)');

    ctx.fillStyle = jetGrad;
    ctx.fill();

    // Specular highlight down column
    ctx.beginPath();
    ctx.moveTo(-jetW * 0.2, 0);
    ctx.lineTo(-jetW * 0.2, -jetH * 0.85);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Apex Water Pearl
    const beadY = -jetH - jet.beadRadius * 0.6;
    ctx.beginPath();
    ctx.arc(0, beadY, jet.beadRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    ctx.restore();
  }

  function drawSplashParticles(dt) {
    splashParticles.forEach((p) => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += p.gravity * dt;
      p.alpha = Math.max(0, p.alpha - p.decay * dt);

      if (p.alpha > 0.01) {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);

        const pGrad = ctx.createRadialGradient(
          p.x - p.r * 0.3, p.y - p.r * 0.3, 0.5,
          p.x, p.y, p.r
        );
        pGrad.addColorStop(0, '#FFFFFF');
        pGrad.addColorStop(0.4, '#7DD3FC');
        pGrad.addColorStop(1, '#0284C7');

        ctx.fillStyle = pGrad;
        ctx.shadowColor = 'rgba(56, 189, 248, 0.8)';
        ctx.shadowBlur = p.r * 2.5;
        ctx.fill();
        ctx.restore();
      }
    });
  }

  function drawConcentricRipples(dt) {
    ripples.forEach((rip) => {
      if (droplet.state === 'impact') {
        rip.delay -= dt;
        if (rip.delay <= 0) {
          rip.r += rip.speed * dt;
          rip.alpha = Math.max(0, 0.95 * (1 - rip.r / rip.maxR));

          if (rip.alpha > 0.01 && rip.r > 2) {
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(centerX, surfaceY, rip.r, rip.r * 0.28, 0, 0, Math.PI * 2);

            const waveGrad = ctx.createLinearGradient(
              centerX - rip.r, surfaceY,
              centerX + rip.r, surfaceY
            );
            waveGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
            waveGrad.addColorStop(0.18, `rgba(56, 189, 248, ${rip.alpha})`);
            waveGrad.addColorStop(0.5, `rgba(255, 255, 255, ${rip.alpha * 1.15})`);
            waveGrad.addColorStop(0.82, `rgba(56, 189, 248, ${rip.alpha})`);
            waveGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

            ctx.strokeStyle = waveGrad;
            ctx.lineWidth = Math.max(1.2, 4.2 * (1 - rip.r / rip.maxR));
            ctx.shadowColor = 'rgba(56, 189, 248, 0.7)';
            ctx.shadowBlur = 16;
            ctx.stroke();

            ctx.restore();
          }
        }
      }
    });
  }

  // =========================================================================
  // Main Animation Loop
  // =========================================================================
  function animate(now) {
    const rawDt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    const dt = rawDt * timeScale;
    const t = now / 1000;

    // 1. Draw Atmospheric Background
    drawAtmosphericEnvironment(t);

    // Update ambient air particles
    ambientParticles.forEach((p) => {
      p.y += p.vy * dt;
      p.x += p.vx * dt;
      if (p.y < 0) {
        p.y = surfaceY + 20;
        p.x = Math.random() * width;
      }
    });

    // 2. Droplet Motion Phases
    if (droplet.state === 'pause') {
      droplet.pauseTimer -= rawDt;
      // Gentle breathing hovering pulse
      const breathe = 1.0 + Math.sin(t * 8) * 0.025;
      drawLargeDroplet(
        droplet.x, droplet.y,
        droplet.w, droplet.h,
        breathe, breathe,
        droplet.alpha
      );

      if (droplet.pauseTimer <= 0) {
        droplet.state = 'falling';
      }
    } else if (droplet.state === 'falling') {
      droplet.vy += droplet.gravity * dt;
      droplet.y += droplet.vy * dt;

      // Realistic aerodynamic stretching
      const stretch = 1.0 + Math.min(0.28, (droplet.vy / 1200) * 0.28);
      droplet.squashY = stretch;
      droplet.squashX = 1.0 / Math.sqrt(stretch);

      // Cast shadow onto water surface
      const distToSurface = surfaceY - droplet.y;
      if (distToSurface > 0) {
        const shadowScale = Math.max(0.2, 1 - distToSurface / (height * 0.5));
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(centerX, surfaceY + 2, droplet.w * shadowScale * 0.8, droplet.w * shadowScale * 0.24, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(3, 105, 161, ${0.45 * shadowScale})`;
        ctx.shadowColor = 'rgba(2, 132, 199, 0.5)';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.restore();
      }

      // Rising mirrored reflection in water surface
      if (distToSurface < 220 && distToSurface > 0) {
        const reflY = surfaceY + distToSurface * 0.55;
        const reflAlpha = (1 - distToSurface / 220) * 0.45;
        drawLargeDroplet(
          droplet.x, reflY,
          droplet.w, droplet.h,
          droplet.squashX * 1.15, -droplet.squashY * 0.5,
          reflAlpha
        );
      }

      // Draw Main Droplet
      drawLargeDroplet(
        droplet.x, droplet.y,
        droplet.w, droplet.h,
        droplet.squashX, droplet.squashY,
        droplet.alpha
      );

      // Impact Detection at Water Surface
      if (droplet.y >= surfaceY - 12) {
        droplet.state = 'impact';
        droplet.impactTime = now;

        // Cinematic Slow-Motion at exact impact!
        timeScale = 0.18;

        // Trigger Spectacular Splash & Crown
        crown.active = true;
        jet.active = true;
        spawnSplashParticles();
      }
    } else if (droplet.state === 'impact') {
      const elapsed = (now - droplet.impactTime) / 1000;

      // Smoothly restore timeScale back to normal
      if (timeScale < 1.0) {
        timeScale = Math.min(1.0, timeScale + rawDt * 1.1);
      }

      // 1. Initial Impact Droplet Squashing (0 - 0.2s)
      if (elapsed < 0.22) {
        const sqProg = elapsed / 0.22;
        droplet.squashX = 1.0 + sqProg * 2.2;
        droplet.squashY = Math.max(0.1, 1.0 - sqProg * 0.9);
        droplet.alpha = 1.0 - sqProg * 1.2;
        droplet.y = surfaceY + 4;

        drawLargeDroplet(
          droplet.x, droplet.y,
          droplet.w, droplet.h,
          droplet.squashX, droplet.squashY,
          droplet.alpha
        );
      }

      // 2. Animate Water Crown (Coronet)
      if (crown.active) {
        crown.progress += dt / crown.duration;
        drawWaterCrown(crown.progress);
        if (crown.progress >= 1.0) crown.active = false;
      }

      // 3. Animate Central Worthington Jet
      if (jet.active && elapsed > 0.08) {
        jet.progress += dt / 0.95;
        drawWorthingtonJet(jet.progress);
        if (jet.progress >= 1.0) jet.active = false;
      }

      // 4. Animate Multi-Tier Splash Particles & Ripples
      drawSplashParticles(dt);
      drawConcentricRipples(dt);

      // 5. Cinematic Website Reveal via Expanding Wave Mask
      if (elapsed > 0.25) {
        maskRadiusPercent += rawDt * 135;
        const cyPercent = ((surfaceY / height) * 100).toFixed(1);
        overlay.style.clipPath = `circle(${Math.max(0, 100 - maskRadiusPercent)}% at 50% ${cyPercent}%)`;

        if (maskRadiusPercent >= 115) {
          // Transition complete!
          cancelAnimationFrame(animationId);
          window.removeEventListener('resize', resizeCanvas);
          overlay.style.display = 'none';
          overlay.classList.remove('active');

          if (onComplete) onComplete();
          return;
        }
      }
    }

    animationId = requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resizeCanvas);
  animationId = requestAnimationFrame(animate);
}
