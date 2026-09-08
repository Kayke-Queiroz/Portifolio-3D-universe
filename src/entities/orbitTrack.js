import * as THREE from 'three';
import { ORBIT_CONFIG } from '../config/constants.js';

export function createOrbitTrack(scene) {
  const orbitPoints = [];
  const segments = 128;
  const radius = ORBIT_CONFIG.earthRadius;

  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const yOffset = Math.sin(theta * 2) * 0.4;
    orbitPoints.push(new THREE.Vector3(Math.cos(theta) * radius, yOffset, Math.sin(theta) * radius));
  }

  const orbitLineGeo = new THREE.BufferGeometry().setFromPoints(orbitPoints);
  const orbitLineMat = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.35
  });

  const orbitLine = new THREE.LineLoop(orbitLineGeo, orbitLineMat);
  scene.add(orbitLine);

  return orbitLine;
}
