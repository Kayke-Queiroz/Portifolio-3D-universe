import * as THREE from 'three';
import { WARP_CONFIG } from '../config/constants.js';

export function createWarpBeams(scene, camera, canvasContainer) {
  const warpOverlay = document.getElementById('warp-overlay');
  const warpLightBeamsGroup = new THREE.Group();
  const warpLightBeamsData = [];

  const beamColors = [
    new THREE.Color('#38bdf8'),
    new THREE.Color('#c084fc'),
    new THREE.Color('#ffffff'),
    new THREE.Color('#60a5fa')
  ];

  for (let i = 0; i < WARP_CONFIG.numBeams; i++) {
    const length = 20 + Math.random() * 30;
    const radius = 0.04 + Math.random() * 0.05;
    const beamGeo = new THREE.CylinderGeometry(radius, radius, length, 8);
    beamGeo.rotateX(Math.PI / 2);

    const c = beamColors[Math.floor(Math.random() * beamColors.length)];
    const beamMat = new THREE.MeshBasicMaterial({
      color: c,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    beamMesh.visible = false;
    warpLightBeamsGroup.add(beamMesh);

    const tunnelRadius = 6 + Math.random() * 24;
    const angle = Math.random() * Math.PI * 2;
    const initialZ = (Math.random() - 0.5) * 90;

    beamMesh.position.set(
      Math.cos(angle) * tunnelRadius,
      Math.sin(angle) * tunnelRadius,
      initialZ
    );

    warpLightBeamsData.push({
      mesh: beamMesh,
      speed: 110 + Math.random() * 90
    });
  }

  scene.add(warpLightBeamsGroup);

  function update(delta, isTurboActive) {
    if (isTurboActive) {
      if (warpOverlay) warpOverlay.classList.remove('hidden');
      if (canvasContainer) canvasContainer.classList.add('stretched');

      // Perspective stretch FOV
      camera.fov = THREE.MathUtils.lerp(camera.fov, 74, 0.12);
      camera.updateProjectionMatrix();

      // Position group relative to camera
      warpLightBeamsGroup.position.copy(camera.position);
      warpLightBeamsGroup.rotation.copy(camera.rotation);

      warpLightBeamsData.forEach(beam => {
        beam.mesh.visible = true;
        beam.mesh.position.z -= beam.speed * delta;

        if (beam.mesh.position.z < -40) {
          beam.mesh.position.z = 50 + Math.random() * 30;
          const angle = Math.random() * Math.PI * 2;
          const radius = 6 + Math.random() * 20;
          beam.mesh.position.x = Math.cos(angle) * radius;
          beam.mesh.position.y = Math.sin(angle) * radius;
        }
      });
    } else {
      if (warpOverlay) warpOverlay.classList.add('hidden');
      if (canvasContainer) canvasContainer.classList.remove('stretched');

      warpLightBeamsData.forEach(beam => {
        beam.mesh.visible = false;
      });

      if (Math.abs(camera.fov - 45) > 0.1) {
        camera.fov = THREE.MathUtils.lerp(camera.fov, 45, 0.12);
        camera.updateProjectionMatrix();
      }
    }
  }

  return {
    group: warpLightBeamsGroup,
    update
  };
}
