import * as THREE from 'three';

export const CAM_PRESETS = {
  front: { pos: new THREE.Vector3(0, 2.0, 9.5), target: new THREE.Vector3(0, 0, 0) },
  top: { pos: new THREE.Vector3(0, 18.0, 8.0), target: new THREE.Vector3(0, 0, 0) },
  deep: { pos: new THREE.Vector3(14.0, 9.0, 22.0), target: new THREE.Vector3(0, 0, 0) }
};

export const ORBIT_CONFIG = {
  earthRadius: 12.0,
  satelliteEarthRadius: 4.5,
  shipRadius: 16.5,
  ufoRadius: 19.5
};

export const WARP_CONFIG = {
  numBeams: 80
};
