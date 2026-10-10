/* ken.didit hero braid and bead scene (loaded on demand by bead3d.js). */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export function start(box, canvas) {
  const reduce = !!window.__rm;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.8;
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xffffff, 0xdfcff5, 1.0));
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(-3, 4, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0xbfa2ea, 2.4); rim.position.set(4, 1, -4); scene.add(rim);

  // Three strands woven the way a braid is: each one swings side to side and front to back
  // a third of a turn apart, so they cross over and under each other.
  const H = 3.4, turns = 2.2;
  const hair = new THREE.MeshPhysicalMaterial({ color: 0x2b1d17, roughness: 0.4, sheen: 0.45, sheenColor: new THREE.Color(0xc9b3ee), sheenRoughness: 0.4, clearcoat: 0.3, clearcoatRoughness: 0.5 });
  const braid = new THREE.Group();
  for (let k = 0; k < 3; k++) {
    const pts = [];
    for (let i = 0; i <= 120; i++) {
      const t = i / 120, a = t * Math.PI * 2 * turns + (k * Math.PI * 2) / 3;
      const taper = 1 - 0.25 * t;
      pts.push(new THREE.Vector3(Math.sin(a) * 0.34 * taper, H / 2 - t * H, Math.sin(2 * a) * 0.16 * taper));
    }
    const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 200, 0.17, 18, false);
    braid.add(new THREE.Mesh(g, hair));
  }
  // The bead: a rounded lilac barrel with a hole, sitting on the braid like the dots in her logo
  const profile = [];
  for (let i = 0; i <= 24; i++) {
    const a = -Math.PI / 2 + (i / 24) * Math.PI;
    profile.push(new THREE.Vector2(0.36 + Math.cos(a) * 0.2, Math.sin(a) * 0.36));
  }
  const bead = new THREE.Mesh(new THREE.LatheGeometry(profile, 64), new THREE.MeshPhysicalMaterial({
    color: 0xbfa2ea, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08, iridescence: 0.35, iridescenceIOR: 1.4 }));
  bead.position.y = -0.35;
  braid.add(bead);
  // A second, smaller bead near the end
  const bead2 = bead.clone(); bead2.scale.setScalar(0.72); bead2.position.y = -1.28; braid.add(bead2);
  scene.add(braid);

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
  camera.position.set(0, 0.2, 8.6); camera.lookAt(0, -0.1, 0);
  function size() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }

  const spring = (k, c) => ({ x: 0, v: 0, to: 0, step(dt) { this.v += ((this.to - this.x) * k - this.v * c) * dt; this.x += this.v * dt; return this.x; } });
  const sx = spring(40, 9), sy = spring(40, 9);
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  window.addEventListener('pointermove', (e) => {
    if (reduce || !fine.matches || e.pointerType !== 'mouse') return;
    const r = canvas.getBoundingClientRect();
    sx.to = THREE.MathUtils.clamp((e.clientX - (r.left + r.width / 2)) / (window.innerWidth * 0.5), -1, 1);
    sy.to = THREE.MathUtils.clamp((e.clientY - (r.top + r.height / 2)) / (window.innerHeight * 0.6), -1, 1);
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { sx.to = 0; sy.to = 0; });

  let t = 0, raf = 0, last = performance.now(), onScreen = true, shown = false;
  function pose(dt) {
    t += dt;
    const h = Math.min(dt, 1 / 30); sx.step(h); sy.step(h);
    braid.rotation.y = (reduce ? 0.6 : t * 0.35) + sx.x * 0.7;
    braid.rotation.z = -sx.x * 0.18 + (fine.matches || reduce ? 0 : Math.sin(t * 0.9) * 0.06);
    braid.rotation.x = sy.x * 0.2;
    braid.position.y = reduce ? 0 : Math.sin(t * 1.2) * 0.05;
  }
  function frame(now) {
    raf = 0;
    const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now;
    pose(dt); renderer.render(scene, camera);
    if (!shown) { shown = true; requestAnimationFrame(() => box.classList.add('is-live')); }
    if (onScreen && !reduce && !document.hidden) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf && onScreen && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } }
  new IntersectionObserver((en) => { onScreen = en[0].isIntersecting; kick(); }).observe(box);
  document.addEventListener('visibilitychange', kick);
  new ResizeObserver(() => { size(); if (reduce) { pose(0); renderer.render(scene, camera); } }).observe(canvas);
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); box.classList.remove('is-live'); onScreen = false; });
  size();
  if (reduce) { pose(0); renderer.render(scene, camera); box.classList.add('is-live'); } else kick();
}
