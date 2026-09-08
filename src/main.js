import * as THREE from 'three';
import { CAM_PRESETS } from './config/constants.js';
import { createSceneManager } from './core/scene.js';
import { setupLighting } from './core/lighting.js';
import { createStarfield } from './entities/starfield.js';
import { createOrbitTrack } from './entities/orbitTrack.js';
import { createWarpBeams } from './effects/warpBeams.js';
import { createModelManager } from './entities/models.js';
import { createPilotController } from './controls/pilotControls.js';
import { createUIManager } from './ui/uiManager.js';

// DOM Container
const canvasContainer = document.getElementById('canvas-container');

// State Variables
let speedMultiplier = 1.0;
let isCameraAnimating = false;
let activeCamView = 'front';
let targetCamPos = new THREE.Vector3().copy(CAM_PRESETS.front.pos);
let targetLookAt = new THREE.Vector3().copy(CAM_PRESETS.front.target);

const clock = new THREE.Clock();

// Core Systems
const sceneManager = createSceneManager(canvasContainer);
const { scene, camera, renderer, controls } = sceneManager;

setupLighting(scene);
const starfield = createStarfield(scene);
createOrbitTrack(scene);
const warpBeams = createWarpBeams(scene, camera, canvasContainer);
const modelManager = createModelManager(scene);
const pilotController = createPilotController(camera, controls);

// Camera helper function
function animateCameraTo(viewKey) {
  activeCamView = viewKey;
  const preset = CAM_PRESETS[viewKey];
  if (preset) {
    targetCamPos.copy(preset.pos);
    targetLookAt.copy(preset.target);
    isCameraAnimating = true;
  }
}

// UI Manager Setup
const uiManager = createUIManager({
  onSpeedChange: (speed) => {
    speedMultiplier = speed;
  },
  onCameraChange: (viewKey) => {
    if (pilotController.isPilotMode) {
      pilotController.togglePilotMode(false, modelManager.models.ufo, (mode) => {
        if (!mode) activeCamView = 'ufo';
      });
    }

    if (['earth', 'ship', 'satellite', 'ufo'].includes(viewKey)) {
      activeCamView = viewKey;
      isCameraAnimating = true;
    } else {
      animateCameraTo(viewKey);
    }
  },
  onPilotToggle: (enableOverride) => {
    const nextState = enableOverride !== undefined ? enableOverride : !pilotController.isPilotMode;
    pilotController.togglePilotMode(nextState, modelManager.models.ufo, (mode) => {
      if (mode) {
        activeCamView = 'pilot';
      } else {
        activeCamView = 'ufo';
      }
    });
  }
});

// Load Models & Start Loop
modelManager.loadAll(() => {
  console.log('Todos os modelos 3D foram carregados com sucesso.');
});

// Render Loop
function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  // 1. Update Pilot WASD Controls & Physics
  const { isTurboActive, isPilotMode } = pilotController.update(
    delta,
    speedMultiplier,
    modelManager.models.ufo,
    targetCamPos,
    targetLookAt
  );

  // 2. Update 3D Models & Orbital Physics
  modelManager.update(delta, speedMultiplier, isPilotMode);

  // 3. Update Starfield Particles
  starfield.update(delta, speedMultiplier, isTurboActive);

  // 4. Update Warp Beams Speed Distortion
  warpBeams.update(delta, isTurboActive);

  // 5. Dynamic Camera Follow Logic
  const { earth, ship, satellite, ufo } = modelManager.models;

  if (activeCamView === 'earth' && earth) {
    targetCamPos.set(earth.position.x + 5.2, earth.position.y + 2.4, earth.position.z + 5.2);
    targetLookAt.copy(earth.position);
    camera.position.lerp(targetCamPos, 0.08);
    controls.target.lerp(targetLookAt, 0.08);
  } else if (activeCamView === 'ship' && ship) {
    targetCamPos.set(ship.position.x + 2.8, ship.position.y + 1.2, ship.position.z + 2.8);
    targetLookAt.copy(ship.position);
    camera.position.lerp(targetCamPos, 0.08);
    controls.target.lerp(targetLookAt, 0.08);
  } else if (activeCamView === 'satellite' && satellite) {
    targetCamPos.set(satellite.position.x + 3.0, satellite.position.y + 1.2, satellite.position.z + 3.0);
    targetLookAt.copy(satellite.position);
    camera.position.lerp(targetCamPos, 0.08);
    controls.target.lerp(targetLookAt, 0.08);
  } else if (activeCamView === 'ufo' && ufo && !isPilotMode) {
    targetCamPos.set(ufo.position.x + 2.5, ufo.position.y + 1.0, ufo.position.z + 2.5);
    targetLookAt.copy(ufo.position);
    camera.position.lerp(targetCamPos, 0.08);
    controls.target.lerp(targetLookAt, 0.08);
  } else if (isCameraAnimating && activeCamView !== 'pilot') {
    camera.position.lerp(targetCamPos, 0.05);
    controls.target.lerp(targetLookAt, 0.05);
    if (camera.position.distanceTo(targetCamPos) < 0.02) {
      isCameraAnimating = false;
    }
  }

  controls.update();
  renderer.render(scene, camera);

  // 6. Update FPS Counter
  uiManager.updateFps();
}

animate();
