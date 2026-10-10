import * as THREE from "three";
import { EffectComposer } from "./vendor/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "./vendor/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "./vendor/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "./vendor/jsm/postprocessing/OutputPass.js";
import { RoomEnvironment } from "./vendor/jsm/environments/RoomEnvironment.js";

const canvas = document.querySelector("#webgl");
const root = document.documentElement;
const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
const reduce = motion.matches;

function fail() {
  document.body.classList.add("no-webgl");
}

if (!canvas || reduce) {
  fail();
} else {
  try { boot(); } catch { fail(); }
}

function boot() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "low-power"
    });
  } catch (err) {
    fail();
    return;
  }
  if (!renderer.getContext()) {
    fail();
    return;
  }

  const mobile = window.matchMedia("(max-width: 760px)").matches;
  const pixelCap = mobile ? 1 : 1.5;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelCap));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x050910, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050910, 0.028);
  const camera = new THREE.PerspectiveCamera(36, window.innerWidth / window.innerHeight, 0.1, 40);
  camera.position.set(mobile ? 0.15 : -0.35, mobile ? 1.15 : 0.18, mobile ? 6.2 : 5.15);

  const bulb = new THREE.Group();
  bulb.position.set(mobile ? 0.85 : 1.2, mobile ? 1.55 : 0.38, 0);
  bulb.scale.setScalar(mobile ? 0.48 : 0.98);
  scene.add(bulb);

  const profile = [];
  const steps = mobile ? 36 : 60;
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const y = -1.18 + u * 2.24;
    let r;
    if (u < 0.16) {
      const n = u / 0.16;
      r = 0.2 + 0.025 * Math.sin(n * Math.PI);
    } else {
      const b = (u - 0.16) / 0.84;
      const belly = Math.sin(Math.pow(b, 0.72) * Math.PI);
      r = belly * (0.62 + 0.2 * Math.pow(1 - b, 1.15));
    }
    if (i === 0 || i === steps) r = 0;
    profile.push(new THREE.Vector2(r, y));
  }
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04);
  scene.environment = environment.texture;
  room.dispose();
  pmrem.dispose();
  const glass = new THREE.Mesh(
    new THREE.LatheGeometry(profile, mobile ? 48 : 96),
    new THREE.MeshPhysicalMaterial({
      color: 0xeef3f8,
      metalness: 0,
      roughness: 0.04,
      transmission: 1,
      thickness: 0.45,
      ior: 1.5,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      envMapIntensity: 0.85,
      attenuationColor: new THREE.Color(0xfff1d2),
      attenuationDistance: 1.4
    })
  );
  glass.geometry.computeVertexNormals();
  bulb.add(glass);

  const coil = [];
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * Math.PI * 14;
    const y = -0.22 + (i / 64) * 0.7;
    coil.push(new THREE.Vector3(Math.cos(a) * 0.11, y, Math.sin(a) * 0.11));
  }
  const filament = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(coil), 140, 0.022, 8, false),
    new THREE.MeshBasicMaterial({ color: 0x000000, toneMapped: false })
  );
  bulb.add(filament);
  const supports = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.012, 0.85, 8),
    new THREE.MeshStandardMaterial({ color: 0x9aa3ad, metalness: 0.8, roughness: 0.3 })
  );
  supports.position.y = 0.02;
  bulb.add(supports);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.05, 0.01, 12, 96),
    new THREE.MeshBasicMaterial({ color: 0x000000, toneMapped: false })
  );
  ring.rotation.x = 1.05;
  ring.rotation.z = 0.35;
  ring.position.y = 0.22;
  bulb.add(ring);

  const screwMat = new THREE.MeshStandardMaterial({ color: 0xb7c0c8, metalness: 0.95, roughness: 0.32 });
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.16, 24), screwMat);
  neck.position.y = -1.22;
  bulb.add(neck);
  const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 0.42, 28), screwMat);
  screw.position.y = -1.48;
  bulb.add(screw);
  for (let i = 0; i < 4; i++) {
    const thread = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.02, 8, 24), screwMat);
    thread.rotation.x = Math.PI / 2;
    thread.position.y = -1.34 - i * 0.09;
    bulb.add(thread);
  }
  const contact = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 16, 12),
    new THREE.MeshStandardMaterial({ color: 0x6e767e, metalness: 0.7, roughness: 0.4 })
  );
  contact.scale.y = 0.55;
  contact.position.y = -1.74;
  bulb.add(contact);

  const lamp = new THREE.PointLight(0xffc14d, 0, 12, 2);
  bulb.add(lamp);
  const ambient = new THREE.AmbientLight(0x9eb6dd, 0);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xd5e4ff, 0);
  key.position.set(-3, 4, 5);
  scene.add(key);

  const circuit = new THREE.Group();
  circuit.position.set(mobile ? 0.2 : 0.4, mobile ? 0.6 : -0.2, -3.1);
  scene.add(circuit);
  const lineMat = new THREE.LineBasicMaterial({ color: 0x8a7340, transparent: true, opacity: 0.35 });
  for (let i = 0; i < (mobile ? 4 : 7); i++) {
    const y = (i - 3) * 0.42;
    const pts = [new THREE.Vector3(-2.2, y, 0)];
    let x = -2.2;
    while (x < 2.4) {
      x += 0.55;
      pts.push(new THREE.Vector3(x, y + ((i + Math.floor(x * 2)) % 2 ? 0.16 : -0.05), 0));
    }
    circuit.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
  }

  const particlesN = mobile ? 70 : 260;
  const positions = new Float32Array(particlesN * 3);
  const speeds = new Float32Array(particlesN);
  const phases = new Float32Array(particlesN);
  for (let i = 0; i < particlesN; i++) {
    speeds[i] = 0.08 + (i % 5) * 0.02;
    phases[i] = i / particlesN;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const points = new THREE.Points(
    pGeo,
    new THREE.PointsMaterial({
      color: 0xfff6d2,
      size: mobile ? 0.045 : 0.04,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  );
  bulb.add(points);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    mobile ? 0.28 : 0.42,
    mobile ? 0.25 : 0.38,
    0.86
  );
  if (!mobile) composer.addPass(bloom);
  composer.addPass(new OutputPass());

  const mouse = { x: 0, y: 0 };
  if (!mobile) {
    window.addEventListener("pointermove", (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (event.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
  }

  let scrollP = 0;
  const bar = document.querySelector(".progress");
  function measure() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollP = max > 0 ? window.scrollY / max : 0;
    if (bar) bar.style.transform = "scaleX(" + scrollP + ")";
  }
  window.addEventListener("scroll", measure, { passive: true });
  measure();

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const pr = Math.min(window.devicePixelRatio || 1, pixelCap);
    renderer.setPixelRatio(pr);
    renderer.setSize(w, h);
    composer.setPixelRatio(pr);
    composer.setSize(w, h);
  }
  window.addEventListener("resize", resize);

  const baseY = mobile ? 1.55 : 0.38;
  const camX = mobile ? 0 : -0.25;
  const camY = mobile ? 1.15 : 0.18;
  const camZ = mobile ? 6.2 : 5.15;
  const lookX = mobile ? 0.35 : 0.2;
  let animationId = 0;
  let stopped = false;
  let lastFrame = 0;
  let elapsed = 0;
  let previous = 0;
  const slot = document.querySelector(".bulb-slot");
  function active() { return !stopped && !document.hidden && !motion.matches; }
  function schedule() { if (active() && !animationId) animationId = requestAnimationFrame(frame); }
  document.addEventListener("visibilitychange", () => {
    cancelAnimationFrame(animationId); animationId = 0; previous = 0; schedule();
  });
  motion.addEventListener("change", () => {
    document.body.classList.toggle("reduce", motion.matches);
    cancelAnimationFrame(animationId); animationId = 0; previous = 0; schedule();
  });
  function dispose() {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(animationId);
    window.removeEventListener("resize", resize);
    window.removeEventListener("scroll", measure);
    const geometries = new Set(), materials = new Set();
    scene.traverse(object => {
      if (object.geometry) geometries.add(object.geometry);
      if (object.material) for (const material of [object.material].flat()) materials.add(material);
    });
    geometries.forEach(item => item.dispose()); materials.forEach(item => item.dispose());
    environment.dispose(); bloom.dispose(); composer.passes.forEach(pass => { if (pass !== bloom) pass.dispose?.(); });
    composer.dispose(); renderer.dispose();
    fail();
  }
  window.addEventListener("stop-animation", dispose, { once: true });
  canvas.addEventListener("webglcontextlost", event => { event.preventDefault(); dispose(); });
  window.addEventListener("pagehide", event => { if (!event.persisted) dispose(); });

  function frame(now) {
    animationId = 0;
    if (!active()) return;
    schedule();
    if (now - lastFrame < 1000 / 30) return;
    lastFrame = now;
    if (previous) elapsed += Math.min((now - previous) / 1000, 0.1);
    previous = now;
    const t = elapsed;
    const ignite = Math.min(1, t / 1.2);
    const eased = ignite * ignite * (3 - 2 * ignite);
    const flicker = 1;
    const power = eased * flicker;

    filament.material.color.setRGB(power * 6.5, power * 2.4, power * 0.35);
    ring.material.color.setRGB(power * 2.2, power * 1.15, power * 0.15);
    points.material.opacity = power * 0.9;
    points.material.color.setRGB(1.8 * power + 0.05, 0.9 * power, 0.12);
    lamp.intensity = power * (mobile ? 6 : 14);
    lamp.color.setRGB(1, 0.62, 0.18);
    ambient.intensity = 0.12 + power * 0.22;
    key.intensity = 0.25 + power * 0.55;
    bloom.strength = (mobile ? 0.22 : 0.4) * Math.max(power, 0.02);

    const attr = pGeo.getAttribute("position");
    for (let i = 0; i < particlesN; i++) {
      const u = (phases[i] + t * speeds[i]) % 1;
      const a = u * Math.PI * 2;
      const rad = 0.95 + (i % 3) * 0.06;
      attr.setXYZ(i, Math.cos(a) * rad, 0.12 + Math.sin(a * 2) * 0.06, Math.sin(a) * rad * 0.55);
    }
    attr.needsUpdate = true;

    ring.rotation.z = t * 0.22;
    bulb.rotation.y = t * 0.18 + scrollP * 0.6;
    bulb.rotation.z = Math.sin(t * 0.45) * 0.05;
    if (mobile) {
      const rect = slot ? slot.getBoundingClientRect() : null;
      if (rect && rect.height > 0) {
        const nx = ((rect.left + rect.width * 0.68) / window.innerWidth) * 2 - 1;
        const ny = -((rect.top + rect.height * 0.28) / window.innerHeight) * 2 + 1;
        const ndc = new THREE.Vector3(nx, ny, 0.5);
        ndc.unproject(camera);
        const dir = ndc.sub(camera.position);
        const dist = (0 - camera.position.z) / dir.z;
        bulb.position.x = camera.position.x + dir.x * dist;
        bulb.position.y = camera.position.y + dir.y * dist + Math.sin(t * 0.7) * 0.04;
      }
      bulb.scale.setScalar(0.2);
    } else {
      bulb.position.y = baseY + Math.sin(t * 0.7) * 0.06 - scrollP * 0.25;
    }

    const tx = camX + mouse.x * 0.28 + scrollP * 0.2;
    const ty = camY - mouse.y * 0.16 - scrollP * 0.28;
    const tz = camZ - scrollP * 0.45;
    camera.position.x += (tx - camera.position.x) * 0.05;
    camera.position.y += (ty - camera.position.y) * 0.05;
    camera.position.z += (tz - camera.position.z) * 0.05;
    camera.lookAt(lookX + mouse.x * 0.08, mobile ? 1.2 : 0.08, 0);
    composer.render();
  }
  schedule();
  document.body.classList.remove("no-webgl");
  document.body.classList.add("webgl-on");
}
