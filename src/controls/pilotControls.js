import * as THREE from 'three';

export function createPilotController(camera, controls) {
  let isPilotMode = false;
  let pilotSpeed = 0;
  let pilotHeading = 0;

  const keyState = {
    w: false,
    s: false,
    a: false,
    d: false,
    q: false,
    e: false,
    shift: false
  };

  const nitroBadge = document.getElementById('nitro-badge');
  const pilotHud = document.getElementById('pilot-hud');
  const btnPilotNav = document.getElementById('btn-pilot-nav');
  const btnPilotSidebar = document.getElementById('btn-pilot-sidebar');

  function initInputListeners() {
    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      if (['w', 's', 'a', 'd', 'q', 'e'].includes(key)) {
        keyState[key] = true;
      }
      if (e.key === 'Shift') keyState.shift = true;
      if (e.key === 'Escape' && isPilotMode) {
        togglePilotMode(false);
      }
    });

    window.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      if (['w', 's', 'a', 'd', 'q', 'e'].includes(key)) {
        keyState[key] = false;
      }
      if (e.key === 'Shift') keyState.shift = false;
    });
  }

  initInputListeners();

  function togglePilotMode(enable, ufoModel, onModeChanged) {
    isPilotMode = enable;

    if (isPilotMode) {
      if (pilotHud) pilotHud.classList.remove('hidden');
      if (btnPilotNav) btnPilotNav.classList.add('active');
      if (btnPilotSidebar) btnPilotSidebar.classList.add('active');
      document.querySelectorAll('.btn-cam').forEach(b => b.classList.remove('active'));

      if (ufoModel) {
        pilotHeading = Math.atan2(ufoModel.position.x, ufoModel.position.z);
        pilotSpeed = 0;
      }
    } else {
      if (pilotHud) pilotHud.classList.add('hidden');
      if (btnPilotNav) btnPilotNav.classList.remove('active');
      if (btnPilotSidebar) btnPilotSidebar.classList.remove('active');
    }

    if (onModeChanged) onModeChanged(isPilotMode);
  }

  function update(delta, speedMultiplier, ufoModel, targetCamPos, targetLookAt) {
    const isTurboActive = isPilotMode && keyState.shift;

    if (nitroBadge) {
      if (isTurboActive) {
        nitroBadge.classList.remove('hidden');
      } else {
        nitroBadge.classList.add('hidden');
      }
    }

    if (isPilotMode && ufoModel) {
      const accel = (keyState.shift ? 28.0 : 14.0) * speedMultiplier;
      const turnSpeed = 1.8 * speedMultiplier;

      if (keyState.w) pilotSpeed += accel * delta;
      if (keyState.s) pilotSpeed -= accel * delta;
      pilotSpeed *= 0.94; // Friction

      if (keyState.a) pilotHeading += turnSpeed * delta;
      if (keyState.d) pilotHeading -= turnSpeed * delta;

      if (keyState.q) ufoModel.position.y += 8.0 * delta * speedMultiplier;
      if (keyState.e) ufoModel.position.y -= 8.0 * delta * speedMultiplier;

      ufoModel.position.x += Math.sin(pilotHeading) * pilotSpeed * delta;
      ufoModel.position.z += Math.cos(pilotHeading) * pilotSpeed * delta;
      ufoModel.rotation.y = pilotHeading + Math.PI;

      let targetRoll = keyState.a ? 0.35 : (keyState.d ? -0.35 : 0);
      ufoModel.rotation.z = THREE.MathUtils.lerp(ufoModel.rotation.z, targetRoll, 0.1);

      // Camera follow logic in pilot mode
      const camDist = 7.0;
      const camHeight = 2.8;
      const camX = ufoModel.position.x - Math.sin(pilotHeading) * camDist;
      const camZ = ufoModel.position.z - Math.cos(pilotHeading) * camDist;
      const camY = ufoModel.position.y + camHeight;
      targetCamPos.set(camX, camY, camZ);
      targetLookAt.copy(ufoModel.position);
      camera.position.lerp(targetCamPos, 0.15);
      controls.target.lerp(targetLookAt, 0.15);
    }

    return { isTurboActive, isPilotMode };
  }

  return {
    get isPilotMode() { return isPilotMode; },
    togglePilotMode,
    update
  };
}
