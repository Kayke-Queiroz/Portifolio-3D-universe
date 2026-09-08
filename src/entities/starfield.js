import * as THREE from 'three';

export function createStarfield(scene, count = 3000) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const colorOptions = [
    new THREE.Color('#38bdf8'),
    new THREE.Color('#c084fc'),
    new THREE.Color('#ffffff'),
    new THREE.Color('#93c5fd')
  ];

  for (let i = 0; i < count * 3; i += 3) {
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

  const starfieldParticles = new THREE.Points(geometry, material);
  scene.add(starfieldParticles);

  function update(delta, speedMultiplier, isWarping) {
    const rotSpeed = isWarping ? 0.18 : 0.02;
    starfieldParticles.rotation.y += delta * rotSpeed * speedMultiplier;
  }

  return {
    mesh: starfieldParticles,
    update
  };
}
