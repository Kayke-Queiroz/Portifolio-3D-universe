import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// DOM Elements
const canvasContainer = document.getElementById('canvas-container');
const loadingOverlay = document.getElementById('loading-overlay');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const loaderTitle = document.getElementById('loader-title');

const sliderSpeed = document.getElementById('slider-speed');
const speedVal = document.getElementById('speed-val');
const btnCams = document.querySelectorAll('.btn-cam');

const metricFps = document.getElementById('metric-fps');

const modalProjects = document.getElementById('modal-projects');
const modalSkills = document.getElementById('modal-skills');
const modalAbout = document.getElementById('modal-about');
const modals = {
  projects: modalProjects,
  skills: modalSkills,
  about: modalAbout
};

// Scene, Camera, Renderer
let scene, camera, renderer, controls;

// 3D Models & Mixers
let blackholeModel = null;
let blackholeMixer = null;

let earthModel = null;
let earthMixer = null;

let starfieldParticles = null;

// Orbital Mechanics & Physics Variables
let earthOrbitAngle = 0;
const orbitRadius = 5.4;

const clock = new THREE.Clock();
const gltfLoader = new GLTFLoader();

let speedMultiplier = 1.0;
let isCameraAnimating = false;
let activeCamView = 'front';
let targetCamPos = new THREE.Vector3(0, 0, 4.5);
let targetLookAt = new THREE.Vector3(0, 0, 0);

// Camera Preset Vectors
const camPresets = {
  front: { pos: new THREE.Vector3(0, 0, 4.5), target: new THREE.Vector3(0, 0, 0) },
  top: { pos: new THREE.Vector3(0, 4.5, 2.5), target: new THREE.Vector3(0, 0, 0) },
  deep: { pos: new THREE.Vector3(3.8, 2.4, 9.0), target: new THREE.Vector3(0, 0, 0) }
};

// FPS Counter Variables
let frameCount = 0;
let lastFpsTime = performance.now();

// Initial Setup
init();
animate();

function init() {
  // 1. Scene Setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color('#03050a');

  // 2. Camera Setup
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.copy(camPresets.front.pos);

  // 3. Renderer Setup
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  canvasContainer.appendChild(renderer.domElement);

  // 4. OrbitControls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.target.copy(camPresets.front.target);
  controls.minDistance = 1.5;
  controls.maxDistance = 25;

  // 5. Build Cosmic Starfield Particles
  buildStarfield();

  // 6. Build 3D Orbit Track Line
  buildOrbitTrack();

  // 7. Lighting Setup
  setupLighting();

  // 8. Event Listeners
  window.addEventListener('resize', onWindowResize);
  setupUIEvents();

  // 9. Load Models (Blackhole GLB & User's planet_earth.glb)
  loadModels();
}

// Build 3D Cosmic Starfield Particles
function buildStarfield() {
  const particleCount = 3000;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const colorOptions = [
    new THREE.Color('#38bdf8'),
    new THREE.Color('#c084fc'),
    new THREE.Color('#ffffff'),
    new THREE.Color('#93c5fd')
  ];

  for (let i = 0; i < particleCount * 3; i += 3) {
    const radius = 25 + Math.random() * 60;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);

    positions[i] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i + 2] = radius * Math.cos(phi);

    const c = colorOptions[Math.floor(Math.random() * colorOptions.length)];
    colors[i] = c.r;
    colors[i + 1] = c.g;
    colors[i + 2] = c.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.25,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending
  });

  starfieldParticles = new THREE.Points(geometry, material);
  scene.add(starfieldParticles);
}

// Build 3D Orbit Path Line for Planet Motion
function buildOrbitTrack() {
  const orbitPoints = [];
  const segments = 128;
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const yOffset = Math.sin(theta * 2) * 0.4;
    orbitPoints.push(new THREE.Vector3(Math.cos(theta) * orbitRadius, yOffset, Math.sin(theta) * orbitRadius));
  }

  const orbitLineGeo = new THREE.BufferGeometry().setFromPoints(orbitPoints);
  const orbitLineMat = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.35
  });

  const orbitLine = new THREE.LineLoop(orbitLineGeo, orbitLineMat);
  scene.add(orbitLine);
}

// Setup Cosmic Lighting
function setupLighting() {
  const ambient = new THREE.AmbientLight(0x080e1c, 1.2);
  scene.add(ambient);

  // Event Horizon Glow Lights
  const cyanGlow = new THREE.PointLight(0x38bdf8, 3.5, 12);
  cyanGlow.position.set(0, 0, 0.5);
  scene.add(cyanGlow);

  const purpleGlow = new THREE.PointLight(0xc084fc, 3.0, 12);
  purpleGlow.position.set(0, 0, -0.5);
  scene.add(purpleGlow);

  const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
  sunLight.position.set(8, 6, 8);
  sunLight.castShadow = true;
  scene.add(sunLight);
}

