import * as THREE from 'three';

export function setupLighting(scene) {
  const ambient = new THREE.AmbientLight(0x080e1c, 1.4);
  scene.add(ambient);

  // Event Horizon Glow Lights
  const cyanGlow = new THREE.PointLight(0x38bdf8, 5.0, 20);
  cyanGlow.position.set(0, 0, 1.0);
  scene.add(cyanGlow);

  const purpleGlow = new THREE.PointLight(0xc084fc, 4.5, 20);
  purpleGlow.position.set(0, 0, -1.0);
  scene.add(purpleGlow);

  const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
  sunLight.position.set(12, 10, 12);
  sunLight.castShadow = true;
  scene.add(sunLight);

  return { ambient, cyanGlow, purpleGlow, sunLight };
}
