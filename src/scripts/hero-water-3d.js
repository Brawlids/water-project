/**
 * hero-water-3d.js
 * Continuous 3D Interactive Water Simulation for Hero Section
 */

import * as THREE from 'three';

export function initHeroWater3D() {
  const canvas = document.getElementById('hero-water-canvas');
  if (!canvas) return;

  const container = canvas.parentElement;
  if (!container) return;

  // Scene & Camera
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 50);
  camera.position.set(0, 1.2, 5.2);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0x38bdf8, 2.8);
  sunLight.position.set(4, 6, 4);
  scene.add(sunLight);

  const fillLight = new THREE.DirectionalLight(0x10b981, 1.4);
  fillLight.position.set(-4, -2, -2);
  scene.add(fillLight);

  const specularLight = new THREE.PointLight(0xffffff, 3.0, 10);
  specularLight.position.set(0, 3, 2);
  scene.add(specularLight);

  // 1. Crystal Water Droplet Mesh (Deformable Sphere)
  const sphereGeo = new THREE.SphereGeometry(1.0, 48, 48);
  // Store base positions for organic undulation
  const basePositions = sphereGeo.attributes.position.clone();

  const waterMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xdbeafe),
    transmission: 0.92,
    opacity: 1,
    transparent: true,
    roughness: 0.06,
    ior: 1.333,
    thickness: 1.4,
    specularIntensity: 1.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04
  });

  const droplet = new THREE.Mesh(sphereGeo, waterMaterial);
  droplet.position.set(0, 0.45, 0);
  droplet.scale.set(0.9, 1.15, 0.9); // Slight teardrop natural elongation
  scene.add(droplet);

  // 2. Reflective Water Pool Base with animated ripples
  const poolGeo = new THREE.PlaneGeometry(8, 8, 40, 40);
  const poolMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.15,
    metalness: 0.1,
    transparent: true,
    opacity: 0.28
  });
  const pool = new THREE.Mesh(poolGeo, poolMat);
  pool.rotation.x = -Math.PI / 2;
  pool.position.y = -1.2;
  scene.add(pool);

  // 3. Ambient Floating Micro-Droplets
  const microCount = 20;
  const microGeo = new THREE.SphereGeometry(0.04, 8, 8);
  const microDroplets = [];

  for (let i = 0; i < microCount; i++) {
    const mesh = new THREE.Mesh(microGeo, waterMaterial);
    const radius = 1.6 + Math.random() * 1.4;
    const theta = Math.random() * Math.PI * 2;
    const y = -0.8 + Math.random() * 2.2;

    mesh.position.set(Math.cos(theta) * radius, y, Math.sin(theta) * radius);
    scene.add(mesh);

    microDroplets.push({
      mesh,
      speed: 0.3 + Math.random() * 0.5,
      yBase: y,
      amplitude: 0.15 + Math.random() * 0.2,
      phase: Math.random() * Math.PI * 2
    });
  }

  // Interactive Mouse Tilt & Wobble
  let mouseX = 0;
  let mouseY = 0;
  let targetTiltX = 0;
  let targetTiltY = 0;

  function onPointerMove(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX = (x - 0.5) * 2;
    mouseY = (y - 0.5) * 2;
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true });

  // Click bounce pulse
  let bounceEnergy = 0;
  canvas.addEventListener('click', () => {
    bounceEnergy = 0.35;
  });

  // Resize Handling
  function onResize() {
    if (!container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);

  // Performance: Pause when scrolled out of view
  let isVisible = true;
  const observer = new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting;
  }, { threshold: 0.1 });
  observer.observe(container);

  // Animation Loop
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    if (!isVisible) return;

    const t = clock.getElapsedTime();

    // Smooth lerp mouse tilt
    targetTiltX += (mouseY * 0.4 - targetTiltX) * 0.05;
    targetTiltY += (mouseX * 0.5 - targetTiltY) * 0.05;

    // Organic Droplet Floating & Rotation
    droplet.rotation.y = t * 0.25 + targetTiltY;
    droplet.rotation.x = Math.sin(t * 0.8) * 0.06 + targetTiltX;
    droplet.position.y = 0.45 + Math.sin(t * 1.5) * 0.08 + (bounceEnergy > 0 ? Math.sin(t * 18) * bounceEnergy : 0);

    // Decay bounce energy
    if (bounceEnergy > 0) {
      bounceEnergy *= 0.94;
      if (bounceEnergy < 0.005) bounceEnergy = 0;
    }

    // Dynamic surface mesh vertex undulation (liquid surface tension)
    const pos = sphereGeo.attributes.position;
    const base = basePositions;
    for (let i = 0; i < pos.count; i++) {
      const u = base.getX(i);
      const v = base.getY(i);
      const w = base.getZ(i);

      // Spherical harmonic undulation wave
      const wave = Math.sin(u * 3.5 + t * 2.5) * Math.cos(v * 3.5 + t * 2.0) * (0.045 + bounceEnergy * 0.12);
      pos.setXYZ(i, u * (1 + wave), v * (1 + wave), w * (1 + wave));
    }
    pos.needsUpdate = true;
    sphereGeo.computeVertexNormals();

    // Floating micro droplets
    microDroplets.forEach((md) => {
      md.mesh.position.y = md.yBase + Math.sin(t * md.speed + md.phase) * md.amplitude;
      md.mesh.rotation.y += 0.01;
    });

    // Gentle pool wave rotation
    pool.rotation.z = Math.sin(t * 0.2) * 0.04;

    renderer.render(scene, camera);
  }

  animate();
}