// Load Models: Black Hole & User's planet_earth.glb
function loadModels() {
  loadingOverlay.classList.remove('hidden');
  loaderTitle.innerText = "Carregando Universo 3D...";
  progressBar.style.width = '10%';
  progressText.innerText = 'Carregando Buraco Negro e Planeta Terra GLB...';

  let loadedCount = 0;
  const checkFinished = () => {
    loadedCount++;
    progressBar.style.width = `${Math.round((loadedCount / 2) * 100)}%`;
    if (loadedCount >= 2) {
      setTimeout(() => {
        loadingOverlay.classList.add('hidden');
      }, 300);
    }
  };

  // 1. Load Blackhole Model
  gltfLoader.load(
    '/models/blackhole_optimized.glb',
    (gltf) => {
      const model = gltf.scene;
      blackholeModel = model;

      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 3.2 / (maxDim || 1);
      model.scale.setScalar(scale);

      box.setFromObject(model);
      box.getCenter(center);
      model.position.sub(center);

      scene.add(model);

      if (gltf.animations && gltf.animations.length > 0) {
        blackholeMixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach((clip) => {
          blackholeMixer.clipAction(clip).play();
        });
      }
      checkFinished();
    },
    undefined,
    (err) => {
      console.error('Erro ao carregar Blackhole:', err);
      checkFinished();
    }
  );

  // 2. Load User's planet_earth.glb Model
  gltfLoader.load(
    '/models/planet_earth.glb',
    (gltf) => {
      const model = gltf.scene;
      earthModel = model;

      // Scale planet appropriately for scene
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 1.6 / (maxDim || 1);
      model.scale.setScalar(scale);

      box.setFromObject(model);
      box.getCenter(center);
      model.position.sub(center);

      // Set initial orbit position
      model.position.set(orbitRadius, 0, 0);
      scene.add(model);

      // Play planet's built-in GLTF animations (e.g. cloud & axial rotation)
      if (gltf.animations && gltf.animations.length > 0) {
        earthMixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach((clip) => {
          earthMixer.clipAction(clip).play();
        });
      }
      checkFinished();
    },
    undefined,
    (err) => {
      console.error('Erro ao carregar planet_earth.glb:', err);
      checkFinished();
    }
  );
}

// Camera Preset Helper
function animateCameraTo(viewKey) {
  activeCamView = viewKey;
  const preset = camPresets[viewKey];
  if (preset) {
    targetCamPos.copy(preset.pos);
    targetLookAt.copy(preset.target);
    isCameraAnimating = true;
  }
}

// Setup UI Controls & Modals
function setupUIEvents() {
  sliderSpeed.addEventListener('input', (e) => {
    speedMultiplier = parseFloat(e.target.value);
    speedVal.innerText = `${speedMultiplier.toFixed(1)}x`;
  });

  btnCams.forEach(btn => {
    btn.addEventListener('click', () => {
      btnCams.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const viewKey = btn.dataset.view;
      if (viewKey === 'earth') {
        activeCamView = 'earth';
        isCameraAnimating = true;
      } else {
        animateCameraTo(viewKey);
      }
    });
  });

  // Nav Buttons
  document.querySelectorAll('.btn-nav').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      openModal(target);
    });
  });

  // Modal Close Buttons
  document.querySelectorAll('.btn-close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      closeAllModals();
    });
  });

  Object.values(modals).forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeAllModals();
        }
      });
    }
  });
}

function openModal(modalKey) {
  closeAllModals();
  if (modals[modalKey]) {
    modals[modalKey].classList.remove('hidden');
  }
}

function closeAllModals() {
  Object.values(modals).forEach(modal => {
    if (modal) modal.classList.add('hidden');
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Render Loop
function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  // 1. Update Blackhole Animation
  if (blackholeMixer) {
    blackholeMixer.update(delta * speedMultiplier);
  }

  // 2. Update User's planet_earth.glb Animation & Gravitational Orbit
  if (earthModel) {
    if (earthMixer) {
      earthMixer.update(delta * speedMultiplier);
    }

    // Physics Gravitational Orbital Motion around Blackhole
    earthOrbitAngle += delta * 0.18 * speedMultiplier;
    earthModel.position.x = Math.cos(earthOrbitAngle) * orbitRadius;
    earthModel.position.z = Math.sin(earthOrbitAngle) * orbitRadius;
    earthModel.position.y = Math.sin(earthOrbitAngle * 2) * 0.4; // Orbital inclination dip

    // Self Axial rotation
    earthModel.rotation.y += delta * 0.2 * speedMultiplier;
  }

  // 3. Rotate Starfield Particles
  if (starfieldParticles) {
    starfieldParticles.rotation.y += delta * 0.02 * speedMultiplier;
  }

  // 4. Camera Follow Mode if "earth" is active
  if (activeCamView === 'earth' && earthModel) {
    targetCamPos.set(
      earthModel.position.x + 2.2,
      earthModel.position.y + 1.0,
      earthModel.position.z + 2.2
    );
    targetLookAt.copy(earthModel.position);
    camera.position.lerp(targetCamPos, 0.08);
    controls.target.lerp(targetLookAt, 0.08);
  } else if (isCameraAnimating) {
    camera.position.lerp(targetCamPos, 0.05);
    controls.target.lerp(targetLookAt, 0.05);
    if (camera.position.distanceTo(targetCamPos) < 0.02) {
      isCameraAnimating = false;
    }
  }

  controls.update();
  renderer.render(scene, camera);

  // 5. Calculate FPS
  frameCount++;
  const now = performance.now();
  if (now >= lastFpsTime + 1000) {
    const fps = Math.round((frameCount * 1000) / (now - lastFpsTime));
    metricFps.innerText = `${fps} FPS`;
    frameCount = 0;
    lastFpsTime = now;
  }
}
